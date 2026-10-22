<script setup lang="ts">
import ConfirmDialog from "../components/ConfirmDialog.vue";
import PageHeader from "../components/PageHeader.vue";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useDeviceRegistry } from "../devices";
import { studioApi, StudioApiError } from "../api";
import SampleTrimDialog from "../components/SampleTrimDialog.vue";
import PaginatedTable from "../components/PaginatedTable.vue";
import { useWorkspace } from "../workspace";
import type { Sample, SampleQuery } from "../types";

const workspace = useWorkspace();
const registry = useDeviceRegistry();
onMounted(() => {
  void registry.load();
});
const items = ref<Sample[]>([]);
const total = ref(0);
const offset = ref(0);
const limit = ref(25);
const loading = ref(false);
const error = ref("");
const status = ref("");
const filters = ref({ label: "", source: "", kind: "", after: "", before: "" });
const trimTarget = ref<Sample | null>(null);
const deleteTarget = ref<Sample | null>(null);
const audio = ref<HTMLAudioElement>();
const playingId = ref<string | null>(null);
const loadingAudioId = ref<string | null>(null);
let request: AbortController | undefined;
let mutation: AbortController | undefined;
let audioRequest: AbortController | undefined;
let audioUrl: string | undefined;
let generation = 0;
/** Date inputs mean the viewer's local day, matching how timestamps are displayed. */
const localDayBound = (day: string, time: string) => new Date(day + time).toISOString();
const query = computed<SampleQuery>(() => ({
  offset: offset.value,
  limit: Math.min(100, limit.value),
  ...(filters.value.label ? { label: filters.value.label } : {}),
  ...(filters.value.source ? { source: filters.value.source } : {}),
  ...(filters.value.kind ? { near_miss: filters.value.kind === "true" } : {}),
  ...(filters.value.after ? { after: localDayBound(filters.value.after, "T00:00:00") } : {}),
  ...(filters.value.before ? { before: localDayBound(filters.value.before, "T23:59:59.999") } : {}),
}));
function stopAudio(): void {
  audioRequest?.abort();
  audioRequest = undefined;
  const element = audio.value;
  if (element) {
    element.pause();
    element.removeAttribute("src");
  }
  if (audioUrl) URL.revokeObjectURL(audioUrl);
  audioUrl = undefined;
  playingId.value = null;
  loadingAudioId.value = null;
}
async function togglePlay(item: Sample): Promise<void> {
  if (playingId.value === item.id) {
    stopAudio();
    return;
  }
  stopAudio();
  const controller = new AbortController();
  audioRequest = controller;
  loadingAudioId.value = item.id;
  try {
    const response = await fetch(studioApi.audioUrl(item.word_id, item.id), {
      credentials: "same-origin",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("Audio could not be loaded.");
    const blob = await response.blob();
    if (controller.signal.aborted || !audio.value) return;
    audioUrl = URL.createObjectURL(blob);
    audio.value.src = audioUrl;
    playingId.value = item.id;
    await audio.value.play();
  } catch (cause) {
    if (!controller.signal.aborted) {
      stopAudio();
      error.value =
        cause instanceof DOMException
          ? "Playback was blocked or unavailable. Use Play to try again."
          : cause instanceof Error
            ? cause.message
            : "Audio could not be loaded.";
    }
  } finally {
    if (audioRequest === controller) loadingAudioId.value = null;
  }
}
function resetTransient(): void {
  trimTarget.value = null;
  deleteTarget.value = null;
  stopAudio();
  error.value = "";
}
async function load(): Promise<void> {
  request?.abort();
  const controller = new AbortController();
  request = controller;
  const current = ++generation;
  const word = workspace.selectedId.value;
  items.value = [];
  total.value = 0;
  resetTransient();
  if (!word) return;
  loading.value = true;
  try {
    const page = await studioApi.samples(word, query.value, controller.signal);
    if (!controller.signal.aborted && current === generation && workspace.selectedId.value === word) {
      items.value = Array.isArray(page.items) ? page.items : [];
      total.value = Number.isFinite(page.total) ? page.total : 0;
      offset.value = Number.isInteger(page.offset) ? page.offset : 0;
      limit.value = Number.isInteger(page.limit) && page.limit >= 1 && page.limit <= 100 ? page.limit : 25;
    }
  } catch (cause) {
    if (!controller.signal.aborted && current === generation)
      error.value = cause instanceof Error ? cause.message : "Samples could not be loaded.";
  } finally {
    if (!controller.signal.aborted && current === generation) loading.value = false;
  }
}
function replace(updated: Sample): void {
  items.value = items.value.map((item) => (item.id === updated.id ? updated : item));
}
async function save<T>(operation: (signal: AbortSignal) => Promise<T>): Promise<T | null> {
  mutation?.abort();
  const controller = new AbortController();
  mutation = controller;
  error.value = "";
  try {
    return await operation(controller.signal);
  } catch (cause) {
    if (!controller.signal.aborted) {
      if (cause instanceof StudioApiError && cause.status === 409) {
        const conflictMessage = "This sample changed elsewhere. The current page was reloaded.";
        await load();
        error.value = conflictMessage;
      } else error.value = "Sample changes were not saved. Try again.";
    }
    return null;
  }
}
async function relabel(item: Sample, event: Event): Promise<void> {
  const label = (event.target as HTMLSelectElement).value as "positive" | "negative" | "discarded";
  if (label === item.label) return;
  const updated = await save((signal) => studioApi.label(item.word_id, item.id, label, item.revision, signal));
  if (updated) {
    replace(updated);
    status.value = "Label saved.";
  }
}
async function trim(range: { start: number; end: number }): Promise<void> {
  const item = trimTarget.value;
  if (!item) return;
  const updated = await save((signal) =>
    studioApi.trim(item.word_id, item.id, range.start, range.end, item.revision, signal),
  );
  if (updated) {
    replace(updated);
    trimTarget.value = null;
    status.value = "Non-destructive trim saved.";
  }
}
async function remove(): Promise<void> {
  const item = deleteTarget.value;
  if (!item) return;
  const removed = await save((signal) => studioApi.deleteSample(item.word_id, item.id, item.revision, signal));
  if (removed !== null) {
    items.value = items.value.filter((current) => current.id !== item.id);
    total.value = Math.max(0, total.value - 1);
    deleteTarget.value = null;
    status.value = "Sample removed from this visible library.";
  }
}
function filterChanged(): void {
  offset.value = 0;
  void load();
}
function rowKind(item: Sample): string {
  return item.recording?.near_miss ? "close miss" : "activation";
}
const LABELS = { positive: "Positive", negative: "Negative", discarded: "Discarded" } as const;
const SOURCES: Record<string, string> = {
  diagnostic: "Kiosk",
  microphone: "Recorded",
  import: "Import",
  legacy: "Legacy",
};
function sourceLabel(item: Sample): string {
  if (item.source === "diagnostic" && item.recording) return registry.deviceLabel(item.recording.device_id);
  return SOURCES[item.source] ?? item.source;
}
watch(
  workspace.selectedId,
  () => {
    offset.value = 0;
    void load();
  },
  { immediate: true },
);
onBeforeUnmount(() => {
  request?.abort();
  mutation?.abort();
  stopAudio();
});
</script>

<template>
  <section>
    <PageHeader
      title="Samples"
      description="Library of collected, recorded and imported audio with non-destructive trims."
    />
    <p v-if="status" data-samples-status class="studio-note" role="status" aria-live="polite">{{ status }}</p>
    <p v-if="error" data-samples-error class="studio-note" role="alert" aria-live="assertive">{{ error }}</p>
    <div class="studio-card mb-4">
      <div data-sample-filters class="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <label
          >Label<select name="label" v-model="filters.label" @change="filterChanged">
            <option value="">All labels</option>
            <option value="pending">Pending</option>
            <option v-for="(name, value) in LABELS" :key="value" :value="value">{{ name }}</option>
          </select></label
        ><label
          >Source<select name="source" v-model="filters.source" @change="filterChanged">
            <option value="">All sources</option>
            <option v-for="value in ['diagnostic', 'microphone', 'import']" :key="value" :value="value">
              {{ SOURCES[value] }}
            </option>
          </select></label
        ><label
          >Kind<select name="kind" v-model="filters.kind" @change="filterChanged">
            <option value="">All kinds</option>
            <option value="true">Close miss</option>
            <option value="false">Activation</option>
          </select></label
        ><label>After<input name="after" v-model="filters.after" type="date" @input="filterChanged" /></label
        ><label>Before<input name="before" v-model="filters.before" type="date" @input="filterChanged" /></label>
      </div>
    </div>
    <audio ref="audio" data-audio-player preload="none" class="hidden" @ended="stopAudio" />
    <div class="studio-card overflow-x-auto" :aria-busy="loading" role="region" aria-label="Samples" tabindex="0">
      <p v-if="loading">Loading samples…</p>
      <table v-else class="studio-samples-table w-full text-sm">
        <thead>
          <tr>
            <th>Sample</th>
            <th>Label</th>
            <th>Source</th>
            <th>Revision</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id" :data-row-id="item.id">
            <td data-caption="Sample">
              {{ item.recording?.clip_id ?? item.id
              }}<small v-if="item.recording" class="block studio-muted"
                >{{ item.recording.phrase }} · {{ item.recording.engine }} · {{ rowKind(item) }}</small
              >
            </td>
            <td data-caption="Label">{{ item.label }}</td>
            <td data-caption="Source">
              {{ sourceLabel(item)
              }}<small v-if="item.capture" class="block studio-muted"
                >{{
                  item.capture.trim_method === "silero"
                    ? "VAD trim"
                    : item.capture.trim_method === "manual"
                      ? "Manual trim"
                      : "Full recording"
                }}
                · {{ item.capture.duration_s.toFixed(2) }} s original</small
              >
            </td>
            <td data-caption="Revision">rev {{ item.revision }}</td>
            <td data-caption="Actions">
              <div class="flex flex-wrap gap-1">
                <button
                  type="button"
                  data-action="play"
                  :disabled="loadingAudioId === item.id"
                  :aria-pressed="playingId === item.id"
                  :aria-label="playingId === item.id ? 'Stop sample' : 'Play sample'"
                  @click="togglePlay(item)"
                >
                  {{ loadingAudioId === item.id ? "Loading…" : playingId === item.id ? "Stop" : "Play" }}
                </button>
                <label
                  ><span class="sr-only">Relabel</span
                  ><select data-action="relabel" :value="item.label" @change="relabel(item, $event)">
                    <option v-if="item.label === 'pending'" value="pending" disabled>Set label…</option>
                    <option v-for="(name, value) in LABELS" :key="value" :value="value">{{ name }}</option>
                  </select></label
                >
                <button type="button" data-action="trim" @click="trimTarget = item">Trim</button>
                <button type="button" data-action="delete" @click="deleteTarget = item">Delete</button>
              </div>
            </td>
          </tr>
          <tr v-if="!items.length">
            <td colspan="5">No samples match these filters.</td>
          </tr>
        </tbody>
      </table>
      <PaginatedTable
        :total="total"
        :offset="offset"
        :limit="limit"
        :loading="loading"
        noun="samples"
        @page="
          offset = $event;
          load();
        "
      />
    </div>
    <SampleTrimDialog
      :src="trimTarget ? studioApi.audioUrl(trimTarget.word_id, trimTarget.id) : null"
      @save="trim($event)"
      @close="trimTarget = null"
    />
    <ConfirmDialog
      :open="!!deleteTarget"
      title="Remove sample?"
      label="Confirm sample deletion"
      confirm-label="Remove"
      confirm-action="confirm-delete"
      cancel-action="cancel-delete"
      @confirm="remove"
      @cancel="deleteTarget = null"
    >
      <p>This hides the sample but retains provenance and completed-run inputs.</p>
    </ConfirmDialog>
  </section>
</template>
