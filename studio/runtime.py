"""Lazy dependency construction; no background workers or import-time writes."""

import threading
from pathlib import Path

from studio.db import Store
from studio.collection import CollectionService
from studio.devices import DeviceService
from studio.storage import BlobStore
from studio.samples import SampleService
from studio.workspaces import WorkspaceService
from studio.jobs import JobQueue, WorkerPool, utc_now
from studio.schedules import ScheduleService
from studio.automation import AutomationService
from studio.classification import ClassificationService
from studio.models import WorkerHealth
from studio.datasets import DatasetService
from studio.augmentation_datasets import AugmentationDatasetService
from studio.generation import GenerationService
from studio.training import TrainingService
from studio.deployment import DeploymentService


class StudioRuntime:
    def __init__(self, data_dir: Path, *, clock=utc_now, runner=None, groups=None):
        self.data_dir = Path(data_dir)
        self.clock, self.runner, self.groups = clock, runner, groups
        self._lock = threading.RLock()
        self._store: Store | None = None
        self._workspaces: WorkspaceService | None = None
        self._blobs: BlobStore | None = None
        self._samples: SampleService | None = None
        self._devices: DeviceService | None = None
        self._collection: CollectionService | None = None
        self._jobs: JobQueue | None = None
        self._schedules: ScheduleService | None = None
        self._automation: AutomationService | None = None
        self._classification = None
        self._workers: WorkerPool | None = None
        self._datasets: DatasetService | None = None
        self._augmentation = None
        self._generation: GenerationService | None = None
        self._training: TrainingService | None = None
        self._deployment: DeploymentService | None = None

    def startup(self) -> None:
        with self._lock:
            if self._store is not None:
                return
            store = Store.open(self.data_dir)
            try:
                blobs = BlobStore(store.root / "blobs")
                blobs.recover()
                from studio.deletion import recover_deletions
                recover_deletions(store, blobs)
                self._blobs = blobs
                self._workspaces = WorkspaceService(store, blobs=blobs)
                self._samples = SampleService(store, blobs)
                self._devices = DeviceService(store)
                self._collection = CollectionService(store, self._samples, self._devices, clock=self.clock)
                self._jobs = JobQueue(store, clock=self.clock, groups=self.groups)
                self._datasets = DatasetService(store, self._jobs)
                self._augmentation = AugmentationDatasetService(store, self._jobs)
                self._generation = GenerationService(store, blobs, self._jobs, clock=self.clock)
                self._training = TrainingService(store, blobs, self._jobs, self._datasets, clock=self.clock)
                self._deployment = DeploymentService(store, self._devices, self._training, clock=self.clock)
                self._schedules = ScheduleService(store, self._jobs, clock=self.clock)
                self._automation = AutomationService(store, self._jobs, self._schedules)
                self._automation.deployment = self._deployment
                self._classification = ClassificationService(store, self._jobs, self._samples, self._automation)
                self._workers = WorkerPool(self._jobs, clock=self.clock, runner=self.runner, schedules=self._schedules,
                                           maintenance=self._maintenance)
                self._workers.register('scrape', 'collection', self._collect_job)
                self._workers.register('download', 'download', self._download_job)
                self._workers.register('generation', 'gpu', self._generation.handle)
                self._workers.register('preview', 'gpu', self._generation.handle_preview)
                self._workers.register('train', 'gpu', self._train_job)
                self._workers.register('classify', 'gpu', self._classification.handle)
                self._workers.register('deploy', 'collection', self._automation.handle_deploy)
                self._workers.register_completion('scrape', lambda job: self._automation.reconcile())
                self._workers.register_completion('train', lambda job: self._deployment.retry_due(self.clock()))
                self._jobs.recover()
                self._deployment.reconcile()
                self._store = store
            except BaseException:
                store.close()
                raise

    @property
    def classification(self):
        self.startup()
        return self._classification

    def _maintenance(self, now):
        self._automation.reconcile()
        self._deployment.retry_due(now)

    def _train_job(self, job, context):
        if self._automation.scheduled_disabled(job):
            return {'skipped': True, 'reason': 'disabled'}
        return self._training.handle(job, context)

    def _download_job(self, job, context):
        if 'augmentation_id' in job.payload:
            return self._augmentation.execute(job, context)
        return self._datasets.execute(job, context)

    @property
    def augmentation(self):
        self.startup()
        return self._augmentation

    def _collect_job(self, job, context):
        if context.cancelled():
            return {}
        assert self._collection is not None
        with self._jobs.store.transaction() as db:
            row = db.execute('SELECT schedule_scope FROM studio_jobs WHERE id=?', (job.id,)).fetchone()
            if row['schedule_scope']:
                schedule = db.execute('SELECT enabled FROM studio_schedules WHERE scope=?', (row['schedule_scope'],)).fetchone()
                if not schedule or not schedule['enabled']:
                    return {'skipped': True, 'reason': 'disabled'}
        context.log('Discovering and collecting kiosk recordings')
        result = self._collection.run(job.payload.get('device_ids'), word_id=job.word_id, cancelled=context.cancelled,
                                      progress=context.log)
        context.log(f'Collection {result.status}: {result.new} imported, {result.unmapped} unmapped, {result.failed} failed')
        with self._jobs.store.transaction() as db:
            mapped = db.execute("SELECT count(*) FROM collection_attempts a JOIN recordings r "
                "ON r.device_id=a.device_id AND r.clip_id=a.clip_id WHERE a.run_id=? AND a.state='complete' AND r.word_id=?",
                (result.id, job.word_id)).fetchone()[0]
        return {'run_id': result.id, 'status': result.status, 'new': result.new, 'new_mapped': mapped,
                'failed': result.failed, 'unmapped': result.unmapped, 'evicted': result.evicted}

    @property
    def deployment(self) -> DeploymentService:
        self.startup()
        assert self._deployment is not None
        return self._deployment

    @property
    def training(self) -> TrainingService:
        self.startup()
        assert self._training is not None
        return self._training

    @property
    def generation(self) -> GenerationService:
        self.startup()
        assert self._generation is not None
        return self._generation

    @property
    def datasets(self) -> DatasetService:
        self.startup()
        assert self._datasets is not None
        return self._datasets

    @property
    def jobs(self) -> JobQueue:
        self.startup()
        assert self._jobs is not None
        return self._jobs

    @property
    def automation(self):
        self.startup()
        return self._automation

    @property
    def schedules(self) -> ScheduleService:
        self.startup()
        assert self._schedules is not None
        return self._schedules

    @property
    def workers(self) -> WorkerPool:
        self.startup()
        assert self._workers is not None
        return self._workers

    def start_workers(self) -> None:
        self.workers.start()

    def health(self) -> WorkerHealth:
        # Do not initialize/query SQLite to report a worker's SQL outage.
        with self._lock:
            return self._workers.health() if self._workers is not None else WorkerHealth(False, False, [])

    @property
    def collection(self) -> CollectionService:
        self.startup()
        assert self._collection is not None
        return self._collection

    @property
    def devices(self) -> DeviceService:
        self.startup()
        assert self._devices is not None
        return self._devices

    @property
    def samples(self) -> SampleService:
        self.startup()
        assert self._samples is not None
        return self._samples

    @property
    def workspaces(self) -> WorkspaceService:
        self.startup()
        assert self._workspaces is not None
        return self._workspaces

    @property
    def blobs(self) -> BlobStore:
        self.startup()
        assert self._blobs is not None
        return self._blobs

    def shutdown(self) -> None:
        # Join outside the runtime lock: a handler may need a runtime property.
        if self._workers is not None:
            self._workers.stop()
        with self._lock:
            if self._store is not None:
                self._store.close()
                self._store = None
                self._workspaces = None
                self._samples = None
                self._blobs = None
                self._devices = None
                self._collection = None
                self._jobs = None
                self._schedules = None
                self._workers = None
                self._datasets = None
                self._augmentation = None
                self._generation = None
                self._training = None
                self._deployment = None
