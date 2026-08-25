import type {
  AppNotification,
  Contact,
  Customer,
  Maintenance,
  Service,
  ServiceOrder,
  Vehicle,
  Workshop,
  WorkshopUser,
} from '@/types/domain';

export const customers: Customer[] = [
  { id: 1, name: 'Ana Souza', phone: '(11) 98888-1010', whatsapp: '5511988881010', email: 'ana@email.com', document: '123.456.789-00', lastVisit: '18/08/2026' },
  { id: 2, name: 'Bruno Lima', phone: '(11) 97777-2020', whatsapp: '5511977772020', email: 'bruno@email.com', document: '234.567.890-11', lastVisit: '02/07/2026' },
  { id: 3, name: 'Carla Mendes', phone: '(11) 96666-3030', whatsapp: '5511966663030', email: 'carla@email.com', document: '345.678.901-22', lastVisit: '14/03/2026' },
  { id: 4, name: 'Diego Alves', phone: '(11) 95555-4040', whatsapp: '5511955554040', email: 'diego@email.com', document: '456.789.012-33', lastVisit: '28/01/2026' },
  { id: 5, name: 'Elisa Ramos', phone: '(11) 94444-5050', whatsapp: '5511944445050', email: 'elisa@email.com', document: '567.890.123-44', lastVisit: '09/08/2026' },
  { id: 6, name: 'Fábio Costa', phone: '(11) 93333-6060', whatsapp: '5511933336060', email: 'fabio@email.com', document: '678.901.234-55', lastVisit: '21/05/2026' },
];

export const vehicles: Vehicle[] = [
  { id: 1, customerId: 1, plate: 'BRA2E19', brand: 'Honda', model: 'Civic', year: 2020, mileage: 48500, nextMaintenance: '05/09/2026', maintenanceStatus: 'Próxima' },
  { id: 2, customerId: 1, plate: 'ABC1D23', brand: 'Toyota', model: 'Corolla', year: 2018, mileage: 82100, nextMaintenance: '10/11/2026', maintenanceStatus: 'Próxima' },
  { id: 3, customerId: 2, plate: 'DEF4G56', brand: 'Volkswagen', model: 'T-Cross', year: 2022, mileage: 31900, nextMaintenance: '20/08/2026', maintenanceStatus: 'Atrasada' },
  { id: 4, customerId: 3, plate: 'GHI7J89', brand: 'Chevrolet', model: 'Onix', year: 2019, mileage: 69700, nextMaintenance: '12/08/2026', maintenanceStatus: 'Atrasada' },
  { id: 5, customerId: 4, plate: 'KLM0N12', brand: 'Hyundai', model: 'HB20', year: 2021, mileage: 42600, nextMaintenance: '18/10/2026', maintenanceStatus: 'Próxima' },
  { id: 6, customerId: 5, plate: 'OPQ3R45', brand: 'Jeep', model: 'Renegade', year: 2023, mileage: 18400, nextMaintenance: '01/12/2026', maintenanceStatus: 'Próxima' },
];

export const services: Service[] = [
  { id: 1, name: 'Troca de óleo e filtro', description: 'Óleo do motor e filtro de óleo', price: 280, intervalMonths: 6, intervalMileage: 10000, active: true },
  { id: 2, name: 'Alinhamento e balanceamento', description: 'Alinhamento completo e balanceamento das rodas', price: 180, intervalMonths: 12, intervalMileage: 15000, active: true },
  { id: 3, name: 'Revisão dos freios', description: 'Inspeção de pastilhas, discos e fluido', price: 350, intervalMonths: 12, intervalMileage: 20000, active: true },
  { id: 4, name: 'Higienização do ar-condicionado', description: 'Limpeza do sistema e troca do filtro', price: 160, intervalMonths: 12, intervalMileage: null, active: true },
  { id: 5, name: 'Diagnóstico eletrônico', description: 'Leitura de módulos e falhas', price: 120, intervalMonths: null, intervalMileage: null, active: true },
  { id: 6, name: 'Troca da correia dentada', description: 'Kit de correia e tensionador', price: 980, intervalMonths: 48, intervalMileage: 60000, active: false },
];

