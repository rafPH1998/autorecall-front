<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    value: string | number;
    icon: string;
    detail?: string;
    tone?: 'blue' | 'green' | 'orange' | 'red';
  }>(),
  { detail: '', tone: 'blue' },
);
</script>

<template>
  <div class="card mb-0 h-full">
    <div class="flex justify-between mb-4">
      <div>
        <span class="block text-muted-color font-medium mb-3">{{ label }}</span>
        <div class="text-surface-900 dark:text-surface-0 font-semibold text-2xl">{{ value }}</div>
      </div>
      <div
        class="flex items-center justify-center rounded-border"
        :class="{
          'bg-blue-100 dark:bg-blue-400/10 text-blue-500': tone === 'blue',
          'bg-green-100 dark:bg-green-400/10 text-green-500': tone === 'green',
          'bg-orange-100 dark:bg-orange-400/10 text-orange-500': tone === 'orange',
          'bg-red-100 dark:bg-red-400/10 text-red-500': tone === 'red',
        }"
        style="width: 2.75rem; height: 2.75rem"
      >
        <i :class="[icon, 'text-xl!']" />
      </div>
    </div>
    <span class="text-muted-color">{{ detail }}</span>
  </div>
</template>
