<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { studioApi } from "../api";
import type { NotificationSettings, WorkspaceNotifications } from "../types";

const props = defineProps<{ wordId: string | null; phrase?: string }>();
const global = ref<NotificationSettings | null>(null);
const local = ref<WorkspaceNotifications | null>(null);
const url = ref("");
const clearUrl = ref(false);
const globalBusy = ref(false),
  localBusy = ref(false);
const globalError = ref(""),
  localError = ref("");
const error = ref(""),
  notice = ref("");
const saving = ref(false),
  testing = ref(false);
const busy = computed(() => globalBusy.value || localBusy.value || saving.value || testing.value);
let globalRequest: AbortController | undefined;
let localRequest: AbortController | undefined;
let globalVersion = 0,
  localVersion = 0;
const destinationUnsaved = computed(() => Boolean(url.value || clearUrl.value));
const rows = [
  { kind: "scrape", label: "Collection" },
  { kind: "classify", label: "Classification" },
  { kind: "train", label: "Training" },
  { kind: "deploy", label: "Deployment" },
] as const;

async function loadGlobal() {
  globalRequest?.abort();
  const request = new AbortController();
  globalRequest = request;
  const version = ++globalVersion;
  globalBusy.value = true;
  globalError.value = "";
  try {
    const result = await studioApi.notifications(request.signal);
    if (version === globalVersion && !request.signal.aborted) global.value = result;
  } catch {
    if (version === globalVersion && !request.signal.aborted)
      globalError.value = "Unable to load notification settings.";
  } finally {
    if (version === globalVersion) globalBusy.value = false;
  }
}

async function save() {
  if (!global.value || busy.value || (props.wordId && !local.value)) return;
  const id = props.wordId;
  const version = localVersion;
  const snapshot = local.value ? { ...local.value } : null;
  const request = new AbortController();
  globalRequest = request;
  saving.value = true;
  error.value = notice.value = "";
  let globalSaved = false;
  try {
    const result = await studioApi.saveNotifications(
      {
        download: global.value.download,
        ...(clearUrl.value ? { apprise_url: "" } : url.value ? { apprise_url: url.value } : {}),
      },
      request.signal,
    );
    if (request.signal.aborted) return;
    global.value = result;
    url.value = "";
    clearUrl.value = false;
    globalSaved = true;
    if (id !== props.wordId || version !== localVersion) return;
    if (id && snapshot) {
      const localMutation = new AbortController();
      localRequest = localMutation;
      const result = await studioApi.saveWorkspaceNotifications(id, snapshot, localMutation.signal);
      if (version !== localVersion || localMutation.signal.aborted) return;
      local.value = result;
    }
    notice.value = "Notification settings saved.";
  } catch {
    if (request.signal.aborted || (globalSaved && version !== localVersion)) return;
    error.value = globalSaved
      ? "Global settings saved, but wakeword notifications were not saved. Try again."
      : "Settings were not saved. Check the Apprise URL and try again.";
  } finally {
    saving.value = false;
  }
}

async function loadLocal() {
  localRequest?.abort();
  const version = ++localVersion;
  const id = props.wordId;
  local.value = null;
  localError.value = error.value = notice.value = "";
  localBusy.value = Boolean(id);
  if (!id) return;
  const request = new AbortController();
  localRequest = request;
  try {
    const result = await studioApi.workspaceNotifications(id, request.signal);
    if (version === localVersion && !request.signal.aborted) local.value = result;
  } catch {
    if (version === localVersion && !request.signal.aborted)
      localError.value = "Unable to load wakeword notifications.";
  } finally {
    if (version === localVersion) localBusy.value = false;
  }
}

async function test() {
  if (!global.value?.configured || destinationUnsaved.value || busy.value) return;
  const request = new AbortController();
  globalRequest = request;
  const version = localVersion;
  testing.value = true;
  error.value = notice.value = "";
  try {
    await studioApi.testNotification(props.wordId || undefined, request.signal);
    if (version === localVersion && !request.signal.aborted) notice.value = "Test notification sent.";
  } catch {
    if (version === localVersion && !request.signal.aborted)
      error.value = "Test notification failed. Check the saved Apprise URL and service availability.";
  } finally {
    testing.value = false;
  }
}

void loadGlobal();
watch(
  () => props.wordId,
  () => void loadLocal(),
  { immediate: true },
);
onBeforeUnmount(() => {
  globalVersion++;
  localVersion++;
  globalRequest?.abort();
  localRequest?.abort();
  url.value = "";
});
</script>

<template>
  <section data-notifications class="studio-card mt-4">
    <h2>Wakeword notifications</h2>
    <p class="studio-muted text-sm">
      Notify on completion and failure for manual and automatic runs. Settings apply to
      {{ phrase || "the selected wakeword" }}, except those marked global.
    </p>
    <p v-if="globalError" class="studio-note" role="alert">
      {{ globalError }} <button type="button" @click="loadGlobal">Retry</button>
    </p>
    <p v-if="localError" class="studio-note" role="alert">
      {{ localError }} <button type="button" @click="loadLocal">Retry</button>
    </p>
    <p v-if="error" class="studio-note" role="alert">{{ error }}</p>
    <p v-if="notice" class="studio-note" role="status">{{ notice }}</p>
    <p v-if="globalBusy || localBusy" role="status">Loading notification settings…</p>
    <form v-if="global" @submit.prevent="save" class="grid gap-3 mt-3">
      <fieldset :disabled="busy" class="grid gap-3">
        <legend class="sr-only">Notification settings</legend>
        <label
          >Apprise URL (global)
          <input
            v-model="url"
            name="apprise-url"
            type="text"
            autocomplete="off"
            spellcheck="false"
            maxlength="4096"
            :disabled="clearUrl"
            :placeholder="global.configured ? 'URL saved; leave blank to keep it' : 'Enter an Apprise service URL'"
          />
        </label>
        <p class="studio-muted text-xs">
          {{
            global.configured
              ? "A notification destination is configured. The saved URL is never returned to the browser."
              : "No notification destination configured. Notifications stay off until a URL is saved."
          }}
        </p>
        <label v-if="global.configured" class="studio-checkbox-label"
          ><input v-model="clearUrl" name="clear-apprise-url" type="checkbox" />Clear saved URL (disables delivery for
          all wakewords)</label
        >
        <div v-if="local" class="grid gap-2 sm:grid-cols-2">
          <label v-for="row in rows" :key="row.kind" class="studio-checkbox-label">
            <input v-model="local[row.kind]" :name="`notify-${row.kind}`" type="checkbox" />{{ row.label }}
          </label>
        </div>
        <p v-else-if="!wordId" class="studio-muted text-xs">Choose a wakeword to configure its job notifications.</p>
        <label class="studio-checkbox-label">
          <input v-model="global.download" name="notify-download" type="checkbox" />Dataset downloads (global)
        </label>
      </fieldset>
      <p class="studio-muted text-xs">
        Dataset downloads include training and augmentation datasets. Sample generation, previews, skipped and cancelled
        runs never notify. Deployment reports verified delivery or terminal failure for each target.
      </p>
      <p v-if="destinationUnsaved" class="studio-muted text-xs">
        Save the destination before sending a test notification.
      </p>
      <div class="flex flex-wrap gap-3">
        <button type="submit" class="studio-primary" :disabled="busy || Boolean(wordId && !local)" :aria-busy="saving">
          Save notifications
        </button>
        <button
          type="button"
          data-action="test-notification"
          :disabled="busy || !global.configured || destinationUnsaved"
          :aria-busy="testing"
          @click="test()"
        >
          Send test notification
        </button>
      </div>
    </form>
  </section>
</template>
