<script setup lang="ts">
import { api, ApiError } from '@/services/api';
import { useAppStore } from '@/stores/app';
import type { Customer, Vehicle } from '@/types/domain';
import { CarSportOutline } from '@vicons/ionicons5';
import { useMessage } from 'naive-ui';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const props = withDefaults(defineProps<{ compact?: boolean }>(), { compact: false });
const store = useAppStore();
const router = useRouter();
const message = useMessage();
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
  if (!store.customers.some((item) => item.id === customer.id)) store.customers.push(customer);
  if (!store.vehicles.some((item) => item.id === vehicle.id)) store.vehicles.push(vehicle);
  visible.value = false;
  reset();
  router.push({ name: 'order-new', query: { customerId: String(customer.id), vehicleId: String(vehicle.id) } });
}

async function searchPlate() {
  const value = plate.value.trim();
  if (!value) return;
  searching.value = true;
  notFound.value = false;
  try {
    const found = await api<{ customer: Customer; vehicle: Vehicle }>(`/vehicles/lookup?plate=${encodeURIComponent(value)}`);
    message.success(`${found.vehicle.plate} · ${found.customer.name}`);
    goToOrder(found.customer, found.vehicle);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound.value = true;
      return;
    }
    message.error(error instanceof Error ? error.message : 'Não foi possível buscar a placa');
  } finally {
    searching.value = false;
  }
}

async function createWalkIn() {
  creating.value = true;
  try {
    const saved = await api<{ customer: Customer; vehicle: Vehicle }>('/customers/walk-in', {
      method: 'POST',
      body: JSON.stringify({ ...form, plate: plate.value }),
    });
    goToOrder(saved.customer, saved.vehicle);
  } catch (error) {
    message.error(error instanceof Error ? error.message : 'Não foi possível cadastrar');
  } finally {
    creating.value = false;
  }
}

defineExpose({ open });
</script>

<template>
  <n-button :quaternary="props.compact" :circle="props.compact" :ghost="!props.compact" @click="open">
    <template #icon><n-icon :component="CarSportOutline" /></template>
    <span v-if="!props.compact">OS por placa</span>
  </n-button>
  <n-modal v-model:show="visible" preset="card" title="Abrir OS pela placa" style="width: min(520px, 94vw)" @after-leave="reset">
    <n-space vertical :size="16">
      <n-input-group>
        <n-input v-model:value="plate" placeholder="BRA2E19" style="text-transform: uppercase" @keyup.enter="searchPlate" />
        <n-button type="primary" :loading="searching" :disabled="!plate.trim()" @click="searchPlate">Buscar</n-button>
      </n-input-group>
      <n-alert v-if="notFound" type="warning">Placa não cadastrada. Preencha o mínimo e siga para a OS.</n-alert>
      <n-grid v-if="notFound" :cols="2" :x-gap="12" :y-gap="12">
        <n-grid-item :span="2">
          <n-form-item label="Cliente" :show-feedback="false">
            <n-input v-model:value="form.name" />
          </n-form-item>
        </n-grid-item>
        <n-grid-item :span="2">
          <n-form-item label="Telefone / WhatsApp" :show-feedback="false">
            <n-input v-model:value="form.phone" />
          </n-form-item>
        </n-grid-item>
        <n-grid-item>
          <n-form-item label="Marca" :show-feedback="false"><n-input v-model:value="form.brand" /></n-form-item>
        </n-grid-item>
        <n-grid-item>
          <n-form-item label="Modelo" :show-feedback="false"><n-input v-model:value="form.model" /></n-form-item>
        </n-grid-item>
        <n-grid-item>
          <n-form-item label="Ano" :show-feedback="false"><n-input-number v-model:value="form.year" class="w-full" :min="1950" :max="2100" /></n-form-item>
        </n-grid-item>
        <n-grid-item>
          <n-form-item label="KM" :show-feedback="false"><n-input-number v-model:value="form.mileage" class="w-full" :min="0" /></n-form-item>
        </n-grid-item>
        <n-grid-item :span="2">
          <n-button
            type="primary"
            block
            :loading="creating"
            :disabled="!form.name.trim() || !form.phone.trim() || !form.brand.trim() || !form.model.trim()"
            @click="createWalkIn"
          >
            Cadastrar e abrir OS
          </n-button>
        </n-grid-item>
      </n-grid>
    </n-space>
  </n-modal>
</template>