export const orders: ServiceOrder[] = [
  { id: 1, number: 'OS-2026-0042', customerId: 1, vehicleId: 1, date: '18/08/2026', mileage: 48500, status: 'Finalizada', notes: 'Cliente aguardou no local.', items: [{ serviceId: 1, serviceName: 'Troca de óleo e filtro', quantity: 1, unitPrice: 280 }], total: 280 },
  { id: 2, number: 'OS-2026-0043', customerId: 2, vehicleId: 3, date: '21/08/2026', mileage: 31900, status: 'Em andamento', notes: 'Ruído ao frear.', items: [{ serviceId: 3, serviceName: 'Revisão dos freios', quantity: 1, unitPrice: 350 }, { serviceId: 5, serviceName: 'Diagnóstico eletrônico', quantity: 1, unitPrice: 120 }], total: 470 },
  { id: 3, number: 'OS-2026-0044', customerId: 5, vehicleId: 6, date: '24/08/2026', mileage: 18400, status: 'Aberta', notes: 'Revisão preventiva.', items: [{ serviceId: 2, serviceName: 'Alinhamento e balanceamento', quantity: 1, unitPrice: 180 }], total: 180 },
  { id: 4, number: 'OS-2026-0037', customerId: 3, vehicleId: 4, date: '14/03/2026', mileage: 65100, status: 'Finalizada', notes: '', items: [{ serviceId: 6, serviceName: 'Troca da correia dentada', quantity: 1, unitPrice: 980 }], total: 980 },
];

export const maintenances: Maintenance[] = [
  { id: 1, customerId: 1, vehicleId: 1, serviceName: 'Troca de óleo e filtro', dueDate: '05/09/2026', dueMileage: 58500, status: 'Próxima' },
  { id: 2, customerId: 2, vehicleId: 3, serviceName: 'Revisão dos freios', dueDate: '20/08/2026', dueMileage: 30000, status: 'Atrasada' },
  { id: 3, customerId: 3, vehicleId: 4, serviceName: 'Troca de óleo e filtro', dueDate: '12/08/2026', dueMileage: 69000, status: 'Atrasada' },
  { id: 4, customerId: 4, vehicleId: 5, serviceName: 'Alinhamento e balanceamento', dueDate: '18/10/2026', dueMileage: 50000, status: 'Próxima' },
  { id: 5, customerId: 5, vehicleId: 6, serviceName: 'Primeira revisão', dueDate: '01/12/2026', dueMileage: 20000, status: 'Próxima' },
];

export const contacts: Contact[] = [
  { id: 1, customerId: 2, date: '22/08/2026', channel: 'WhatsApp', message: 'Olá Bruno, sua revisão está atrasada.', result: 'Aguardando resposta' },
  { id: 2, customerId: 3, date: '18/08/2026', channel: 'Telefone', message: 'Contato sobre troca de óleo.', result: 'Agendado para 28/08' },
  { id: 3, customerId: 4, date: '10/08/2026', channel: 'WhatsApp', message: 'Sentimos sua falta na oficina.', result: 'Mensagem visualizada' },
];

export const notifications: AppNotification[] = [
  { id: 1, title: 'Manutenção atrasada', description: 'T-Cross de Bruno Lima precisa de revisão dos freios.', date: 'Hoje, 09:20', type: 'maintenance', read: false },
  { id: 2, title: 'Novo cliente para contato', description: 'Diego Alves não retorna há mais de 6 meses.', date: 'Hoje, 08:10', type: 'contact', read: false },
  { id: 3, title: 'Manutenção próxima', description: 'Honda Civic de Ana Souza vence em 11 dias.', date: 'Ontem, 16:40', type: 'maintenance', read: true },
  { id: 4, title: 'Backup concluído', description: 'Os dados da oficina foram sincronizados.', date: 'Ontem, 02:00', type: 'system', read: true },
];

export const workshop: Workshop = {
  name: 'Oficina Auto Center',
  document: '12.345.678/0001-90',
  phone: '(11) 3333-1212',
  whatsapp: '(11) 99999-1212',
  email: 'contato@autocenter.com.br',
  address: 'Av. das Oficinas, 250 - São Paulo/SP',
};

export const workshopUsers: WorkshopUser[] = [
  { id: 1, name: 'Rafael Pereira', email: 'rafael@autocenter.com.br', role: 'Administrador', active: true },
  { id: 2, name: 'Marina Lopes', email: 'marina@autocenter.com.br', role: 'Atendente', active: true },
  { id: 3, name: 'Carlos Silva', email: 'carlos@autocenter.com.br', role: 'Mecânico', active: true },
];
