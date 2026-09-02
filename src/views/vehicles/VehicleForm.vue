<script setup lang="ts">
import PageHeader from '@/components/app/PageHeader.vue';
import { useAppStore } from '@/stores/app';
import type { MaintenanceStatus, Vehicle } from '@/types/domain';
import { useMessage } from 'naive-ui';
import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const store = useAppStore();
const route = useRoute();
const router = useRouter();
const message = useMessage();
const id = computed(() => Number(route.params.id) || undefined);
const existing = computed(() => store.vehicles.find((item) => item.id === id.value));
const submitted = ref(false);
const statuses: MaintenanceStatus[] = ['Próxima', 'Atrasada', 'Concluída'];
const statusOptions = statuses.map((value) => ({ label: value, value }));
const customers = computed(() => store.customers.map((customer) => ({ label: customer.name, value: customer.id })));
const form = reactive<Omit<Vehicle, 'id'>>({
  customerId: existing.value?.customerId ?? (Number(route.query.customerId) || 0),
  plate: existing.value?.plate ?? '',
  brand: existing.value?.brand ?? '',
  model: existing.value?.model ?? '',
  year: existing.value?.year ?? new Date().getFullYear(),
  mileage: existing.value?.mileage ?? 0,
  nextMaintenance: existing.value?.nextMaintenance ?? '',
  maintenanceStatus: existing.value?.maintenanceStatus ?? 'Próxima',
});
const valid = computed(() => Boolean(form.customerId && form.plate.trim() && form.brand.trim() && form.model.trim() && form.year > 1900 && form.mileage >= 0));

async function save() {
  submitted.value = true;
  if (!valid.value) return;
  try {
    await store.upsertVehicle({ ...form, plate: form.plate.toUpperCase(), id: id.value });
    message.success('Cadastro atualizado com sucesso.');
    router.push({ name: 'vehicles' });
  } catch (error) {
    message.error(error instanceof Error ? error.message : 'Tente novamente.');
  }
}
</script>

<template>
  <PageHeader :title="id ? 'Editar veículo' : 'Novo veículo'" description="Vincule o veículo ao cliente e informe os dados de manutenção.">
    <template #actions>
      <n-button ghost @click="router.push({ name: 'vehicles' })">Cancelar</n-button>
      <n-button type="primary" @click="save">Salvar</n-button>
    </template>
  </PageHeader>
  <n-alert v-if="id && !existing" type="error" class="mb-4">Veículo não encontrado.</n-alert>
  <n-card v-else>
    <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
      <n-form-item
        label="Cliente *"
        class="md:col-span-2"
        :validation-status="submitted && !form.customerId ? 'error' : undefined"
        :feedback="submitted && !form.customerId ? 'Selecione um cliente.' : undefined"
      >
        <n-select
          id="customer"
          v-model:value="form.customerId"
          :options="customers"
          filterable
          placeholder="Selecione o proprietário"
        />
      </n-form-item>
      <n-form-item
        label="Placa *"
        :validation-status="submitted && !form.plate ? 'error' : undefined"
        :feedback="submitted && !form.plate ? 'Informe a placa.' : undefined"
      >
        <n-input id="plate" v-model:value.trim="form.plate" maxlength="8" style="text-transform: uppercase" />
      </n-form-item>
      <n-form-item
        label="Marca *"
        :validation-status="submitted && !form.brand ? 'error' : undefined"
        :feedback="submitted && !form.brand ? 'Informe a marca.' : undefined"
      >
        <n-input id="brand" v-model:value.trim="form.brand" />
      </n-form-item>
      <n-form-item
        label="Modelo *"
        :validation-status="submitted && !form.model ? 'error' : undefined"
        :feedback="submitted && !form.model ? 'Informe o modelo.' : undefined"
      >
        <n-input id="model" v-model:value.trim="form.model" />
      </n-form-item>
      <n-form-item label="Ano *">
        <n-input-number id="year" v-model:value="form.year" class="w-full" :show-button="false" :min="1901" :max="new Date().getFullYear() + 1" />
      </n-form-item>
      <n-form-item label="Quilometragem *">
        <n-input-number id="mileage" v-model:value="form.mileage" class="w-full" :show-button="false" :min="0" />
      </n-form-item>
      <n-form-item label="Próxima manutenção">
        <n-input id="maintenance" v-model:value="form.nextMaintenance" placeholder="DD/MM/AAAA" />
      </n-form-item>
      <n-form-item label="Status">
        <n-select id="status" v-model:value="form.maintenanceStatus" :options="statusOptions" />
      </n-form-item>
    </div>
  </n-card>
</template>
