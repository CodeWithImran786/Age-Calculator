import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

admin.initializeApp();

// Configure your email transporter (Gmail example)
const gmailEmail = functions.config().gmail?.email;
const gmailPassword = functions.config().gmail?.password;

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword
  }
});

// Scheduled function to send appointment reminders
export const sendAppointmentReminders = functions.pubsub
  .schedule('every 24 hours')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    try {
      // Get appointments for tomorrow
      const appointmentsSnapshot = await admin
        .firestore()
        .collection('appointments')
        .where('date', '>=', tomorrow)
        .where('date', '<', dayAfterTomorrow)
        .where('status', '==', 'scheduled')
        .get();

      const reminderPromises: Promise<any>[] = [];

      appointmentsSnapshot.forEach((doc) => {
        const appointment = doc.data();
        
        // Get patient details to send email
        const patientPromise = admin
          .firestore()
          .collection('patients')
          .doc(appointment.patientId)
          .get()
          .then((patientDoc) => {
            if (patientDoc.exists) {
              const patient = patientDoc.data();
              return sendReminderEmail(appointment, patient);
            }
          });

        reminderPromises.push(patientPromise);
      });

      await Promise.all(reminderPromises);
      
      functions.logger.info(`Sent ${reminderPromises.length} appointment reminders`);
      return null;
    } catch (error) {
      functions.logger.error('Error sending appointment reminders:', error);
      throw error;
    }
  });

// Function to send individual reminder email
async function sendReminderEmail(appointment: any, patient: any) {
  if (!patient?.email || !gmailEmail) {
    functions.logger.warn('Missing email configuration or patient email');
    return;
  }

  const appointmentDate = appointment.date.toDate();
  const formattedDate = appointmentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const mailOptions = {
    from: `Medical Billing System <${gmailEmail}>`,
    to: patient.email,
    subject: 'Appointment Reminder - Tomorrow',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Appointment Reminder</h2>
        
        <p>Dear ${patient.name},</p>
        
        <p>This is a friendly reminder that you have an appointment scheduled for <strong>tomorrow</strong>.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1f2937;">Appointment Details</h3>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${appointment.time}</p>
          <p><strong>Doctor:</strong> ${appointment.doctorName}</p>
          <p><strong>Reason:</strong> ${appointment.reason}</p>
        </div>
        
        <p><strong>Important reminders:</strong></p>
        <ul>
          <li>Please arrive 15 minutes early for check-in</li>
          <li>Bring a valid photo ID and insurance card</li>
          <li>Bring a list of current medications</li>
          <li>If you need to cancel or reschedule, please call us at least 24 hours in advance</li>
        </ul>
        
        <p>If you have any questions or need to reschedule, please contact our office.</p>
        
        <p>Thank you,<br>
        Medical Billing System</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #6b7280;">
          This is an automated reminder. Please do not reply to this email.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    functions.logger.info(`Reminder email sent to ${patient.email} for appointment on ${formattedDate}`);
  } catch (error) {
    functions.logger.error(`Failed to send reminder email to ${patient.email}:`, error);
    throw error;
  }
}

// HTTP function to manually trigger reminder emails (for testing)
export const triggerAppointmentReminders = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    await sendAppointmentReminders.run(context as any);
    return { success: true, message: 'Reminder emails triggered successfully' };
  } catch (error) {
    functions.logger.error('Error triggering reminder emails:', error);
    throw new functions.https.HttpsError('internal', 'Failed to trigger reminder emails');
  }
});

// Function to send welcome email when new patient is created
export const sendWelcomeEmail = functions.firestore
  .document('patients/{patientId}')
  .onCreate(async (snap, context) => {
    const patient = snap.data();
    
    if (!patient?.email || !gmailEmail) {
      functions.logger.warn('Missing email configuration or patient email');
      return;
    }

    const mailOptions = {
      from: `Medical Billing System <${gmailEmail}>`,
      to: patient.email,
      subject: 'Welcome to Our Medical Practice',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Welcome to Our Practice!</h2>
          
          <p>Dear ${patient.name},</p>
          
          <p>Welcome to our medical practice! We're excited to have you as a new patient.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">Your Patient Information</h3>
            <p><strong>Name:</strong> ${patient.name}</p>
            <p><strong>Age:</strong> ${patient.age} years</p>
            <p><strong>Phone:</strong> ${patient.phone}</p>
            <p><strong>Email:</strong> ${patient.email}</p>
          </div>
          
          <p>Our team is committed to providing you with the highest quality healthcare. If you have any questions or need to schedule an appointment, please don't hesitate to contact us.</p>
          
          <p>Thank you for choosing our practice!</p>
          
          <p>Best regards,<br>
          Medical Billing System</p>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      functions.logger.info(`Welcome email sent to new patient: ${patient.email}`);
    } catch (error) {
      functions.logger.error(`Failed to send welcome email to ${patient.email}:`, error);
    }
  });