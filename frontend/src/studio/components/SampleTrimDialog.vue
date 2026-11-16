<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import SampleTrimEditor from "./SampleTrimEditor.vue";
import LabelToggle from "./LabelToggle.vue";
import type { CaptureSelection } from "../types";

const LABELS = ["positive", "negative", "discarded"];
const props = defineProps<{
  src: string | null;
  title?: string;
  label?: string;
  disabled?: boolean;
  trimStart?: number | null;
  trimEnd?: number | null;
  /** Save the trim even when unchanged: accepting it as-is resolves a pending trim review. */
  confirmTrim?: boolean;
  undoable?: boolean;
}>();
const emit = defineEmits<{
  save: [edit: { label: string; range: { start: number; end: number } | null }];
  close: [];
  undo: [];
}>();
const selection = ref<CaptureSelection | null>(null);
const initial = ref<CaptureSelection | null>(null);
const label = ref("");
watch(
  () => [props.src, props.label, props.trimStart, props.trimEnd] as const,
  (now, before) => {
    label.value = props.label ?? "";
    // A new clip or trim reloads the editor, which reports a fresh baseline; otherwise the current one stands.
    const reloads = !before || now[0] !== before[0] || now[2] !== before[2] || now[3] !== before[3];
    initial.value = reloads ? null : selection.value;
  },
  { immediate: true },
);
watch(selection, (value) => {
  if (value && !initial.value) initial.value = value;
});
const trimChanged = computed(
  () =>
    props.confirmTrim ||
    (!!selection.value &&
      !!initial.value &&
      (selection.value.start_s !== initial.value.start_s || selection.value.end_s !== initial.value.end_s)),
);
const canSave = computed(
  () => !props.disabled && (trimChanged.value ? !!selection.value : label.value !== (props.label ?? "")),
);
function close(): void {
  if (!props.disabled) emit("close");
}
function save(): void {
  if (!canSave.value) return;
  const range =
    trimChanged.value && selection.value ? { start: selection.value.start_s, end: selection.value.end_s } : null;
  emit("save", { label: label.value, range });
}
function onKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape" && props.src) {
    event.preventDefault();
    close();
  }
}

document.addEventListener("keydown", onKeydown);
onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <div v-if="src" class="studio-modal-backdrop" @click.self="close">
    <section class="studio-card studio-edit-dialog" role="dialog" aria-modal="true" aria-label="Edit sample">
      <h2>
        Edit sample<small v-if="title" class="block studio-muted font-normal">{{ title }}</small>
      </h2>
      <div v-if="label" class="mb-4 flex flex-wrap items-center gap-3">
        <span class="studio-muted">Label</span>
        <LabelToggle
          v-model="label"
          :values="LABELS"
          group-label="Label"
          attribute="data-relabel"
          :disabled="disabled"
        />
      </div>
      <SampleTrimEditor
        :src="src"
        :trim-start="trimStart"
        :trim-end="trimEnd"
        :disabled="disabled"
        @selection="selection = $event"
      />
      <div class="flex flex-wrap justify-end gap-2">
        <button
          v-if="undoable"
          type="button"
          class="mr-auto"
          data-action="undo"
          :disabled="disabled"
          @click="emit('undo')"
        >
          Undo last change
        </button>
        <button type="button" :disabled="disabled" @click="close">Cancel</button>
        <button
          type="button"
          class="studio-primary"
          data-action="save-sample"
          :disabled="!canSave"
          :aria-busy="disabled"
          @click="save"
        >
          Save
        </button>
      </div>
    </section>
  </div>
</template>
