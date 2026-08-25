<script setup lang="ts">
import PageHeader from '@/components/app/PageHeader.vue';
import { useAppStore } from '@/stores/app';
import type { Customer } from '@/types/domain';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const store = useAppStore();
const router = useRouter();
const search = ref('');

const customers = computed(() => {
  const term = search.value.trim().toLocaleLowerCase('pt-BR');
  if (!term) return store.customers;
  return store.customers.filter((customer) =>
    [customer.name, customer.document, customer.phone, customer.email].some((value) =>
      value.toLocaleLowerCase('pt-BR').includes(term),
    ),
  );
});

function openCustomer(customer: Customer) {
  router.push({ name: 'customer-detail', params: { id: customer.id } });
}
</script>

<template>
  <PageHeader title="Clientes" description="Consulte e mantenha os clientes da oficina.">
    <template #actions>
      <Button label="Novo cliente" icon="pi pi-plus" @click="router.push({ name: 'customer-new' })" />
    </template>
  </PageHeader>

  <div class="card">
    <div class="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
      <IconField class="w-full sm:max-w-md">
        <InputIcon class="pi pi-search" />
        <InputText v-model="search" class="w-full" placeholder="Buscar por nome, documento ou contato" />
      </IconField>
      <span class="text-muted-color text-sm">{{ customers.length }} cliente(s)</span>
    </div>

    <DataTable :value="customers" data-key="id" paginator :rows="10" :rows-per-page-options="[5, 10, 20]" striped-rows responsive-layout="scroll">
      <Column field="name" header="Cliente" sortable />
      <Column field="document" header="Documento" />
      <Column field="phone" header="Telefone" />
      <Column field="email" header="E-mail" />
      <Column field="lastVisit" header="Última visita" sortable />
      <Column header="Ações" style="width: 9rem">
        <template #body="{ data }">
          <div class="flex gap-1">
            <Button icon="pi pi-eye" text rounded aria-label="Ver cliente" @click="openCustomer(data)" />
            <Button icon="pi pi-pencil" text rounded aria-label="Editar cliente" @click="router.push({ name: 'customer-edit', params: { id: data.id } })" />
          </div>
        </template>
      </Column>
      <template #empty>
        <div class="py-8 text-center text-muted-color">
          <i class="pi pi-users text-3xl mb-3 block" />
          Nenhum cliente encontrado.
        </div>
      </template>
    </DataTable>
  </div>
</template>
