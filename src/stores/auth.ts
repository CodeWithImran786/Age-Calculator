import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '@/firebase/auth';
import type { User } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!user.value);

  const signIn = async (email: string, password: string) => {
    try {
      error.value = null;
      loading.value = true;
      await authService.signIn(email, password);
    } catch (err: any) {
      error.value = err.message || 'Sign in failed';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      error.value = null;
      loading.value = true;
      await authService.signUp(email, password);
    } catch (err: any) {
      error.value = err.message || 'Sign up failed';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const signOut = async () => {
    try {
      error.value = null;
      await authService.signOut();
      user.value = null;
    } catch (err: any) {
      error.value = err.message || 'Sign out failed';
      throw err;
    }
  };

  const initializeAuth = () => {
    return new Promise<void>((resolve) => {
      const unsubscribe = authService.onAuthStateChanged((authUser) => {
        user.value = authUser;
        loading.value = false;
        resolve();
        unsubscribe();
      });
    });
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    user,
    loading,
    error,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    initializeAuth,
    clearError
  };
});