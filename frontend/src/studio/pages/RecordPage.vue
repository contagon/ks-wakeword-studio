<script setup lang="ts">
import PageHeader from "../components/PageHeader.vue";
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";
import { studioApi } from "../api";
import { shortcutTarget } from "../shortcuts";
import { useMicrophoneCapture } from "../capture";
import CaptureReview from "../components/CaptureReview.vue";
import { useWorkspace } from "../workspace";
import type { CapturePreview, CaptureSelection } from "../types";

const workspace = useWorkspace();
const capture = useMicrophoneCapture();
const { state, audio, elapsed } = capture;
const label = ref<"positive" | "negative">("positive");
const preview = shallowRef<CapturePreview | null>(null);
const selection = ref<CaptureSelection | null>(null);
const error = ref("");
const status = ref("");
const analyzing = ref(false);
const saving = ref(false);
const uploading = ref(false);
const importFile = shallowRef<File | null>(null);
const importLabel = ref<"positive" | "negative">("positive");
const uploadInput = ref<HTMLInputElement>();
let generation = 0;
let analysisRequest: AbortController | undefined;
let saveRequest: AbortController | undefined;
let uploadRequest: AbortController | undefined;
const busy = computed(
  () =>
    analyzing.value || saving.value || uploading.value || state.value === "requesting" || state.value === "stopping",
);
const canStart = computed(() => Boolean(workspace.selectedId.value) && !busy.value && !audio.value);
const reviewing = computed(() => Boolean(audio.value) && !analyzing.value && state.value !== "recording");
const review = ref<InstanceType<typeof CaptureReview>>();
const timer = computed(
  () => `${String(Math.floor(elapsed.value / 60)).padStart(2, "0")}:${String(elapsed.value % 60).padStart(2, "0")}`,
);
function reset() {
  generation++;
  analysisRequest?.abort();
  saveRequest?.abort();
  capture.reset();
  preview.value = null;
  selection.value = null;
  analyzing.value = false;
  saving.value = false;
  error.value = "";
}
async function toggle() {
  if (state.value === "recording") {
    capture.stop();
    return;
  }
  if (!canStart.value) return;
  status.value = "";
  error.value = "";
  await capture.start();
}
async function analyze() {
  if (!audio.value || analyzing.value) return;
  analysisRequest?.abort();
  const controller = new AbortController();
  analysisRequest = controller;
  const current = generation;
  const word = workspace.selectedId.value;
  analyzing.value = true;
  error.value = "";
  try {
    const result = await studioApi.previewCapture(word, audio.value, controller.signal);
    if (current !== generation || controller.signal.aborted) return;
    preview.value = result;
    selection.value = { start_s: result.start_s, end_s: result.end_s, trim_method: result.trim_method };
  } catch (cause) {
    if (current === generation && !controller.signal.aborted)
      error.value =
        cause instanceof Error ? cause.message : "Recording analysis failed. Retry without recording again.";
  } finally {
    if (current === generation) analyzing.value = false;
  }
}
async function saveCapture() {
  if (!audio.value || !selection.value || busy.value) return;
  const current = generation;
  const controller = new AbortController();
  saveRequest = controller;
  saving.value = true;
  error.value = "";
  try {
    await studioApi.saveCapture(
      workspace.selectedId.value,
      audio.value,
      label.value,
      { ...selection.value },
      controller.signal,
    );
    if (current !== generation || controller.signal.aborted) return;
    reset();
    status.value = "Sample saved. Ready for the next recording.";
  } catch (cause) {
    if (current === generation && !controller.signal.aborted)
      error.value = cause instanceof Error ? cause.message : "Sample was not saved. Try again.";
  } finally {
    if (current === generation) saving.value = false;
  }
}
async function importAudio() {
  if (!importFile.value || !workspace.selectedId.value || busy.value || state.value === "recording") return;
  const current = generation;
  const controller = new AbortController();
  uploadRequest = controller;
  uploading.value = true;
  error.value = "";
  status.value = "";
  try {
    await studioApi.importAudio(workspace.selectedId.value, importFile.value, importLabel.value, controller.signal);
    if (current !== generation || controller.signal.aborted) return;
    importFile.value = null;
    if (uploadInput.value) uploadInput.value.value = "";
    status.value = "Imported audio.";
  } catch (cause) {
    if (current === generation && !controller.signal.aborted)
      error.value = cause instanceof Error ? cause.message : "Audio was not uploaded. Try again.";
  } finally {
    if (current === generation) uploading.value = false;
  }
}
function onKeydown(event: KeyboardEvent) {
  if (event.repeat || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey || event.defaultPrevented)
    return;
  const { typing, onControl } = shortcutTarget(event);
  if (typing || document.querySelector('[role="dialog"],[aria-modal="true"],dialog[open]')) return;
  // Space and Enter activate focused controls natively; letter shortcuts work regardless of button focus.
  const key = event.key.toLowerCase();
  if (reviewing.value) {
    if (event.code === "Space" && !onControl) {
      event.preventDefault();
      if (review.value?.canPlay) void review.value.play();
    } else if ((key === "k" || (key === "enter" && !onControl)) && preview.value && selection.value && !busy.value) {
      event.preventDefault();
      void saveCapture();
    } else if (key === "d" && !busy.value) {
      event.preventDefault();
      reset();
    }
    return;
  }
  if (event.code === "Space" && !onControl && (state.value === "recording" || canStart.value)) {
    event.preventDefault();
    void toggle();
  }
}
watch(audio, (file) => {
  if (file) void analyze();
});
watch(workspace.selectedId, () => {
  reset();
  uploadRequest?.abort();
  uploading.value = false;
  importFile.value = null;
  if (uploadInput.value) uploadInput.value.value = "";
  status.value = "";
});
onMounted(() => document.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKeydown);
  reset();
  uploadRequest?.abort();
});
</script>

