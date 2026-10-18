<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, ref, watch } from "vue";
import { pages, useStudioRoutes, type PageId } from "../routes";
import { createWorkspace, workspaceKey } from "../workspace";
import WakewordsPage from "../pages/WakewordsPage.vue";
import ClassifyPage from "../pages/ClassifyPage.vue";
import SamplesPage from "../pages/SamplesPage.vue";
import ScrapePage from "../pages/ScrapePage.vue";
import DeployPage from "../pages/DeployPage.vue";
import LegacyTrainer from "../../LegacyTrainer.vue";
import type { ViewName } from "../../types";

const routes = useStudioRoutes();
const workspace = createWorkspace(routes);
provide(workspaceKey, workspace);
const { wakewords, selectedId, selected, loading, error, notice } = workspace;
const navigationOpen = ref(false);
const narrow = ref(false);
const toggle = ref<HTMLButtonElement>();
const content = ref<HTMLElement>();
const current = computed(() => pages.find(page => page.id === routes.page.value)!);
// Existing trainer workflows stay reachable until each Studio replacement is wired.
const legacyViews: Partial<Record<Exclude<PageId, "wakewords">, ViewName>> = {
  "negative-datasets": "data",
  artificial: "trainer",
  train: "trainer",
};
const legacyView = computed(() => current.value.id === "wakewords" ? null : legacyViews[current.value.id]);
const navigationHidden = computed(() => narrow.value && !navigationOpen.value);
const narrowQuery = typeof window.matchMedia === "function" ? window.matchMedia("(max-width: 650px)") : null;
function updateNarrow() { narrow.value = narrowQuery?.matches ?? false; }
function closeNavigation() { navigationOpen.value = false; toggle.value?.focus(); }
function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && navigationOpen.value) closeNavigation();
}
function navigate(id: PageId) {
  routes.navigate(id);
  navigationOpen.value = false;
  content.value?.focus();
}
watch(narrow, isNarrow => { if (!isNarrow) navigationOpen.value = false; });
updateNarrow();
narrowQuery?.addEventListener("change", updateNarrow);
onMounted(() => {
  document.addEventListener("keydown", onKeydown);
  void workspace.load();
});
onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKeydown);
  narrowQuery?.removeEventListener("change", updateNarrow);
});
</script>

<template>
  <div class="studio-app" :class="{ 'is-narrow': narrow }">
    <a class="studio-skip" href="#studio-content" @click.prevent="content?.focus()">Skip to content</a>
    <aside class="studio-sidebar">
      <div class="flex items-center justify-between gap-3">
        <div class="studio-brand">◈ Wakeword Studio<small>LISTEN · REFINE · DEPLOY</small></div>
        <button v-if="narrow" ref="toggle" type="button" class="studio-menu" aria-controls="studio-navigation" :aria-expanded="navigationOpen" @click="navigationOpen = !navigationOpen">Menu</button>
      </div>
      <nav id="studio-navigation" aria-label="Main navigation" :hidden="navigationHidden">
        <template v-for="(page, index) in pages" :key="page.id">
          <div v-if="index === 1" class="studio-nav-label">Data</div>
          <div v-if="index === 6" class="studio-nav-label">Models</div>
          <a :href="routes.href(page.id)" :data-page="page.id" :class="{ active: current.id === page.id, 'studio-sub': page.group === 'Data' }" :aria-current="current.id === page.id ? 'page' : undefined" @click.prevent="navigate(page.id)">{{ page.name }}</a>
        </template>
      </nav>
      <p class="studio-sidebar-note">Independent workspaces.<br>Device selections stay unchanged.</p>
    </aside>
    <div class="studio-main">
      <header class="studio-header flex flex-wrap items-center justify-between gap-3">
        <div class="studio-muted text-xs">{{ current.group }} / {{ current.name }}</div>
        <label class="flex items-center gap-3 text-xs" for="studio-word">WAKEWORD
          <select id="studio-word" :value="selectedId" :disabled="!wakewords.length" @change="workspace.select(($event.target as HTMLSelectElement).value)">
            <option v-if="!wakewords.length" value="">No wakewords</option>
            <option v-for="word in wakewords" :key="word.id" :value="word.id">{{ word.phrase }}</option>
          </select>
        </label>
      </header>
      <main id="studio-content" ref="content" class="studio-content" tabindex="-1">
        <p v-if="notice" role="status" class="studio-note">{{ notice }}</p>
        <div v-if="error" class="studio-note" role="alert">{{ error }}</div>
        <p v-if="loading" role="status">Loading workspaces…</p>
        <WakewordsPage v-if="current.id === 'wakewords'" />
        <ClassifyPage v-else-if="current.id === 'classify'" />
        <SamplesPage v-else-if="current.id === 'samples'" />
        <ScrapePage v-else-if="current.id === 'scrape'" />
        <DeployPage v-else-if="current.id === 'deploy'" />
        <template v-else>
          <section :key="`${current.id}:${selectedId}`">
            <h1>{{ current.name }}</h1>
            <p v-if="selected" class="studio-muted mb-4">Workspace: {{ selected.phrase }}</p>
            <div class="studio-card" data-studio-placeholder>
              <h2>Studio module not implemented yet</h2>
              <p>This page will be connected to the per-wakeword studio API in a later task. Until then, the existing single-trainer tools below remain available; they are not scoped to the selected workspace.</p>
            </div>
          </section>
          <LegacyTrainer v-if="legacyView" :view="legacyView" />
        </template>
      </main>
    </div>
  </div>
</template>
