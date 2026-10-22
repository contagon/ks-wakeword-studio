<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';
import CaptureReview from './CaptureReview.vue';
import type { CapturePreview, CaptureSelection } from '../types';

const props = defineProps<{ src: string | null; disabled?: boolean }>();
const emit = defineEmits<{ save: [range: { start: number; end: number }]; close: [] }>();
const audio = ref<File | null>(null);
const preview = ref<CapturePreview | null>(null);
const selection = ref<CaptureSelection | null>(null);
const error = ref('');
let request: AbortController | undefined;

/** Seconds of 16 kHz mono PCM in the WAV data chunk: the bound the server enforces. */
function wavDuration(bytes: ArrayBuffer): number {
  const view = new DataView(bytes);
  const tag = (offset: number) => String.fromCharCode(...new Uint8Array(bytes, offset, 4));
  if (bytes.byteLength < 12 || tag(0) !== 'RIFF' || tag(8) !== 'WAVE') throw new Error('Not a WAV file');
  for (let offset = 12; offset + 8 <= bytes.byteLength; offset += 8 + view.getUint32(offset + 4, true) + (view.getUint32(offset + 4, true) % 2)) {
    if (tag(offset) === 'data') return Math.min(view.getUint32(offset + 4, true), bytes.byteLength - offset - 8) / 2 / 16000;
  }
  throw new Error('WAV has no audio data');
}

async function load(src: string): Promise<void> {
  const controller = new AbortController(); request = controller;
  try {
    const response = await fetch(src, { credentials: 'same-origin', signal: controller.signal });
    if (!response.ok) throw new Error('Audio unavailable');
    const blob = await response.blob();
    const duration = wavDuration(await blob.arrayBuffer());
    if (controller.signal.aborted) return;
    audio.value = new File([blob], 'sample.wav', { type: 'audio/wav' });
    preview.value = { start_s: 0, end_s: duration, duration_s: duration, trim_method: 'none', warning: null };
  } catch {
    if (!controller.signal.aborted) error.value = 'Sample audio could not be loaded. Close and try again.';
  }
}
function close(): void { if (!props.disabled) emit('close'); }
function save(): void { if (selection.value && !props.disabled) emit('save', { start: selection.value.start_s, end: selection.value.end_s }); }
function onKeydown(event: KeyboardEvent): void { if (event.key === 'Escape' && props.src) { event.preventDefault(); close(); } }

watch(() => props.src, src => {
  request?.abort(); audio.value = null; preview.value = null; selection.value = null; error.value = '';
  if (src) void load(src);
}, { immediate: true });
document.addEventListener('keydown', onKeydown);
onBeforeUnmount(() => { request?.abort(); document.removeEventListener('keydown', onKeydown); });
</script>

<template>
  <div v-if="src" class="studio-modal-backdrop" @click.self="close">
    <section class="studio-card" role="dialog" aria-modal="true" aria-label="Trim audio">
      <p v-if="error" class="studio-note" role="alert">{{ error }}</p>
      <p v-else-if="!audio || !preview" class="studio-muted" role="status">Loading sample audio…</p>
      <CaptureReview v-else :audio="audio" :preview="preview" :disabled="disabled" title="Trim sample" @selection="selection = $event" />
      <div class="flex flex-wrap justify-end gap-2">
        <button type="button" :disabled="disabled" @click="close">Cancel</button>
        <button type="button" class="studio-primary" data-action="save-trim" :disabled="disabled || !selection" :aria-busy="disabled" @click="save">Save trim</button>
      </div>
    </section>
  </div>
</template>
