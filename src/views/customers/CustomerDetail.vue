<script setup lang="ts">
import PageHeader from '@/components/app/PageHeader.vue';
import StatusTag from '@/components/app/StatusTag.vue';
import { contactResultOptions } from '@/constants/contacts';
import { useAppStore } from '@/stores/app';
import type { Contact, ServiceOrder, Vehicle } from '@/types/domain';
import { NButton, NSelect, type DataTableColumns, useDialog, useMessage } from 'naive-ui';
import { computed, h } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const store = useAppStore();
const message = useMessage();
const dialog = useDialog();
const route = useRoute();
const router = useRouter();
const id = computed(() => Number(route.params.id));
const customer = computed(() => store.customers.find((item) => item.id === id.value));
const vehicles = computed(() => store.vehicles.filter((item) => item.customerId === id.value));
const orders = computed(() => store.orders.filter((item) => item.customerId === id.value));
const contacts = computed(() => store.contacts.filter((item) => item.customerId === id.value));

function suggestOpenOrder(customerId: number) {
  dialog.warning({
    title: 'Abrir ordem de serviço',
    content: 'O cliente veio fazer o serviço. Deseja abrir a OS agora?',
    positiveText: 'Abrir OS',
    negativeText: 'Agora não',
    onPositiveClick: () => {
      router.push({ name: 'order-new', query: { customerId: String(customerId) } });
    },
  });
}

async function changeResult(contactId: number, result: string) {
  try {
    await store.updateContactResult(contactId, result);
    message.success(result);
    if (result === 'Veio fazer o serviço') suggestOpenOrder(id.value);
  } catch (error) {
    message.error(error instanceof Error ? error.message : 'Tente novamente.');
  }
}

const vehicleColumns: DataTableColumns<Vehicle> = [
  { title: 'Placa', key: 'plate' },
  { title: 'Veículo', key: 'vehicle', render: (row) => `${row.brand} ${row.model} (${row.year})` },
  { title: 'Quilometragem', key: 'mileage', render: (row) => `${row.mileage.toLocaleString('pt-BR')} km` },
  { title: 'Manutenção', key: 'status', render: (row) => h(StatusTag, { value: row.maintenanceStatus }) },
  { title: '', key: 'actions', render: (row) => h(NButton, { size: 'small', text: true, onClick: () => router.push({ name: 'vehicle-detail', params: { id: row.id } }) }, { default: () => 'Ver' }) },
];
const orderColumns: DataTableColumns<ServiceOrder> = [
  { title: 'OS', key: 'number' },
  { title: 'Data', key: 'date' },
  { title: 'Status', key: 'status', render: (row) => h(StatusTag, { value: row.status }) },
  { title: 'Total', key: 'total', render: (row) => row.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
  { title: '', key: 'actions', render: (row) => h(NButton, { size: 'small', text: true, onClick: () => router.push({ name: 'order-detail', params: { id: row.id } }) }, { default: () => 'Ver' }) },
];
const contactColumns = computed<DataTableColumns<Contact>>(() => [
  { title: 'Data', key: 'date' },
  { title: 'Canal', key: 'channel' },
  { title: 'Mensagem', key: 'message' },
  {
    title: 'Desfecho',
    key: 'result',
    render: (row) => h(NSelect, {
      value: row.result,
      options: contactResultOptions(row.result).map((value) => ({ label: value, value })),
      onUpdateValue: (value: string) => changeResult(row.id, value),
    }),
  },
]);
</script>

<template>
  <PageHeader :title="customer?.name ?? 'Cliente não encontrado'" description="Cadastro, veículos e relacionamento com a oficina.">
    <template #actions>
      <n-button ghost @click="router.push({ name: 'customers' })">Voltar</n-button>
      <n-button v-if="customer" type="primary" @click="router.push({ name: 'customer-edit', params: { id } })">Editar</n-button>
    </template>
  </PageHeader>
  <n-alert v-if="!customer" type="error">O cliente solicitado não existe.</n-alert>
  <template v-else>
    <n-card class="mb-4">
      <n-grid cols="1 s:2 l:4" responsive="screen" :x-gap="16" :y-gap="12">
        <n-grid-item><div class="muted text-sm">Documento</div><strong>{{ customer.document }}</strong></n-grid-item>
        <n-grid-item><div class="muted text-sm">Telefone</div><strong>{{ customer.phone }}</strong></n-grid-item>
        <n-grid-item><div class="muted text-sm">E-mail</div><strong>{{ customer.email || 'Não informado' }}</strong></n-grid-item>
        <n-grid-item><div class="muted text-sm">Última visita</div><strong>{{ customer.lastVisit }}</strong></n-grid-item>
      </n-grid>
    </n-card>
    <n-card>
      <n-tabs type="line" default-value="vehicles">
        <n-tab-pane name="vehicles" :tab="`Veículos (${vehicles.length})`">
          <n-data-table :columns="vehicleColumns" :data="vehicles" :row-key="(row: { id: number }) => row.id" :bordered="false" :pagination="false" />
        </n-tab-pane>
        <n-tab-pane name="orders" :tab="`Ordens de serviço (${orders.length})`">
          <n-data-table :columns="orderColumns" :data="orders" :row-key="(row: { id: number }) => row.id" :bordered="false" :pagination="false" />
        </n-tab-pane>
        <n-tab-pane name="contacts" :tab="`Contatos (${contacts.length})`">
          <n-data-table :columns="contactColumns" :data="contacts" :row-key="(row: { id: number }) => row.id" :bordered="false" :pagination="false" />
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </template>
</template>
