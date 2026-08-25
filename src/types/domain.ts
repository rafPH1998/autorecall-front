export type MaintenanceStatus = 'Próxima' | 'Atrasada' | 'Concluída';
export type OrderStatus = 'Aberta' | 'Em andamento' | 'Finalizada' | 'Cancelada';

export interface Customer {
  id: number;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  document: string;
  lastVisit: string;
}

export interface Vehicle {
  id: number;
  customerId: number;
  plate: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  nextMaintenance: string;
  maintenanceStatus: MaintenanceStatus;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  intervalMonths: number | null;
  intervalMileage: number | null;
  active: boolean;
}

export interface ServiceOrderItem {
  serviceId: number;
  serviceName: string;
  quantity: number;
  unitPrice: number;
}

export interface ServiceOrder {
  id: number;
  number: string;
  customerId: number;
  vehicleId: number;
  date: string;
  mileage: number;
  status: OrderStatus;
  notes: string;
  items: ServiceOrderItem[];
  total: number;
}

export interface Maintenance {
  id: number;
  customerId: number;
  vehicleId: number;
  serviceName: string;
  dueDate: string;
  dueMileage: number;
  status: MaintenanceStatus;
}

export interface Contact {
  id: number;
  customerId: number;
  date: string;
  channel: 'WhatsApp' | 'Telefone' | 'E-mail';
  message: string;
  result: string;
}

export interface AppNotification {
  id: number;
  title: string;
  description: string;
  date: string;
  type: 'maintenance' | 'contact' | 'system';
  read: boolean;
}

export interface Workshop {
  name: string;
  document: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
}

export interface WorkshopUser {
  id: number;
  name: string;
  email: string;
  role: 'Administrador' | 'Atendente' | 'Mecânico';
  active: boolean;
}
