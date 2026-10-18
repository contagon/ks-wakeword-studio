<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue";
import { studioApi } from "../api";
import CronEditor from "../components/CronEditor.vue";
import DeviceRegistry from "../components/DeviceRegistry.vue";
import { useWorkspace } from "../workspace";
import type { CollectionRun, Recording, Schedule } from "../types";

const workspace = useWorkspace();
const schedule = ref<Schedule | null>(null);
const runs = ref<CollectionRun[]>([]);
const unmapped = ref<Recording[]>([]);
const mappingWords = ref<Record<string, string>>({});
const loading = ref(false);
const scraping = ref(false);
const saving = ref("");
const error = ref("");
const notice = ref("");
let request: AbortController | undefined;
let action: AbortController | undefined;
let generation = 0;

async function load(): Promise<void> {
  request?.abort(); const controller = new AbortController(); request = controller; const current = ++generation; loading.value = true; error.value = "";
  try {
    const [schedules, history, inbox] = await Promise.all([studioApi.schedules(controller.signal), studioApi.scrapeRuns({ limit: 25 }, controller.signal), studioApi.unmapped({ limit: 50 }, controller.signal)]);
    if (controller.signal.aborted || current !== generation) return;
    schedule.value = schedules.find(item => item.scope === "scrape") ?? null;
    runs.value = history.items; unmapped.value = inbox.items;
  } catch (cause) { if (!controller.signal.aborted && current === generation) error.value = cause instanceof Error ? cause.message : "Scrape information could not be loaded."; }
  finally { if (!controller.signal.aborted && current === generation) loading.value = false; }
}
async function scrapeNow(): Promise<void> {
  action?.abort(); const controller = new AbortController(); action = controller; scraping.value = true; error.value = "";
  try { const run = await studioApi.scrape(undefined, controller.signal); if (!controller.signal.aborted && action === controller) { runs.value = [run, ...runs.value]; notice.value = `Scrape ${run.id} finished with ${run.status}.`; } }
  catch (cause) { if (!controller.signal.aborted && action === controller) error.value = cause instanceof Error ? cause.message : "Manual scrape failed."; }
  finally { if (action === controller) scraping.value = false; }
}
async function map(recording: Recording): Promise<void> {
  const word = mappingWords.value[recording.id]; if (!word) return;
  action?.abort(); const controller = new AbortController(); action = controller; saving.value = recording.id; error.value = "";
  try { await studioApi.setSourceMapping(recording.device_id, { engine: recording.engine, source_phrase: recording.phrase, word_id: word }, controller.signal); if (!controller.signal.aborted && action === controller) { unmapped.value = unmapped.value.filter(item => item.id !== recording.id); notice.value = `Mapped “${recording.phrase}” to the selected wakeword.`; } }
  catch (cause) { if (!controller.signal.aborted && action === controller) error.value = cause instanceof Error ? cause.message : "Source mapping was not saved."; }
  finally { if (action === controller) saving.value = ""; }
}
watch(() => workspace.selectedId.value, () => { void load(); }, { immediate: true });
onBeforeUnmount(() => { request?.abort(); action?.abort(); });
</script>

<template>
  <section><div class="flex flex-wrap items-start justify-between gap-3 mb-4"><div><h1>Scrape</h1><p class="studio-muted">Collection is global across the fleet. Source phrases are routed only by explicit mappings, never by the selected wakeword.</p></div><button data-action="scrape-now" type="button" class="studio-primary" :disabled="scraping" @click="scrapeNow">{{ scraping ? 'Scraping…' : 'Scrape now' }}</button></div>
    <p v-if="notice" class="studio-note" role="status">{{ notice }}</p><p v-if="error" class="studio-note" role="alert">{{ error }}</p>
    <CronEditor scope="scrape" :schedule="schedule" class="mb-4" @saved="schedule = $event" />
    <DeviceRegistry surface="scrape" class="mb-4" @changed="void load()" />
    <section class="studio-card mb-4"><h2>Collection history</h2><p v-if="loading" class="studio-muted">Loading scrape history…</p><div v-else-if="runs.length" class="grid gap-3"><article v-for="run in runs" :key="run.id" class="studio-history"><div><strong>{{ run.id }}</strong> · {{ run.status }} · {{ run.started_at }}</div><p class="studio-muted text-xs">Listed {{ run.listed }} · New {{ run.new }} · Unmapped {{ run.unmapped }} · Failed {{ run.failed }}</p><ul><li v-for="outcome in run.devices" :key="outcome.device_id"><strong>{{ outcome.device_id }}</strong>: <span class="studio-status" :class="outcome.status === 'complete' && outcome.failed === 0 ? 'studio-status-success' : 'studio-status-warning'">{{ outcome.status }}</span> · new {{ outcome.new }} · failed {{ outcome.failed }}<span v-if="outcome.errors.length"> · {{ outcome.errors.join(', ') }}</span></li></ul></article></div><p v-else class="studio-muted">No collection runs yet.</p></section>
    <section class="studio-card"><h2>Unmapped source inbox</h2><p class="studio-muted">Map each device + engine source phrase explicitly to a wakeword. Unknown recordings remain here until assigned.</p><article v-for="recording in unmapped" :key="recording.id" class="studio-mapping-row" :data-recording-id="recording.id"><div><strong>{{ recording.phrase }}</strong><p class="studio-muted text-xs">{{ recording.device_id }} · {{ recording.engine }} · {{ recording.near_miss ? 'Near miss' : 'Activation' }}</p></div><label>Source phrase → wakeword<select v-model="mappingWords[recording.id]" name="mapping-word"><option value="">Choose wakeword</option><option v-for="word in workspace.wakewords.value" :key="word.id" :value="word.id">{{ word.phrase }}</option></select></label><button data-action="save-mapping" type="button" :disabled="!mappingWords[recording.id] || saving === recording.id" @click="map(recording)">Save mapping</button></article><p v-if="!unmapped.length" class="studio-muted">No unmapped recordings.</p></section>
  </section>
</template>
