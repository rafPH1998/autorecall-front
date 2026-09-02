<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ value: string }>();

const type = computed(() => {
  if (['Finalizada', 'Concluída', 'Ativo', 'Próxima'].includes(props.value)) return 'success';
  if (['Atrasada', 'Cancelada', 'Inativo'].includes(props.value)) return 'error';
  if (['Em andamento'].includes(props.value)) return 'info';
  if (['Lida'].includes(props.value)) return 'default';
  return 'warning';
});
</script>

<template>
  <n-tag :type="type" size="small" :bordered="false">{{ value }}</n-tag>
</template>
