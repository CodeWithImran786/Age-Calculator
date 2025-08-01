import { defineStore } from 'pinia';
import { ref } from 'vue';
import { firestoreService } from '@/firebase/firestore';
import type { Patient } from '@/types';

export const usePatientsStore = defineStore('patients', () => {
  const patients = ref<Patient[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchPatients = async () => {
    try {
      loading.value = true;
      error.value = null;
      patients.value = await firestoreService.patients.getAll();
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch patients';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createPatient = async (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      loading.value = true;
      error.value = null;
      const id = await firestoreService.patients.create({
        ...patientData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Add the new patient to the local state
      const newPatient: Patient = {
        id,
        ...patientData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      patients.value.unshift(newPatient);
      
      return id;
    } catch (err: any) {
      error.value = err.message || 'Failed to create patient';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    try {
      loading.value = true;
      error.value = null;
      await firestoreService.patients.update(id, updates);
      
      // Update the local state
      const index = patients.value.findIndex(p => p.id === id);
      if (index !== -1) {
        patients.value[index] = { ...patients.value[index], ...updates, updatedAt: new Date() };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to update patient';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deletePatient = async (id: string) => {
    try {
      loading.value = true;
      error.value = null;
      await firestoreService.patients.delete(id);
      
      // Remove from local state
      patients.value = patients.value.filter(p => p.id !== id);
    } catch (err: any) {
      error.value = err.message || 'Failed to delete patient';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getPatientById = (id: string): Patient | undefined => {
    return patients.value.find(p => p.id === id);
  };

  const searchPatients = (searchTerm: string): Patient[] => {
    if (!searchTerm) return patients.value;
    
    const term = searchTerm.toLowerCase();
    return patients.value.filter(patient =>
      patient.name.toLowerCase().includes(term) ||
      patient.email.toLowerCase().includes(term) ||
      patient.phone.includes(term)
    );
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    patients,
    loading,
    error,
    fetchPatients,
    createPatient,
    updatePatient,
    deletePatient,
    getPatientById,
    searchPatients,
    clearError
  };
});