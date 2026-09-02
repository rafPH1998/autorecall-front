<script setup lang="ts">
import PageHeader from '@/components/app/PageHeader.vue';
import StatusTag from '@/components/app/StatusTag.vue';
import { useAppStore } from '@/stores/app';
import type { Service } from '@/types/domain';
import { NButton, type DataTableColumns } from 'naive-ui';
import { computed, h, ref } from 'vue';
import { useRouter } from 'vue-router';

const store = useAppStore();
const router = useRouter();
const search = ref('');
const pagination = { pageSize: 10 };
const services = computed(() => {
  const term = search.value.trim().toLocaleLowerCase('pt-BR');
  return term ? store.services.filter((service) => `${service.name} ${service.description}`.toLocaleLowerCase('pt-BR').includes(term)) : store.services;
});
const preventiveRule = (months: number | null, mileage: number | null) => {
  const rules = [months ? `${months} meses` : '', mileage ? `${mileage.toLocaleString('pt-BR')} km` : ''].filter(Boolean);
  return rules.length ? rules.join(' ou ') : 'Sem recorrência';
};

const columns = computed<DataTableColumns<Service>>(() => [
  { title: 'Serviço', key: 'name', sorter: 'default' },
  { title: 'Descrição', key: 'description' },
  {
    title: 'Preço',
    key: 'price',
    sorter: (a, b) => a.price - b.price,
    render(row) {
      return row.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    },
  },
  {
    title: 'Regra preventiva',
    key: 'rule',
    render(row) {
      return preventiveRule(row.intervalMonths, row.intervalMileage);
    },
  },
  {
    title: 'Situação',
    key: 'active',
    render(row) {
      return h(StatusTag, { value: row.active ? 'Ativo' : 'Inativo' });
    },
  },
  {
    title: 'Ações',
    key: 'actions',
    width: 88,
    render(row) {
      return h(
        NButton,
        { text: true, size: 'small', onClick: () => router.push({ name: 'service-edit', params: { id: row.id } }) },
        { default: () => 'Editar' },
      );
    },
  },
]);
</script>

<template>
  <PageHeader title="Serviços" description="Catálogo de serviços, preços e regras preventivas.">
    <template #actions>
      <n-button type="primary" @click="router.push({ name: 'service-new' })">Novo serviço</n-button>
    </template>
  </PageHeader>
  <n-card>
    <n-input v-model:value="search" class="w-full sm:max-w-md mb-4" placeholder="Buscar serviço" />
    <n-data-table
      :columns="columns"
      :data="services"
      :row-key="(row: Service) => row.id"
      :bordered="false"
      striped
      :pagination="pagination"
    />
  </n-card>
</template>
