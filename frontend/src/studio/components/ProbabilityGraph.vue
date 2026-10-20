<script setup lang="ts">
import { computed, useId } from 'vue';
const props = defineProps<{ samples: { seconds: number; probability: number }[]; threshold: number }>();
const clip = `probability-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
const y = (probability: number) => Number((24 + (1 - probability) * 180).toFixed(3));
const end = computed(() => props.samples.at(-1)?.seconds ?? 0);
const points = computed(() => props.samples.filter(sample => sample.seconds >= end.value - 8).map(sample => `${48 + (sample.seconds - end.value + 8) / 8 * 700},${y(sample.probability)}`).join(' '));
</script>

<template>
  <svg viewBox="0 0 780 260" role="img" aria-label="Live detection probability over the last eight seconds, with a dashed threshold and red trace above threshold" class="probability-graph">
    <defs><clipPath :id="clip"><rect x="48" y="24" width="700" :height="Math.max(0, y(threshold) - 24)" /></clipPath></defs>
    <g v-for="tick in [0, .25, .5, .75, 1]" :key="tick">
      <line x1="48" x2="748" :y1="y(tick)" :y2="y(tick)" class="grid-line" />
      <text x="37" :y="y(tick) + 4" text-anchor="end">{{ tick.toFixed(2) }}</text>
    </g>
    <line data-threshold-line x1="48" x2="748" :y1="y(threshold)" :y2="y(threshold)" stroke="#c18b26" stroke-width="2" stroke-dasharray="7 5" />
    <polyline :points="points" fill="none" stroke="#3898d5" stroke-width="2.5" stroke-linejoin="round" />
    <polyline data-red-trace :points="points" :clip-path="`url(#${clip})`" fill="none" stroke="#e05260" stroke-width="2.5" stroke-linejoin="round" />
    <text x="48" y="226">−8s</text><text x="398" y="226" text-anchor="middle">−4s</text><text x="748" y="226" text-anchor="end">now</text>
    <text x="48" y="250">Y: probability</text><text x="748" y="250" text-anchor="end">X: time → newest</text>
  </svg>
</template>

<style scoped>
.probability-graph { width: 100%; display: block; background: var(--studio-bg); border: 1px solid var(--studio-border); border-radius: 8px; }
.grid-line { stroke: var(--studio-border); stroke-width: 1; }
text { fill: var(--studio-muted); font: 12px system-ui, sans-serif; }
</style>
