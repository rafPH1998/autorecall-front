<script setup lang="ts">
import PageHeader from '@/components/app/PageHeader.vue';
import StatusTag from '@/components/app/StatusTag.vue';
import { contactResultOptions } from '@/constants/contacts';
import { useAppStore } from '@/stores/app';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';

const store = useAppStore();
const toast = useToast();
const confirm = useConfirm();
const route = useRoute();
const router = useRouter();
const id = computed(() => Number(route.params.id));
const customer = computed(() => store.customers.find((item) => item.id === id.value));
const vehicles = computed(() => store.vehicles.filter((item) => item.customerId === id.value));
const orders = computed(() => store.orders.filter((item) => item.customerId === id.value));
const contacts = computed(() => store.contacts.filter((item) => item.customerId === id.value));

function suggestOpenOrder(customerId: number) {
  confirm.require({
    header: 'Abrir ordem de serviço',
    message: 'O cliente veio fazer o serviço. Deseja abrir a OS agora?',
    icon: 'pi pi-file',
    rejectLabel: 'Agora não',
    acceptLabel: 'Abrir OS',
    accept: () => {
      router.push({ name: 'order-new', query: { customerId: String(customerId) } });
    },
  });
}

async function changeResult(contactId: number, result: string) {
  try {
    await store.updateContactResult(contactId, result);
    toast.add({ severity: 'success', summary: 'Desfecho atualizado', detail: result, life: 2500 });
    if (result === 'Veio fazer o serviço') {
      suggestOpenOrder(id.value);
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Não foi possível atualizar o desfecho',
      detail: error instanceof Error ? error.message : 'Tente novamente.',
      life: 4000,
    });
  }
}
</script>

<template>
  <PageHeader :title="customer?.name ?? 'Cliente não encontrado'" description="Cadastro, veículos e relacionamento com a oficina.">
    <template #actions>
      <Button label="Voltar" icon="pi pi-arrow-left" severity="secondary" outlined @click="router.push({ name: 'customers' })" />
      <Button v-if="customer" label="Editar" icon="pi pi-pencil" @click="router.push({ name: 'customer-edit', params: { id } })" />
    </template>
  </PageHeader>

  <Message v-if="!customer" severity="error">O cliente solicitado não existe.</Message>
  <template v-else>
    <div class="card">
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div><span class="block text-muted-color text-sm mb-1">Documento</span><strong>{{ customer.document }}</strong></div>
        <div><span class="block text-muted-color text-sm mb-1">Telefone</span><strong>{{ customer.phone }}</strong></div>
        <div><span class="block text-muted-color text-sm mb-1">E-mail</span><strong>{{ customer.email || 'Não informado' }}</strong></div>
        <div><span class="block text-muted-color text-sm mb-1">Última visita</span><strong>{{ customer.lastVisit }}</strong></div>
      </div>
    </div>

    <Tabs value="vehicles">
      <TabList>
        <Tab value="vehicles">Veículos ({{ vehicles.length }})</Tab>
        <Tab value="orders">Ordens de serviço ({{ orders.length }})</Tab>
        <Tab value="contacts">Contatos ({{ contacts.length }})</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="vehicles">
          <DataTable :value="vehicles" data-key="id" responsive-layout="scroll">
            <Column field="plate" header="Placa" />
            <Column header="Veículo"><template #body="{ data }">{{ data.brand }} {{ data.model }} ({{ data.year }})</template></Column>
            <Column field="mileage" header="Quilometragem"><template #body="{ data }">{{ data.mileage.toLocaleString('pt-BR') }} km</template></Column>
            <Column header="Manutenção"><template #body="{ data }"><StatusTag :value="data.maintenanceStatus" /></template></Column>
            <Column header=""><template #body="{ data }"><Button icon="pi pi-eye" text rounded @click="router.push({ name: 'vehicle-detail', params: { id: data.id } })" /></template></Column>
            <template #empty>Nenhum veículo vinculado.</template>
          </DataTable>
        </TabPanel>
        <TabPanel value="orders">
          <DataTable :value="orders" data-key="id" responsive-layout="scroll">
            <Column field="number" header="OS" />
            <Column field="date" header="Data" />
            <Column header="Status"><template #body="{ data }"><StatusTag :value="data.status" /></template></Column>
            <Column header="Total"><template #body="{ data }">{{ data.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}</template></Column>
            <Column header=""><template #body="{ data }"><Button icon="pi pi-eye" text rounded @click="router.push({ name: 'order-detail', params: { id: data.id } })" /></template></Column>
            <template #empty>Nenhuma ordem de serviço.</template>
          </DataTable>
        </TabPanel>
        <TabPanel value="contacts">
          <DataTable :value="contacts" data-key="id" responsive-layout="scroll">
            <Column field="date" header="Data" />
            <Column field="channel" header="Canal" />
            <Column field="message" header="Mensagem" />
            <Column header="Desfecho" style="min-width: 16rem">
              <template #body="{ data }">
                <Select
                  :model-value="data.result"
                  :options="contactResultOptions(data.result)"
                  class="w-full"
                  @update:model-value="(value) => changeResult(data.id, value)"
                />
              </template>
            </Column>
            <template #empty>Nenhum contato registrado.</template>
          </DataTable>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </template>
</template>
