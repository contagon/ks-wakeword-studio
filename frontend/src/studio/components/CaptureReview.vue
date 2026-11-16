<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef, watch } from "vue";
import { wavePeaks } from "../capture";
import type { CapturePreview, CaptureSelection } from "../types";

const props = withDefaults(
  defineProps<{
    audio: File;
    preview: CapturePreview;
    disabled?: boolean;
    title?: string;
    fullClipLabel?: string;
    interactive?: boolean;
    maxDuration?: number;
  }>(),
  { title: "Review your sample", fullClipLabel: "Full clip" },
);
const emit = defineEmits<{ selection: [value: CaptureSelection | null]; ready: [] }>();
const start = ref(props.preview.start_s);
const end = ref(props.preview.end_s);
const method = ref<CaptureSelection["trim_method"]>(props.preview.trim_method);
const adjusting = ref(false);
const loading = ref(true);
const error = ref("");
const playing = ref(false);
const buffer = shallowRef<AudioBuffer | null>(null);
const peaks = ref<number[]>([]);
const waveform = ref<SVGSVGElement>();
const playhead = ref(0);
let context: AudioContext | undefined;
let source: AudioBufferSourceNode | undefined;
let generation = 0;
let playbackGeneration = 0;
let playbackOffset = 0,
  playbackStarted = 0,
  playbackEnd = 0;
