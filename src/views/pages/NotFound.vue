<script setup lang="ts">
import AuthCard from '@/components/app/AuthCard.vue';
</script>

<template>
  <AuthCard title="Página não encontrada" description="O recurso solicitado não está disponível.">
    <n-button type="primary" block @click="$router.push('/')">Voltar ao painel</n-button>
  </AuthCard>
</template>
