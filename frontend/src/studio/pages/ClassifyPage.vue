<script lang="ts">
import type { Sample } from "../types";
let persistedUndo: Array<{ word: string; sample: Sample }> = [];
</script>

<script setup lang="ts">
import { absoluteTime } from '../time';
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { studioApi } from "../api";
import AudioPlayer from "../components/AudioPlayer.vue";
import { useWorkspace } from "../workspace";
import type { Recording, Job } from "../types";
import CollectionHistory from '../components/CollectionHistory.vue';
import SourceInbox from '../components/SourceInbox.vue';
import { useJobQueue } from '../jobs';
import { useDeviceRegistry } from '../devices';

const workspace = useWorkspace();
const registry = useDeviceRegistry();
onMounted(() => { void registry.load(); });
const jobs = useJobQueue();
const { classifyTab: tab } = workspace.routes;
const collectionJob = ref<Job | null>(null), collecting = ref(false), collectionError = ref('');
const collectionBusy = computed(() => collecting.value || jobs.activeJobs.value.some(job => job.kind === 'scrape' && job.word_id === workspace.selectedId.value));
const collectionOutcome = computed(() => {
  const job = collectionJob.value;
  return job?.kind === 'scrape' && job.status === 'complete' && 'status' in job.result ? job.result : null;
});
const collectionWarning = computed(() => Boolean(collectionOutcome.value && (collectionOutcome.value.status !== 'complete' || (collectionOutcome.value.failed ?? 0) > 0 || (collectionOutcome.value.evicted ?? 0) > 0)));
const collectionHistoryHref = computed(() => '#/classify?' + new URLSearchParams({ word: workspace.selectedId.value, tab: 'collect' }));
let collectionRequest: AbortController | undefined;
async function collectNow() {
  if (!workspace.selectedId.value || collectionBusy.value) return;
  const word = workspace.selectedId.value, controller = new AbortController(); collectionRequest = controller;
  collecting.value = true; collectionError.value = '';
  try { const job = await studioApi.collect(word, undefined, controller.signal); if (!controller.signal.aborted && workspace.selectedId.value === word) { collectionJob.value = job; jobs.track(job); } }
  catch (cause) { if (!controller.signal.aborted) collectionError.value = cause instanceof Error ? cause.message : 'Collection was not started.'; }
  finally { if (collectionRequest === controller) collecting.value = false; }
}
async function updateCollection(job: Job) {
  const previous = collectionJob.value;
  if (!previous || job.id !== previous.id || job.word_id !== workspace.selectedId.value) return;
  collectionJob.value = job;
  if (job.status !== 'complete' || previous.status === 'complete') return;
  void registry.load(true);
  void refreshInbox();
  const word = workspace.selectedId.value, beforeReview = reviewedCount.value;
  const controller = new AbortController(); collectionRequest?.abort(); collectionRequest = controller;
  try { const page = await studioApi.queue(word, queueParams(), controller.signal); if (controller.signal.aborted || word !== workspace.selectedId.value || saving.value || reviewedCount.value !== beforeReview) return;
    const known = new Set(queue.value.map(item => item.id)); queue.value.push(...page.items.filter(item => !known.has(item.id))); total.value = page.total;
  } catch (cause) { if (!controller.signal.aborted) collectionError.value = cause instanceof Error ? cause.message : 'Collection completed; refresh the queue to see new recordings.'; }
}
watch(jobs.jobs, records => { const job = collectionJob.value && records[collectionJob.value.id]; if (job) void updateCollection(job); }, { deep: true });
const sessionSkips = new Map<string, Set<string>>();
const queue = ref<Sample[]>([]);
const unmapped = ref<Recording[]>([]);
const inboxLoading = ref(false), inboxError = ref('');
let inboxRequest: AbortController | undefined;
async function refreshInbox() {
  inboxRequest?.abort(); const controller = new AbortController(); inboxRequest = controller;
  const word = workspace.selectedId.value;
  inboxLoading.value = true; inboxError.value = '';
  try { const page = await studioApi.unmapped({ limit: 50 }, controller.signal);
    if (!controller.signal.aborted && inboxRequest === controller && workspace.selectedId.value === word) unmapped.value = page.items;
  } catch (cause) { if (!controller.signal.aborted && workspace.selectedId.value === word) inboxError.value = cause instanceof Error ? cause.message : 'Unable to refresh the inbox.'; }
  finally { if (inboxRequest === controller) inboxLoading.value = false; }
}
const skipped = ref(new Set<string>());
const position = ref(0);
const total = ref(0);
const reviewedCount = ref(0);
const loading = ref(false);
const saving = ref(false);
const error = ref("");
const notice = ref("");
const hasGesture = ref(false);
const autoplayNext = ref(false);
const readySampleId = ref<string | null>(null);
const discardOpen = ref(false);
const kind = ref("");
const player = ref<InstanceType<typeof AudioPlayer>>();
let request: AbortController | undefined;
let mutation: AbortController | undefined;
let mutationGeneration = 0;
let assignment: AbortController | undefined;
let assignmentGeneration = 0;
let generation = 0;
const visible = computed(() => queue.value.filter(item => !skipped.value.has(item.id)));
const active = computed(() => visible.value[position.value] ?? null);
const source = computed(() => active.value ? studioApi.audioUrl(active.value.word_id, active.value.id) : null);
const reviewed = computed(() => reviewedCount.value);
function reset(): void { player.value?.stop(); queue.value = []; unmapped.value = []; skipped.value = new Set(sessionSkips.get(workspace.selectedId.value) ?? []); position.value = 0; total.value = 0; reviewedCount.value = 0; autoplayNext.value = false; discardOpen.value = false; error.value = ""; notice.value = ""; }
function invalidateAssignment(): void {
  assignmentGeneration += 1;
  if (assignment) { assignment.abort(); assignment = undefined; saving.value = false; }
}
function queueParams() { return { limit: 100, ...(kind.value ? { near_miss: kind.value === "true" } : {}) }; }
async function pendingWindow(word: string, controller: AbortController) {
  let offset = 0;
  while (true) {
    const page = await studioApi.queue(word, { ...queueParams(), offset }, controller.signal);
    if (controller.signal.aborted || workspace.selectedId.value !== word) return page;
    const items = page.items.filter(item => !skipped.value.has(item.id));
    offset += page.items.length;
    if (items.length || !page.items.length || offset >= page.total) return { ...page, items };
  }
}
async function refill(): Promise<void> {
  if (visible.value.length || loading.value) return;
  request?.abort(); const controller = new AbortController(); request = controller; const current = ++generation; const word = workspace.selectedId.value;
  if (!word) return; loading.value = true;
  try { const page = await pendingWindow(word, controller); if (controller.signal.aborted || current !== generation || workspace.selectedId.value !== word) return; queue.value = [...new Map(page.items.map(item => [item.id, item])).values()]; total.value = page.total; position.value = 0; }
  catch { if (!controller.signal.aborted && current === generation) error.value = 'Queue could not be refilled. Retry loading the pending window.'; }
  finally { if (!controller.signal.aborted && current === generation) loading.value = false; }
}
async function load(): Promise<void> {
  mutation?.abort(); mutationGeneration++; saving.value = false;
  invalidateAssignment();
  request?.abort(); const controller = new AbortController(); request = controller; const current = ++generation; const word = workspace.selectedId.value;
  reset(); inboxRequest?.abort(); inboxError.value = ''; inboxLoading.value = false;
  if (!word) return; loading.value = true; void refreshInbox();
  try {
    const page = await pendingWindow(word, controller);
    if (controller.signal.aborted || current !== generation || workspace.selectedId.value !== word) return;
    queue.value = page.items; total.value = page.total;
  } catch (cause) { if (!controller.signal.aborted && current === generation) error.value = cause instanceof Error ? cause.message : "Queue could not be loaded."; }
  finally { if (!controller.signal.aborted && current === generation) loading.value = false; }
}
function next(): void { player.value?.stop(); position.value = Math.min(position.value + 1, Math.max(0, visible.value.length - 1)); autoplayNext.value = hasGesture.value; }
function removeCurrent(): void { const item = active.value; if (!item) return; queue.value = queue.value.filter(candidate => candidate.id !== item.id); total.value = Math.max(0, total.value - 1); position.value = Math.min(position.value, Math.max(0, visible.value.length - 1)); player.value?.stop(); autoplayNext.value = hasGesture.value; void refill(); }
async function conflict(item: Sample, controller: AbortController, token: number): Promise<void> {
  const current = () => !controller.signal.aborted && token === mutationGeneration && workspace.selectedId.value === item.word_id && active.value?.id === item.id;
  if (!current()) return;
  try {
    const latest = await studioApi.sample(item.word_id, item.id, controller.signal);
    if (!current()) return;
    if (latest.label !== "pending") { removeCurrent(); return; }
    queue.value = queue.value.map(candidate => candidate.id === item.id ? latest : candidate);
  } catch { /* The original safe error remains visible. */ }
}
async function label(label: "positive" | "negative" | "discarded"): Promise<void> {
  const item = active.value; if (!item || saving.value || discardOpen.value) return;
  hasGesture.value = true; saving.value = true; error.value = ""; const controller = new AbortController(); mutation?.abort(); mutation = controller;
  const token = ++mutationGeneration;
  const current = () => !controller.signal.aborted && token === mutationGeneration && workspace.selectedId.value === item.word_id;
  try {
    const updated = await studioApi.label(item.word_id, item.id, label, item.revision, controller.signal);
    if (!current() || active.value?.id !== item.id) return;
    persistedUndo.push({ word: item.word_id, sample: updated }); reviewedCount.value += 1; notice.value = `Saved ${label} label.`; removeCurrent();
  } catch (cause) {
    if (current()) {
      if (cause instanceof Error && cause.message.includes("conflict")) { error.value = "This recording changed elsewhere. Review the latest version before saving."; await conflict(item, controller, token); }
      else error.value = "Label was not saved. Try again; this recording remains in the queue.";
    }
  } finally { if (current()) saving.value = false; }
}
function skip(): void { const item = active.value; if (!item || saving.value || loading.value) return; hasGesture.value = true; skipped.value = new Set([...skipped.value, item.id]); sessionSkips.set(item.word_id, skipped.value); position.value = Math.min(position.value, Math.max(0, visible.value.length - 1)); player.value?.stop(); autoplayNext.value = false; notice.value = "Skipped for this session; this recording remains pending."; void refill(); }
async function undo(): Promise<void> {
  if (saving.value || !persistedUndo.length) return; hasGesture.value = true; saving.value = true; error.value = ""; const action = persistedUndo[persistedUndo.length - 1]; const controller = new AbortController(); mutation?.abort(); mutation = controller;
  const token = ++mutationGeneration, word = workspace.selectedId.value;
  const current = () => !controller.signal.aborted && token === mutationGeneration && workspace.selectedId.value === word;
  try {
    const restored = await studioApi.undo(action.word, action.sample.id, action.sample.revision, controller.signal);
    if (!current()) return; persistedUndo.pop(); notice.value = "Last label restored to pending.";
    if (workspace.selectedId.value === action.word) { queue.value = [restored, ...queue.value.filter(item => item.id !== restored.id)]; total.value += 1; reviewedCount.value = Math.max(0, reviewedCount.value - 1); position.value = 0; autoplayNext.value = false; }
  } catch { if (current()) error.value = "Undo was not saved. Refresh and try again."; }
  finally { if (current()) saving.value = false; }
}
async function assign(recording: Recording): Promise<void> {
  const word = workspace.selectedId.value;
  if (saving.value || !word) return;
  inboxRequest?.abort();
  const queueGeneration = generation;
  const current = ++assignmentGeneration;
  const controller = new AbortController();
  assignment?.abort(); assignment = controller;
  saving.value = true; error.value = "";
  try {
    const assigned = await studioApi.assign(recording.id, word, controller.signal);
    if (controller.signal.aborted || assignment !== controller || current !== assignmentGeneration || queueGeneration !== generation || workspace.selectedId.value !== word) return;
    unmapped.value = unmapped.value.filter(item => item.id !== recording.id);
    queue.value = [...queue.value.filter(item => item.id !== assigned.id), assigned];
    total.value += 1;
    notice.value = "Recording assigned to this workspace and added to the pending queue.";
    void refreshInbox();
  } catch {
    if (!controller.signal.aborted && assignment === controller && current === assignmentGeneration && workspace.selectedId.value === word) error.value = "Recording could not be assigned.";
  } finally {
    if (assignment === controller) { assignment = undefined; saving.value = false; }
  }
}
function editing(event: KeyboardEvent): boolean { const target = event.target instanceof HTMLElement ? event.target : document.activeElement; return target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(target.tagName)); }
function shortcut(event: KeyboardEvent): void {
  if (jobs.open.value || tab.value !== 'review') return;
  if (event.repeat || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey || editing(event)) return;
  const key = event.key.toLowerCase();
  if (discardOpen.value) { if (event.key === "Escape") { event.preventDefault(); discardOpen.value = false; } return; }
  if (key === "d") { event.preventDefault(); if (active.value && !saving.value) discardOpen.value = true; return; }
  if (!["p", "n", " ", "r", "s", "z"].includes(key)) return;
  event.preventDefault(); hasGesture.value = true;
  if (key === "p") void label("positive"); else if (key === "n") void label("negative"); else if (key === " ") player.value?.toggle(); else if (key === "r") player.value?.replay(); else if (key === "s") skip(); else void undo();
}
watch(workspace.selectedId, () => { collectionRequest?.abort(); collectionJob.value = null; collecting.value = false; collectionError.value = ''; void load(); }, { immediate: true });
watch(kind, () => { void load(); });
watch(() => active.value?.id, () => { readySampleId.value = null; }, { flush: "sync" });
onMounted(() => document.addEventListener("keydown", shortcut));
watch(tab, () => { player.value?.stop(); });
onBeforeUnmount(() => { document.removeEventListener("keydown", shortcut); inboxRequest?.abort(); collectionRequest?.abort(); request?.abort(); mutation?.abort(); invalidateAssignment(); player.value?.stop(); });
</script>

