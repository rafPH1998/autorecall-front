<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ value: string }>();

const severity = computed(() => {
  if (['Finalizada', 'Concluída', 'Ativo', 'Próxima'].includes(props.value)) return 'success';
  if (['Atrasada', 'Cancelada', 'Inativo'].includes(props.value)) return 'danger';
  if (['Em andamento'].includes(props.value)) return 'info';
  if (['Lida'].includes(props.value)) return 'secondary';
  return 'warn';
});
</script>

<template>
  <Tag :value="value" :severity="severity" />
</template>
