<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from "vue";

type AudioContextWindow = Window & { webkitAudioContext?: typeof AudioContext };

const props = defineProps<{ sampleId: string | null; src: string | null; autoplayRequested: boolean }>();
const emit = defineEmits<{ ready: []; ended: []; playbackError: [message: string] }>();
const audio = ref<HTMLAudioElement>();
const canvas = ref<HTMLCanvasElement>();
const loading = ref(false);
const playing = ref(false);
const waveformReady = ref(false);
const waveformStatus = ref("Waveform preview will appear when audio is ready.");
let controller: AbortController | undefined;
let decodeContext: AudioContext | undefined;
let objectUrl: string | undefined;
let generation = 0;
let peaks: number[] = [];
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
  const hadPeaks = peaks.length > 0;
  peaks = [];
  waveformReady.value = false;
  waveformStatus.value = "Waveform preview will appear when audio is ready.";
  const target = canvas.value;
  const context = hadPeaks ? target?.getContext("2d") : null;
  if (target && context) context.clearRect(0, 0, target.width, target.height);
}
function stop(): void {
  const element = audio.value;
  if (element) {
    element.pause();
    element.currentTime = 0;
  }
  playing.value = false;
  drawWaveform();
}
function drawWaveform(): void {
  const target = canvas.value;
  if (!target || !peaks.length) return;
  const context = target.getContext("2d");
  if (!context) return;
  const width = 240;
  const height = 44;
  target.width = width;
  target.height = height;
  context.clearRect(0, 0, width, height);
  // Bars use the canvas CSS colour so they read in both themes.
  context.fillStyle = getComputedStyle(target).color || "#649c80";
  const barWidth = width / peaks.length;
  peaks.forEach((peak, index) => {
    const barHeight = Math.max(2, peak * (height - 8));
    context.fillRect(index * barWidth, (height - barHeight) / 2, Math.max(1, barWidth - 1), barHeight);
  });
  const element = audio.value;
  const duration = element?.duration;
  const progress =
    duration && Number.isFinite(duration) && duration > 0
      ? Math.min(1, Math.max(0, (element?.currentTime ?? 0) / duration))
      : 0;
  context.fillStyle = "#ff9134";
  context.fillRect(Math.min(width - 1, progress * width), 0, 2, height);
}
function makePeaks(buffer: AudioBuffer, count = 60): number[] {
  const samples = buffer.getChannelData(0);
  const step = Math.max(1, Math.ceil(samples.length / count));
  const values: number[] = [];
  for (let start = 0; start < samples.length; start += step) {
    let maximum = 0;
    for (let index = start; index < Math.min(start + step, samples.length); index += 1)
      maximum = Math.max(maximum, Math.abs(samples[index] ?? 0));
    values.push(maximum);
  }
  return values.length ? values : [0];
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
    peaks = makePeaks(buffer);
    waveformReady.value = true;
    waveformStatus.value = "Waveform preview ready. The orange line shows playback progress.";
    await nextTick();
    if (!request.signal.aborted && current === generation && decodeContext === context) drawWaveform();
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
  drawWaveform();
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
        drawWaveform();
        emit('ended');
      "
      @pause="
        playing = false;
        drawWaveform();
      "
      @play="
        playing = true;
        drawWaveform();
      "
      @timeupdate="drawWaveform"
      @loadedmetadata="drawWaveform"
    />
    <canvas
      ref="canvas"
      class="studio-waveform"
      data-waveform
      :data-ready="waveformReady"
      role="img"
      aria-label="Audio waveform with playback progress"
      width="240"
      height="44"
    />
    <p data-waveform-status class="studio-muted text-xs" aria-live="polite">{{ waveformStatus }}</p>
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
