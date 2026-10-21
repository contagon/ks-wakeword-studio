<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { studioApi } from "../api";
import { useWorkspace } from "../workspace";
import type { Dataset, Page } from "../types";
import PaginatedTable from "../components/PaginatedTable.vue";
import { isActiveJob, useJobQueue } from '../jobs';
import AugmentationDatasets from '../components/AugmentationDatasets.vue';

const workspace = useWorkspace();
const queue = useJobQueue();
const rows = ref<Dataset[]>([]); const total = ref(0); const offset = ref(0); const search = ref(""); const status = ref("");
const selected = ref<Set<string>>(new Set()); const loading = ref(false); const saving = ref(false); const downloading = ref(false); const error = ref("");
let loadRequest: AbortController | undefined; let saveRequest: AbortController | undefined; let downloadRequest: AbortController | undefined; let loadGeneration = 0; let saveGeneration = 0; let downloadGeneration = 0;
const activeId = computed(() => workspace.selectedId.value);
const selectedIds = computed(() => [...selected.value].sort());
function loadCurrent(id: string, token: number, controller: AbortController): boolean { return activeId.value === id && loadGeneration === token && !controller.signal.aborted; }
function saveCurrent(id: string, token: number, controller: AbortController): boolean { return activeId.value === id && saveGeneration === token && !controller.signal.aborted; }
function downloadCurrent(id: string, token: number, controller: AbortController): boolean { return activeId.value === id && downloadGeneration === token && !controller.signal.aborted; }
function abortWorkspaceMutations(): void { saveRequest?.abort(); downloadRequest?.abort(); saveRequest = undefined; downloadRequest = undefined; saveGeneration += 1; downloadGeneration += 1; saving.value = false; downloading.value = false; }
async function selectedDatasets(id: string, controller: AbortController): Promise<Dataset[]> {
  const items: Dataset[] = []; let selectedOffset = 0;
  while (!controller.signal.aborted) { const page: Page<Dataset> = await studioApi.datasets(id, { status: "selected", offset: selectedOffset, limit: 100 }, controller.signal); items.push(...page.items); selectedOffset += page.items.length; if (selectedOffset >= page.total || page.items.length === 0) break; }
  return items;
}
async function load(preserveSelection = false): Promise<void> {
  loadRequest?.abort(); const controller = new AbortController(); loadRequest = controller; const token = ++loadGeneration; const id = activeId.value;
  rows.value = []; total.value = 0; if (!preserveSelection) selected.value = new Set(); error.value = ""; if (!id) return; loading.value = true;
  try { const filters = { search: search.value, status: status.value || undefined, offset: offset.value, limit: 50 }; const [page, selectedRows] = await Promise.all([studioApi.datasets(id, filters, controller.signal), selectedDatasets(id, controller)]); if (!loadCurrent(id, token, controller)) return; rows.value = page.items; total.value = page.total; if (!preserveSelection) selected.value = new Set(selectedRows.map(item => item.id)); }
  catch (cause) { if (loadCurrent(id, token, controller)) error.value = cause instanceof Error ? cause.message : "Unable to load datasets."; }
  finally { if (loadCurrent(id, token, controller)) loading.value = false; }
}
function toggle(id: string, checked: boolean): void { const next = new Set(selected.value); checked ? next.add(id) : next.delete(id); selected.value = next; }
async function save(): Promise<void> { const id = activeId.value; if (!id) return; saveRequest?.abort(); const controller = new AbortController(); saveRequest = controller; const token = ++saveGeneration; const ids = selectedIds.value; saving.value = true; error.value = "";
  try { await studioApi.selectDatasets(id, ids, controller.signal); if (saveCurrent(id, token, controller)) await load(); } catch (cause) { if (saveCurrent(id, token, controller)) error.value = cause instanceof Error ? cause.message : "Dataset selection was not saved."; } finally { if (saveCurrent(id, token, controller)) saving.value = false; }
}
async function download(dataset: Dataset): Promise<void> { const id = activeId.value; if (!id) return; downloadRequest?.abort(); const controller = new AbortController(); downloadRequest = controller; const token = ++downloadGeneration; downloading.value = true; error.value = "";
  try { const job = await studioApi.downloadDataset(dataset.id, controller.signal); if (downloadCurrent(id, token, controller)) { queue.track(job); void queue.show(job.id); rows.value = rows.value.map(row => row.id === dataset.id ? { ...row, status: job.status, job_id: job.id } : row); } } catch (cause) { if (downloadCurrent(id, token, controller)) error.value = cause instanceof Error ? cause.message : "Dataset download was not started."; } finally { if (downloadCurrent(id, token, controller)) downloading.value = false; }
}
watch(() => Object.values(queue.jobs.value).filter(job => job.kind === 'download').map(job => ({ id: job.id, active: isActiveJob(job) })), (next, previous) => {
  if (next.some(job => !job.active && previous.some(old => old.id === job.id && old.active))) void load(true);
});
watch(activeId, () => { abortWorkspaceMutations(); void load(); }, { immediate: true });
watch(offset, () => { void load(); });
watch(search, () => { if (offset.value === 0) void load(); else offset.value = 0; });
watch(status, () => { if (offset.value === 0) void load(); else offset.value = 0; });
onBeforeUnmount(() => { loadRequest?.abort(); saveRequest?.abort(); downloadRequest?.abort(); });
function bytes(value: number | null): string { return value === null ? "Size not published" : `${Math.ceil(value / 1024)} KiB`; }
</script>

