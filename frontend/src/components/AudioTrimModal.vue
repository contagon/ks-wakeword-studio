<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{ studioTarget?: { wordId: string; sampleId: string; revision: number; src: string } | null }>();
const emit = defineEmits<{ save: [range: { start: number; end: number }]; close: [] }>();
const studioStart = ref(0);
const studioEnd = ref(1);
watch(() => props.studioTarget, target => {
  if (target) {
    studioStart.value = 0; studioEnd.value = 1;
    void fetch(target.src, { credentials: "same-origin" }).catch(() => undefined);
  }
}, { immediate: true });
function closeStudio(): void { emit("close"); }
function saveStudio(): void { if (Number.isFinite(studioStart.value) && Number.isFinite(studioEnd.value) && studioStart.value >= 0 && studioEnd.value > studioStart.value) emit("save", { start: studioStart.value, end: studioEnd.value }); }
</script>

<template>
  <Teleport to="body"><div class="legacy-scope">
    <div v-if="studioTarget" class="modal-backdrop" @click.self="closeStudio">
      <section class="modal trim-modal" role="dialog" aria-modal="true" aria-label="Trim audio">
        <header class="modal-head"><div><span class="eyebrow">Studio audio editor</span><h2>Trim sample</h2></div><button type="button" class="button ghost" @click="closeStudio">Close</button></header>
        <p class="muted">Trimming is non-destructive: the original audio and provenance remain available.</p>
        <div class="range-grid"><label><span>Start seconds</span><input v-model.number="studioStart" type="range" min="0" :max="Math.max(0, studioEnd - .01)" step=".01"></label><label><span>End seconds</span><input v-model.number="studioEnd" type="range" :min="studioStart + .01" max="60" step=".01"></label></div>
        <div class="row modal-actions"><button type="button" class="button primary" @click="saveStudio">Save trim</button><button type="button" @click="closeStudio">Cancel</button></div>
      </section>
    </div>
  </div></Teleport>
</template>
