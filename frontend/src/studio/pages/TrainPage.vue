<script setup lang="ts">
import PageHeader from "../components/PageHeader.vue";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { fetchAll, studioApi } from "../api";
import { latestRequest } from "../requests";
import { useWorkspace } from "../workspace";
import type { Dataset, Job, TrainingCounts, TrainingSettings } from "../types";
import { isActiveJob, useJobQueue, statusClass } from "../jobs";
import type { AugmentationCatalog } from "../types";
import { jobError } from "../errors";
import { absoluteTime } from "../time";

const workspace = useWorkspace();
const queue = useJobQueue();
const augmentation = ref<AugmentationCatalog | null>(null);
const prerequisitesLoading = ref(false);
const prerequisiteError = ref("");
let prerequisiteRequest: AbortController | undefined;
async function loadPrerequisites(): Promise<void> {
  prerequisiteRequest?.abort();
  const controller = new AbortController();
  prerequisiteRequest = controller;
  prerequisitesLoading.value = true;
  const id = activeId.value;
  augmentation.value = null;
  if (!id) {
    prerequisitesLoading.value = false;
    return;
  }
  try {
    const next = await studioApi.wakewordAugmentationDatasets(id, controller.signal);
    if (!controller.signal.aborted && activeId.value === id) {
      augmentation.value = next;
      prerequisiteError.value = "";
    }
  } catch (cause) {
    if (!controller.signal.aborted) {
      augmentation.value = null;
      prerequisiteError.value = cause instanceof Error ? cause.message : "Unable to check training prerequisites.";
    }
  } finally {
    if (!controller.signal.aborted) prerequisitesLoading.value = false;
  }
}
const datasetsHref = computed(() => workspace.routes.href("online-datasets"));
const blockedReason = computed(() => {
  if (prerequisitesLoading.value || loading.value) return "";
  if (prerequisiteError.value) return prerequisiteError.value;
  const missing = [
    ...(augmentation.value?.items.filter((item) => item.selected && item.status !== "installed") ?? []),
    ...missingDatasets.value,
  ];
  return missing.length ? `Download or deselect ${missing.map((row) => row.name).join(", ")} before training.` : "";
});
function runTime(run: Job): string {
  return run.started_at ?? run.created_at;
}
const counts = ref<TrainingCounts | null>(null);
const settings = ref<TrainingSettings>({ training_steps: 40000 });
const runs = ref<Job[]>([]);
const selectedDatasets = ref<Dataset[]>([]);
const loading = ref(false);
const saving = ref(false);
const starting = ref(false);
const error = ref("");
const started = ref<Job | null>(null);
const loadRequest = latestRequest();
const saveRequest = latestRequest();
const startRequest = latestRequest();
const activeId = computed(() => workspace.selectedId.value);
const trainingBusy = computed(() => starting.value || queue.busy("train", activeId.value));
const negativeDatasetCount = computed(
  () => selectedDatasets.value.filter((dataset) => dataset.selected && dataset.split !== "evaluation").length,
);
const evaluationDatasetCount = computed(
  () => selectedDatasets.value.filter((dataset) => dataset.selected && dataset.split === "evaluation").length,
);
const missingDatasets = computed(() =>
  selectedDatasets.value.filter((dataset) => dataset.selected && dataset.status !== "installed"),
);
function abortWorkspaceMutations(): void {
  saveRequest.abort();
  startRequest.abort();
  saving.value = false;
  starting.value = false;
  started.value = null;
}
function allSelectedDatasets(id: string, controller: AbortController): Promise<Dataset[]> {
  return fetchAll(
    (window) => studioApi.datasets(id, { status: "selected", ...window }, controller.signal),
    controller.signal,
  );
}
function reconcileRuns(items: Job[]): Job[] {
  return items.map((run) => {
    const known = queue.jobs.value[run.id];
    const current = known?.word_id === activeId.value ? known : run;
    if (isActiveJob(current) && !known) queue.track(current);
    return current;
  });
}
async function load(): Promise<void> {
  const controller = loadRequest.next();
  const id = activeId.value;
  const current = () => activeId.value === id && loadRequest.isCurrent(controller);
  counts.value = null;
  runs.value = [];
  selectedDatasets.value = [];
  started.value = null;
  error.value = "";
  if (!id) return;
  loading.value = true;
  try {
    const [nextCounts, nextSettings, nextRuns, nextDatasets] = await Promise.all([
      studioApi.trainingCounts(id, controller.signal),
      studioApi.trainingSettings(id, controller.signal),
      studioApi.trainingRuns(id, { limit: 50 }, controller.signal),
      allSelectedDatasets(id, controller),
    ]);
    if (!current()) return;
    counts.value = nextCounts;
    settings.value = nextSettings;
    runs.value = reconcileRuns(nextRuns.items);
    selectedDatasets.value = nextDatasets;
  } catch (cause) {
    if (current()) error.value = cause instanceof Error ? cause.message : "Unable to load training configuration.";
  } finally {
    if (current()) loading.value = false;
  }
}
function valid(): boolean {
  if (
    !Number.isInteger(settings.value.training_steps) ||
    settings.value.training_steps < 1 ||
    settings.value.training_steps > 10000000
  ) {
    error.value = "Training steps must be an integer between 1 and 10000000.";
    return false;
  }
  return true;
}
async function save(): Promise<void> {
  const id = activeId.value;
  if (!id || !valid()) return;
  const controller = saveRequest.next();
  const current = () => activeId.value === id && saveRequest.isCurrent(controller);
  const settingsToSave = { training_steps: settings.value.training_steps };
  saving.value = true;
  error.value = "";
  try {
    const saved = await studioApi.saveTrainingSettings(id, settingsToSave, controller.signal);
    if (current()) settings.value = saved;
  } catch (cause) {
    if (current()) error.value = cause instanceof Error ? cause.message : "Training settings were not saved.";
  } finally {
    if (current()) saving.value = false;
  }
}
async function start(): Promise<void> {
  const id = activeId.value;
  if (!id || trainingBusy.value || !augmentation.value?.ready || prerequisitesLoading.value) return;
  const controller = startRequest.next();
  const current = () => activeId.value === id && startRequest.isCurrent(controller);
  starting.value = true;
  error.value = "";
  try {
    const nextJob = await studioApi.train(id, controller.signal);
    if (current()) {
      started.value = nextJob;
      runs.value = [nextJob, ...runs.value.filter((run) => run.id !== nextJob.id)];
      queue.track(nextJob);
    }
  } catch (cause) {
    if (current()) error.value = cause instanceof Error ? cause.message : "Training job was not started.";
  } finally {
    if (current()) starting.value = false;
  }
}
function skipped(run: Job): boolean {
  return run.kind === "train" && "skipped" in run.result && run.result.skipped === true;
}
watch(
  queue.jobs,
  (jobs) => {
    runs.value = runs.value.map((run) => (jobs[run.id]?.word_id === activeId.value ? jobs[run.id]! : run));
  },
  { deep: true },
);
queue.onFinished(
  (job) => job.kind === "download" && !!job.payload.augmentation_id,
  () => void loadPrerequisites(),
);
onBeforeUnmount(() => {
  prerequisiteRequest?.abort();
});
watch(
  activeId,
  () => {
    abortWorkspaceMutations();
    void load();
    void loadPrerequisites();
  },
  { immediate: true },
);
</script>

