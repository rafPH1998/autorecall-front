<script setup lang="ts">
import { ref } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

const model = ref([
  {
    label: 'Início',
    items: [
      { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' },
      { label: 'Usuários', icon: 'pi pi-fw pi-users', to: '/users' },
    ],
  },
  {
    label: 'Conta',
    items: [{ label: 'Login', icon: 'pi pi-fw pi-sign-in', to: '/auth/login' }],
  },
]);
</script>

<template>
  <ul class="layout-menu">
    <template v-for="item in model" :key="item.label">
      <AppMenuItem :item="item" />
    </template>
  </ul>
</template>
