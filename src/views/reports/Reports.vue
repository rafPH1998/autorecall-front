<script setup lang="ts">
import PageHeader from '@/components/app/PageHeader.vue';
import StatCard from '@/components/app/StatCard.vue';
import { api } from '@/services/api';
import { useAppStore } from '@/stores/app';
import { computed, ref, watch } from 'vue';

const store = useAppStore();
const startDate = ref<Date | null>(new Date(2026, 0, 1));
const endDate = ref<Date | null>(new Date(2026, 11, 31));
const summary = ref({
  contactedCustomers: 0,
  returns: 0,
  appointments: 0,
  revenue: 0,
  conversion: 0,
});

function parseDate(value: string) {
  const [day, month, year] = value.split('/').map(Number);
  return new Date(year, month - 1, day);
}

function inPeriod(value: string) {
  const date = parseDate(value);
  return (!startDate.value || date >= startDate.value) && (!endDate.value || date <= endDate.value);
}

function toQuery(value: Date | null) {
  return value ? value.toLocaleDateString('pt-BR') : '';
}

const periodOrders = computed(() => store.orders.filter((item) => inPeriod(item.date)));
const contactedCustomers = computed(() => summary.value.contactedCustomers);
const returns = computed(() => summary.value.returns);
const appointments = computed(() => summary.value.appointments);
const revenue = computed(() => summary.value.revenue);
const conversion = computed(() => summary.value.conversion);
const maxBar = computed(() => Math.max(contactedCustomers.value, returns.value, appointments.value, 1));

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

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
    summary.value = { contactedCustomers: 0, returns: 0, appointments: 0, revenue: 0, conversion: 0 };
  }
}

watch([startDate, endDate], loadReports, { immediate: true });

function clearPeriod() {
  startDate.value = null;
  endDate.value = null;
}
</script>

<template>
  <PageHeader title="Relatórios" description="Visão consolidada do relacionamento com clientes e resultados da oficina." />

  <div class="card">
    <div class="grid grid-cols-12 gap-4 items-end">
      <div class="col-span-12 md:col-span-5">
        <label for="start-date" class="block font-medium mb-2">Data inicial</label>
        <DatePicker id="start-date" v-model="startDate" date-format="dd/mm/yy" show-icon class="w-full" />
      </div>
      <div class="col-span-12 md:col-span-5">
        <label for="end-date" class="block font-medium mb-2">Data final</label>
        <DatePicker id="end-date" v-model="endDate" date-format="dd/mm/yy" show-icon class="w-full" />
      </div>
      <div class="col-span-12 md:col-span-2">
        <Button label="Limpar" icon="pi pi-filter-slash" outlined class="w-full" @click="clearPeriod" />
      </div>
    </div>
  </div>

  <div class="grid grid-cols-12 gap-4 mb-6">
    <div class="col-span-12 sm:col-span-6 xl:col-span-3"><StatCard label="Contatados" :value="contactedCustomers" icon="pi pi-send" detail="Clientes únicos" tone="blue" /></div>
    <div class="col-span-12 sm:col-span-6 xl:col-span-3"><StatCard label="Retornos" :value="returns" icon="pi pi-reply" :detail="`${conversion}% de conversão`" tone="green" /></div>
    <div class="col-span-12 sm:col-span-6 xl:col-span-3"><StatCard label="Atendimentos" :value="appointments" icon="pi pi-calendar-check" detail="Agendados após contato" tone="orange" /></div>
    <div class="col-span-12 sm:col-span-6 xl:col-span-3"><StatCard label="Faturamento" :value="currency.format(revenue)" icon="pi pi-wallet" detail="Ordens finalizadas" tone="green" /></div>
  </div>

  <div class="grid grid-cols-12 gap-6">
    <div class="col-span-12 lg:col-span-7">
      <div class="card h-full">
        <h2 class="text-xl font-semibold mt-0 mb-6">Funil de relacionamento</h2>
        <div v-if="contactedCustomers" class="flex flex-col gap-5">
          <div v-for="item in [
            { label: 'Clientes contatados', value: contactedCustomers, color: 'bg-blue-500' },
            { label: 'Retornos recebidos', value: returns, color: 'bg-green-500' },
            { label: 'Atendimentos agendados', value: appointments, color: 'bg-orange-500' },
          ]" :key="item.label">
            <div class="flex justify-between mb-2"><span>{{ item.label }}</span><strong>{{ item.value }}</strong></div>
            <div class="h-3 overflow-hidden rounded-full bg-surface-200 dark:bg-surface-700">
              <div :class="item.color" class="h-full rounded-full transition-all" :style="{ width: `${(item.value / maxBar) * 100}%` }" />
            </div>
          </div>
        </div>
        <div v-else class="py-10 text-center text-muted-color">
          <i class="pi pi-chart-bar text-5xl" />
          <p class="mt-4 mb-0">Sem dados no período selecionado.</p>
        </div>
      </div>
    </div>

    <div class="col-span-12 lg:col-span-5">
      <div class="card h-full">
        <h2 class="text-xl font-semibold mt-0 mb-4">Ordens no período</h2>
        <div v-if="periodOrders.length" class="flex flex-col gap-3">
          <div v-for="order in periodOrders" :key="order.id" class="flex items-center justify-between rounded-border border border-surface-200 p-3 dark:border-surface-700">
            <div><div class="font-medium">{{ order.number }}</div><small class="text-muted-color">{{ order.date }} · {{ order.status }}</small></div>
            <strong>{{ currency.format(order.total) }}</strong>
          </div>
        </div>
        <div v-else class="py-10 text-center text-muted-color">Nenhuma ordem encontrada.</div>
      </div>
    </div>
  </div>
</template>
