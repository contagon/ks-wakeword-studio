<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { StudioApiError, studioApi } from "../api";
import { useWorkspace } from "../workspace";
import type { Batch, GenerationCapability, GenerationRecipe, Job, TtsMode } from "../types";
import PaginatedTable from "../components/PaginatedTable.vue";
import JobConsole from "../components/JobConsole.vue";

const workspace = useWorkspace();
const capabilities = ref<GenerationCapability[]>([]); const batches = ref<Batch[]>([]); const total = ref(0); const offset = ref(0); const recipe = ref<GenerationRecipe>({ language: "en", english_accent: "mixed", tts_mode: "hybrid", samples: 1, batch_size: 1 });
const selected = ref<Set<string>>(new Set()); const loading = ref(false); const saving = ref(false); const error = ref(""); const job = ref<Job | null>(null);
let loadRequest: AbortController | undefined; let mutationRequest: AbortController | undefined; let loadGeneration = 0; let mutationGeneration = 0;
const activeId = computed(() => workspace.selectedId.value); const word = computed(() => workspace.selected.value); const capability = computed(() => capabilities.value.find(item => item.language === recipe.value.language) ?? null);
const modes = computed(() => capability.value ? (Object.entries(capability.value.engines) as [TtsMode, string[]][]).filter(([, engines]) => engines.length) : []);
const accentEnabled = computed(() => Boolean(capability.value?.accent_applies) && recipe.value.tts_mode !== "piper");
function loadCurrent(id: string, token: number, controller: AbortController): boolean { return activeId.value === id && loadGeneration === token && !controller.signal.aborted; }
function mutationCurrent(id: string, token: number, controller: AbortController): boolean { return activeId.value === id && mutationGeneration === token && !controller.signal.aborted; }
function normalizeRecipe(): void { const cap = capability.value; if (!cap) return; if (!cap.engines[recipe.value.tts_mode].length) recipe.value.tts_mode = modes.value[0]?.[0] ?? "hybrid"; if (!accentEnabled.value) recipe.value.english_accent = "mixed"; }
function abortWorkspaceMutations(): void { mutationRequest?.abort(); mutationRequest = undefined; mutationGeneration += 1; saving.value = false; job.value = null; }
async function load(): Promise<void> {
  loadRequest?.abort(); const controller = new AbortController(); loadRequest = controller; const token = ++loadGeneration; const id = activeId.value;
  batches.value = []; selected.value = new Set(); total.value = 0; job.value = null; error.value = ""; if (!id) return; loading.value = true;
  try { const [catalog, saved, page] = await Promise.all([studioApi.generationCatalog(controller.signal), studioApi.generationRecipe(id, controller.signal).catch(cause => cause instanceof StudioApiError && cause.status === 404 ? null : Promise.reject(cause)), studioApi.batches(id, { offset: offset.value, limit: 50 }, controller.signal)]); if (!loadCurrent(id, token, controller)) return; capabilities.value = catalog; if (saved) recipe.value = saved; else { const language = workspace.selected.value?.language ?? catalog[0]?.language ?? "en"; recipe.value = { language, english_accent: "mixed", tts_mode: "hybrid", samples: 1, batch_size: 1 }; } normalizeRecipe(); batches.value = page.items; total.value = page.total; selected.value = new Set(page.items.filter(batch => batch.selected).map(batch => batch.id)); }
  catch (cause) { if (loadCurrent(id, token, controller)) error.value = cause instanceof Error ? cause.message : "Unable to load generation settings."; }
  finally { if (loadCurrent(id, token, controller)) loading.value = false; }
}
function updateMode(value: string): void { recipe.value.tts_mode = value as TtsMode; normalizeRecipe(); }
function updateLanguage(value: string): void { recipe.value.language = value; normalizeRecipe(); }
function valid(): boolean { if (!Number.isInteger(recipe.value.samples) || recipe.value.samples < 1 || !Number.isInteger(recipe.value.batch_size) || recipe.value.batch_size < 1) { error.value = "Sample count and batch size must be positive integers."; return false; } return true; }
async function save(startGeneration = false): Promise<void> {
  const id = activeId.value; if (!id || !valid()) return;
  mutationRequest?.abort(); const controller = new AbortController(); mutationRequest = controller; const token = ++mutationGeneration; const recipeToSave = { ...recipe.value }; saving.value = true; error.value = "";
  try { const saved = await studioApi.saveGenerationRecipe(id, recipeToSave, controller.signal); if (!mutationCurrent(id, token, controller)) return; recipe.value = saved;
    if (!startGeneration) return;
    const nextJob = await studioApi.generate(id, controller.signal); if (mutationCurrent(id, token, controller)) job.value = nextJob;
  } catch (cause) { if (mutationCurrent(id, token, controller)) error.value = cause instanceof Error ? cause.message : startGeneration ? "Generation job was not started." : "Recipe was not saved."; }
  finally { if (mutationCurrent(id, token, controller)) saving.value = false; }
}
function toggle(batch: Batch, checked: boolean): void { if (batch.status !== "complete") return; const next = new Set(selected.value); checked ? next.add(batch.id) : next.delete(batch.id); selected.value = next; }
async function saveBatches(): Promise<void> { const id = activeId.value; if (!id) return; mutationRequest?.abort(); const controller = new AbortController(); mutationRequest = controller; const token = ++mutationGeneration; const batchIds = [...selected.value]; saving.value = true;
  try { await studioApi.selectBatches(id, batchIds, controller.signal); if (mutationCurrent(id, token, controller)) await load(); } catch (cause) { if (mutationCurrent(id, token, controller)) error.value = cause instanceof Error ? cause.message : "Batch selection was not saved."; } finally { if (mutationCurrent(id, token, controller)) saving.value = false; }
}
watch(activeId, () => { abortWorkspaceMutations(); void load(); }, { immediate: true });
watch(offset, () => { void load(); });
onBeforeUnmount(() => { loadRequest?.abort(); mutationRequest?.abort(); });
</script>

