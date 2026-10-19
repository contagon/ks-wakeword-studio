<script setup lang="ts">
import { onScopeDispose, reactive, ref, watch } from "vue";
import { StudioApiError, studioApi } from "../api";
import { useWorkspace } from "../workspace";

const workspace = useWorkspace();
const { wakewords, selectedId, selected, summary, selectedLoading, selectedError, loading, error } = workspace;
const create = reactive({ phrase: "", language: "en" });
const edit = reactive({ phrase: "", language: "" });
const saving = ref(false);
const formError = ref("");
const saved = ref("");
const confirmingDelete = ref(false);
let mutation: AbortController | undefined;
watch(selected, word => { edit.phrase = word?.phrase ?? ""; edit.language = word?.language ?? ""; }, { immediate: true });
watch(selectedId, () => { mutation?.abort(); saving.value = false; confirmingDelete.value = false; formError.value = ""; saved.value = ""; });
onScopeDispose(() => { mutation?.abort(); });
async function deleteWorkspace() {
  if (!confirmingDelete.value || saving.value || !selectedId.value) return;
  const id = selectedId.value;
  const controller = new AbortController();
  mutation = controller;
  saving.value = true;
  formError.value = "";
  saved.value = "";
  try {
    await studioApi.deleteWakeword(id, controller.signal);
    if (controller.signal.aborted) return;
    workspace.remove(id);
  } catch (cause) {
    if (!controller.signal.aborted) formError.value = cause instanceof StudioApiError && cause.status === 409
      ? "Cancel queued or active jobs before deleting this workspace, then try again."
      : cause instanceof Error ? cause.message : "Unable to delete workspace.";
  } finally { if (mutation === controller) saving.value = false; }
}
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
    if (mode === "create") create.phrase = "";
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
        <p class="studio-muted text-xs mb-3">{{ word.language }}</p>
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
    <div class="grid gap-4 lg:grid-cols-2">
      <form data-form="create" class="studio-card grid gap-3" @submit.prevent="save('create')">
        <h2>New wakeword</h2>
        <label>Display phrase<input v-model="create.phrase" name="phrase" required maxlength="200" autocomplete="off"></label>
        <label>Language<input v-model="create.language" name="language" required autocomplete="off"></label>
        <button class="studio-primary justify-self-start" :disabled="saving" type="submit">Create wakeword</button>
      </form>
      <form v-if="selected" data-form="edit" class="studio-card grid gap-3" @submit.prevent="save('edit')">
        <h2>Edit {{ selected.phrase }}</h2>
        <label>Display phrase<input v-model="edit.phrase" name="phrase" required maxlength="200" autocomplete="off"></label>
        <label>Language<input v-model="edit.language" name="language" required autocomplete="off"></label>
        <p class="studio-muted text-xs">Changing the display phrase never renames deployed models or changes a kiosk’s enabled wakewords.</p>
        <button class="studio-primary justify-self-start" :disabled="saving" type="submit">Save changes</button>
        <button data-action="delete-workspace" type="button" :disabled="saving" @click="confirmingDelete = true">Delete workspace</button>
      </form>
    </div>
    <section v-if="confirmingDelete && selected" role="alertdialog" aria-labelledby="delete-heading" aria-describedby="delete-description" class="studio-card mt-4" @keydown.esc="!saving && (confirmingDelete = false)">
      <h2 id="delete-heading">Delete {{ selected.phrase }} permanently?</h2>
      <p id="delete-description">This permanently deletes this workspace’s recordings, generated datasets, settings, schedules, jobs, and local model archives. This cannot be undone. Cancel queued or active jobs first.</p>
      <p class="studio-muted">Deployed kiosk files and shared datasets are not deleted.</p>
      <div class="flex flex-wrap gap-3 mt-3">
        <button data-action="cancel-delete" type="button" :disabled="saving" @click="confirmingDelete = false">Cancel</button>
        <button data-action="confirm-delete" type="button" :disabled="saving" @click="deleteWorkspace">{{ saving ? 'Deleting…' : 'Permanently delete workspace' }}</button>
      </div>
    </section>
  </section>
</template>
