<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { readModelMetrics, studioApi } from "../api";
import { useDeviceRegistry } from "../devices";
import { useWorkspace } from "../workspace";
import type { DeploymentCapabilities, ModelVersion, Publication } from "../types";

const workspace = useWorkspace();
const registry = useDeviceRegistry();
const versions = ref<ModelVersion[]>([]);
const publications = ref<Publication[]>([]);
const capabilities = ref<DeploymentCapabilities | null>(null);
const loading = ref(false);
const error = ref("");
const notice = ref("");
const rollingBack = ref<ModelVersion | null>(null);
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
function observed(publication: Publication): string { return publication.runtime_state || "unverified"; }
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
  capabilities.value = null;
  loading.value = Boolean(word);
  error.value = "";
  if (!word) return;
  try {
    const [archive, status, capability] = await Promise.all([
      studioApi.models(word, { limit: 50 }, controller.signal),
      studioApi.deploymentStatus(word, controller.signal),
      studioApi.deploymentCapabilities(controller.signal),
      registry.load(),
    ]);
    if (controller.signal.aborted || current !== generation || workspace.selectedId.value !== word) return;
    versions.value = archive.items;
    publications.value = status;
    capabilities.value = capability;
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
async function rollback(): Promise<void> {
  const version = rollingBack.value;
  const word = workspace.selectedId.value;
  if (!version || !word) return;
  action?.abort();
  const controller = new AbortController();
  action = controller;
  const current = ++actionGeneration;
  publishing.value = version.id;
  error.value = "";
  try {
    const result = await studioApi.rollback(word, version.id, controller.signal);
    if (isCurrentAction(controller, word, current)) {
      publications.value = result;
      notice.value = `Rollback to archive ${version.id} requested; archives were retained.`;
      rollingBack.value = null;
    }
  } catch (cause) {
    if (isCurrentAction(controller, word, current)) error.value = cause instanceof Error ? cause.message : "Rollback failed.";
  } finally {
    if (isCurrentAction(controller, word, current)) publishing.value = "";
  }
}
watch(() => workspace.selectedId.value, () => {
  action?.abort();
  action = undefined;
  actionGeneration += 1;
  publishing.value = "";
  rollingBack.value = null;
  notice.value = "";
  void load();
}, { immediate: true });
onBeforeUnmount(() => {
  disposed = true;
  request?.abort();
  action?.abort();
  actionGeneration += 1;
});
</script>

<template>
  <section><div class="mb-4"><h1>Deploy</h1><p class="studio-muted">Archives are immutable dated training outputs. Publication makes files available; it never changes engines, enabled slots, thresholds, or wakeword selections.</p></div><p v-if="notice" class="studio-note" role="status">{{ notice }}</p><p v-if="error" class="studio-note" role="alert">{{ error }}</p>
    <section v-if="capabilities" class="studio-card studio-safety mb-4" data-staging-notice><h2>Before publishing</h2><p><strong>Clean, exclusive staging required.</strong> No concurrent manual uploads; staging cannot be checked automatically.</p><p class="studio-note" data-quarantine-notice role="alert"><strong>Quarantine warning:</strong> {{ capabilities.quarantine_notice }}</p><details><summary>Publication safety details</summary><p>{{ capabilities.notice }}</p><p class="studio-muted">Leader-authoritative mirroring and its existing selection propagation apply to eligible followers. Followers are indirect recipients only; the trainer never uploads to them.</p><p class="studio-muted">{{ capabilities.operator_action }}</p></details></section>
    <p class="mb-4"><a :href="workspace.routes.href('kiosks')" @click.prevent="workspace.routes.navigate('kiosks')">Manage kiosks →</a> · <a :href="workspace.routes.href('automate')" @click.prevent="workspace.routes.navigate('automate')">Deployment automation →</a></p>
    <section class="studio-card mb-4">
      <h2>Archived model versions</h2>
      <p v-if="loading" class="studio-muted">Loading archives…</p>
      <div v-else-if="versions.length" class="grid gap-3">
        <article v-for="version in versions" :key="version.id" class="studio-history" :data-version-id="version.id">
          <div class="flex flex-wrap justify-between gap-3">
            <div class="min-w-0 flex-1"><strong>{{ version.id }}</strong><p class="studio-muted text-xs">{{ version.trained_at }} · Run {{ version.run_id }}</p><p v-if="version.origin === 'legacy'" class="studio-note text-xs">Legacy import · {{ version.validation_state }}. Never automatically published. Explicit publication first requires structural TensorFlow validation in the prepared training environment (cli/setup_python_venv); validation failure leaves the archive available without changing the desired version.</p></div>
            <div class="flex flex-wrap items-center gap-2">
              <a :href="studioApi.archiveUrl(version.word_id, version.id)">Download archive</a>
              <button type="button" class="studio-primary" :disabled="publishing === version.id" @click="publish(version)">{{ version.origin === 'legacy' ? 'Validate and publish' : 'Publish' }}</button>
              <button type="button" :data-action="`rollback-${version.id}`" :disabled="publishing === version.id" @click="rollingBack = version">Rollback</button>
            </div>
          </div>
          <p v-if="readModelMetrics(version.metrics).recall !== null" class="studio-muted text-xs">Recall {{ readModelMetrics(version.metrics).recall }}</p>
        </article>
      </div>
      <p v-else class="studio-muted">No archived model versions for this workspace.</p>
    </section>
    <section class="studio-card"><h2>Target delivery</h2><p class="studio-muted">Desired is the current authoritative archive. Observed distinguishes verified remote files from unverified runtime use.</p><article v-for="publication in publications" :key="publication.device_id" class="studio-target-row" :data-device-status="publication.device_id"><div><strong>{{ registry.deviceLabel(publication.device_id) }}</strong> <span v-if="byDevice.get(publication.device_id)?.role === 'follower'" class="studio-status studio-status-muted">Follower</span><p class="studio-muted text-xs">{{ byDevice.get(publication.device_id)?.leader_id ? `Indirect via ${registry.deviceLabel(byDevice.get(publication.device_id)!.leader_id!)}` : 'Direct leader/standalone target' }}</p></div><div><span class="studio-status" :class="stateClass(publication)">{{ publication.state }}</span><p class="text-xs">Desired {{ publication.desired_version }} · Observed {{ observed(publication) }}</p><p v-if="publication.error_code" class="studio-muted text-xs">Retry/error: {{ publication.error_code }}<span v-if="publication.next_retry"> · next {{ publication.next_retry }}</span></p></div></article><p v-if="!publications.length" class="studio-muted">No publication status yet.</p></section>
    <div v-if="rollingBack" class="studio-modal-backdrop"><section class="studio-card" role="dialog" aria-modal="true" aria-label="Confirm rollback"><h2>Rollback archive?</h2><p>Republish {{ rollingBack.id }} under the stable model identity. Newer archive entries remain available and no device selection changes.</p><div class="flex gap-2"><button type="button" class="studio-primary" :disabled="publishing === rollingBack.id" @click="rollback">Confirm rollback</button><button type="button" data-action="cancel-rollback" @click="rollingBack = null">Cancel</button></div></section></div>
  </section>
</template>
