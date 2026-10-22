<script setup lang="ts">
import { onBeforeUnmount } from "vue";
import { createThemeController } from "../theme";
const { dark, toggle, dispose } = createThemeController();
onBeforeUnmount(dispose);
</script>
<template>
  <!-- A toggle: the name stays "Dark mode" and aria-pressed (plus the selected style) shows whether it is on. -->
  <button type="button" :aria-pressed="dark" :class="{ 'studio-selected': dark }" @click="toggle">
    <span aria-hidden="true">☾</span>
    <span class="studio-header-label">Dark mode</span>
  </button>
</template>
