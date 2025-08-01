import { defineStore } from 'pinia';
import { ref } from 'vue';
import { firestoreService } from '@/firebase/firestore';
import type { Appointment, AppointmentFilter } from '@/types';

export const useAppointmentsStore = defineStore('appointments', () => {
  const appointments = ref<Appointment[]>([]);
  const upcomingAppointments = ref<Appointment[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchAppointments = async () => {
    try {
      loading.value = true;
      error.value = null;
      appointments.value = await firestoreService.appointments.getAll();
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch appointments';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchUpcomingAppointments = async (limit: number = 10) => {
    try {
      loading.value = true;
      error.value = null;
      upcomingAppointments.value = await firestoreService.appointments.getUpcoming(limit);
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch upcoming appointments';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      loading.value = true;
      error.value = null;
      const id = await firestoreService.appointments.create({
        ...appointmentData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Add the new appointment to the local state
      const newAppointment: Appointment = {
        id,
        ...appointmentData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      appointments.value.unshift(newAppointment);
      
      return id;
    } catch (err: any) {
      error.value = err.message || 'Failed to create appointment';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      loading.value = true;
      error.value = null;
      await firestoreService.appointments.update(id, updates);
      
      // Update the local state
      const index = appointments.value.findIndex(a => a.id === id);
      if (index !== -1) {
        appointments.value[index] = { ...appointments.value[index], ...updates, updatedAt: new Date() };
      }
      
      // Update upcoming appointments if needed
      const upcomingIndex = upcomingAppointments.value.findIndex(a => a.id === id);
      if (upcomingIndex !== -1) {
        upcomingAppointments.value[upcomingIndex] = { ...upcomingAppointments.value[upcomingIndex], ...updates, updatedAt: new Date() };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to update appointment';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      loading.value = true;
      error.value = null;
      await firestoreService.appointments.delete(id);
      
      // Remove from local state
      appointments.value = appointments.value.filter(a => a.id !== id);
      upcomingAppointments.value = upcomingAppointments.value.filter(a => a.id !== id);
    } catch (err: any) {
      error.value = err.message || 'Failed to delete appointment';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const filterAppointments = async (filters: AppointmentFilter) => {
    try {
      loading.value = true;
      error.value = null;
      
      const filteredAppointments = await firestoreService.appointments.getByFilters({
        doctorId: filters.doctor,
        date: filters.date
      });
      
      // Filter by patient name if provided (client-side filtering)
      if (filters.patientName) {
        const searchTerm = filters.patientName.toLowerCase();
        return filteredAppointments.filter(appointment =>
          appointment.patientName.toLowerCase().includes(searchTerm)
        );
      }
      
      return filteredAppointments;
    } catch (err: any) {
      error.value = err.message || 'Failed to filter appointments';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getAppointmentById = (id: string): Appointment | undefined => {
    return appointments.value.find(a => a.id === id);
  };

  const getAppointmentsByPatient = (patientId: string): Appointment[] => {
    return appointments.value.filter(a => a.patientId === patientId);
  };

  const getAppointmentsByDoctor = (doctorId: string): Appointment[] => {
    return appointments.value.filter(a => a.doctorId === doctorId);
  };

  const getTodayAppointments = (): Appointment[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return appointments.value.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate >= today && appointmentDate < tomorrow;
    });
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    appointments,
    upcomingAppointments,
    loading,
    error,
    fetchAppointments,
    fetchUpcomingAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    filterAppointments,
    getAppointmentById,
    getAppointmentsByPatient,
    getAppointmentsByDoctor,
    getTodayAppointments,
    clearError
  };
});