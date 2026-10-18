<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { studioApi } from "../api";
import { useWorkspace } from "../workspace";
import type { Dataset, Job, Page } from "../types";
import PaginatedTable from "../components/PaginatedTable.vue";
import JobConsole from "../components/JobConsole.vue";

const workspace = useWorkspace();
const rows = ref<Dataset[]>([]); const total = ref(0); const offset = ref(0); const search = ref(""); const status = ref("");
const selected = ref<Set<string>>(new Set()); const loading = ref(false); const saving = ref(false); const error = ref(""); const jobs = ref<Job[]>([]);
let request: AbortController | undefined; let generation = 0;
const activeId = computed(() => workspace.selectedId.value);
const selectedIds = computed(() => [...selected.value].sort());
function current(id: string, token: number, controller: AbortController): boolean { return activeId.value === id && generation === token && !controller.signal.aborted; }
async function load(): Promise<void> {
  request?.abort(); const controller = new AbortController(); request = controller; const token = ++generation; const id = activeId.value;
  rows.value = []; total.value = 0; selected.value = new Set(); jobs.value = []; error.value = ""; if (!id) return; loading.value = true;
  try {
    const filters = { search: search.value, status: status.value || undefined, offset: offset.value, limit: 50 };
    const [page, selectedPage] = await Promise.all([studioApi.datasets(id, filters, controller.signal), studioApi.datasets(id, { status: "selected", limit: 100 }, controller.signal)]);
    if (!current(id, token, controller)) return;
    rows.value = page.items; total.value = page.total; selected.value = new Set(selectedPage.items.map(item => item.id));
  } catch (cause) { if (current(id, token, controller)) error.value = cause instanceof Error ? cause.message : "Unable to load datasets."; }
  finally { if (current(id, token, controller)) loading.value = false; }
}
function toggle(id: string, checked: boolean): void { const next = new Set(selected.value); checked ? next.add(id) : next.delete(id); selected.value = next; }
async function save(): Promise<void> { const id = activeId.value; if (!id) return; saving.value = true; error.value = ""; const controller = new AbortController(); request?.abort(); request = controller; const token = ++generation; try { await studioApi.selectDatasets(id, selectedIds.value, controller.signal); if (current(id, token, controller)) await load(); } catch (cause) { if (current(id, token, controller)) error.value = cause instanceof Error ? cause.message : "Dataset selection was not saved."; } finally { if (current(id, token, controller)) saving.value = false; } }
async function download(dataset: Dataset): Promise<void> { error.value = ""; try { const job = await studioApi.downloadDataset(dataset.id); if (activeId.value !== workspace.selectedId.value) return; jobs.value = [job, ...jobs.value.filter(item => item.id !== job.id)]; } catch (cause) { error.value = cause instanceof Error ? cause.message : "Dataset download was not started."; } }
watch([activeId, offset], () => { void load(); }, { immediate: true });
watch(search, () => { if (offset.value === 0) void load(); else offset.value = 0; });
watch(status, () => { if (offset.value === 0) void load(); else offset.value = 0; });
onBeforeUnmount(() => request?.abort());
function bytes(value: number | null): string { return value === null ? "Size not published" : `${Math.ceil(value / 1024)} KiB`; }
</script>

<template>
  <section><div class="mb-4"><h1>Negative Datasets</h1><p class="studio-muted">Classifier-negative inputs are selected per wakeword. Augmentation backgrounds are configured separately and are not classifier datasets.</p></div>
    <div class="studio-card"><div class="flex flex-wrap gap-3"><label>Search<input v-model="search" name="dataset-search" type="search" placeholder="Search catalog"></label><label>Installation state<select v-model="status" name="dataset-status"><option value="">All states</option><option value="available">Available</option><option value="installed">Installed</option><option value="queued">Queued</option><option value="running">Running</option><option value="failed">Failed</option><option value="selected">Selected</option></select></label><button type="button" data-action="save-datasets" class="studio-primary" :disabled="saving || !activeId" @click="save">{{ saving ? "Saving…" : "Save selection" }}</button></div>
      <p v-if="loading" class="studio-muted mt-3">Loading catalog…</p><p v-if="error" class="studio-note mt-3" role="alert">{{ error }}</p>
      <div v-if="rows.length" class="studio-table mt-3"><article v-for="dataset in rows" :key="dataset.id" class="studio-history"><div class="flex flex-wrap justify-between gap-3"><label class="flex items-start gap-2"><input :data-dataset-id="dataset.id" type="checkbox" :checked="selected.has(dataset.id)" @change="toggle(dataset.id, ($event.target as HTMLInputElement).checked)"><span><strong>{{ dataset.name }}</strong><span class="studio-muted block text-xs">{{ dataset.description }} · {{ dataset.source }} · {{ dataset.license }}</span><span class="studio-muted block text-xs">{{ dataset.representation }} / {{ dataset.adapter }} · {{ dataset.split }} · {{ bytes(dataset.installed_bytes ?? dataset.download_bytes) }}</span></span></label><div><span class="studio-status" :class="`studio-status-${dataset.status}`">{{ dataset.status }}</span><button v-if="dataset.status === 'available' || dataset.status === 'failed'" class="ml-2" type="button" @click="download(dataset)">Download</button></div></div><JobConsole v-if="dataset.job_id && ['queued', 'running', 'cancelling'].includes(dataset.status)" :job-id="dataset.job_id" /></article></div><p v-else-if="!loading" class="studio-muted mt-3">No catalog datasets match these filters.</p>
      <PaginatedTable :total="total" :offset="offset" :limit="50" :loading="loading" @page="offset = $event" />
      <JobConsole v-for="job in jobs" :key="job.id" :job-id="job.id" />
    </div>
  </section>
</template>
