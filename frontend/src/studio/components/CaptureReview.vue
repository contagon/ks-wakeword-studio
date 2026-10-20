<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue';
import type { CapturePreview, CaptureSelection } from '../types';

const props = defineProps<{ audio: File; preview: CapturePreview; disabled?: boolean }>();
const emit = defineEmits<{ selection: [value: CaptureSelection | null] }>();
const start = ref(props.preview.start_s); const end = ref(props.preview.end_s);
const method = ref<CaptureSelection['trim_method']>(props.preview.trim_method);
const adjusting = ref(false); const loading = ref(true); const error = ref(''); const playing = ref(false);
const buffer = shallowRef<AudioBuffer | null>(null);
const peaks = ref<number[]>([]);
let context: AudioContext | undefined; let source: AudioBufferSourceNode | undefined; let generation = 0;
const valid = computed(() => Number.isFinite(start.value) && Number.isFinite(end.value) && start.value >= 0 && end.value <= props.preview.duration_s && end.value > start.value && Math.floor(end.value * 16000) > Math.floor(start.value * 16000));
watch([start, end, method], () => emit('selection', valid.value ? { start_s: start.value, end_s: end.value, trim_method: method.value } : null), { immediate: true });
function stopPlayback() { const current = source; source = undefined; if (current) { current.onended = null; current.stop(); current.disconnect(); } playing.value = false; }
function cleanup() { stopPlayback(); void context?.close().catch(() => undefined); context = undefined; }
async function decode() {
  const current = ++generation; cleanup(); loading.value = true; error.value = ''; buffer.value = null;
  try {
    const data = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader(); reader.onload = () => resolve(reader.result as ArrayBuffer); reader.onerror = () => reject(new Error('decode')); reader.readAsArrayBuffer(props.audio);
    });
    if (current !== generation) return;
    context = new AudioContext();
    const decoded = await context.decodeAudioData(data);
    if (current !== generation) return;
    buffer.value = decoded;
    const pcm = decoded.getChannelData(0).subarray(0, Math.floor(props.preview.duration_s * decoded.sampleRate)); const width = 160; const stride = Math.max(1, Math.floor(pcm.length / width));
    peaks.value = Array.from({ length: width }, (_, i) => {
      let peak = 0;
      for (let j = i * stride; j < Math.min((i + 1) * stride, pcm.length); j++) peak = Math.max(peak, Math.abs(pcm[j]!));
      return Math.max(1, peak * 34);
    });
  } catch { if (current === generation) error.value = 'Audio preview could not be decoded in this browser. Your original is retained; retry playback or save the selected bounds.'; }
  finally { if (current === generation) loading.value = false; }
}
async function play() {
  if (playing.value) { stopPlayback(); return; }
  if (!buffer.value || !context || !valid.value) return;
  const current = generation;
  try {
    await context.resume();
    if (current !== generation || !context || !buffer.value) return;
    const node = context.createBufferSource(); node.buffer = buffer.value; node.connect(context.destination);
    source = node; playing.value = true;
    node.onended = () => { if (source === node) { source = undefined; playing.value = false; node.disconnect(); } };
    node.start(0, start.value, Math.min(end.value, buffer.value.duration) - start.value);
  } catch { stopPlayback(); error.value = 'Playback failed. Try again, or save the sample and review it in Samples.'; }
}
function adjust() { stopPlayback(); method.value = 'manual'; }
watch(() => props.audio, () => { void decode(); }, { immediate: true });
watch(() => props.preview, preview => { start.value = preview.start_s; end.value = preview.end_s; method.value = preview.trim_method; adjusting.value = false; });
watch(() => props.disabled, disabled => { if (disabled) stopPlayback(); });
onBeforeUnmount(() => { generation++; cleanup(); });
</script>

<template>
  <div class="studio-capture-review">
    <div class="flex flex-wrap items-center justify-between gap-2"><h2>Review your sample</h2><span class="studio-muted text-xs">{{ method === 'silero' ? 'Auto-trimmed' : method === 'manual' ? 'Manual trim' : 'Full clip' }} · {{ Math.max(0, end - start).toFixed(2) }} s retained</span></div>
    <p v-if="props.preview.duration_limited" class="studio-note" role="status">Training audio is limited to 10 minutes, including any delayed browser stop. Your full original recording is retained when saved.</p>
    <p v-if="props.preview.warning" class="studio-note" role="status">{{ props.preview.warning === 'no_speech' ? 'No speech detected. The full clip is selected; background-noise negatives can still be saved.' : 'Automatic speech trimming is unavailable. The full clip is selected; adjust it manually if needed.' }}</p>
    <p v-if="loading" class="studio-muted" role="status">Preparing waveform…</p>
    <svg v-else-if="buffer" class="studio-capture-wave" viewBox="0 0 640 80" preserveAspectRatio="none" role="img" aria-label="Recorded audio waveform with selected trim region">
      <line v-for="(peak, i) in peaks" :key="i" :x1="i * 4 + 2" :x2="i * 4 + 2" :y1="40 - peak" :y2="40 + peak" stroke="currentColor" stroke-width="2" />
      <rect x="0" y="0" :width="start / props.preview.duration_s * 640" height="80" fill="var(--studio-bg)" opacity=".85" /><rect :x="end / props.preview.duration_s * 640" y="0" :width="(1 - end / props.preview.duration_s) * 640" height="80" fill="var(--studio-bg)" opacity=".85" />
    </svg>
    <p v-if="error" role="alert" class="studio-note">{{ error }} <button type="button" :disabled="loading || props.disabled" @click="decode">Retry preview</button></p>
    <div class="flex flex-wrap gap-2 mb-3"><button type="button" data-action="play-capture" :disabled="!buffer || !valid || props.disabled" @click="play">{{ playing ? 'Stop preview' : '▶ Play trimmed sample' }}</button><button type="button" data-action="adjust-trim" :disabled="props.disabled" :aria-expanded="adjusting" @click="adjusting = !adjusting">Adjust trim</button></div>
    <fieldset v-if="adjusting" class="studio-capture-bounds" :disabled="props.disabled"><legend class="sr-only">Trim selection in seconds</legend><label>Start (seconds)<input v-model.number="start" name="trim-start" type="number" min="0" :max="props.preview.duration_s" step="0.01" @input="adjust"></label><label>End (seconds)<input v-model.number="end" name="trim-end" type="number" min="0" :max="props.preview.duration_s" step="0.01" @input="adjust"></label></fieldset>
    <p v-if="!valid" class="studio-note" role="alert">Choose a start before the end, within the recorded duration.</p>
    <p class="studio-muted text-xs">Only the beginning and end are trimmed. Interior pauses stay intact. Original audio is retained.</p>
  </div>
</template>
