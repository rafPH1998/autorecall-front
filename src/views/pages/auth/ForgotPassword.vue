<script setup lang="ts">
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import { computed, ref } from 'vue';

const email = ref('');
const submitted = ref(false);
const loading = ref(false);
const success = ref(false);
const errorMessage = ref('');
const mockToken = 'mock-reset-token';

const emailInvalid = computed(() => {
  if (!submitted.value) return false;
  return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
});

async function onSubmit() {
  submitted.value = true;
  errorMessage.value = '';
  success.value = false;

  if (emailInvalid.value) return;

  loading.value = true;
  await new Promise((resolve) => window.setTimeout(resolve, 500));
  loading.value = false;
  success.value = true;
}
</script>

<template>
  <FloatingConfigurator />
  <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden px-4">
    <div class="flex flex-col items-center justify-center w-full max-w-[40rem]">
      <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
        <div class="w-full bg-surface-0 dark:bg-surface-900 py-12 px-6 sm:py-20 sm:px-20" style="border-radius: 53px">
          <div class="text-center mb-8">
            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Recuperar senha</div>
            <span class="text-muted-color font-medium">Informe o e-mail da oficina para receber o link de redefinição.</span>
          </div>

          <Message v-if="success" severity="success" class="mb-4">
            Enviamos um link de recuperação para {{ email }}. Em produção isso chega por e-mail; neste mock você pode seguir direto para a redefinição.
          </Message>
          <Message v-if="errorMessage" severity="error" class="mb-4">{{ errorMessage }}</Message>

          <form class="flex flex-col gap-2" @submit.prevent="onSubmit">
            <label for="forgot-email" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">E-mail</label>
            <InputText id="forgot-email" v-model="email" type="email" placeholder="seu@email.com" class="w-full" :invalid="emailInvalid" autocomplete="email" />
            <small v-if="emailInvalid" class="text-red-500">Informe um e-mail válido.</small>

            <Button type="submit" label="Enviar link" class="w-full mt-6" :loading="loading" />
          </form>

          <div v-if="success" class="mt-4">
            <Button
              label="Abrir redefinição (mock)"
              class="w-full"
              outlined
              as="router-link"
              :to="{ path: '/auth/reset-password', query: { token: mockToken, email: email.trim() } }"
            />
          </div>

          <div class="text-center mt-6">
            <router-link to="/auth/login" class="font-medium no-underline text-primary">Voltar ao login</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
