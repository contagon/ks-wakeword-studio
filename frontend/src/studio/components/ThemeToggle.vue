<script setup lang="ts">
import { onBeforeUnmount } from "vue";
import { createThemeController } from "../theme";
const { dark, toggle, dispose } = createThemeController();
onBeforeUnmount(dispose);
</script>
<template>
  <button type="button" aria-label="Dark mode" :aria-pressed="dark" @click="toggle">
    <span aria-hidden="true">{{ dark ? "☀" : "☾" }}</span>
    <span class="studio-header-label">{{ dark ? "Light mode" : "Dark mode" }}</span>
  </button>
</template>
