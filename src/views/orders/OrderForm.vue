<script setup lang="ts">
import PageHeader from '@/components/app/PageHeader.vue';
import { useAppStore } from '@/stores/app';
import type { ServiceOrderItem } from '@/types/domain';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const store = useAppStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const submitted = ref(false);
const customerId = ref<number | null>(null);
const vehicleId = ref<number | null>(null);
const mileage = ref(0);
const notes = ref('');
const items = reactive<ServiceOrderItem[]>([]);
const customerOptions = computed(() => store.customers.map((item) => ({ label: item.name, value: item.id })));
const vehicleOptions = computed(() => store.vehicles.filter((item) => item.customerId === customerId.value).map((item) => ({ label: `${item.plate} · ${item.brand} ${item.model}`, value: item.id })));
const serviceOptions = computed(() => store.services.filter((item) => item.active).map((item) => ({ label: item.name, value: item.id })));
const total = computed(() => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0));
const valid = computed(() => Boolean(customerId.value && vehicleId.value && mileage.value >= 0 && items.length && items.every((item) => item.serviceId && item.quantity > 0)));

watch(customerId, () => {
  vehicleId.value = null;
});

onMounted(() => {
  const fromQuery = Number(route.query.customerId);
  if (fromQuery) {
    customerId.value = fromQuery;
    const vehicle = store.vehicles.find((item) => item.customerId === fromQuery);
    if (vehicle) {
      vehicleId.value = vehicle.id;
      mileage.value = vehicle.mileage;
    }
  }
});

function addItem() {
  const service = store.services.find((item) => item.active);
  if (!service) return;
  items.push({ serviceId: service.id, serviceName: service.name, quantity: 1, unitPrice: service.price });
}

function updateItem(item: ServiceOrderItem) {
  const service = store.services.find((candidate) => candidate.id === item.serviceId);
  if (service) {
    item.serviceName = service.name;
    item.unitPrice = service.price;
  }
}

async function save() {
  submitted.value = true;
  if (!valid.value || !customerId.value || !vehicleId.value) return;
  try {
    await store.addOrder({
      customerId: customerId.value,
      vehicleId: vehicleId.value,
      mileage: mileage.value,
      notes: notes.value,
      items: items.map((item) => ({ ...item })),
    });
    toast.add({ severity: 'success', summary: 'Ordem criada', detail: 'A ordem de serviço foi aberta.', life: 3000 });
    router.push({ name: 'orders' });
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erro ao criar OS', detail: error instanceof Error ? error.message : 'Tente novamente.', life: 4000 });
  }
}
</script>

<template>
  <PageHeader title="Nova ordem de serviço" description="Selecione cliente, veículo e serviços do atendimento.">
    <template #actions>
      <Button label="Cancelar" severity="secondary" outlined @click="router.push({ name: 'orders' })" />
      <Button label="Criar OS" icon="pi pi-check" @click="save" />
    </template>
  </PageHeader>
  <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
    <div class="card xl:col-span-2">
      <h2 class="text-xl font-semibold mt-0">Dados do atendimento</h2>
      <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div class="flex flex-col gap-2"><label for="customer">Cliente *</label><Select id="customer" v-model="customerId" :options="customerOptions" option-label="label" option-value="value" filter placeholder="Selecione" :invalid="submitted && !customerId" /></div>
        <div class="flex flex-col gap-2"><label for="vehicle">Veículo *</label><Select id="vehicle" v-model="vehicleId" :options="vehicleOptions" option-label="label" option-value="value" :disabled="!customerId" placeholder="Selecione" :invalid="submitted && !vehicleId" /></div>
        <div class="flex flex-col gap-2"><label for="mileage">Quilometragem</label><InputNumber id="mileage" v-model="mileage" suffix=" km" :min="0" /></div>
        <div class="flex flex-col gap-2 md:col-span-2"><label for="notes">Observações</label><Textarea id="notes" v-model="notes" rows="3" auto-resize /></div>
      </div>
      <div class="flex items-center justify-between mt-7 mb-3">
        <h2 class="text-xl font-semibold m-0">Serviços</h2>
        <Button label="Adicionar" icon="pi pi-plus" size="small" outlined :disabled="!serviceOptions.length" @click="addItem" />
      </div>
      <DataTable :value="items" responsive-layout="scroll">
        <Column header="Serviço">
          <template #body="{ data }"><Select v-model="data.serviceId" :options="serviceOptions" option-label="label" option-value="value" class="w-full min-w-48" @change="updateItem(data)" /></template>
        </Column>
        <Column header="Qtd." style="width: 8rem"><template #body="{ data }"><InputNumber v-model="data.quantity" :min="1" show-buttons class="w-full" /></template></Column>
        <Column header="Unitário"><template #body="{ data }"><InputNumber v-model="data.unitPrice" mode="currency" currency="BRL" locale="pt-BR" :min="0" /></template></Column>
        <Column header="Subtotal"><template #body="{ data }">{{ (data.quantity * data.unitPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}</template></Column>
        <Column style="width: 4rem"><template #body="{ index }"><Button icon="pi pi-trash" severity="danger" text rounded @click="items.splice(index, 1)" /></template></Column>
        <template #empty>Adicione ao menos um serviço.</template>
      </DataTable>
      <Message v-if="submitted && !valid" severity="error" class="mt-4">Selecione cliente, veículo e ao menos um serviço válido.</Message>
    </div>
    <div class="card h-fit">
      <h2 class="text-xl font-semibold mt-0">Resumo</h2>
      <div class="flex justify-between text-muted-color mb-3"><span>Itens</span><span>{{ items.length }}</span></div>
      <div class="flex justify-between items-center border-t border-surface pt-4"><strong>Total</strong><strong class="text-2xl text-primary">{{ total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}</strong></div>
    </div>
  </div>
</template>
