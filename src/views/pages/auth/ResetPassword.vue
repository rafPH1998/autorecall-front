<script setup lang="ts">
import AuthCard from '@/components/app/AuthCard.vue';
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
  window.setTimeout(() => router.push('/auth/login'), 1800);
}
</script>

<template>
  <AuthCard title="Redefinir senha" :description="email ? `Defina uma nova senha para ${email}.` : 'Defina uma nova senha de acesso.'">
    <n-alert v-if="errorMessage" type="error" class="mb-4">{{ errorMessage }}</n-alert>
    <n-alert v-if="success" type="success" class="mb-4">Senha redefinida. Redirecionando para o login...</n-alert>
    <n-form @submit.prevent="onSubmit">
      <n-form-item label="Nova senha" :validation-status="passwordInvalid ? 'error' : undefined" :feedback="passwordInvalid ? 'A senha deve ter pelo menos 6 caracteres.' : undefined">
        <n-input v-model:value="password" type="password" show-password-on="click" autocomplete="new-password" />
      </n-form-item>
      <n-form-item label="Confirmar senha" :validation-status="confirmInvalid ? 'error' : undefined" :feedback="confirmInvalid ? 'As senhas não coincidem.' : undefined">
        <n-input v-model:value="confirmPassword" type="password" show-password-on="click" autocomplete="new-password" />
      </n-form-item>
      <n-button type="primary" attr-type="submit" block :loading="loading" :disabled="success">Salvar nova senha</n-button>
    </n-form>
    <div class="text-center mt-5">
      <router-link to="/auth/login">Voltar ao login</router-link>
    </div>
  </AuthCard>
</template>
