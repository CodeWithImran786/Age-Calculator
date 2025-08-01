import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';

import App from './App.vue';
import router from './router';
import './assets/main.css';

// Initialize stores
import { useAuthStore } from './stores/auth';

const app = createApp(App);

// Create Pinia instance
const pinia = createPinia();

// Create Vuetify instance
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#3b82f6',
          secondary: '#64748b',
          accent: '#8b5cf6',
          error: '#ef4444',
          warning: '#f59e0b',
          info: '#06b6d4',
          success: '#10b981',
        },
      },
    },
  },
});

app.use(pinia);
app.use(router);
app.use(vuetify);

// Initialize authentication
const authStore = useAuthStore();
authStore.initializeAuth().then(() => {
  app.mount('#app');
});