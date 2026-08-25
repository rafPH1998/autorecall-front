<script setup lang="ts">
import PageHeader from '@/components/app/PageHeader.vue';
import { useAppStore } from '@/stores/app';
import type { Service } from '@/types/domain';
import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const store = useAppStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();
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

function save() {
  submitted.value = true;
  if (!valid.value) return;
  store.upsertService({ ...form, id: id.value });
  toast.add({ severity: 'success', summary: 'Serviço salvo', detail: 'O catálogo foi atualizado.', life: 3000 });
  router.push({ name: 'services' });
}
</script>

<template>
  <PageHeader :title="id ? 'Editar serviço' : 'Novo serviço'" description="Configure preço, disponibilidade e recorrência preventiva.">
    <template #actions>
      <Button label="Cancelar" severity="secondary" outlined @click="router.push({ name: 'services' })" />
      <Button label="Salvar" icon="pi pi-check" @click="save" />
    </template>
  </PageHeader>
  <Message v-if="id && !existing" severity="error" class="mb-4">Serviço não encontrado.</Message>
  <div v-else class="card">
    <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div class="flex flex-col gap-2 md:col-span-2"><label for="name">Nome *</label><InputText id="name" v-model.trim="form.name" :invalid="submitted && !form.name" /></div>
      <div class="flex flex-col gap-2 md:col-span-2"><label for="description">Descrição *</label><Textarea id="description" v-model.trim="form.description" rows="3" auto-resize :invalid="submitted && !form.description" /></div>
      <div class="flex flex-col gap-2"><label for="price">Preço *</label><InputNumber id="price" v-model="form.price" mode="currency" currency="BRL" locale="pt-BR" :min="0" /></div>
      <div class="flex items-center gap-3 pt-6"><ToggleSwitch v-model="form.active" input-id="active" /><label for="active">{{ form.active ? 'Serviço ativo' : 'Serviço inativo' }}</label></div>
      <div class="md:col-span-2 border-t border-surface pt-5">
        <h2 class="text-lg font-semibold mt-0 mb-1">Regra preventiva</h2>
        <p class="text-muted-color text-sm mt-0">Informe um ou ambos os limites. Deixe em branco para serviço sem recorrência.</p>
      </div>
      <div class="flex flex-col gap-2"><label for="months">Intervalo em meses</label><InputNumber id="months" v-model="form.intervalMonths" suffix=" meses" :min="1" /></div>
      <div class="flex flex-col gap-2"><label for="mileage">Intervalo por quilometragem</label><InputNumber id="mileage" v-model="form.intervalMileage" suffix=" km" :min="1" /></div>
    </div>
    <Message v-if="submitted && !valid" severity="error" class="mt-5">Preencha nome, descrição e um preço válido.</Message>
  </div>
</template>
