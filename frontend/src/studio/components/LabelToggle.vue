<script setup lang="ts" generic="T extends string">
const label = defineModel<T>({ required: true });
defineProps<{ groupLabel: string; disabled?: boolean; attribute?: string; values?: readonly T[] }>();
const NAMES: Record<string, string> = { positive: "Positive", negative: "Negative", discarded: "Discard" };
</script>

<template>
  <div class="studio-capture-label" role="group" :aria-label="groupLabel">
    <button
      v-for="value in values ?? (['positive', 'negative'] as unknown as T[])"
      :key="value"
      type="button"
      v-bind="{ [attribute ?? 'data-label']: value }"
      :aria-pressed="label === value"
      :class="{ 'studio-primary': label === value }"
      :disabled="disabled"
      @click="label = value"
    >
      {{ NAMES[value] ?? value }}
    </button>
  </div>
</template>
