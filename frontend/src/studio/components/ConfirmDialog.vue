<script setup lang="ts">
import { nextTick, ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    confirmLabel: string;
    cancelLabel?: string;
    busy?: boolean;
    busyLabel?: string;
    label?: string;
    confirmAction?: string;
    cancelAction?: string;
  }>(),
  { cancelLabel: "Cancel", busy: false },
);
const emit = defineEmits<{ confirm: []; cancel: [] }>();
const dialog = ref<HTMLDialogElement>();

watch(
  () => props.open,
  async (open) => {
    if (!open) return;
    await nextTick();
    // A native modal dialog makes the rest of the app inert and handles focus itself.
    if (typeof dialog.value?.showModal === "function") dialog.value.showModal();
    else dialog.value?.setAttribute("open", "");
  },
  { immediate: true },
);
function cancel(): void {
  if (!props.busy) emit("cancel");
}
</script>

<template>
  <dialog
    v-if="open"
    ref="dialog"
    class="studio-confirm-dialog"
    role="alertdialog"
    aria-modal="true"
    :aria-label="label ?? title"
    @cancel.prevent="cancel"
    @keydown.esc.prevent="cancel"
    @click.self="cancel"
  >
    <div class="studio-card grid gap-3">
      <h2>{{ title }}</h2>
      <slot />
      <div class="flex flex-wrap justify-end gap-2">
        <button type="button" :data-action="cancelAction" :disabled="busy" @click="cancel">{{ cancelLabel }}</button>
        <button
          type="button"
          class="studio-danger"
          :data-action="confirmAction"
          :disabled="busy"
          :aria-busy="busy"
          @click="emit('confirm')"
        >
          {{ busy && busyLabel ? busyLabel : confirmLabel }}
        </button>
      </div>
    </div>
  </dialog>
</template>
