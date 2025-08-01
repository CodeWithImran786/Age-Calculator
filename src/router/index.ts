import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/patients',
      name: 'Patients',
      component: () => import('@/views/PatientsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/appointments',
      name: 'Appointments',
      component: () => import('@/views/AppointmentsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/billing',
      name: 'Billing',
      component: () => import('@/views/BillingView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/appointments/:id/billing',
      name: 'AppointmentBilling',
      component: () => import('@/views/AppointmentBillingView.vue'),
      meta: { requiresAuth: true },
      props: true
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFoundView.vue')
    }
  ]
});

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Wait for auth initialization if still loading
  if (authStore.loading) {
    await authStore.initializeAuth();
  }
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);
  
  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (requiresGuest && authStore.isAuthenticated) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;