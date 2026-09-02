<script setup lang="ts">
import PageHeader from '@/components/app/PageHeader.vue';
import { contactResultOptions, isPendingContactResult } from '@/constants/contacts';
import { api } from '@/services/api';
import { useAppStore } from '@/stores/app';
import type { Contact, Customer } from '@/types/domain';
import { NButton, NSelect, type DataTableColumns, useDialog, useMessage } from 'naive-ui';
import { computed, h, ref } from 'vue';
import { useRouter } from 'vue-router';

const store = useAppStore();
const router = useRouter();
const dialog = useDialog();
const messageApi = useMessage();
const search = ref('');
const onlyWithoutReturn = ref(false);
const selectedCustomers = ref<Customer[]>([]);
const message = ref(store.preferences.whatsappTemplate || 'Olá, {nome}! Sentimos sua falta. Podemos agendar uma revisão para o seu {veiculo}?');
const previewCustomerId = ref<number | null>(store.customers[0]?.id ?? null);

const lastContactByCustomer = computed(() => {
  const map = new Map<number, (typeof store.contacts)[number]>();
  store.contacts.forEach((contact) => {
    if (!map.has(contact.customerId)) map.set(contact.customerId, contact);
  });
  return map;
});

const customerRows = computed(() =>
  store.customers.filter((customer) => {
    const last = lastContactByCustomer.value.get(customer.id);
    const matchesReturn = !onlyWithoutReturn.value || !last || isPendingContactResult(last.result);
    const term = search.value.toLocaleLowerCase();
    return matchesReturn && [customer.name, customer.phone, customer.email].some((value) => value.toLocaleLowerCase().includes(term));
  }),
);

const previewCustomer = computed(() => store.customers.find((item) => item.id === previewCustomerId.value) ?? selectedCustomers.value[0]);
const previewOptions = computed(() => store.customers.map((item) => ({ label: item.name, value: item.id })));
const selectedKeys = computed(() => selectedCustomers.value.map((item) => item.id));

function onChecked(keys: Array<string | number>) {
  selectedCustomers.value = customerRows.value.filter((customer) => keys.includes(customer.id));
}

function resultOptions(current: string) {
  return contactResultOptions(current).map((value) => ({ label: value, value }));
}

function renderMessage(customer?: Customer) {
  if (!customer) return message.value;
  const vehicle = store.vehicles.find((item) => item.customerId === customer.id);
  return message.value
    .replaceAll('{nome}', customer.name.split(' ')[0])
    .replaceAll('{veiculo}', vehicle ? `${vehicle.brand} ${vehicle.model}` : 'veículo')
    .replaceAll('{placa}', vehicle?.plate ?? '');
}

function insertVariable(variable: string) {
  message.value += ` ${variable}`;
}

async function registerContact(customer: Customer) {
  const rendered = renderMessage(customer);
  await store.addContact({
    customerId: customer.id,
    date: new Date().toLocaleDateString('pt-BR'),
    channel: 'WhatsApp',
    message: rendered,
    result: 'Aguardando resposta',
  });
  return rendered;
}

async function send(customer: Customer) {
  const rendered = await registerContact(customer);
  window.open(`https://wa.me/${customer.whatsapp}?text=${encodeURIComponent(rendered)}`, '_blank', 'noopener,noreferrer');
}

async function sendSelected() {
  if (!selectedCustomers.value.length) return;
  const campaign = await api<{
    customers?: Array<{ name: string; whatsappUrl: string }>;
  }>('/campaigns', {
    method: 'POST',
    body: JSON.stringify({
      name: `Recuperação ${new Date().toLocaleDateString('pt-BR')}`,
      months: 6,
      customerIds: selectedCustomers.value.map((customer) => customer.id),
      message: message.value,
    }),
  });
  const first = campaign.customers?.[0];
  if (first?.whatsappUrl) {
    window.open(first.whatsappUrl, '_blank', 'noopener,noreferrer');
  }
  await store.bootstrap();
  messageApi.success(first ? `WhatsApp aberto para ${first.name}. Os demais contatos foram gravados.` : 'Campanha criada.');
  selectedCustomers.value = [];
}

function customerName(customerId: number) {
  return store.customers.find((item) => item.id === customerId)?.name ?? 'Cliente removido';
}

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

