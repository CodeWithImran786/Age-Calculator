<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Appointment Scheduling</h1>
        <p class="text-gray-600">Manage patient appointments</p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-calendar-plus"
        @click="openDialog()"
      >
        Schedule Appointment
      </v-btn>
    </div>

    <!-- Filters -->
    <v-card>
      <v-card-text>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <v-text-field
            v-model="filters.patientName"
            prepend-inner-icon="mdi-magnify"
            label="Search by patient name"
            variant="outlined"
            density="compact"
            clearable
          />
          <v-select
            v-model="filters.doctor"
            :items="doctorOptions"
            label="Filter by doctor"
            variant="outlined"
            density="compact"
            clearable
          />
          <v-text-field
            v-model="filters.date"
            type="date"
            label="Filter by date"
            variant="outlined"
            density="compact"
            clearable
          />
          <div class="flex gap-2">
            <v-btn
              color="primary"
              @click="applyFilters"
              :loading="loading"
            >
              Apply Filters
            </v-btn>
            <v-btn
              color="secondary"
              variant="outlined"
              @click="clearFilters"
            >
              Clear
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Appointments Table -->
    <v-card>
      <v-card-title>
        <span>Appointments ({{ filteredAppointments.length }})</span>
      </v-card-title>
      
      <v-data-table
        :headers="headers"
        :items="filteredAppointments"
        :loading="loading"
        :items-per-page="10"
        class="elevation-1"
      >
        <template v-slot:item.date="{ item }">
          <span>{{ formatDate(item.date) }}</span>
        </template>
        
        <template v-slot:item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="small"
            variant="outlined"
          >
            {{ item.status }}
          </v-chip>
        </template>
        
        <template v-slot:item.actions="{ item }">
          <div class="flex gap-2">
            <v-btn
              icon="mdi-eye"
              size="small"
              color="info"
              variant="outlined"
              @click="viewAppointment(item)"
            />
            <v-btn
              icon="mdi-pencil"
              size="small"
              color="warning"
              variant="outlined"
              @click="editAppointment(item)"
            />
            <v-btn
              icon="mdi-currency-usd"
              size="small"
              color="success"
              variant="outlined"
              @click="createBilling(item)"
              :disabled="item.status !== 'completed'"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              color="error"
              variant="outlined"
              @click="confirmDelete(item)"
            />
          </div>
        </template>
        
        <template v-slot:no-data>
          <div class="text-center py-8">
            <v-icon size="48" color="grey-lighten-1">mdi-calendar-blank</v-icon>
            <p class="text-gray-500 mt-2">No appointments found</p>
            <v-btn
              color="primary"
              @click="openDialog()"
              class="mt-4"
            >
              Schedule First Appointment
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Appointment Dialog -->
    <v-dialog v-model="dialog" max-width="800px" persistent>
      <v-card>
        <v-card-title class="text-h5">
          {{ editingAppointment ? 'Edit Appointment' : 'Schedule New Appointment' }}
        </v-card-title>
        
        <v-card-text>
          <v-form ref="formRef" @submit.prevent="saveAppointment">
            <v-container>
              <v-row>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="appointmentForm.patientId"
                    :items="patientOptions"
                    :rules="patientRules"
                    label="Patient"
                    variant="outlined"
                    required
                    @update:model-value="updatePatientName"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="appointmentForm.doctorId"
                    :items="doctorOptions"
                    :rules="doctorRules"
                    label="Doctor"
                    variant="outlined"
                    required
                    @update:model-value="updateDoctorName"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="appointmentForm.date"
                    :rules="dateRules"
                    label="Date"
                    type="date"
                    variant="outlined"
                    required
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="appointmentForm.time"
                    :rules="timeRules"
                    label="Time"
                    type="time"
                    variant="outlined"
                    required
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="appointmentForm.status"
                    :items="statusOptions"
                    :rules="statusRules"
                    label="Status"
                    variant="outlined"
                    required
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="appointmentForm.reason"
                    :rules="reasonRules"
                    label="Reason for Visit"
                    variant="outlined"
                    rows="3"
                    required
                    placeholder="Enter the reason for this appointment..."
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            @click="closeDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="saveAppointment"
            :loading="saving"
          >
            {{ editingAppointment ? 'Update' : 'Schedule' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Appointment Dialog -->
    <v-dialog v-model="viewDialog" max-width="600px">
      <v-card v-if="selectedAppointment">
        <v-card-title class="text-h5">
          Appointment Details
        </v-card-title>
        
        <v-card-text>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm font-medium text-gray-600">Patient</p>
                <p class="text-lg">{{ selectedAppointment.patientName }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600">Doctor</p>
                <p class="text-lg">{{ selectedAppointment.doctorName }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600">Date</p>
                <p class="text-lg">{{ formatDate(selectedAppointment.date) }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600">Time</p>
                <p class="text-lg">{{ selectedAppointment.time }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600">Status</p>
                <v-chip :color="getStatusColor(selectedAppointment.status)" size="small">
                  {{ selectedAppointment.status }}
                </v-chip>
              </div>
            </div>
            
            <div>
              <p class="text-sm font-medium text-gray-600">Reason for Visit</p>
              <p class="text-lg whitespace-pre-wrap">{{ selectedAppointment.reason }}</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <p class="font-medium">Created</p>
                <p>{{ formatDate(selectedAppointment.createdAt) }}</p>
              </div>
              <div>
                <p class="font-medium">Last Updated</p>
                <p>{{ formatDate(selectedAppointment.updatedAt) }}</p>
              </div>
            </div>
          </div>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn
            v-if="selectedAppointment.status === 'completed'"
            color="success"
            variant="outlined"
            @click="createBilling(selectedAppointment)"
          >
            Create Bill
          </v-btn>
          <v-btn
            color="warning"
            variant="outlined"
            @click="editAppointment(selectedAppointment)"
          >
            Edit
          </v-btn>
          <v-btn
            color="grey"
            variant="outlined"
            @click="viewDialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete this appointment for {{ appointmentToDelete?.patientName }}? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            @click="deleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            @click="deleteAppointment"
            :loading="deleting"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAppointmentsStore } from '@/stores/appointments';
import { usePatientsStore } from '@/stores/patients';
import { useDoctorsStore } from '@/stores/doctors';
import { useNotificationsStore } from '@/stores/notifications';
import type { Appointment, AppointmentFilter } from '@/types';

const router = useRouter();
const appointmentsStore = useAppointmentsStore();
const patientsStore = usePatientsStore();
const doctorsStore = useDoctorsStore();
const notificationsStore = useNotificationsStore();

const dialog = ref(false);
const viewDialog = ref(false);
const deleteDialog = ref(false);
const formRef = ref();
const saving = ref(false);
const deleting = ref(false);
const editingAppointment = ref<Appointment | null>(null);
const selectedAppointment = ref<Appointment | null>(null);
const appointmentToDelete = ref<Appointment | null>(null);

const filters = ref<AppointmentFilter>({
  doctor: '',
  date: undefined,
  patientName: ''
});

const filteredAppointments = ref<Appointment[]>([]);

const appointmentForm = ref({
  patientId: '',
  patientName: '',
  doctorId: '',
  doctorName: '',
  date: '',
  time: '',
  reason: '',
  status: 'scheduled'
});

const statusOptions = [
  { title: 'Scheduled', value: 'scheduled' },
  { title: 'Completed', value: 'completed' },
  { title: 'Cancelled', value: 'cancelled' },
  { title: 'No Show', value: 'no-show' }
];

const headers = [
  { title: 'Patient', value: 'patientName', sortable: true },
  { title: 'Doctor', value: 'doctorName', sortable: true },
  { title: 'Date', value: 'date', sortable: true },
  { title: 'Time', value: 'time', sortable: true },
  { title: 'Reason', value: 'reason', sortable: false },
  { title: 'Status', value: 'status', sortable: true },
  { title: 'Actions', value: 'actions', sortable: false, width: '200px' }
];

const loading = computed(() => appointmentsStore.loading);
const appointments = computed(() => appointmentsStore.appointments);
const patients = computed(() => patientsStore.patients);
const doctors = computed(() => doctorsStore.doctors);

const patientOptions = computed(() => 
  patients.value.map(patient => ({
    title: patient.name,
    value: patient.id
  }))
);

const doctorOptions = computed(() => 
  doctors.value.map(doctor => ({
    title: doctor.name,
    value: doctor.id
  }))
);

// Validation rules
const patientRules = [
  (value: string) => !!value || 'Patient is required'
];

const doctorRules = [
  (value: string) => !!value || 'Doctor is required'
];

const dateRules = [
  (value: string) => !!value || 'Date is required'
];

const timeRules = [
  (value: string) => !!value || 'Time is required'
];

const reasonRules = [
  (value: string) => !!value || 'Reason is required',
  (value: string) => value.length >= 10 || 'Reason must be at least 10 characters'
];

const statusRules = [
  (value: string) => !!value || 'Status is required'
];

const openDialog = (appointment?: Appointment) => {
  if (appointment) {
    editingAppointment.value = appointment;
    appointmentForm.value = {
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      doctorId: appointment.doctorId,
      doctorName: appointment.doctorName,
      date: appointment.date.toISOString().split('T')[0],
      time: appointment.time,
      reason: appointment.reason,
      status: appointment.status
    };
  } else {
    editingAppointment.value = null;
    appointmentForm.value = {
      patientId: '',
      patientName: '',
      doctorId: '',
      doctorName: '',
      date: '',
      time: '',
      reason: '',
      status: 'scheduled'
    };
  }
  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  editingAppointment.value = null;
  if (formRef.value) {
    formRef.value.reset();
  }
};

const saveAppointment = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  saving.value = true;
  try {
    const appointmentData = {
      ...appointmentForm.value,
      date: new Date(appointmentForm.value.date + 'T' + appointmentForm.value.time)
    };

    if (editingAppointment.value) {
      await appointmentsStore.updateAppointment(editingAppointment.value.id, appointmentData);
      notificationsStore.success('Appointment updated successfully');
    } else {
      await appointmentsStore.createAppointment(appointmentData);
      notificationsStore.success('Appointment scheduled successfully');
    }
    closeDialog();
    await loadAppointments();
  } catch (error) {
    notificationsStore.error('Failed to save appointment');
  } finally {
    saving.value = false;
  }
};

const viewAppointment = (appointment: Appointment) => {
  selectedAppointment.value = appointment;
  viewDialog.value = true;
};

const editAppointment = (appointment: Appointment) => {
  viewDialog.value = false;
  openDialog(appointment);
};

const confirmDelete = (appointment: Appointment) => {
  appointmentToDelete.value = appointment;
  deleteDialog.value = true;
};

const deleteAppointment = async () => {
  if (!appointmentToDelete.value) return;

  deleting.value = true;
  try {
    await appointmentsStore.deleteAppointment(appointmentToDelete.value.id);
    notificationsStore.success('Appointment deleted successfully');
    deleteDialog.value = false;
    appointmentToDelete.value = null;
    await loadAppointments();
  } catch (error) {
    notificationsStore.error('Failed to delete appointment');
  } finally {
    deleting.value = false;
  }
};

const createBilling = (appointment: Appointment) => {
  router.push(`/appointments/${appointment.id}/billing`);
};

const updatePatientName = (patientId: string) => {
  const patient = patients.value.find(p => p.id === patientId);
  if (patient) {
    appointmentForm.value.patientName = patient.name;
  }
};

const updateDoctorName = (doctorId: string) => {
  const doctor = doctors.value.find(d => d.id === doctorId);
  if (doctor) {
    appointmentForm.value.doctorName = doctor.name;
  }
};

const applyFilters = async () => {
  try {
    const filterDate = filters.value.date ? new Date(filters.value.date) : undefined;
    filteredAppointments.value = await appointmentsStore.filterAppointments({
      doctor: filters.value.doctor,
      date: filterDate,
      patientName: filters.value.patientName
    });
  } catch (error) {
    notificationsStore.error('Failed to apply filters');
  }
};

const clearFilters = async () => {
  filters.value = {
    doctor: '',
    date: undefined,
    patientName: ''
  };
  await loadAppointments();
};

const loadAppointments = async () => {
  await appointmentsStore.fetchAppointments();
  filteredAppointments.value = appointments.value;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'scheduled': return 'blue';
    case 'completed': return 'green';
    case 'cancelled': return 'red';
    case 'no-show': return 'orange';
    default: return 'grey';
  }
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

onMounted(async () => {
  await Promise.all([
    patientsStore.fetchPatients(),
    doctorsStore.fetchDoctors(),
    loadAppointments()
  ]);
});
</script>