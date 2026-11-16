<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import PageHeader from "../components/PageHeader.vue";
import SampleTrimEditor from "../components/SampleTrimEditor.vue";
import { StudioApiError, studioApi } from "../api";
import { useDeviceRegistry } from "../devices";
import { useJobQueue } from "../jobs";
import { shortcutTarget } from "../shortcuts";
import { absoluteTime } from "../time";
import type { CaptureSelection, Sample } from "../types";
import { useWorkspace } from "../workspace";

const workspace = useWorkspace();
const jobs = useJobQueue();
const registry = useDeviceRegistry();
const items = ref<Sample[]>([]);
const total = ref(0);
const loading = ref(false);
const saving = ref(false);
const error = ref("");
const notice = ref("");
const conflict = ref<"save" | "undo" | null>(null);
const selection = ref<CaptureSelection | null>(null);
const editor = ref<InstanceType<typeof SampleTrimEditor>>();
const skippedByWord = reactive(new Map<string, Set<string>>());
const historyByWord = reactive(new Map<string, Sample[]>());
const skipped = computed(() => {
  const word = workspace.selectedId.value;
  if (!skippedByWord.has(word)) skippedByWord.set(word, new Set());
  return skippedByWord.get(word)!;
});
const history = computed(() => {
  const word = workspace.selectedId.value;
  if (!historyByWord.has(word)) historyByWord.set(word, []);
  return historyByWord.get(word)!;
});
const active = computed(() => items.value.find((item) => !skipped.value.has(item.id)) ?? null);
const canSave = computed(() =>
  Boolean(active.value && selection.value && !saving.value && !loading.value && !conflict.value),
);
let request: AbortController | undefined;
let mutation: AbortController | undefined;
let autoplayNext = false;
let refreshPending = false;

async function loadWindow(): Promise<void> {
  request?.abort();
  const controller = new AbortController();
  request = controller;
  const word = workspace.selectedId.value;
  items.value = [];
  selection.value = null;
  refreshPending = false;
  if (!word) return;
  loading.value = true;
  try {
    let offset = 0;
    while (true) {
      const page = await studioApi.samples(
        word,
        { trim_status: "needs_review", offset, limit: 100 },
        controller.signal,
      );
      if (controller.signal.aborted || workspace.selectedId.value !== word) return;
      total.value = page.total;
      const eligible = page.items.filter((item) => !skipped.value.has(item.id));
      offset += page.items.length;
      if (eligible.length || !page.items.length || offset >= page.total) {
        items.value = eligible;
        return;
      }
    }
  } catch {
    if (!controller.signal.aborted) error.value = "Trim queue could not be loaded. Retry to continue.";
  } finally {
    if (request === controller) loading.value = false;
  }
}
async function advance(): Promise<void> {
  if (refreshPending || !active.value) await loadWindow();
}
function ready(): void {
  if (autoplayNext) {
    autoplayNext = false;
    editor.value?.playOriginal();
  }
}
async function save(): Promise<void> {
  const item = active.value,
    range = selection.value;
  if (!canSave.value || !item || !range) return;
  const controller = new AbortController();
  mutation = controller;
  saving.value = true;
  error.value = "";
  try {
    const updated = await studioApi.trim(
      item.word_id,
      item.id,
      range.start_s,
      range.end_s,
      item.revision,
      controller.signal,
    );
    if (controller.signal.aborted || workspace.selectedId.value !== item.word_id) return;
    history.value.push(updated);
    selection.value = null;
    autoplayNext = true;
    items.value = items.value.filter((candidate) => candidate.id !== item.id);
    total.value = Math.max(0, total.value - 1);
    notice.value = "Trim saved. Original audio retained.";
    await advance();
  } catch (cause) {
    if (!controller.signal.aborted) {
      conflict.value = cause instanceof StudioApiError && cause.status === 409 ? "save" : null;
      error.value = conflict.value
        ? "This sample changed elsewhere. Your selection is retained; review the latest version before saving again."
        : "Trim was not saved. Your selection is retained; try again.";
    }
  } finally {
    if (mutation === controller) saving.value = false;
  }
}
async function skip(): Promise<void> {
  const item = active.value;
  if (!item || loading.value || saving.value) return;
  skipped.value.add(item.id);
  autoplayNext = false;
  selection.value = null;
  error.value = "";
  conflict.value = null;
  notice.value = "Skipped for this session; this sample still needs trim review.";
  await advance();
}
async function undo(): Promise<void> {
  const previous = history.value.at(-1);
  if (!previous || saving.value || loading.value || conflict.value) return;
  const controller = new AbortController();
  mutation = controller;
  saving.value = true;
  autoplayNext = false;
  error.value = "";
  try {
    const restored = await studioApi.undo(previous.word_id, previous.id, previous.revision, controller.signal);
    if (controller.signal.aborted || workspace.selectedId.value !== previous.word_id) return;
    history.value.pop();
    skipped.value.delete(restored.id);
    selection.value = null;
    items.value = [restored, ...items.value.filter((item) => item.id !== restored.id)];
    total.value += 1;
    notice.value = "Last trim undone. Review the restored sample.";
  } catch (cause) {
    if (!controller.signal.aborted) {
      conflict.value = cause instanceof StudioApiError && cause.status === 409 ? "undo" : null;
      error.value = conflict.value
        ? "The last trimmed sample changed elsewhere. Nothing was undone; review the latest queue to continue."
        : "Undo was not saved. Try again.";
    }
  } finally {
    if (mutation === controller) saving.value = false;
  }
}
function reviewLatest(): void {
  if (saving.value || loading.value) return;
  if (conflict.value === "undo") history.value.length = 0;
  conflict.value = null;
  error.value = "";
  notice.value = "Latest queue loaded. Review the selection before saving.";
  autoplayNext = false;
  void loadWindow();
}
function reviewSkipped(): void {
  skipped.value.clear();
  error.value = "";
  autoplayNext = false;
  void loadWindow();
}
function shortcut(event: KeyboardEvent): void {
  const key = event.key.toLowerCase();
  const target = event.target instanceof Element ? event.target : null;
  const trimField = target?.closest("[data-trim-current]") && target.matches('[name="trim-start"],[name="trim-end"]');
  const { typing, onControl } = shortcutTarget(event);
  if (
    jobs.open.value ||
    event.isComposing ||
    event.repeat ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    event.shiftKey
  )
    return;
  if (typing && !(trimField && (key === "enter" || key === " "))) return;
  if (onControl && (key === "enter" || (key === " " && !target?.closest("[data-trim-page]")))) return;
  if (![" ", "r", "[", "]", "enter", "s", "z"].includes(key)) return;
  event.preventDefault();
  if (saving.value || loading.value) return;
  if (key === "enter") void save();
  else if (key === "s") void skip();
  else if (key === "z") void undo();
  else if (key === " ") editor.value?.toggle();
  else if (key === "r") editor.value?.playSelection();
  else if (key === "[") editor.value?.markStart();
  else editor.value?.markEnd();
}
watch(
  () => active.value?.id,
  () => {
    selection.value = null;
  },
  { flush: "sync" },
);
watch(
  workspace.selectedId,
  () => {
    request?.abort();
    mutation?.abort();
    mutation = undefined;
    saving.value = false;
    loading.value = false;
    total.value = 0;
    autoplayNext = false;
    conflict.value = null;
    error.value = "";
    notice.value = "";
    void loadWindow();
  },
  { immediate: true },
);
jobs.onFinished(
  (job) => job.word_id === workspace.selectedId.value && job.kind === "classify",
  () => {
    if (active.value || saving.value) refreshPending = true;
    else void loadWindow();
  },
);
onMounted(() => {
  void registry.load();
  document.addEventListener("keydown", shortcut);
});
onBeforeUnmount(() => {
  request?.abort();
  mutation?.abort();
  document.removeEventListener("keydown", shortcut);
});
</script>

