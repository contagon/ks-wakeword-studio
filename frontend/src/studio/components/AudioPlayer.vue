<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue";

const props = defineProps<{ sampleId: string | null; src: string | null; autoplayRequested: boolean }>();
const emit = defineEmits<{ ready: []; ended: []; playbackError: [message: string] }>();
const audio = ref<HTMLAudioElement>();
const loading = ref(false);
const playing = ref(false);
let controller: AbortController | undefined;
let objectUrl: string | undefined;
let generation = 0;

function authorized(url: string): boolean {
  try { return new URL(url, window.location.origin).origin === window.location.origin; } catch { return false; }
}
function release(): void {
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = undefined;
}
function stop(): void {
  const element = audio.value;
  if (element) { element.pause(); element.currentTime = 0; }
  playing.value = false;
}
async function play(): Promise<void> {
  const element = audio.value;
  if (!element || !element.src) return;
  try { await element.play(); playing.value = true; }
  catch { playing.value = false; emit("playbackError", "Playback was blocked or unavailable. Use Play to try again."); }
}
function pause(): void { audio.value?.pause(); playing.value = false; }
function toggle(): void { if (playing.value) pause(); else void play(); }
function replay(): void { if (audio.value) audio.value.currentTime = 0; void play(); }
async function load(): Promise<void> {
  generation += 1;
  const current = generation;
  controller?.abort(); controller = undefined;
  stop(); release();
  if (!props.sampleId || !props.src || !authorized(props.src)) return;
  const request = new AbortController(); controller = request; loading.value = true;
  try {
    const response = await fetch(props.src, { credentials: "same-origin", signal: request.signal });
    if (!response.ok) throw new Error("Audio could not be loaded.");
    const blob = await response.blob();
    if (request.signal.aborted || current !== generation) return;
    objectUrl = URL.createObjectURL(blob);
    if (audio.value) audio.value.src = objectUrl;
    emit("ready");
    if (props.autoplayRequested) await play();
  } catch (cause) {
    if (!request.signal.aborted && current === generation) emit("playbackError", cause instanceof Error ? cause.message : "Audio could not be loaded.");
  } finally { if (current === generation) loading.value = false; }
}
watch(() => [props.sampleId, props.src] as const, () => { void load(); }, { immediate: true });
onBeforeUnmount(() => { generation += 1; controller?.abort(); stop(); release(); });
defineExpose({ play, pause, toggle, replay, stop });
</script>

<template>
  <div class="studio-audio" :aria-busy="loading">
    <audio ref="audio" data-audio-player preload="metadata" @ended="playing = false; emit('ended')" @pause="playing = false" @play="playing = true" />
    <button type="button" class="studio-primary" :disabled="!sampleId || loading" :aria-label="playing ? 'Pause audio' : 'Play audio'" @click="playing ? pause() : play()">{{ loading ? "Loading audio…" : playing ? "Pause" : "Play" }}</button>
    <button type="button" data-action="replay" :disabled="!sampleId || loading" aria-label="Replay audio" @click="replay">Replay</button>
  </div>
</template>
