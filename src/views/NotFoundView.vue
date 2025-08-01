<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <v-icon size="120" color="grey-lighten-1">mdi-alert-circle-outline</v-icon>
      <h1 class="text-6xl font-bold text-gray-900 mt-4">404</h1>
      <p class="text-xl text-gray-600 mt-4">Page not found</p>
      <p class="text-gray-500 mt-2">The page you're looking for doesn't exist.</p>
      <v-btn
        color="primary"
        class="mt-6"
        @click="$router.push('/dashboard')"
      >
        Go to Dashboard
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
// Simple 404 page
</script>