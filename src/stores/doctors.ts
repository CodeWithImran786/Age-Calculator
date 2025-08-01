import { defineStore } from 'pinia';
import { ref } from 'vue';
import { firestoreService } from '@/firebase/firestore';
import type { Doctor } from '@/types';

export const useDoctorsStore = defineStore('doctors', () => {
  const doctors = ref<Doctor[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchDoctors = async () => {
    try {
      loading.value = true;
      error.value = null;
      doctors.value = await firestoreService.doctors.getAll();
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch doctors';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createDoctor = async (doctorData: Omit<Doctor, 'id'>) => {
    try {
      loading.value = true;
      error.value = null;
      const id = await firestoreService.doctors.create(doctorData);
      
      // Add the new doctor to the local state
      const newDoctor: Doctor = {
        id,
        ...doctorData
      };
      doctors.value.push(newDoctor);
      
      return id;
    } catch (err: any) {
      error.value = err.message || 'Failed to create doctor';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getDoctorById = (id: string): Doctor | undefined => {
    return doctors.value.find(d => d.id === id);
  };

  const getDoctorsBySpecialty = (specialty: string): Doctor[] => {
    return doctors.value.filter(d => 
      d.specialty.toLowerCase().includes(specialty.toLowerCase())
    );
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    doctors,
    loading,
    error,
    fetchDoctors,
    createDoctor,
    getDoctorById,
    getDoctorsBySpecialty,
    clearError
  };
});