let frame: number | undefined;
let dragging: { edge: "start" | "end"; pointerId: number } | undefined;
const validBounds = computed(
  () =>
    Number.isFinite(start.value) &&
    Number.isFinite(end.value) &&
    start.value >= 0 &&
    end.value <= props.preview.duration_s &&
    end.value > start.value &&
    Math.floor(end.value * 16000) > Math.floor(start.value * 16000),
);
const withinDuration = computed(
  () =>
    props.maxDuration == null ||
    Math.floor(end.value * 16000) - Math.floor(start.value * 16000) <= Math.floor(props.maxDuration * 16000),
);
const valid = computed(() => validBounds.value && withinDuration.value);
watch(
  [start, end, method, () => props.maxDuration],
  () => emit("selection", valid.value ? { start_s: start.value, end_s: end.value, trim_method: method.value } : null),
  { immediate: true },
);
function position(): number {
  return playing.value && context
    ? Math.min(playbackEnd, playbackOffset + context.currentTime - playbackStarted)
    : playhead.value;
}
function stopPlayback() {
  playbackGeneration++;
  if (props.interactive) playhead.value = position();
  if (frame != null) cancelAnimationFrame(frame);
  frame = undefined;
  const current = source;
  source = undefined;
  if (current) {
    current.onended = null;
    current.stop();
    current.disconnect();
  }
  playing.value = false;
}
function cleanup() {
  stopPlayback();
  void context?.close().catch(() => undefined);
  context = undefined;
}
async function decode() {
  const current = ++generation;
  cleanup();
  loading.value = true;
  error.value = "";
  buffer.value = null;
  try {
    const data = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error("decode"));
      reader.readAsArrayBuffer(props.audio);
    });
    if (current !== generation) return;
    context = new AudioContext();
    const decoded = await context.decodeAudioData(data);
    if (current !== generation) return;
    buffer.value = decoded;
    peaks.value = wavePeaks(
      decoded.getChannelData(0).subarray(0, Math.floor(props.preview.duration_s * decoded.sampleRate)),
    );
    emit("ready");
  } catch {
    if (current === generation)
      error.value =
        "Audio preview could not be decoded in this browser. Your original is retained; retry playback or save the selected bounds.";
  } finally {
    if (current === generation) loading.value = false;
  }
}
function animate() {
  playhead.value = position();
  if (playing.value) frame = requestAnimationFrame(animate);
}
async function playRange(from: number, to: number) {
  if (!buffer.value || !context || props.disabled || !(from < to)) return;
  stopPlayback();
  playhead.value = from;
  const current = generation;
  const attempt = playbackGeneration;
  try {
    await context.resume();
    if (current !== generation || attempt !== playbackGeneration || !context || !buffer.value || props.disabled) return;
    const node = context.createBufferSource();
    node.buffer = buffer.value;
    node.connect(context.destination);
    source = node;
    playbackOffset = from;
    playbackStarted = context.currentTime;
    playbackEnd = Math.min(to, buffer.value.duration);
    playing.value = true;
    node.onended = () => {
      if (source === node) {
        source = undefined;
        playing.value = false;
        playhead.value = playbackEnd;
        if (frame != null) cancelAnimationFrame(frame);
        frame = undefined;
        node.disconnect();
      }
    };
    node.start(0, from, playbackEnd - from);
    if (props.interactive) animate();
  } catch {
    stopPlayback();
    error.value = "Playback failed. Try again, or save the sample and review it in Samples.";
  }
}
function play() {
  if (!props.interactive && playing.value) {
    stopPlayback();
    return;
  }
  if (!validBounds.value) return;
  void playRange(start.value, end.value);
}
function playOriginal() {
  void playRange(0, props.preview.duration_s);
}
function toggle() {
  if (props.disabled) return;
  if (playing.value) {
    stopPlayback();
    return;
  }
  if (!validBounds.value) return;
  const from = start.value;
  const to = end.value;
  const cursor = playhead.value;
  void playRange(cursor >= from && cursor < to ? cursor : from, to);
}
function adjust() {
  stopPlayback();
  method.value = "manual";
}
function setEdge(edge: "start" | "end", value: number) {
  if (props.disabled || !Number.isFinite(value)) return;
  adjust();
  const minimum = edge === "start" ? 0 : (Number.isFinite(start.value) ? start.value : 0) + 1 / 16000;
  const maximum =
    edge === "end"
      ? props.preview.duration_s
      : (Number.isFinite(end.value) ? end.value : props.preview.duration_s) - 1 / 16000;
  const bounded = Math.max(minimum, Math.min(maximum, Math.round(value * 100) / 100));
  if (edge === "start") start.value = bounded;
  else end.value = bounded;
}
function markStart() {
  setEdge("start", position());
}
function markEnd() {
  setEdge("end", position());
}
function edgeKey(event: KeyboardEvent, edge: "start" | "end") {
  if (event.ctrlKey || event.altKey || event.metaKey) return;
  const value = edge === "start" ? start.value : end.value;
  const step = event.shiftKey ? 0.1 : 0.01;
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? props.preview.duration_s
        : event.key === "ArrowLeft"
          ? Math.round((value - step) * 1e6) / 1e6
          : event.key === "ArrowRight"
            ? Math.round((value + step) * 1e6) / 1e6
            : null;
  if (next == null) return;
  event.preventDefault();
  event.stopPropagation();
  setEdge(edge, next);
}
function seek(value: number) {
  if (props.disabled) return;
  const resume = playing.value;
  stopPlayback();
  playhead.value = Math.max(0, Math.min(props.preview.duration_s, value));
  if (resume) void playRange(playhead.value, props.preview.duration_s);
}
function pointerPosition(event: MouseEvent): number {
  const rect = waveform.value!.getBoundingClientRect();
  return ((event.clientX - rect.left) / rect.width) * props.preview.duration_s;
}
function doubleClick(event: MouseEvent) {
  if (!props.interactive || props.disabled || (event.target as Element).closest('[role="slider"]')) return;
  setEdge("start", pointerPosition(event));
}
function pointerDown(event: PointerEvent, edge?: "start" | "end") {
  if (!props.interactive || props.disabled || event.button !== 0) return;
  event.preventDefault();
  event.stopPropagation();
  if (edge) {
    dragging = { edge, pointerId: event.pointerId };
    (event.currentTarget as SVGElement).focus();
    waveform.value?.setPointerCapture?.(event.pointerId);
  } else {
    waveform.value?.focus();
    seek(pointerPosition(event));
  }
}
function pointerMove(event: PointerEvent) {
  if (dragging && dragging.pointerId === event.pointerId) setEdge(dragging.edge, pointerPosition(event));
}
function pointerUp(event: PointerEvent) {
  if (dragging?.pointerId === event.pointerId) dragging = undefined;
}
function seekKey(event: KeyboardEvent) {
  if (event.target !== waveform.value || event.ctrlKey || event.altKey || event.metaKey) return;
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  const step = event.shiftKey ? 0.5 : 0.1;
  seek(
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? props.preview.duration_s
        : position() + (event.key === "ArrowLeft" ? -step : step),
  );
}
defineExpose({
  play,
  playOriginal,
  toggle,
  markStart,
  markEnd,
  canPlay: computed(() => Boolean(buffer.value) && valid.value && !props.disabled),
});
watch(
  () => props.audio,
  () => {
    void decode();
  },
  { immediate: true },
);
watch(
  () => props.preview,
  (preview) => {
    start.value = preview.start_s;
    end.value = preview.end_s;
    method.value = preview.trim_method;
    adjusting.value = false;
    stopPlayback();
    playhead.value = 0;
  },
);
watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) stopPlayback();
  },
);
onBeforeUnmount(() => {
  generation++;
  cleanup();
});
</script>

