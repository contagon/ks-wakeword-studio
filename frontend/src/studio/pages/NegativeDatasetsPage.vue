<script setup lang="ts">
import PageHeader from "../components/PageHeader.vue";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { fetchAll, studioApi } from "../api";
import { latestRequest } from "../requests";
import { useWorkspace } from "../workspace";
import type { AugmentationCatalog, Dataset } from "../types";
import { datasetBytes, datasetSamples } from "../format";
import PaginatedTable from "../components/PaginatedTable.vue";
import { isActiveStatus, useJobQueue, statusClass } from "../jobs";
import AugmentationDatasets from "../components/AugmentationDatasets.vue";

const workspace = useWorkspace();
const queue = useJobQueue();
const rows = ref<Dataset[]>([]);
const total = ref(0);
const offset = ref(0);
const storage = ref<AugmentationCatalog | null>(null);
const selected = ref<Set<string>>(new Set());
const loading = ref(false);
const saving = ref(false);
const downloading = ref(new Set<string>());
const error = ref("");
const downloadRequests = new Map<string, AbortController>();
const loadRequest = latestRequest();
const saveRequest = latestRequest();
const activeId = computed(() => workspace.selectedId.value);
const selectedIds = computed(() => [...selected.value].sort());
function abortWorkspaceMutations(): void {
  saveRequest.abort();
  downloadRequests.forEach((controller) => controller.abort());
  downloadRequests.clear();
  saving.value = false;
  downloading.value = new Set();
}
function datasetJob(dataset: Dataset) {
  return (
    queue.activeJobs.value.find((job) => job.kind === "download" && job.payload.dataset_id === dataset.id) ??
    (dataset.job_id ? queue.jobs.value[dataset.job_id] : undefined)
  );
}
function datasetState(dataset: Dataset): string {
  const job = datasetJob(dataset);
  return job?.status === "complete" ? "installed" : (job?.status ?? dataset.status);
}
function downloadBusy(dataset: Dataset): boolean {
  return downloading.value.has(dataset.id) || isActiveStatus(datasetState(dataset));
}
function selectedDatasets(id: string, controller: AbortController): Promise<Dataset[]> {
  return fetchAll(
    (window) => studioApi.datasets(id, { status: "selected", ...window }, controller.signal),
    controller.signal,
  );
}
async function load(preserveSelection = false): Promise<void> {
  const controller = loadRequest.next();
  const id = activeId.value;
  const current = () => activeId.value === id && loadRequest.isCurrent(controller);
  rows.value = [];
  total.value = 0;
  if (!preserveSelection) selected.value = new Set();
  error.value = "";
  if (!id) return;
  loading.value = true;
  try {
    const filters = { offset: offset.value, limit: 50 };
    const [page, selectedRows] = await Promise.all([
      studioApi.datasets(id, filters, controller.signal),
      selectedDatasets(id, controller),
    ]);
    if (!current()) return;
    rows.value = page.items;
    total.value = page.total;
    if (!preserveSelection) selected.value = new Set(selectedRows.map((item) => item.id));
  } catch (cause) {
    if (current()) error.value = cause instanceof Error ? cause.message : "Unable to load datasets.";
  } finally {
    if (current()) loading.value = false;
  }
}
function toggle(id: string, checked: boolean): void {
  const next = new Set(selected.value);
  checked ? next.add(id) : next.delete(id);
  selected.value = next;
}
async function save(): Promise<void> {
  const id = activeId.value;
  if (!id) return;
  const controller = saveRequest.next();
  const current = () => activeId.value === id && saveRequest.isCurrent(controller);
  const ids = selectedIds.value;
  saving.value = true;
  error.value = "";
  try {
    await studioApi.selectDatasets(id, ids, controller.signal);
    if (current()) await load();
  } catch (cause) {
    if (current()) error.value = cause instanceof Error ? cause.message : "Dataset selection was not saved.";
  } finally {
    if (current()) saving.value = false;
  }
}
async function download(dataset: Dataset): Promise<void> {
  const id = activeId.value;
  if (!id || downloadBusy(dataset)) return;
  const controller = new AbortController();
  downloadRequests.set(dataset.id, controller);
  // Switching workspace aborts every download request, so an aborted signal means "stale".
  const current = () => activeId.value === id && !controller.signal.aborted;
  downloading.value = new Set([...downloading.value, dataset.id]);
  error.value = "";
  try {
    const job = await studioApi.downloadDataset(dataset.id, controller.signal);
    if (current()) {
      queue.track(job);
      rows.value = rows.value.map((row) =>
        row.id === dataset.id ? { ...row, status: job.status, job_id: job.id } : row,
      );
    }
  } catch (cause) {
    if (current()) error.value = cause instanceof Error ? cause.message : "Dataset download was not started.";
  } finally {
    if (current()) {
      downloadRequests.delete(dataset.id);
      const next = new Set(downloading.value);
      next.delete(dataset.id);
      downloading.value = next;
    }
  }
}
queue.onFinished(
  (job) => job.kind === "download",
  () => void load(true),
);
watch(
  activeId,
  () => {
    abortWorkspaceMutations();
    void load();
  },
  { immediate: true },
);
watch(offset, () => {
  void load();
});
onBeforeUnmount(abortWorkspaceMutations);
</script>

