<script setup lang="ts">
import ConfirmDialog from "../components/ConfirmDialog.vue";
import PageHeader from "../components/PageHeader.vue";
import { absoluteTime } from "../time";
import { nextTick, onScopeDispose, reactive, ref, watch } from "vue";
import { StudioApiError, studioApi } from "../api";
import { useWorkspace } from "../workspace";

const workspace = useWorkspace();
const { wakewords, selectedId, selected, summary, selectedLoading, selectedError, loading, error } = workspace;
const create = reactive({ phrase: "", language: "en" });
const saving = ref(false);
const formError = ref("");
const saved = ref("");
const confirmingDelete = ref(false);
let mutation: AbortController | undefined;
watch(selectedId, () => {
  mutation?.abort();
  saving.value = false;
  confirmingDelete.value = false;
  formError.value = "";
  saved.value = "";
});
onScopeDispose(() => {
  mutation?.abort();
});
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
    if (!controller.signal.aborted)
      formError.value =
        cause instanceof StudioApiError && cause.status === 409
          ? "Cancel queued or active jobs before deleting this workspace, then try again."
          : cause instanceof Error
            ? cause.message
            : "Unable to delete workspace.";
  } finally {
    if (mutation === controller) saving.value = false;
  }
}
async function save() {
  if (saving.value) return;
  const id = selectedId.value;
  const controller = new AbortController();
  mutation = controller;
  saving.value = true;
  saved.value = "";
  formError.value = "";
  try {
    const word = await studioApi.createWakeword({ ...create }, controller.signal);
    if (controller.signal.aborted || selectedId.value !== id) return;
    // Use mutation response; never derive stable identity from display text.
    workspace.wakewords.value = [...wakewords.value, word];
    create.phrase = "";
    // The request is finished: detach it so selecting the new word (which reloads it) can't abort it.
    mutation = undefined;
    saving.value = false;
    workspace.select(word.id);
    await nextTick(); // let the selection watcher reset transient messages first
    saved.value = "Workspace saved.";
  } catch (cause) {
    if (!controller.signal.aborted)
      formError.value = cause instanceof Error ? cause.message : "Unable to save workspace.";
  } finally {
    if (mutation === controller) saving.value = false;
  }
}
</script>

<template>
  <section>
    <PageHeader
      title="Wakewords"
      description="One workspace. Multiple wakewords. Separate recordings, schedules, and model versions."
    >
      <button data-action="refresh" :disabled="loading" @click="workspace.load()">Refresh workspaces</button>
    </PageHeader>
    <p v-if="!loading && !error && !wakewords.length" class="studio-card">
      No wakewords yet. Create your first workspace below.
    </p>
    <div class="grid gap-3 sm:grid-cols-2 mb-4">
      <button
        v-for="word in wakewords"
        :key="word.id"
        class="studio-card studio-word-card"
        :class="{ 'studio-selected': word.id === selectedId }"
        :aria-pressed="word.id === selectedId"
        @click="workspace.select(word.id)"
      >
        <span class="flex justify-between items-center gap-3"
          ><strong>{{ word.phrase }}</strong
          ><span class="studio-muted text-xs ml-auto">{{ word.language }}</span></span
        >
      </button>
    </div>
    <p v-if="selectedLoading" role="status">Loading selected workspace…</p>
    <div v-if="selectedError" role="alert" class="studio-note">
      {{ selectedError }} <button @click="workspace.refreshSelected()">Retry workspace</button>
    </div>
    <div v-if="summary && selected" class="studio-card mb-4">
      <div class="studio-section-header mb-3">
        <h2 class="min-w-0 break-words">{{ selected.phrase }} · Overview</h2>
        <button
          class="shrink-0"
          data-action="delete-workspace"
          type="button"
          :disabled="saving"
          @click="confirmingDelete = true"
        >
          Delete workspace
        </button>
      </div>
      <dl class="grid gap-3 sm:grid-cols-3 text-sm">
        <div>
          <dt class="studio-muted">Pending classification</dt>
          <dd>{{ summary.pending }} pending</dd>
        </div>
        <div>
          <dt class="studio-muted">Archived models</dt>
          <dd>{{ summary.modelCount }} versions</dd>
          <dd class="text-xs">
            {{
              summary.latestModel ? `Latest: ${absoluteTime(summary.latestModel.trained_at)}` : "No trained models yet"
            }}
          </dd>
        </div>
        <div>
          <dt class="studio-muted">Autotrain</dt>
          <dd>
            {{
              summary.schedule?.enabled ? `${summary.schedule.cron} · ${summary.schedule.timezone}` : "Not scheduled"
            }}
          </dd>
          <dd v-if="summary.schedule?.enabled" class="text-xs">
            Next: {{ absoluteTime(summary.schedule.next_run_at) }}
          </dd>
        </div>
      </dl>
    </div>
    <p v-if="formError && !confirmingDelete" role="alert" class="studio-note">{{ formError }}</p>
    <p v-if="saved" role="status" class="studio-note">{{ saved }}</p>
    <div class="grid gap-4">
      <form data-form="create" class="studio-card grid gap-3" @submit.prevent="save()">
        <h2>New wakeword</h2>
        <label
          >Display phrase<input v-model="create.phrase" name="phrase" required maxlength="200" autocomplete="off"
        /></label>
        <label>Language<input v-model="create.language" name="language" required autocomplete="off" /></label>
        <button class="studio-primary justify-self-start" :aria-busy="saving" :disabled="saving" type="submit">
          Create wakeword
        </button>
      </form>
    </div>
    <ConfirmDialog
      :open="confirmingDelete && !!selected"
      :title="`Delete ${selected?.phrase ?? 'workspace'} permanently?`"
      confirm-label="Permanently delete workspace"
      busy-label="Deleting…"
      :busy="saving"
      confirm-action="confirm-delete"
      cancel-action="cancel-delete"
      @confirm="deleteWorkspace"
      @cancel="confirmingDelete = false"
    >
      <p>
        This permanently deletes this workspace’s recordings, generated datasets, settings, schedules, jobs, and local
        model archives. This cannot be undone. Cancel queued or active jobs first.
      </p>
      <p class="studio-muted">Deployed kiosk files and shared datasets are not deleted.</p>
      <p v-if="formError" role="alert" class="studio-note">{{ formError }}</p>
    </ConfirmDialog>
  </section>
</template>
