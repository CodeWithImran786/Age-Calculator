import { defineStore } from 'pinia';
import { ref } from 'vue';
import { firestoreService } from '@/firebase/firestore';
import type { BillingRecord } from '@/types';

export const useBillingStore = defineStore('billing', () => {
  const billingRecords = ref<BillingRecord[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchBillingRecords = async () => {
    try {
      loading.value = true;
      error.value = null;
      billingRecords.value = await firestoreService.billing.getAll();
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch billing records';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createBillingRecord = async (billingData: Omit<BillingRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      loading.value = true;
      error.value = null;
      const id = await firestoreService.billing.create({
        ...billingData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Add the new billing record to the local state
      const newBillingRecord: BillingRecord = {
        id,
        ...billingData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      billingRecords.value.unshift(newBillingRecord);
      
      return id;
    } catch (err: any) {
      error.value = err.message || 'Failed to create billing record';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateBillingRecord = async (id: string, updates: Partial<BillingRecord>) => {
    try {
      loading.value = true;
      error.value = null;
      await firestoreService.billing.update(id, updates);
      
      // Update the local state
      const index = billingRecords.value.findIndex(b => b.id === id);
      if (index !== -1) {
        billingRecords.value[index] = { 
          ...billingRecords.value[index], 
          ...updates, 
          updatedAt: new Date() 
        };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to update billing record';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteBillingRecord = async (id: string) => {
    try {
      loading.value = true;
      error.value = null;
      await firestoreService.billing.delete(id);
      
      // Remove from local state
      billingRecords.value = billingRecords.value.filter(b => b.id !== id);
    } catch (err: any) {
      error.value = err.message || 'Failed to delete billing record';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getBillingByAppointmentId = async (appointmentId: string): Promise<BillingRecord | null> => {
    try {
      loading.value = true;
      error.value = null;
      return await firestoreService.billing.getByAppointmentId(appointmentId);
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch billing record';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getBillingById = (id: string): BillingRecord | undefined => {
    return billingRecords.value.find(b => b.id === id);
  };

  const getBillingByPatient = (patientId: string): BillingRecord[] => {
    return billingRecords.value.filter(b => b.patientId === patientId);
  };

  const getBillingByStatus = (status: BillingRecord['paymentStatus']): BillingRecord[] => {
    return billingRecords.value.filter(b => b.paymentStatus === status);
  };

  const getTotalRevenue = (): number => {
    return billingRecords.value
      .filter(b => b.paymentStatus === 'paid')
      .reduce((total, b) => total + b.amount, 0);
  };

  const getPendingAmount = (): number => {
    return billingRecords.value
      .filter(b => b.paymentStatus === 'pending' || b.paymentStatus === 'overdue')
      .reduce((total, b) => total + b.amount, 0);
  };

  const searchBillingRecords = (searchTerm: string): BillingRecord[] => {
    if (!searchTerm) return billingRecords.value;
    
    const term = searchTerm.toLowerCase();
    return billingRecords.value.filter(billing =>
      billing.patientName.toLowerCase().includes(term) ||
      billing.billingCode.toLowerCase().includes(term) ||
      billing.serviceType.toLowerCase().includes(term)
    );
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    billingRecords,
    loading,
    error,
    fetchBillingRecords,
    createBillingRecord,
    updateBillingRecord,
    deleteBillingRecord,
    getBillingByAppointmentId,
    getBillingById,
    getBillingByPatient,
    getBillingByStatus,
    getTotalRevenue,
    getPendingAmount,
    searchBillingRecords,
    clearError
  };
});