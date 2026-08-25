<script setup lang="ts">
import { ref } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

const model = ref([
  {
    label: 'Início',
    items: [
      { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' },
      { label: 'Clientes', icon: 'pi pi-fw pi-users', to: '/customers' },
      { label: 'Veículos', icon: 'pi pi-fw pi-car', to: '/vehicles' },
    ],
  },
  {
    label: 'Operação',
    items: [
      { label: 'Ordens de serviço', icon: 'pi pi-fw pi-wrench', to: '/orders' },
      { label: 'Catálogo de serviços', icon: 'pi pi-fw pi-list-check', to: '/services' },
      { label: 'Manutenções', icon: 'pi pi-fw pi-calendar-clock', to: '/maintenance' },
    ],
  },
  {
    label: 'Relacionamento',
    items: [
      { label: 'Contatos e campanhas', icon: 'pi pi-fw pi-whatsapp', to: '/contacts' },
      { label: 'Notificações', icon: 'pi pi-fw pi-bell', to: '/notifications' },
      { label: 'Relatórios', icon: 'pi pi-fw pi-chart-bar', to: '/reports' },
    ],
  },
  {
    label: 'Administração',
    items: [
      { label: 'Configurações', icon: 'pi pi-fw pi-cog', to: '/settings' },
    ],
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
