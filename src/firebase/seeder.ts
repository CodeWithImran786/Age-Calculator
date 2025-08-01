import { firestoreService } from './firestore';
import type { Patient, Doctor, Appointment, BillingRecord } from '@/types';

export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Sample doctors
    const doctors: Omit<Doctor, 'id'>[] = [
      {
        name: 'Dr. Sarah Johnson',
        specialty: 'Family Medicine',
        email: 'sarah.johnson@medical.com',
        phone: '(555) 123-4567'
      },
      {
        name: 'Dr. Michael Chen',
        specialty: 'Cardiology',
        email: 'michael.chen@medical.com',
        phone: '(555) 234-5678'
      },
      {
        name: 'Dr. Emily Rodriguez',
        specialty: 'Pediatrics',
        email: 'emily.rodriguez@medical.com',
        phone: '(555) 345-6789'
      },
      {
        name: 'Dr. David Thompson',
        specialty: 'Orthopedics',
        email: 'david.thompson@medical.com',
        phone: '(555) 456-7890'
      }
    ];

    console.log('Creating doctors...');
    const doctorIds: string[] = [];
    for (const doctor of doctors) {
      const id = await firestoreService.doctors.create(doctor);
      doctorIds.push(id);
    }

    // Sample patients
    const patients: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'John Smith',
        age: 45,
        gender: 'male',
        phone: '(555) 111-2222',
        email: 'john.smith@email.com',
        medicalNotes: 'Allergic to penicillin. History of hypertension.'
      },
      {
        name: 'Maria Garcia',
        age: 32,
        gender: 'female',
        phone: '(555) 333-4444',
        email: 'maria.garcia@email.com',
        medicalNotes: 'Diabetes type 2. Regular check-ups required.'
      },
      {
        name: 'Robert Johnson',
        age: 28,
        gender: 'male',
        phone: '(555) 555-6666',
        email: 'robert.johnson@email.com',
        medicalNotes: 'No known allergies. Athlete, previous knee injury.'
      },
      {
        name: 'Lisa Brown',
        age: 55,
        gender: 'female',
        phone: '(555) 777-8888',
        email: 'lisa.brown@email.com',
        medicalNotes: 'High cholesterol. Family history of heart disease.'
      },
      {
        name: 'James Wilson',
        age: 38,
        gender: 'male',
        phone: '(555) 999-0000',
        email: 'james.wilson@email.com',
        medicalNotes: 'Asthma. Carries inhaler.'
      }
    ];

    console.log('Creating patients...');
    const patientIds: string[] = [];
    for (const patient of patients) {
      const id = await firestoreService.patients.create({
        ...patient,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      patientIds.push(id);
    }

    // Sample appointments
    const appointments: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        patientId: patientIds[0],
        patientName: patients[0].name,
        doctorId: doctorIds[0],
        doctorName: doctors[0].name,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        time: '09:00',
        reason: 'Annual physical examination',
        status: 'scheduled'
      },
      {
        patientId: patientIds[1],
        patientName: patients[1].name,
        doctorId: doctorIds[0],
        doctorName: doctors[0].name,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        time: '10:30',
        reason: 'Diabetes follow-up',
        status: 'scheduled'
      },
      {
        patientId: patientIds[2],
        patientName: patients[2].name,
        doctorId: doctorIds[3],
        doctorName: doctors[3].name,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        time: '14:00',
        reason: 'Knee pain evaluation',
        status: 'completed'
      },
      {
        patientId: patientIds[3],
        patientName: patients[3].name,
        doctorId: doctorIds[1],
        doctorName: doctors[1].name,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last week
        time: '11:15',
        reason: 'Cardiac consultation',
        status: 'completed'
      },
      {
        patientId: patientIds[4],
        patientName: patients[4].name,
        doctorId: doctorIds[0],
        doctorName: doctors[0].name,
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        time: '15:30',
        reason: 'Asthma check-up',
        status: 'scheduled'
      }
    ];

    console.log('Creating appointments...');
    const appointmentIds: string[] = [];
    for (const appointment of appointments) {
      const id = await firestoreService.appointments.create({
        ...appointment,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      appointmentIds.push(id);
    }

    // Sample billing records (only for completed appointments)
    const completedAppointmentIndices = [2, 3]; // Indices of completed appointments
    const billingRecords: Omit<BillingRecord, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        appointmentId: appointmentIds[2],
        patientId: patientIds[2],
        patientName: patients[2].name,
        billingCode: 'CPT-99213',
        serviceType: 'Office Visit',
        amount: 150.00,
        paymentStatus: 'paid'
      },
      {
        appointmentId: appointmentIds[3],
        patientId: patientIds[3],
        patientName: patients[3].name,
        billingCode: 'CPT-99214',
        serviceType: 'Cardiology Consultation',
        amount: 275.00,
        paymentStatus: 'pending'
      }
    ];

    console.log('Creating billing records...');
    for (const billing of billingRecords) {
      await firestoreService.billing.create({
        ...billing,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    console.log('Database seeding completed successfully!');
    return {
      doctors: doctorIds.length,
      patients: patientIds.length,
      appointments: appointmentIds.length,
      billingRecords: billingRecords.length
    };
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};