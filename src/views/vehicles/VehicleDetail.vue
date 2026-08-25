<script setup lang="ts">
import PageHeader from '@/components/app/PageHeader.vue';
import StatusTag from '@/components/app/StatusTag.vue';
import { useAppStore } from '@/stores/app';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const store = useAppStore();
const route = useRoute();
const router = useRouter();
const id = computed(() => Number(route.params.id));
const vehicle = computed(() => store.vehicles.find((item) => item.id === id.value));
const customer = computed(() => store.customers.find((item) => item.id === vehicle.value?.customerId));
const orders = computed(() => store.orders.filter((item) => item.vehicleId === id.value));
const maintenances = computed(() => store.maintenances.filter((item) => item.vehicleId === id.value));
</script>

<template>
  <PageHeader :title="vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Veículo não encontrado'" :description="vehicle ? `Placa ${vehicle.plate}` : undefined">
    <template #actions>
      <Button label="Voltar" icon="pi pi-arrow-left" severity="secondary" outlined @click="router.push({ name: 'vehicles' })" />
      <Button v-if="vehicle" label="Editar" icon="pi pi-pencil" @click="router.push({ name: 'vehicle-edit', params: { id } })" />
    </template>
  </PageHeader>
  <Message v-if="!vehicle" severity="error">O veículo solicitado não existe.</Message>
  <template v-else>
    <div class="card">
      <div class="grid grid-cols-2 gap-5 lg:grid-cols-5">
        <div><span class="block text-muted-color text-sm">Proprietário</span><Button :label="customer?.name ?? 'Não encontrado'" link class="p-0 mt-1" @click="customer && router.push({ name: 'customer-detail', params: { id: customer.id } })" /></div>
        <div><span class="block text-muted-color text-sm mb-1">Ano</span><strong>{{ vehicle.year }}</strong></div>
        <div><span class="block text-muted-color text-sm mb-1">Quilometragem</span><strong>{{ vehicle.mileage.toLocaleString('pt-BR') }} km</strong></div>
        <div><span class="block text-muted-color text-sm mb-1">Próxima manutenção</span><strong>{{ vehicle.nextMaintenance || 'Não definida' }}</strong></div>
        <div><span class="block text-muted-color text-sm mb-1">Status</span><StatusTag :value="vehicle.maintenanceStatus" /></div>
      </div>
    </div>
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div class="card mb-0">
        <h2 class="text-xl font-semibold mt-0">Histórico de serviços</h2>
        <DataTable :value="orders" data-key="id" responsive-layout="scroll">
          <Column field="number" header="OS" />
          <Column field="date" header="Data" />
          <Column header="Status"><template #body="{ data }"><StatusTag :value="data.status" /></template></Column>
          <Column header=""><template #body="{ data }"><Button icon="pi pi-eye" text rounded @click="router.push({ name: 'order-detail', params: { id: data.id } })" /></template></Column>
          <template #empty>Nenhum serviço realizado.</template>
        </DataTable>
      </div>
      <div class="card mb-0">
        <h2 class="text-xl font-semibold mt-0">Manutenções preventivas</h2>
        <DataTable :value="maintenances" data-key="id" responsive-layout="scroll">
          <Column field="serviceName" header="Serviço" />
          <Column field="dueDate" header="Previsão" />
          <Column header="Status"><template #body="{ data }"><StatusTag :value="data.status" /></template></Column>
          <template #empty>Nenhuma manutenção programada.</template>
        </DataTable>
      </div>
    </div>
  </template>
</template>
