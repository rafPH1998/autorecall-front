<script setup lang="ts">
import PageHeader from '@/components/app/PageHeader.vue';
import StatCard from '@/components/app/StatCard.vue';
import { api } from '@/services/api';
import { useAppStore } from '@/stores/app';
import { ArrowUndoOutline, BarChartOutline, CalendarOutline, FilterOutline, SendOutline, WalletOutline } from '@vicons/ionicons5';
import type { DataTableColumns } from 'naive-ui';
import { computed, ref, watch } from 'vue';

const store = useAppStore();
const startDate = ref<number | null>(new Date(2026, 0, 1).getTime());
const endDate = ref<number | null>(new Date(2026, 11, 31).getTime());
const summary = ref({
  contactedCustomers: 0,
  returns: 0,
  appointments: 0,
  revenue: 0,
  conversion: 0,
  outcomes: {} as Record<string, number>,
});

function parseDate(value: string) {
  const [day, month, year] = value.split('/').map(Number);
  return new Date(year, month - 1, day);
}

function inPeriod(value: string) {
  const date = parseDate(value).getTime();
  return (startDate.value == null || date >= startDate.value) && (endDate.value == null || date <= endDate.value);
}

function toQuery(value: number | null) {
  return value != null ? new Date(value).toLocaleDateString('pt-BR') : '';
}

const periodOrders = computed(() => store.orders.filter((item) => inPeriod(item.date)));
const contactedCustomers = computed(() => summary.value.contactedCustomers);
const returns = computed(() => summary.value.returns);
const appointments = computed(() => summary.value.appointments);
const revenue = computed(() => summary.value.revenue);
const conversion = computed(() => summary.value.conversion);
const maxBar = computed(() => Math.max(contactedCustomers.value, returns.value, appointments.value, 1));

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const outcomeRows = computed(() =>
  Object.entries(summary.value.outcomes || {})
    .filter(([, count]) => count > 0)
    .map(([result, count]) => ({ result, count })),
);

const outcomeColumns: DataTableColumns<{ result: string; count: number }> = [
  { title: 'Resultado', key: 'result' },
  { title: 'Quantidade', key: 'count' },
];

async function loadReports() {
  try {
    const params = new URLSearchParams();
    const from = toQuery(startDate.value);
    const to = toQuery(endDate.value);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const qs = params.toString();
    summary.value = await api<typeof summary.value>(`/reports${qs ? `?${qs}` : ''}`);
  } catch {
    summary.value = { contactedCustomers: 0, returns: 0, appointments: 0, revenue: 0, conversion: 0, outcomes: {} };
  }
}

watch([startDate, endDate], loadReports, { immediate: true });

function clearPeriod() {
  startDate.value = null;
  endDate.value = null;
}
</script>

<template>
  <div>
    <PageHeader title="Relatórios" description="Visão consolidada do relacionamento com clientes e resultados da oficina." />

    <n-card class="mb-5">
      <n-grid :cols="12" :x-gap="16" :y-gap="16">
        <n-grid-item :span="5">
          <label class="block font-medium mb-2">Data inicial</label>
          <n-date-picker v-model:value="startDate" type="date" format="dd/MM/yyyy" class="w-full" style="width: 100%" />
        </n-grid-item>
        <n-grid-item :span="5">
          <label class="block font-medium mb-2">Data final</label>
          <n-date-picker v-model:value="endDate" type="date" format="dd/MM/yyyy" class="w-full" style="width: 100%" />
        </n-grid-item>
        <n-grid-item :span="2" class="flex items-end">
          <n-button ghost class="w-full" @click="clearPeriod">
            <template #icon><n-icon :component="FilterOutline" /></template>
            Limpar
          </n-button>
        </n-grid-item>
      </n-grid>
    </n-card>

    <n-grid :cols="24" :x-gap="16" :y-gap="16" class="mb-6">
      <n-grid-item :span="6">
        <StatCard label="Contatados" :value="contactedCustomers" :icon="SendOutline" detail="Clientes únicos" tone="blue" />
      </n-grid-item>
      <n-grid-item :span="6">
        <StatCard label="Retornos" :value="returns" :icon="ArrowUndoOutline" :detail="`${conversion}% de conversão`" tone="green" />
      </n-grid-item>
      <n-grid-item :span="6">
        <StatCard label="Atendimentos" :value="appointments" :icon="CalendarOutline" detail="Agendados após contato" tone="orange" />
      </n-grid-item>
      <n-grid-item :span="6">
        <StatCard label="Faturamento" :value="currency.format(revenue)" :icon="WalletOutline" detail="Ordens finalizadas" tone="green" />
      </n-grid-item>
    </n-grid>

    <n-grid :cols="12" :x-gap="24" :y-gap="24">
      <n-grid-item :span="7">
        <n-card class="h-full">
          <h2 class="text-xl font-semibold mt-0 mb-6">Funil de relacionamento</h2>
          <div v-if="contactedCustomers" class="flex flex-col gap-5">
            <div
              v-for="item in [
                { label: 'Clientes contatados', value: contactedCustomers, color: 'bg-blue-500' },
                { label: 'Retornos recebidos', value: returns, color: 'bg-green-500' },
                { label: 'Atendimentos agendados', value: appointments, color: 'bg-orange-500' },
              ]"
              :key="item.label"
            >
              <div class="flex justify-between mb-2">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </div>
              <div class="h-3 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                <div :class="item.color" class="h-full rounded-full transition-all" :style="{ width: `${(item.value / maxBar) * 100}%` }" />
              </div>
            </div>
          </div>
          <div v-else class="py-10 text-center muted">
            <n-icon :component="BarChartOutline" :size="48" />
            <p class="mt-4 mb-0">Sem dados no período selecionado.</p>
          </div>
        </n-card>
      </n-grid-item>

      <n-grid-item :span="5">
        <n-card class="h-full">
          <h2 class="text-xl font-semibold mt-0 mb-4">Ordens no período</h2>
          <div v-if="periodOrders.length" class="flex flex-col gap-3">
            <div
              v-for="order in periodOrders"
              :key="order.id"
              class="flex items-center justify-between rounded-xl border border-[var(--n-border-color)] p-3"
            >
              <div>
                <div class="font-medium">{{ order.number }}</div>
                <small class="muted">{{ order.date }} · {{ order.status }}</small>
              </div>
              <strong>{{ currency.format(order.total) }}</strong>
            </div>
          </div>
          <div v-else class="py-10 text-center muted">Nenhuma ordem encontrada.</div>
        </n-card>
      </n-grid-item>

      <n-grid-item :span="12">
        <n-card>
          <h2 class="text-xl font-semibold mt-0 mb-4">Desfechos dos contatos</h2>
          <n-data-table
            v-if="outcomeRows.length"
            :columns="outcomeColumns"
            :data="outcomeRows"
            :bordered="false"
            :pagination="false"
          />
          <div v-else class="py-6 text-center muted">Nenhum desfecho no período.</div>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>
