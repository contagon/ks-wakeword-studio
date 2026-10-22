import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from studio.models import ValidationError
from studio.runtime import StudioRuntime
from studio_harness import StubGpuRunner


def augmentation_fixture(root):
    for name in ('mit_rirs_16k', 'audioset_16k', 'fma_16k', 'chime_16k'):
        path = root / 'training_datasets' / name
        path.mkdir(parents=True, exist_ok=True)
        (path / 'fixture.wav').write_bytes(StubGpuRunner._wav())


class AugmentationTests(unittest.TestCase):
    def test_corpus_retention_does_not_hold_metadata_write_lock(self):
        from studio.db import Store
        from studio import augmentation
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            augmentation_fixture(root)
            runtime = StudioRuntime(root)
            self.addCleanup(runtime.shutdown)
            word = runtime.workspaces.create('Robot', 'en', 'robot')
            runtime.datasets.select(word.id, [])
            observer = Store.open(root)
            self.addCleanup(observer.close)
            original = augmentation.snapshot
            def retain(store, selected_ids=None):
                with observer.transaction() as db:
                    db.execute('SELECT 1')
                return original(store, selected_ids)
            with patch.object(augmentation, 'snapshot', side_effect=retain):
                self.assertEqual(len(runtime.training.snapshot(word.id, 'a' * 32).augmentation), 4)

    def test_snapshot_pins_backgrounds_separately_and_replacement_changes_fingerprint(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            augmentation_fixture(root)
            runtime = StudioRuntime(root)
            self.addCleanup(runtime.shutdown)
            word = runtime.workspaces.create('Robot', 'en', 'robot')
            runtime.datasets.select(word.id, [])
            first = runtime.training.snapshot(word.id, 'a' * 32)
            self.assertEqual(len(first.augmentation), 4)
            self.assertEqual(first.datasets, ())
            retained = Path(first.augmentation[0].path) / 'fixture.wav'
            original = retained.read_bytes()
            (root / 'training_datasets' / first.augmentation[0].id / 'fixture.wav').write_bytes(b'replaced')
            second = runtime.training.snapshot(word.id, 'b' * 32)
            self.assertNotEqual(first.fingerprint, second.fingerprint)
            self.assertEqual(retained.read_bytes(), original)
            self.assertEqual(runtime.training.get_manifest(word.id, first.run_id), first)

    def test_missing_augmentation_fails_before_manifest_commit_with_setup_instructions(self):
        with tempfile.TemporaryDirectory() as directory:
            runtime = StudioRuntime(Path(directory))
            self.addCleanup(runtime.shutdown)
            word = runtime.workspaces.create('Robot', 'en', 'robot')
            with self.assertRaisesRegex(ValidationError, 'prepare_corpus.py --corpus=mit_rirs_16k'):
                runtime.training.snapshot(word.id, 'a' * 32)
            self.assertEqual(runtime.training.store._connection.execute('SELECT count(*) FROM training_runs').fetchone()[0], 0)
