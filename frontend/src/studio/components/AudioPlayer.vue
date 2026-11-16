<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue";
import { wavePeaks } from "../capture";

type AudioContextWindow = Window & { webkitAudioContext?: typeof AudioContext };

const props = defineProps<{ sampleId: string | null; src: string | null; autoplayRequested: boolean }>();
const emit = defineEmits<{ ready: []; ended: []; playbackError: [message: string] }>();
const audio = ref<HTMLAudioElement>();
const waveform = ref<SVGSVGElement>();
const loading = ref(false);
const playing = ref(false);
const waveformReady = ref(false);
const waveformStatus = ref("Waveform preview will appear when audio is ready.");
let controller: AbortController | undefined;
let decodeContext: AudioContext | undefined;
let objectUrl: string | undefined;
let generation = 0;
let frame: number | undefined;
const peaks = ref<number[]>([]);
const duration = ref(0);
const cursor = ref(0);
const closedContexts = new WeakSet<AudioContext>();

function authorized(url: string): boolean {
  try {
    return new URL(url, window.location.origin).origin === window.location.origin;
  } catch {
    return false;
  }
}
function release(): void {
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = undefined;
}
function closeContext(context: AudioContext): void {
  if (closedContexts.has(context)) return;
  closedContexts.add(context);
  void context.close().catch(() => undefined);
}
function closeDecodeContext(): void {
  const context = decodeContext;
  decodeContext = undefined;
  if (context) closeContext(context);
}
function clearWaveform(): void {
  peaks.value = [];
  duration.value = 0;
  waveformReady.value = false;
  waveformStatus.value = "Waveform preview will appear when audio is ready.";
}
/** Follow the audio clock every frame while playing, like the Trim page's playhead. */
function track(): void {
  cursor.value = audio.value?.currentTime ?? 0;
  frame = playing.value ? requestAnimationFrame(track) : undefined;
}
watch(playing, (now) => {
  if (frame != null) cancelAnimationFrame(frame);
  frame = undefined;
  if (now) track();
  else cursor.value = audio.value?.currentTime ?? 0;
});
function seek(event: PointerEvent): void {
  const element = audio.value;
  if (!element || !duration.value || event.button !== 0) return;
  const rect = waveform.value!.getBoundingClientRect();
  element.currentTime = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)) * duration.value;
  cursor.value = element.currentTime;
}
function stop(): void {
  const element = audio.value;
  if (element) {
    element.pause();
    element.currentTime = 0;
  }
  playing.value = false;
  cursor.value = 0;
}
function createDecodeContext(): AudioContext | null {
  const Constructor = window.AudioContext ?? (window as AudioContextWindow).webkitAudioContext;
  if (!Constructor) return null;
  try {
    return new Constructor();
  } catch {
    return null;
  }
}
async function decodeWaveform(data: ArrayBuffer, current: number, request: AbortController): Promise<void> {
  const context = createDecodeContext();
  if (!context) {
    if (!request.signal.aborted && current === generation)
      waveformStatus.value = "Waveform preview is unavailable in this browser.";
    return;
  }
  decodeContext = context;
  try {
    const buffer = await context.decodeAudioData(data);
    if (request.signal.aborted || current !== generation || decodeContext !== context) return;
    peaks.value = wavePeaks(buffer.getChannelData(0));
    duration.value = buffer.duration;
    waveformReady.value = true;
    waveformStatus.value = "Waveform preview ready. The orange line shows playback progress.";
  } catch {
    if (!request.signal.aborted && current === generation && decodeContext === context)
      waveformStatus.value = "Waveform preview could not be decoded.";
  } finally {
    if (decodeContext === context) decodeContext = undefined;
    closeContext(context);
  }
}
async function play(): Promise<void> {
  const element = audio.value;
  if (!element || !element.src) return;
  try {
    await element.play();
    playing.value = true;
  } catch {
    playing.value = false;
    emit("playbackError", "Playback was blocked or unavailable. Use Play to try again.");
  }
}
function pause(): void {
  audio.value?.pause();
  playing.value = false;
}
function toggle(): void {
  if (playing.value) pause();
  else void play();
}
function replay(): void {
  if (audio.value) audio.value.currentTime = 0;
  void play();
}
async function load(): Promise<void> {
  generation += 1;
  const current = generation;
  controller?.abort();
  controller = undefined;
  closeDecodeContext();
  stop();
  release();
  clearWaveform();
  if (!props.sampleId || !props.src || !authorized(props.src)) return;
  const request = new AbortController();
  controller = request;
  loading.value = true;
  try {
    const response = await fetch(props.src, { credentials: "same-origin", signal: request.signal });
    if (!response.ok) throw new Error("Audio could not be loaded.");
    const blob = await response.blob();
    if (request.signal.aborted || current !== generation) return;
    objectUrl = URL.createObjectURL(blob);
    if (audio.value) audio.value.src = objectUrl;
    void blob
      .arrayBuffer()
      .then((data) => decodeWaveform(data, current, request))
      .catch(() => {
        if (!request.signal.aborted && current === generation)
          waveformStatus.value = "Waveform preview could not be decoded.";
      });
    emit("ready");
    if (props.autoplayRequested) await play();
  } catch (cause) {
    if (!request.signal.aborted && current === generation)
      emit("playbackError", cause instanceof Error ? cause.message : "Audio could not be loaded.");
  } finally {
    if (current === generation) loading.value = false;
  }
}
watch(
  () => [props.sampleId, props.src] as const,
  () => {
    void load();
  },
  { immediate: true },
);
onBeforeUnmount(() => {
  generation += 1;
  if (frame != null) cancelAnimationFrame(frame);
  controller?.abort();
  closeDecodeContext();
  stop();
  release();
  clearWaveform();
});
defineExpose({ play, pause, toggle, replay, stop });
</script>

