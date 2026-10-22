<script setup lang="ts">
const label = defineModel<"positive" | "negative">({ required: true });
defineProps<{ groupLabel: string; disabled?: boolean; attribute?: string }>();
</script>

<template>
  <div class="studio-capture-label" role="group" :aria-label="groupLabel">
    <button
      v-for="value in ['positive', 'negative'] as const"
      :key="value"
      type="button"
      v-bind="{ [attribute ?? 'data-label']: value }"
      :aria-pressed="label === value"
      :class="{ 'studio-primary': label === value }"
      :disabled="disabled"
      @click="label = value"
    >
      {{ value === "positive" ? "Positive" : "Negative" }}
    </button>
  </div>
</template>
