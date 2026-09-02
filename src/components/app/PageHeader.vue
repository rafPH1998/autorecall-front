<script setup lang="ts">
defineProps<{
  title?: string;
  description?: string;
}>();
</script>

<template>
  <div class="page-toolbar">
    <div>
      <h2 v-if="title" class="m-0 text-lg font-semibold">{{ title }}</h2>
      <p v-if="description" class="muted m-0" :class="{ 'mt-1': title }">{{ description }}</p>
    </div>
    <n-space>
      <slot name="actions" />
    </n-space>
  </div>
</template>
