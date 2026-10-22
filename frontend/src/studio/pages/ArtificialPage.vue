<script setup lang="ts">
import { absoluteTime } from "../time";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { StudioApiError, studioApi } from "../api";
import { useWorkspace } from "../workspace";
import type { Batch, GenerationCapability, GenerationRecipe, GenerationSource, Job } from "../types";
import PaginatedTable from "../components/PaginatedTable.vue";
import { useJobQueue, statusClass } from "../jobs";

const workspace = useWorkspace();
const queue = useJobQueue();
const generationBusy = computed(() =>
  queue.activeJobs.value.some((job) => job.kind === "generation" && job.word_id === activeId.value),
);
function isPreviewBusy(engine: string): boolean {
  return (
    Boolean(previewBusy.value[engine]) ||
    queue.activeJobs.value.some(
      (job) => job.kind === "preview" && job.word_id === activeId.value && job.payload.recipe.engines?.includes(engine),
    )
  );
}
const capabilities = ref<GenerationCapability[]>([]);
const batches = ref<Batch[]>([]);
const total = ref(0);
const offset = ref(0);
const recipe = ref<GenerationRecipe>({
  language: "en",
  english_accent: "mixed",
  tts_mode: "hybrid",
  samples: 1,
  batch_size: 1,
});
const selected = ref<Set<string>>(new Set());
const loading = ref(false);
const saving = ref(false);
const error = ref("");
const job = ref<Job | null>(null);
const previews = ref<Record<string, Job>>({});
const previewBusy = ref<Record<string, boolean>>({});
const previewErrors = ref<Record<string, string>>({});
const deleting = ref<Batch | null>(null);
const submissionJobs = ref<Record<string, Job>>({});
const sources = ref<GenerationSource[]>([]),
  sourceTotal = ref(0),
  sourceOffset = ref(0),
  sourceLoading = ref(false),
  sourceError = ref("");
