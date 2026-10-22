<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { studioApi } from '../api';
import { isActiveJob, useJobQueue, statusClass } from '../jobs';
import { publicError } from '../errors';
import type { AugmentationCatalog, AugmentationDataset, DownloadJob } from '../types';
import { useWorkspace } from '../workspace';
import { datasetBytes, datasetSamples } from '../datasetFormat';

const emit = defineEmits<{ catalog: [value: AugmentationCatalog] }>();
const workspace = useWorkspace();
const activeId = computed(() => workspace.selectedId.value);
const queue = useJobQueue();
const catalog = ref<AugmentationCatalog | null>(null);
const selected = ref(new Set<string>());
const saving = ref(false);
const error = ref('');
const loading = ref(false);
const starting = ref(new Set<string>());
let request: AbortController | undefined;
let saveRequest: AbortController | undefined;
const mutations = new Set<AbortController>();
let disposed = false;

function updateCatalog(next: AugmentationCatalog): void { catalog.value = next; emit('catalog', next); }
async function load(preserveSelection = true): Promise<void> {
  request?.abort(); const controller = new AbortController(); request = controller; loading.value = true;
  const id = activeId.value;
  try { const next = await (id ? studioApi.wakewordAugmentationDatasets(id, controller.signal) : studioApi.augmentationDatasets(controller.signal)); if (!controller.signal.aborted && id === activeId.value) { updateCatalog(next); if (!preserveSelection) selected.value = new Set(next.items.filter(row => row.selected).map(row => row.id)); error.value = ''; } }
  catch (cause) { if (!controller.signal.aborted) error.value = cause instanceof Error ? cause.message : 'Unable to load augmentation datasets.'; }
  finally { if (!controller.signal.aborted) loading.value = false; }
}
function toggle(id: string, checked: boolean): void { const next = new Set(selected.value); checked ? next.add(id) : next.delete(id); selected.value = next; }
async function save(): Promise<void> {
  const id = activeId.value; if (!id || saving.value) return;
  saveRequest?.abort(); const controller = new AbortController(); saveRequest = controller; saving.value = true; error.value = '';
  try {
    const next = await studioApi.selectAugmentationDatasets(id, [...selected.value].sort(), controller.signal);
    if (!controller.signal.aborted && id === activeId.value) updateCatalog(next);
  } catch (cause) { if (!controller.signal.aborted) error.value = cause instanceof Error ? cause.message : 'Augmentation selection was not saved.'; }
  finally { if (!controller.signal.aborted) saving.value = false; }
}
function latest(row: AugmentationDataset): DownloadJob | undefined {
  const newest = Object.values(queue.jobs.value).filter((job): job is DownloadJob => job.kind === 'download' && job.payload.augmentation_id === row.id)
    .sort((a, b) => a.created_at.localeCompare(b.created_at)).at(-1);
  if (row.job_id && newest?.id !== row.job_id && (!row.job_created_at || !newest || newest.created_at <= row.job_created_at)) {
    const current = queue.jobs.value[row.job_id];
    return current?.kind === 'download' ? current : undefined;
  }
  return newest;
}
function state(row: AugmentationDataset): string {
  if (row.status === 'installed') return 'installed';
  const job = latest(row);
  return job && job.status !== 'complete' ? job.status : row.status;
}
function failure(row: AugmentationDataset): string {
  if (row.status === 'installed') return '';
  const result = latest(row)?.result;
  return publicError(result && 'error_code' in result ? result.error_code : row.error_code);
}
function jobId(row: AugmentationDataset): string | null { return latest(row)?.id ?? row.job_id; }
function busy(row: AugmentationDataset): boolean { return starting.value.has(row.id) || ['queued', 'running', 'cancelling'].includes(state(row)); }
async function download(row: AugmentationDataset): Promise<void> {
  if (busy(row)) return;
  const controller = new AbortController(); mutations.add(controller); starting.value = new Set([...starting.value, row.id]); error.value = '';
  try {
    const job = await studioApi.downloadAugmentation(row.id, controller.signal);
    if (!disposed && !controller.signal.aborted) {
      if (catalog.value) catalog.value.items = catalog.value.items.map(item => item.id === row.id ? { ...item, status: job.status, job_id: job.id, job_created_at: job.created_at, error_code: null } : item);
      queue.track(job);
    }
  } catch (cause) { if (!controller.signal.aborted) error.value = cause instanceof Error ? cause.message : 'Unable to start augmentation download.'; }
  finally { mutations.delete(controller); const next = new Set(starting.value); next.delete(row.id); starting.value = next; }
}
watch(() => Object.values(queue.jobs.value).filter(job => job.kind === 'download' && job.payload.augmentation_id).map(job => ({ id: job.id, active: isActiveJob(job) })), (next, previous) => {
  if (next.some(job => !job.active && previous.some(old => old.id === job.id && old.active))) void load();
});
watch(activeId, () => { saveRequest?.abort(); saving.value = false; selected.value = new Set(); catalog.value = null; error.value = ''; void load(false); }, { immediate: true });
onBeforeUnmount(() => { disposed = true; request?.abort(); saveRequest?.abort(); mutations.forEach(controller => controller.abort()); });
</script>

<template>
  <section data-augmentation-datasets class="studio-card mt-4">
    <div class="studio-toolbar"><h2>Augmentation datasets</h2><button type="button" :disabled="loading" @click="load()">Refresh status</button><button type="button" data-action="save-augmentation" class="studio-primary studio-selection-action" :disabled="saving || loading || !activeId || !catalog" @click="save">{{ saving ? 'Saving…' : 'Save selection' }}</button></div>
    <p class="studio-muted mt-3">Downloads are shared; select usage per wakeword. All are enabled by default. Training mixes selected backgrounds and room echoes into your samples before creating model features.</p>
    <p v-if="loading && !catalog" class="studio-muted mt-3">Checking augmentation datasets…</p>
    <p v-if="error" class="studio-note mt-3" role="alert">{{ error }}</p>
    <article v-for="row in catalog?.items ?? []" :key="row.id" :data-augmentation-id="row.id" class="studio-history mt-3">
      <div class="studio-dataset-row"><label class="studio-checkbox-label"><input type="checkbox" :disabled="!activeId || saving" :checked="selected.has(row.id)" @change="toggle(row.id, ($event.target as HTMLInputElement).checked)"><div class="studio-dataset-copy"><strong>{{ row.name }}</strong><p class="studio-muted text-xs">{{ row.description }} · {{ row.source }}</p><p class="studio-muted text-xs">{{ datasetBytes(row.installed_bytes ?? row.download_bytes) }}{{ row.installed_bytes !== null ? ' installed' : '' }} · {{ datasetSamples(row.file_count) }}</p></div></label>
        <div class="studio-dataset-actions"><span class="studio-status" :class="statusClass(state(row))">{{ state(row) }}</span><button v-if="state(row) !== 'installed'" type="button" :aria-busy="busy(row)" :disabled="busy(row)" @click="download(row)">{{ busy(row) ? 'Preparing…' : ['failed', 'cancelled', 'interrupted'].includes(state(row)) ? 'Retry download' : 'Download & prepare' }}</button><button v-if="jobId(row)" type="button" @click="queue.show(jobId(row)!)">View in queue</button></div>
      </div>
      <p v-if="failure(row)" class="studio-note text-xs mt-3" role="alert">{{ failure(row) }}</p>
    </article>
  </section>
</template>
