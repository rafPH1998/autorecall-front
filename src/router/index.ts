import AppLayout from '@/layout/AppLayout.vue';
import { useAuthStore } from '@/stores/auth';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          meta: { title: 'Hoje' },
          component: () => import('@/views/Dashboard.vue'),
        },
        {
          path: 'customers',
          name: 'customers',
          meta: { title: 'Clientes' },
          component: () => import('@/views/customers/CustomerList.vue'),
        },
        {
          path: 'customers/new',
          name: 'customer-new',
          meta: { title: 'Novo cliente' },
          component: () => import('@/views/customers/CustomerForm.vue'),
        },
        {
          path: 'customers/:id/edit',
          name: 'customer-edit',
          meta: { title: 'Editar cliente' },
          component: () => import('@/views/customers/CustomerForm.vue'),
        },
        {
          path: 'customers/:id',
          name: 'customer-detail',
          meta: { title: 'Cliente' },
          component: () => import('@/views/customers/CustomerDetail.vue'),
        },
        {
          path: 'vehicles',
          name: 'vehicles',
          meta: { title: 'Veículos' },
          component: () => import('@/views/vehicles/VehicleList.vue'),
        },
        {
          path: 'vehicles/new',
          name: 'vehicle-new',
          meta: { title: 'Novo veículo' },
          component: () => import('@/views/vehicles/VehicleForm.vue'),
        },
        {
          path: 'vehicles/:id/edit',
          name: 'vehicle-edit',
          meta: { title: 'Editar veículo' },
          component: () => import('@/views/vehicles/VehicleForm.vue'),
        },
        {
          path: 'vehicles/:id',
          name: 'vehicle-detail',
          meta: { title: 'Veículo' },
          component: () => import('@/views/vehicles/VehicleDetail.vue'),
        },
        {
          path: 'services',
          name: 'services',
          meta: { title: 'Catálogo de serviços' },
          component: () => import('@/views/services/ServiceList.vue'),
        },
        {
          path: 'services/new',
          name: 'service-new',
          meta: { title: 'Novo serviço' },
          component: () => import('@/views/services/ServiceForm.vue'),
        },
        {
          path: 'services/:id/edit',
          name: 'service-edit',
          meta: { title: 'Editar serviço' },
          component: () => import('@/views/services/ServiceForm.vue'),
        },
        {
          path: 'orders',
          name: 'orders',
          meta: { title: 'Ordens de serviço' },
          component: () => import('@/views/orders/OrderList.vue'),
        },
        {
          path: 'orders/new',
          name: 'order-new',
          meta: { title: 'Nova OS' },
          component: () => import('@/views/orders/OrderForm.vue'),
        },
        {
          path: 'orders/:id',
          name: 'order-detail',
          meta: { title: 'Ordem de serviço' },
          component: () => import('@/views/orders/OrderDetail.vue'),
        },
        {
          path: 'maintenance',
          name: 'maintenance',
          meta: { title: 'Manutenções' },
          component: () => import('@/views/maintenance/MaintenanceList.vue'),
        },
        {
          path: 'contacts',
          name: 'contacts',
          meta: { title: 'Contatos e campanhas' },
          component: () => import('@/views/contacts/ContactList.vue'),
        },
        {
          path: 'notifications',
          name: 'notifications',
          meta: { title: 'Notificações' },
          component: () => import('@/views/notifications/NotificationCenter.vue'),
        },
        {
          path: 'reports',
          name: 'reports',
          meta: { title: 'Relatórios' },
          component: () => import('@/views/reports/Reports.vue'),
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/settings/Settings.vue'),
          meta: { requiresAdmin: true, title: 'Configurações' },
        },
      ],
    },
    {
      path: '/auth/login',
      name: 'login',
      component: () => import('@/views/pages/auth/Login.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/auth/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/pages/auth/ForgotPassword.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/auth/reset-password',
      name: 'reset-password',
      component: () => import('@/views/pages/auth/ResetPassword.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notfound',
      component: () => import('@/views/pages/NotFound.vue'),
    },
  ],
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  if (to.meta.guestOnly && auth.isAuthenticated) return { name: 'dashboard' };
  if (to.meta.requiresAdmin && !auth.isAdmin) return { name: 'dashboard' };
  return true;
});

export default router;
