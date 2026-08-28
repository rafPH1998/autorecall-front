<script setup lang="ts">
import PageHeader from '@/components/app/PageHeader.vue';
import StatusTag from '@/components/app/StatusTag.vue';
import { useAppStore } from '@/stores/app';
import { useAuthStore } from '@/stores/auth';
import type { Workshop, WorkshopUser } from '@/types/domain';
import { reactive, ref } from 'vue';
import { useToast } from 'primevue/usetoast';

const store = useAppStore();
const auth = useAuthStore();
const toast = useToast();
const workshop = reactive<Workshop>({ ...store.workshop });
const users = ref<WorkshopUser[]>(store.workshopUsers.map((user) => ({ ...user })));
const preferences = reactive({
  ...store.preferences,
  whatsappTemplate:
    store.preferences.whatsappTemplate
    || 'Olá, {nome}! Sentimos sua falta. Podemos agendar uma revisão para o seu {veiculo}?',
});
const saving = ref(false);

const roles: WorkshopUser['role'][] = ['Administrador', 'Atendente', 'Mecânico'];

function addUser() {
  if (!auth.isAdmin) return;
  users.value.push({
    id: Date.now(),
    name: '',
    email: '',
    role: 'Atendente',
    active: true,
  });
}

function removeUser(id: number) {
  if (!auth.isAdmin) return;
  users.value = users.value.filter((user) => user.id !== id);
}

