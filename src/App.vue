<script setup lang="ts">
import { themeOverrides } from '@/theme/overrides';
import { useThemeStore } from '@/stores/theme';
import { datePtBR, ptBR } from 'naive-ui';

const themeStore = useThemeStore();
</script>

<template>
  <n-config-provider
    :theme="themeStore.theme"
    :theme-overrides="themeOverrides"
    :locale="ptBR"
    :date-locale="datePtBR"
  >
    <n-global-style />
    <n-message-provider>
      <n-notification-provider>
        <n-dialog-provider>
          <router-view />
        </n-dialog-provider>
      </n-notification-provider>
    </n-message-provider>
  </n-config-provider>
</template>
