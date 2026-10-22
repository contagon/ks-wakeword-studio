<script setup lang="ts">
import PageHeader from "../components/PageHeader.vue";
import { absoluteTime } from "../time";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { studioApi } from "../api";
import type { AutomationSettings, AutomationStatus } from "../types";
import { useWorkspace } from "../workspace";
import AutomationScheduleFields from "../components/AutomationScheduleFields.vue";

const workspace = useWorkspace();
const wordId = computed(() => workspace.selectedId.value);
const settings = ref<AutomationSettings | null>(null);
const status = ref<AutomationStatus | null>(null);
const loading = ref(false),
  saving = ref(false),
  error = ref(""),
  notice = ref("");
let request: AbortController | undefined;
let mutation: AbortController | undefined;
let generation = 0;
function stageStatus(kind: "scrape" | "classify" | "train" | "deploy"): string {
  const schedule = status.value?.schedules.find((s) => s.scope === `${kind}:${wordId.value}`);
  const job = status.value?.last_jobs[kind];
  const skipped = job && "skipped" in job.result && job.result.skipped;
  const result = job
    ? `Last run: ${skipped ? "skipped" : job.status}${job.finished_at ? ` · ${absoluteTime(job.finished_at)}` : ""}`
    : "No runs yet";
  return `${result} · ${schedule?.enabled ? `Next: ${absoluteTime(schedule.next_run_at)}` : "Not scheduled"}`;
}
async function load() {
  request?.abort();
  mutation?.abort();
  const controller = new AbortController();
  request = controller;
  const token = ++generation,
    id = wordId.value;
  settings.value = null;
  status.value = null;
  saving.value = false;
  error.value = "";
  notice.value = "";
  loading.value = Boolean(id);
  if (!id) return;
  try {
    const result = await studioApi.automation(id, controller.signal);
    if (generation !== token || controller.signal.aborted) return;
    status.value = result;
    settings.value = structuredClone(result.settings);
  } catch (cause) {
    if (generation === token && !controller.signal.aborted)
      error.value = cause instanceof Error ? cause.message : "Unable to load automation.";
  } finally {
    if (generation === token) loading.value = false;
  }
}
async function save() {
  if (!settings.value || !wordId.value || saving.value || loading.value) return;
  mutation?.abort();
  const controller = new AbortController();
  mutation = controller;
  const id = wordId.value,
    token = generation;
  const snapshot = JSON.parse(JSON.stringify(settings.value)) as AutomationSettings;
  saving.value = true;
  error.value = "";
  notice.value = "";
  try {
    const result = await studioApi.saveAutomation(id, snapshot, controller.signal);
    if (generation !== token || controller.signal.aborted) return;
    status.value = result;
    settings.value = structuredClone(result.settings);
    notice.value = "Automation settings saved.";
    await workspace.refreshSelected();
  } catch (cause) {
    if (generation === token && !controller.signal.aborted)
      error.value = cause instanceof Error ? cause.message : "Settings were not saved.";
  } finally {
    if (generation === token) saving.value = false;
  }
}
watch(
  wordId,
  () => {
    void load();
  },
  { immediate: true },
);
onBeforeUnmount(() => {
  generation++;
  request?.abort();
  mutation?.abort();
});
</script>

