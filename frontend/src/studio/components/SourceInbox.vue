<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useDeviceRegistry } from '../devices';
const registry = useDeviceRegistry();
onMounted(() => { void registry.load(); });
import { studioApi } from '../api';
import { useWorkspace } from '../workspace';
import type { Recording } from '../types';
defineProps<{ recordings: Recording[]; busy: boolean; refreshing?: boolean }>();
const emit = defineEmits<{ assign: [Recording]; changed: []; refresh: [] }>();
const workspace = useWorkspace();
const mappingWords = ref<Record<string, string>>({}), saving = ref(''), error = ref('');
let mutation: AbortController | undefined;
watch(workspace.selectedId, () => { mutation?.abort(); saving.value = ''; error.value = ''; mappingWords.value = {}; });
async function map(recording: Recording) {
  const word = mappingWords.value[recording.id]; if (!word || saving.value) return;
  const controller = new AbortController(); mutation = controller; saving.value = recording.id; error.value = '';
  try { await studioApi.setSourceMapping(recording.device_id, { engine: recording.engine, source_phrase: recording.phrase, word_id: word }, controller.signal); if (!controller.signal.aborted) emit('changed'); }
  catch (cause) { if (!controller.signal.aborted) error.value = cause instanceof Error ? cause.message : 'Source mapping was not saved.'; }
  finally { if (mutation === controller) saving.value = ''; }
}
onBeforeUnmount(() => mutation?.abort());
</script>
<template><section class="studio-card"><div class="flex flex-wrap items-center justify-between gap-3"><h2>Unmapped recordings · Fleet-wide</h2><button data-action="refresh-unmapped" :disabled="refreshing || busy" @click="emit('refresh')">{{ refreshing ? 'Refreshing…' : 'Refresh inbox' }}</button></div><p class="studio-muted">Collection automatically matches unique wake phrases and model identifiers. Unknown or ambiguous matches stay here, never assigned just because a workspace is selected. Assign a recording now, or save an exact kiosk + engine + source-phrase mapping to override future matching.</p><p v-if="error" class="studio-note" role="alert">{{ error }}</p><article v-for="recording in recordings" :key="recording.id" :data-unmapped-id="recording.id" class="studio-mapping-row"><div><strong>{{ recording.phrase }}</strong><p class="studio-muted text-xs">{{ registry.deviceLabel(recording.device_id) }} · {{ recording.engine }}</p><button data-action="assign" :disabled="busy || !workspace.selectedId.value" @click="emit('assign', recording)">Assign to this wakeword</button></div><div><label>Source phrase → wakeword<select v-model="mappingWords[recording.id]" name="mapping-word"><option value="">Choose wakeword</option><option v-for="word in workspace.wakewords.value" :key="word.id" :value="word.id">{{ word.phrase }}</option></select></label><button class="mt-2" data-action="save-mapping" :disabled="!mappingWords[recording.id] || Boolean(saving)" @click="map(recording)">Save source mapping</button></div></article><p v-if="!recordings.length && !refreshing" class="studio-muted">No unmapped recordings.</p></section></template>
