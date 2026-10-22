<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { useJobQueue } from "../jobs";
import JobQueueCard from "./JobQueueCard.vue";

const queue = useJobQueue();
const panel = ref<HTMLElement>(),
  closeButton = ref<HTMLButtonElement>();
const running = computed(() => queue.activeJobs.value.filter((job) => job.status !== "queued"));
const queued = computed(() => queue.activeJobs.value.filter((job) => job.status === "queued"));
const selected = computed(() => {
  const id = queue.selectedJobId.value,
    job = queue.jobs.value[id];
  return job &&
    !queue.activeJobs.value.some((item) => item.id === id) &&
    !queue.history.value.some((item) => item.id === id)
    ? job
    : null;
});
let trigger: HTMLElement | null = null,
  overflow = "";
function close(): void {
  queue.open.value = false;
}
function keydown(event: KeyboardEvent): void {
  if (event.key === "Escape") {
    event.preventDefault();
    event.stopPropagation();
    close();
    return;
  }
  if (event.key !== "Tab") return;
  const controls = Array.from(
    panel.value?.querySelectorAll<HTMLElement>('button:not(:disabled), summary, a[href], [tabindex="0"]') ?? [],
  ).filter((el) => !el.closest("details:not([open])") || el.tagName === "SUMMARY");
  const first = controls[0],
    last = controls.at(-1);
  if (event.shiftKey && (document.activeElement === first || !panel.value?.contains(document.activeElement))) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && (document.activeElement === last || !panel.value?.contains(document.activeElement))) {
    event.preventDefault();
    first?.focus();
  }
}
function cleanup(): void {
  document.removeEventListener("keydown", keydown, true);
  document.body.style.overflow = overflow;
}
watch(
  queue.open,
  async (value) => {
    if (value) {
      trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      overflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", keydown, true);
      await nextTick();
      closeButton.value?.focus();
    } else {
      cleanup();
      await nextTick();
      if (trigger?.isConnected) trigger.focus();
      else document.querySelector<HTMLButtonElement>('[data-action="open-job-queue"]')?.focus();
    }
  },
  { flush: "sync" },
);
watch([queue.selectedJobId, queue.history, queue.loading], async () => {
  if (!queue.open.value || !queue.selectedJobId.value) return;
  await nextTick();
  Array.from(panel.value?.querySelectorAll<HTMLElement>("[data-job-id]") ?? [])
    .find((el) => el.dataset.jobId === queue.selectedJobId.value)
    ?.scrollIntoView?.({ block: "nearest" });
});
onBeforeUnmount(() => {
  if (queue.open.value) cleanup();
});
</script>

<template>
  <template v-if="queue.open.value">
    <div class="studio-queue-backdrop" data-job-queue-backdrop @click="close"></div>
    <aside
      id="studio-job-queue"
      ref="panel"
      class="studio-job-drawer"
      role="dialog"
      aria-modal="true"
      aria-label="Global job queue"
    >
      <header class="studio-queue-header">
        <div class="flex items-center justify-between gap-3">
          <h2>
            Job queue <span class="studio-queue-badge">{{ queue.activeCount.value }} active</span>
          </h2>
          <button
            ref="closeButton"
            type="button"
            data-action="close-job-queue"
            aria-label="Close job queue"
            @click="close"
          >
            ✕
          </button>
        </div>
        <p class="studio-muted text-xs">All kiosks · All followers · All wakewords</p>
      </header>
      <div class="studio-queue-content">
        <p v-if="queue.error.value" class="studio-note" role="alert">
          {{ queue.error.value }} <button type="button" @click="queue.refresh">Retry</button>
        </p>
        <template v-if="selected"
          ><h3 class="studio-queue-group">Selected job</h3>
          <JobQueueCard :job="selected"
        /></template>
        <template v-if="running.length"
          ><h3 class="studio-queue-group">Running · {{ running.length }}</h3>
          <JobQueueCard v-for="job in running" :key="job.id" :job="job"
        /></template>
        <template v-if="queued.length"
          ><h3 class="studio-queue-group">Queued · {{ queued.length }}</h3>
          <JobQueueCard v-for="job in queued" :key="job.id" :job="job"
        /></template>
        <template v-if="queue.history.value.length"
          ><h3 class="studio-queue-group">Recent history</h3>
          <JobQueueCard v-for="job in queue.history.value" :key="job.id" :job="job"
        /></template>
        <p
          v-if="
            !queue.activeCount.value &&
            !queue.history.value.length &&
            !selected &&
            !queue.loading.value &&
            !queue.error.value
          "
          class="studio-muted text-sm mt-4"
        >
          No jobs yet.
        </p>
        <button
          v-if="queue.hasMore.value"
          type="button"
          class="studio-queue-more"
          :disabled="queue.loading.value"
          @click="queue.loadMore"
        >
          Load older jobs
        </button>
      </div>
    </aside>
  </template>
</template>
