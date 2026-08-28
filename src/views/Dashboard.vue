<script setup lang="ts">
import PageHeader from '@/components/app/PageHeader.vue';
import StatCard from '@/components/app/StatCard.vue';
import { api } from '@/services/api';
import { useAppStore } from '@/stores/app';
import type { Contact } from '@/types/domain';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const store = useAppStore();
const router = useRouter();
const toast = useToast();
const contactingId = ref<string | null>(null);
const metrics = ref({
  overdueMaintenances: 0,
  upcomingMaintenances: 0,
  openOrders: 0,
  revenueAtRisk: 0,
  unpricedOverdue: 0,
});

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function parseBrDate(value: string) {
  const [day, month, year] = value.split('/').map(Number);
  return new Date(year, month - 1, day);
}

function isInactive(lastVisit: string) {
  if (!lastVisit || lastVisit === 'Sem visitas') return true;
  const date = parseBrDate(lastVisit);
  if (Number.isNaN(date.getTime())) return true;
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return date < sixMonthsAgo;
}

function todayBr() {
  return new Date().toLocaleDateString('pt-BR');
}

const overdueMaintenances = computed(() => store.maintenances.filter((item) => item.status === 'Atrasada'));
const upcomingCount = computed(() => store.maintenances.filter((item) => item.status === 'Próxima').length);
const openOrders = computed(() => store.orders.filter((item) => item.status !== 'Finalizada' && item.status !== 'Cancelada').length);

const contactedToday = computed(() => {
  const today = todayBr();
  return new Set(
    store.contacts
      .filter((item) => item.channel === 'WhatsApp' && item.date === today)
      .map((item) => item.customerId),
  );
});

const priorities = computed(() => {
  const overdueIds = new Set(overdueMaintenances.value.map((item) => item.customerId));

  const fromMaintenance = overdueMaintenances.value.map((item) => {
    const customer = store.customers.find((c) => c.id === item.customerId);
    const vehicle = store.vehicles.find((v) => v.id === item.vehicleId);
    return {
      id: `m-${item.id}`,
      customerId: item.customerId,
      serviceName: item.serviceName,
      name: customer?.name ?? 'Cliente',
      detail: vehicle ? `${vehicle.plate} · ${item.serviceName}` : item.serviceName,
      reason: 'Manutenção atrasada',
      when: item.dueDate,
    };
  });

  const fromInactivity = store.customers
    .filter((customer) => !overdueIds.has(customer.id) && isInactive(customer.lastVisit))
    .map((customer) => {
      const vehicle = store.vehicles.find((item) => item.customerId === customer.id);
      return {
        id: `c-${customer.id}`,
        customerId: customer.id,
        serviceName: '',
        name: customer.name,
        detail: vehicle ? `${vehicle.plate} · ${vehicle.brand} ${vehicle.model}` : customer.phone,
        reason: 'Sem retorno há 6 meses',
        when: customer.lastVisit,
      };
    });

  return [...fromMaintenance, ...fromInactivity].slice(0, 6);
});

const revenueDetail = computed(() => {
  if (!metrics.value.unpricedOverdue) return 'Manutenções atrasadas com preço no catálogo';
  return `${metrics.value.unpricedOverdue} sem preço no catálogo`;
});

function go(path: string) {
  router.push(path);
}

async function contactPriority(row: (typeof priorities.value)[number]) {
  if (!row.customerId || contactingId.value) return;
  contactingId.value = row.id;
  try {
    const saved = await api<Contact & { reused?: boolean; whatsappUrl?: string | null }>('/contacts/quick', {
      method: 'POST',
      body: JSON.stringify({
        customerId: row.customerId,
        serviceName: row.serviceName || undefined,
      }),
    });
    if (!store.contacts.some((item) => item.id === saved.id)) {
      store.contacts.unshift(saved);
    }
    if (saved.whatsappUrl) {
      window.open(saved.whatsappUrl, '_blank', 'noopener,noreferrer');
    }
    toast.add({
      severity: saved.reused ? 'info' : 'success',
      summary: saved.reused ? 'Já contatado hoje' : 'WhatsApp aberto',
      detail: saved.reused ? `${row.name} já recebeu contato hoje.` : `Mensagem pronta para ${row.name}.`,
      life: 3000,
    });
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Não foi possível contatar',
      detail: error instanceof Error ? error.message : 'Tente novamente.',
      life: 4000,
    });
  } finally {
    contactingId.value = null;
  }
}

onMounted(async () => {
  try {
    metrics.value = await api<typeof metrics.value>('/dashboard');
  } catch {
    metrics.value = {
      overdueMaintenances: overdueMaintenances.value.length,
      upcomingMaintenances: upcomingCount.value,
      openOrders: openOrders.value,
      revenueAtRisk: 0,
      unpricedOverdue: 0,
    };
  }
});
</script>

<template>
  <div>
    <PageHeader title="Hoje" :description="store.workshop.name">
      <template #actions>
        <Button label="Abrir OS" icon="pi pi-plus" @click="go('/orders/new')" />
      </template>
    </PageHeader>

    <div class="grid grid-cols-12 gap-4 mb-6">
      <div class="col-span-12 sm:col-span-6 xl:col-span-3 cursor-pointer" @click="go('/maintenance')">
        <StatCard label="Atrasadas" :value="metrics.overdueMaintenances" icon="pi pi-exclamation-triangle" tone="red" />
      </div>
      <div class="col-span-12 sm:col-span-6 xl:col-span-3 cursor-pointer" @click="go('/maintenance')">
        <StatCard label="Próximas" :value="metrics.upcomingMaintenances" icon="pi pi-calendar" tone="orange" />
      </div>
      <div class="col-span-12 sm:col-span-6 xl:col-span-3 cursor-pointer" @click="go('/orders')">
        <StatCard label="OS em aberto" :value="metrics.openOrders" icon="pi pi-file" tone="blue" />
      </div>
      <div class="col-span-12 sm:col-span-6 xl:col-span-3 cursor-pointer" @click="go('/maintenance')">
        <StatCard label="Receita em risco" :value="currency.format(metrics.revenueAtRisk)" icon="pi pi-wallet" tone="green" :detail="revenueDetail" />
      </div>
    </div>

    <div class="card mb-0">
      <div class="flex items-center justify-between gap-3 mb-4">
        <div class="font-semibold text-xl">Prioridades</div>
        <Button label="Ver contatos" icon="pi pi-whatsapp" size="small" text @click="go('/contacts')" />
      </div>
      <DataTable :value="priorities" dataKey="id" stripedRows responsiveLayout="scroll" class="text-sm">
        <Column field="name" header="Cliente" />
        <Column field="detail" header="Veículo / serviço" />
        <Column field="reason" header="Motivo" />
        <Column field="when" header="Data" />
        <Column header="" style="width: 9rem">
          <template #body="{ data }">
            <Button
              v-if="data.customerId"
              :label="contactedToday.has(data.customerId) ? 'Já avisado' : 'WhatsApp'"
              icon="pi pi-whatsapp"
              size="small"
              :text="contactedToday.has(data.customerId)"
              :outlined="!contactedToday.has(data.customerId)"
              :loading="contactingId === data.id"
              @click="contactPriority(data)"
            />
          </template>
        </Column>
        <template #empty>Nada pendente no momento.</template>
      </DataTable>
    </div>
  </div>
</template>
