<script setup lang="ts">
defineProps<{ title: string; description?: string }>();
</script>

<template>
  <header class="studio-page-header">
    <div class="studio-page-title">
      <h1>{{ title }}</h1>
      <p v-if="description" class="studio-muted">{{ description }}</p>
    </div>
    <div v-if="$slots.default" class="studio-page-actions"><slot /></div>
  </header>
</template>
