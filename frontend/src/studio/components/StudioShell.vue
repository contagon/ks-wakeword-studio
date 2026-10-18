<script setup lang="ts">
import { computed, onMounted, provide, ref } from "vue";
import { pages, useStudioRoutes, type PageId } from "../routes";
import { createWorkspace, workspaceKey } from "../workspace";
import WakewordsPage from "../pages/WakewordsPage.vue";

const routes = useStudioRoutes();
const workspace = createWorkspace(routes);
provide(workspaceKey, workspace);
const { wakewords, selectedId, selected, loading, error, notice } = workspace;
const navigationOpen = ref(false);
const toggle = ref<HTMLButtonElement>();
const content = ref<HTMLElement>();
const current = computed(() => pages.find(page => page.id === routes.page.value)!);
function closeNavigation() { navigationOpen.value = false; toggle.value?.focus(); }
function navigate(id: PageId) {
  routes.navigate(id);
  navigationOpen.value = false;
  content.value?.focus();
}
onMounted(() => { void workspace.load(); });
</script>

<template>
  <div class="studio-app">
    <a class="studio-skip" href="#studio-content" @click.prevent="content?.focus()">Skip to content</a>
    <aside class="studio-sidebar">
      <div class="flex items-center justify-between gap-3">
        <div class="studio-brand">◈ Wakeword Studio<small>LISTEN · REFINE · DEPLOY</small></div>
        <button ref="toggle" class="studio-menu" aria-controls="studio-navigation" :aria-expanded="navigationOpen" @click="navigationOpen = !navigationOpen">Menu</button>
      </div>
      <nav id="studio-navigation" aria-label="Main navigation" :class="{ 'is-open': navigationOpen }" @keydown.esc="closeNavigation">
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
        <section v-else :key="`${current.id}:${selectedId}`">
          <h1>{{ current.name }}</h1>
          <p v-if="selected" class="studio-muted mb-4">Workspace: {{ selected.phrase }}</p>
          <div class="studio-card"><h2>Not implemented yet</h2><p>This page will be connected to the studio API in a later task. No actions are available here yet.</p></div>
        </section>
      </main>
    </div>
  </div>
</template>