<template>
  <section>
    <PageHeader
      title="Train"
      description="Configure inputs and start a manual training run. Progress and logs are available in the global job queue."
    />
    <div class="studio-card">
      <h2>Effective inputs for the next snapshot</h2>
      <p v-if="loading" class="studio-muted">Loading effective inputs…</p>
      <div v-else-if="counts" data-effective-counts class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 my-4">
        <p class="studio-muted">
          <strong class="text-2xl font-semibold">{{ counts.positive }}</strong> reviewed positives
        </p>
        <p class="studio-muted">
          <strong class="text-2xl font-semibold">{{ counts.negative }}</strong> reviewed negatives
        </p>
        <p class="studio-muted">
          <strong class="text-2xl font-semibold">{{ counts.artificial }}</strong> selected artificial
        </p>
        <p data-negative-datasets-count class="studio-muted">
          <strong class="text-2xl font-semibold">{{ negativeDatasetCount }}</strong> selected negative datasets
        </p>
      </div>
      <p v-if="!loading && counts && evaluationDatasetCount" class="studio-muted text-xs">
        {{ evaluationDatasetCount }} evaluation-only
        {{ evaluationDatasetCount === 1 ? "dataset" : "datasets" }} selected separately; not sampled for training.
      </p>
      <p class="studio-muted text-xs">
        Training uses reviewed positive/negative samples, completed selected artificial batches, and selected external
        negative datasets. Dataset totals count datasets, not individual audio samples. Pending and discarded recordings
        are not training inputs.
      </p>
    </div>
    <div class="studio-card mt-4">
      <h2>Training parameters</h2>
      <div class="grid gap-3 mt-3">
        <label
          >Training steps<input
            v-model.number="settings.training_steps"
            name="training-steps"
            type="number"
            min="1"
            max="10000000"
            required
        /></label>
        <div class="flex gap-2">
          <button
            type="button"
            data-action="save-training-settings"
            :aria-busy="saving"
            :disabled="saving"
            @click="save"
          >
            {{ saving ? "Saving…" : "Save parameters" }}</button
          ><button
            type="button"
            data-action="start-training"
            class="studio-primary"
            :aria-busy="trainingBusy"
            :disabled="
              !activeId ||
              trainingBusy ||
              prerequisitesLoading ||
              !augmentation?.ready ||
              loading ||
              missingDatasets.length > 0
            "
            @click="start"
          >
            {{ starting ? "Starting…" : trainingBusy ? "Training…" : "Start training" }}
          </button>
        </div>
        <p v-if="blockedReason" data-training-blocked class="studio-note studio-note-warning text-xs" role="alert">
          {{ blockedReason }} <a :href="datasetsHref">Open Downloaded</a>
        </p>
      </div>
      <p v-if="error" class="studio-note mt-3" role="alert">{{ error }}</p>
      <button v-if="started" type="button" class="mt-3" @click="queue.show(started.id)">View training in queue</button>
    </div>
    <div class="studio-card mt-4">
      <h2>Run history</h2>
      <article v-for="run in runs" :key="run.id" class="studio-history mt-3" :data-run-id="run.id">
        <div class="studio-list-row">
          <div class="studio-list-main">
            <p data-run-number class="font-semibold">{{ run.run_number ? `Run #${run.run_number}` : "Run" }}</p>
            <p data-run-time class="studio-muted text-xs">{{ absoluteTime(runTime(run)) }}</p>
          </div>
          <div class="studio-list-actions">
            <span class="studio-status" :class="statusClass(run.status)">{{ run.status }}</span>
            <button type="button" @click="queue.show(run.id)">View in queue</button>
          </div>
        </div>
        <p v-if="skipped(run)" class="studio-note text-xs">Skipped because inputs and configuration were unchanged.</p>
        <p v-if="jobError(run)" class="studio-note text-xs" role="alert">{{ jobError(run) }}</p>
      </article>
      <p v-if="!loading && !runs.length" class="studio-muted">No training runs for this workspace yet.</p>
    </div>
  </section>
</template>
