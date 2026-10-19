<script setup lang="ts">
import type { ScheduleInput } from '../types';
const schedule = defineModel<ScheduleInput>({ required: true });
defineProps<{ prefix: string }>();
</script>
<template>
  <div class="grid gap-3 sm:grid-cols-2 mt-3">
    <label>Schedule (five-field cron)<input v-model="schedule.cron" :name="`${prefix}-cron`" required placeholder="*/30 * * * *" maxlength="256"></label>
    <label>Time zone<input v-model="schedule.timezone" :name="`${prefix}-timezone`" required placeholder="UTC" maxlength="100"></label>
  </div>
</template>
