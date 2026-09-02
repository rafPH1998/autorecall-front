<script setup lang="ts">
import PageHeader from '@/components/app/PageHeader.vue';
import StatusTag from '@/components/app/StatusTag.vue';
import { useAppStore } from '@/stores/app';
import { useAuthStore } from '@/stores/auth';
import type { Workshop, WorkshopUser } from '@/types/domain';
import { AddOutline, CloudUploadOutline, ImageOutline, PersonRemoveOutline, SaveOutline, TrashOutline } from '@vicons/ionicons5';
import { useMessage } from 'naive-ui';
import { reactive, ref } from 'vue';

const store = useAppStore();
const auth = useAuthStore();
const message = useMessage();
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
const roleOptions = roles.map((role) => ({ label: role, value: role }));

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

function notifyLogoUpload() {
  message.info('O upload estará disponível na integração com a API.');
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
    message.success('As preferências da oficina foram atualizadas.');
  } catch (error) {
    message.error(error instanceof Error ? error.message : 'Tente novamente.');
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div>
    <PageHeader title="Configurações" description="Gerencie os dados, equipe e preferências da oficina.">
      <template #actions>
        <n-button v-if="auth.isAdmin" type="primary" :loading="saving" @click="save">
          <template #icon><n-icon :component="SaveOutline" /></template>
          Salvar alterações
        </n-button>
      </template>
    </PageHeader>

    <n-alert v-if="!auth.isAdmin" type="warning" class="mb-4">
      Somente o administrador da oficina pode alterar estas configurações.
    </n-alert>

    <fieldset :disabled="!auth.isAdmin" class="m-0 border-0 p-0">
      <n-grid :cols="12" :x-gap="24" :y-gap="24" class="mb-6">
        <n-grid-item :span="8">
          <n-card>
            <h2 class="text-xl font-semibold mt-0 mb-5">Dados da oficina</h2>
            <n-grid :cols="12" :x-gap="16" :y-gap="16">
              <n-grid-item :span="8">
                <label class="block font-medium mb-2">Nome da oficina</label>
                <n-input v-model:value="workshop.name" :disabled="!auth.isAdmin" />
              </n-grid-item>
              <n-grid-item :span="4">
                <label class="block font-medium mb-2">CNPJ</label>
                <n-input v-model:value="workshop.document" :disabled="!auth.isAdmin" />
              </n-grid-item>
              <n-grid-item :span="6">
                <label class="block font-medium mb-2">Telefone</label>
                <n-input v-model:value="workshop.phone" :disabled="!auth.isAdmin" />
              </n-grid-item>
              <n-grid-item :span="6">
                <label class="block font-medium mb-2">WhatsApp</label>
                <n-input v-model:value="workshop.whatsapp" :disabled="!auth.isAdmin" />
              </n-grid-item>
              <n-grid-item :span="12">
                <label class="block font-medium mb-2">E-mail</label>
                <n-input v-model:value="workshop.email" :disabled="!auth.isAdmin" />
              </n-grid-item>
              <n-grid-item :span="12">
                <label class="block font-medium mb-2">Endereço</label>
                <n-input v-model:value="workshop.address" :disabled="!auth.isAdmin" />
              </n-grid-item>
            </n-grid>
          </n-card>
        </n-grid-item>

        <n-grid-item :span="4">
          <n-card class="h-full">
            <h2 class="text-xl font-semibold mt-0 mb-5">Logo</h2>
            <div class="flex min-h-48 flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center">
              <div class="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-400/10">
                <n-icon :component="ImageOutline" :size="32" />
              </div>
              <p class="font-medium mb-1 mt-4">Logo da oficina</p>
              <small class="muted">PNG ou JPG, até 2 MB</small>
              <n-button ghost size="small" class="mt-4" :disabled="!auth.isAdmin" @click="notifyLogoUpload">
                <template #icon><n-icon :component="CloudUploadOutline" /></template>
                Selecionar imagem
              </n-button>
            </div>
          </n-card>
        </n-grid-item>
      </n-grid>

      <n-card class="mb-6">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
          <div>
            <h2 class="text-xl font-semibold m-0">Usuários</h2>
            <p class="muted mt-1 mb-0">Pessoas com acesso à oficina.</p>
          </div>
          <n-button v-if="auth.isAdmin" ghost @click="addUser">
            <template #icon><n-icon :component="AddOutline" /></template>
            Adicionar usuário
          </n-button>
        </div>

        <div v-if="users.length" class="overflow-x-auto">
          <div class="min-w-[760px]">
            <div
              v-for="user in users"
              :key="user.id"
              class="grid grid-cols-12 gap-3 items-center border-b border-[var(--n-border-color)] py-3 last:border-0"
            >
              <div class="col-span-3">
                <n-input v-model:value="user.name" placeholder="Nome" :disabled="!auth.isAdmin" />
              </div>
              <div class="col-span-4">
                <n-input v-model:value="user.email" placeholder="E-mail" :disabled="!auth.isAdmin" />
              </div>
              <div class="col-span-3">
                <n-select v-model:value="user.role" :options="roleOptions" :disabled="!auth.isAdmin" />
              </div>
              <div class="col-span-1 flex justify-center">
                <button
                  type="button"
                  class="cursor-pointer border-0 bg-transparent p-0"
                  :disabled="!auth.isAdmin"
                  :aria-label="user.active ? 'Desativar usuário' : 'Ativar usuário'"
                  @click="user.active = !user.active"
                >
                  <StatusTag :value="user.active ? 'Ativo' : 'Inativo'" />
                </button>
              </div>
              <div class="col-span-1 text-right">
                <n-button
                  v-if="auth.isAdmin"
                  type="error"
                  text
                  circle
                  aria-label="Remover usuário"
                  @click="removeUser(user.id)"
                >
                  <template #icon><n-icon :component="TrashOutline" /></template>
                </n-button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="py-8 text-center muted">
          <n-icon :component="PersonRemoveOutline" :size="40" />
          <p class="mt-3 mb-0">Nenhum usuário cadastrado.</p>
        </div>
      </n-card>

      <n-card>
        <h2 class="text-xl font-semibold mt-0 mb-5">Preferências</h2>
        <n-grid :cols="12" :x-gap="20" :y-gap="20">
          <n-grid-item :span="6">
            <n-checkbox v-model:checked="preferences.maintenanceAlerts" :disabled="!auth.isAdmin">
              <span class="block font-medium">Alertas de manutenção</span>
              <small class="muted">Avisar sobre manutenções próximas e atrasadas.</small>
            </n-checkbox>
          </n-grid-item>
          <n-grid-item :span="6">
            <n-checkbox v-model:checked="preferences.contactReminders" :disabled="!auth.isAdmin">
              <span class="block font-medium">Lembretes de contato</span>
              <small class="muted">Sugerir clientes sem retorno recente.</small>
            </n-checkbox>
          </n-grid-item>
          <n-grid-item :span="6">
            <n-checkbox v-model:checked="preferences.weeklyReport" :disabled="!auth.isAdmin">
              <span class="block font-medium">Resumo semanal</span>
              <small class="muted">Receber um resumo dos resultados por e-mail.</small>
            </n-checkbox>
          </n-grid-item>
          <n-grid-item :span="6">
            <label class="block font-medium mb-2">Antecedência padrão (dias)</label>
            <n-input-number
              v-model:value="preferences.defaultReminderDays"
              class="w-full"
              :min="1"
              :max="90"
              :disabled="!auth.isAdmin"
            />
          </n-grid-item>
          <n-grid-item :span="12">
            <label class="block font-medium mb-2">Modelo de WhatsApp</label>
            <n-input v-model:value="preferences.whatsappTemplate" type="textarea" :rows="3" :disabled="!auth.isAdmin" />
            <small class="muted">{{ 'Variáveis: {nome} {veiculo} {placa} {servico}' }}</small>
          </n-grid-item>
          <n-grid-item :span="12">
            <label class="block font-medium mb-2">Link de avaliação</label>
            <n-input
              v-model:value="preferences.reviewUrl"
              placeholder="https://g.page/r/..."
              :disabled="!auth.isAdmin"
            />
            <small class="muted">Se estiver vazio, o pós-venda manda só o agradecimento.</small>
          </n-grid-item>
          <n-grid-item :span="12">
            <label class="block font-medium mb-2">Modelo de pós-venda</label>
            <n-input v-model:value="preferences.aftercareTemplate" type="textarea" :rows="3" :disabled="!auth.isAdmin" />
            <small class="muted">{{ 'Variáveis: {nome} {veiculo} {placa} {servico} {proxima} {avaliacao} {os}' }}</small>
          </n-grid-item>
        </n-grid>
      </n-card>
    </fieldset>
  </div>
</template>
