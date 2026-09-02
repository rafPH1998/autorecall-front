<script setup lang="ts">
import PageHeader from '@/components/app/PageHeader.vue';
import StatusTag from '@/components/app/StatusTag.vue';
import { useAppStore } from '@/stores/app';
import { NButton, type DataTableColumns } from 'naive-ui';
import { computed, h, ref } from 'vue';
import { useRouter } from 'vue-router';

const store = useAppStore();
const router = useRouter();
const search = ref('');
const status = ref<'Todas' | 'Próxima' | 'Atrasada'>('Todas');

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
      return [item.customer?.name, item.vehicle?.plate, item.vehicle?.model, item.serviceName].some((value) => value?.toLocaleLowerCase().includes(term));
    }),
);

const upcomingCount = computed(() => store.maintenances.filter((item) => item.status === 'Próxima').length);
const overdueCount = computed(() => store.maintenances.filter((item) => item.status === 'Atrasada').length);

function openWhatsApp(customerId: number, serviceName: string) {
  const customer = store.customers.find((item) => item.id === customerId);
  if (!customer) return;
  const text = encodeURIComponent(`Olá, ${customer.name}! A manutenção "${serviceName}" do seu veículo precisa de atenção. Podemos agendar?`);
  window.open(`https://wa.me/${customer.whatsapp}?text=${text}`, '_blank', 'noopener,noreferrer');
}

type Row = (typeof rows.value)[number];
const columns: DataTableColumns<Row> = [
  { title: 'Cliente', key: 'customer', render: (row) => `${row.customer?.name ?? ''}` },
  { title: 'Veículo', key: 'vehicle', render: (row) => `${row.vehicle?.plate ?? ''} · ${row.vehicle?.brand ?? ''} ${row.vehicle?.model ?? ''}` },
  { title: 'Serviço', key: 'serviceName' },
  { title: 'Previsão', key: 'dueDate' },
  { title: 'Quilometragem', key: 'dueMileage', render: (row) => `${row.dueMileage.toLocaleString('pt-BR')} km` },
  { title: 'Status', key: 'status', render: (row) => h(StatusTag, { value: row.status }) },
  {
    title: 'Ações',
    key: 'actions',
    render(row) {
      return h('div', { class: 'flex gap-2' }, [
        h(NButton, { size: 'small', text: true, onClick: () => router.push(`/customers/${row.customerId}`) }, { default: () => 'Cliente' }),
        h(NButton, { size: 'small', text: true, onClick: () => router.push(`/vehicles/${row.vehicleId}`) }, { default: () => 'Veículo' }),
        h(NButton, { size: 'small', text: true, type: 'success', onClick: () => openWhatsApp(row.customerId, row.serviceName) }, { default: () => 'WhatsApp' }),
      ]);
    },
  },
];
</script>

<template>
  <PageHeader description="Acompanhe revisões próximas e atrasadas.">
    <template #actions>
      <n-button ghost @click="router.push('/customers')">Ver clientes</n-button>
    </template>
  </PageHeader>
  <n-grid cols="1 s:2" responsive="screen" :x-gap="16" :y-gap="16" class="mb-4">
    <n-grid-item><n-card size="small"><div class="muted">Próximas</div><div class="text-3xl font-semibold">{{ upcomingCount }}</div></n-card></n-grid-item>
    <n-grid-item><n-card size="small"><div class="muted">Atrasadas</div><div class="text-3xl font-semibold">{{ overdueCount }}</div></n-card></n-grid-item>
  </n-grid>
  <n-card>
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
      <n-input v-model:value="search" class="md:max-w-md" placeholder="Cliente, placa, veículo ou serviço" />
      <n-radio-group v-model:value="status">
        <n-radio-button value="Todas">Todas</n-radio-button>
        <n-radio-button value="Próxima">Próxima</n-radio-button>
        <n-radio-button value="Atrasada">Atrasada</n-radio-button>
      </n-radio-group>
    </div>
    <n-data-table :columns="columns" :data="rows" :bordered="false" :pagination="{ pageSize: 8 }" />
  </n-card>
</template>
