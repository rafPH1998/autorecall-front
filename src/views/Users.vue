<script setup lang="ts">
import { onMounted, ref } from 'vue';

type User = {
  id: number;
  name: string;
  email: string;
};

const users = ref<User[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const apiUrl = import.meta.env.VITE_API_URL ?? '/api';

onMounted(async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetch(`${apiUrl}/users`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    users.value = (await response.json()) as User[];
  } catch {
    error.value = 'Não foi possível carregar os usuários. Confira se a API está rodando em http://localhost:3000.';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="card">
    <div class="font-semibold text-xl mb-4">Usuários</div>
    <p class="text-muted-color mb-4">Dados da rota NestJS <code>GET /users</code>.</p>

    <Message v-if="error" severity="warn" class="mb-4">{{ error }}</Message>

    <DataTable :value="users" :loading="loading" stripedRows dataKey="id">
      <Column field="id" header="ID" style="width: 6rem" />
      <Column field="name" header="Nome" />
      <Column field="email" header="E-mail" />
      <template #empty>Nenhum usuário encontrado.</template>
    </DataTable>
  </div>
</template>
