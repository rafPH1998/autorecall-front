<script setup lang="ts">
import PageHeader from '@/components/app/PageHeader.vue';
import StatusTag from '@/components/app/StatusTag.vue';
import { useAppStore } from '@/stores/app';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';

const store = useAppStore();
const route = useRoute();
const router = useRouter();
const confirm = useConfirm();
const toast = useToast();
const id = computed(() => Number(route.params.id));
const order = computed(() => store.orders.find((item) => item.id === id.value));
const customer = computed(() => store.customers.find((item) => item.id === order.value?.customerId));
const vehicle = computed(() => store.vehicles.find((item) => item.id === order.value?.vehicleId));
const currency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function finish() {
  confirm.require({
    header: 'Finalizar ordem de serviço',
    message: 'Confirma que todos os serviços foram concluídos? Esta ação alterará o status da OS.',
    icon: 'pi pi-check-circle',
    rejectLabel: 'Cancelar',
    acceptLabel: 'Finalizar',
    accept: async () => {
      try {
        const saved = await store.finishOrder(id.value);
        toast.add({ severity: 'success', summary: 'OS finalizada', detail: 'O atendimento foi concluído.', life: 3000 });
        if (saved.aftercare?.whatsappUrl) {
          confirm.require({
            header: 'Agradecer no WhatsApp',
            message: saved.aftercare.message,
            icon: 'pi pi-whatsapp',
            rejectLabel: 'Agora não',
            acceptLabel: 'Abrir WhatsApp',
            accept: () => {
              window.open(saved.aftercare!.whatsappUrl!, '_blank', 'noopener,noreferrer');
            },
          });
        }
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro ao finalizar', detail: error instanceof Error ? error.message : 'Tente novamente.', life: 4000 });
      }
    },
  });
}
</script>

<template>
  <PageHeader :title="order?.number ?? 'Ordem não encontrada'" :description="order ? `Aberta em ${order.date}` : undefined">
    <template #actions>
      <Button label="Voltar" icon="pi pi-arrow-left" severity="secondary" outlined @click="router.push({ name: 'orders' })" />
      <Button v-if="order && !['Finalizada', 'Cancelada'].includes(order.status)" label="Finalizar OS" icon="pi pi-check" severity="success" @click="finish" />
    </template>
  </PageHeader>
  <Message v-if="!order" severity="error">A ordem de serviço solicitada não existe.</Message>
  <template v-else>
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div class="card lg:col-span-2">
        <div class="flex justify-between items-start mb-6">
          <h2 class="text-xl font-semibold m-0">Detalhes do atendimento</h2>
          <StatusTag :value="order.status" />
        </div>
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div><span class="block text-muted-color text-sm mb-1">Cliente</span><Button :label="customer?.name ?? 'Não encontrado'" link class="p-0" @click="customer && router.push({ name: 'customer-detail', params: { id: customer.id } })" /></div>
          <div><span class="block text-muted-color text-sm mb-1">Veículo</span><Button :label="vehicle ? `${vehicle.plate} · ${vehicle.brand} ${vehicle.model}` : 'Não encontrado'" link class="p-0" @click="vehicle && router.push({ name: 'vehicle-detail', params: { id: vehicle.id } })" /></div>
          <div><span class="block text-muted-color text-sm mb-1">Quilometragem</span><strong>{{ order.mileage.toLocaleString('pt-BR') }} km</strong></div>
          <div><span class="block text-muted-color text-sm mb-1">Data</span><strong>{{ order.date }}</strong></div>
          <div class="sm:col-span-2"><span class="block text-muted-color text-sm mb-1">Observações</span><p class="m-0">{{ order.notes || 'Nenhuma observação.' }}</p></div>
        </div>
      </div>
      <div class="card">
        <h2 class="text-xl font-semibold mt-0">Resumo</h2>
        <div class="flex justify-between text-muted-color mb-3"><span>Serviços</span><span>{{ order.items.length }}</span></div>
        <div class="flex justify-between items-center border-t border-surface pt-4"><strong>Total</strong><strong class="text-2xl text-primary">{{ currency(order.total) }}</strong></div>
      </div>
    </div>
    <div class="card mb-0">
      <h2 class="text-xl font-semibold mt-0">Itens da ordem</h2>
      <DataTable :value="order.items" responsive-layout="scroll">
        <Column field="serviceName" header="Serviço" />
        <Column field="quantity" header="Quantidade" />
        <Column header="Valor unitário"><template #body="{ data }">{{ currency(data.unitPrice) }}</template></Column>
        <Column header="Subtotal"><template #body="{ data }"><strong>{{ currency(data.quantity * data.unitPrice) }}</strong></template></Column>
        <template #empty>Nenhum item registrado.</template>
      </DataTable>
    </div>
  </template>
</template>
