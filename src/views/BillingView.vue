<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Billing Management</h1>
        <p class="text-gray-600">Manage billing records and payments</p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="openDialog()"
      >
        Create Bill
      </v-btn>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <v-card class="pa-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Revenue</p>
            <p class="text-2xl font-bold text-green-600">${{ totalRevenue.toFixed(2) }}</p>
          </div>
          <v-icon color="green" size="40">mdi-currency-usd</v-icon>
        </div>
      </v-card>

      <v-card class="pa-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Pending Payments</p>
            <p class="text-2xl font-bold text-yellow-600">${{ pendingAmount.toFixed(2) }}</p>
          </div>
          <v-icon color="yellow" size="40">mdi-clock-outline</v-icon>
        </div>
      </v-card>

      <v-card class="pa-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Overdue</p>
            <p class="text-2xl font-bold text-red-600">${{ overdueAmount.toFixed(2) }}</p>
          </div>
          <v-icon color="red" size="40">mdi-alert-circle</v-icon>
        </div>
      </v-card>

      <v-card class="pa-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Bills</p>
            <p class="text-2xl font-bold text-blue-600">{{ billingRecords.length }}</p>
          </div>
          <v-icon color="blue" size="40">mdi-receipt</v-icon>
        </div>
      </v-card>
    </div>

    <!-- Search and Filter -->
    <v-card>
      <v-card-text>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <v-text-field
            v-model="searchTerm"
            prepend-inner-icon="mdi-magnify"
            label="Search bills..."
            variant="outlined"
            density="compact"
            clearable
          />
          <v-select
            v-model="statusFilter"
            :items="statusOptions"
            label="Filter by status"
            variant="outlined"
            density="compact"
            clearable
          />
          <v-text-field
            v-model="dateFilter"
            type="date"
            label="Filter by date"
            variant="outlined"
            density="compact"
            clearable
          />
          <v-btn
            color="secondary"
            variant="outlined"
            @click="clearFilters"
          >
            Clear Filters
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Billing Records Table -->
    <v-card>
      <v-card-title>
        <span>Billing Records ({{ filteredBillingRecords.length }})</span>
      </v-card-title>
      
      <v-data-table
        :headers="headers"
        :items="filteredBillingRecords"
        :loading="loading"
        :items-per-page="10"
        class="elevation-1"
      >
        <template v-slot:item.amount="{ item }">
          <span class="font-medium">${{ item.amount.toFixed(2) }}</span>
        </template>
        
        <template v-slot:item.paymentStatus="{ item }">
          <v-chip
            :color="getPaymentStatusColor(item.paymentStatus)"
            size="small"
            variant="outlined"
          >
            {{ item.paymentStatus }}
          </v-chip>
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
              @click="viewBilling(item)"
            />
            <v-btn
              icon="mdi-pencil"
              size="small"
              color="warning"
              variant="outlined"
              @click="editBilling(item)"
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
            <v-icon size="48" color="grey-lighten-1">mdi-receipt-text-outline</v-icon>
            <p class="text-gray-500 mt-2">No billing records found</p>
            <v-btn
              color="primary"
              @click="openDialog()"
              class="mt-4"
            >
              Create First Bill
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Billing Dialog -->
    <v-dialog v-model="dialog" max-width="800px" persistent>
      <v-card>
        <v-card-title class="text-h5">
          {{ editingBilling ? 'Edit Billing Record' : 'Create New Bill' }}
        </v-card-title>
        
        <v-card-text>
          <v-form ref="formRef" @submit.prevent="saveBilling">
            <v-container>
              <v-row>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="billingForm.appointmentId"
                    :items="appointmentOptions"
                    :rules="appointmentRules"
                    label="Appointment"
                    variant="outlined"
                    required
                    @update:model-value="updateAppointmentDetails"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="billingForm.patientName"
                    label="Patient Name"
                    variant="outlined"
                    readonly
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="billingForm.billingCode"
                    :rules="billingCodeRules"
                    label="Billing Code"
                    variant="outlined"
                    required
                    placeholder="e.g., CPT-99213"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="billingForm.serviceType"
                    :rules="serviceTypeRules"
                    label="Service Type"
                    variant="outlined"
                    required
                    placeholder="e.g., Office Visit, Surgery"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="billingForm.amount"
                    :rules="amountRules"
                    label="Amount"
                    type="number"
                    step="0.01"
                    variant="outlined"
                    required
                    prefix="$"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="billingForm.paymentStatus"
                    :items="paymentStatusOptions"
                    :rules="paymentStatusRules"
                    label="Payment Status"
                    variant="outlined"
                    required
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
            @click="saveBilling"
            :loading="saving"
          >
            {{ editingBilling ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Billing Dialog -->
    <v-dialog v-model="viewDialog" max-width="600px">
      <v-card v-if="selectedBilling">
        <v-card-title class="text-h5">
          Billing Record Details
        </v-card-title>
        
        <v-card-text>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm font-medium text-gray-600">Patient</p>
                <p class="text-lg">{{ selectedBilling.patientName }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600">Billing Code</p>
                <p class="text-lg">{{ selectedBilling.billingCode }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600">Service Type</p>
                <p class="text-lg">{{ selectedBilling.serviceType }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600">Amount</p>
                <p class="text-lg font-semibold">${{ selectedBilling.amount.toFixed(2) }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600">Payment Status</p>
                <v-chip :color="getPaymentStatusColor(selectedBilling.paymentStatus)" size="small">
                  {{ selectedBilling.paymentStatus }}
                </v-chip>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <p class="font-medium">Created</p>
                <p>{{ formatDate(selectedBilling.createdAt) }}</p>
              </div>
              <div>
                <p class="font-medium">Last Updated</p>
                <p>{{ formatDate(selectedBilling.updatedAt) }}</p>
              </div>
            </div>
          </div>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="warning"
            variant="outlined"
            @click="editBilling(selectedBilling)"
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
          Are you sure you want to delete this billing record for {{ billingToDelete?.patientName }}? This action cannot be undone.
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
            @click="deleteBilling"
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
import { useBillingStore } from '@/stores/billing';
import { useAppointmentsStore } from '@/stores/appointments';
import { useNotificationsStore } from '@/stores/notifications';
import type { BillingRecord, Appointment } from '@/types';

const billingStore = useBillingStore();
const appointmentsStore = useAppointmentsStore();
const notificationsStore = useNotificationsStore();

const dialog = ref(false);
const viewDialog = ref(false);
const deleteDialog = ref(false);
const formRef = ref();
const searchTerm = ref('');
const statusFilter = ref('');
const dateFilter = ref('');
const saving = ref(false);
const deleting = ref(false);
const editingBilling = ref<BillingRecord | null>(null);
const selectedBilling = ref<BillingRecord | null>(null);
const billingToDelete = ref<BillingRecord | null>(null);

const billingForm = ref({
  appointmentId: '',
  patientId: '',
  patientName: '',
  billingCode: '',
  serviceType: '',
  amount: 0,
  paymentStatus: 'pending'
});

const statusOptions = [
  { title: 'All Statuses', value: '' },
  { title: 'Pending', value: 'pending' },
  { title: 'Paid', value: 'paid' },
  { title: 'Overdue', value: 'overdue' },
  { title: 'Cancelled', value: 'cancelled' }
];

const paymentStatusOptions = [
  { title: 'Pending', value: 'pending' },
  { title: 'Paid', value: 'paid' },
  { title: 'Overdue', value: 'overdue' },
  { title: 'Cancelled', value: 'cancelled' }
];

const headers = [
  { title: 'Patient', value: 'patientName', sortable: true },
  { title: 'Billing Code', value: 'billingCode', sortable: true },
  { title: 'Service Type', value: 'serviceType', sortable: true },
  { title: 'Amount', value: 'amount', sortable: true },
  { title: 'Status', value: 'paymentStatus', sortable: true },
  { title: 'Created', value: 'createdAt', sortable: true },
  { title: 'Actions', value: 'actions', sortable: false, width: '150px' }
];

const loading = computed(() => billingStore.loading);
const billingRecords = computed(() => billingStore.billingRecords);
const appointments = computed(() => appointmentsStore.appointments);
const totalRevenue = computed(() => billingStore.getTotalRevenue());
const pendingAmount = computed(() => billingStore.getPendingAmount());
const overdueAmount = computed(() => 
  billingStore.getBillingByStatus('overdue').reduce((sum, bill) => sum + bill.amount, 0)
);

const appointmentOptions = computed(() => 
  appointments.value
    .filter(apt => apt.status === 'completed')
    .map(appointment => ({
      title: `${appointment.patientName} - ${formatDate(appointment.date)} ${appointment.time}`,
      value: appointment.id,
      appointment
    }))
);

const filteredBillingRecords = computed(() => {
  let filtered = billingRecords.value;

  if (searchTerm.value) {
    filtered = billingStore.searchBillingRecords(searchTerm.value);
  }

  if (statusFilter.value) {
    filtered = filtered.filter(bill => bill.paymentStatus === statusFilter.value);
  }

  if (dateFilter.value) {
    const filterDate = new Date(dateFilter.value);
    filtered = filtered.filter(bill => {
      const billDate = new Date(bill.createdAt);
      return billDate.toDateString() === filterDate.toDateString();
    });
  }

  return filtered;
});

// Validation rules
const appointmentRules = [
  (value: string) => !!value || 'Appointment is required'
];

const billingCodeRules = [
  (value: string) => !!value || 'Billing code is required',
  (value: string) => value.length >= 3 || 'Billing code must be at least 3 characters'
];

const serviceTypeRules = [
  (value: string) => !!value || 'Service type is required'
];

const amountRules = [
  (value: number) => !!value || 'Amount is required',
  (value: number) => value > 0 || 'Amount must be greater than 0'
];

const paymentStatusRules = [
  (value: string) => !!value || 'Payment status is required'
];

const openDialog = (billing?: BillingRecord) => {
  if (billing) {
    editingBilling.value = billing;
    billingForm.value = {
      appointmentId: billing.appointmentId,
      patientId: billing.patientId,
      patientName: billing.patientName,
      billingCode: billing.billingCode,
      serviceType: billing.serviceType,
      amount: billing.amount,
      paymentStatus: billing.paymentStatus
    };
  } else {
    editingBilling.value = null;
    billingForm.value = {
      appointmentId: '',
      patientId: '',
      patientName: '',
      billingCode: '',
      serviceType: '',
      amount: 0,
      paymentStatus: 'pending'
    };
  }
  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  editingBilling.value = null;
  if (formRef.value) {
    formRef.value.reset();
  }
};

const saveBilling = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  saving.value = true;
  try {
    if (editingBilling.value) {
      await billingStore.updateBillingRecord(editingBilling.value.id, billingForm.value);
      notificationsStore.success('Billing record updated successfully');
    } else {
      await billingStore.createBillingRecord(billingForm.value);
      notificationsStore.success('Billing record created successfully');
    }
    closeDialog();
  } catch (error) {
    notificationsStore.error('Failed to save billing record');
  } finally {
    saving.value = false;
  }
};

const viewBilling = (billing: BillingRecord) => {
  selectedBilling.value = billing;
  viewDialog.value = true;
};

const editBilling = (billing: BillingRecord) => {
  viewDialog.value = false;
  openDialog(billing);
};

const confirmDelete = (billing: BillingRecord) => {
  billingToDelete.value = billing;
  deleteDialog.value = true;
};

const deleteBilling = async () => {
  if (!billingToDelete.value) return;

  deleting.value = true;
  try {
    await billingStore.deleteBillingRecord(billingToDelete.value.id);
    notificationsStore.success('Billing record deleted successfully');
    deleteDialog.value = false;
    billingToDelete.value = null;
  } catch (error) {
    notificationsStore.error('Failed to delete billing record');
  } finally {
    deleting.value = false;
  }
};

const updateAppointmentDetails = (appointmentId: string) => {
  const option = appointmentOptions.value.find(opt => opt.value === appointmentId);
  if (option) {
    billingForm.value.patientId = option.appointment.patientId;
    billingForm.value.patientName = option.appointment.patientName;
  }
};

const clearFilters = () => {
  searchTerm.value = '';
  statusFilter.value = '';
  dateFilter.value = '';
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'paid': return 'green';
    case 'pending': return 'orange';
    case 'overdue': return 'red';
    case 'cancelled': return 'grey';
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
    billingStore.fetchBillingRecords(),
    appointmentsStore.fetchAppointments()
  ]);
});
</script>