<template>
  <div class="studio-audio" :aria-busy="loading">
    <audio
      ref="audio"
      data-audio-player
      preload="metadata"
      @ended="
        playing = false;
        emit('ended');
      "
      @pause="playing = false"
      @play="playing = true"
    />
    <!-- The same waveform as the Trim page's editor, without the trim handles. Click to seek. -->
    <svg
      ref="waveform"
      class="studio-capture-wave studio-play-wave"
      data-waveform
      :data-ready="waveformReady"
      viewBox="0 0 640 80"
      preserveAspectRatio="none"
      role="img"
      aria-label="Audio waveform with playback progress"
      @pointerdown.prevent="seek"
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
      <line
        v-if="duration"
        :x1="(Math.min(cursor, duration) / duration) * 640"
        :x2="(Math.min(cursor, duration) / duration) * 640"
        y1="0"
        y2="80"
        stroke="var(--studio-warning, #ff9134)"
        stroke-width="2"
        pointer-events="none"
      />
    </svg>
    <div v-if="duration" class="flex w-full justify-between studio-muted text-xs">
      <span>0.00 s</span><span data-playhead>Cursor {{ cursor.toFixed(2) }} s</span>
      <span>{{ duration.toFixed(2) }} s</span>
    </div>
    <p data-waveform-status :class="waveformReady ? 'sr-only' : 'studio-muted text-xs w-full'" aria-live="polite">
      {{ waveformStatus }}
    </p>
    <button
      type="button"
      class="studio-primary"
      :disabled="!sampleId || loading"
      :aria-label="playing ? 'Pause audio' : 'Play audio'"
      @click="playing ? pause() : play()"
    >
      {{ loading ? "Loading audio…" : playing ? "Pause" : "Play" }}
    </button>
    <button
      type="button"
      data-action="replay"
      :disabled="!sampleId || loading"
      aria-label="Replay audio"
      @click="replay"
    >
      Replay
    </button>
  </div>
</template>