let sourceRequest: AbortController | undefined;
const mossEnabled = computed(() => recipe.value.engines?.includes("moss"));
const directCount = computed(() => recipe.value.engines?.filter((e) => e !== "moss").length ?? 0);
const requestedTotal = computed(
  () =>
    directCount.value * recipe.value.samples +
    (mossEnabled.value ? (recipe.value.moss_samples ?? recipe.value.samples) : 0),
);
async function loadSources(): Promise<void> {
  sourceRequest?.abort();
  const controller = new AbortController();
  sourceRequest = controller;
  const id = activeId.value,
    language = recipe.value.language;
  sources.value = [];
  sourceTotal.value = 0;
  sourceError.value = "";
  sourceLoading.value = true;
  try {
    if (!id) return;
    const page = await studioApi.generationSources(
      id,
      { language, offset: sourceOffset.value, limit: 50 },
      controller.signal,
    );
    if (controller.signal.aborted || activeId.value !== id || recipe.value.language !== language) return;
    sources.value = page.items;
    sourceTotal.value = page.total;
  } catch (cause) {
    if (!controller.signal.aborted)
      sourceError.value = cause instanceof Error ? cause.message : "Unable to load sources.";
  } finally {
    if (sourceRequest === controller) sourceLoading.value = false;
  }
}
function toggleSource(id: string, checked: boolean): void {
  const ids = new Set(recipe.value.moss_source_batch_ids ?? []);
  checked ? ids.add(id) : ids.delete(id);
  recipe.value.moss_source_batch_ids = [...ids];
}
function setMossMode(checked: boolean): void {
  recipe.value.moss_after_current = checked;
  recipe.value.moss_source_batch_ids = [];
}
const previewRequests = new Map<string, AbortController>();
const engineNames: Record<string, string> = {
  omnivoice: "OmniVoice",
  qwen3: "Qwen3-TTS",
  moss: "MOSS-TTS",
  piper: "Piper",
};
let loadRequest: AbortController | undefined;
let mutationRequest: AbortController | undefined;
let loadGeneration = 0;
let mutationGeneration = 0;
let selectionLoaded = false;
const activeId = computed(() => workspace.selectedId.value);
const word = computed(() => workspace.selected.value);
const capability = computed(() => capabilities.value.find((item) => item.language === recipe.value.language) ?? null);
const engines = computed(() => capability.value?.engines.hybrid ?? []);
const modelAvailability = computed(
  () =>
    capability.value?.model_availability ??
    engines.value.map((engine) => ({ engine, supported: true, available: true, reason: null })),
);
const accentEnabled = computed(
  () => Boolean(capability.value?.accent_applies) && recipe.value.engines?.some((engine) => engine !== "piper"),
);
function loadCurrent(id: string, token: number, controller: AbortController): boolean {
  return activeId.value === id && loadGeneration === token && !controller.signal.aborted;
}
function mutationCurrent(id: string, token: number, controller: AbortController): boolean {
  return activeId.value === id && mutationGeneration === token && !controller.signal.aborted;
}
const defaultEngines = ["omnivoice", "qwen3"];
function normalizeRecipe(): void {
  const cap = capability.value;
  if (!cap) return;
  const chosen = recipe.value.engines ?? defaultEngines;
  recipe.value.engines = chosen.filter((engine) => engines.value.includes(engine));
  if (!accentEnabled.value) recipe.value.english_accent = "mixed";
}
function abortWorkspaceMutations(): void {
  sourceRequest?.abort();
  submissionJobs.value = {};
  sources.value = [];
  sourceTotal.value = 0;
  mutationRequest?.abort();
  mutationRequest = undefined;
  mutationGeneration += 1;
  saving.value = false;
  job.value = null;
  deleting.value = null;
  for (const request of previewRequests.values()) request.abort();
  previewRequests.clear();
  previews.value = {};
  previewBusy.value = {};
  previewErrors.value = {};
}
async function load(): Promise<void> {
  loadRequest?.abort();
  const controller = new AbortController();
  loadRequest = controller;
  const token = ++loadGeneration;
  const id = activeId.value;
  batches.value = [];
  total.value = 0;
  error.value = "";
  if (!id) return;
  loading.value = true;
  try {
    const [catalog, saved, page, selection, currentWord, defaults] = await Promise.all([
      studioApi.generationCatalog(controller.signal),
      studioApi
        .generationRecipe(id, controller.signal)
        .catch((cause) => (cause instanceof StudioApiError && cause.status === 404 ? null : Promise.reject(cause))),
      studioApi.batches(id, { offset: offset.value, limit: 50 }, controller.signal),
      selectionLoaded ? Promise.resolve(null) : studioApi.batchSelection(id, controller.signal),
      studioApi.wakeword(id, controller.signal),
      studioApi.generationDefaults(controller.signal),
    ]);
    if (!loadCurrent(id, token, controller)) return;
    capabilities.value = catalog;
    if (!selectionLoaded) {
      recipe.value = saved ?? {
        language: currentWord.language,
        english_accent: "mixed",
        tts_mode: "hybrid",
        ...defaults,
      };
      normalizeRecipe();
      selected.value = new Set(selection ?? []);
      selectionLoaded = true;
      recipe.value.moss_samples ??= recipe.value.samples;
      recipe.value.moss_source_batch_ids ??= [];
      recipe.value.moss_after_current ??= directCount.value > 0;
      void loadSources();
    }
    batches.value = page.items;
    total.value = page.total;
  } catch (cause) {
    if (loadCurrent(id, token, controller))
      error.value = cause instanceof Error ? cause.message : "Unable to load generation settings.";
  } finally {
    if (loadCurrent(id, token, controller)) loading.value = false;
  }
}
function updateLanguage(value: string): void {
  recipe.value.language = value;
  recipe.value.moss_source_batch_ids = [];
  sourceOffset.value = 0;
  normalizeRecipe();
  void loadSources();
}
function toggleEngine(engine: string, checked: boolean): void {
  const next = new Set(recipe.value.engines);
  checked ? next.add(engine) : next.delete(engine);
  recipe.value.engines = [...next];
  if (!next.has("moss")) {
    recipe.value.moss_after_current = false;
    recipe.value.moss_source_batch_ids = [];
  }
}
function valid(): boolean {
  if (!Number.isInteger(recipe.value.samples) || recipe.value.samples < 1) {
    error.value = "Sample count must be a positive integer.";
    return false;
  }
  if (!recipe.value.engines?.length) {
    error.value = "Select at least one generation model.";
    return false;
  }
  return true;
}
async function save(): Promise<void> {
  const id = activeId.value;
  if (!id || saving.value || generationBusy.value || !valid()) return;
  if (mossEnabled.value && (!Number.isInteger(recipe.value.moss_samples) || (recipe.value.moss_samples ?? 0) < 1)) {
    error.value = "MOSS sample count must be a positive integer.";
    return;
  }
  if (
    mossEnabled.value &&
    (recipe.value.moss_after_current ? !directCount.value : !recipe.value.moss_source_batch_ids?.length)
  ) {
    error.value = "Select completed MOSS sources or generate after current direct providers.";
    return;
  }
  mutationRequest?.abort();
  const controller = new AbortController();
  mutationRequest = controller;
  const token = ++mutationGeneration;
  const recipeToSave = {
    ...recipe.value,
    engines: [...recipe.value.engines!],
    english_accent: accentEnabled.value ? recipe.value.english_accent : "mixed",
    tts_mode: "hybrid" as const,
  };
  saving.value = true;
  error.value = "";
  try {
    const submission = await studioApi.submitGeneration(id, recipeToSave, controller.signal);
    if (mutationCurrent(id, token, controller)) {
      recipe.value = recipeToSave;
      for (const child of submission.jobs) {
        submissionJobs.value[child.id] = child;
        queue.track(child);
      }
      job.value = submission.jobs[0] ?? null;
    }
  } catch (cause) {
    if (mutationCurrent(id, token, controller))
      error.value = cause instanceof Error ? cause.message : "Generation job was not started.";
  } finally {
    if (mutationCurrent(id, token, controller)) saving.value = false;
  }
}
async function preview(engine: string): Promise<void> {
  const id = activeId.value;
  if (!id || isPreviewBusy(engine)) return;
  previewRequests.get(engine)?.abort();
  const controller = new AbortController();
  previewRequests.set(engine, controller);
  previewBusy.value[engine] = true;
  previewErrors.value[engine] = "";
  delete previews.value[engine];
  try {
    const next = await studioApi.preview(
      id,
      {
        ...recipe.value,
        moss_after_current: false,
        moss_source_batch_ids: engine === "moss" ? [...(recipe.value.moss_source_batch_ids ?? [])] : [],
        tts_mode: "hybrid",
        engines: [engine],
        samples: 1,
        batch_size: 1,
        english_accent: capability.value?.accent_applies && engine !== "piper" ? recipe.value.english_accent : "mixed",
      },
      controller.signal,
    );
    if (!controller.signal.aborted && activeId.value === id) {
      previews.value[engine] = next;
      queue.track(next);
    }
  } catch (cause) {
    if (!controller.signal.aborted && activeId.value === id)
      previewErrors.value[engine] = cause instanceof Error ? cause.message : "Preview could not start.";
  } finally {
    if (previewRequests.get(engine) === controller) {
      previewBusy.value[engine] = false;
      previewRequests.delete(engine);
    }
  }
}
function updatePreview(engine: string, next: Job): void {
  if (previews.value[engine]?.id === next.id) previews.value[engine] = next;
}
watch(
  queue.jobs,
  (jobs) => {
    let refresh = false;
    for (const next of Object.values(jobs)) {
      if (next.kind === "generation" && next.word_id === activeId.value) {
        const previous = submissionJobs.value[next.id];
        if (next.status === "complete" && previous?.status !== "complete") refresh = true;
        submissionJobs.value[next.id] = next;
        if (job.value?.id === next.id) job.value = next;
      }
    }
    if (refresh) {
      offset.value = 0;
      void load();
      void loadSources();
    }
    for (const [engine, previous] of Object.entries(previews.value)) {
      const next = jobs[previous.id];
      if (next && next.word_id === activeId.value) updatePreview(engine, next);
    }
  },
  { deep: true },
);
function toggle(batch: Batch, checked: boolean): void {
  if (batch.status !== "complete") return;
  const next = new Set(selected.value);
  checked ? next.add(batch.id) : next.delete(batch.id);
  selected.value = next;
}
async function deleteBatch(): Promise<void> {
  const id = activeId.value,
    batch = deleting.value;
  if (!id || !batch || saving.value) return;
  mutationRequest?.abort();
  const controller = new AbortController();
  mutationRequest = controller;
  const token = ++mutationGeneration;
  saving.value = true;
  error.value = "";
  try {
    await studioApi.deleteBatch(id, batch.id, controller.signal);
    if (!mutationCurrent(id, token, controller)) return;
    const next = new Set(selected.value);
    next.delete(batch.id);
    selected.value = next;
    deleting.value = null;
    recipe.value.moss_source_batch_ids =
      recipe.value.moss_source_batch_ids?.filter((source) => source !== batch.id) ?? [];
    sourceOffset.value = 0;
    void loadSources();
    if (batches.value.length === 1 && offset.value > 0) offset.value = Math.max(0, offset.value - 50);
    else await load();
  } catch (cause) {
    if (mutationCurrent(id, token, controller))
      error.value =
        cause instanceof StudioApiError && cause.status === 409
          ? "Cancel queued or active workspace jobs before deleting this dataset."
          : cause instanceof Error
            ? cause.message
            : "Dataset was not deleted.";
  } finally {
    if (mutationCurrent(id, token, controller)) saving.value = false;
  }
}
async function saveBatches(): Promise<void> {
  const id = activeId.value;
  if (!id || !selectionLoaded || loading.value) return;
  mutationRequest?.abort();
  const controller = new AbortController();
  mutationRequest = controller;
  const token = ++mutationGeneration;
  const batchIds = [...selected.value];
  saving.value = true;
  try {
    await studioApi.selectBatches(id, batchIds, controller.signal);
    if (mutationCurrent(id, token, controller)) await load();
  } catch (cause) {
    if (mutationCurrent(id, token, controller))
      error.value = cause instanceof Error ? cause.message : "Batch selection was not saved.";
  } finally {
    if (mutationCurrent(id, token, controller)) saving.value = false;
  }
}
watch(
  activeId,
  () => {
    abortWorkspaceMutations();
    sourceOffset.value = 0;
    selectionLoaded = false;
    selected.value = new Set();
    recipe.value = {
      language: word.value?.language ?? "en",
      english_accent: "mixed",
      tts_mode: "hybrid",
      samples: 1,
      batch_size: 1,
    };
    offset.value = 0;
    void load();
  },
  { immediate: true },
);
watch(sourceOffset, () => {
  void loadSources();
});
watch(offset, () => {
  void load();
});
onBeforeUnmount(() => {
  loadRequest?.abort();
  abortWorkspaceMutations();
});
</script>

