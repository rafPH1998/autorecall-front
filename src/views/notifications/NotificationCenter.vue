<script setup lang="ts">
import PageHeader from '@/components/app/PageHeader.vue';
import StatusTag from '@/components/app/StatusTag.vue';
import { useAppStore } from '@/stores/app';
import { computed, ref } from 'vue';

const store = useAppStore();
const filter = ref<'Todas' | 'Não lidas' | 'Lidas'>('Todas');
const options = ['Todas', 'Não lidas', 'Lidas'];

const filteredNotifications = computed(() =>
  store.notifications.filter((notification) => {
    if (filter.value === 'Não lidas') return !notification.read;
    if (filter.value === 'Lidas') return notification.read;
    return true;
  }),
);
const unreadCount = computed(() => store.notifications.filter((item) => !item.read).length);

const iconByType = {
  maintenance: 'pi pi-wrench',
  contact: 'pi pi-comments',
  system: 'pi pi-cog',
};
</script>

<template>
  <PageHeader title="Notificações" :description="`${unreadCount} notificação(ões) não lida(s).`">
    <template #actions>
      <Button label="Marcar todas como lidas" icon="pi pi-check-circle" :disabled="!unreadCount" @click="store.markAllNotificationsRead()" />
    </template>
  </PageHeader>

  <div class="card">
    <SelectButton v-model="filter" :options="options" :allow-empty="false" class="mb-5" aria-label="Filtrar notificações" />

    <div v-if="filteredNotifications.length" class="flex flex-col divide-y divide-surface-200 dark:divide-surface-700">
      <article
        v-for="notification in filteredNotifications"
        :key="notification.id"
        class="flex flex-col gap-3 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-start"
        :class="{ 'opacity-70': notification.read }"
      >
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-400/10">
          <i :class="iconByType[notification.type]" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="text-base font-semibold m-0">{{ notification.title }}</h2>
            <StatusTag :value="notification.read ? 'Lida' : 'Não lida'" />
          </div>
          <p class="text-muted-color my-2">{{ notification.description }}</p>
          <small class="text-muted-color">{{ notification.date }}</small>
        </div>
        <Button
          v-if="!notification.read"
          label="Marcar como lida"
          icon="pi pi-check"
          text
          size="small"
          class="self-start"
          @click="store.markNotificationRead(notification.id)"
        />
      </article>
    </div>

    <div v-else class="py-12 text-center">
      <i class="pi pi-bell-slash text-5xl text-muted-color" />
      <h2 class="text-lg font-medium mb-1 mt-4">Nenhuma notificação</h2>
      <p class="text-muted-color m-0">Não há itens para o filtro selecionado.</p>
    </div>
  </div>
</template>
