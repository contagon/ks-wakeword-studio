<script setup lang="ts">
import { absoluteTime } from "../time";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { studioApi } from "../api";
import { useWorkspace } from "../workspace";
import type { ModelVersion } from "../types";
import ProbabilityGraph from "../components/ProbabilityGraph.vue";
import {
  parseTestingConfig,
  sensitivities,
  sensitivityThreshold,
  type Sensitivity,
  type TestingConfig,
} from "../testing/config";
import { TestingSession, type TestingState } from "../testing/session";
import type { Score } from "../testing/engine";

const workspace = useWorkspace();
const versions = ref<ModelVersion[]>([]);
const versionId = ref("");
const config = ref<TestingConfig | null>(null);
const sensitivity = ref<Sensitivity>("moderate");
const dialog = ref<HTMLDialogElement>();
const state = ref<TestingState>("idle");
const loading = ref(false);
const error = ref("");
const samples = ref<Score[]>([]);
const latest = ref<Score | null>(null);
let listRequest: AbortController | undefined;
let manifestRequest: AbortController | undefined;
let disposed = false;
const selectedVersion = computed(() => versions.value.find((version) => version.id === versionId.value));
const threshold = computed(() => sensitivityThreshold(config.value?.cutoff ?? 0.9, sensitivity.value));
const sensitivityLabel = computed(() => sensitivities.find((option) => option.id === sensitivity.value)!.label);
const active = computed(() => state.value === "starting" || state.value === "listening");
const peak = computed(() => Math.max(0, ...samples.value.map((sample) => sample.probability)));
const above = computed(() => !latest.value?.warming && (latest.value?.probability ?? 0) > threshold.value);
const status = computed(() =>
  state.value === "starting"
    ? "Loading model and requesting microphone…"
    : state.value === "error"
      ? "Testing stopped"
      : state.value !== "listening"
        ? "Ready to test"
        : latest.value?.warming || !latest.value
          ? "Warming up…"
          : above.value
            ? "Above threshold"
            : "Listening…",
);

const session = new TestingSession({
  state: (value) => {
    state.value = value;
  },
  error: (message) => {
    error.value = message;
  },
  score: (score) => {
    latest.value = score;
    samples.value = [...samples.value.filter((sample) => sample.seconds >= score.seconds - 8), score].slice(-256);
  },
});
function reset() {
  session.stop();
  latest.value = null;
  samples.value = [];
}
function chooseSensitivity(value: Sensitivity) {
  sensitivity.value = value;
  dialog.value?.close();
}
async function loadManifest() {
  manifestRequest?.abort();
  reset();
  config.value = null;
  error.value = "";
  const version = selectedVersion.value;
  const word = workspace.selectedId.value;
  if (!version || !word) return;
  const controller = new AbortController();
  manifestRequest = controller;
  try {
    const manifest = await studioApi.testingManifest(word, version.id, version.model_id, controller.signal);
    if (!disposed && !controller.signal.aborted) config.value = parseTestingConfig(manifest);
  } catch (cause) {
    if (!disposed && !controller.signal.aborted)
      error.value = cause instanceof Error ? cause.message : "Unable to load model settings.";
  }
}
async function loadVersions() {
  listRequest?.abort();
  manifestRequest?.abort();
  reset();
  dialog.value?.close();
  versions.value = [];
  versionId.value = "";
  config.value = null;
  error.value = "";
  const word = workspace.selectedId.value;
  loading.value = Boolean(word);
  if (!word) return;
  const controller = new AbortController();
  listRequest = controller;
  try {
    const archive: ModelVersion[] = [];
    let offset = 0;
    while (true) {
      const page = await studioApi.models(word, { offset, limit: 100 }, controller.signal);
      if (disposed || controller.signal.aborted) return;
      archive.push(...page.items);
      offset += page.items.length;
      if (offset >= page.total || !page.items.length) break;
    }
    versions.value = archive;
    versionId.value = archive[0]?.id ?? "";
  } catch (cause) {
    if (!disposed && !controller.signal.aborted)
      error.value = cause instanceof Error ? cause.message : "Unable to load versions.";
  } finally {
    if (!disposed && !controller.signal.aborted) loading.value = false;
  }
}
function start() {
  const version = selectedVersion.value;
  if (!version || !config.value) return;
  error.value = "";
  latest.value = null;
  samples.value = [];
  void session.start(studioApi.testingModelUrl(workspace.selectedId.value, version.id, version.model_id), config.value);
}
watch(
  versionId,
  () => {
    void loadManifest();
  },
  { flush: "sync" },
);
watch(
  workspace.selectedId,
  () => {
    void loadVersions();
  },
  { immediate: true, flush: "sync" },
);
onBeforeUnmount(() => {
  disposed = true;
  listRequest?.abort();
  manifestRequest?.abort();
  dialog.value?.close();
  session.stop();
});
</script>

