<script setup lang="ts">
const props = defineProps<{ total: number; offset: number; limit: number; loading?: boolean; noun?: string }>();
const emit = defineEmits<{ page: [offset: number] }>();
const first = () => props.total === 0 ? 0 : props.offset + 1;
const last = () => Math.min(props.offset + props.limit, props.total);
</script>

<template>
  <div class="studio-pagination" aria-live="polite">
    <span>{{ first() }}–{{ last() }} of {{ total }}</span>
    <div class="flex gap-2"><button type="button" data-action="previous-page" :disabled="loading || offset === 0" @click="emit('page', Math.max(0, offset - limit))">Previous</button><button type="button" data-action="next-page" :disabled="loading || offset + limit >= total" @click="emit('page', offset + limit)">Next</button></div>
  </div>
</template>
