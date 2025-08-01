<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <div class="bg-white rounded-lg shadow-xl p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            Medical Billing
          </h1>
          <p class="text-gray-600">Sign in to your account</p>
        </div>

        <!-- Login Form -->
        <v-form @submit.prevent="handleSubmit" ref="formRef">
          <div class="space-y-6">
            <!-- Email Field -->
            <div>
              <label class="form-label">Email Address</label>
              <v-text-field
                v-model="email"
                type="email"
                :rules="emailRules"
                required
                variant="outlined"
                placeholder="Enter your email"
                prepend-inner-icon="mdi-email"
                class="mt-1"
              />
            </div>

            <!-- Password Field -->
            <div>
              <label class="form-label">Password</label>
              <v-text-field
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                :rules="passwordRules"
                required
                variant="outlined"
                placeholder="Enter your password"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                class="mt-1"
              />
            </div>

            <!-- Error Message -->
            <v-alert
              v-if="error"
              type="error"
              closable
              @click:close="clearError"
              class="mb-4"
            >
              {{ error }}
            </v-alert>

            <!-- Submit Button -->
            <v-btn
              type="submit"
              :loading="loading"
              color="primary"
              size="large"
              block
              class="mt-6"
            >
              {{ isSignUp ? 'Create Account' : 'Sign In' }}
            </v-btn>

            <!-- Toggle Mode -->
            <div class="text-center mt-4">
              <p class="text-gray-600">
                {{ isSignUp ? 'Already have an account?' : "Don't have an account?" }}
                <button
                  type="button"
                  @click="toggleMode"
                  class="text-primary-600 hover:text-primary-500 font-medium ml-1"
                >
                  {{ isSignUp ? 'Sign In' : 'Create Account' }}
                </button>
              </p>
            </div>
          </div>
        </v-form>
      </div>

      <!-- Demo Credentials -->
      <div class="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 class="text-sm font-medium text-yellow-800 mb-2">Demo Credentials</h3>
        <p class="text-sm text-yellow-700">
          Email: demo@medical-billing.com<br>
          Password: demo123456
        </p>
        <v-btn
          @click="fillDemoCredentials"
          size="small"
          color="warning"
          variant="outlined"
          class="mt-2"
        >
          Use Demo Credentials
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useNotificationsStore } from '@/stores/notifications';

const router = useRouter();
const authStore = useAuthStore();
const notificationsStore = useNotificationsStore();

const formRef = ref();
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const isSignUp = ref(false);

const loading = computed(() => authStore.loading);
const error = computed(() => authStore.error);

const emailRules = [
  (value: string) => !!value || 'Email is required',
  (value: string) => /.+@.+\..+/.test(value) || 'Email must be valid'
];

const passwordRules = [
  (value: string) => !!value || 'Password is required',
  (value: string) => value.length >= 6 || 'Password must be at least 6 characters'
];

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  try {
    if (isSignUp.value) {
      await authStore.signUp(email.value, password.value);
      notificationsStore.success('Account created successfully!');
    } else {
      await authStore.signIn(email.value, password.value);
      notificationsStore.success('Welcome back!');
    }
    router.push('/dashboard');
  } catch (error: any) {
    notificationsStore.error(error.message || 'Authentication failed');
  }
};

const toggleMode = () => {
  isSignUp.value = !isSignUp.value;
  clearError();
};

const clearError = () => {
  authStore.clearError();
};

const fillDemoCredentials = () => {
  email.value = 'demo@medical-billing.com';
  password.value = 'demo123456';
};
</script>