<script setup lang="ts">
import PageHeader from '@/components/app/PageHeader.vue';
import { useAppStore } from '@/stores/app';
import type { ServiceOrderItem } from '@/types/domain';
import { NButton, NInputNumber, NSelect, type DataTableColumns, useMessage } from 'naive-ui';
import { computed, h, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const store = useAppStore();
const route = useRoute();
const router = useRouter();
const messageApi = useMessage();
const submitted = ref(false);
const customerId = ref<number | null>(null);
const vehicleId = ref<number | null>(null);
const mileage = ref(0);
const notes = ref('');
const items = ref<ServiceOrderItem[]>([]);
const customerOptions = computed(() => store.customers.map((item) => ({ label: item.name, value: item.id })));
const vehicleOptions = computed(() => store.vehicles.filter((item) => item.customerId === customerId.value).map((item) => ({ label: `${item.plate} · ${item.brand} ${item.model}`, value: item.id })));
const serviceOptions = computed(() => store.services.filter((item) => item.active).map((item) => ({ label: item.name, value: item.id })));
const total = computed(() => items.value.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0));
const valid = computed(() => Boolean(customerId.value && vehicleId.value && mileage.value >= 0 && items.value.length && items.value.every((item) => item.serviceId && item.quantity > 0)));

watch(customerId, (_id, previous) => {
  if (previous) vehicleId.value = null;
});

onMounted(() => {
  const fromCustomer = Number(route.query.customerId);
  const fromVehicle = Number(route.query.vehicleId);
  if (fromCustomer) customerId.value = fromCustomer;
  const vehicle = fromVehicle
    ? store.vehicles.find((item) => item.id === fromVehicle)
    : store.vehicles.find((item) => item.customerId === fromCustomer);
  if (vehicle) {
    vehicleId.value = vehicle.id;
    mileage.value = vehicle.mileage;
  }
});

function addItem() {
  const service = store.services.find((item) => item.active);
  if (!service) return;
  items.value.push({ serviceId: service.id, serviceName: service.name, quantity: 1, unitPrice: service.price });
}

function updateItem(item: ServiceOrderItem) {
  const service = store.services.find((candidate) => candidate.id === item.serviceId);
  if (service) {
    item.serviceName = service.name;
    item.unitPrice = service.price;
  }
}

const itemColumns = computed<DataTableColumns<ServiceOrderItem>>(() => [
  {
    title: 'Serviço',
    key: 'serviceId',
    render: (row) => h(NSelect, {
      value: row.serviceId,
      options: serviceOptions.value,
      onUpdateValue: (value: number) => {
        row.serviceId = value;
        updateItem(row);
      },
    }),
  },
  {
    title: 'Qtd.',
    key: 'quantity',
    width: 120,
    render: (row) => h(NInputNumber, { value: row.quantity, min: 1, onUpdateValue: (value) => { row.quantity = value ?? 1; } }),
  },
  {
    title: 'Unitário',
    key: 'unitPrice',
    width: 150,
    render: (row) => h(NInputNumber, { value: row.unitPrice, min: 0, precision: 2, onUpdateValue: (value) => { row.unitPrice = value ?? 0; } }),
  },
  { title: 'Subtotal', key: 'subtotal', render: (row) => (row.quantity * row.unitPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
  {
    title: '',
    key: 'remove',
    width: 70,
    render: (_row, index) => h(NButton, { text: true, type: 'error', onClick: () => items.value.splice(Number(index), 1) }, { default: () => 'Remover' }),
  },
]);

async function save() {
  submitted.value = true;
  if (!valid.value || !customerId.value || !vehicleId.value) return;
  try {
    await store.addOrder({
      customerId: customerId.value,
      vehicleId: vehicleId.value,
      mileage: mileage.value,
      notes: notes.value,
      items: items.value.map((item) => ({ ...item })),
    });
    messageApi.success('A ordem de serviço foi aberta.');
    router.push({ name: 'orders' });
  } catch (error) {
    messageApi.error(error instanceof Error ? error.message : 'Tente novamente.');
  }
}
</script>

<template>
  <PageHeader description="Selecione cliente, veículo e serviços do atendimento.">
    <template #actions>
      <n-button ghost @click="router.push({ name: 'orders' })">Cancelar</n-button>
      <n-button type="primary" @click="save">Criar OS</n-button>
    </template>
  </PageHeader>
  <n-grid cols="1 l:3" responsive="screen" :x-gap="16" :y-gap="16">
    <n-grid-item :span="2">
      <n-card title="Dados do atendimento">
        <n-grid :cols="2" :x-gap="16" :y-gap="8">
          <n-grid-item><n-form-item label="Cliente *" :validation-status="submitted && !customerId ? 'error' : undefined"><n-select v-model:value="customerId" :options="customerOptions" filterable placeholder="Selecione" /></n-form-item></n-grid-item>
          <n-grid-item><n-form-item label="Veículo *" :validation-status="submitted && !vehicleId ? 'error' : undefined"><n-select v-model:value="vehicleId" :options="vehicleOptions" :disabled="!customerId" placeholder="Selecione" /></n-form-item></n-grid-item>
          <n-grid-item><n-form-item label="Quilometragem"><n-input-number v-model:value="mileage" class="w-full" :min="0" /></n-form-item></n-grid-item>
          <n-grid-item :span="2"><n-form-item label="Observações"><n-input v-model:value="notes" type="textarea" :autosize="{ minRows: 3 }" /></n-form-item></n-grid-item>
        </n-grid>
        <div class="flex items-center justify-between mt-4 mb-3">
          <strong>Serviços</strong>
          <n-button size="small" ghost :disabled="!serviceOptions.length" @click="addItem">Adicionar</n-button>
        </div>
        <n-data-table :columns="itemColumns" :data="items" :bordered="false" />
        <n-alert v-if="submitted && !valid" type="error" class="mt-4">Selecione cliente, veículo e ao menos um serviço válido.</n-alert>
      </n-card>
    </n-grid-item>
    <n-grid-item>
      <n-card title="Resumo">
        <div class="flex justify-between muted mb-3"><span>Itens</span><span>{{ items.length }}</span></div>
        <div class="flex justify-between items-center"><strong>Total</strong><strong class="text-2xl">{{ total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}</strong></div>
      </n-card>
    </n-grid-item>
  </n-grid>
</template>