<template>
  <section>
    <PageHeader
      title="Downloaded"
      description="Download shared training resources. Choose negative, evaluation, and augmentation datasets per wakeword; all are enabled by default."
    />
    <p
      v-if="
        storage && storage.storage_total_bytes > 0 && storage.storage_free_bytes / storage.storage_total_bytes < 0.1
      "
      data-disk-warning
      class="studio-note studio-note-warning mb-4"
      role="status"
    >
      Disk space is low: {{ datasetBytes(storage.storage_free_bytes) }} free of
      {{ datasetBytes(storage.storage_total_bytes) }} on the data volume. Free space before downloading large datasets
      or starting training.
    </p>
    <div class="studio-card">
      <div class="studio-section-header">
        <h2>Negative &amp; evaluation datasets</h2>
        <div class="studio-section-actions">
          <button
            type="button"
            data-action="save-datasets"
            class="studio-primary"
            :aria-busy="saving"
            :disabled="saving || !activeId"
            @click="save"
          >
            {{ saving ? "Saving…" : "Save selection" }}
          </button>
        </div>
      </div>
      <p class="studio-muted mt-3">Downloads are shared. Save a separate classifier selection for each wakeword.</p>
      <p v-if="loading" class="studio-muted mt-3">Loading catalog…</p>
      <p v-if="error" class="studio-note mt-3" role="alert">{{ error }}</p>
      <div v-if="rows.length" class="studio-table mt-3 grid gap-3">
        <article v-for="dataset in rows" :key="dataset.id" class="studio-history">
          <div class="studio-dataset-row">
            <label class="studio-checkbox-label"
              ><input
                :data-dataset-id="dataset.id"
                type="checkbox"
                :checked="selected.has(dataset.id)"
                @change="toggle(dataset.id, ($event.target as HTMLInputElement).checked)"
              />
              <div class="studio-dataset-copy">
                <strong>{{ dataset.name }}</strong>
                <p class="studio-muted text-xs">{{ dataset.description }} · {{ dataset.source }}</p>
                <p class="studio-muted text-xs">
                  {{ datasetBytes(dataset.installed_bytes ?? dataset.download_bytes)
                  }}{{ dataset.installed_bytes !== null ? " installed" : "" }} ·
                  {{ datasetSamples(dataset.sample_count) }}
                </p>
                <span v-if="dataset.split === 'evaluation'" class="studio-note block text-xs"
                  >Evaluation-only: this dataset is not sampled as a training input.</span
                >
              </div>
            </label>
            <div class="studio-dataset-actions">
              <span class="studio-status" :class="statusClass(datasetState(dataset))">{{ datasetState(dataset) }}</span
              ><button
                v-if="datasetState(dataset) !== 'installed'"
                type="button"
                :aria-busy="downloadBusy(dataset)"
                :disabled="downloadBusy(dataset)"
                @click="download(dataset)"
              >
                {{ downloadBusy(dataset) ? "Downloading…" : "Download" }}</button
              ><button
                v-if="datasetJob(dataset)?.id || dataset.job_id"
                type="button"
                data-action="view-dataset-job"
                @click="queue.show(datasetJob(dataset)?.id ?? dataset.job_id!)"
              >
                View in queue
              </button>
            </div>
          </div>
        </article>
      </div>
      <p v-else-if="!loading" class="studio-muted mt-3">No catalog datasets are available.</p>
      <PaginatedTable :total="total" :offset="offset" :limit="50" :loading="loading" @page="offset = $event" />
    </div>
    <AugmentationDatasets @catalog="storage = $event" />
  </section>
</template>
