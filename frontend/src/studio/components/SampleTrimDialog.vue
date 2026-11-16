<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import SampleTrimEditor from "./SampleTrimEditor.vue";
import LabelToggle from "./LabelToggle.vue";
import { shortcutTarget } from "../shortcuts";
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
  /** Kiosk positives must fit the server's 2.9 s training window; other clips may be any length. */
  limitPositive?: boolean;
}>();
const emit = defineEmits<{
  save: [edit: { label: string; range: { start: number; end: number } | null }];
  close: [];
  undo: [];
}>();
const selection = ref<CaptureSelection | null>(null);
const initial = ref<CaptureSelection | null>(null);
const label = ref("");
const editor = ref<InstanceType<typeof SampleTrimEditor>>();
const dialog = ref<HTMLElement>();
// Take focus from the row's Edit button so shortcuts (Enter especially) act on the dialog.
watch(
  () => props.src,
  async (src) => {
    if (src) {
      await nextTick();
      dialog.value?.focus();
    }
  },
);
const maxDuration = computed(() => (props.limitPositive && label.value === "positive" ? 2.9 : undefined));
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
/** The Trim page's shortcuts: Space play/pause, R replay, [ / ] set edges, Enter save, Esc cancel. */
function onKeydown(event: KeyboardEvent): void {
  if (!props.src || event.isComposing || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
  const key = event.key.toLowerCase();
  if (key === "escape") {
    event.preventDefault();
    close();
    return;
  }
  if (event.shiftKey) return;
  const target = event.target instanceof Element ? event.target : null;
  const trimField = target?.matches('[name="trim-start"],[name="trim-end"]');
  const { typing, onControl } = shortcutTarget(event);
  if (typing && !(trimField && (key === "enter" || key === " "))) return;
  // Keyboard users still activate a focused button with Enter; mouse clicks never move focus onto one.
  if (onControl && key === "enter") return;
  if (![" ", "r", "[", "]", "enter"].includes(key)) return;
  event.preventDefault();
  if (props.disabled) return;
  if (key === "enter") save();
  else if (key === " ") editor.value?.toggle();
  else if (key === "r") editor.value?.playSelection();
  else if (key === "[") editor.value?.markStart();
  else editor.value?.markEnd();
}

document.addEventListener("keydown", onKeydown);
onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <div v-if="src" class="studio-modal-backdrop" @click.self="close">
    <section
      ref="dialog"
      class="studio-card studio-edit-dialog"
      role="dialog"
      aria-modal="true"
      aria-label="Edit sample"
      tabindex="-1"
    >
      <h2>
        Edit sample<small v-if="title" class="block studio-muted font-normal">{{ title }}</small>
      </h2>
      <div v-if="label" class="mb-4 flex flex-wrap items-center gap-3" @pointerdown.prevent>
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
        ref="editor"
        :src="src"
        :trim-start="trimStart"
        :trim-end="trimEnd"
        :disabled="disabled"
        interactive
        :max-duration="maxDuration"
        @selection="selection = $event"
      />
      <p class="studio-muted text-xs">Space play/pause · Enter save · Esc cancel</p>
      <!-- Mouse clicks keep shortcut focus off these buttons; Tab/Enter still activate them. -->
      <div class="mt-3 flex flex-wrap justify-end gap-2" @pointerdown.prevent>
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
          Save ↵
        </button>
      </div>
    </section>
  </div>
</template>
