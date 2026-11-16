<script setup lang="ts">
import PageHeader from "../components/PageHeader.vue";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useDeviceRegistry } from "../devices";
import { studioApi, StudioApiError } from "../api";
import SampleTrimDialog from "../components/SampleTrimDialog.vue";
import PaginatedTable from "../components/PaginatedTable.vue";
import { useWorkspace } from "../workspace";
import type { Sample, SampleQuery, SampleSort } from "../types";
import { absoluteTime } from "../time";
import { useJobQueue } from "../jobs";

const workspace = useWorkspace();
const jobs = useJobQueue();
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
const NO_FILTERS = {
  search: "",
  label: "",
  labelledBy: "",
  source: "",
  kind: "",
  after: "",
  before: "",
  trim: "",
};
const filters = ref({ ...NO_FILTERS });
const filtered = computed(() => Object.values(filters.value).some(Boolean));
const sort = ref<{ key: SampleSort; desc: boolean }>({ key: "date", desc: true });
const editTarget = ref<Sample | null>(null);
const audio = ref<HTMLAudioElement>();
const playingId = ref<string | null>(null);
const loadingAudioId = ref<string | null>(null);
let request: AbortController | undefined;
let mutation: AbortController | undefined;
let audioRequest: AbortController | undefined;
let audioUrl: string | undefined;
let generation = 0;
let refreshPending = false;
/** Filters are local minutes ("YYYY-MM-DDTHH:mm"), matching how timestamps are displayed; both ends inclusive. */
const localBound = (minute: string, seconds: string) => new Date(minute + seconds).toISOString();
const query = computed<SampleQuery>(() => ({
  offset: offset.value,
  limit: Math.min(100, limit.value),
  ...(filters.value.label ? { label: filters.value.label } : {}),
  ...(filters.value.search.trim() ? { search: filters.value.search.trim() } : {}),
  ...(filters.value.labelledBy ? { labelled_by: filters.value.labelledBy as "auto" | "manual" } : {}),
  ...(filters.value.trim ? { trim_source: filters.value.trim as SampleQuery["trim_source"] } : {}),
  // A single kiosk is "device:<id>": kiosk samples from that device only.
  ...(filters.value.source.startsWith("device:")
    ? { source: "diagnostic", device_id: filters.value.source.slice("device:".length) }
    : filters.value.source
      ? { source: filters.value.source }
      : {}),
  ...(filters.value.kind ? { near_miss: filters.value.kind === "true" } : {}),
  ...(filters.value.after ? { after: localBound(filters.value.after, ":00") } : {}),
  ...(filters.value.before ? { before: localBound(filters.value.before, ":59.999") } : {}),
  sort: sort.value.key,
  order: sort.value.desc ? "desc" : "asc",
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
  refreshPending = false;
  editTarget.value = null;
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
/** Trim first: a positive label can be what makes an untrimmed clip need review. */
async function saveEdit(edit: { label: string; range: { start: number; end: number } | null }): Promise<void> {
  const item = editTarget.value;
  if (!item) return;
  const updated = await save(async (signal) => {
    let current = item;
    if (edit.range) {
      current = await studioApi.trim(item.word_id, item.id, edit.range.start, edit.range.end, item.revision, signal);
      replace(current); // keep the row's revision in sync if the label change then fails
    }
    if (edit.label !== current.label)
      current = await studioApi.label(
        item.word_id,
        item.id,
        edit.label as keyof typeof LABELS,
        current.revision,
        signal,
      );
    return current;
  });
  if (updated) {
    replace(updated);
    closeEdit();
    status.value = "Sample saved. Trims are non-destructive.";
  }
}
function closeEdit(): void {
  editTarget.value = null;
  if (refreshPending) {
    refreshPending = false;
    void load();
  }
}
async function undo(item: Sample): Promise<void> {
  const updated = await save((signal) => studioApi.undo(item.word_id, item.id, item.revision, signal));
  if (updated) {
    stopAudio();
    replace(updated);
    if (editTarget.value?.id === updated.id) editTarget.value = updated;
    status.value = "Last change undone. The original audio is retained.";
  }
}
jobs.onFinished(
  (job) => job.kind === "classify" && job.word_id === workspace.selectedId.value,
  () => {
    if (editTarget.value) refreshPending = true;
    else void load();
  },
);
function filterChanged(): void {
  offset.value = 0;
  void load();
}
function clearFilters(): void {
  filters.value = { ...NO_FILTERS };
  filterChanged();
}
function sortBy(key: SampleSort): void {
  // Newest first is the useful first click for dates; everything else starts A–Z.
  sort.value = sort.value.key === key ? { key, desc: !sort.value.desc } : { key, desc: key === "date" };
  filterChanged();
}
const COLUMNS: { key: SampleSort; name: string }[] = [
  { key: "sample", name: "Sample" },
  { key: "source", name: "Source" },
  { key: "date", name: "Date" },
  { key: "label", name: "Label" },
  { key: "labelled_by", name: "Label source" },
  { key: "trim", name: "Trim" },
];
const LABELS = { positive: "Positive", negative: "Negative", discarded: "Discarded" } as const;
const LABEL_TONES: Record<string, string> = { positive: "success", negative: "failed", pending: "warning" };
const LABELLED_BY = { auto: "Automatic", manual: "Manual" } as const;
const TRIMS = { auto: "Automatic", manual: "Manual", untrimmed: "Untrimmed" } as const;
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
      description="Collected, recorded and imported audio. Scraped positives that need trim review are excluded from training; synthetic data is unchanged."
    >
      <button type="button" data-action="refresh" :disabled="loading" @click="load">Refresh</button>
    </PageHeader>
    <p v-if="status" data-samples-status class="studio-note" role="status" aria-live="polite">{{ status }}</p>
    <p v-if="error" data-samples-error class="studio-note" role="alert" aria-live="assertive">{{ error }}</p>
    <audio ref="audio" data-audio-player preload="none" class="hidden" @ended="stopAudio" />
    <div class="studio-card overflow-x-auto" :aria-busy="loading" role="region" aria-label="Samples" tabindex="0">
      <div class="studio-sample-summary">
        <span class="studio-muted" aria-live="polite">{{ loading ? "Loading…" : `${total} samples` }}</span>
        <button v-if="filtered" type="button" data-action="clear-filters" @click="clearFilters">Clear filters</button>
      </div>
      <table class="studio-samples-table w-full text-sm">
        <thead>
          <tr class="studio-sort-row">
            <th><span class="sr-only">Play</span></th>
            <th
              v-for="column in COLUMNS"
              :key="column.key"
              :aria-sort="sort.key === column.key ? (sort.desc ? 'descending' : 'ascending') : undefined"
            >
              <button type="button" class="studio-sort" :data-sort="column.key" @click="sortBy(column.key)">
                {{ column.name
                }}<span aria-hidden="true" class="studio-sort-arrow">{{
                  sort.key !== column.key ? "↕" : sort.desc ? "↓" : "↑"
                }}</span>
              </button>
            </th>
            <th><span class="sr-only">Edit</span></th>
          </tr>
          <!-- Each column's filter sits directly under its header; phones show these as a stacked grid. -->
          <tr data-sample-filters class="studio-filter-row">
            <th></th>
            <th data-caption="Sample">
              <input
                name="search"
                v-model="filters.search"
                type="search"
                aria-label="Search samples"
                placeholder="Search ID or phrase"
                @input="filterChanged"
              />
              <select name="kind" v-model="filters.kind" aria-label="Kind" @change="filterChanged">
                <option value="">All kinds</option>
                <option value="true">Close miss</option>
                <option value="false">Activation</option>
              </select>
            </th>
            <th data-caption="Source">
              <select name="source" v-model="filters.source" aria-label="Source" @change="filterChanged">
                <option value="">All sources</option>
                <optgroup label="Kiosks">
                  <option value="diagnostic">All kiosks</option>
                  <option v-for="device in registry.devices.value" :key="device.id" :value="`device:${device.id}`">
                    {{ registry.deviceLabel(device.id) }}
                  </option>
                </optgroup>
                <option v-for="value in ['microphone', 'import']" :key="value" :value="value">
                  {{ SOURCES[value] }}
                </option>
              </select>
            </th>
            <th data-caption="Date">
              <input
                name="after"
                v-model="filters.after"
                type="datetime-local"
                aria-label="On or after"
                title="On or after"
                @input="filterChanged"
              />
              <input
                name="before"
                v-model="filters.before"
                type="datetime-local"
                aria-label="On or before"
                title="On or before"
                @input="filterChanged"
              />
            </th>
            <th data-caption="Label">
              <select name="label" v-model="filters.label" aria-label="Label" @change="filterChanged">
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option v-for="(name, value) in LABELS" :key="value" :value="value">{{ name }}</option>
              </select>
            </th>
            <th data-caption="Label source">
              <select name="labelled-by" v-model="filters.labelledBy" aria-label="Label source" @change="filterChanged">
                <option value="">All</option>
                <option v-for="(name, value) in LABELLED_BY" :key="value" :value="value">{{ name }}</option>
              </select>
            </th>
            <th data-caption="Trim">
              <select name="trim" v-model="filters.trim" aria-label="Trim" @change="filterChanged">
                <option value="">All</option>
                <option v-for="(name, value) in TRIMS" :key="value" :value="value">{{ name }}</option>
              </select>
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td :colspan="COLUMNS.length + 2">Loading samples…</td>
          </tr>
          <tr v-for="item in loading ? [] : items" :key="item.id" :data-row-id="item.id">
            <td>
              <button
                type="button"
                data-action="play"
                class="studio-play"
                :disabled="loadingAudioId === item.id"
                :aria-pressed="playingId === item.id"
                :aria-label="playingId === item.id ? 'Stop sample' : 'Play sample'"
                @click="togglePlay(item)"
              >
                {{ loadingAudioId === item.id ? "…" : playingId === item.id ? "Stop" : "Play" }}
              </button>
            </td>
            <td data-caption="Sample">
              {{ item.recording?.clip_id ?? item.id
              }}<small v-if="item.recording" class="block studio-muted"
                >{{ item.recording.phrase }}<template v-if="item.recording.near_miss"> · close miss</template></small
              >
            </td>
            <td data-caption="Source">{{ sourceLabel(item) }}</td>
            <td data-caption="Date" class="whitespace-nowrap">
              {{ absoluteTime(item.recording?.timestamp ?? item.created_at) }}
            </td>
            <td data-caption="Label">
              <span class="studio-status" :class="`studio-status-${LABEL_TONES[item.label] ?? 'muted'}`">{{
                LABELS[item.label as keyof typeof LABELS] ?? "Pending"
              }}</span>
            </td>
            <td data-caption="Label source">{{ item.labelled_by ? LABELLED_BY[item.labelled_by] : "—" }}</td>
            <td data-caption="Trim">
              <span
                class="studio-status"
                :class="
                  item.trim_status === 'needs_review'
                    ? 'studio-status-warning'
                    : item.trim_source
                      ? 'studio-status-neutral'
                      : 'studio-status-muted'
                "
                :title="item.trim_status === 'needs_review' ? 'Needs trim review: excluded from training' : undefined"
                >{{ TRIMS[item.trim_source ?? "untrimmed"] }}</span
              >
              <small v-if="item.trim_status === 'needs_review'" class="block studio-muted">Needs review</small>
              <small v-else-if="item.trim_start_s != null && item.trim_end_s != null" class="block studio-muted">
                {{ item.trim_start_s.toFixed(2) }}–{{ item.trim_end_s.toFixed(2) }} s
              </small>
            </td>
            <td>
              <button type="button" data-action="edit" @click="editTarget = item">Edit</button>
            </td>
          </tr>
          <tr v-if="!loading && !items.length">
            <td :colspan="COLUMNS.length + 2">No samples match these filters.</td>
          </tr>
        </tbody>
      </table>
      <PaginatedTable
        :total="total"
        :offset="offset"
        :limit="limit"
        :loading="loading"
        @page="
          offset = $event;
          load();
        "
      />
    </div>
    <SampleTrimDialog
      :src="editTarget ? studioApi.trimAudioUrl(editTarget.word_id, editTarget.id) : null"
      :title="editTarget ? (editTarget.recording?.clip_id ?? editTarget.id) : undefined"
      :label="editTarget?.label"
      :trim-start="editTarget?.trim_start_s"
      :trim-end="editTarget?.trim_end_s"
      :confirm-trim="editTarget?.trim_status === 'needs_review'"
      :undoable="(editTarget?.revision ?? 0) > 0"
      @save="saveEdit"
      @undo="editTarget && undo(editTarget)"
      @close="closeEdit"
    />
  </section>
</template>
