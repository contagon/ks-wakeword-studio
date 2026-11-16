<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue";
import CaptureReview from "./CaptureReview.vue";
import type { CapturePreview, CaptureSelection } from "../types";

const props = defineProps<{
  src: string | null;
  disabled?: boolean;
  trimStart?: number | null;
  trimEnd?: number | null;
  interactive?: boolean;
  maxDuration?: number;
}>();
const emit = defineEmits<{ selection: [value: CaptureSelection | null]; ready: [] }>();
const audio = ref<File | null>(null);
const preview = ref<CapturePreview | null>(null);
const error = ref("");
const review = ref<InstanceType<typeof CaptureReview>>();
let request: AbortController | undefined;

/** Seconds of 16 kHz mono PCM in the WAV data chunk: the bound the server enforces. */
function wavDuration(bytes: ArrayBuffer): number {
  const view = new DataView(bytes);
  const tag = (offset: number) => String.fromCharCode(...new Uint8Array(bytes, offset, 4));
  if (bytes.byteLength < 12 || tag(0) !== "RIFF" || tag(8) !== "WAVE") throw new Error("Not a WAV file");
  for (
    let offset = 12;
    offset + 8 <= bytes.byteLength;
    offset += 8 + view.getUint32(offset + 4, true) + (view.getUint32(offset + 4, true) % 2)
  ) {
    if (tag(offset) === "data")
      return Math.min(view.getUint32(offset + 4, true), bytes.byteLength - offset - 8) / 2 / 16000;
  }
  throw new Error("WAV has no audio data");
}
async function load(): Promise<void> {
  request?.abort();
  const src = props.src;
  const controller = new AbortController();
  request = controller;
  audio.value = null;
  preview.value = null;
  error.value = "";
  emit("selection", null);
  if (!src) return;
  try {
    const response = await fetch(src, { credentials: "same-origin", signal: controller.signal });
    if (!response.ok) throw new Error("Audio unavailable");
    const blob = await response.blob();
    const duration = wavDuration(await blob.arrayBuffer());
    if (controller.signal.aborted) return;
    audio.value = new File([blob], "sample.wav", { type: "audio/wav" });
    preview.value = {
      start_s: props.trimStart ?? 0,
      end_s: props.trimEnd ?? duration,
      duration_s: duration,
      trim_method: "none",
      warning: null,
    };
  } catch {
    if (!controller.signal.aborted) error.value = "Sample audio could not be loaded.";
  }
}
watch(
  () => [props.src, props.trimStart, props.trimEnd],
  () => void load(),
  { immediate: true },
);
onBeforeUnmount(() => request?.abort());
defineExpose({
  playOriginal: () => review.value?.playOriginal(),
  playSelection: () => review.value?.play(),
  toggle: () => review.value?.toggle(),
  markStart: () => review.value?.markStart(),
  markEnd: () => review.value?.markEnd(),
});
</script>

<template>
  <div>
    <p v-if="preview" class="studio-note">
      Full clip: {{ preview.duration_s.toFixed(2) }} s. The full original waveform is shown; adjust either edge of the
      selection.
      <span v-if="trimStart != null && trimEnd != null">
        Current trim: {{ trimStart.toFixed(2) }}–{{ trimEnd.toFixed(2) }} s.
      </span>
    </p>
    <p v-if="error" class="studio-note" role="alert">
      {{ error }}
      <button type="button" data-action="retry-audio" :disabled="disabled" @click="load">Retry audio</button>
    </p>
    <p v-else-if="!audio || !preview" class="studio-muted" role="status">Loading sample audio…</p>
    <CaptureReview
      v-else
      ref="review"
      :audio="audio"
      :preview="preview"
      :disabled="disabled"
      :interactive="interactive"
      :max-duration="maxDuration"
      title="Trim sample"
      :full-clip-label="trimStart != null ? 'Current trim' : undefined"
      @selection="emit('selection', $event)"
      @ready="emit('ready')"
    />
  </div>
</template>
