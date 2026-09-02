<script setup lang="ts">
import AuthCard from '@/components/app/AuthCard.vue';
import { api } from '@/services/api';
import { computed, ref } from 'vue';

const email = ref('');
const submitted = ref(false);
const loading = ref(false);
const success = ref(false);
const errorMessage = ref('');
const mockToken = 'mock-reset-token';
const emailInvalid = computed(() => submitted.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()));

async function onSubmit() {
  submitted.value = true;
  errorMessage.value = '';
  success.value = false;
  if (emailInvalid.value) return;
  loading.value = true;
  try {
    await api('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email: email.value.trim() }) });
    success.value = true;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Não foi possível enviar a recuperação.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AuthCard title="Recuperar senha" description="Informe o e-mail da oficina para receber o link de redefinição.">
    <n-alert v-if="success" type="success" class="mb-4">
      Enviamos um link de recuperação para {{ email }}. Neste mock você pode seguir direto para a redefinição.
    </n-alert>
    <n-alert v-if="errorMessage" type="error" class="mb-4">{{ errorMessage }}</n-alert>
    <n-form @submit.prevent="onSubmit">
      <n-form-item label="E-mail" :validation-status="emailInvalid ? 'error' : undefined" :feedback="emailInvalid ? 'Informe um e-mail válido.' : undefined">
        <n-input v-model:value="email" type="email" placeholder="seu@email.com" autocomplete="email" />
      </n-form-item>
      <n-button type="primary" attr-type="submit" block :loading="loading">Enviar link</n-button>
    </n-form>
    <n-button
      v-if="success"
      class="mt-3"
      block
      @click="$router.push({ path: '/auth/reset-password', query: { token: mockToken, email: email.trim() } })"
    >
      Abrir redefinição (mock)
    </n-button>
    <div class="text-center mt-5">
      <router-link to="/auth/login">Voltar ao login</router-link>
    </div>
  </AuthCard>
</template>
