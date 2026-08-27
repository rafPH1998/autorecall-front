import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import type {
  Contact,
  Customer,
  Maintenance,
  AppNotification,
  Service,
  ServiceOrder,
  Vehicle,
  Workshop,
  WorkshopUser,
} from '@/types/domain';

export interface WorkshopPreferences {
  maintenanceAlerts: boolean;
  contactReminders: boolean;
  weeklyReport: boolean;
  defaultReminderDays: number;
  whatsappTemplate: string;
}

export const useAppStore = defineStore('app', () => {
  const ready = ref(false);
  const loading = ref(false);
  const customers = ref<Customer[]>([]);
  const vehicles = ref<Vehicle[]>([]);
  const services = ref<Service[]>([]);
  const orders = ref<ServiceOrder[]>([]);
  const maintenances = ref<Maintenance[]>([]);
  const contacts = ref<Contact[]>([]);
  const notifications = ref<AppNotification[]>([]);
  const workshop = ref<Workshop>({
    name: '',
    document: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
  });
  const workshopUsers = ref<WorkshopUser[]>([]);
  const preferences = ref<WorkshopPreferences>({
    maintenanceAlerts: true,
    contactReminders: true,
    weeklyReport: false,
    defaultReminderDays: 15,
    whatsappTemplate: 'Olá, {nome}! Sentimos sua falta. Podemos agendar uma revisão para o seu {veiculo}?',
  });

  async function bootstrap() {
    if (loading.value) return;
    loading.value = true;
    try {
      const [customerRows, vehicleRows, serviceRows, orderRows, maintenanceRows, contactRows, notificationRows, settings] =
        await Promise.all([
          api<Customer[]>('/customers'),
          api<Vehicle[]>('/vehicles'),
          api<Service[]>('/services'),
          api<ServiceOrder[]>('/orders'),
          api<Maintenance[]>('/maintenances'),
          api<Contact[]>('/contacts'),
          api<AppNotification[]>('/notifications'),
          api<{
            workshop: Workshop;
            workshopUsers: WorkshopUser[];
            preferences: WorkshopPreferences;
          }>('/settings'),
        ]);
      customers.value = customerRows;
      vehicles.value = vehicleRows;
      services.value = serviceRows;
      orders.value = orderRows;
      maintenances.value = maintenanceRows;
      contacts.value = contactRows;
      notifications.value = notificationRows;
      workshop.value = settings.workshop;
      workshopUsers.value = settings.workshopUsers;
      preferences.value = settings.preferences;
      ready.value = true;
    } finally {
      loading.value = false;
    }
  }

  async function upsertCustomer(customer: Omit<Customer, 'id'> & { id?: number }) {
    const saved = customer.id
      ? await api<Customer>(`/customers/${customer.id}`, { method: 'PUT', body: JSON.stringify(customer) })
      : await api<Customer>('/customers', { method: 'POST', body: JSON.stringify(customer) });
    const index = customers.value.findIndex((item) => item.id === saved.id);
    if (index >= 0) customers.value[index] = saved;
    else customers.value.push(saved);
    return saved;
  }

  async function upsertVehicle(vehicle: Omit<Vehicle, 'id'> & { id?: number }) {
    const saved = vehicle.id
      ? await api<Vehicle>(`/vehicles/${vehicle.id}`, { method: 'PUT', body: JSON.stringify(vehicle) })
      : await api<Vehicle>('/vehicles', { method: 'POST', body: JSON.stringify(vehicle) });
    const index = vehicles.value.findIndex((item) => item.id === saved.id);
    if (index >= 0) vehicles.value[index] = saved;
    else vehicles.value.push(saved);
    return saved;
  }

  async function upsertService(service: Omit<Service, 'id'> & { id?: number }) {
    const saved = service.id
      ? await api<Service>(`/services/${service.id}`, { method: 'PUT', body: JSON.stringify(service) })
      : await api<Service>('/services', { method: 'POST', body: JSON.stringify(service) });
    const index = services.value.findIndex((item) => item.id === saved.id);
    if (index >= 0) services.value[index] = saved;
    else services.value.push(saved);
    return saved;
  }

  async function addOrder(order: Omit<ServiceOrder, 'id' | 'number' | 'date' | 'status' | 'total'> & Partial<ServiceOrder>) {
    const saved = await api<ServiceOrder>('/orders', {
      method: 'POST',
      body: JSON.stringify({
        customerId: order.customerId,
        vehicleId: order.vehicleId,
        mileage: order.mileage,
        notes: order.notes,
        items: order.items,
      }),
    });
    orders.value.unshift(saved);
    return saved;
  }

  async function finishOrder(id: number) {
    const saved = await api<ServiceOrder>(`/orders/${id}/finish`, { method: 'POST' });
    const index = orders.value.findIndex((item) => item.id === id);
    if (index >= 0) orders.value[index] = saved;
    await bootstrap();
    return saved;
  }

  async function addContact(contact: Omit<Contact, 'id'>) {
    const saved = await api<Contact>('/contacts', { method: 'POST', body: JSON.stringify(contact) });
    contacts.value.unshift(saved);
    return saved;
  }

  async function markNotificationRead(id: number) {
    notifications.value = await api<AppNotification[]>(`/notifications/${id}/read`, { method: 'POST' });
  }

  async function markAllNotificationsRead() {
    notifications.value = await api<AppNotification[]>('/notifications/read-all', { method: 'POST' });
  }

  async function saveSettings(data: {
    workshop: Workshop;
    users: Array<Omit<WorkshopUser, 'id'> & { id?: number }>;
    preferences: WorkshopPreferences;
  }) {
    const settings = await api<{
      workshop: Workshop;
      workshopUsers: WorkshopUser[];
      preferences: WorkshopPreferences;
    }>('/settings', {
      method: 'PUT',
      body: JSON.stringify({
        workshop: data.workshop,
        users: data.users,
        preferences: data.preferences,
      }),
    });
    workshop.value = settings.workshop;
    workshopUsers.value = settings.workshopUsers;
    preferences.value = settings.preferences;
  }

  function updateWorkshop(data: Workshop) {
    workshop.value = { ...data };
  }

  return {
    ready,
    loading,
    customers,
    vehicles,
    services,
    orders,
    maintenances,
    contacts,
    notifications,
    workshop,
    workshopUsers,
    preferences,
    bootstrap,
    upsertCustomer,
    upsertVehicle,
    upsertService,
    addOrder,
    finishOrder,
    addContact,
    markNotificationRead,
    markAllNotificationsRead,
    saveSettings,
    updateWorkshop,
  };
});
