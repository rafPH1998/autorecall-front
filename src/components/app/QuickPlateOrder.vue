<script setup lang="ts">
import { api, ApiError } from '@/services/api';
import { useAppStore } from '@/stores/app';
import type { Customer, Vehicle } from '@/types/domain';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const props = withDefaults(defineProps<{ compact?: boolean }>(), { compact: false });

const store = useAppStore();
const router = useRouter();
const toast = useToast();
const visible = ref(false);
const searching = ref(false);
const creating = ref(false);
const notFound = ref(false);
const plate = ref('');
const form = reactive({
  name: '',
  phone: '',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  mileage: 0,
});

function open() {
  visible.value = true;
  notFound.value = false;
}

function reset() {
  plate.value = '';
  notFound.value = false;
  form.name = '';
  form.phone = '';
  form.brand = '';
  form.model = '';
  form.year = new Date().getFullYear();
  form.mileage = 0;
}

function goToOrder(customer: Customer, vehicle: Vehicle) {
  if (!store.customers.some((item) => item.id === customer.id)) {
    store.customers.push(customer);
  }
  if (!store.vehicles.some((item) => item.id === vehicle.id)) {
    store.vehicles.push(vehicle);
  }
  visible.value = false;
  reset();
  router.push({
    name: 'order-new',
    query: { customerId: String(customer.id), vehicleId: String(vehicle.id) },
  });
}

async function searchPlate() {
  const value = plate.value.trim();
  if (!value) return;
  searching.value = true;
  notFound.value = false;
  try {
    const found = await api<{ customer: Customer; vehicle: Vehicle }>(`/vehicles/lookup?plate=${encodeURIComponent(value)}`);
    toast.add({
      severity: 'success',
      summary: found.vehicle.plate,
      detail: `${found.customer.name} · ${found.vehicle.brand} ${found.vehicle.model}`,
      life: 2500,
    });
    goToOrder(found.customer, found.vehicle);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound.value = true;
      return;
    }
    toast.add({
      severity: 'error',
      summary: 'Não foi possível buscar a placa',
      detail: error instanceof Error ? error.message : 'Tente novamente.',
      life: 4000,
    });
  } finally {
    searching.value = false;
  }
}

async function createWalkIn() {
  creating.value = true;
  try {
    const saved = await api<{ customer: Customer; vehicle: Vehicle }>('/customers/walk-in', {
      method: 'POST',
      body: JSON.stringify({
        name: form.name,
        phone: form.phone,
        plate: plate.value,
        brand: form.brand,
        model: form.model,
        year: form.year,
        mileage: form.mileage,
      }),
    });
    goToOrder(saved.customer, saved.vehicle);
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Não foi possível cadastrar',
      detail: error instanceof Error ? error.message : 'Tente novamente.',
      life: 4000,
    });
  } finally {
    creating.value = false;
  }
}

defineExpose({ open });
</script>

<template>
  <Button
    :label="props.compact ? undefined : 'OS por placa'"
    icon="pi pi-car"
    :text="props.compact"
    :rounded="props.compact"
    :outlined="!props.compact"
    aria-label="Abrir OS pela placa"
    @click="open"
  />
  <Dialog v-model:visible="visible" header="Abrir OS pela placa" modal class="w-full max-w-lg" @hide="reset">
    <div class="flex flex-col gap-4">
      <div>
        <label for="quick-plate" class="block font-medium mb-2">Placa</label>
        <div class="flex gap-2">
          <InputText
            id="quick-plate"
            v-model="plate"
            class="w-full uppercase"
            placeholder="BRA2E19"
            @keyup.enter="searchPlate"
          />
          <Button label="Buscar" icon="pi pi-search" :loading="searching" :disabled="!plate.trim()" @click="searchPlate" />
        </div>
      </div>
      <Message v-if="notFound" severity="warn">
        Placa não cadastrada. Preencha o mínimo e siga para a OS.
      </Message>
      <div v-if="notFound" class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="md:col-span-2">
          <label for="walk-name" class="block font-medium mb-2">Cliente</label>
          <InputText id="walk-name" v-model="form.name" class="w-full" />
        </div>
        <div class="md:col-span-2">
          <label for="walk-phone" class="block font-medium mb-2">Telefone / WhatsApp</label>
          <InputText id="walk-phone" v-model="form.phone" class="w-full" />
        </div>
        <div>
          <label for="walk-brand" class="block font-medium mb-2">Marca</label>
          <InputText id="walk-brand" v-model="form.brand" class="w-full" />
        </div>
        <div>
          <label for="walk-model" class="block font-medium mb-2">Modelo</label>
          <InputText id="walk-model" v-model="form.model" class="w-full" />
        </div>
        <div>
          <label for="walk-year" class="block font-medium mb-2">Ano</label>
          <InputNumber id="walk-year" v-model="form.year" class="w-full" :min="1950" :max="2100" />
        </div>
        <div>
          <label for="walk-km" class="block font-medium mb-2">KM</label>
          <InputNumber id="walk-km" v-model="form.mileage" class="w-full" suffix=" km" :min="0" />
        </div>
        <div class="md:col-span-2">
          <Button
            label="Cadastrar e abrir OS"
            icon="pi pi-check"
            class="w-full"
            :loading="creating"
            :disabled="!form.name.trim() || !form.phone.trim() || !form.brand.trim() || !form.model.trim()"
            @click="createWalkIn"
          />
        </div>
      </div>
    </div>
  </Dialog>
</template>
