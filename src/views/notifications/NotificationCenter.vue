<script setup lang="ts">
import PageHeader from '@/components/app/PageHeader.vue';
import StatusTag from '@/components/app/StatusTag.vue';
import { useAppStore } from '@/stores/app';
import { BuildOutline, ChatbubblesOutline, SettingsOutline } from '@vicons/ionicons5';
import { computed, ref } from 'vue';

const store = useAppStore();
const filter = ref<'Todas' | 'Não lidas' | 'Lidas'>('Todas');
const options = ['Todas', 'Não lidas', 'Lidas'] as const;

const filteredNotifications = computed(() =>
  store.notifications.filter((notification) => {
    if (filter.value === 'Não lidas') return !notification.read;
    if (filter.value === 'Lidas') return notification.read;
    return true;
  }),
);
const unreadCount = computed(() => store.notifications.filter((item) => !item.read).length);

const iconByType = {
  maintenance: BuildOutline,
  contact: ChatbubblesOutline,
  system: SettingsOutline,
};
</script>

<template>
  <PageHeader :description="`${unreadCount} notificação(ões) não lida(s).`">
    <template #actions>
      <n-button type="primary" :disabled="!unreadCount" @click="store.markAllNotificationsRead()">Marcar todas como lidas</n-button>
    </template>
  </PageHeader>

  <n-card>
    <n-radio-group v-model:value="filter" class="mb-5">
      <n-radio-button v-for="option in options" :key="option" :value="option">{{ option }}</n-radio-button>
    </n-radio-group>

    <div v-if="filteredNotifications.length" class="flex flex-col divide-y">
      <article
        v-for="notification in filteredNotifications"
        :key="notification.id"
        class="flex flex-col gap-3 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-start"
        :class="{ 'opacity-70': notification.read }"
      >
        <div class="stat-icon blue shrink-0">
          <n-icon :component="iconByType[notification.type]" :size="22" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="text-base font-semibold m-0">{{ notification.title }}</h2>
            <StatusTag :value="notification.read ? 'Lida' : 'Não lida'" />
          </div>
          <p class="muted my-2">{{ notification.description }}</p>
          <small class="muted">{{ notification.date }}</small>
        </div>
        <n-button
          v-if="!notification.read"
          text
          size="small"
          class="self-start"
          @click="store.markNotificationRead(notification.id)"
        >
          Marcar como lida
        </n-button>
      </article>
    </div>

    <div v-else class="py-12 text-center">
      <h2 class="text-lg font-medium mb-1 mt-4">Nenhuma notificação</h2>
      <p class="muted m-0">Não há itens para o filtro selecionado.</p>
    </div>
  </n-card>
</template>
