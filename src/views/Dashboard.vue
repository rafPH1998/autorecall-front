<script setup lang="ts">
import PageHeader from '@/components/app/PageHeader.vue';
import StatCard from '@/components/app/StatCard.vue';
import StatusTag from '@/components/app/StatusTag.vue';
import { useAppStore } from '@/stores/app';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const store = useAppStore();
const router = useRouter();

function parseBrDate(value: string) {
  const [day, month, year] = value.split('/').map(Number);
  return new Date(year, month - 1, day);
}

function currency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const customerCount = computed(() => store.customers.length);
const vehicleCount = computed(() => store.vehicles.length);
const upcomingMaintenances = computed(() => store.maintenances.filter((item) => item.status === 'Próxima'));
const overdueMaintenances = computed(() => store.maintenances.filter((item) => item.status === 'Atrasada'));
const finishedOrders = computed(() => store.orders.filter((item) => item.status === 'Finalizada'));
const recoveredRevenue = computed(() => finishedOrders.value.reduce((sum, item) => sum + item.total, 0));
const openOrders = computed(() => store.orders.filter((item) => item.status !== 'Finalizada' && item.status !== 'Cancelada').length);

const contactCustomers = computed(() => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const overdueCustomerIds = new Set(overdueMaintenances.value.map((item) => item.customerId));

  return store.customers
    .map((customer) => {
      const lastVisit = parseBrDate(customer.lastVisit);
      const inactive = lastVisit < sixMonthsAgo;
      const overdue = overdueCustomerIds.has(customer.id);
      if (!inactive && !overdue) return null;

      const vehicle = store.vehicles.find((item) => item.customerId === customer.id);
      const reason = overdue ? 'Manutenção atrasada' : 'Sem retorno há mais de 6 meses';
      return { ...customer, reason, plate: vehicle?.plate ?? '—' };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
});

const maintenanceRows = computed(() =>
  [...store.maintenances]
    .sort((a, b) => Number(b.status === 'Atrasada') - Number(a.status === 'Atrasada'))
    .map((item) => {
      const customer = store.customers.find((c) => c.id === item.customerId);
      const vehicle = store.vehicles.find((v) => v.id === item.vehicleId);
      return {
        ...item,
        customerName: customer?.name ?? 'Cliente',
        vehicleLabel: vehicle ? `${vehicle.plate} · ${vehicle.brand} ${vehicle.model}` : 'Veículo',
      };
    }),
);

function go(path: string) {
  router.push(path);
}
</script>

<template>
  <div>
    <PageHeader title="Dashboard" :description="`${store.workshop.name} · visão geral da oficina`">
      <template #actions>
        <Button label="Novo cliente" icon="pi pi-user-plus" class="w-full sm:w-auto" @click="go('/customers/new')" />
        <Button label="Novo veículo" icon="pi pi-car" severity="secondary" class="w-full sm:w-auto" @click="go('/vehicles/new')" />
        <Button label="Abrir OS" icon="pi pi-plus" outlined class="w-full sm:w-auto" @click="go('/orders/new')" />
      </template>
    </PageHeader>

    <div class="grid grid-cols-12 gap-4 xl:gap-6">
      <div class="col-span-12 sm:col-span-6 xl:col-span-3">
        <StatCard label="Clientes" :value="customerCount" icon="pi pi-users" tone="blue" detail="Base ativa da oficina" />
      </div>
      <div class="col-span-12 sm:col-span-6 xl:col-span-3">
        <StatCard label="Veículos" :value="vehicleCount" icon="pi pi-car" tone="green" detail="Cadastrados e vinculados" />
      </div>
      <div class="col-span-12 sm:col-span-6 xl:col-span-3">
        <StatCard label="Manutenções próximas" :value="upcomingMaintenances.length" icon="pi pi-calendar" tone="orange" detail="Janela preventiva" />
      </div>
      <div class="col-span-12 sm:col-span-6 xl:col-span-3">
        <StatCard label="Manutenções atrasadas" :value="overdueMaintenances.length" icon="pi pi-exclamation-triangle" tone="red" detail="Prioridade de contato" />
      </div>

      <div class="col-span-12 lg:col-span-4">
        <div class="card mb-0 h-full">
          <div class="font-semibold text-xl mb-2">Retornos e faturamento</div>
          <p class="text-muted-color mt-0 mb-4">Resumo com os dados mock disponíveis.</p>
          <div class="flex flex-col gap-3">
            <div class="flex justify-between gap-4">
              <span class="text-muted-color">OS finalizadas</span>
              <span class="font-medium">{{ finishedOrders.length }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-muted-color">OS em aberto</span>
              <span class="font-medium">{{ openOrders }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-muted-color">Faturamento recuperado</span>
              <span class="font-medium">{{ currency(recoveredRevenue) }}</span>
            </div>
          </div>
          <Button label="Ver relatórios" icon="pi pi-chart-bar" class="mt-5 w-full" text @click="go('/reports')" />
        </div>
      </div>

      <div class="col-span-12 lg:col-span-8">
        <div class="card mb-0 h-full">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <div class="font-semibold text-xl">Ações rápidas</div>
              <p class="text-muted-color m-0">Cadastros e fluxos mais usados no dia a dia.</p>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            <Button label="Clientes" icon="pi pi-users" outlined class="justify-start" @click="go('/customers')" />
            <Button label="Veículos" icon="pi pi-car" outlined class="justify-start" @click="go('/vehicles')" />
            <Button label="Ordens de serviço" icon="pi pi-file" outlined class="justify-start" @click="go('/orders')" />
            <Button label="Manutenções" icon="pi pi-wrench" outlined class="justify-start" @click="go('/maintenance')" />
            <Button label="Contatos" icon="pi pi-whatsapp" outlined class="justify-start" @click="go('/contacts')" />
            <Button label="Serviços" icon="pi pi-list" outlined class="justify-start" @click="go('/services')" />
          </div>
        </div>
      </div>

      <div class="col-span-12 xl:col-span-6">
        <div class="card mb-0">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div class="font-semibold text-xl">Clientes para contato</div>
            <Button label="Abrir campanha" icon="pi pi-send" size="small" text @click="go('/contacts')" />
          </div>
          <DataTable :value="contactCustomers" dataKey="id" stripedRows responsiveLayout="scroll" class="text-sm">
            <Column field="name" header="Cliente" />
            <Column field="phone" header="Telefone" />
            <Column field="reason" header="Motivo" />
            <Column field="lastVisit" header="Última visita" />
            <template #empty>Nenhum cliente pendente de contato.</template>
          </DataTable>
        </div>
      </div>

      <div class="col-span-12 xl:col-span-6">
        <div class="card mb-0">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div class="font-semibold text-xl">Manutenções</div>
            <Button label="Ver todas" icon="pi pi-arrow-right" size="small" text @click="go('/maintenance')" />
          </div>
          <DataTable :value="maintenanceRows" dataKey="id" stripedRows responsiveLayout="scroll" class="text-sm">
            <Column field="customerName" header="Cliente" />
            <Column field="vehicleLabel" header="Veículo" />
            <Column field="serviceName" header="Serviço" />
            <Column field="dueDate" header="Previsão" />
            <Column header="Status">
              <template #body="{ data }">
                <StatusTag :value="data.status" />
              </template>
            </Column>
            <template #empty>Nenhuma manutenção cadastrada.</template>
          </DataTable>
        </div>
      </div>
    </div>
  </div>
</template>
