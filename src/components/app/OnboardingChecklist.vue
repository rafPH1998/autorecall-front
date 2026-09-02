<script setup lang="ts">
import { api } from '@/services/api';
import { CheckmarkCircleOutline, EllipseOutline } from '@vicons/ionicons5';
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
const visible = computed(() => Boolean(status.value && !status.value.completed));
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
  <n-card v-if="visible" class="mb-5">
    <div class="flex items-start justify-between gap-3 mb-4">
      <div>
        <div class="font-semibold text-lg">Primeiros 15 minutos</div>
        <p class="muted m-0 mt-1">{{ status?.doneCount }}/{{ status?.total }} prontos. Complete para ver o recall funcionando.</p>
      </div>
      <n-button text :loading="busy" @click="dismiss(!compact)">
        {{ compact ? 'Continuar configuração' : 'Pular por agora' }}
      </n-button>
    </div>
    <n-space v-if="!compact" vertical :size="10">
      <div
        v-for="step in status?.steps"
        :key="step.key"
        class="flex items-center justify-between gap-3 rounded-xl border border-[var(--n-border-color)] px-3 py-3"
      >
        <div class="flex items-start gap-3">
          <n-icon :component="step.done ? CheckmarkCircleOutline : EllipseOutline" :color="step.done ? '#22c55e' : undefined" :size="20" />
          <div>
            <div class="font-medium" :class="{ 'line-through muted': step.done }">{{ step.label }}</div>
            <div class="muted text-sm">{{ step.detail }}</div>
          </div>
        </div>
        <n-button v-if="!step.done" size="small" ghost @click="router.push(step.to)">Ir</n-button>
      </div>
    </n-space>
  </n-card>
</template>
