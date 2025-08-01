<template>
  <v-app>
    <!-- Navigation Bar -->
    <v-app-bar
      v-if="isAuthenticated"
      app
      color="primary"
      dark
      elevate-on-scroll
    >
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Medical Billing & Scheduling</v-toolbar-title>
      <v-spacer></v-spacer>
      
      <!-- User Menu -->
      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-icon>mdi-account</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item>
            <v-list-item-title>{{ user?.email }}</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="handleSignOut">
            <v-list-item-title>
              <v-icon class="mr-2">mdi-logout</v-icon>
              Sign Out
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-if="isAuthenticated"
      v-model="drawer"
      app
      temporary
    >
      <v-list nav dense>
        <v-list-item
          v-for="item in navigationItems"
          :key="item.title"
          :to="item.to"
          exact
        >
          <template v-slot:prepend>
            <v-icon>{{ item.icon }}</v-icon>
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <v-container v-if="isAuthenticated" fluid class="pa-4">
        <router-view />
      </v-container>
      <div v-else class="min-h-screen">
        <router-view />
      </div>
    </v-main>

    <!-- Notifications -->
    <NotificationContainer />

    <!-- Loading Overlay -->
    <v-overlay v-if="authLoading" class="align-center justify-center">
      <v-progress-circular
        size="64"
        indeterminate
        color="primary"
      ></v-progress-circular>
    </v-overlay>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useNotificationsStore } from '@/stores/notifications';
import NotificationContainer from '@/components/NotificationContainer.vue';

const router = useRouter();
const authStore = useAuthStore();
const notificationsStore = useNotificationsStore();

const drawer = ref(false);

const isAuthenticated = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);
const authLoading = computed(() => authStore.loading);

const navigationItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/dashboard' },
  { title: 'Patients', icon: 'mdi-account-group', to: '/patients' },
  { title: 'Appointments', icon: 'mdi-calendar-clock', to: '/appointments' },
  { title: 'Billing', icon: 'mdi-currency-usd', to: '/billing' },
];

const handleSignOut = async () => {
  try {
    await authStore.signOut();
    notificationsStore.success('Successfully signed out');
    router.push('/login');
  } catch (error) {
    notificationsStore.error('Failed to sign out');
  }
};
</script>