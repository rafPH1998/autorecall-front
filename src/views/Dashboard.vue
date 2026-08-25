<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <div class="grid grid-cols-12 gap-8">
    <div class="col-span-12">
      <div class="card mb-0">
        <h1 class="text-2xl font-semibold m-0 mb-2">AutoRecall</h1>
        <p class="text-muted-color m-0">
          Frontend iniciado com o template Sakai (PrimeVue). Use o menu para navegar.
        </p>
      </div>
    </div>

    <div class="col-span-12 md:col-span-6 xl:col-span-4">
      <div class="card mb-0">
        <div class="flex justify-between mb-4">
          <div>
            <span class="block text-muted-color font-medium mb-4">API NestJS</span>
            <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">Hello World</div>
          </div>
          <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
            <i class="pi pi-server text-blue-500 text-xl!" />
          </div>
        </div>
        <span class="text-muted-color">Rota <code>GET /</code></span>
      </div>
    </div>

    <div class="col-span-12 md:col-span-6 xl:col-span-4">
      <div class="card mb-0">
        <div class="flex justify-between mb-4">
          <div>
            <span class="block text-muted-color font-medium mb-4">Usuários</span>
            <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">Lista da base</div>
          </div>
          <div class="flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
            <i class="pi pi-users text-green-500 text-xl!" />
          </div>
        </div>
        <Button label="Abrir usuários" icon="pi pi-arrow-right" text @click="router.push('/users')" />
      </div>
    </div>

    <div class="col-span-12 md:col-span-6 xl:col-span-4">
      <div class="card mb-0">
        <div class="flex justify-between mb-4">
          <div>
            <span class="block text-muted-color font-medium mb-4">Tema</span>
            <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">Sakai + Aura</div>
          </div>
          <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
            <i class="pi pi-palette text-orange-500 text-xl!" />
          </div>
        </div>
        <span class="text-muted-color">Dark mode e cores no ícone de paleta do topo</span>
      </div>
    </div>
  </div>
</template>
