<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Patient Management</h1>
        <p class="text-gray-600">Manage your patient records</p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-account-plus"
        @click="openDialog()"
      >
        Add Patient
      </v-btn>
    </div>

    <!-- Search and Filter -->
    <v-card>
      <v-card-text>
        <div class="flex gap-4 items-end">
          <v-text-field
            v-model="searchTerm"
            prepend-inner-icon="mdi-magnify"
            label="Search patients..."
            variant="outlined"
            clearable
            density="compact"
            class="flex-1"
          />
          <v-btn
            color="secondary"
            variant="outlined"
            @click="clearSearch"
          >
            Clear
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Patients Table -->
    <v-card>
      <v-card-title>
        <span>Patients ({{ filteredPatients.length }})</span>
      </v-card-title>
      
      <v-data-table
        :headers="headers"
        :items="filteredPatients"
        :loading="loading"
        :items-per-page="10"
        class="elevation-1"
      >
        <template v-slot:item.gender="{ item }">
          <v-chip
            :color="getGenderColor(item.gender)"
            size="small"
            variant="outlined"
          >
            {{ item.gender }}
          </v-chip>
        </template>
        
        <template v-slot:item.age="{ item }">
          <span>{{ item.age }} years</span>
        </template>
        
        <template v-slot:item.createdAt="{ item }">
          <span>{{ formatDate(item.createdAt) }}</span>
        </template>
        
        <template v-slot:item.actions="{ item }">
          <div class="flex gap-2">
            <v-btn
              icon="mdi-eye"
              size="small"
              color="info"
              variant="outlined"
              @click="viewPatient(item)"
            />
            <v-btn
              icon="mdi-pencil"
              size="small"
              color="warning"
              variant="outlined"
              @click="editPatient(item)"
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
            <v-icon size="48" color="grey-lighten-1">mdi-account-off</v-icon>
            <p class="text-gray-500 mt-2">No patients found</p>
            <v-btn
              color="primary"
              @click="openDialog()"
              class="mt-4"
            >
              Add Your First Patient
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Patient Dialog -->
    <v-dialog v-model="dialog" max-width="800px" persistent>
      <v-card>
        <v-card-title class="text-h5">
          {{ editingPatient ? 'Edit Patient' : 'Add New Patient' }}
        </v-card-title>
        
        <v-card-text>
          <v-form ref="formRef" @submit.prevent="savePatient">
            <v-container>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="patientForm.name"
                    :rules="nameRules"
                    label="Full Name"
                    variant="outlined"
                    required
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="patientForm.age"
                    :rules="ageRules"
                    label="Age"
                    type="number"
                    variant="outlined"
                    required
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="patientForm.gender"
                    :items="genderOptions"
                    :rules="genderRules"
                    label="Gender"
                    variant="outlined"
                    required
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="patientForm.phone"
                    :rules="phoneRules"
                    label="Phone Number"
                    variant="outlined"
                    required
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="patientForm.email"
                    :rules="emailRules"
                    label="Email Address"
                    type="email"
                    variant="outlined"
                    required
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="patientForm.medicalNotes"
                    label="Medical Notes"
                    variant="outlined"
                    rows="4"
                    placeholder="Enter any relevant medical information..."
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
            @click="savePatient"
            :loading="saving"
          >
            {{ editingPatient ? 'Update' : 'Save' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Patient Dialog -->
    <v-dialog v-model="viewDialog" max-width="600px">
      <v-card v-if="selectedPatient">
        <v-card-title class="text-h5">
          {{ selectedPatient.name }}
        </v-card-title>
        
        <v-card-text>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm font-medium text-gray-600">Age</p>
                <p class="text-lg">{{ selectedPatient.age }} years</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600">Gender</p>
                <v-chip :color="getGenderColor(selectedPatient.gender)" size="small">
                  {{ selectedPatient.gender }}
                </v-chip>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600">Phone</p>
                <p class="text-lg">{{ selectedPatient.phone }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600">Email</p>
                <p class="text-lg">{{ selectedPatient.email }}</p>
              </div>
            </div>
            
            <div v-if="selectedPatient.medicalNotes">
              <p class="text-sm font-medium text-gray-600">Medical Notes</p>
              <p class="text-lg whitespace-pre-wrap">{{ selectedPatient.medicalNotes }}</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <p class="font-medium">Created</p>
                <p>{{ formatDate(selectedPatient.createdAt) }}</p>
              </div>
              <div>
                <p class="font-medium">Last Updated</p>
                <p>{{ formatDate(selectedPatient.updatedAt) }}</p>
              </div>
            </div>
          </div>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="warning"
            variant="outlined"
            @click="editPatient(selectedPatient)"
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
          Are you sure you want to delete {{ patientToDelete?.name }}? This action cannot be undone.
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
            @click="deletePatient"
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
import { usePatientsStore } from '@/stores/patients';
import { useNotificationsStore } from '@/stores/notifications';
import type { Patient } from '@/types';

const patientsStore = usePatientsStore();
const notificationsStore = useNotificationsStore();

const dialog = ref(false);
const viewDialog = ref(false);
const deleteDialog = ref(false);
const formRef = ref();
const searchTerm = ref('');
const saving = ref(false);
const deleting = ref(false);
const editingPatient = ref<Patient | null>(null);
const selectedPatient = ref<Patient | null>(null);
const patientToDelete = ref<Patient | null>(null);

const patientForm = ref({
  name: '',
  age: 0,
  gender: '',
  phone: '',
  email: '',
  medicalNotes: ''
});

const genderOptions = [
  { title: 'Male', value: 'male' },
  { title: 'Female', value: 'female' },
  { title: 'Other', value: 'other' }
];

const headers = [
  { title: 'Name', value: 'name', sortable: true },
  { title: 'Age', value: 'age', sortable: true },
  { title: 'Gender', value: 'gender', sortable: true },
  { title: 'Phone', value: 'phone', sortable: false },
  { title: 'Email', value: 'email', sortable: false },
  { title: 'Created', value: 'createdAt', sortable: true },
  { title: 'Actions', value: 'actions', sortable: false, width: '150px' }
];

const loading = computed(() => patientsStore.loading);
const patients = computed(() => patientsStore.patients);

const filteredPatients = computed(() => {
  if (!searchTerm.value) return patients.value;
  return patientsStore.searchPatients(searchTerm.value);
});

// Validation rules
const nameRules = [
  (value: string) => !!value || 'Name is required',
  (value: string) => value.length >= 2 || 'Name must be at least 2 characters'
];

const ageRules = [
  (value: number) => !!value || 'Age is required',
  (value: number) => value > 0 && value <= 150 || 'Age must be between 1 and 150'
];

const genderRules = [
  (value: string) => !!value || 'Gender is required'
];

const phoneRules = [
  (value: string) => !!value || 'Phone number is required',
  (value: string) => /^[\d\s\-\+\(\)]+$/.test(value) || 'Phone number is not valid'
];

const emailRules = [
  (value: string) => !!value || 'Email is required',
  (value: string) => /.+@.+\..+/.test(value) || 'Email must be valid'
];

const openDialog = (patient?: Patient) => {
  if (patient) {
    editingPatient.value = patient;
    patientForm.value = {
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email,
      medicalNotes: patient.medicalNotes
    };
  } else {
    editingPatient.value = null;
    patientForm.value = {
      name: '',
      age: 0,
      gender: '',
      phone: '',
      email: '',
      medicalNotes: ''
    };
  }
  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  editingPatient.value = null;
  if (formRef.value) {
    formRef.value.reset();
  }
};

const savePatient = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  saving.value = true;
  try {
    if (editingPatient.value) {
      await patientsStore.updatePatient(editingPatient.value.id, patientForm.value);
      notificationsStore.success('Patient updated successfully');
    } else {
      await patientsStore.createPatient(patientForm.value);
      notificationsStore.success('Patient created successfully');
    }
    closeDialog();
  } catch (error) {
    notificationsStore.error('Failed to save patient');
  } finally {
    saving.value = false;
  }
};

const viewPatient = (patient: Patient) => {
  selectedPatient.value = patient;
  viewDialog.value = true;
};

const editPatient = (patient: Patient) => {
  viewDialog.value = false;
  openDialog(patient);
};

const confirmDelete = (patient: Patient) => {
  patientToDelete.value = patient;
  deleteDialog.value = true;
};

const deletePatient = async () => {
  if (!patientToDelete.value) return;

  deleting.value = true;
  try {
    await patientsStore.deletePatient(patientToDelete.value.id);
    notificationsStore.success('Patient deleted successfully');
    deleteDialog.value = false;
    patientToDelete.value = null;
  } catch (error) {
    notificationsStore.error('Failed to delete patient');
  } finally {
    deleting.value = false;
  }
};

const clearSearch = () => {
  searchTerm.value = '';
};

const getGenderColor = (gender: string) => {
  switch (gender) {
    case 'male': return 'blue';
    case 'female': return 'pink';
    default: return 'purple';
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
  await patientsStore.fetchPatients();
});
</script>