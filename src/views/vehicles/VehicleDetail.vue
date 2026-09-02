<script setup lang="ts">
import PageHeader from '@/components/app/PageHeader.vue';
import StatusTag from '@/components/app/StatusTag.vue';
import { useAppStore } from '@/stores/app';
import type { Maintenance, ServiceOrder } from '@/types/domain';
import { NButton, type DataTableColumns } from 'naive-ui';
import { computed, h } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const store = useAppStore();
const route = useRoute();
const router = useRouter();
const id = computed(() => Number(route.params.id));
const vehicle = computed(() => store.vehicles.find((item) => item.id === id.value));
const customer = computed(() => store.customers.find((item) => item.id === vehicle.value?.customerId));
const orders = computed(() => store.orders.filter((item) => item.vehicleId === id.value));
const maintenances = computed(() => store.maintenances.filter((item) => item.vehicleId === id.value));

const orderColumns = computed<DataTableColumns<ServiceOrder>>(() => [
  { title: 'OS', key: 'number' },
  { title: 'Data', key: 'date' },
  {
    title: 'Status',
    key: 'status',
    render(row) {
      return h(StatusTag, { value: row.status });
    },
  },
  {
    title: '',
    key: 'actions',
    width: 72,
    render(row) {
      return h(
        NButton,
        { text: true, size: 'small', onClick: () => router.push({ name: 'order-detail', params: { id: row.id } }) },
        { default: () => 'Ver' },
      );
    },
  },
]);

const maintenanceColumns = computed<DataTableColumns<Maintenance>>(() => [
  { title: 'Serviço', key: 'serviceName' },
  { title: 'Previsão', key: 'dueDate' },
  {
    title: 'Status',
    key: 'status',
    render(row) {
      return h(StatusTag, { value: row.status });
    },
  },
]);
</script>

<template>
  <PageHeader :title="vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Veículo não encontrado'" :description="vehicle ? `Placa ${vehicle.plate}` : undefined">
    <template #actions>
      <n-button ghost @click="router.push({ name: 'vehicles' })">Voltar</n-button>
      <n-button v-if="vehicle" type="primary" @click="router.push({ name: 'vehicle-edit', params: { id } })">Editar</n-button>
    </template>
  </PageHeader>
  <n-alert v-if="!vehicle" type="error">O veículo solicitado não existe.</n-alert>
  <template v-else>
    <n-card class="mb-4">
      <div class="grid grid-cols-2 gap-5 lg:grid-cols-5">
        <div>
          <span class="block muted text-sm">Proprietário</span>
          <n-button text class="mt-1 px-0" @click="customer && router.push({ name: 'customer-detail', params: { id: customer.id } })">
            {{ customer?.name ?? 'Não encontrado' }}
          </n-button>
        </div>
        <div><span class="block muted text-sm mb-1">Ano</span><strong>{{ vehicle.year }}</strong></div>
        <div><span class="block muted text-sm mb-1">Quilometragem</span><strong>{{ vehicle.mileage.toLocaleString('pt-BR') }} km</strong></div>
        <div><span class="block muted text-sm mb-1">Próxima manutenção</span><strong>{{ vehicle.nextMaintenance || 'Não definida' }}</strong></div>
        <div><span class="block muted text-sm mb-1">Status</span><StatusTag :value="vehicle.maintenanceStatus" /></div>
      </div>
    </n-card>
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <n-card>
        <h2 class="text-xl font-semibold mt-0">Histórico de serviços</h2>
        <n-data-table :columns="orderColumns" :data="orders" :row-key="(row: { id: number }) => row.id" :bordered="false" :pagination="false" />
      </n-card>
      <n-card>
        <h2 class="text-xl font-semibold mt-0">Manutenções preventivas</h2>
        <n-data-table :columns="maintenanceColumns" :data="maintenances" :row-key="(row: { id: number }) => row.id" :bordered="false" :pagination="false" />
      </n-card>
    </div>
  </template>
</template>
