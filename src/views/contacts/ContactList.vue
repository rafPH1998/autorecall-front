<script setup lang="ts">
import PageHeader from '@/components/app/PageHeader.vue';
import { api } from '@/services/api';
import { useAppStore } from '@/stores/app';
import type { Customer } from '@/types/domain';
import { computed, ref } from 'vue';
import { useToast } from 'primevue/usetoast';

const store = useAppStore();
const toast = useToast();
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
    const matchesReturn = !onlyWithoutReturn.value || !last || ['Aguardando resposta', 'Mensagem visualizada'].includes(last.result);
    const term = search.value.toLocaleLowerCase();
    return matchesReturn && [customer.name, customer.phone, customer.email].some((value) => value.toLocaleLowerCase().includes(term));
  }),
);

const previewCustomer = computed(() => store.customers.find((item) => item.id === previewCustomerId.value) ?? selectedCustomers.value[0]);

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
  toast.add({
    severity: 'success',
    summary: 'Campanha registrada',
    detail: first
      ? `WhatsApp aberto para ${first.name}. Os demais contatos foram gravados.`
      : 'Campanha criada.',
    life: 4000,
  });
  selectedCustomers.value = [];
}

function customerName(customerId: number) {
  return store.customers.find((item) => item.id === customerId)?.name ?? 'Cliente removido';
}
</script>

<template>
  <PageHeader title="Contatos" description="Recupere clientes e acompanhe o histórico de conversas." />

  <div class="grid grid-cols-12 gap-6">
    <div class="col-span-12 xl:col-span-7">
      <div class="card">
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <IconField class="w-full md:max-w-sm">
            <InputIcon class="pi pi-search" />
            <InputText v-model="search" placeholder="Buscar cliente" class="w-full" />
          </IconField>
          <div class="flex items-center gap-2">
            <Checkbox v-model="onlyWithoutReturn" input-id="without-return" binary />
            <label for="without-return">Somente sem retorno</label>
          </div>
        </div>

        <DataTable v-model:selection="selectedCustomers" :value="customerRows" data-key="id" striped-rows paginator :rows="6" responsive-layout="scroll">
          <Column selection-mode="multiple" header-style="width: 3rem" />
          <Column header="Cliente">
            <template #body="{ data }"><div class="font-medium">{{ data.name }}</div><small class="text-muted-color">{{ data.phone }}</small></template>
          </Column>
          <Column header="Último contato">
            <template #body="{ data }">
              <template v-if="lastContactByCustomer.get(data.id)">
                <div>{{ lastContactByCustomer.get(data.id)?.date }}</div>
                <small class="text-muted-color">{{ lastContactByCustomer.get(data.id)?.result }}</small>
              </template>
              <span v-else class="text-muted-color">Nunca contatado</span>
            </template>
          </Column>
          <Column header="Ação">
            <template #body="{ data }"><Button icon="pi pi-whatsapp" severity="success" text rounded aria-label="Enviar WhatsApp" @click="send(data)" /></template>
          </Column>
          <template #empty>
            <div class="py-8 text-center"><i class="pi pi-users text-4xl text-muted-color" /><p class="mt-3 mb-0">Nenhum cliente para contatar.</p></div>
          </template>
        </DataTable>
      </div>
    </div>

    <div class="col-span-12 xl:col-span-5">
      <div class="card">
        <h2 class="text-xl font-semibold mt-0">Mensagem</h2>
        <label for="message" class="block font-medium mb-2">Editor</label>
        <Textarea id="message" v-model="message" rows="6" class="w-full" auto-resize />
        <div class="flex flex-wrap gap-2 mt-3">
          <Button v-for="variable in ['{nome}', '{veiculo}', '{placa}']" :key="variable" :label="variable" size="small" outlined @click="insertVariable(variable)" />
        </div>

        <label for="preview-customer" class="block font-medium mt-5 mb-2">Visualizar como</label>
        <Select
          id="preview-customer"
          v-model="previewCustomerId"
          :options="store.customers"
          option-label="name"
          option-value="id"
          placeholder="Selecione um cliente"
          class="w-full"
        />
        <div class="bg-surface-100 dark:bg-surface-800 rounded-border p-4 mt-3 min-h-24 whitespace-pre-wrap">{{ renderMessage(previewCustomer) }}</div>

        <Button
          :label="`Abrir WhatsApp (${selectedCustomers.length})`"
          icon="pi pi-whatsapp"
          severity="success"
          class="w-full mt-4"
          :disabled="!selectedCustomers.length || !message.trim()"
          @click="sendSelected"
        />
      </div>
    </div>
  </div>

  <div class="card">
    <h2 class="text-xl font-semibold mt-0 mb-4">Histórico</h2>
    <DataTable :value="store.contacts" data-key="id" striped-rows paginator :rows="5" responsive-layout="scroll">
      <Column header="Cliente"><template #body="{ data }">{{ customerName(data.customerId) }}</template></Column>
      <Column field="date" header="Data" />
      <Column field="channel" header="Canal" />
      <Column field="message" header="Mensagem" style="min-width: 20rem" />
      <Column field="result" header="Resultado" />
      <template #empty><div class="py-6 text-center text-muted-color">Nenhum contato registrado.</div></template>
    </DataTable>
  </div>
</template>
