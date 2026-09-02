<script setup lang="ts">
import AuthCard from '@/components/app/AuthCard.vue';
import { useAppStore } from '@/stores/app';
import { useAuthStore } from '@/stores/auth';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const email = ref('');
const password = ref('');
const submitted = ref(false);
const loading = ref(false);
const errorMessage = ref('');

const emailInvalid = computed(() => submitted.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()));
const passwordInvalid = computed(() => submitted.value && password.value.length < 6);

async function onSubmit() {
  submitted.value = true;
  errorMessage.value = '';
  if (emailInvalid.value || passwordInvalid.value) return;
  loading.value = true;
  try {
    await authStore.login(email.value.trim(), password.value);
    await useAppStore().bootstrap();
    await router.push({ name: 'dashboard' });
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Não foi possível entrar. Tente novamente.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AuthCard title="Entrar" description="Use rafael@autocenter.com.br / 123456">
    <n-alert v-if="errorMessage" type="error" class="mb-4">{{ errorMessage }}</n-alert>
    <n-form @submit.prevent="onSubmit">
      <n-form-item label="E-mail" :validation-status="emailInvalid ? 'error' : undefined" :feedback="emailInvalid ? 'Informe um e-mail válido.' : undefined">
        <n-input v-model:value="email" type="email" placeholder="seu@email.com" autocomplete="email" />
      </n-form-item>
      <n-form-item label="Senha" :validation-status="passwordInvalid ? 'error' : undefined" :feedback="passwordInvalid ? 'A senha deve ter pelo menos 6 caracteres.' : undefined">
        <n-input v-model:value="password" type="password" show-password-on="click" placeholder="Mínimo de 6 caracteres" autocomplete="current-password" />
      </n-form-item>
      <div class="flex justify-end mb-4">
        <router-link to="/auth/forgot-password">Esqueci a senha</router-link>
      </div>
      <n-button type="primary" attr-type="submit" block :loading="loading">Entrar</n-button>
    </n-form>
  </AuthCard>
</template>
