<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { readModelMetrics, studioApi } from "../api";
import { useDeviceRegistry } from "../devices";
import { useWorkspace } from "../workspace";
import type { ModelVersion, Publication } from "../types";
import { absoluteTime, prettyTime } from "../time";

const workspace = useWorkspace();
const registry = useDeviceRegistry();
const versions = ref<ModelVersion[]>([]);
const publications = ref<Publication[]>([]);
const now = ref(Date.now());
const clock = setInterval(() => { now.value = Date.now(); }, 60000);
const loading = ref(false);
const error = ref("");
const notice = ref("");
const publishing = ref("");
let request: AbortController | undefined;
let action: AbortController | undefined;
let generation = 0;
let actionGeneration = 0;
let disposed = false;

const byDevice = computed(() => new Map(registry.devices.value.map(device => [device.id, device])));
function verifiedSuccess(publication: Publication): boolean {
  return (publication.state === "published" || publication.state === "synced")
    && publication.manifest_state === "verified"
    && publication.refresh_state === "acknowledged"
    && publication.runtime_state === "verified";
}
function stateClass(publication: Publication): string {
  return verifiedSuccess(publication) ? "studio-status-success"
    : publication.state === "offline" || publication.state === "credentials_required" || publication.state === "not_covered" || publication.state === "pending" || publication.state === "quarantined" || publication.state === "staging_blocked"
      ? "studio-status-warning" : "studio-status-muted";
}
function isCurrentAction(controller: AbortController, word: string, current: number): boolean {
  return !disposed && !controller.signal.aborted && action === controller && current === actionGeneration && workspace.selectedId.value === word;
}
async function load(): Promise<void> {
  const word = workspace.selectedId.value;
  request?.abort();
  const controller = new AbortController();
  request = controller;
  const current = ++generation;
  versions.value = [];
  publications.value = [];
  loading.value = Boolean(word);
  error.value = "";
  if (!word) return;
  try {
    const [archive, status] = await Promise.all([
      studioApi.models(word, { limit: 50 }, controller.signal),
      studioApi.deploymentStatus(word, controller.signal),
      registry.load(),
    ]);
    if (controller.signal.aborted || current !== generation || workspace.selectedId.value !== word) return;
    versions.value = archive.items;
    publications.value = status;
  } catch (cause) {
    if (!controller.signal.aborted && current === generation) error.value = cause instanceof Error ? cause.message : "Deployment history could not be loaded.";
  } finally {
    if (!controller.signal.aborted && current === generation) loading.value = false;
  }
}
async function publish(version: ModelVersion): Promise<void> {
  const word = workspace.selectedId.value;
  if (!word) return;
  action?.abort();
  const controller = new AbortController();
  action = controller;
  const current = ++actionGeneration;
  publishing.value = version.id;
  error.value = "";
  try {
    const result = await studioApi.publish(word, version.id, controller.signal);
    if (isCurrentAction(controller, word, current)) {
      publications.value = result;
      notice.value = "Publication requested for registered leader and standalone targets.";
    }
  } catch (cause) {
    if (isCurrentAction(controller, word, current)) error.value = cause instanceof Error ? cause.message : "Publication failed.";
  } finally {
    if (isCurrentAction(controller, word, current)) publishing.value = "";
  }
}
watch(() => workspace.selectedId.value, () => {
  action?.abort();
  action = undefined;
  actionGeneration += 1;
  publishing.value = "";
  notice.value = "";
  void load();
}, { immediate: true });
onBeforeUnmount(() => {
  disposed = true;
  clearInterval(clock);
  request?.abort();
  action?.abort();
  actionGeneration += 1;
});
</script>

<template>
  <section><div class="mb-4"><h1>Deploy</h1><p class="studio-muted">Archives are immutable dated training outputs. Publication makes files available; it never changes engines, enabled slots, thresholds, or wakeword selections.</p></div><p v-if="notice" class="studio-note" role="status">{{ notice }}</p><p v-if="error" class="studio-note" role="alert">{{ error }}</p>
    <p class="mb-4"><a :href="workspace.routes.href('kiosks')" @click.prevent="workspace.routes.navigate('kiosks')">Manage kiosks →</a></p>
    <section class="studio-card mb-4">
      <h2>Archived model versions</h2>
      <p v-if="loading" class="studio-muted">Loading archives…</p>
      <div v-else-if="versions.length" class="grid gap-3">
        <article v-for="version in versions" :key="version.id" class="studio-history" :data-version-id="version.id">
          <div class="flex flex-wrap justify-between gap-3">
            <div class="min-w-0 flex-1"><p v-if="version.run_number" data-run-number class="font-semibold">Run #{{ version.run_number }}</p><strong><time :datetime="version.trained_at" :title="absoluteTime(version.trained_at)">{{ prettyTime(version.trained_at, now) }}</time></strong><p v-if="version.origin === 'legacy'" class="studio-note text-xs">Legacy import · {{ version.validation_state }}. Never automatically published. Explicit publication first requires structural TensorFlow validation in the prepared training environment (cli/setup_python_venv); validation failure leaves the archive available without changing the desired version.</p></div>
            <div class="flex flex-wrap items-center gap-2">
              <a class="studio-button" :href="studioApi.archiveUrl(version.word_id, version.id)">Download</a>
              <button type="button" class="studio-primary" :disabled="publishing === version.id" @click="publish(version)">{{ version.origin === 'legacy' ? 'Validate and publish' : 'Publish' }}</button>
            </div>
          </div>
          <p v-if="readModelMetrics(version.metrics).recall !== null" class="studio-muted text-xs">Recall {{ readModelMetrics(version.metrics).recall }}</p>
        </article>
      </div>
      <p v-else class="studio-muted">No archived model versions for this workspace.</p>
    </section>
    <section class="studio-card">
      <h2>Target delivery</h2>
      <p class="studio-muted">Delivery status for the requested training run. Delivery does not verify which model is active for detection.</p>
      <article v-for="publication in publications" :key="publication.device_id" class="studio-target-row" :data-device-status="publication.device_id">
        <div><strong>{{ registry.deviceLabel(publication.device_id) }}</strong> <span v-if="byDevice.get(publication.device_id)?.role === 'follower'" class="studio-status studio-status-muted">Follower</span></div>
        <div>
          <div class="flex items-center gap-2"><span class="studio-status" :class="stateClass(publication)">{{ publication.state }}</span><span data-run-number class="text-xs">{{ publication.run_number ? `Run #${publication.run_number}` : 'Run unavailable' }}</span></div>
          <p v-if="publication.error_code" class="studio-muted text-xs">Retry/error: {{ publication.error_code }}<span v-if="publication.next_retry"> · next {{ publication.next_retry }}</span></p>
        </div>
      </article>
      <p v-if="!publications.length" class="studio-muted">No publication status yet.</p>
    </section>
  </section>
</template>
