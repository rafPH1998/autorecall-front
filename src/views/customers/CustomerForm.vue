<script setup lang="ts">
import PageHeader from '@/components/app/PageHeader.vue';
import { useAppStore } from '@/stores/app';
import type { Customer } from '@/types/domain';
import { computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const store = useAppStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const id = computed(() => Number(route.params.id) || undefined);
const existing = computed(() => store.customers.find((item) => item.id === id.value));
const submitted = reactive({ value: false });

const form = reactive<Omit<Customer, 'id'>>({
  name: existing.value?.name ?? '',
  phone: existing.value?.phone ?? '',
  whatsapp: existing.value?.whatsapp ?? '',
  email: existing.value?.email ?? '',
  document: existing.value?.document ?? '',
  lastVisit: existing.value?.lastVisit ?? 'Sem visitas',
});

const emailValid = computed(() => !form.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email));
const valid = computed(() => Boolean(form.name.trim() && form.phone.trim() && form.document.trim() && emailValid.value));

function save() {
  submitted.value = true;
  if (!valid.value) return;
  store.upsertCustomer({ ...form, id: id.value });
  toast.add({ severity: 'success', summary: 'Cliente salvo', detail: 'Os dados foram atualizados com sucesso.', life: 3000 });
  router.push({ name: 'customers' });
}
</script>

<template>
  <PageHeader :title="id ? 'Editar cliente' : 'Novo cliente'" description="Informe os dados de identificação e contato.">
    <template #actions>
      <Button label="Cancelar" severity="secondary" outlined @click="router.push({ name: 'customers' })" />
      <Button label="Salvar" icon="pi pi-check" @click="save" />
    </template>
  </PageHeader>

  <Message v-if="id && !existing" severity="error" class="mb-4">Cliente não encontrado.</Message>
  <div v-else class="card">
    <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div class="flex flex-col gap-2 md:col-span-2">
        <label for="name">Nome completo *</label>
        <InputText id="name" v-model.trim="form.name" :invalid="submitted.value && !form.name" />
        <small v-if="submitted.value && !form.name" class="text-red-500">Informe o nome.</small>
      </div>
      <div class="flex flex-col gap-2">
        <label for="document">CPF/CNPJ *</label>
        <InputText id="document" v-model.trim="form.document" :invalid="submitted.value && !form.document" />
        <small v-if="submitted.value && !form.document" class="text-red-500">Informe o documento.</small>
      </div>
      <div class="flex flex-col gap-2">
        <label for="email">E-mail</label>
        <InputText id="email" v-model.trim="form.email" type="email" :invalid="submitted.value && !emailValid" />
        <small v-if="submitted.value && !emailValid" class="text-red-500">Informe um e-mail válido.</small>
      </div>
      <div class="flex flex-col gap-2">
        <label for="phone">Telefone *</label>
        <InputText id="phone" v-model.trim="form.phone" :invalid="submitted.value && !form.phone" />
        <small v-if="submitted.value && !form.phone" class="text-red-500">Informe o telefone.</small>
      </div>
      <div class="flex flex-col gap-2">
        <label for="whatsapp">WhatsApp</label>
        <InputText id="whatsapp" v-model.trim="form.whatsapp" placeholder="Código do país + DDD + número" />
      </div>
    </div>
  </div>
</template>
