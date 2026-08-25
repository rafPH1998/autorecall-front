<script setup lang="ts">
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const password = ref('');
const confirmPassword = ref('');
const submitted = ref(false);
const loading = ref(false);
const success = ref(false);
const errorMessage = ref('');

const token = computed(() => String(route.query.token ?? ''));
const email = computed(() => String(route.query.email ?? ''));
const tokenMissing = computed(() => !token.value);

const passwordInvalid = computed(() => submitted.value && password.value.length < 6);
const confirmInvalid = computed(() => submitted.value && confirmPassword.value !== password.value);

async function onSubmit() {
  submitted.value = true;
  errorMessage.value = '';
  success.value = false;

  if (tokenMissing.value) {
    errorMessage.value = 'Link inválido ou expirado. Solicite uma nova recuperação de senha.';
    return;
  }

  if (passwordInvalid.value || confirmInvalid.value) return;

  loading.value = true;
  await new Promise((resolve) => window.setTimeout(resolve, 500));
  loading.value = false;
  success.value = true;

  window.setTimeout(() => {
    router.push('/auth/login');
  }, 1800);
}
</script>

<template>
  <FloatingConfigurator />
  <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden px-4">
    <div class="flex flex-col items-center justify-center w-full max-w-[40rem]">
      <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
        <div class="w-full bg-surface-0 dark:bg-surface-900 py-12 px-6 sm:py-20 sm:px-20" style="border-radius: 53px">
          <div class="text-center mb-8">
            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Redefinir senha</div>
            <span class="text-muted-color font-medium">
              {{ email ? `Defina uma nova senha para ${email}.` : 'Defina uma nova senha de acesso.' }}
            </span>
          </div>

          <Message v-if="tokenMissing && submitted" severity="error" class="mb-4">
            Token ausente. Use o link enviado após a recuperação de senha.
          </Message>
          <Message v-if="errorMessage" severity="error" class="mb-4">{{ errorMessage }}</Message>
          <Message v-if="success" severity="success" class="mb-4">Senha redefinida. Redirecionando para o login...</Message>

          <form class="flex flex-col gap-2" @submit.prevent="onSubmit">
            <label for="new-password" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Nova senha</label>
            <Password id="new-password" v-model="password" placeholder="Mínimo de 6 caracteres" :toggleMask="true" fluid :feedback="false" :invalid="passwordInvalid" autocomplete="new-password" />
            <small v-if="passwordInvalid" class="text-red-500">A senha deve ter pelo menos 6 caracteres.</small>

            <label for="confirm-password" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mt-4 mb-2">Confirmar senha</label>
            <Password id="confirm-password" v-model="confirmPassword" placeholder="Repita a senha" :toggleMask="true" fluid :feedback="false" :invalid="confirmInvalid" autocomplete="new-password" />
            <small v-if="confirmInvalid" class="text-red-500">As senhas não coincidem.</small>

            <Button type="submit" label="Salvar nova senha" class="w-full mt-6" :loading="loading" :disabled="success" />
          </form>

          <div class="text-center mt-6">
            <router-link to="/auth/login" class="font-medium no-underline text-primary">Voltar ao login</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