<template>
  <section>
    <PageHeader title="Manual" description="Upload audio or record from your browser to the selected wakeword.">
      <a :href="workspace.routes.href('samples')" @click.prevent="workspace.routes.navigate('samples')"
        >View samples →</a
      >
    </PageHeader>
    <p v-if="!workspace.selectedId.value" class="studio-note">
      Select or create a wakeword to record or upload samples.
    </p>
    <p v-if="status" class="studio-note" role="status" aria-live="polite">{{ status }}</p>
    <p v-if="error || capture.error.value" class="studio-note" role="alert">{{ error || capture.error.value }}</p>
    <section class="studio-card mb-4">
      <h2>Upload audio</h2>
      <p class="studio-muted mb-3">
        Uploads keep their own label and import provenance. Adjust trims later in Samples.
      </p>
      <form data-form="import" class="flex flex-wrap gap-3 items-end" @submit.prevent="importAudio">
        <label class="flex-1"
          >Audio<input
            ref="uploadInput"
            name="import-file"
            type="file"
            accept="audio/*"
            required
            :disabled="uploading"
            @change="importFile = ($event.target as HTMLInputElement).files?.[0] ?? null" /></label
        ><label
          >Sample label<select name="import-label" v-model="importLabel" :disabled="uploading">
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
          </select></label
        ><button
          type="submit"
          class="studio-primary"
          :aria-busy="uploading"
          :disabled="!workspace.selectedId.value || !importFile || busy || state === 'recording'"
        >
          {{ uploading ? "Uploading…" : "Upload audio" }}
        </button>
      </form>
    </section>
    <section class="studio-card" :aria-busy="analyzing || saving">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2>Microphone recording</h2>
          <p class="studio-muted">One recording, one sample. You decide when to stop.</p>
        </div>
        <div class="studio-capture-label" role="group" aria-label="Recording sample label">
          <button
            v-for="value in ['positive', 'negative'] as const"
            :key="value"
            type="button"
            :data-label="value"
            :aria-pressed="label === value"
            :class="{ 'studio-primary': label === value }"
            :disabled="saving"
            @click="label = value"
          >
            {{ value === "positive" ? "Positive" : "Negative" }}
          </button>
        </div>
      </div>
      <div class="studio-capture-area">
        <div class="studio-muted" role="status">
          {{
            state === "recording"
              ? "Recording…"
              : state === "requesting"
                ? "Waiting for microphone permission…"
                : state === "stopping"
                  ? "Finishing recording…"
                  : audio
                    ? "Recording ready for review"
                    : "Ready · browser’s current microphone"
          }}
        </div>
        <div class="studio-capture-timer">{{ timer }}</div>
        <button
          type="button"
          data-action="record-toggle"
          :class="state === 'recording' ? 'studio-danger' : 'studio-primary'"
          :disabled="state !== 'recording' && !canStart"
          aria-keyshortcuts="Space"
          @click="toggle"
        >
          {{ state === "recording" ? "■ Stop recording" : "● Start recording" }}
        </button>
        <p class="studio-muted text-xs mt-3">
          <kbd>Space</kbd> to start / stop · shortcut pauses while typing or using another control
        </p>
        <p class="studio-muted text-xs mt-2">
          Microphone access requires HTTPS or localhost. Maximum recording length: 10 minutes.
        </p>
      </div>
      <p v-if="analyzing" class="studio-note mt-3" role="status">Finding speech and trimming silence…</p>
      <div v-if="audio && !analyzing" class="mt-4">
        <CaptureReview
          v-if="preview"
          ref="review"
          :audio="audio"
          :preview="preview"
          :disabled="saving"
          @selection="selection = $event"
        />
        <div class="flex flex-wrap items-center justify-end gap-2 mt-3">
          <button v-if="!preview" type="button" data-action="retry-analysis" @click="analyze">Retry analysis</button
          ><button type="button" data-action="retake" aria-keyshortcuts="D" :disabled="busy" @click="reset">
            Retake</button
          ><button
            v-if="preview"
            type="button"
            data-action="save-capture"
            class="studio-primary"
            aria-keyshortcuts="K Enter"
            :aria-busy="saving"
            :disabled="busy || !selection"
            @click="saveCapture"
          >
            {{ saving ? "Saving…" : "Save sample" }}
          </button>
        </div>
        <p class="studio-muted text-xs mt-2 text-right">
          <kbd>Space</kbd> play / stop · <kbd>K</kbd> or <kbd>Enter</kbd> keep · <kbd>D</kbd> discard
        </p>
      </div>
      <p class="studio-muted text-xs mt-4">
        VAD trims leading and trailing silence with a small safety margin. No speech detected? Keep the full clip,
        especially for negative background-noise samples.
      </p>
    </section>
    <p class="studio-muted text-xs mt-3">
      Recordings and uploads appear alongside collected data in Samples, with distinct source metadata.
    </p>
  </section>
</template>
