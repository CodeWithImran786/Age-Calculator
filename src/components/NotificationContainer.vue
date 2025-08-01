<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <transition-group
      name="notification"
      tag="div"
      class="space-y-2"
    >
      <v-alert
        v-for="notification in notifications"
        :key="notification.id"
        :type="notification.type"
        closable
        @click:close="removeNotification(notification.id)"
        class="max-w-sm"
      >
        {{ notification.message }}
      </v-alert>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useNotificationsStore } from '@/stores/notifications';

const notificationsStore = useNotificationsStore();

const notifications = computed(() => notificationsStore.notifications);

const removeNotification = (id: string) => {
  notificationsStore.removeNotification(id);
};
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}
</style>