async function changeResult(contactId: number, result: string, customerId: number) {
  try {
    await store.updateContactResult(contactId, result);
    messageApi.success(result);
    if (result === 'Veio fazer o serviço') {
      suggestOpenOrder(customerId);
    }
  } catch (error) {
    messageApi.error(error instanceof Error ? error.message : 'Tente novamente.');
  }
}

function customerRowKey(row: Customer) {
  return row.id;
}

function contactRowKey(row: Contact) {
  return row.id;
}

const customerColumns = computed(() => {
  const columns: DataTableColumns<Customer> = [
    { type: 'selection' },
    {
      title: 'Cliente',
      key: 'name',
      render(row) {
        return h('div', [
          h('div', { class: 'font-medium' }, row.name),
          h('small', { class: 'muted' }, row.phone),
        ]);
      },
    },
    {
      title: 'Último contato',
      key: 'lastContact',
      render(row) {
        const last = lastContactByCustomer.value.get(row.id);
        if (!last) return h('span', { class: 'muted' }, 'Nunca contatado');
        return h('div', [
          h('div', last.date),
          h('small', { class: 'muted' }, last.result),
        ]);
      },
    },
    {
      title: 'Ação',
      key: 'action',
      width: 120,
      render(row) {
        return h(NButton, { size: 'small', text: true, type: 'success', onClick: () => send(row) }, { default: () => 'WhatsApp' });
      },
    },
  ];
  return columns;
});

const historyColumns = computed<DataTableColumns<Contact>>(() => [
  { title: 'Cliente', key: 'customer', render: (row) => customerName(row.customerId) },
  { title: 'Data', key: 'date' },
  { title: 'Canal', key: 'channel' },
  { title: 'Mensagem', key: 'message', minWidth: 280 },
  {
    title: 'Desfecho',
    key: 'result',
    minWidth: 220,
    render(row) {
      return h(NSelect, {
        value: row.result,
        options: resultOptions(row.result),
        onUpdateValue: (value: string) => changeResult(row.id, value, row.customerId),
      });
    },
  },
]);
</script>

<template>
  <PageHeader description="Recupere clientes, registre o desfecho e acompanhe o histórico." />

  <div class="grid grid-cols-12 gap-6">
    <div class="col-span-12 xl:col-span-7">
      <n-card>
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <n-input v-model:value="search" class="w-full md:max-w-sm" placeholder="Buscar cliente" />
          <n-checkbox v-model:checked="onlyWithoutReturn">Somente sem retorno</n-checkbox>
        </div>
        <n-data-table
          :columns="customerColumns"
          :data="customerRows"
          :row-key="customerRowKey"
          :checked-row-keys="selectedKeys"
          :bordered="false"
          :pagination="{ pageSize: 6 }"
          @update:checked-row-keys="onChecked"
        />
      </n-card>
    </div>

    <div class="col-span-12 xl:col-span-5">
      <n-card>
        <h2 class="text-xl font-semibold mt-0">Mensagem</h2>
        <n-form-item label="Editor">
          <n-input v-model:value="message" type="textarea" :rows="6" />
        </n-form-item>
        <div class="flex flex-wrap gap-2 mt-3">
          <n-button v-for="variable in ['{nome}', '{veiculo}', '{placa}']" :key="variable" size="small" ghost @click="insertVariable(variable)">
            {{ variable }}
          </n-button>
        </div>
        <n-form-item label="Visualizar como" class="mt-5">
          <n-select v-model:value="previewCustomerId" :options="previewOptions" placeholder="Selecione um cliente" />
        </n-form-item>
        <n-card size="small" class="mt-3">
          <div class="min-h-24 whitespace-pre-wrap">{{ renderMessage(previewCustomer) }}</div>
        </n-card>
        <n-button
          type="success"
          block
          class="mt-4"
          :disabled="!selectedCustomers.length || !message.trim()"
          @click="sendSelected"
        >
          Abrir WhatsApp ({{ selectedCustomers.length }})
        </n-button>
      </n-card>
    </div>
  </div>

  <n-card class="mt-6">
    <h2 class="text-xl font-semibold mt-0 mb-4">Histórico</h2>
    <n-data-table :columns="historyColumns" :data="store.contacts" :row-key="contactRowKey" :bordered="false" :pagination="{ pageSize: 5 }" />
  </n-card>
</template>
