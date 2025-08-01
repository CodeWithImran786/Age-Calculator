<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-gray-600">Welcome back, {{ user?.email }}</p>
      </div>
      <div class="text-right">
        <p class="text-sm text-gray-500">{{ currentDate }}</p>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <v-card class="pa-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Today's Appointments</p>
            <p class="text-2xl font-bold text-blue-600">{{ todayAppointments.length }}</p>
          </div>
          <v-icon color="blue" size="40">mdi-calendar-today</v-icon>
        </div>
      </v-card>

      <v-card class="pa-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Patients</p>
            <p class="text-2xl font-bold text-green-600">{{ patients.length }}</p>
          </div>
          <v-icon color="green" size="40">mdi-account-group</v-icon>
        </div>
      </v-card>

      <v-card class="pa-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Pending Payments</p>
            <p class="text-2xl font-bold text-yellow-600">${{ pendingAmount.toFixed(2) }}</p>
          </div>
          <v-icon color="yellow" size="40">mdi-currency-usd</v-icon>
        </div>
      </v-card>

      <v-card class="pa-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Revenue</p>
            <p class="text-2xl font-bold text-purple-600">${{ totalRevenue.toFixed(2) }}</p>
          </div>
          <v-icon color="purple" size="40">mdi-chart-line</v-icon>
        </div>
      </v-card>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Upcoming Appointments -->
      <v-card>
        <v-card-title class="flex items-center justify-between">
          <span>Upcoming Appointments</span>
          <v-btn 
            color="primary" 
            variant="outlined"
            size="small"
            @click="$router.push('/appointments')"
          >
            View All
          </v-btn>
        </v-card-title>
        <v-card-text>
          <div v-if="upcomingAppointments.length === 0" class="text-center py-8">
            <v-icon size="48" color="grey-lighten-1">mdi-calendar-blank</v-icon>
            <p class="text-gray-500 mt-2">No upcoming appointments</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="appointment in upcomingAppointments.slice(0, 5)"
              :key="appointment.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <v-avatar color="primary" size="40">
                  <span class="text-white font-medium">
                    {{ appointment.patientName.charAt(0).toUpperCase() }}
                  </span>
                </v-avatar>
                <div>
                  <p class="font-medium">{{ appointment.patientName }}</p>
                  <p class="text-sm text-gray-600">{{ appointment.doctorName }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium">{{ formatDate(appointment.date) }}</p>
                <p class="text-sm text-gray-600">{{ appointment.time }}</p>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Recent Activity -->
      <v-card>
        <v-card-title>Recent Activity</v-card-title>
        <v-card-text>
          <div v-if="recentBilling.length === 0" class="text-center py-8">
            <v-icon size="48" color="grey-lighten-1">mdi-history</v-icon>
            <p class="text-gray-500 mt-2">No recent activity</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="billing in recentBilling.slice(0, 5)"
              :key="billing.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <v-icon :color="getPaymentStatusColor(billing.paymentStatus)">
                  mdi-currency-usd
                </v-icon>
                <div>
                  <p class="font-medium">{{ billing.patientName }}</p>
                  <p class="text-sm text-gray-600">{{ billing.serviceType }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium">${{ billing.amount.toFixed(2) }}</p>
                <span
                  class="status-badge"
                  :class="getPaymentStatusClass(billing.paymentStatus)"
                >
                  {{ billing.paymentStatus }}
                </span>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Quick Actions -->
    <v-card>
      <v-card-title>Quick Actions</v-card-title>
      <v-card-text>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <v-btn
            color="primary"
            variant="outlined"
            size="large"
            @click="$router.push('/patients')"
            class="h-20"
          >
            <div class="text-center">
              <v-icon class="mb-2">mdi-account-plus</v-icon>
              <br>
              Add Patient
            </div>
          </v-btn>
          
          <v-btn
            color="secondary"
            variant="outlined"
            size="large"
            @click="$router.push('/appointments')"
            class="h-20"
          >
            <div class="text-center">
              <v-icon class="mb-2">mdi-calendar-plus</v-icon>
              <br>
              Schedule Appointment
            </div>
          </v-btn>
          
          <v-btn
            color="success"
            variant="outlined"
            size="large"
            @click="$router.push('/billing')"
            class="h-20"
          >
            <div class="text-center">
              <v-icon class="mb-2">mdi-receipt</v-icon>
              <br>
              Create Bill
            </div>
          </v-btn>
          
          <v-btn
            color="info"
            variant="outlined"
            size="large"
            @click="refreshData"
            :loading="loading"
            class="h-20"
          >
            <div class="text-center">
              <v-icon class="mb-2">mdi-refresh</v-icon>
              <br>
              Refresh Data
            </div>
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useAppointmentsStore } from '@/stores/appointments';
import { usePatientsStore } from '@/stores/patients';
import { useBillingStore } from '@/stores/billing';
import { useNotificationsStore } from '@/stores/notifications';

const authStore = useAuthStore();
const appointmentsStore = useAppointmentsStore();
const patientsStore = usePatientsStore();
const billingStore = useBillingStore();
const notificationsStore = useNotificationsStore();

const loading = ref(false);

const user = computed(() => authStore.user);
const upcomingAppointments = computed(() => appointmentsStore.upcomingAppointments);
const todayAppointments = computed(() => appointmentsStore.getTodayAppointments());
const patients = computed(() => patientsStore.patients);
const recentBilling = computed(() => billingStore.billingRecords);
const totalRevenue = computed(() => billingStore.getTotalRevenue());
const pendingAmount = computed(() => billingStore.getPendingAmount());

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'paid': return 'green';
    case 'pending': return 'orange';
    case 'overdue': return 'red';
    default: return 'grey';
  }
};

const getPaymentStatusClass = (status: string) => {
  switch (status) {
    case 'paid': return 'payment-paid';
    case 'pending': return 'payment-pending';
    case 'overdue': return 'payment-overdue';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const refreshData = async () => {
  loading.value = true;
  try {
    await Promise.all([
      appointmentsStore.fetchUpcomingAppointments(),
      appointmentsStore.fetchAppointments(),
      patientsStore.fetchPatients(),
      billingStore.fetchBillingRecords()
    ]);
    notificationsStore.success('Data refreshed successfully');
  } catch (error) {
    notificationsStore.error('Failed to refresh data');
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await refreshData();
});
</script>