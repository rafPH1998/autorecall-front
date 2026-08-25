<script setup lang="ts">
import PageHeader from '@/components/app/PageHeader.vue';
import StatusTag from '@/components/app/StatusTag.vue';
import { useAppStore } from '@/stores/app';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const store = useAppStore();
const router = useRouter();
const search = ref('');
const customerName = (id: number) => store.customers.find((item) => item.id === id)?.name ?? 'Cliente não encontrado';
const vehicles = computed(() => {
  const term = search.value.trim().toUpperCase();
  return term
    ? store.vehicles.filter((vehicle) => [vehicle.plate, vehicle.brand, vehicle.model, customerName(vehicle.customerId)].some((value) => value.toUpperCase().includes(term)))
    : store.vehicles;
});
</script>

<template>
  <PageHeader title="Veículos" description="Consulte veículos, proprietários e próximas manutenções.">
    <template #actions><Button label="Novo veículo" icon="pi pi-plus" @click="router.push({ name: 'vehicle-new' })" /></template>
  </PageHeader>
  <div class="card">
    <IconField class="w-full sm:max-w-md mb-4">
      <InputIcon class="pi pi-search" />
      <InputText v-model="search" class="w-full uppercase" placeholder="Buscar por placa, veículo ou cliente" />
    </IconField>
    <DataTable :value="vehicles" data-key="id" paginator :rows="10" :rows-per-page-options="[5, 10, 20]" striped-rows responsive-layout="scroll">
      <Column field="plate" header="Placa" sortable />
      <Column header="Veículo"><template #body="{ data }">{{ data.brand }} {{ data.model }} ({{ data.year }})</template></Column>
      <Column header="Cliente"><template #body="{ data }">{{ customerName(data.customerId) }}</template></Column>
      <Column header="Quilometragem"><template #body="{ data }">{{ data.mileage.toLocaleString('pt-BR') }} km</template></Column>
      <Column field="nextMaintenance" header="Próxima manutenção" />
      <Column header="Status"><template #body="{ data }"><StatusTag :value="data.maintenanceStatus" /></template></Column>
      <Column header="Ações" style="width: 9rem">
        <template #body="{ data }">
          <Button icon="pi pi-eye" text rounded aria-label="Ver veículo" @click="router.push({ name: 'vehicle-detail', params: { id: data.id } })" />
          <Button icon="pi pi-pencil" text rounded aria-label="Editar veículo" @click="router.push({ name: 'vehicle-edit', params: { id: data.id } })" />
        </template>
      </Column>
      <template #empty><div class="py-8 text-center text-muted-color"><i class="pi pi-car text-3xl block mb-3" />Nenhum veículo encontrado.</div></template>
    </DataTable>
  </div>
</template>
