<script setup lang="ts">
import PageHeader from '@/components/app/PageHeader.vue';
import { useAppStore } from '@/stores/app';
import type { Customer } from '@/types/domain';
import { useMessage } from 'naive-ui';
import { computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const store = useAppStore();
const route = useRoute();
const router = useRouter();
const message = useMessage();
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

async function save() {
  submitted.value = true;
  if (!valid.value) return;
  try {
    await store.upsertCustomer({ ...form, id: id.value });
    message.success('Os dados foram atualizados com sucesso.');
    router.push({ name: 'customers' });
  } catch (error) {
    message.error(error instanceof Error ? error.message : 'Tente novamente.');
  }
}
</script>

<template>
  <PageHeader :title="id ? 'Editar cliente' : 'Novo cliente'" description="Informe os dados de identificação e contato.">
    <template #actions>
      <n-button ghost @click="router.push({ name: 'customers' })">Cancelar</n-button>
      <n-button type="primary" @click="save">Salvar</n-button>
    </template>
  </PageHeader>

  <n-alert v-if="id && !existing" type="error" class="mb-4">Cliente não encontrado.</n-alert>
  <n-card v-else>
    <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
      <n-form-item
        label="Nome completo *"
        class="md:col-span-2"
        :validation-status="submitted.value && !form.name ? 'error' : undefined"
        :feedback="submitted.value && !form.name ? 'Informe o nome.' : undefined"
      >
        <n-input id="name" v-model:value.trim="form.name" />
      </n-form-item>
      <n-form-item
        label="CPF/CNPJ *"
        :validation-status="submitted.value && !form.document ? 'error' : undefined"
        :feedback="submitted.value && !form.document ? 'Informe o documento.' : undefined"
      >
        <n-input id="document" v-model:value.trim="form.document" />
      </n-form-item>
      <n-form-item
        label="E-mail"
        :validation-status="submitted.value && !emailValid ? 'error' : undefined"
        :feedback="submitted.value && !emailValid ? 'Informe um e-mail válido.' : undefined"
      >
        <n-input id="email" v-model:value.trim="form.email" type="email" />
      </n-form-item>
      <n-form-item
        label="Telefone *"
        :validation-status="submitted.value && !form.phone ? 'error' : undefined"
        :feedback="submitted.value && !form.phone ? 'Informe o telefone.' : undefined"
      >
        <n-input id="phone" v-model:value.trim="form.phone" />
      </n-form-item>
      <n-form-item label="WhatsApp">
        <n-input id="whatsapp" v-model:value.trim="form.whatsapp" placeholder="Código do país + DDD + número" />
      </n-form-item>
    </div>
  </n-card>
</template>