<template>
  <section class="testing-page">
    <h1>Testing</h1>
    <p class="studio-muted testing-intro">
      Test a trained wakeword using your microphone. Inference runs in this browser; audio is never uploaded or saved.
    </p>
    <div class="studio-card testing-card">
      <h2>Wake Word Tester</h2>
      <p class="studio-muted">
        Speak your wakeword from your usual distance and watch the detection probability in real time.
      </p>
      <div class="studio-toolbar testing-controls">
        <label for="testing-version"
          >Wakeword version
          <select id="testing-version" v-model="versionId" :disabled="loading || !versions.length">
            <option v-if="!versions.length" value="">
              {{ loading ? "Loading versions…" : "No versions available" }}
            </option>
            <option v-for="version in versions" :key="version.id" :value="version.id">
              {{ absoluteTime(version.trained_at) }} · {{ version.id.slice(0, 8) }}
            </option>
          </select>
        </label>
        <div class="testing-sensitivity">
          <span class="studio-muted">Sensitivity</span
          ><button
            type="button"
            data-action="sensitivity"
            :disabled="!config"
            aria-haspopup="dialog"
            @click="dialog?.showModal()"
          >
            {{ sensitivityLabel }} ▾
          </button>
        </div>
      </div>
      <p v-if="!workspace.selectedId.value" class="studio-note">Select or create a wakeword to test.</p>
      <p v-else-if="!loading && !versions.length && !error" class="studio-note">Train a model to start live testing.</p>
      <p v-if="error" role="alert" class="studio-note">
        {{ error }} <button v-if="!active" type="button" @click="loadVersions">Reload versions</button>
      </p>
      <div class="testing-mic">
        <span>Mic level</span><meter min="0" max=".2" :value="latest?.rms ?? 0" aria-label="Microphone level" /><span>{{
          (latest?.rms ?? 0).toFixed(3)
        }}</span>
      </div>
      <div class="testing-stats">
        <span>Detection probability (smoothed)</span
        ><span
          >latest <b>{{ (latest?.probability ?? 0).toFixed(3) }}</b> · peak <b>{{ peak.toFixed(3) }}</b> ·
          <span data-threshold
            >threshold <b>{{ threshold.toFixed(2) }}</b></span
          ></span
        >
      </div>
      <ProbabilityGraph :samples="samples" :threshold="threshold" />
      <div class="testing-actions">
        <button v-if="active" type="button" class="studio-danger" data-action="stop-testing" @click="session.stop()">
          Stop testing
        </button>
        <button
          v-else
          type="button"
          class="studio-primary"
          data-action="start-testing"
          :disabled="!config || loading"
          @click="start"
        >
          Start testing
        </button>
        <span role="status" :class="{ 'testing-above': above && state === 'listening' }">{{ status }}</span>
      </div>
      <p class="studio-muted testing-footnote">
        The dashed line is the selected sensitivity threshold. Red means the smoothed probability is above it. Browser
        microphone processing and device hardware may differ from your deployed satellite.
      </p>
    </div>
    <dialog ref="dialog" class="studio-card testing-dialog" aria-labelledby="testing-sensitivity-title">
      <h2 id="testing-sensitivity-title">Detection sensitivity</h2>
      <p class="studio-muted">
        Derived from this version’s saved cutoff ({{ (config?.cutoff ?? 0.9).toFixed(2) }}), using Voice Satellite’s
        calculation.
      </p>
      <div class="sensitivity-options">
        <button
          v-for="option in sensitivities"
          :key="option.id"
          type="button"
          :data-sensitivity="option.id"
          :aria-pressed="sensitivity === option.id"
          :class="{ 'studio-selected': sensitivity === option.id }"
          @click="chooseSensitivity(option.id)"
        >
          <span>{{ option.label }}</span
          ><strong>{{ sensitivityThreshold(config?.cutoff ?? 0.9, option.id).toFixed(2) }}</strong>
        </button>
      </div>
      <p class="studio-muted">Higher sensitivity lowers the threshold and may increase false detections.</p>
      <button type="button" @click="dialog?.close()">Close</button>
    </dialog>
  </section>
</template>

<style scoped>
.testing-page {
  max-width: 960px;
}
.testing-intro {
  margin: 0 0 24px;
}
.testing-card {
  padding: 24px;
}
.testing-controls {
  margin: 24px 0;
}
.testing-sensitivity {
  display: grid;
  gap: 4px;
  font-size: 12px;
}
.testing-mic {
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--studio-muted);
  font-size: 12px;
  margin: 20px 0;
}
.testing-mic meter {
  flex: 1;
  height: 10px;
}
.testing-mic > span:last-child {
  font-variant-numeric: tabular-nums;
}
.testing-stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  margin: 12px 0;
  font-size: 12px;
  color: var(--studio-muted);
  font-variant-numeric: tabular-nums;
}
.testing-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
}
.testing-above {
  color: #e05260;
  font-weight: 650;
}
.testing-footnote {
  font-size: 12px;
  margin: 18px 0 0;
}
.testing-dialog {
  width: min(460px, calc(100% - 32px));
  margin: auto;
  color: var(--studio-text);
  background: var(--studio-surface);
}
.testing-dialog::backdrop {
  background: rgb(20 35 48 / 0.55);
}
.testing-dialog p {
  margin: 12px 0;
}
.sensitivity-options {
  display: grid;
  gap: 10px;
  margin: 20px 0;
}
.sensitivity-options button {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  width: 100%;
  text-align: left;
}
@media (max-width: 650px) {
  .testing-card {
    padding: 16px;
  }
  .testing-controls {
    align-items: stretch;
  }
}
</style>
