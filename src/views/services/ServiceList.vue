<script setup lang="ts">
import PageHeader from '@/components/app/PageHeader.vue';
import StatusTag from '@/components/app/StatusTag.vue';
import { useAppStore } from '@/stores/app';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const store = useAppStore();
const router = useRouter();
const search = ref('');
const services = computed(() => {
  const term = search.value.trim().toLocaleLowerCase('pt-BR');
  return term ? store.services.filter((service) => `${service.name} ${service.description}`.toLocaleLowerCase('pt-BR').includes(term)) : store.services;
});
const preventiveRule = (months: number | null, mileage: number | null) => {
  const rules = [months ? `${months} meses` : '', mileage ? `${mileage.toLocaleString('pt-BR')} km` : ''].filter(Boolean);
  return rules.length ? rules.join(' ou ') : 'Sem recorrência';
};
</script>

<template>
  <PageHeader title="Serviços" description="Catálogo de serviços, preços e regras preventivas.">
    <template #actions><Button label="Novo serviço" icon="pi pi-plus" @click="router.push({ name: 'service-new' })" /></template>
  </PageHeader>
  <div class="card">
    <IconField class="w-full sm:max-w-md mb-4"><InputIcon class="pi pi-search" /><InputText v-model="search" class="w-full" placeholder="Buscar serviço" /></IconField>
    <DataTable :value="services" data-key="id" paginator :rows="10" striped-rows responsive-layout="scroll">
      <Column field="name" header="Serviço" sortable />
      <Column field="description" header="Descrição" />
      <Column header="Preço" sortable sort-field="price"><template #body="{ data }">{{ data.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}</template></Column>
      <Column header="Regra preventiva"><template #body="{ data }">{{ preventiveRule(data.intervalMonths, data.intervalMileage) }}</template></Column>
      <Column header="Situação"><template #body="{ data }"><StatusTag :value="data.active ? 'Ativo' : 'Inativo'" /></template></Column>
      <Column header="Ações"><template #body="{ data }"><Button icon="pi pi-pencil" text rounded aria-label="Editar serviço" @click="router.push({ name: 'service-edit', params: { id: data.id } })" /></template></Column>
      <template #empty><div class="py-8 text-center text-muted-color"><i class="pi pi-wrench text-3xl block mb-3" />Nenhum serviço encontrado.</div></template>
    </DataTable>
  </div>
</template>
