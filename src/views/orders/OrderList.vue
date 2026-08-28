<script setup lang="ts">
import PageHeader from '@/components/app/PageHeader.vue';
import QuickPlateOrder from '@/components/app/QuickPlateOrder.vue';
import StatusTag from '@/components/app/StatusTag.vue';
import { useAppStore } from '@/stores/app';
import type { OrderStatus } from '@/types/domain';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const store = useAppStore();
const router = useRouter();
const search = ref('');
const status = ref<OrderStatus | null>(null);
const period = ref<Date[] | null>(null);
const statuses: OrderStatus[] = ['Aberta', 'Em andamento', 'Finalizada', 'Cancelada'];
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
    const start = period.value?.[0];
    const end = period.value?.[1];
    const matchesPeriod = (!start || date >= start) && (!end || date <= end);
    return matchesSearch && matchesStatus && matchesPeriod;
  });
});
</script>

<template>
  <PageHeader title="Ordens de serviço" description="Acompanhe atendimentos, períodos e situações.">
    <template #actions>
      <QuickPlateOrder />
      <Button label="Nova OS" icon="pi pi-plus" @click="router.push({ name: 'order-new' })" />
    </template>
  </PageHeader>
  <div class="card">
    <div class="grid grid-cols-1 gap-3 mb-5 md:grid-cols-3">
      <IconField><InputIcon class="pi pi-search" /><InputText v-model="search" class="w-full" placeholder="Buscar OS, cliente ou veículo" /></IconField>
      <Select v-model="status" :options="statuses" show-clear placeholder="Todos os status" />
      <DatePicker v-model="period" selection-mode="range" show-icon date-format="dd/mm/yy" placeholder="Período" />
    </div>
    <DataTable :value="orders" data-key="id" paginator :rows="10" :rows-per-page-options="[5, 10, 20]" striped-rows responsive-layout="scroll">
      <Column field="number" header="OS" sortable />
      <Column field="date" header="Data" sortable />
      <Column header="Cliente"><template #body="{ data }">{{ customerName(data.customerId) }}</template></Column>
      <Column header="Veículo"><template #body="{ data }">{{ vehicleLabel(data.vehicleId) }}</template></Column>
      <Column header="Status"><template #body="{ data }"><StatusTag :value="data.status" /></template></Column>
      <Column header="Total"><template #body="{ data }">{{ data.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}</template></Column>
      <Column header="Ações"><template #body="{ data }"><Button icon="pi pi-eye" text rounded aria-label="Ver ordem" @click="router.push({ name: 'order-detail', params: { id: data.id } })" /></template></Column>
      <template #empty><div class="py-8 text-center text-muted-color"><i class="pi pi-file text-3xl block mb-3" />Nenhuma ordem encontrada para os filtros.</div></template>
    </DataTable>
  </div>
</template>
