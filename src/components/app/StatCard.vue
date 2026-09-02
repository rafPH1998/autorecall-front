<script setup lang="ts">
import type { Component } from 'vue';

withDefaults(
  defineProps<{
    label: string;
    value: string | number;
    icon: Component;
    detail?: string;
    tone?: 'blue' | 'green' | 'orange' | 'red';
  }>(),
  { detail: '', tone: 'blue' },
);
</script>

<template>
  <n-card size="small" hoverable>
    <div class="flex items-start justify-between gap-3">
      <div>
        <div class="muted text-sm mb-2">{{ label }}</div>
        <div class="text-2xl font-semibold">{{ value }}</div>
        <div v-if="detail" class="muted text-sm mt-2">{{ detail }}</div>
      </div>
      <div class="stat-icon" :class="tone">
        <n-icon :component="icon" :size="22" />
      </div>
    </div>
  </n-card>
</template>
