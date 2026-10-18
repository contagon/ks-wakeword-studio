<script lang="ts">
import type { Sample } from "../types";
let persistedUndo: Array<{ word: string; sample: Sample }> = [];
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { studioApi } from "../api";
import AudioPlayer from "../components/AudioPlayer.vue";
import { useWorkspace } from "../workspace";
import type { Recording } from "../types";

const workspace = useWorkspace();
const sessionSkips = new Map<string, Set<string>>();
const queue = ref<Sample[]>([]);
const unmapped = ref<Recording[]>([]);
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
const discardOpen = ref(false);
const kind = ref("");
const player = ref<InstanceType<typeof AudioPlayer>>();
let request: AbortController | undefined;
let mutation: AbortController | undefined;
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
  invalidateAssignment();
  request?.abort(); const controller = new AbortController(); request = controller; const current = ++generation; const word = workspace.selectedId.value;
  reset(); if (!word) return; loading.value = true;
  try {
    const [page, unmappedPage] = await Promise.all([pendingWindow(word, controller), studioApi.unmapped({ limit: 20 }, controller.signal)]);
    if (controller.signal.aborted || current !== generation || workspace.selectedId.value !== word) return;
    queue.value = page.items; total.value = page.total; unmapped.value = unmappedPage.items;
  } catch (cause) { if (!controller.signal.aborted && current === generation) error.value = cause instanceof Error ? cause.message : "Queue could not be loaded."; }
  finally { if (!controller.signal.aborted && current === generation) loading.value = false; }
}
function next(): void { player.value?.stop(); position.value = Math.min(position.value + 1, Math.max(0, visible.value.length - 1)); autoplayNext.value = hasGesture.value; }
function removeCurrent(): void { const item = active.value; if (!item) return; queue.value = queue.value.filter(candidate => candidate.id !== item.id); total.value = Math.max(0, total.value - 1); position.value = Math.min(position.value, Math.max(0, visible.value.length - 1)); player.value?.stop(); autoplayNext.value = hasGesture.value; void refill(); }
async function conflict(item: Sample): Promise<void> {
  try {
    const latest = await studioApi.sample(item.word_id, item.id);
    if (latest.label !== "pending") { removeCurrent(); return; }
    queue.value = queue.value.map(candidate => candidate.id === item.id ? latest : candidate);
  } catch { /* The original safe error remains visible. */ }
}
async function label(label: "positive" | "negative" | "discarded"): Promise<void> {
  const item = active.value; if (!item || saving.value || discardOpen.value) return;
  hasGesture.value = true; saving.value = true; error.value = ""; const controller = new AbortController(); mutation?.abort(); mutation = controller;
  try {
    const updated = await studioApi.label(item.word_id, item.id, label, item.revision, controller.signal);
    if (controller.signal.aborted || active.value?.id !== item.id) return;
    persistedUndo.push({ word: item.word_id, sample: updated }); reviewedCount.value += 1; notice.value = `Saved ${label} label.`; removeCurrent();
  } catch (cause) {
    if (!controller.signal.aborted) {
      if (cause instanceof Error && cause.message.includes("conflict")) { error.value = "This recording changed elsewhere. Review the latest version before saving."; await conflict(item); }
      else error.value = "Label was not saved. Try again; this recording remains in the queue.";
    }
  } finally { if (mutation === controller) saving.value = false; }
}
function skip(): void { const item = active.value; if (!item || saving.value || loading.value) return; hasGesture.value = true; skipped.value = new Set([...skipped.value, item.id]); sessionSkips.set(item.word_id, skipped.value); position.value = Math.min(position.value, Math.max(0, visible.value.length - 1)); player.value?.stop(); autoplayNext.value = false; notice.value = "Skipped for this session; this recording remains pending."; void refill(); }
async function undo(): Promise<void> {
  if (saving.value || !persistedUndo.length) return; hasGesture.value = true; saving.value = true; error.value = ""; const action = persistedUndo[persistedUndo.length - 1]; const controller = new AbortController(); mutation?.abort(); mutation = controller;
  try {
    const restored = await studioApi.undo(action.word, action.sample.id, action.sample.revision, controller.signal);
    if (controller.signal.aborted) return; persistedUndo.pop(); notice.value = "Last label restored to pending.";
    if (workspace.selectedId.value === action.word) { queue.value = [restored, ...queue.value.filter(item => item.id !== restored.id)]; total.value += 1; reviewedCount.value = Math.max(0, reviewedCount.value - 1); position.value = 0; autoplayNext.value = false; }
  } catch { if (!controller.signal.aborted) error.value = "Undo was not saved. Refresh and try again."; }
  finally { if (mutation === controller) saving.value = false; }
}
async function assign(recording: Recording): Promise<void> {
  const word = workspace.selectedId.value;
  if (saving.value || !word) return;
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
  } catch {
    if (!controller.signal.aborted && assignment === controller && current === assignmentGeneration && workspace.selectedId.value === word) error.value = "Recording could not be assigned.";
  } finally {
    if (assignment === controller) { assignment = undefined; saving.value = false; }
  }
}
function editing(event: KeyboardEvent): boolean { const target = event.target instanceof HTMLElement ? event.target : document.activeElement; return target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(target.tagName)); }
function shortcut(event: KeyboardEvent): void {
  if (event.repeat || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey || editing(event)) return;
  const key = event.key.toLowerCase();
  if (discardOpen.value) { if (event.key === "Escape") { event.preventDefault(); discardOpen.value = false; } return; }
  if (key === "d") { event.preventDefault(); if (active.value && !saving.value) discardOpen.value = true; return; }
  if (!["p", "n", " ", "r", "s", "z"].includes(key)) return;
  event.preventDefault(); hasGesture.value = true;
  if (key === "p") void label("positive"); else if (key === "n") void label("negative"); else if (key === " ") player.value?.toggle(); else if (key === "r") player.value?.replay(); else if (key === "s") skip(); else void undo();
}
watch(workspace.selectedId, () => { void load(); }, { immediate: true });
watch(kind, () => { void load(); });
onMounted(() => document.addEventListener("keydown", shortcut));
onBeforeUnmount(() => { document.removeEventListener("keydown", shortcut); request?.abort(); mutation?.abort(); invalidateAssignment(); player.value?.stop(); });
</script>

