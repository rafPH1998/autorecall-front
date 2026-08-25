<script setup lang="ts">
import PageHeader from '@/components/app/PageHeader.vue';
import { useAppStore } from '@/stores/app';
import type { MaintenanceStatus, Vehicle } from '@/types/domain';
import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const store = useAppStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const id = computed(() => Number(route.params.id) || undefined);
const existing = computed(() => store.vehicles.find((item) => item.id === id.value));
const submitted = ref(false);
const statuses: MaintenanceStatus[] = ['Próxima', 'Atrasada', 'Concluída'];
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

function save() {
  submitted.value = true;
  if (!valid.value) return;
  store.upsertVehicle({ ...form, plate: form.plate.toUpperCase(), id: id.value });
  toast.add({ severity: 'success', summary: 'Veículo salvo', detail: 'Cadastro atualizado com sucesso.', life: 3000 });
  router.push({ name: 'vehicles' });
}
</script>

<template>
  <PageHeader :title="id ? 'Editar veículo' : 'Novo veículo'" description="Vincule o veículo ao cliente e informe os dados de manutenção.">
    <template #actions>
      <Button label="Cancelar" severity="secondary" outlined @click="router.push({ name: 'vehicles' })" />
      <Button label="Salvar" icon="pi pi-check" @click="save" />
    </template>
  </PageHeader>
  <Message v-if="id && !existing" severity="error" class="mb-4">Veículo não encontrado.</Message>
  <div v-else class="card">
    <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div class="flex flex-col gap-2 md:col-span-2">
        <label for="customer">Cliente *</label>
        <Select id="customer" v-model="form.customerId" :options="customers" option-label="label" option-value="value" filter placeholder="Selecione o proprietário" :invalid="submitted && !form.customerId" />
        <small v-if="submitted && !form.customerId" class="text-red-500">Selecione um cliente.</small>
      </div>
      <div class="flex flex-col gap-2"><label for="plate">Placa *</label><InputText id="plate" v-model.trim="form.plate" class="uppercase" maxlength="8" :invalid="submitted && !form.plate" /></div>
      <div class="flex flex-col gap-2"><label for="brand">Marca *</label><InputText id="brand" v-model.trim="form.brand" :invalid="submitted && !form.brand" /></div>
      <div class="flex flex-col gap-2"><label for="model">Modelo *</label><InputText id="model" v-model.trim="form.model" :invalid="submitted && !form.model" /></div>
      <div class="flex flex-col gap-2"><label for="year">Ano *</label><InputNumber id="year" v-model="form.year" :use-grouping="false" :min="1901" :max="new Date().getFullYear() + 1" /></div>
      <div class="flex flex-col gap-2"><label for="mileage">Quilometragem *</label><InputNumber id="mileage" v-model="form.mileage" suffix=" km" :min="0" /></div>
      <div class="flex flex-col gap-2"><label for="maintenance">Próxima manutenção</label><InputText id="maintenance" v-model="form.nextMaintenance" placeholder="DD/MM/AAAA" /></div>
      <div class="flex flex-col gap-2"><label for="status">Status</label><Select id="status" v-model="form.maintenanceStatus" :options="statuses" /></div>
    </div>
  </div>
</template>