<template>
  <section>
    <div class="mb-4">
      <h1>Artificial</h1>
      <p class="studio-muted">Generate wakeword audio, then choose which datasets to use for training.</p>
    </div>
    <div class="studio-card">
      <h2>Generate data</h2>
      <p data-generation-phrase class="studio-muted">
        Wake phrase: <strong>{{ word?.phrase ?? "No workspace selected" }}</strong>
      </p>
      <form class="grid gap-4 mt-3" @submit.prevent="save">
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label
            >Language<select
              name="language"
              :value="recipe.language"
              @change="updateLanguage(($event.target as HTMLSelectElement).value)"
            >
              <option v-for="entry in capabilities" :key="entry.language" :value="entry.language">
                {{ entry.name }}
              </option>
            </select></label
          >
          <label
            >English accent<select name="english-accent" v-model="recipe.english_accent" :disabled="!accentEnabled">
              <template v-if="accentEnabled"
                ><option v-for="accent in capability?.english_accents ?? []" :key="accent.code" :value="accent.code">
                  {{ accent.label }}
                </option></template
              >
              <option v-else value="mixed">Not applicable</option>
            </select></label
          >
          <label
            >Samples per provider<input v-model.number="recipe.samples" name="samples" type="number" min="1" required
          /></label>
        </div>
        <fieldset>
          <legend class="mb-2 font-semibold">Generation models</legend>
          <div class="grid gap-3 sm:grid-cols-2">
            <article v-for="model in modelAvailability" :key="model.engine" class="studio-history">
              <div class="flex items-center justify-between gap-3">
                <label class="studio-checkbox-label"
                  ><input
                    type="checkbox"
                    :data-engine="model.engine"
                    :disabled="!model.available"
                    :checked="recipe.engines?.includes(model.engine)"
                    @change="toggleEngine(model.engine, ($event.target as HTMLInputElement).checked)"
                  /><strong>{{ engineNames[model.engine] ?? model.engine }}</strong></label
                >
                <button
                  type="button"
                  :data-preview="model.engine"
                  :aria-busy="isPreviewBusy(model.engine)"
                  :disabled="
                    !model.available ||
                    (model.engine === 'moss' && (recipe.moss_after_current || !recipe.moss_source_batch_ids?.length)) ||
                    isPreviewBusy(model.engine) ||
                    !activeId
                  "
                  @click="preview(model.engine)"
                >
                  {{ isPreviewBusy(model.engine) ? "Preparing preview…" : "Preview" }}
                </button>
              </div>
              <p v-if="model.reason" class="studio-muted text-xs mt-2">{{ model.reason }}</p>
              <p v-if="previewErrors[model.engine]" role="alert" class="studio-note mt-3">
                {{ previewErrors[model.engine] }}
              </p>
              <button
                v-if="previews[model.engine] && previews[model.engine].status !== 'complete'"
                type="button"
                @click="queue.show(previews[model.engine].id)"
              >
                View preview in queue
              </button>
              <audio
                v-if="previews[model.engine]?.status === 'complete'"
                :data-preview-audio="model.engine"
                class="mt-3 max-w-full"
                :src="studioApi.previewAudioUrl(activeId, previews[model.engine].id)"
                controls
                autoplay
                :aria-label="`${engineNames[model.engine] ?? model.engine} wakeword preview`"
              />
            </article>
          </div>
        </fieldset>
        <fieldset v-if="mossEnabled" class="studio-history">
          <legend>MOSS references</legend>
          <label
            >MOSS samples<input name="moss-samples" v-model.number="recipe.moss_samples" type="number" min="1" required
          /></label>
          <label class="studio-checkbox-label"
            ><input
              name="moss-after-current"
              type="checkbox"
              :checked="recipe.moss_after_current"
              @change="setMossMode(($event.target as HTMLInputElement).checked)"
            />Generate after current selection</label
          >
          <p v-if="recipe.moss_after_current" class="studio-muted">
            Uses only this submission’s direct providers after all succeed. Select completed sources instead to preview
            MOSS.
          </p>
          <div v-else data-source-picker>
            <p class="studio-muted">
              Select completed direct-provider datasets. Training selection is independent. MOSS needs at least one
              distinct reference clip per requested sample; duplicate clips count once.
            </p>
            <p v-if="sourceError" role="alert">{{ sourceError }}</p>
            <label v-for="source in sources" :key="source.id" class="studio-checkbox-label"
              ><input
                type="checkbox"
                :data-source="source.id"
                :checked="recipe.moss_source_batch_ids?.includes(source.id)"
                :disabled="
                  !recipe.moss_source_batch_ids?.includes(source.id) &&
                  (recipe.moss_source_batch_ids?.length ?? 0) >= 100
                "
                @change="toggleSource(source.id, ($event.target as HTMLInputElement).checked)"
              />{{ source.providers.map((p) => engineNames[p] ?? p).join(", ") }} · {{ source.sample_count }} clips ·
              {{ source.id }}</label
            >
            <p v-if="!sourceLoading && !sources.length">No eligible completed sources for this language.</p>
            <p>{{ recipe.moss_source_batch_ids?.length ?? 0 }} sources selected (maximum 100).</p>
            <PaginatedTable
              :total="sourceTotal"
              :offset="sourceOffset"
              :limit="50"
              :loading="sourceLoading"
              @page="sourceOffset = $event"
            />
          </div>
        </fieldset>
        <p class="studio-muted text-xs">
          Each direct provider generates the full samples per provider count into a separate dataset. Requested total:
          {{ requestedTotal }}. MOSS has its own count. Preview generates one sample without adding training data.
        </p>
        <button
          type="submit"
          data-action="generate"
          class="studio-primary justify-self-start"
          :aria-busy="saving || generationBusy"
          :disabled="saving || generationBusy || loading || !activeId"
        >
          {{ saving ? "Starting…" : generationBusy ? "Generating…" : "Generate dataset" }}
        </button>
      </form>
      <p v-if="error" class="studio-note mt-3" role="alert">{{ error }}</p>
      <button v-if="job" type="button" class="mt-3" @click="queue.show(job.id)">View generation in queue</button>
    </div>
    <div class="studio-card mt-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2>Generated datasets</h2>
        <button
          type="button"
          data-action="save-batches"
          class="studio-selection-action"
          :disabled="saving || loading || !activeId"
          @click="saveBatches"
        >
          Save selection
        </button>
      </div>
      <p class="studio-muted text-xs">Select completed datasets to include in this wakeword’s training.</p>
      <p v-if="loading" class="studio-muted mt-3">Loading datasets…</p>
      <article v-for="batch in batches" :key="batch.id" class="studio-history mt-3">
        <div class="studio-dataset-row">
          <label class="studio-checkbox-label"
            ><input
              :data-batch-id="batch.id"
              type="checkbox"
              :checked="selected.has(batch.id)"
              :disabled="batch.status !== 'complete'"
              @change="toggle(batch, ($event.target as HTMLInputElement).checked)"
            /><span
              ><strong>{{ batch.phrase }}</strong
              ><span class="studio-muted block text-xs"
                >{{ batch.audio.length }} samples ·
                {{
                  batch.recipe.engines?.map((engine) => engineNames[engine] ?? engine).join(", ") ||
                  "Saved generation models"
                }}
                · {{ absoluteTime(batch.created_at) }}</span
              ><span v-if="batch.status !== 'complete'" class="studio-muted block text-xs"
                >{{ batch.status }} — only completed datasets can be selected.</span
              ></span
            ><span class="studio-status ml-auto" :class="statusClass(batch.status)">{{ batch.status }}</span></label
          >
          <button
            type="button"
            :data-delete-batch="batch.id"
            :disabled="saving || ['queued', 'running', 'cancelling'].includes(batch.status)"
            @click="deleting = batch"
          >
            Delete dataset
          </button>
        </div>
        <p v-if="batch.recipe.moss_source_batch_ids?.length" class="studio-muted text-xs">
          MOSS sources: {{ batch.recipe.moss_source_batch_ids.join(", ") }}
        </p>
        <section
          v-if="deleting?.id === batch.id"
          role="alertdialog"
          aria-label="Delete generated dataset?"
          class="studio-note mt-3"
          @keydown.esc="!saving && (deleting = null)"
        >
          <h3>Delete {{ batch.phrase }} dataset permanently?</h3>
          <p>
            This removes the generated dataset and its training selection. Historical training inputs and shared audio
            are kept.
          </p>
          <div class="flex gap-2 mt-3">
            <button type="button" data-action="cancel-batch-delete" :disabled="saving" @click="deleting = null">
              Cancel</button
            ><button type="button" data-action="confirm-batch-delete" :disabled="saving" @click="deleteBatch">
              {{ saving ? "Deleting…" : "Delete permanently" }}
            </button>
          </div>
        </section>
      </article>
      <p v-if="!loading && !batches.length" class="studio-muted mt-3">
        No generated datasets yet. Choose models above to create one.
      </p>
      <PaginatedTable :total="total" :offset="offset" :limit="50" :loading="loading" @page="offset = $event" />
    </div>
  </section>
</template>
