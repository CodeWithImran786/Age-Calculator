import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './config';
import type { Patient, Appointment, BillingRecord, Doctor } from '@/types';

// Convert Firestore Timestamp to Date
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

// Convert Date to Firestore Timestamp
const convertToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

export const firestoreService = {
  // Patient operations
  patients: {
    async create(patient: Omit<Patient, 'id'>): Promise<string> {
      const patientData = {
        ...patient,
        createdAt: convertToTimestamp(new Date()),
        updatedAt: convertToTimestamp(new Date())
      };
      const docRef = await addDoc(collection(db, 'patients'), patientData);
      return docRef.id;
    },

    async getAll(): Promise<Patient[]> {
      const querySnapshot = await getDocs(
        query(collection(db, 'patients'), orderBy('name'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt)
      })) as Patient[];
    },

    async getById(id: string): Promise<Patient | null> {
      const docRef = doc(db, 'patients', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt)
        } as Patient;
      }
      return null;
    },

    async update(id: string, updates: Partial<Patient>): Promise<void> {
      const docRef = doc(db, 'patients', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: convertToTimestamp(new Date())
      });
    },

    async delete(id: string): Promise<void> {
      const docRef = doc(db, 'patients', id);
      await deleteDoc(docRef);
    }
  },

  // Appointment operations
  appointments: {
    async create(appointment: Omit<Appointment, 'id'>): Promise<string> {
      const appointmentData = {
        ...appointment,
        date: convertToTimestamp(appointment.date),
        createdAt: convertToTimestamp(new Date()),
        updatedAt: convertToTimestamp(new Date())
      };
      const docRef = await addDoc(collection(db, 'appointments'), appointmentData);
      return docRef.id;
    },

    async getAll(): Promise<Appointment[]> {
      const querySnapshot = await getDocs(
        query(collection(db, 'appointments'), orderBy('date', 'desc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: convertTimestamp(doc.data().date),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt)
      })) as Appointment[];
    },

    async getUpcoming(limitCount: number = 10): Promise<Appointment[]> {
      const now = Timestamp.now();
      const querySnapshot = await getDocs(
        query(
          collection(db, 'appointments'),
          where('date', '>=', now),
          orderBy('date'),
          limit(limitCount)
        )
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: convertTimestamp(doc.data().date),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt)
      })) as Appointment[];
    },

    async getByFilters(filters: {
      doctorId?: string;
      patientId?: string;
      date?: Date;
    }): Promise<Appointment[]> {
      const constraints: QueryConstraint[] = [orderBy('date')];
      
      if (filters.doctorId) {
        constraints.push(where('doctorId', '==', filters.doctorId));
      }
      if (filters.patientId) {
        constraints.push(where('patientId', '==', filters.patientId));
      }
      if (filters.date) {
        const startOfDay = new Date(filters.date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(filters.date);
        endOfDay.setHours(23, 59, 59, 999);
        
        constraints.push(
          where('date', '>=', convertToTimestamp(startOfDay)),
          where('date', '<=', convertToTimestamp(endOfDay))
        );
      }

      const querySnapshot = await getDocs(query(collection(db, 'appointments'), ...constraints));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: convertTimestamp(doc.data().date),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt)
      })) as Appointment[];
    },

    async update(id: string, updates: Partial<Appointment>): Promise<void> {
      const docRef = doc(db, 'appointments', id);
      const updateData: any = {
        ...updates,
        updatedAt: convertToTimestamp(new Date())
      };
      if (updates.date) {
        updateData.date = convertToTimestamp(updates.date);
      }
      await updateDoc(docRef, updateData);
    },

    async delete(id: string): Promise<void> {
      const docRef = doc(db, 'appointments', id);
      await deleteDoc(docRef);
    }
  },

  // Billing operations
  billing: {
    async create(billing: Omit<BillingRecord, 'id'>): Promise<string> {
      const billingData = {
        ...billing,
        createdAt: convertToTimestamp(new Date()),
        updatedAt: convertToTimestamp(new Date())
      };
      const docRef = await addDoc(collection(db, 'billing'), billingData);
      return docRef.id;
    },

    async getAll(): Promise<BillingRecord[]> {
      const querySnapshot = await getDocs(
        query(collection(db, 'billing'), orderBy('createdAt', 'desc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt)
      })) as BillingRecord[];
    },

    async getByAppointmentId(appointmentId: string): Promise<BillingRecord | null> {
      const querySnapshot = await getDocs(
        query(collection(db, 'billing'), where('appointmentId', '==', appointmentId))
      );
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data(),
          createdAt: convertTimestamp(doc.data().createdAt),
          updatedAt: convertTimestamp(doc.data().updatedAt)
        } as BillingRecord;
      }
      return null;
    },

    async update(id: string, updates: Partial<BillingRecord>): Promise<void> {
      const docRef = doc(db, 'billing', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: convertToTimestamp(new Date())
      });
    },

    async delete(id: string): Promise<void> {
      const docRef = doc(db, 'billing', id);
      await deleteDoc(docRef);
    }
  },

  // Doctor operations (for demo purposes - you might want to manage this differently)
  doctors: {
    async getAll(): Promise<Doctor[]> {
      const querySnapshot = await getDocs(collection(db, 'doctors'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Doctor[];
    },

    async create(doctor: Omit<Doctor, 'id'>): Promise<string> {
      const docRef = await addDoc(collection(db, 'doctors'), doctor);
      return docRef.id;
    }
  }
};