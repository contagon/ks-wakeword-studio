<script setup lang="ts">
import { onBeforeUnmount } from 'vue';
import { createThemeController } from '../theme';
const { dark, toggle, dispose } = createThemeController();
onBeforeUnmount(dispose);
</script>
<template><button type="button" aria-label="Dark mode" :aria-pressed="dark" @click="toggle">{{ dark ? '☀ Light mode' : '☾ Dark mode' }}</button></template>
