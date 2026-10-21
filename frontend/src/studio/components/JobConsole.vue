<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { studioApi } from "../api";
import type { Job } from "../types";
import { jobError } from '../errors';

const props = withDefaults(defineProps<{ jobId: string; intervalMs?: number; logLimit?: number }>(), { intervalMs: 2000, logLimit: 8192 });
const emit = defineEmits<{ update: [job: Job] }>();
const job = ref<Job | null>(null);
const log = ref("");
const error = ref("");
const loading = ref(false);
let request: AbortController | undefined;
let timer: ReturnType<typeof setTimeout> | undefined;
let generation = 0;
const terminal = computed(() => job.value !== null && ["complete", "failed", "cancelled", "interrupted"].includes(job.value.status));
const canCancel = computed(() => job.value !== null && ["queued", "running", "cancelling"].includes(job.value.status));
const displayLog = computed(() => log.value.length > props.logLimit ? `…${log.value.slice(-props.logLimit)}` : log.value);
function stop(): void { request?.abort(); request = undefined; if (timer) clearTimeout(timer); timer = undefined; }
function schedule(current: number): void { if (!terminal.value && current === generation) timer = setTimeout(() => void refresh(current), props.intervalMs); }
async function refresh(current = ++generation): Promise<void> {
  stop(); const controller = new AbortController(); request = controller; loading.value = job.value === null; error.value = "";
  try {
    const [next, tail] = await Promise.all([studioApi.job(props.jobId, controller.signal), studioApi.jobLogs(props.jobId, props.logLimit, controller.signal)]);
    if (controller.signal.aborted || current !== generation || props.jobId !== next.id) return;
    job.value = next; log.value = tail.text;
    emit('update', next);
    schedule(current);
  } catch (cause) {
    if (!controller.signal.aborted && current === generation) error.value = cause instanceof Error ? cause.message : "Unable to load job status.";
  } finally { if (!controller.signal.aborted && current === generation) loading.value = false; }
}
async function cancel(): Promise<void> {
  if (!canCancel.value) return;
  request?.abort(); if (timer) clearTimeout(timer); timer = undefined; const current = ++generation; const controller = new AbortController(); request = controller; error.value = "";
  try {
    const next = await studioApi.cancelJob(props.jobId, controller.signal);
    if (!controller.signal.aborted && current === generation) { job.value = next; emit('update', next); if (!terminal.value) await refresh(current); }
  } catch (cause) { if (!controller.signal.aborted && current === generation) error.value = cause instanceof Error ? cause.message : "Unable to cancel job."; }
}
watch(() => props.jobId, () => { stop(); job.value = null; log.value = ""; void refresh(); }, { immediate: true });
onBeforeUnmount(stop);
</script>

<template>
  <section class="studio-card mt-3" :data-job-id="jobId" aria-live="polite">
    <div class="flex flex-wrap items-center justify-between gap-3"><div><h3>Job {{ jobId }}</h3><p v-if="loading" class="studio-muted text-xs">Loading job state…</p><span v-else-if="job" class="studio-status" :class="`studio-status-${job.status}`">{{ job.status }}</span></div><button v-if="canCancel" type="button" data-action="cancel-job" @click="cancel">Cancel job</button></div>
    <p v-if="job && jobError(job)" class="studio-note" role="alert">{{ jobError(job) }}<span class="block text-xs">Private diagnostics: studio/jobs/{{ job.id }}/diagnostics.log (server only).</span></p>
    <pre v-if="displayLog" class="studio-log" aria-label="Job log tail">{{ displayLog }}</pre><p v-else-if="terminal" class="studio-muted text-xs">No retained log output.</p><p v-if="error" class="studio-note" role="alert">{{ error }}</p>
  </section>
</template>
