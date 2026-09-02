<script setup lang="ts">
import OnboardingChecklist from '@/components/app/OnboardingChecklist.vue';
import PageHeader from '@/components/app/PageHeader.vue';
import QuickPlateOrder from '@/components/app/QuickPlateOrder.vue';
import StatCard from '@/components/app/StatCard.vue';
import { api } from '@/services/api';
import { useAppStore } from '@/stores/app';
import type { Contact } from '@/types/domain';
import { AlertCircleOutline, CalendarOutline, DocumentTextOutline, LogoWhatsapp, WalletOutline } from '@vicons/ionicons5';
import { NButton, type DataTableColumns, useMessage } from 'naive-ui';
import { computed, h, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const store = useAppStore();
const router = useRouter();
const message = useMessage();
const contactingId = ref<string | null>(null);
const metrics = ref({
  overdueMaintenances: 0,
  upcomingMaintenances: 0,
  openOrders: 0,
  revenueAtRisk: 0,
  unpricedOverdue: 0,
});
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function parseBrDate(value: string) {
  const [day, month, year] = value.split('/').map(Number);
  return new Date(year, month - 1, day);
}

function isInactive(lastVisit: string) {
  if (!lastVisit || lastVisit === 'Sem visitas') return true;
  const date = parseBrDate(lastVisit);
  if (Number.isNaN(date.getTime())) return true;
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return date < sixMonthsAgo;
}

function todayBr() {
  return new Date().toLocaleDateString('pt-BR');
}

const overdueMaintenances = computed(() => store.maintenances.filter((item) => item.status === 'Atrasada'));
const upcomingCount = computed(() => store.maintenances.filter((item) => item.status === 'Próxima').length);
const openOrders = computed(() => store.orders.filter((item) => item.status !== 'Finalizada' && item.status !== 'Cancelada').length);
const contactedToday = computed(() => {
  const today = todayBr();
  return new Set(store.contacts.filter((item) => item.channel === 'WhatsApp' && item.date === today).map((item) => item.customerId));
});

const priorities = computed(() => {
  const overdueIds = new Set(overdueMaintenances.value.map((item) => item.customerId));
  const fromMaintenance = overdueMaintenances.value.map((item) => {
    const customer = store.customers.find((c) => c.id === item.customerId);
    const vehicle = store.vehicles.find((v) => v.id === item.vehicleId);
    return {
      id: `m-${item.id}`,
      customerId: item.customerId,
      serviceName: item.serviceName,
      name: customer?.name ?? 'Cliente',
      detail: vehicle ? `${vehicle.plate} · ${item.serviceName}` : item.serviceName,
      reason: 'Manutenção atrasada',
      when: item.dueDate,
    };
  });
  const fromInactivity = store.customers
    .filter((customer) => !overdueIds.has(customer.id) && isInactive(customer.lastVisit))
    .map((customer) => {
      const vehicle = store.vehicles.find((item) => item.customerId === customer.id);
      return {
        id: `c-${customer.id}`,
        customerId: customer.id,
        serviceName: '',
        name: customer.name,
        detail: vehicle ? `${vehicle.plate} · ${vehicle.brand} ${vehicle.model}` : customer.phone,
        reason: 'Sem retorno há 6 meses',
        when: customer.lastVisit,
      };
    });
  return [...fromMaintenance, ...fromInactivity].slice(0, 6);
});

const revenueDetail = computed(() => {
  if (!metrics.value.unpricedOverdue) return 'Manutenções atrasadas com preço no catálogo';
  return `${metrics.value.unpricedOverdue} sem preço no catálogo`;
});

type Priority = (typeof priorities.value)[number];

const columns = computed<DataTableColumns<Priority>>(() => [
  { title: 'Cliente', key: 'name' },
  { title: 'Veículo / serviço', key: 'detail' },
  { title: 'Motivo', key: 'reason' },
  { title: 'Data', key: 'when' },
  {
    title: '',
    key: 'actions',
    width: 140,
    render(row) {
      if (!row.customerId) return null;
      const already = contactedToday.value.has(row.customerId);
      return h(NButton, {
        size: 'small',
        tertiary: already,
        type: already ? 'default' : 'success',
        loading: contactingId.value === row.id,
        onClick: () => contactPriority(row),
      }, { default: () => (already ? 'Já avisado' : 'WhatsApp') });
    },
  },
]);

async function contactPriority(row: Priority) {
  if (!row.customerId || contactingId.value) return;
  contactingId.value = row.id;
  try {
    const saved = await api<Contact & { reused?: boolean; whatsappUrl?: string | null }>('/contacts/quick', {
      method: 'POST',
      body: JSON.stringify({ customerId: row.customerId, serviceName: row.serviceName || undefined }),
    });
    if (!store.contacts.some((item) => item.id === saved.id)) store.contacts.unshift(saved);
    if (saved.whatsappUrl) window.open(saved.whatsappUrl, '_blank', 'noopener,noreferrer');
    message[saved.reused ? 'info' : 'success'](saved.reused ? `${row.name} já recebeu contato hoje.` : `Mensagem pronta para ${row.name}.`);
  } catch (error) {
    message.error(error instanceof Error ? error.message : 'Tente novamente.');
  } finally {
    contactingId.value = null;
  }
}

onMounted(async () => {
  try {
    metrics.value = await api<typeof metrics.value>('/dashboard');
  } catch {
    metrics.value = {
      overdueMaintenances: overdueMaintenances.value.length,
      upcomingMaintenances: upcomingCount.value,
      openOrders: openOrders.value,
      revenueAtRisk: 0,
      unpricedOverdue: 0,
    };
  }
});
</script>

<template>
  <div>
    <PageHeader :description="store.workshop.name">
      <template #actions>
        <QuickPlateOrder />
        <n-button type="primary" @click="router.push('/orders/new')">Abrir OS</n-button>
      </template>
    </PageHeader>

    <OnboardingChecklist />

    <n-grid cols="1 s:2 l:4" responsive="screen" :x-gap="16" :y-gap="16" class="mb-5">
      <n-grid-item class="cursor-pointer" @click="router.push('/maintenance')">
        <StatCard label="Atrasadas" :value="metrics.overdueMaintenances" :icon="AlertCircleOutline" tone="red" />
      </n-grid-item>
      <n-grid-item class="cursor-pointer" @click="router.push('/maintenance')">
        <StatCard label="Próximas" :value="metrics.upcomingMaintenances" :icon="CalendarOutline" tone="orange" />
      </n-grid-item>
      <n-grid-item class="cursor-pointer" @click="router.push('/orders')">
        <StatCard label="OS em aberto" :value="metrics.openOrders" :icon="DocumentTextOutline" tone="blue" />
      </n-grid-item>
      <n-grid-item class="cursor-pointer" @click="router.push('/maintenance')">
        <StatCard label="Receita em risco" :value="currency.format(metrics.revenueAtRisk)" :icon="WalletOutline" tone="green" :detail="revenueDetail" />
      </n-grid-item>
    </n-grid>

    <n-card>
      <div class="flex items-center justify-between mb-4">
        <div class="font-semibold text-lg">Prioridades</div>
        <n-button text @click="router.push('/contacts')">
          <template #icon><n-icon :component="LogoWhatsapp" /></template>
          Ver contatos
        </n-button>
      </div>
      <n-data-table :columns="columns" :data="priorities" :bordered="false" :pagination="false" />
    </n-card>
  </div>
</template>
