<script setup lang="ts">
import { onScopeDispose, reactive, ref, watch } from "vue";
import { StudioApiError, studioApi } from "../api";
import type { LegacyInventory, MigrationReport } from "../types";
import { useWorkspace } from "../workspace";

const workspace = useWorkspace();
const { wakewords, selectedId, selected, summary, selectedLoading, selectedError, loading, error } = workspace;
const create = reactive({ phrase: "", language: "en", model_id: "" });
const edit = reactive({ phrase: "", language: "" });
const saving = ref(false);
const formError = ref("");
const saved = ref("");
const inventory = ref<LegacyInventory | null>(null);
const migrationReport = ref<MigrationReport | null>(null);
const migrationLoading = ref(false);
const migrationSaving = ref(false);
const migrationError = ref("");
const phraseAssignments = reactive<Record<string, string>>({});
const modelAssignments = reactive<Record<string, string>>({});
let mutation: AbortController | undefined;
let migrationRequest: AbortController | undefined;
watch(selected, word => { edit.phrase = word?.phrase ?? ""; edit.language = word?.language ?? ""; });
watch(selectedId, () => { mutation?.abort(); saving.value = false; formError.value = ""; saved.value = ""; });
async function loadMigration() {
  migrationRequest?.abort();
  const controller = new AbortController();
  migrationRequest = controller;
  migrationLoading.value = true;
  migrationError.value = "";
  try {
    const loaded = await studioApi.migration(controller.signal);
    if (controller.signal.aborted) return;
    inventory.value = loaded;
    for (const phrase of loaded.phrases) phraseAssignments[phrase] ??= "";
    for (const model of loaded.models) modelAssignments[model] ??= "";
  } catch (cause) {
    if (!controller.signal.aborted && cause instanceof StudioApiError && cause.status === 404) inventory.value = null;
    else if (!controller.signal.aborted) migrationError.value = cause instanceof Error ? cause.message : "Unable to inspect legacy files.";
  } finally { if (migrationRequest === controller) migrationLoading.value = false; }
}
function migrationReady(): boolean {
  const data = inventory.value;
  return Boolean(selectedId.value && data && data.phrases.every(phrase => phraseAssignments[phrase] === selectedId.value)
    && data.models.every(model => !data.requires_model_assignment || modelAssignments[model] === selectedId.value));
}
async function importLegacy() {
  if (!migrationReady() || migrationSaving.value) return;
  const controller = new AbortController();
  migrationRequest?.abort(); migrationRequest = controller;
  migrationSaving.value = true; migrationError.value = "";
  try {
    const report = await studioApi.importLegacy({ word_id: selectedId.value, phrase_assignments: { ...phraseAssignments }, model_assignments: { ...modelAssignments } }, controller.signal);
    if (!controller.signal.aborted) { migrationReport.value = report; await workspace.refreshSelected(); }
  } catch (cause) {
    if (!controller.signal.aborted) migrationError.value = cause instanceof Error ? cause.message : "Unable to import legacy files.";
  } finally { if (migrationRequest === controller) migrationSaving.value = false; }
}
void loadMigration();
onScopeDispose(() => { mutation?.abort(); migrationRequest?.abort(); });
async function save(mode: "create" | "edit") {
  if (saving.value) return;
  const id = selectedId.value;
  const controller = new AbortController();
  mutation = controller;
  saving.value = true;
  saved.value = "";
  formError.value = "";
  try {
    const word = mode === "create"
      ? await studioApi.createWakeword({ ...create }, controller.signal)
      : await studioApi.updateWakeword(id, { ...edit }, controller.signal);
    if (controller.signal.aborted || selectedId.value !== id) return;
    // Use mutation response; never derive stable identity from display text.
    workspace.wakewords.value = mode === "create" ? [...wakewords.value, word] : wakewords.value.map(w => w.id === word.id ? word : w);
    if (mode === "create") { create.phrase = ""; create.model_id = ""; }
    workspace.select(word.id);
    await workspace.refreshSelected();
    if (!controller.signal.aborted) saved.value = "Workspace saved.";
  } catch (cause) {
    if (!controller.signal.aborted) formError.value = cause instanceof Error ? cause.message : "Unable to save workspace.";
  } finally { if (mutation === controller) saving.value = false; }
}
</script>

