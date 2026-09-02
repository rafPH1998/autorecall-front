<script setup lang="ts">
import PageHeader from '@/components/app/PageHeader.vue';
import { useAppStore } from '@/stores/app';
import type { Customer } from '@/types/domain';
import { NButton, type DataTableColumns } from 'naive-ui';
import { computed, h, ref } from 'vue';
import { useRouter } from 'vue-router';

const store = useAppStore();
const router = useRouter();
const search = ref('');
const pagination = { pageSize: 10, pageSizes: [5, 10, 20], showSizePicker: true };

const customers = computed(() => {
  const term = search.value.trim().toLocaleLowerCase('pt-BR');
  if (!term) return store.customers;
  return store.customers.filter((customer) =>
    [customer.name, customer.document, customer.phone, customer.email].some((value) =>
      value.toLocaleLowerCase('pt-BR').includes(term),
    ),
  );
});

const columns = computed<DataTableColumns<Customer>>(() => [
  { title: 'Cliente', key: 'name', sorter: 'default' },
  { title: 'Documento', key: 'document' },
  { title: 'Telefone', key: 'phone' },
  { title: 'E-mail', key: 'email' },
  { title: 'Última visita', key: 'lastVisit', sorter: 'default' },
  {
    title: 'Ações',
    key: 'actions',
    width: 144,
    render(row) {
      return h('div', { class: 'flex gap-1' }, [
        h(NButton, { text: true, size: 'small', onClick: () => openCustomer(row) }, { default: () => 'Ver' }),
        h(
          NButton,
          { text: true, size: 'small', onClick: () => router.push({ name: 'customer-edit', params: { id: row.id } }) },
          { default: () => 'Editar' },
        ),
      ]);
    },
  },
]);

function openCustomer(customer: Customer) {
  router.push({ name: 'customer-detail', params: { id: customer.id } });
}
</script>

<template>
  <PageHeader title="Clientes" description="Consulte e mantenha os clientes da oficina.">
    <template #actions>
      <n-button type="primary" @click="router.push({ name: 'customer-new' })">Novo cliente</n-button>
    </template>
  </PageHeader>

  <n-card>
    <div class="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
      <n-input v-model:value="search" class="w-full sm:max-w-md" placeholder="Buscar por nome, documento ou contato" />
      <span class="muted text-sm">{{ customers.length }} cliente(s)</span>
    </div>
    <n-data-table
      :columns="columns"
      :data="customers"
      :row-key="(row: Customer) => row.id"
      :bordered="false"
      striped
      :pagination="pagination"
    />
  </n-card>
</template>
