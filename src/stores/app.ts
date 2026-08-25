import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  contacts as initialContacts,
  customers as initialCustomers,
  maintenances as initialMaintenances,
  notifications as initialNotifications,
  orders as initialOrders,
  services as initialServices,
  vehicles as initialVehicles,
  workshop as initialWorkshop,
  workshopUsers as initialWorkshopUsers,
} from '@/mocks/data';
import type {
  Contact,
  Customer,
  Service,
  ServiceOrder,
  Vehicle,
  Workshop,
} from '@/types/domain';

const copy = <T>(value: T): T => structuredClone(value);

export const useAppStore = defineStore('app', () => {
  const customers = ref(copy(initialCustomers));
  const vehicles = ref(copy(initialVehicles));
  const services = ref(copy(initialServices));
  const orders = ref(copy(initialOrders));
  const maintenances = ref(copy(initialMaintenances));
  const contacts = ref(copy(initialContacts));
  const notifications = ref(copy(initialNotifications));
  const workshop = ref(copy(initialWorkshop));
  const workshopUsers = ref(copy(initialWorkshopUsers));

  function upsertCustomer(customer: Omit<Customer, 'id'> & { id?: number }) {
    const index = customers.value.findIndex((item) => item.id === customer.id);
    if (index >= 0) customers.value[index] = customer as Customer;
    else customers.value.push({ ...customer, id: Date.now() } as Customer);
  }

  function upsertVehicle(vehicle: Omit<Vehicle, 'id'> & { id?: number }) {
    const index = vehicles.value.findIndex((item) => item.id === vehicle.id);
    if (index >= 0) vehicles.value[index] = vehicle as Vehicle;
    else vehicles.value.push({ ...vehicle, id: Date.now() } as Vehicle);
  }

  function upsertService(service: Omit<Service, 'id'> & { id?: number }) {
    const index = services.value.findIndex((item) => item.id === service.id);
    if (index >= 0) services.value[index] = service as Service;
    else services.value.push({ ...service, id: Date.now() } as Service);
  }

  function addOrder(order: Omit<ServiceOrder, 'id'>) {
    orders.value.unshift({ ...order, id: Date.now() });
  }

  function finishOrder(id: number) {
    const order = orders.value.find((item) => item.id === id);
    if (order) order.status = 'Finalizada';
  }

  function addContact(contact: Omit<Contact, 'id'>) {
    contacts.value.unshift({ ...contact, id: Date.now() });
  }

  function markNotificationRead(id: number) {
    const notification = notifications.value.find((item) => item.id === id);
    if (notification) notification.read = true;
  }

  function markAllNotificationsRead() {
    notifications.value.forEach((item) => {
      item.read = true;
    });
  }

  function updateWorkshop(data: Workshop) {
    workshop.value = { ...data };
  }

  return {
    customers,
    vehicles,
    services,
    orders,
    maintenances,
    contacts,
    notifications,
    workshop,
    workshopUsers,
    upsertCustomer,
    upsertVehicle,
    upsertService,
    addOrder,
    finishOrder,
    addContact,
    markNotificationRead,
    markAllNotificationsRead,
    updateWorkshop,
  };
});
