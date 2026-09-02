<script setup lang="ts">
import PageHeader from '@/components/app/PageHeader.vue';
import StatusTag from '@/components/app/StatusTag.vue';
import { useAppStore } from '@/stores/app';
import type { Vehicle } from '@/types/domain';
import { NButton, type DataTableColumns } from 'naive-ui';
import { computed, h, ref } from 'vue';
import { useRouter } from 'vue-router';

const store = useAppStore();
const router = useRouter();
const search = ref('');
const pagination = { pageSize: 10, pageSizes: [5, 10, 20], showSizePicker: true };
const customerName = (id: number) => store.customers.find((item) => item.id === id)?.name ?? 'Cliente não encontrado';
const vehicles = computed(() => {
  const term = search.value.trim().toUpperCase();
  return term
    ? store.vehicles.filter((vehicle) => [vehicle.plate, vehicle.brand, vehicle.model, customerName(vehicle.customerId)].some((value) => value.toUpperCase().includes(term)))
    : store.vehicles;
});

const columns = computed<DataTableColumns<Vehicle>>(() => [
  { title: 'Placa', key: 'plate', sorter: 'default' },
  {
    title: 'Veículo',
    key: 'vehicle',
    render(row) {
      return `${row.brand} ${row.model} (${row.year})`;
    },
  },
  {
    title: 'Cliente',
    key: 'customer',
    render(row) {
      return customerName(row.customerId);
    },
  },
  {
    title: 'Quilometragem',
    key: 'mileage',
    render(row) {
      return `${row.mileage.toLocaleString('pt-BR')} km`;
    },
  },
  { title: 'Próxima manutenção', key: 'nextMaintenance' },
  {
    title: 'Status',
    key: 'maintenanceStatus',
    render(row) {
      return h(StatusTag, { value: row.maintenanceStatus });
    },
  },
  {
    title: 'Ações',
    key: 'actions',
    width: 144,
    render(row) {
      return h('div', { class: 'flex gap-1' }, [
        h(
          NButton,
          { text: true, size: 'small', onClick: () => router.push({ name: 'vehicle-detail', params: { id: row.id } }) },
          { default: () => 'Ver' },
        ),
        h(
          NButton,
          { text: true, size: 'small', onClick: () => router.push({ name: 'vehicle-edit', params: { id: row.id } }) },
          { default: () => 'Editar' },
        ),
      ]);
    },
  },
]);
</script>

<template>
  <PageHeader title="Veículos" description="Consulte veículos, proprietários e próximas manutenções.">
    <template #actions>
      <n-button type="primary" @click="router.push({ name: 'vehicle-new' })">Novo veículo</n-button>
    </template>
  </PageHeader>
  <n-card>
    <n-input v-model:value="search" class="w-full sm:max-w-md mb-4" placeholder="Buscar por placa, veículo ou cliente" />
    <n-data-table
      :columns="columns"
      :data="vehicles"
      :row-key="(row: Vehicle) => row.id"
      :bordered="false"
      striped
      :pagination="pagination"
    />
  </n-card>
</template>