<template>
  <section><div class="mb-4"><h1>Artificial</h1><p class="studio-muted">Saved generation recipes and retained synthetic batches are separate from human review.</p></div>
    <div class="studio-card"><h2>Generation recipe</h2><p data-generation-phrase class="studio-note">Phrase from selected workspace: <strong>{{ word?.phrase ?? "No workspace selected" }}</strong></p><form class="grid gap-3 mt-3" @submit.prevent="save(false)"><label>Language<select name="language" :value="recipe.language" @change="updateLanguage(($event.target as HTMLSelectElement).value)"><option v-for="entry in capabilities" :key="entry.language" :value="entry.language">{{ entry.name }}</option></select></label><label>Route<select name="tts-mode" :value="recipe.tts_mode" @change="updateMode(($event.target as HTMLSelectElement).value)"><option v-for="[mode, engines] in modes" :key="mode" :value="mode">{{ mode }} ({{ engines.join(", ") }})</option></select></label><label>English accent<select name="english-accent" v-model="recipe.english_accent" :disabled="!accentEnabled"><option v-for="accent in capability?.english_accents ?? []" :key="accent.code" :value="accent.code">{{ accent.label }}</option><option v-if="!accentEnabled" value="mixed">Not applicable</option></select></label><label>Samples<input v-model.number="recipe.samples" name="samples" type="number" min="1" required></label><label>Batch size<input v-model.number="recipe.batch_size" name="batch-size" type="number" min="1" required></label><div class="flex gap-2"><button type="submit" class="studio-primary" :disabled="saving">Save recipe</button><button type="button" data-action="generate" :disabled="saving || !activeId" @click="save(true)">Generate batch</button></div></form><p v-if="capability" class="studio-muted text-xs mt-3">Participating engines are shown from the server capability catalog. Accent applies only where supported; no pronunciation preview is offered.</p><p v-if="error" class="studio-note" role="alert">{{ error }}</p><JobConsole v-if="job" :job-id="job.id" /></div>
    <div class="studio-card mt-4"><div class="flex justify-between gap-3"><h2>Retained batches</h2><button type="button" :disabled="saving" @click="saveBatches">Save batch selection</button></div><p v-if="loading" class="studio-muted">Loading batches…</p><article v-for="batch in batches" :key="batch.id" class="studio-history mt-3"><label class="flex items-start gap-2"><input :data-batch-id="batch.id" type="checkbox" :checked="selected.has(batch.id)" :disabled="batch.status !== 'complete'" @change="toggle(batch, ($event.target as HTMLInputElement).checked)"><span><strong>{{ batch.phrase }}</strong><span class="studio-muted block text-xs">{{ batch.status }} · {{ batch.audio.length }} validated samples · {{ batch.created_at }}</span><span v-if="batch.status !== 'complete'" class="studio-note block text-xs">Only complete, atomically committed batches can be selected.</span></span></label></article><p v-if="!loading && !batches.length" class="studio-muted mt-3">No generated batches for this workspace yet.</p><PaginatedTable :total="total" :offset="offset" :limit="50" :loading="loading" @page="offset = $event" /></div>
  </section>
</template>