<template>
  <section><div class="mb-4"><h1>Online Datasets</h1><p class="studio-muted">Download shared training resources. Negative and evaluation inputs are selected per wakeword; augmentation datasets are used automatically by all wakewords.</p></div>
    <div class="studio-card"><h2>Negative &amp; evaluation datasets</h2><p class="studio-muted mb-3">Downloads are shared. Save a separate classifier selection for each wakeword.</p><div class="studio-toolbar"><label>Search<input v-model="search" name="dataset-search" type="search" placeholder="Search catalog"></label><label>Installation state<select v-model="status" name="dataset-status"><option value="">All states</option><option value="available">Available</option><option value="installed">Installed</option><option value="queued">Queued</option><option value="running">Running</option><option value="failed">Failed</option><option value="selected">Selected</option></select></label><button type="button" data-action="save-datasets" class="studio-primary" :disabled="saving || !activeId" @click="save">{{ saving ? "Saving…" : "Save selection" }}</button></div>
      <p v-if="loading" class="studio-muted mt-3">Loading catalog…</p><p v-if="error" class="studio-note mt-3" role="alert">{{ error }}</p>
      <div v-if="rows.length" class="studio-table mt-3 grid gap-3"><article v-for="dataset in rows" :key="dataset.id" class="studio-history"><div class="studio-dataset-row"><label class="studio-checkbox-label"><input :data-dataset-id="dataset.id" type="checkbox" :checked="selected.has(dataset.id)" @change="toggle(dataset.id, ($event.target as HTMLInputElement).checked)"><span class="studio-dataset-copy"><strong>{{ dataset.name }}</strong><span class="studio-muted block text-xs">{{ dataset.description }} · {{ dataset.source }} · {{ dataset.license }}</span><span class="studio-muted block text-xs">{{ dataset.representation }} / {{ dataset.adapter }} · {{ dataset.split }} · {{ bytes(dataset.installed_bytes ?? dataset.download_bytes) }}</span><span v-if="dataset.split === 'evaluation'" class="studio-note block text-xs">Evaluation-only: this dataset is not sampled as a training input.</span></span></label><div class="studio-dataset-actions"><span class="studio-status" :class="`studio-status-${dataset.status}`">{{ dataset.status }}</span><button v-if="dataset.status === 'available' || dataset.status === 'failed'" type="button" :disabled="downloading" @click="download(dataset)">Download</button><button v-if="dataset.job_id" type="button" data-action="view-dataset-job" @click="queue.show(dataset.job_id)">View in queue</button></div></div></article></div><p v-else-if="!loading" class="studio-muted mt-3">No catalog datasets match these filters.</p>
      <PaginatedTable :total="total" :offset="offset" :limit="50" :loading="loading" @page="offset = $event" />
    </div>
    <AugmentationDatasets />
  </section>
</template>
