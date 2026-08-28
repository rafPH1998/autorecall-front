<script setup lang="ts">
import { api } from '@/services/api';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

interface OnboardingStep {
  key: string;
  label: string;
  detail: string;
  to: string;
  done: boolean;
}

interface OnboardingStatus {
  completed: boolean;
  dismissed: boolean;
  doneCount: number;
  total: number;
  steps: OnboardingStep[];
}

const router = useRouter();
const status = ref<OnboardingStatus | null>(null);
const busy = ref(false);

const visible = computed(() => {
  if (!status.value) return false;
  if (status.value.completed) return false;
  return true;
});

const compact = computed(() => Boolean(status.value?.dismissed));

async function load() {
  try {
    status.value = await api<OnboardingStatus>('/onboarding');
  } catch {
    status.value = null;
  }
}

async function dismiss(dismissed: boolean) {
  busy.value = true;
  try {
    status.value = await api<OnboardingStatus>('/onboarding', {
      method: 'PUT',
      body: JSON.stringify({ dismissed }),
    });
  } finally {
    busy.value = false;
  }
}

onMounted(load);

defineExpose({ reload: load });
</script>

<template>
  <div v-if="visible" class="card mb-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
      <div>
        <div class="font-semibold text-xl">Primeiros 15 minutos</div>
        <p class="text-muted-color mt-1 mb-0">
          {{ status?.doneCount }}/{{ status?.total }} prontos. Complete para ver o recall funcionando.
        </p>
      </div>
      <Button
        v-if="!compact"
        label="Pular por agora"
        icon="pi pi-times"
        text
        size="small"
        :loading="busy"
        @click="dismiss(true)"
      />
      <Button
        v-else
        label="Continuar configuração"
        icon="pi pi-list-check"
        text
        size="small"
        :loading="busy"
        @click="dismiss(false)"
      />
    </div>

    <div v-if="!compact" class="flex flex-col gap-3">
      <div
        v-for="step in status?.steps"
        :key="step.key"
        class="flex items-center justify-between gap-3 rounded-border border border-surface-200 p-3 dark:border-surface-700"
      >
        <div class="flex items-start gap-3">
          <i :class="step.done ? 'pi pi-check-circle text-green-500' : 'pi pi-circle text-muted-color'" class="mt-1" />
          <div>
            <div class="font-medium" :class="{ 'line-through text-muted-color': step.done }">{{ step.label }}</div>
            <small class="text-muted-color">{{ step.detail }}</small>
          </div>
        </div>
        <Button
          v-if="!step.done"
          label="Ir"
          size="small"
          outlined
          @click="router.push(step.to)"
        />
      </div>
    </div>
  </div>
</template>
