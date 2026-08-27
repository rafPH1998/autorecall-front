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
          component: () => import('@/views/Dashboard.vue'),
        },
        {
          path: 'customers',
          name: 'customers',
          component: () => import('@/views/customers/CustomerList.vue'),
        },
        {
          path: 'customers/new',
          name: 'customer-new',
          component: () => import('@/views/customers/CustomerForm.vue'),
        },
        {
          path: 'customers/:id/edit',
          name: 'customer-edit',
          component: () => import('@/views/customers/CustomerForm.vue'),
        },
        {
          path: 'customers/:id',
          name: 'customer-detail',
          component: () => import('@/views/customers/CustomerDetail.vue'),
        },
        {
          path: 'vehicles',
          name: 'vehicles',
          component: () => import('@/views/vehicles/VehicleList.vue'),
        },
        {
          path: 'vehicles/new',
          name: 'vehicle-new',
          component: () => import('@/views/vehicles/VehicleForm.vue'),
        },
        {
          path: 'vehicles/:id/edit',
          name: 'vehicle-edit',
          component: () => import('@/views/vehicles/VehicleForm.vue'),
        },
        {
          path: 'vehicles/:id',
          name: 'vehicle-detail',
          component: () => import('@/views/vehicles/VehicleDetail.vue'),
        },
        {
          path: 'services',
          name: 'services',
          component: () => import('@/views/services/ServiceList.vue'),
        },
        {
          path: 'services/new',
          name: 'service-new',
          component: () => import('@/views/services/ServiceForm.vue'),
        },
        {
          path: 'services/:id/edit',
          name: 'service-edit',
          component: () => import('@/views/services/ServiceForm.vue'),
        },
        {
          path: 'orders',
          name: 'orders',
          component: () => import('@/views/orders/OrderList.vue'),
        },
        {
          path: 'orders/new',
          name: 'order-new',
          component: () => import('@/views/orders/OrderForm.vue'),
        },
        {
          path: 'orders/:id',
          name: 'order-detail',
          component: () => import('@/views/orders/OrderDetail.vue'),
        },
        {
          path: 'maintenance',
          name: 'maintenance',
          component: () => import('@/views/maintenance/MaintenanceList.vue'),
        },
        {
          path: 'contacts',
          name: 'contacts',
          component: () => import('@/views/contacts/ContactList.vue'),
        },
        {
          path: 'notifications',
          name: 'notifications',
          component: () => import('@/views/notifications/NotificationCenter.vue'),
        },
        {
          path: 'reports',
          name: 'reports',
          component: () => import('@/views/reports/Reports.vue'),
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/settings/Settings.vue'),
          meta: { requiresAdmin: true },
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