async function save() {
  if (!auth.isAdmin) return;
  saving.value = true;
  try {
    await store.saveSettings({
      workshop: { ...workshop },
      users: users.value
        .filter((user) => user.name.trim() && user.email.trim())
        .map((user) => ({
          ...user,
          id: user.id > 0 && user.id < 1_000_000_000_000 ? user.id : undefined,
        })),
      preferences: { ...preferences },
    });
    users.value = store.workshopUsers.map((user) => ({ ...user }));
    toast.add({ severity: 'success', summary: 'Configurações salvas', detail: 'As preferências da oficina foram atualizadas.', life: 3000 });
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erro ao salvar', detail: error instanceof Error ? error.message : 'Tente novamente.', life: 4000 });
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <PageHeader title="Configurações" description="Gerencie os dados, equipe e preferências da oficina.">
    <template #actions>
      <Button v-if="auth.isAdmin" label="Salvar alterações" icon="pi pi-save" :loading="saving" @click="save" />
    </template>
  </PageHeader>

  <Message v-if="!auth.isAdmin" severity="warn" class="mb-4">
    Somente o administrador da oficina pode alterar estas configurações.
  </Message>

  <fieldset :disabled="!auth.isAdmin" class="m-0 border-0 p-0">
    <div class="grid grid-cols-12 gap-6">
      <div class="col-span-12 xl:col-span-8">
        <div class="card">
          <h2 class="text-xl font-semibold mt-0 mb-5">Dados da oficina</h2>
          <div class="grid grid-cols-12 gap-4">
            <div class="col-span-12 md:col-span-8">
              <label for="workshop-name" class="block font-medium mb-2">Nome da oficina</label>
              <InputText id="workshop-name" v-model="workshop.name" class="w-full" />
            </div>
            <div class="col-span-12 md:col-span-4">
              <label for="document" class="block font-medium mb-2">CNPJ</label>
              <InputText id="document" v-model="workshop.document" class="w-full" />
            </div>
            <div class="col-span-12 md:col-span-6">
              <label for="phone" class="block font-medium mb-2">Telefone</label>
              <InputText id="phone" v-model="workshop.phone" class="w-full" />
            </div>
            <div class="col-span-12 md:col-span-6">
              <label for="whatsapp" class="block font-medium mb-2">WhatsApp</label>
              <InputText id="whatsapp" v-model="workshop.whatsapp" class="w-full" />
            </div>
            <div class="col-span-12">
              <label for="email" class="block font-medium mb-2">E-mail</label>
              <InputText id="email" v-model="workshop.email" type="email" class="w-full" />
            </div>
            <div class="col-span-12">
              <label for="address" class="block font-medium mb-2">Endereço</label>
              <InputText id="address" v-model="workshop.address" class="w-full" />
            </div>
          </div>
        </div>
      </div>

      <div class="col-span-12 xl:col-span-4">
        <div class="card h-full">
          <h2 class="text-xl font-semibold mt-0 mb-5">Logo</h2>
          <div class="flex min-h-48 flex-col items-center justify-center rounded-border border-2 border-dashed border-surface-300 bg-surface-50 p-6 text-center dark:border-surface-600 dark:bg-surface-800">
            <div class="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-400/10">
              <i class="pi pi-image text-3xl" />
            </div>
            <p class="font-medium mb-1 mt-4">Logo da oficina</p>
            <small class="text-muted-color">PNG ou JPG, até 2 MB</small>
            <Button label="Selecionar imagem" icon="pi pi-upload" outlined size="small" class="mt-4" @click="toast.add({ severity: 'info', summary: 'Envio simulado', detail: 'O upload estará disponível na integração com a API.', life: 3000 })" />
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
        <div><h2 class="text-xl font-semibold m-0">Usuários</h2><p class="text-muted-color mt-1 mb-0">Pessoas com acesso à oficina.</p></div>
        <Button v-if="auth.isAdmin" label="Adicionar usuário" icon="pi pi-plus" outlined @click="addUser" />
      </div>

      <div v-if="users.length" class="overflow-x-auto">
        <div class="min-w-[760px]">
          <div v-for="user in users" :key="user.id" class="grid grid-cols-12 gap-3 items-center border-b border-surface-200 py-3 last:border-0 dark:border-surface-700">
            <div class="col-span-3"><InputText v-model="user.name" placeholder="Nome" class="w-full" /></div>
            <div class="col-span-4"><InputText v-model="user.email" type="email" placeholder="E-mail" class="w-full" /></div>
            <div class="col-span-3"><Select v-model="user.role" :options="roles" class="w-full" /></div>
            <div class="col-span-1 flex justify-center">
              <button type="button" class="cursor-pointer border-0 bg-transparent p-0" :aria-label="user.active ? 'Desativar usuário' : 'Ativar usuário'" @click="user.active = !user.active">
                <StatusTag :value="user.active ? 'Ativo' : 'Inativo'" />
              </button>
            </div>
            <div class="col-span-1 text-right"><Button v-if="auth.isAdmin" icon="pi pi-trash" severity="danger" text rounded aria-label="Remover usuário" @click="removeUser(user.id)" /></div>
          </div>
        </div>
      </div>
      <div v-else class="py-8 text-center text-muted-color"><i class="pi pi-user-minus text-4xl" /><p class="mt-3 mb-0">Nenhum usuário cadastrado.</p></div>
    </div>

    <div class="card">
      <h2 class="text-xl font-semibold mt-0 mb-5">Preferências</h2>
      <div class="grid grid-cols-12 gap-5">
        <div class="col-span-12 md:col-span-6">
          <div class="flex items-start gap-3">
            <Checkbox v-model="preferences.maintenanceAlerts" input-id="maintenance-alerts" binary :disabled="!auth.isAdmin" />
            <label for="maintenance-alerts"><span class="block font-medium">Alertas de manutenção</span><small class="text-muted-color">Avisar sobre manutenções próximas e atrasadas.</small></label>
          </div>
        </div>
        <div class="col-span-12 md:col-span-6">
          <div class="flex items-start gap-3">
            <Checkbox v-model="preferences.contactReminders" input-id="contact-reminders" binary :disabled="!auth.isAdmin" />
            <label for="contact-reminders"><span class="block font-medium">Lembretes de contato</span><small class="text-muted-color">Sugerir clientes sem retorno recente.</small></label>
          </div>
        </div>
        <div class="col-span-12 md:col-span-6">
          <div class="flex items-start gap-3">
            <Checkbox v-model="preferences.weeklyReport" input-id="weekly-report" binary :disabled="!auth.isAdmin" />
            <label for="weekly-report"><span class="block font-medium">Resumo semanal</span><small class="text-muted-color">Receber um resumo dos resultados por e-mail.</small></label>
          </div>
        </div>
        <div class="col-span-12 md:col-span-6">
          <label for="reminder-days" class="block font-medium mb-2">Antecedência padrão (dias)</label>
          <InputNumber id="reminder-days" v-model="preferences.defaultReminderDays" :min="1" :max="90" show-buttons class="w-full" />
        </div>
        <div class="col-span-12">
          <label for="whatsapp-template" class="block font-medium mb-2">Modelo de WhatsApp</label>
          <Textarea id="whatsapp-template" v-model="preferences.whatsappTemplate" rows="3" class="w-full" />
          <small class="text-muted-color">{{ 'Variáveis: {nome} {veiculo} {placa} {servico}' }}</small>
        </div>
        <div class="col-span-12">
          <label for="review-url" class="block font-medium mb-2">Link de avaliação</label>
          <InputText id="review-url" v-model="preferences.reviewUrl" class="w-full" placeholder="https://g.page/r/..." />
          <small class="text-muted-color">Se estiver vazio, o pós-venda manda só o agradecimento.</small>
        </div>
        <div class="col-span-12">
          <label for="aftercare-template" class="block font-medium mb-2">Modelo de pós-venda</label>
          <Textarea id="aftercare-template" v-model="preferences.aftercareTemplate" rows="3" class="w-full" />
          <small class="text-muted-color">{{ 'Variáveis: {nome} {veiculo} {placa} {servico} {proxima} {avaliacao} {os}' }}</small>
        </div>
      </div>
    </div>
  </fieldset>
</template>
