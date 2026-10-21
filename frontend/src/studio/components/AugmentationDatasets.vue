<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { studioApi } from '../api';
import { isActiveJob, useJobQueue } from '../jobs';
import { publicError } from '../errors';
import type { AugmentationCatalog, AugmentationDataset, DownloadJob } from '../types';

const queue = useJobQueue();
const catalog = ref<AugmentationCatalog | null>(null);
const error = ref('');
const loading = ref(false);
const starting = ref(new Set<string>());
let request: AbortController | undefined;
const mutations = new Set<AbortController>();
let disposed = false;

async function load(): Promise<void> {
  request?.abort(); const controller = new AbortController(); request = controller; loading.value = true;
  try { const next = await studioApi.augmentationDatasets(controller.signal); if (!controller.signal.aborted) { catalog.value = next; error.value = ''; } }
  catch (cause) { if (!controller.signal.aborted) error.value = cause instanceof Error ? cause.message : 'Unable to load augmentation datasets.'; }
  finally { if (!controller.signal.aborted) loading.value = false; }
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
function bytes(value: number): string { return value >= 1024 ** 3 ? `${(value / 1024 ** 3).toFixed(1).replace(/\.0$/, '')} GiB` : `${Math.ceil(value / 1024 ** 2)} MiB`; }
async function download(row: AugmentationDataset): Promise<void> {
  if (busy(row)) return;
  const controller = new AbortController(); mutations.add(controller); starting.value = new Set([...starting.value, row.id]); error.value = '';
  try {
    const job = await studioApi.downloadAugmentation(row.id, controller.signal);
    if (!disposed && !controller.signal.aborted) {
      if (catalog.value) catalog.value.items = catalog.value.items.map(item => item.id === row.id ? { ...item, status: job.status, job_id: job.id, job_created_at: job.created_at, error_code: null } : item);
      queue.track(job); void queue.show(job.id);
    }
  } catch (cause) { if (!controller.signal.aborted) error.value = cause instanceof Error ? cause.message : 'Unable to start augmentation download.'; }
  finally { mutations.delete(controller); const next = new Set(starting.value); next.delete(row.id); starting.value = next; }
}
watch(() => Object.values(queue.jobs.value).filter(job => job.kind === 'download' && job.payload.augmentation_id).map(job => ({ id: job.id, active: isActiveJob(job) })), (next, previous) => {
  if (next.some(job => !job.active && previous.some(old => old.id === job.id && old.active))) void load();
});
onMounted(() => void load());
onBeforeUnmount(() => { disposed = true; request?.abort(); mutations.forEach(controller => controller.abort()); });
</script>

<template>
  <section data-augmentation-datasets class="studio-card mt-4">
    <div class="studio-toolbar"><h2>Augmentation datasets</h2><button type="button" :disabled="loading" @click="load">Refresh status</button></div>
    <p class="studio-muted mt-3">Shared across all wakewords. Download once; training automatically mixes these backgrounds and room echoes into your samples before creating model features. No per-wakeword selection is needed.</p>
    <p v-if="catalog" class="studio-muted text-xs mt-3">{{ bytes(catalog.storage_free_bytes) }} free of {{ bytes(catalog.storage_total_bytes) }} on the data volume. Download sizes are not published; downloads, conversion, and retained training snapshots need additional space.</p>
    <p v-if="catalog && catalog.storage_free_bytes / catalog.storage_total_bytes < 0.1" class="studio-note mt-3" role="status">Disk space is low. Free space before downloading large datasets or starting training.</p>
    <p v-if="loading && !catalog" class="studio-muted mt-3">Checking augmentation datasets…</p>
    <p v-if="error" class="studio-note mt-3" role="alert">{{ error }}</p>
    <article v-for="row in catalog?.items ?? []" :key="row.id" :data-augmentation-id="row.id" class="studio-history mt-3">
      <div class="studio-dataset-row"><div class="studio-dataset-copy"><strong>{{ row.name }}</strong><p class="studio-muted text-xs">{{ row.description }} · {{ row.source }}</p><p class="studio-muted text-xs">{{ row.license }}</p><p v-if="row.installed_bytes !== null" class="studio-muted text-xs">{{ bytes(row.installed_bytes) }} installed · {{ row.file_count }} WAV files</p></div>
        <div class="studio-dataset-actions"><span class="studio-status" :class="`studio-status-${state(row)}`">{{ state(row) }}</span><button v-if="state(row) !== 'installed'" type="button" :disabled="busy(row)" @click="download(row)">{{ busy(row) ? 'Preparing…' : ['failed', 'cancelled', 'interrupted'].includes(state(row)) ? 'Retry download' : 'Download & prepare' }}</button><button v-if="jobId(row)" type="button" @click="queue.show(jobId(row)!)">View in queue</button></div>
      </div>
      <p v-if="failure(row)" class="studio-note text-xs mt-3" role="alert">{{ failure(row) }}</p>
    </article>
  </section>
</template>
