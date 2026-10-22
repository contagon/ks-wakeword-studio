<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, ref, watch } from "vue";
import { pages, useStudioRoutes, type PageId } from "../routes";
import { createWorkspace, workspaceKey } from "../workspace";
import WakewordsPage from "../pages/WakewordsPage.vue";
import ClassifyPage from "../pages/ClassifyPage.vue";
import SamplesPage from "../pages/SamplesPage.vue";
import RecordPage from "../pages/RecordPage.vue";
import KiosksPage from "../pages/KiosksPage.vue";
import AutomatePage from "../pages/AutomatePage.vue";
import DeployPage from "../pages/DeployPage.vue";
import NegativeDatasetsPage from "../pages/NegativeDatasetsPage.vue";
import ArtificialPage from "../pages/ArtificialPage.vue";
import TrainPage from "../pages/TrainPage.vue";
import TestingPage from "../pages/TestingPage.vue";
import ThemeToggle from "./ThemeToggle.vue";
import { createJobQueue, jobQueueKey } from "../jobs";
import JobQueueDrawer from "./JobQueueDrawer.vue";

const routes = useStudioRoutes();
const workspace = createWorkspace(routes);
provide(workspaceKey, workspace);
const queue = createJobQueue();
provide(jobQueueKey, queue);
const { wakewords, selectedId, selected, loading, error, notice } = workspace;
const navigationOpen = ref(false);
const narrow = ref(false);
const toggle = ref<HTMLButtonElement>();
const content = ref<HTMLElement>();
const current = computed(() => pages.find((page) => page.id === routes.page.value)!);
const navigationHidden = computed(() => narrow.value && !navigationOpen.value);
const narrowQuery = typeof window.matchMedia === "function" ? window.matchMedia("(max-width: 650px)") : null;
function updateNarrow() {
  narrow.value = narrowQuery?.matches ?? false;
}
function closeNavigation() {
  navigationOpen.value = false;
  toggle.value?.focus();
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && navigationOpen.value) closeNavigation();
}
function navigate(id: PageId) {
  routes.navigate(id);
  navigationOpen.value = false;
  content.value?.focus();
}
watch(narrow, (isNarrow) => {
  if (!isNarrow) navigationOpen.value = false;
});
updateNarrow();
if (narrowQuery?.addEventListener) narrowQuery.addEventListener("change", updateNarrow);
else narrowQuery?.addListener(updateNarrow);
onMounted(() => {
  document.addEventListener("keydown", onKeydown);
  void workspace.load();
  queue.start();
});
onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKeydown);
  queue.stop();
  if (narrowQuery?.removeEventListener) narrowQuery.removeEventListener("change", updateNarrow);
  else narrowQuery?.removeListener(updateNarrow);
});
</script>

<template>
  <div class="studio-app" :class="{ 'is-narrow': narrow }">
    <div class="studio-layout" data-studio-background :inert="queue.open.value ? true : undefined">
      <a class="studio-skip" href="#studio-content" @click.prevent="content?.focus()">Skip to content</a>
      <aside class="studio-sidebar">
        <div class="flex items-center justify-between gap-3">
          <div class="studio-brand">◈ Wakeword Studio<small>LISTEN · REFINE · DEPLOY</small></div>
          <button
            v-if="narrow"
            ref="toggle"
            type="button"
            class="studio-menu"
            aria-controls="studio-navigation"
            :aria-expanded="navigationOpen"
            @click="navigationOpen = !navigationOpen"
          >
            Menu
          </button>
        </div>
        <nav id="studio-navigation" aria-label="Main navigation" :hidden="navigationHidden">
          <template v-for="(page, index) in pages" :key="page.id">
            <div
              v-if="(page.group === 'Data' || page.group === 'Models') && pages[index - 1]?.group !== page.group"
              class="studio-nav-label"
            >
              {{ page.group }}
            </div>
            <a
              :href="routes.href(page.id)"
              :data-page="page.id"
              :class="{
                active: current.id === page.id,
                'studio-sub': page.group === 'Data' || page.group === 'Models',
              }"
              :aria-current="current.id === page.id ? 'page' : undefined"
              @click.prevent="navigate(page.id)"
              >{{ page.name }}</a
            >
          </template>
        </nav>
        <p class="studio-sidebar-note">Independent workspaces.<br />Device selections stay unchanged.</p>
      </aside>
      <div class="studio-main">
        <header class="studio-header flex flex-wrap items-center justify-between gap-3">
          <div class="studio-muted text-xs">{{ current.group }} / {{ current.name }}</div>
          <div class="flex flex-wrap items-center gap-3">
            <label class="flex items-center gap-3 text-xs" for="studio-word"
              >WAKEWORD
              <select
                id="studio-word"
                :value="selectedId"
                :disabled="!wakewords.length"
                @change="workspace.select(($event.target as HTMLSelectElement).value)"
              >
                <option v-if="!wakewords.length" value="">No wakewords</option>
                <option v-for="word in wakewords" :key="word.id" :value="word.id">{{ word.phrase }}</option>
              </select> </label
            ><ThemeToggle /><button
              type="button"
              class="studio-queue-toggle"
              data-action="open-job-queue"
              aria-label="Open global job queue"
              aria-controls="studio-job-queue"
              :aria-expanded="queue.open.value"
              @click="queue.show()"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
                <path d="M8 6h13M8 12h13M8 18h13M3 6h1M3 12h1M3 18h1" /></svg
              ><span v-if="queue.activeCount.value" class="studio-queue-badge">{{ queue.activeCount.value }}</span
              ><span v-if="queue.error.value" title="Job queue unavailable" aria-label="Job queue unavailable">!</span>
            </button>
          </div>
        </header>
        <main id="studio-content" ref="content" class="studio-content" tabindex="-1">
          <p v-if="notice" role="status" class="studio-note">{{ notice }}</p>
          <div v-if="error" class="studio-note" role="alert">{{ error }}</div>
          <p v-if="loading" role="status">Loading workspaces…</p>
          <WakewordsPage v-if="current.id === 'wakewords'" />
          <ClassifyPage v-else-if="current.id === 'classify'" />
          <SamplesPage v-else-if="current.id === 'samples'" />
          <RecordPage v-else-if="current.id === 'manual'" />
          <KiosksPage v-else-if="current.id === 'kiosks'" />
          <AutomatePage v-else-if="current.id === 'automate'" />
          <DeployPage v-else-if="current.id === 'deploy'" />
          <NegativeDatasetsPage v-else-if="current.id === 'online-datasets'" />
          <ArtificialPage v-else-if="current.id === 'artificial'" />
          <TrainPage v-else-if="current.id === 'train'" />
          <TestingPage v-else-if="current.id === 'testing'" />
        </main>
      </div>
    </div>
    <JobQueueDrawer />
  </div>
</template>