<template>
  <div class="studio-capture-review">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2>{{ props.title }}</h2>
      <span class="studio-muted text-xs"
        >{{ method === "silero" ? "Auto-trimmed" : method === "manual" ? "Manual trim" : props.fullClipLabel }} ·
        {{ Math.max(0, end - start).toFixed(2) }} s retained</span
      >
    </div>
    <p v-if="props.preview.duration_limited" class="studio-note" role="status">
      Training audio is limited to 10 minutes, including any delayed browser stop. Your full original recording is
      retained when saved.
    </p>
    <p v-if="props.preview.warning" class="studio-note studio-note-warning" role="status">
      {{
        props.preview.warning === "no_speech"
          ? "No speech detected. The full clip is selected; background-noise negatives can still be saved."
          : "Automatic speech trimming is unavailable. The full clip is selected; adjust it manually if needed."
      }}
    </p>
    <p v-if="loading" class="studio-muted" role="status">Preparing waveform…</p>
    <svg
      v-else-if="buffer"
      ref="waveform"
      class="studio-capture-wave"
      :class="{ 'studio-trim-wave': interactive }"
      viewBox="0 0 640 80"
      preserveAspectRatio="none"
      :role="interactive ? 'group' : 'img'"
      :tabindex="interactive ? 0 : undefined"
      aria-label="Recorded audio waveform with selected trim region"
      @pointerdown="pointerDown($event)"
      @pointermove="pointerMove"
      @pointerup="pointerUp"
      @pointercancel="pointerUp"
      @lostpointercapture="pointerUp"
      @dblclick.prevent="doubleClick"
      @keydown="seekKey"
    >
      <line
        v-for="(peak, i) in peaks"
        :key="i"
        :x1="i * 4 + 2"
        :x2="i * 4 + 2"
        :y1="40 - peak"
        :y2="40 + peak"
        stroke="currentColor"
        stroke-width="2"
      />
      <rect
        x="0"
        y="0"
        :width="(start / props.preview.duration_s) * 640"
        height="80"
        fill="var(--studio-bg)"
        opacity=".85"
      />
      <rect
        :x="(end / props.preview.duration_s) * 640"
        y="0"
        :width="(1 - end / props.preview.duration_s) * 640"
        height="80"
        fill="var(--studio-bg)"
        opacity=".85"
      />
      <template v-if="interactive && validBounds">
        <line
          :x1="(playhead / props.preview.duration_s) * 640"
          :x2="(playhead / props.preview.duration_s) * 640"
          y1="0"
          y2="80"
          stroke="var(--studio-warning, #ff9134)"
          stroke-width="2"
          pointer-events="none"
        />
        <g v-for="edge in ['start', 'end'] as const" :key="edge">
          <rect
            class="studio-trim-handle"
            :x="Math.max(0, Math.min(626, ((edge === 'start' ? start : end) / props.preview.duration_s) * 640 - 7))"
            y="0"
            width="14"
            height="80"
            rx="3"
            role="slider"
            :tabindex="disabled ? -1 : 0"
            :aria-disabled="disabled || undefined"
            :aria-label="edge === 'start' ? 'Trim start' : 'Trim end'"
            :aria-valuemin="edge === 'start' ? 0 : start + 1 / 16000"
            :aria-valuemax="edge === 'start' ? end - 1 / 16000 : props.preview.duration_s"
            :aria-valuenow="edge === 'start' ? start : end"
            :aria-valuetext="`${(edge === 'start' ? start : end).toFixed(2)} seconds`"
            @pointerdown="pointerDown($event, edge)"
            @keydown="edgeKey($event, edge)"
          />
        </g>
      </template>
    </svg>
    <div v-if="interactive" class="flex justify-between studio-muted text-xs mb-3">
      <span>0.00 s</span><span data-playhead>Cursor {{ playhead.toFixed(2) }} s</span>
      <span>{{ props.preview.duration_s.toFixed(2) }} s</span>
    </div>
    <p v-if="error" role="alert" class="studio-note">
      {{ error }} <button type="button" :disabled="loading || props.disabled" @click="decode">Retry preview</button>
    </p>
    <!-- Keep mouse clicks from stealing shortcut focus; Tab/Enter still activate buttons normally. -->
    <div class="flex flex-wrap gap-2 mb-3" @pointerdown="interactive && $event.preventDefault()">
      <button
        type="button"
        data-action="play-capture"
        aria-keyshortcuts="Space"
        :disabled="!buffer || !validBounds || props.disabled"
        @click="play"
      >
        {{ interactive ? "▶ Play selection" : playing ? "Stop preview" : "▶ Play trimmed sample" }}</button
      ><button
        v-if="interactive"
        type="button"
        data-action="play-original"
        :disabled="!buffer || props.disabled"
        @click="playOriginal"
      >
        ▶ Play original</button
      ><button
        v-if="interactive"
        type="button"
        data-action="toggle-playback"
        :disabled="!buffer || props.disabled"
        @click="toggle"
      >
        {{ playing ? "Pause" : "Resume" }} (Space)</button
      ><button
        v-if="!interactive"
        type="button"
        data-action="adjust-trim"
        :disabled="props.disabled"
        :aria-expanded="adjusting"
        @click="adjusting = !adjusting"
      >
        Adjust trim
      </button>
    </div>
    <fieldset v-if="adjusting || interactive" class="studio-capture-bounds" :disabled="props.disabled">
      <legend class="sr-only">Trim selection in seconds</legend>
      <label
        >Start (seconds)<input
          v-model.number="start"
          name="trim-start"
          type="number"
          min="0"
          :max="props.preview.duration_s"
          step="0.01"
          @input="adjust" /></label
      ><label
        >End (seconds)<input
          v-model.number="end"
          name="trim-end"
          type="number"
          min="0"
          :max="props.preview.duration_s"
          step="0.01"
          @input="adjust"
      /></label>
    </fieldset>
    <p v-if="!validBounds" class="studio-note" role="alert">
      Choose a start before the end, within the recorded duration.
    </p>
    <p
      v-if="maxDuration != null"
      class="studio-muted text-sm"
      :class="{ 'studio-note': !withinDuration }"
      :role="!withinDuration ? 'alert' : undefined"
    >
      Keep at most {{ maxDuration.toFixed(2) }} seconds, including padding.
    </p>
    <p v-if="interactive" class="studio-muted text-xs">
      Click to seek · Double-click to set start · Drag an edge or focus it and use ←/→ (0.01 s), Shift+←/→ (0.1 s) · [
      start · ] end · R replay selection
    </p>
    <p class="studio-muted text-xs">
      Only the beginning and end are trimmed. Interior pauses stay intact. Original audio is retained.
    </p>
  </div>
</template>
