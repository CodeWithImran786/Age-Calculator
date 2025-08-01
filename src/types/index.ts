export interface User {
  uid: string;
  email: string;
  displayName?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email: string;
  medicalNotes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: Date;
  time: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  createdAt: Date;
  updatedAt: Date;
}

export interface BillingRecord {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  billingCode: string;
  serviceType: string;
  amount: number;
  paymentStatus: 'pending' | 'paid' | 'overdue' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface AppointmentFilter {
  doctor?: string;
  date?: Date;
  patientName?: string;
}

export interface NotificationMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}