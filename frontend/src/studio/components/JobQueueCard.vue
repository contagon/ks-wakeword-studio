<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useDeviceRegistry } from '../devices';
import { studioApi } from '../api';
import { isActiveJob, useJobQueue } from '../jobs';
import { useWorkspace } from '../workspace';
import type { Job } from '../types';

const props = defineProps<{ job: Job }>();
const registry = useDeviceRegistry();
onMounted(() => { void registry.load(); });
const queue = useJobQueue(), workspace = useWorkspace();
const names: Record<string, string> = { train: 'Train wakeword', generation: 'Generate artificial samples', preview: 'Preview voice', scrape: 'Collect recordings', download: 'Download negative dataset', classify: 'Classify recordings', deploy: 'Deploy model' };
const scope = computed(() => props.job.word_id ? workspace.wakewords.value.find(word => word.id === props.job.word_id)?.phrase ?? props.job.word_id : props.job.kind === 'download' ? 'Shared dataset' : 'All wakewords');
const devices = computed(() => {
  if (props.job.kind === 'scrape') return props.job.payload.device_ids?.map(registry.deviceLabel).join(', ') || 'All registered kiosks and followers';
  return props.job.kind === 'download' ? props.job.payload.dataset_id : 'Trainer';
});
const expanded = ref(false), logs = ref(''), error = ref(''), loading = ref(false);
let request: AbortController | undefined, timer: ReturnType<typeof setTimeout> | undefined;
function stop(): void { request?.abort(); if (timer) clearTimeout(timer); timer = undefined; }
async function loadLogs(): Promise<void> {
  stop(); if (!expanded.value) return;
  const controller = new AbortController(); request = controller; loading.value = true;
  try { const result = await studioApi.jobLogs(props.job.id, 8192, controller.signal); if (!controller.signal.aborted) { logs.value = result.text.slice(-8192); error.value = ''; } }
  catch (cause) { if (!controller.signal.aborted) error.value = cause instanceof Error ? cause.message : 'Unable to load job logs.'; }
  finally { if (!controller.signal.aborted) { loading.value = false; if (expanded.value && isActiveJob(props.job)) timer = setTimeout(() => void loadLogs(), 2000); } }
}
watch([expanded, () => props.job.status], () => { if (expanded.value) void loadLogs(); else stop(); });
onBeforeUnmount(stop);
</script>

<template>
  <article class="studio-card studio-job-card" :class="{ 'studio-selected': queue.selectedJobId.value === job.id }" :data-job-id="job.id">
    <div class="studio-job-heading"><h3>{{ names[job.kind] ?? job.kind }}</h3><span class="studio-status" :class="`studio-status-${job.status}`">{{ job.status }}</span><button v-if="isActiveJob(job)" type="button" data-action="cancel-job" :aria-label="`Cancel ${names[job.kind] ?? job.kind}`" :disabled="job.status === 'cancelling' || queue.cancelling.value.has(job.id)" @click="queue.cancel(job.id)">Cancel</button></div>
    <p class="studio-job-meta">{{ scope }} · {{ devices }}</p>
    <p class="studio-job-meta">{{ job.started_at ? 'Started' : 'Created' }} {{ new Date(job.started_at ?? job.created_at).toLocaleString() }}</p>
    <details @toggle="expanded = ($event.target as HTMLDetailsElement).open"><summary>View logs</summary><p v-if="loading && !logs" class="studio-job-meta">Loading logs…</p><pre v-if="logs" class="studio-log" aria-label="Job log tail">{{ logs }}</pre><p v-else-if="!loading && !error" class="studio-job-meta">No retained log output.</p><p v-if="error" class="studio-note" role="alert">{{ error }} <button type="button" @click="loadLogs">Retry</button></p><p class="studio-job-meta">Job {{ job.id }}</p></details>
    <p v-if="queue.cancelErrors.value[job.id]" class="studio-note" role="alert">{{ queue.cancelErrors.value[job.id] }}</p>
  </article>
</template>