<template>
  <section data-trim-page>
    <PageHeader title="Trim" description="Work through samples that need trim review, one at a time.">
      <span data-progress class="studio-muted">{{ total }} remaining · {{ skipped.size }} skipped</span>
    </PageHeader>
    <p class="studio-note">
      Keep the complete wake phrase with a little padding. These samples stay excluded from training until reviewed.
    </p>
    <p v-if="notice" class="studio-note" role="status" aria-live="polite">{{ notice }}</p>
    <p v-if="error" data-trim-error class="studio-note" role="alert">
      {{ error }}
      <button
        v-if="conflict"
        type="button"
        data-action="review-latest"
        :disabled="saving || loading"
        @click="reviewLatest"
      >
        Review latest version (resets unsaved selection)
      </button>
    </p>
    <div v-if="loading" class="studio-card" aria-busy="true">Loading trim queue…</div>
    <div v-else-if="active" data-trim-current :data-sample-id="active.id" class="studio-card grid gap-4">
      <div>
        <h2>Recording {{ active.recording?.clip_id ?? active.id }}</h2>
        <p class="studio-muted text-sm">
          {{ active.recording ? registry.deviceLabel(active.recording.device_id) : active.source }} ·
          {{ active.recording?.near_miss ? "Near miss" : "Activation" }} ·
          {{ absoluteTime(active.recording?.timestamp ?? active.created_at) }}
        </p>
      </div>
      <SampleTrimEditor
        :key="`${active.id}:${active.revision}`"
        ref="editor"
        :src="studioApi.trimAudioUrl(active.word_id, active.id)"
        :trim-start="active.trim_start_s"
        :trim-end="active.trim_end_s"
        :disabled="saving"
        interactive
        :max-duration="2.9"
        @selection="selection = $event"
        @ready="ready"
      />
      <p class="studio-muted text-xs">
        Space play/pause selection · R replay selection · Enter save &amp; next · S skip · Z undo. After a saved trim,
        the next original plays automatically.
      </p>
    </div>
    <div v-else-if="!loading" class="studio-card">
      <p v-if="!workspace.selectedId.value">Select a wakeword to review trims.</p>
      <p v-else-if="error">The trim queue is unavailable.</p>
      <p v-else-if="total > 0">Remaining samples are skipped for this session.</p>
      <p v-else>No samples need trim review for this workspace.</p>
      <button v-if="skipped.size" type="button" data-action="review-skipped" @click="reviewSkipped">
        Review skipped samples
      </button>
      <button
        v-if="workspace.selectedId.value && (!skipped.size || error)"
        type="button"
        data-action="refresh-trim"
        @click="reviewLatest"
      >
        {{ error ? "Retry queue" : "Refresh queue" }}
      </button>
    </div>
    <!-- Preserve shortcut focus after mouse actions without changing keyboard button activation. -->
    <div class="flex flex-wrap justify-end gap-2 mt-4" @pointerdown.prevent>
      <button v-if="active" type="button" data-action="skip-trim" :disabled="saving || loading" @click="skip">
        Skip (S)
      </button>
      <button
        type="button"
        data-action="undo-trim"
        :disabled="!history.length || saving || loading || Boolean(conflict)"
        @click="undo"
      >
        Undo last trim (Z)
      </button>
      <button
        v-if="active"
        type="button"
        class="studio-primary"
        data-action="save-trim"
        :disabled="!canSave"
        :aria-busy="saving"
        @click="save"
      >
        {{ saving ? "Saving…" : "Save & next ↵" }}
      </button>
    </div>
  </section>
</template>
