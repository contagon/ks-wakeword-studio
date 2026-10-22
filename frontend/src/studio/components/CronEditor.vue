<script setup lang="ts">
import { absoluteTime } from '../time';
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { studioApi } from "../api";
import type { Schedule } from "../types";

const props = defineProps<{ scope: string; schedule: Schedule | null }>();
const emit = defineEmits<{ saved: [Schedule] }>();
const cron = ref("");
const timezone = ref("UTC");
const enabled = ref(true);
const current = ref<Schedule | null>(null);
const saving = ref(false);
const error = ref("");
let request: AbortController | undefined;
const title = computed(() => props.scope === "scrape" ? "Global scrape schedule" : "Training schedule for this wakeword");
function set(schedule: Schedule | null): void { current.value = schedule; cron.value = schedule?.cron ?? "0 2 * * *"; timezone.value = schedule?.timezone ?? "UTC"; enabled.value = schedule?.enabled ?? false; }
watch(() => props.schedule, set, { immediate: true });
async function save(): Promise<void> {
  request?.abort(); const controller = new AbortController(); request = controller; saving.value = true; error.value = "";
  try { const schedule = await studioApi.saveSchedule(props.scope, { cron: cron.value, timezone: timezone.value, enabled: enabled.value }, controller.signal); if (!controller.signal.aborted && request === controller) { set(schedule); emit("saved", schedule); } }
  catch (cause) { if (!controller.signal.aborted && request === controller) error.value = cause instanceof Error ? cause.message : "Schedule was not saved."; }
  finally { if (request === controller) saving.value = false; }
}
onBeforeUnmount(() => request?.abort());
</script>

<template>
  <section class="studio-card" data-cron-editor :data-scope="scope"><h2>{{ title }}</h2><p class="studio-muted">Standard five-field cron with explicit IANA timezone. The next run below is calculated and validated by the server.</p><form class="studio-schedule-row mt-3" @submit.prevent="save"><label>Cron<input v-model="cron" name="cron" required pattern="\S+(\s+\S+){4}"></label><label>IANA timezone<input v-model="timezone" name="timezone" required></label><label class="studio-checkbox-label"><input v-model="enabled" name="enabled" type="checkbox"> Enabled</label><button type="submit" class="studio-primary" :disabled="saving">{{ saving ? 'Validating…' : 'Save schedule' }}</button></form><p v-if="current" class="studio-muted mt-3">Schedule timezone: {{ current.timezone }} · Next run (your local time): <strong>{{ absoluteTime(current.next_run_at) }}</strong></p><p v-else class="studio-muted mt-3">No schedule saved. UTC is the default timezone.</p><p v-if="error" role="alert" class="studio-note">{{ error }}</p></section>
</template>