<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4"><div><h1>Classify</h1><p class="studio-muted">Collect recordings, resolve source mappings, and review labels.</p></div><div class="flex flex-wrap items-center gap-3"><span data-progress class="studio-muted">{{ total }} pending · {{ reviewed }} reviewed · {{ skipped.size }} skipped</span><button data-action="collect-now" class="studio-primary" :aria-busy="collectionBusy" :disabled="!workspace.selectedId.value || collectionBusy" @click="collectNow">{{ collecting ? 'Starting…' : collectionBusy ? 'Collecting…' : 'Collect' }}</button></div></div>
    <div class="studio-tabs" role="tablist" aria-label="Classification sections"><button v-for="entry in (['review', 'collect', 'unmapped'] as const)" :id="`classify-tab-${entry}`" :key="entry" role="tab" :aria-selected="tab === entry" :aria-controls="`classify-panel-${entry}`" :class="{ active: tab === entry }" @click="workspace.routes.selectClassifyTab(entry)">{{ entry === 'review' ? 'Review' : entry === 'collect' ? 'Collect' : 'Unmapped' }}</button></div>
    <p v-if="collectionError" class="studio-note" role="alert">{{ collectionError }}</p>
    <p v-if="collectionOutcome" data-collection-outcome class="studio-note" :class="{ 'studio-collection-warning': collectionWarning }" :role="collectionWarning ? 'alert' : 'status'"><strong>{{ collectionWarning ? 'Collection needs attention' : 'Collection finished' }}</strong> · {{ collectionOutcome.status }} · {{ collectionOutcome.new ?? 0 }} imported · {{ collectionOutcome.failed ?? 0 }} failed · {{ collectionOutcome.unmapped ?? 0 }} unmapped · {{ collectionOutcome.evicted ?? 0 }} evicted. <a :href="collectionHistoryHref" @click.prevent="workspace.routes.selectClassifyTab('collect')">View collection run →</a></p>
    <div v-show="tab === 'review'" id="classify-panel-review" role="tabpanel" aria-labelledby="classify-tab-review">
    <div class="studio-card studio-toolbar mb-4"><label>Recording type<select name="kind" v-model="kind"><option value="">All pending</option><option value="true">Near misses</option><option value="false">Activations</option></select></label></div>
    <p v-if="notice" class="studio-note" role="status" aria-live="polite">{{ notice }}</p><p v-if="error" data-classify-error class="studio-note" role="alert" aria-live="assertive">{{ error }}</p>
    <div v-if="loading" class="studio-card" aria-busy="true">Loading review queue…</div>
    <div v-else-if="active" data-classify-current :data-sample-id="active.id" class="studio-card grid gap-4">
      <div class="flex flex-wrap justify-between gap-3"><div><h2>Recording {{ active.recording?.clip_id ?? active.id }}</h2><p class="studio-muted text-sm">{{ active.recording ? registry.deviceLabel(active.recording.device_id) : active.source }} · {{ active.recording?.near_miss ? "Near miss" : "Activation" }} · {{ absoluteTime(active.recording?.timestamp ?? active.created_at) }}</p></div><span class="studio-muted">Revision {{ active.revision }}</span></div>
      <AudioPlayer ref="player" :sample-id="active.id" :src="source" :autoplay-requested="autoplayNext" @ready="autoplayNext = false; readySampleId = active.id" @playback-error="error = $event" />
      <p v-if="readySampleId === active.id" class="studio-muted text-xs">Press Space once to enable playback; then acknowledged labels play the next clip.</p>
      <div class="flex flex-wrap gap-2"><button type="button" class="studio-primary" :disabled="saving" @click="label('positive')">Positive (P)</button><button type="button" :disabled="saving" @click="label('negative')">Negative (N)</button><button type="button" :disabled="saving" @click="skip">Skip (S)</button><button type="button" :disabled="saving" data-action="discard" @click="discardOpen = true">Discard (D)</button><button type="button" :disabled="saving || !persistedUndo.length" @click="undo">Undo (Z)</button></div>
      <p data-shortcuts class="studio-muted text-xs">P positive · N negative · Space play/pause · R replay · S skip for this session · Z undo.</p><input name="search" type="search" aria-label="Queue search" placeholder="Shortcuts pause while editing">
    </div><div v-else class="studio-card"><span v-if="total === 0">No pending recordings for this workspace.</span><span v-else>Pending recordings are skipped for this session or the local window needs reloading.</span><button v-if="total > 0" type="button" @click="refill">Retry pending window</button></div>
    </div>
    <div v-if="tab === 'collect'" id="classify-panel-collect" role="tabpanel" aria-labelledby="classify-tab-collect"><div class="studio-card mb-4"><h2>Collect recordings</h2><p class="studio-muted">Use Collect above to fetch recordings for the selected workspace now, even when its schedule is off. Unknown sources are retained in the shared Unmapped inbox.</p><a :href="workspace.routes.href('automate')" @click.prevent="workspace.routes.navigate('automate')">Collection settings →</a></div><CollectionHistory :refresh-key="collectionJob?.status" :active-run-id="collectionOutcome?.run_id" /></div>
    <div v-show="tab === 'unmapped'" id="classify-panel-unmapped" role="tabpanel" aria-labelledby="classify-tab-unmapped"><p v-if="inboxError" class="studio-note" role="alert">{{ inboxError }}</p><SourceInbox :recordings="unmapped" :busy="saving" :refreshing="inboxLoading" @refresh="refreshInbox" @assign="assign" @changed="notice = 'Source mapping saved for future collections.'" /></div>
    <div v-if="discardOpen" class="studio-modal-backdrop"><section data-dialog="discard" class="studio-card" role="dialog" aria-modal="true" aria-label="Confirm discard"><h2>Discard this recording?</h2><p>Discarding preserves its source tombstone so future collection does not reintroduce it.</p><div class="flex gap-2"><button type="button" data-action="confirm-discard" class="studio-primary" :disabled="saving" @click="discardOpen = false; label('discarded')">Discard recording</button><button type="button" @click="discardOpen = false">Cancel</button></div></section></div>
  </section>
</template>
