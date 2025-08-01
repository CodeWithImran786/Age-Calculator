<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <v-btn
        icon="mdi-arrow-left"
        variant="outlined"
        @click="$router.back()"
      />
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Create Bill for Appointment</h1>
        <p class="text-gray-600" v-if="appointment">
          {{ appointment.patientName }} - {{ formatDate(appointment.date) }} {{ appointment.time }}
        </p>
      </div>
    </div>

    <!-- Appointment Details Card -->
    <v-card v-if="appointment">
      <v-card-title>Appointment Details</v-card-title>
      <v-card-text>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p class="text-sm font-medium text-gray-600">Patient</p>
            <p class="text-lg">{{ appointment.patientName }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-600">Doctor</p>
            <p class="text-lg">{{ appointment.doctorName }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-600">Date & Time</p>
            <p class="text-lg">{{ formatDate(appointment.date) }} {{ appointment.time }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-600">Status</p>
            <v-chip :color="getStatusColor(appointment.status)" size="small">
              {{ appointment.status }}
            </v-chip>
          </div>
        </div>
        <div class="mt-4">
          <p class="text-sm font-medium text-gray-600">Reason for Visit</p>
          <p class="text-lg">{{ appointment.reason }}</p>
        </div>
      </v-card-text>
    </v-card>

    <!-- Existing Billing Record -->
    <v-card v-if="existingBilling">
      <v-card-title class="flex items-center justify-between">
        <span>Existing Billing Record</span>
        <v-btn
          color="warning"
          variant="outlined"
          @click="editExistingBilling"
        >
          Edit
        </v-btn>
      </v-card-title>
      <v-card-text>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p class="text-sm font-medium text-gray-600">Billing Code</p>
            <p class="text-lg">{{ existingBilling.billingCode }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-600">Service Type</p>
            <p class="text-lg">{{ existingBilling.serviceType }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-600">Amount</p>
            <p class="text-lg font-semibold">${{ existingBilling.amount.toFixed(2) }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-600">Payment Status</p>
            <v-chip :color="getPaymentStatusColor(existingBilling.paymentStatus)" size="small">
              {{ existingBilling.paymentStatus }}
            </v-chip>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Billing Form -->
    <v-card v-if="!existingBilling || editing">
      <v-card-title>
        {{ editing ? 'Edit Billing Record' : 'Create New Billing Record' }}
      </v-card-title>
      <v-card-text>
        <v-form ref="formRef" @submit.prevent="saveBilling">
          <v-container>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="billingForm.billingCode"
                  :rules="billingCodeRules"
                  label="Billing Code"
                  variant="outlined"
                  required
                  placeholder="e.g., CPT-99213, ICD-Z00.00"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="billingForm.serviceType"
                  :rules="serviceTypeRules"
                  label="Service Type"
                  variant="outlined"
                  required
                  placeholder="e.g., Office Visit, Consultation"
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
          v-if="editing"
          color="grey"
          variant="outlined"
          @click="cancelEdit"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          @click="saveBilling"
          :loading="saving"
        >
          {{ editing ? 'Update' : 'Create' }} Bill
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Common Billing Codes Reference -->
    <v-card>
      <v-card-title>Common Billing Codes Reference</v-card-title>
      <v-card-text>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="code in commonBillingCodes"
            :key="code.code"
            class="border rounded-lg p-3 cursor-pointer hover:bg-gray-50"
            @click="selectBillingCode(code)"
          >
            <div class="flex justify-between items-start">
              <div>
                <p class="font-medium">{{ code.code }}</p>
                <p class="text-sm text-gray-600">{{ code.description }}</p>
              </div>
              <p class="text-sm font-medium">${{ code.amount }}</p>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAppointmentsStore } from '@/stores/appointments';
import { useBillingStore } from '@/stores/billing';
import { useNotificationsStore } from '@/stores/notifications';
import type { Appointment, BillingRecord } from '@/types';

interface BillingCode {
  code: string;
  description: string;
  serviceType: string;
  amount: number;
}

const route = useRoute();
const router = useRouter();
const appointmentsStore = useAppointmentsStore();
const billingStore = useBillingStore();
const notificationsStore = useNotificationsStore();

const formRef = ref();
const saving = ref(false);
const editing = ref(false);
const appointment = ref<Appointment | null>(null);
const existingBilling = ref<BillingRecord | null>(null);

const billingForm = ref({
  billingCode: '',
  serviceType: '',
  amount: 0,
  paymentStatus: 'pending'
});

const paymentStatusOptions = [
  { title: 'Pending', value: 'pending' },
  { title: 'Paid', value: 'paid' },
  { title: 'Overdue', value: 'overdue' },
  { title: 'Cancelled', value: 'cancelled' }
];

const commonBillingCodes: BillingCode[] = [
  { code: 'CPT-99213', description: 'Office Visit - Established Patient', serviceType: 'Office Visit', amount: 150.00 },
  { code: 'CPT-99214', description: 'Office Visit - Detailed', serviceType: 'Office Visit', amount: 200.00 },
  { code: 'CPT-99215', description: 'Office Visit - Comprehensive', serviceType: 'Office Visit', amount: 250.00 },
  { code: 'CPT-99203', description: 'New Patient Visit - Detailed', serviceType: 'Office Visit', amount: 220.00 },
  { code: 'CPT-99204', description: 'New Patient Visit - Comprehensive', serviceType: 'Office Visit', amount: 280.00 },
  { code: 'CPT-90837', description: 'Psychotherapy - 60 minutes', serviceType: 'Therapy', amount: 180.00 },
  { code: 'CPT-93000', description: 'Electrocardiogram', serviceType: 'Diagnostic', amount: 75.00 },
  { code: 'CPT-36415', description: 'Venipuncture', serviceType: 'Laboratory', amount: 25.00 },
  { code: 'CPT-81000', description: 'Urinalysis', serviceType: 'Laboratory', amount: 30.00 }
];

// Validation rules
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

const appointmentId = computed(() => route.params.id as string);

const saveBilling = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  if (!appointment.value) return;

  saving.value = true;
  try {
    const billingData = {
      appointmentId: appointment.value.id,
      patientId: appointment.value.patientId,
      patientName: appointment.value.patientName,
      ...billingForm.value
    };

    if (editing.value && existingBilling.value) {
      await billingStore.updateBillingRecord(existingBilling.value.id, billingData);
      notificationsStore.success('Billing record updated successfully');
      existingBilling.value = { ...existingBilling.value, ...billingData };
      editing.value = false;
    } else {
      const id = await billingStore.createBillingRecord(billingData);
      notificationsStore.success('Billing record created successfully');
      // Fetch the created billing record
      existingBilling.value = await billingStore.getBillingByAppointmentId(appointment.value.id);
    }
  } catch (error) {
    notificationsStore.error('Failed to save billing record');
  } finally {
    saving.value = false;
  }
};

const editExistingBilling = () => {
  if (existingBilling.value) {
    billingForm.value = {
      billingCode: existingBilling.value.billingCode,
      serviceType: existingBilling.value.serviceType,
      amount: existingBilling.value.amount,
      paymentStatus: existingBilling.value.paymentStatus
    };
    editing.value = true;
  }
};

const cancelEdit = () => {
  editing.value = false;
  billingForm.value = {
    billingCode: '',
    serviceType: '',
    amount: 0,
    paymentStatus: 'pending'
  };
};

const selectBillingCode = (code: BillingCode) => {
  billingForm.value.billingCode = code.code;
  billingForm.value.serviceType = code.serviceType;
  billingForm.value.amount = code.amount;
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
  try {
    // Load the appointment
    await appointmentsStore.fetchAppointments();
    appointment.value = appointmentsStore.getAppointmentById(appointmentId.value) || null;
    
    if (!appointment.value) {
      notificationsStore.error('Appointment not found');
      router.push('/appointments');
      return;
    }

    // Check if billing record already exists
    existingBilling.value = await billingStore.getBillingByAppointmentId(appointmentId.value);
  } catch (error) {
    notificationsStore.error('Failed to load appointment details');
    router.push('/appointments');
  }
});
</script>