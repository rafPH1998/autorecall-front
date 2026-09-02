<script setup lang="ts">
import QuickPlateOrder from '@/components/app/QuickPlateOrder.vue';
import { useAppStore } from '@/stores/app';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';
import { renderIcon } from '@/utils/icons';
import {
  BarChartOutline,
  BuildOutline,
  CalendarOutline,
  CarSportOutline,
  ChatbubblesOutline,
  ConstructOutline,
  HomeOutline,
  ListOutline,
  LogOutOutline,
  NotificationsOutline,
  PeopleOutline,
  SettingsOutline,
} from '@vicons/ionicons5';
import type { MenuOption } from 'naive-ui';
import { computed, h, onMounted, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';

const appStore = useAppStore();
const auth = useAuthStore();
const theme = useThemeStore();
const route = useRoute();
const router = useRouter();
const collapsed = ref(false);

onMounted(() => {
  if (!appStore.ready) appStore.bootstrap();
});

function item(label: string, path: string, icon: MenuOption['icon']): MenuOption {
  return {
    label: () => h(RouterLink, { to: path }, { default: () => label }),
    key: path,
    icon,
  };
}

const menuOptions = computed<MenuOption[]>(() => {
  const options: MenuOption[] = [
    { type: 'group', label: 'Início', key: 'inicio', children: [
      item('Dashboard', '/', renderIcon(HomeOutline)),
      item('Clientes', '/customers', renderIcon(PeopleOutline)),
      item('Veículos', '/vehicles', renderIcon(CarSportOutline)),
    ]},
    { type: 'group', label: 'Operação', key: 'operacao', children: [
      item('Ordens de serviço', '/orders', renderIcon(ConstructOutline)),
      item('Catálogo', '/services', renderIcon(ListOutline)),
      item('Manutenções', '/maintenance', renderIcon(CalendarOutline)),
    ]},
    { type: 'group', label: 'Relacionamento', key: 'relacionamento', children: [
      item('Contatos', '/contacts', renderIcon(ChatbubblesOutline)),
      item('Notificações', '/notifications', renderIcon(NotificationsOutline)),
      item('Relatórios', '/reports', renderIcon(BarChartOutline)),
    ]},
  ];
  if (auth.isAdmin) {
    options.push({
      type: 'group',
      label: 'Administração',
      key: 'admin',
      children: [item('Configurações', '/settings', renderIcon(SettingsOutline))],
    });
  }
  return options;
});

const activeKey = computed(() => {
  const path = route.path;
  if (path === '/') return '/';
  const prefixes = ['/customers', '/vehicles', '/orders', '/services', '/maintenance', '/contacts', '/notifications', '/reports', '/settings'];
  return prefixes.find((prefix) => path.startsWith(prefix)) ?? path;
});

const pageTitle = computed(() => (route.meta.title as string) || 'AutoRecall');
const unread = computed(() => appStore.notifications.filter((item) => !item.read).length);

function logout() {
  auth.logout();
  router.push('/auth/login');
}
</script>

<template>
  <n-layout has-sider class="app-shell">
    <n-layout-sider
      class="app-sider"
      bordered
      collapse-mode="width"
      :collapsed-width="72"
      :width="248"
      :collapsed="collapsed"
      show-trigger="bar"
      @collapse="collapsed = true"
      @expand="collapsed = false"
    >
      <div class="app-logo">
        <div class="app-logo-mark">AR</div>
        <span v-if="!collapsed" class="app-logo-name">AutoRecall</span>
      </div>
      <n-menu
        :collapsed="collapsed"
        :collapsed-width="72"
        :collapsed-icon-size="22"
        :options="menuOptions"
        :value="activeKey"
      />
    </n-layout-sider>

    <n-layout>
      <n-layout-header bordered class="app-header">
        <div>
          <div class="app-header-kicker">Painel AutoRecall</div>
          <div class="app-header-title">{{ pageTitle }}</div>
        </div>
        <n-space align="center" :size="16">
          <QuickPlateOrder compact />
          <n-badge :value="unread" :max="9" :show="unread > 0">
            <n-button quaternary circle @click="router.push('/notifications')">
              <template #icon><n-icon :component="NotificationsOutline" /></template>
            </n-button>
          </n-badge>
          <n-space align="center" :size="8">
            <n-text depth="3">Escuro</n-text>
            <n-switch v-model:value="theme.isDark" />
          </n-space>
          <n-button v-if="auth.isAdmin" quaternary @click="router.push('/settings')">
            <template #icon><n-icon :component="BuildOutline" /></template>
            {{ appStore.workshop.name }}
          </n-button>
          <n-text v-else depth="3">{{ appStore.workshop.name }}</n-text>
          <n-button quaternary circle @click="logout">
            <template #icon><n-icon :component="LogOutOutline" /></template>
          </n-button>
        </n-space>
      </n-layout-header>

      <n-layout-content class="app-content">
        <n-spin :show="appStore.loading && !appStore.ready">
          <router-view v-if="appStore.ready || !appStore.loading" />
          <div v-else style="padding: 48px 0; text-align: center">Carregando dados da oficina...</div>
        </n-spin>
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>
