<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
    <div>
      <h1 class="text-2xl font-semibold m-0">{{ title }}</h1>
      <p v-if="description" class="text-muted-color mt-2 mb-0">{{ description }}</p>
    </div>
    <div class="flex flex-wrap gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
