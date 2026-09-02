<script setup lang="ts">
import PageHeader from '@/components/app/PageHeader.vue';
import { useAppStore } from '@/stores/app';
import type { Service } from '@/types/domain';
import { useMessage } from 'naive-ui';
import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const store = useAppStore();
const route = useRoute();
const router = useRouter();
const message = useMessage();
const id = computed(() => Number(route.params.id) || undefined);
const existing = computed(() => store.services.find((item) => item.id === id.value));
const submitted = ref(false);
const form = reactive<Omit<Service, 'id'>>({
  name: existing.value?.name ?? '',
  description: existing.value?.description ?? '',
  price: existing.value?.price ?? 0,
  intervalMonths: existing.value?.intervalMonths ?? null,
  intervalMileage: existing.value?.intervalMileage ?? null,
  active: existing.value?.active ?? true,
});
const valid = computed(() => Boolean(form.name.trim() && form.description.trim() && form.price >= 0));

async function save() {
  submitted.value = true;
  if (!valid.value) return;
  try {
    await store.upsertService({ ...form, id: id.value });
    message.success('O catálogo foi atualizado.');
    router.push({ name: 'services' });
  } catch (error) {
    message.error(error instanceof Error ? error.message : 'Tente novamente.');
  }
}
</script>

<template>
  <PageHeader :title="id ? 'Editar serviço' : 'Novo serviço'" description="Configure preço, disponibilidade e recorrência preventiva.">
    <template #actions>
      <n-button ghost @click="router.push({ name: 'services' })">Cancelar</n-button>
      <n-button type="primary" @click="save">Salvar</n-button>
    </template>
  </PageHeader>
  <n-alert v-if="id && !existing" type="error" class="mb-4">Serviço não encontrado.</n-alert>
  <n-card v-else>
    <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
      <n-form-item
        label="Nome *"
        class="md:col-span-2"
        :validation-status="submitted && !form.name ? 'error' : undefined"
        :feedback="submitted && !form.name ? 'Informe o nome.' : undefined"
      >
        <n-input id="name" v-model:value.trim="form.name" />
      </n-form-item>
      <n-form-item
        label="Descrição *"
        class="md:col-span-2"
        :validation-status="submitted && !form.description ? 'error' : undefined"
        :feedback="submitted && !form.description ? 'Informe a descrição.' : undefined"
      >
        <n-input id="description" v-model:value.trim="form.description" type="textarea" :autosize="{ minRows: 3 }" />
      </n-form-item>
      <n-form-item label="Preço *">
        <n-input-number id="price" v-model:value="form.price" class="w-full" :min="0" :precision="2" :show-button="false" />
      </n-form-item>
      <div class="flex items-center gap-3 pt-6">
        <n-switch v-model:value="form.active" />
        <label>{{ form.active ? 'Serviço ativo' : 'Serviço inativo' }}</label>
      </div>
      <div class="md:col-span-2 border-t border-gray-200 pt-5">
        <h2 class="text-lg font-semibold mt-0 mb-1">Regra preventiva</h2>
        <p class="muted text-sm mt-0">Informe um ou ambos os limites. Deixe em branco para serviço sem recorrência.</p>
      </div>
      <n-form-item label="Intervalo em meses">
        <n-input-number id="months" v-model:value="form.intervalMonths" class="w-full" :min="1" :show-button="false" clearable />
      </n-form-item>
      <n-form-item label="Intervalo por quilometragem">
        <n-input-number id="mileage" v-model:value="form.intervalMileage" class="w-full" :min="1" :show-button="false" clearable />
      </n-form-item>
    </div>
    <n-alert v-if="submitted && !valid" type="error" class="mt-5">Preencha nome, descrição e um preço válido.</n-alert>
  </n-card>
</template>
