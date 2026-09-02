<script setup lang="ts">
import PageHeader from '@/components/app/PageHeader.vue';
import StatusTag from '@/components/app/StatusTag.vue';
import { useAppStore } from '@/stores/app';
import type { ServiceOrderItem } from '@/types/domain';
import { type DataTableColumns, useDialog, useMessage } from 'naive-ui';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const store = useAppStore();
const route = useRoute();
const router = useRouter();
const dialog = useDialog();
const message = useMessage();
const id = computed(() => Number(route.params.id));
const order = computed(() => store.orders.find((item) => item.id === id.value));
const customer = computed(() => store.customers.find((item) => item.id === order.value?.customerId));
const vehicle = computed(() => store.vehicles.find((item) => item.id === order.value?.vehicleId));
const currency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const itemColumns: DataTableColumns<ServiceOrderItem> = [
  { title: 'Serviço', key: 'serviceName' },
  { title: 'Quantidade', key: 'quantity' },
  { title: 'Valor unitário', key: 'unitPrice', render: (row) => currency(row.unitPrice) },
  { title: 'Subtotal', key: 'subtotal', render: (row) => currency(row.quantity * row.unitPrice) },
];

function finish() {
  dialog.warning({
    title: 'Finalizar ordem de serviço',
    content: 'Confirma que todos os serviços foram concluídos? Esta ação alterará o status da OS.',
    positiveText: 'Finalizar',
    negativeText: 'Cancelar',
    onPositiveClick: async () => {
      try {
        const saved = await store.finishOrder(id.value);
        message.success('O atendimento foi concluído.');
        if (saved.aftercare?.whatsappUrl) {
          dialog.warning({
            title: 'Agradecer no WhatsApp',
            content: saved.aftercare.message,
            positiveText: 'Abrir WhatsApp',
            negativeText: 'Agora não',
            onPositiveClick: () => {
              window.open(saved.aftercare!.whatsappUrl!, '_blank', 'noopener,noreferrer');
            },
          });
        }
      } catch (error) {
        message.error(error instanceof Error ? error.message : 'Tente novamente.');
      }
    },
  });
}
</script>

<template>
  <PageHeader :title="order?.number ?? 'Ordem não encontrada'" :description="order ? `Aberta em ${order.date}` : undefined">
    <template #actions>
      <n-button ghost @click="router.push({ name: 'orders' })">Voltar</n-button>
      <n-button v-if="order && !['Finalizada', 'Cancelada'].includes(order.status)" type="success" @click="finish">Finalizar OS</n-button>
    </template>
  </PageHeader>
  <n-alert v-if="!order" type="error">A ordem de serviço solicitada não existe.</n-alert>
  <template v-else>
    <n-grid cols="1 l:3" responsive="screen" :x-gap="16" :y-gap="16" class="mb-4">
      <n-grid-item :span="2">
        <n-card>
          <div class="flex justify-between items-start mb-4">
            <strong>Detalhes do atendimento</strong>
            <StatusTag :value="order.status" />
          </div>
          <n-grid :cols="2" :x-gap="16" :y-gap="12">
            <n-grid-item>
              <div class="muted text-sm">Cliente</div>
              <n-button text type="primary" @click="customer && router.push({ name: 'customer-detail', params: { id: customer.id } })">{{ customer?.name ?? 'Não encontrado' }}</n-button>
            </n-grid-item>
            <n-grid-item>
              <div class="muted text-sm">Veículo</div>
              <n-button text type="primary" @click="vehicle && router.push({ name: 'vehicle-detail', params: { id: vehicle.id } })">
                {{ vehicle ? `${vehicle.plate} · ${vehicle.brand} ${vehicle.model}` : 'Não encontrado' }}
              </n-button>
            </n-grid-item>
            <n-grid-item><div class="muted text-sm">Quilometragem</div><strong>{{ order.mileage.toLocaleString('pt-BR') }} km</strong></n-grid-item>
            <n-grid-item><div class="muted text-sm">Data</div><strong>{{ order.date }}</strong></n-grid-item>
            <n-grid-item :span="2"><div class="muted text-sm">Observações</div><p class="m-0">{{ order.notes || 'Nenhuma observação.' }}</p></n-grid-item>
          </n-grid>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card title="Resumo">
          <div class="flex justify-between muted mb-3"><span>Serviços</span><span>{{ order.items.length }}</span></div>
          <div class="flex justify-between"><strong>Total</strong><strong class="text-2xl">{{ currency(order.total) }}</strong></div>
        </n-card>
      </n-grid-item>
    </n-grid>
    <n-card title="Itens da ordem">
      <n-data-table :columns="itemColumns" :data="order.items" :bordered="false" />
    </n-card>
  </template>
</template>
