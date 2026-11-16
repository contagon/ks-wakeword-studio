<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import SampleTrimEditor from "./SampleTrimEditor.vue";
import type { CaptureSelection } from "../types";

const props = defineProps<{
  src: string | null;
  disabled?: boolean;
  trimStart?: number | null;
  trimEnd?: number | null;
}>();
const emit = defineEmits<{ save: [range: { start: number; end: number }]; close: [] }>();
const selection = ref<CaptureSelection | null>(null);
function close(): void {
  if (!props.disabled) emit("close");
}
function save(): void {
  if (selection.value && !props.disabled) emit("save", { start: selection.value.start_s, end: selection.value.end_s });
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
    <section class="studio-card" role="dialog" aria-modal="true" aria-label="Trim audio">
      <SampleTrimEditor
        :src="src"
        :trim-start="trimStart"
        :trim-end="trimEnd"
        :disabled="disabled"
        @selection="selection = $event"
      />
      <div class="flex flex-wrap justify-end gap-2">
        <button type="button" :disabled="disabled" @click="close">Cancel</button>
        <button
          type="button"
          class="studio-primary"
          data-action="save-trim"
          :disabled="disabled || !selection"
          :aria-busy="disabled"
          @click="save"
        >
          Save trim
        </button>
      </div>
    </section>
  </div>
</template>