<template>
  <section>
    <PageHeader
      title="Automate"
      description="Collection, classification, training, and deployment for the selected workspace."
    />
    <p v-if="!wordId" class="studio-card">Choose a wakeword to configure automation.</p>
    <p v-if="loading" role="status">Loading automation…</p>
    <p v-if="error" class="studio-note" role="alert">
      {{ error }} <button v-if="!settings" @click="load">Retry</button>
    </p>
    <p v-if="notice" class="studio-note" role="status">{{ notice }}</p>
    <form v-if="settings" class="grid gap-4" @submit.prevent="save">
      <section class="studio-card">
        <div class="studio-section-header mb-2">
          <h2>Automatic collection</h2>
          <label class="studio-checkbox-label"
            ><input v-model="settings.collection.enabled" name="collection-enabled" type="checkbox" />Enabled</label
          >
        </div>
        <p class="studio-muted">
          Collect recordings mapped to <strong>{{ workspace.selected.value?.phrase ?? "this workspace" }}</strong> from
          registered kiosks. Existing recordings are preserved when disabled.
        </p>
        <AutomationScheduleFields v-model="settings.collection" prefix="collection" />
        <p class="studio-muted text-xs mt-3">{{ stageStatus("scrape") }}</p>
      </section>
      <section class="studio-card">
        <div class="studio-section-header mb-2">
          <h2>Automatic classification</h2>
          <label class="studio-checkbox-label"
            ><input
              v-model="settings.classification.enabled"
              name="classification-enabled"
              type="checkbox"
            />Enabled</label
          >
        </div>
        <p class="studio-muted">
          Review pending diagnostic audio conservatively. Uncertain clips remain for manual review.
        </p>
        <div class="grid gap-3 sm:grid-cols-2 mt-3">
          <label
            >Speech recognition engine<select v-model="settings.classification.engine" name="stt-engine">
              <option value="faster_whisper">Faster Whisper · recommended</option>
              <option value="parakeet_onnx">Parakeet ONNX</option>
            </select></label
          ><label
            >Run<select v-model="settings.classification.trigger" name="classification-trigger">
              <option value="after_collection">After collection</option>
              <option value="schedule">On a schedule</option>
            </select></label
          >
        </div>
        <AutomationScheduleFields
          v-if="settings.classification.trigger === 'schedule'"
          v-model="settings.classification_schedule"
          prefix="classification"
        />
        <div class="grid gap-2 mt-4">
          <h3>Classification rules</h3>
          <label class="studio-checkbox-label"
            ><input v-model="settings.classification.auto_negatives" type="checkbox" />Label clear non-wake activations
            as negatives</label
          ><label class="studio-checkbox-label"
            ><input v-model="settings.classification.promote_close_misses" type="checkbox" />Promote confirmed close
            misses to positives</label
          >
          <p class="studio-muted text-xs">
            Empty or ambiguous transcripts stay pending. Close misses are never automatic negatives. No audio is
            automatically deleted.
          </p>
        </div>
        <p class="studio-muted text-xs mt-3">{{ stageStatus("classify") }}</p>
      </section>
      <div class="grid gap-4 lg:grid-cols-2">
        <section class="studio-card">
          <div class="studio-section-header mb-2">
            <h2>Automatic training</h2>
            <label class="studio-checkbox-label"
              ><input v-model="settings.training.enabled" name="training-enabled" type="checkbox" />Enabled</label
            >
          </div>
          <p class="studio-muted">Create an archived model from reviewed and selected inputs.</p>
          <AutomationScheduleFields v-model="settings.training" prefix="training" /><label
            class="studio-checkbox-label my-3"
            ><input v-model="settings.skip_unchanged" type="checkbox" />Skip when inputs are unchanged</label
          >
          <p class="studio-note text-xs">
            Training and deployment are separate. Training alone does not publish a model.
          </p>
          <p class="studio-muted text-xs mt-3">{{ stageStatus("train") }}</p>
        </section>
        <section class="studio-card">
          <div class="studio-section-header mb-2">
            <h2>Automatic deployment</h2>
            <label class="studio-checkbox-label"
              ><input v-model="settings.deployment.enabled" name="deployment-enabled" type="checkbox" />Enabled</label
            >
          </div>
          <p class="studio-muted">Publish eligible archives to your registered fleet targets on a schedule.</p>
          <AutomationScheduleFields v-model="settings.deployment" prefix="deployment" />
          <label class="studio-checkbox-label mt-3"
            ><input v-model="settings.deployment_policy.after_training" name="after-training" type="checkbox" />Also
            deploy after successful training</label
          >
          <p class="studio-muted text-xs mt-1">Failed, cancelled, or skipped runs do not trigger deployment.</p>
          <p class="studio-muted text-xs mt-3">
            Publish the latest new eligible archive; skip if there is nothing new. Manual rollbacks are retained until a
            new archive is available.
          </p>
          <p class="studio-muted text-xs mt-3">{{ stageStatus("deploy") }}</p>
        </section>
      </div>
      <div class="studio-form-footer">
        <button type="submit" class="studio-primary" :aria-busy="saving" :disabled="saving || loading">
          {{ saving ? "Saving…" : "Save automation settings" }}
        </button>
      </div>
    </form>
  </section>
</template>
