<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { studioApi } from "../api";
import { useWorkspace } from "../workspace";
import type { Job, Schedule, TrainingCounts, TrainingSettings } from "../types";
import CronEditor from "../components/CronEditor.vue";
import JobConsole from "../components/JobConsole.vue";

const workspace = useWorkspace();
const counts = ref<TrainingCounts | null>(null); const settings = ref<TrainingSettings>({ training_steps: 40000, train_openwakeword: false }); const runs = ref<Job[]>([]); const schedule = ref<Schedule | null>(null); const loading = ref(false); const saving = ref(false); const error = ref(""); const started = ref<Job | null>(null);
let request: AbortController | undefined; let generation = 0;
const activeId = computed(() => workspace.selectedId.value); const scope = computed(() => activeId.value ? `train:${activeId.value}` : "train:");
function current(id: string, token: number, controller: AbortController): boolean { return activeId.value === id && generation === token && !controller.signal.aborted; }
async function load(): Promise<void> { request?.abort(); const controller = new AbortController(); request = controller; const token = ++generation; const id = activeId.value; counts.value = null; runs.value = []; schedule.value = null; started.value = null; error.value = ""; if (!id) return; loading.value = true;
  try { const [nextCounts, nextSettings, nextRuns, schedules] = await Promise.all([studioApi.trainingCounts(id, controller.signal), studioApi.trainingSettings(id, controller.signal), studioApi.trainingRuns(id, { limit: 50 }, controller.signal), studioApi.schedules(controller.signal)]); if (!current(id, token, controller)) return; counts.value = nextCounts; settings.value = nextSettings; runs.value = nextRuns.items; schedule.value = schedules.find(item => item.scope === `train:${id}`) ?? null; }
  catch (cause) { if (current(id, token, controller)) error.value = cause instanceof Error ? cause.message : "Unable to load training configuration."; }
  finally { if (current(id, token, controller)) loading.value = false; }
}
function valid(): boolean { if (!Number.isInteger(settings.value.training_steps) || settings.value.training_steps < 1 || settings.value.training_steps > 10000000) { error.value = "Training steps must be an integer between 1 and 10000000."; return false; } return true; }
async function save(): Promise<void> { const id = activeId.value; if (!id || !valid()) return; saving.value = true; error.value = ""; try { const saved = await studioApi.saveTrainingSettings(id, settings.value); if (activeId.value === id) settings.value = saved; } catch (cause) { if (activeId.value === id) error.value = cause instanceof Error ? cause.message : "Training settings were not saved."; } finally { if (activeId.value === id) saving.value = false; } }
async function start(): Promise<void> { const id = activeId.value; if (!id) return; error.value = ""; try { started.value = await studioApi.train(id); } catch (cause) { error.value = cause instanceof Error ? cause.message : "Training job was not started."; } }
function skipped(run: Job): boolean { return run.kind === "train" && "skipped" in run.result && run.result.skipped === true; }
watch(activeId, () => { void load(); }, { immediate: true }); onBeforeUnmount(() => request?.abort());
</script>

<template>
  <section><div class="mb-4"><h1>Train</h1><p class="studio-muted">Manual runs always execute. Scheduled runs snapshot inputs when they begin and can skip unchanged fingerprints.</p></div>
    <div class="studio-card"><h2>Effective inputs for the next snapshot</h2><p v-if="loading" class="studio-muted">Loading effective inputs…</p><dl v-else-if="counts" class="studio-summary"><div><dt>Reviewed positives</dt><dd>{{ counts.positive }} reviewed positives</dd></div><div><dt>Reviewed negatives</dt><dd>{{ counts.negative }} reviewed negatives</dd></div><div><dt>Selected artificial</dt><dd>{{ counts.artificial }} selected artificial</dd></div></dl><p class="studio-muted text-xs">Only reviewed positive/negative samples and completed selected artificial batches are counted. Pending and discarded recordings are not training inputs.</p></div>
    <div class="studio-card mt-4"><h2>Training parameters</h2><div class="grid gap-3 mt-3"><label>Training steps<input v-model.number="settings.training_steps" name="training-steps" type="number" min="1" max="10000000" required></label><label class="flex items-center gap-2"><input v-model="settings.train_openwakeword" name="train-openwakeword" type="checkbox"> Train optional openWakeWord companion</label><p class="studio-muted text-xs">The companion requires compatible selected inputs; incompatible catalog representations fail preflight with an actionable error.</p><div class="flex gap-2"><button type="button" data-action="save-training-settings" class="studio-primary" :disabled="saving" @click="save">{{ saving ? "Saving…" : "Save parameters" }}</button><button type="button" data-action="start-training" :disabled="!activeId" @click="start">Start training</button></div></div><p v-if="settings.train_openwakeword" class="studio-note mt-3">openWakeWord companion requested for this run.</p><p v-if="error" class="studio-note mt-3" role="alert">{{ error }}</p><JobConsole v-if="started" :job-id="started.id" /></div>
    <CronEditor :scope="scope" :schedule="schedule" @saved="schedule = $event" />
    <div class="studio-card mt-4"><h2>Run history</h2><article v-for="run in runs" :key="run.id" class="studio-history mt-3"><div class="flex justify-between gap-3"><strong>{{ run.id }}</strong><span class="studio-status" :class="`studio-status-${run.status}`">{{ run.status }}</span></div><p v-if="skipped(run)" class="studio-note text-xs">Skipped because inputs and configuration were unchanged.</p><JobConsole :job-id="run.id" /></article><p v-if="!loading && !runs.length" class="studio-muted">No training runs for this workspace yet.</p></div>
  </section>
</template>