<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4"><div><h1>Classify</h1><p class="studio-muted">Rapid review stays pending until the server acknowledges each label.</p></div><span data-progress class="studio-muted">{{ total }} pending · {{ reviewed }} reviewed · {{ skipped.size }} skipped</span></div>
    <div class="studio-card flex flex-wrap gap-3 mb-4"><label>Recording type<select name="kind" v-model="kind"><option value="">All pending</option><option value="true">Near misses</option><option value="false">Activations</option></select></label><span class="studio-muted text-xs">Press Space once to enable playback; then acknowledged labels play the next clip.</span></div>
    <p v-if="notice" class="studio-note" role="status" aria-live="polite">{{ notice }}</p><p v-if="error" data-classify-error class="studio-note" role="alert" aria-live="assertive">{{ error }}</p>
    <div v-if="loading" class="studio-card" aria-busy="true">Loading review queue…</div>
    <div v-else-if="active" data-classify-current :data-sample-id="active.id" class="studio-card grid gap-4">
      <div class="flex flex-wrap justify-between gap-3"><div><h2>Recording {{ active.recording?.clip_id ?? active.id }}</h2><p class="studio-muted text-sm">{{ active.recording?.device_id ?? active.source }} · {{ active.recording?.near_miss ? "Near miss" : "Activation" }} · {{ active.recording?.timestamp ?? active.created_at }}</p></div><span class="studio-muted">Revision {{ active.revision }}</span></div>
      <AudioPlayer ref="player" :sample-id="active.id" :src="source" :autoplay-requested="autoplayNext" @ready="autoplayNext = false" @playback-error="error = $event" />
      <div class="flex flex-wrap gap-2"><button type="button" class="studio-primary" :disabled="saving" @click="label('positive')">Positive (P)</button><button type="button" :disabled="saving" @click="label('negative')">Negative (N)</button><button type="button" :disabled="saving" @click="skip">Skip (S)</button><button type="button" :disabled="saving" data-action="discard" @click="discardOpen = true">Discard (D)</button><button type="button" :disabled="saving || !persistedUndo.length" @click="undo">Undo (Z)</button></div>
      <p data-shortcuts class="studio-muted text-xs">P positive · N negative · Space play/pause · R replay · S skip for this session · Z undo.</p><input name="search" type="search" aria-label="Queue search" placeholder="Shortcuts pause while editing">
    </div><div v-else class="studio-card"><span v-if="total === 0">No pending recordings for this workspace.</span><span v-else>Pending recordings are skipped for this session or the local window needs reloading.</span><button v-if="total > 0" type="button" @click="refill">Retry pending window</button></div>
    <section v-if="unmapped.length" class="studio-card mt-4"><h2>Unmapped recordings</h2><p class="studio-muted">Assign each recording explicitly; nothing is guessed or dropped.</p><article v-for="recording in unmapped" :key="recording.id" :data-unmapped-id="recording.id" class="flex flex-wrap justify-between gap-3 py-2"><span>{{ recording.phrase }} · {{ recording.device_id }}</span><button type="button" data-action="assign" :disabled="saving" @click="assign(recording)">Assign to this wakeword</button></article></section>
    <div v-if="discardOpen" class="studio-modal-backdrop"><section data-dialog="discard" class="studio-card" role="dialog" aria-modal="true" aria-label="Confirm discard"><h2>Discard this recording?</h2><p>Discarding preserves its source tombstone so future collection does not reintroduce it.</p><div class="flex gap-2"><button type="button" data-action="confirm-discard" class="studio-primary" :disabled="saving" @click="discardOpen = false; label('discarded')">Discard recording</button><button type="button" @click="discardOpen = false">Cancel</button></div></section></div>
  </section>
</template>
