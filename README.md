# Medical Billing & Scheduling Web Application

A comprehensive medical billing and scheduling web application built with Vue.js 3, TypeScript, Firebase, and Tailwind CSS. This application provides a complete solution for healthcare providers to manage patients, schedule appointments, and handle billing records.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure login/signup with Firebase Authentication
- **Patient Management**: Complete CRUD operations for patient records
- **Appointment Scheduling**: Schedule, view, edit, and cancel appointments
- **Billing Management**: Create and manage billing records linked to appointments
- **Dashboard**: Overview with statistics and upcoming appointments
- **Search & Filtering**: Advanced filtering for appointments and billing records

### Additional Features
- **Responsive Design**: Mobile-friendly interface using Vuetify and Tailwind CSS
- **Real-time Notifications**: Success/error messages for user actions
- **Email Reminders**: Automated appointment reminders via Firebase Cloud Functions
- **Data Validation**: Form validation with error handling
- **Firebase Security**: Secure Firestore rules and authentication

## 🛠️ Tech Stack

- **Frontend**: Vue.js 3, TypeScript, Composition API
- **UI Framework**: Vuetify + Tailwind CSS
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **Backend**: Firebase (Authentication, Firestore, Cloud Functions)
- **Build Tool**: Vite
- **Email Service**: Nodemailer with Gmail SMTP

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project (free tier is sufficient)
- Gmail account for email services (optional)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone [your-repo-url]
cd medical-billing-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

#### Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication, Firestore, and Cloud Functions

#### Configure Firebase
1. In your Firebase project, go to Project Settings
2. Add a web app and copy the configuration
3. Update `src/firebase/config.ts` with your Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

#### Initialize Firebase in Your Project

```bash
firebase login
firebase init
```

Select:
- Firestore
- Functions
- Hosting

### 4. Firestore Setup

#### Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

#### Authentication Setup
1. In Firebase Console, go to Authentication > Sign-in method
2. Enable Email/Password provider

### 5. Cloud Functions Setup (Optional - for Email Reminders)

#### Install Functions Dependencies
```bash
cd functions
npm install
cd ..
```

#### Configure Email Service
```bash
# Set up Gmail credentials for Cloud Functions
firebase functions:config:set gmail.email="your-gmail@gmail.com" gmail.password="your-app-password"
```

**Note**: Use Gmail App Password, not your regular password. Enable 2FA and generate an app password.

#### Deploy Functions
```bash
firebase deploy --only functions
```

### 6. Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🔐 Demo Credentials

For testing purposes, you can use these demo credentials or create a new account:

```
Email: demo@medical-billing.com
Password: demo123456
```

## 📊 Sample Data

To populate the database with sample data, you can use the built-in seeder. After setting up Firebase and starting the application:

1. Login to the application
2. Open browser console
3. Run the seeder (this would need to be implemented as a development tool)

## 🏗️ Project Structure

```
src/
├── components/          # Reusable Vue components
├── views/              # Page components
├── stores/             # Pinia stores for state management
├── firebase/           # Firebase configuration and services
├── types/              # TypeScript type definitions
├── router/             # Vue Router configuration
└── assets/             # Static assets and styles

functions/              # Firebase Cloud Functions
├── src/
│   └── index.ts       # Cloud Functions code
└── package.json

firestore.rules         # Firestore security rules
firestore.indexes.json  # Firestore indexes
firebase.json          # Firebase configuration
```

## 📱 Key Components

### Authentication
- Login/Signup with email and password
- Protected routes with navigation guards
- User session management

### Patient Management
- Add new patients with comprehensive information
- Edit existing patient records
- Search and filter patients
- Delete patients with confirmation

### Appointment Scheduling
- Schedule appointments with date/time selection
- Link appointments to patients and doctors
- Filter appointments by doctor, date, or patient
- Update appointment status

### Billing System
- Create billing records for completed appointments
- Common billing codes reference
- Payment status tracking
- Revenue and pending payment analytics

### Dashboard
- Statistics overview (today's appointments, total patients, revenue)
- Upcoming appointments preview
- Recent billing activity
- Quick action buttons

## 🔒 Security Features

### Firestore Security Rules
- User authentication required for all operations
- Read/write permissions based on user authentication
- Secure data access patterns

### Input Validation
- Frontend form validation with real-time feedback
- TypeScript for type safety
- Sanitized data handling

## 📧 Email Reminders

The application includes automated email reminders:

- **Appointment Reminders**: Sent 24 hours before scheduled appointments
- **Welcome Emails**: Sent when new patients are created
- **Manual Triggers**: Admin can manually trigger reminder emails

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
```

### Deploy Everything
```bash
firebase deploy
```

## 🧪 Testing

The application includes form validation and error handling. For testing:

1. Try creating patients with invalid data
2. Schedule overlapping appointments
3. Test filtering and search functionality
4. Verify email notifications (if configured)

## 📝 Environment Variables

Create a `.env` file for environment-specific configurations:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
# ... other Firebase config
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the browser console for errors
2. Verify Firebase configuration
3. Ensure all dependencies are installed
4. Check Firebase project permissions

## 🔮 Future Enhancements

- [ ] Insurance claim management
- [ ] Prescription management
- [ ] Patient portal for self-service
- [ ] Advanced reporting and analytics
- [ ] Integration with medical devices
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Automated backups

## 📞 Contact

For questions or support, please contact [your-email@example.com]

---

Built with ❤️ using Vue.js and Firebase