<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div><h1>Wakewords</h1><p class="studio-muted">One workspace. Multiple wakewords. Separate recordings, schedules, and model versions.</p></div>
      <button data-action="refresh" :disabled="loading" @click="workspace.load()">Refresh workspaces</button>
    </div>
    <p v-if="!loading && !error && !wakewords.length" class="studio-card">No wakewords yet. Create your first workspace below.</p>
    <div class="grid gap-3 sm:grid-cols-2 mb-4">
      <article v-for="word in wakewords" :key="word.id" class="studio-card" :class="{ 'studio-selected': word.id === selectedId }">
        <h2>{{ word.phrase }}</h2>
        <p class="studio-muted text-xs mb-3">{{ word.language }} · Model ID: <code>{{ word.model_id }}</code></p>
        <button :aria-pressed="word.id === selectedId" @click="workspace.select(word.id)">{{ word.id === selectedId ? 'Selected workspace' : 'Open workspace' }}</button>
      </article>
    </div>
    <p v-if="selectedLoading" role="status">Loading selected workspace…</p>
    <div v-if="selectedError" role="alert" class="studio-note">{{ selectedError }} <button @click="workspace.refreshSelected()">Retry workspace</button></div>
    <div v-if="summary && selected" class="studio-card mb-4">
      <h2>{{ selected.phrase }} · Overview</h2>
      <dl class="grid gap-3 sm:grid-cols-3 text-sm">
        <div><dt class="studio-muted">Pending classification</dt><dd>{{ summary.pending }} pending</dd></div>
        <div><dt class="studio-muted">Archived models</dt><dd>{{ summary.modelCount }} versions</dd><dd class="text-xs">{{ summary.latestModel ? `Latest: ${summary.latestModel.trained_at}` : 'No trained models yet' }}</dd></div>
        <div><dt class="studio-muted">Autotrain</dt><dd>{{ summary.schedule?.enabled ? `${summary.schedule.cron} · ${summary.schedule.timezone}` : 'Not scheduled' }}</dd><dd v-if="summary.schedule?.enabled" class="text-xs">Next: {{ summary.schedule.next_run_at }}</dd></div>
      </dl>
    </div>
    <p v-if="formError" role="alert" class="studio-note">{{ formError }}</p>
    <p v-if="saved" role="status" class="studio-note">{{ saved }}</p>
    <section class="studio-card mb-4" aria-labelledby="legacy-import-heading">
      <h2 id="legacy-import-heading">Legacy import</h2>
      <p class="studio-muted text-sm">Inspect former singleton files without changing them, then copy selected content into the chosen workspace with legacy provenance.</p>
      <p v-if="migrationLoading" role="status">Inspecting legacy inventory…</p>
      <p v-else-if="migrationError" role="alert" class="studio-note">{{ migrationError }} <button type="button" @click="loadMigration">Retry</button></p>
      <template v-else-if="inventory">
        <p>{{ inventory.counts.personal + inventory.counts.negative + inventory.counts.captured }} audio files · {{ inventory.counts.models }} model archives</p>
        <div v-if="inventory.phrases.length || inventory.models.length" class="grid gap-3 mt-3">
          <label v-for="phrase in inventory.phrases" :key="phrase">Assign legacy phrase “{{ phrase }}”
            <input :name="`legacy-phrase-${phrase}`" :value="phraseAssignments[phrase]" list="legacy-workspaces" autocomplete="off" @input="phraseAssignments[phrase] = ($event.target as HTMLInputElement).value">
          </label>
          <label v-for="model in inventory.models" :key="model">Assign legacy model “{{ model }}”
            <input :name="`legacy-model-${model}`" :value="modelAssignments[model]" list="legacy-workspaces" autocomplete="off" @input="modelAssignments[model] = ($event.target as HTMLInputElement).value">
          </label>
          <datalist id="legacy-workspaces"><option v-for="word in wakewords" :key="word.id" :value="word.id">{{ word.phrase }}</option></datalist>
        </div>
        <button data-action="legacy-import" class="studio-primary mt-3" type="button" :disabled="!migrationReady() || migrationSaving" @click="importLegacy">{{ migrationSaving ? 'Importing…' : 'Import into selected workspace' }}</button>
        <p v-if="migrationReport" role="status" class="studio-note">Imported {{ migrationReport.imported_samples }} samples and {{ migrationReport.imported_models }} archived model{{ migrationReport.imported_models === 1 ? '' : 's' }}. Originals remain preserved.</p>
      </template>
    </section>
    <div class="grid gap-4 lg:grid-cols-2">
      <form data-form="create" class="studio-card grid gap-3" @submit.prevent="save('create')">
        <h2>New wakeword</h2>
        <label>Display phrase<input v-model="create.phrase" name="phrase" required maxlength="200" autocomplete="off"></label>
        <label>Language<input v-model="create.language" name="language" required autocomplete="off"></label>
        <label>Stable model ID<input v-model="create.model_id" name="model_id" required autocomplete="off" aria-describedby="model-id-help"></label>
        <p id="model-id-help" class="studio-muted text-xs">Set once at creation. Editing the display phrase never renames a deployed model.</p>
        <button class="studio-primary justify-self-start" :disabled="saving" type="submit">Create wakeword</button>
      </form>
      <form v-if="selected" data-form="edit" class="studio-card grid gap-3" @submit.prevent="save('edit')">
        <h2>Edit {{ selected.phrase }}</h2>
        <label>Display phrase<input v-model="edit.phrase" name="phrase" required maxlength="200" autocomplete="off"></label>
        <label>Language<input v-model="edit.language" name="language" required autocomplete="off"></label>
        <label>Stable model ID<input :value="selected.model_id" name="model_id" readonly></label>
        <p class="studio-muted text-xs">The model ID is immutable. Source mappings are managed separately; changing context never changes a kiosk’s enabled wakewords.</p>
        <button class="studio-primary justify-self-start" :disabled="saving" type="submit">Save changes</button>
      </form>
    </div>
  </section>
</template>
