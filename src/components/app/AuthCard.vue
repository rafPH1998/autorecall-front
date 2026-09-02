<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();
</script>

<template>
  <div class="auth-shell">
    <n-card style="width: min(440px, 100%)" :bordered="false">
      <div class="flex items-center gap-3 mb-6">
        <div class="app-logo-mark">AR</div>
        <div>
          <div class="app-header-kicker">Painel AutoRecall</div>
          <div class="font-semibold">{{ title }}</div>
        </div>
      </div>
      <p v-if="description" class="muted mb-5">{{ description }}</p>
      <slot />
    </n-card>
  </div>
</template>
