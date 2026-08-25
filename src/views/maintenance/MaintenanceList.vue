<script setup lang="ts">
import PageHeader from '@/components/app/PageHeader.vue';
import StatusTag from '@/components/app/StatusTag.vue';
import { useAppStore } from '@/stores/app';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const store = useAppStore();
const router = useRouter();
const search = ref('');
const status = ref<'Todas' | 'Próxima' | 'Atrasada'>('Todas');
const statusOptions = ['Todas', 'Próxima', 'Atrasada'];

const rows = computed(() =>
  store.maintenances
    .map((maintenance) => ({
      ...maintenance,
      customer: store.customers.find((item) => item.id === maintenance.customerId),
      vehicle: store.vehicles.find((item) => item.id === maintenance.vehicleId),
    }))
    .filter((item) => status.value === 'Todas' || item.status === status.value)
    .filter((item) => {
      const term = search.value.toLocaleLowerCase();
      return [item.customer?.name, item.vehicle?.plate, item.vehicle?.model, item.serviceName]
        .some((value) => value?.toLocaleLowerCase().includes(term));
    }),
);

const upcomingCount = computed(() => store.maintenances.filter((item) => item.status === 'Próxima').length);
const overdueCount = computed(() => store.maintenances.filter((item) => item.status === 'Atrasada').length);

function openWhatsApp(customerId: number, serviceName: string) {
  const customer = store.customers.find((item) => item.id === customerId);
  if (!customer) return;
  const message = encodeURIComponent(`Olá, ${customer.name}! A manutenção "${serviceName}" do seu veículo precisa de atenção. Podemos agendar?`);
  window.open(`https://wa.me/${customer.whatsapp}?text=${message}`, '_blank', 'noopener,noreferrer');
}
</script>

<template>
  <PageHeader title="Manutenções" description="Acompanhe revisões próximas e atrasadas.">
    <template #actions>
      <Button label="Ver clientes" icon="pi pi-users" outlined @click="router.push('/customers')" />
    </template>
  </PageHeader>

  <div class="grid grid-cols-12 gap-4 mb-6">
    <div class="col-span-12 sm:col-span-6">
      <div class="card mb-0 flex items-center justify-between">
        <div><span class="text-muted-color">Próximas</span><div class="text-3xl font-semibold mt-2">{{ upcomingCount }}</div></div>
        <i class="pi pi-calendar text-3xl text-green-500" />
      </div>
    </div>
    <div class="col-span-12 sm:col-span-6">
      <div class="card mb-0 flex items-center justify-between">
        <div><span class="text-muted-color">Atrasadas</span><div class="text-3xl font-semibold mt-2">{{ overdueCount }}</div></div>
        <i class="pi pi-exclamation-circle text-3xl text-red-500" />
      </div>
    </div>
  </div>

  <div class="card">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-5">
      <IconField class="w-full md:max-w-md">
        <InputIcon class="pi pi-search" />
        <InputText v-model="search" placeholder="Cliente, placa, veículo ou serviço" class="w-full" />
      </IconField>
      <SelectButton v-model="status" :options="statusOptions" :allow-empty="false" aria-label="Filtrar por status" />
    </div>

    <DataTable :value="rows" data-key="id" striped-rows paginator :rows="8" responsive-layout="scroll">
      <Column header="Cliente">
        <template #body="{ data }">
          <div class="font-medium">{{ data.customer?.name }}</div>
          <small class="text-muted-color">{{ data.customer?.phone }}</small>
        </template>
      </Column>
      <Column header="Veículo">
        <template #body="{ data }">
          <div>{{ data.vehicle?.brand }} {{ data.vehicle?.model }}</div>
          <small class="text-muted-color">{{ data.vehicle?.plate }}</small>
        </template>
      </Column>
      <Column field="serviceName" header="Serviço" />
      <Column field="dueDate" header="Previsão" />
      <Column header="Quilometragem">
        <template #body="{ data }">{{ data.dueMileage.toLocaleString('pt-BR') }} km</template>
      </Column>
      <Column header="Status">
        <template #body="{ data }"><StatusTag :value="data.status" /></template>
      </Column>
      <Column header="Ações" style="min-width: 12rem">
        <template #body="{ data }">
          <div class="flex gap-1">
            <Button icon="pi pi-user" text rounded aria-label="Abrir cliente" @click="router.push(`/customers/${data.customerId}`)" />
            <Button icon="pi pi-car" text rounded aria-label="Abrir veículo" @click="router.push(`/vehicles/${data.vehicleId}`)" />
            <Button icon="pi pi-whatsapp" severity="success" text rounded aria-label="Enviar WhatsApp" @click="openWhatsApp(data.customerId, data.serviceName)" />
          </div>
        </template>
      </Column>
      <template #empty>
        <div class="py-8 text-center">
          <i class="pi pi-calendar-times text-4xl text-muted-color" />
          <p class="font-medium mt-3 mb-1">Nenhuma manutenção encontrada</p>
          <span class="text-muted-color">Altere os filtros para consultar outros registros.</span>
        </div>
      </template>
    </DataTable>
  </div>
</template>
