<script setup lang="ts">
import { absoluteTime } from "../time";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useDeviceRegistry } from "../devices";
const registry = useDeviceRegistry();
onMounted(() => {
  void registry.load();
});
import { studioApi } from "../api";
import type { CollectionRun } from "../types";
import PaginatedTable from "./PaginatedTable.vue";
const props = defineProps<{ refreshKey?: string; activeRunId?: string }>();
const runs = ref<CollectionRun[]>([]),
  error = ref(""),
  loading = ref(false),
  total = ref(0),
  offset = ref(0);
let request: AbortController | undefined;
async function load() {
  request?.abort();
  const controller = new AbortController();
  request = controller;
  loading.value = true;
  error.value = "";
  try {
    const result = await studioApi.scrapeRuns({ offset: offset.value, limit: 25 }, controller.signal);
    if (controller.signal.aborted) return;
    runs.value = result.items;
    total.value = result.total;
  } catch (cause) {
    if (!controller.signal.aborted) error.value = cause instanceof Error ? cause.message : "Unable to load history.";
  } finally {
    if (request === controller) loading.value = false;
  }
}
watch(
  [() => props.refreshKey, offset],
  () => {
    void load();
  },
  { immediate: true },
);
onBeforeUnmount(() => request?.abort());
</script>
<template>
  <section class="studio-card">
    <div class="flex justify-between gap-3">
      <h2>Collection history · Fleet-wide</h2>
      <button :disabled="loading" @click="load">Refresh history</button>
    </div>
    <p v-if="error" class="studio-note" role="alert">{{ error }}</p>
    <p v-if="loading" role="status">Loading collection history…</p>
    <div v-else class="grid gap-3">
      <article
        v-for="run in runs"
        :key="run.id"
        :data-run-id="run.id"
        class="studio-history"
        :class="{ 'studio-selected': run.id === activeRunId }"
      >
        <strong>{{ run.id }}</strong> · {{ run.status }} · {{ absoluteTime(run.started_at) }}
        <p class="studio-muted text-xs">New {{ run.new }} · Unmapped {{ run.unmapped }} · Failed {{ run.failed }}</p>
        <ul>
          <li v-for="device in run.devices" :key="device.device_id">
            {{ registry.deviceLabel(device.device_id) }} · {{ device.status }} · new {{ device.new }} · failed
            {{ device.failed }}<span v-if="device.errors.length"> · {{ device.errors.join(", ") }}</span>
          </li>
        </ul>
      </article>
      <p v-if="!runs.length" class="studio-muted">No collection runs yet.</p>
    </div>
    <PaginatedTable :total="total" :offset="offset" :limit="25" :loading="loading" @page="offset = $event" />
  </section>
</template>
