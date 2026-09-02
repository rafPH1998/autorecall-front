<script setup lang="ts">
import PageHeader from '@/components/app/PageHeader.vue';
import QuickPlateOrder from '@/components/app/QuickPlateOrder.vue';
import StatusTag from '@/components/app/StatusTag.vue';
import { useAppStore } from '@/stores/app';
import type { OrderStatus, ServiceOrder } from '@/types/domain';
import { NButton, type DataTableColumns } from 'naive-ui';
import { computed, h, ref } from 'vue';
import { useRouter } from 'vue-router';

const store = useAppStore();
const router = useRouter();
const search = ref('');
const status = ref<OrderStatus | null>(null);
const period = ref<[number, number] | null>(null);
const statuses = ['Aberta', 'Em andamento', 'Finalizada', 'Cancelada'].map((value) => ({ label: value, value }));
const customerName = (id: number) => store.customers.find((item) => item.id === id)?.name ?? 'Cliente não encontrado';
const vehicleLabel = (id: number) => {
  const vehicle = store.vehicles.find((item) => item.id === id);
  return vehicle ? `${vehicle.plate} · ${vehicle.brand} ${vehicle.model}` : 'Veículo não encontrado';
};
const parseDate = (value: string) => {
  const [day, month, year] = value.split('/').map(Number);
  return new Date(year, month - 1, day);
};
const orders = computed(() => {
  const term = search.value.trim().toLocaleLowerCase('pt-BR');
  return store.orders.filter((order) => {
    const matchesSearch = !term || `${order.number} ${customerName(order.customerId)} ${vehicleLabel(order.vehicleId)}`.toLocaleLowerCase('pt-BR').includes(term);
    const matchesStatus = !status.value || order.status === status.value;
    const date = parseDate(order.date);
    const start = period.value?.[0] ? new Date(period.value[0]) : null;
    const end = period.value?.[1] ? new Date(period.value[1]) : null;
    const matchesPeriod = (!start || date >= start) && (!end || date <= end);
    return matchesSearch && matchesStatus && matchesPeriod;
  });
});
const columns: DataTableColumns<ServiceOrder> = [
  { title: 'OS', key: 'number' },
  { title: 'Data', key: 'date' },
  { title: 'Cliente', key: 'customer', render: (row) => customerName(row.customerId) },
  { title: 'Veículo', key: 'vehicle', render: (row) => vehicleLabel(row.vehicleId) },
  { title: 'Status', key: 'status', render: (row) => h(StatusTag, { value: row.status }) },
  { title: 'Total', key: 'total', render: (row) => row.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
  {
    title: 'Ações',
    key: 'actions',
    render: (row) => h(NButton, { size: 'small', text: true, onClick: () => router.push({ name: 'order-detail', params: { id: row.id } }) }, { default: () => 'Ver' }),
  },
];
</script>

<template>
  <PageHeader description="Acompanhe atendimentos, períodos e situações.">
    <template #actions>
      <QuickPlateOrder />
      <n-button type="primary" @click="router.push({ name: 'order-new' })">Nova OS</n-button>
    </template>
  </PageHeader>
  <n-card>
    <n-grid cols="1 m:3" responsive="screen" :x-gap="12" :y-gap="12" class="mb-4">
      <n-grid-item><n-input v-model:value="search" placeholder="Buscar OS, cliente ou veículo" /></n-grid-item>
      <n-grid-item><n-select v-model:value="status" :options="statuses" clearable placeholder="Todos os status" /></n-grid-item>
      <n-grid-item><n-date-picker v-model:value="period" type="daterange" class="w-full" clearable /></n-grid-item>
    </n-grid>
    <n-data-table :columns="columns" :data="orders" :bordered="false" :pagination="{ pageSize: 10 }" />
  </n-card>
</template>
