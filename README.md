# CareNest Mobile App (iOS & Android)

A cross-platform React Native (Expo) mobile application for **CareNest**, matching the design system, colors, and user experience of the CareNest web frontend.

  <p>
   <img src="https://github.com/dmansour2000/reactnativebabysiterbookingmobileapp/blob/main/store-assets/screenshots/01-home-screen-en.png", width="150" hspace="4"/>
   </p>
---

## Features

- **Caregiver Directory & Search:**
  - Real-time search across names, bio keywords, and cities.
  - Multi-select filters for Egyptian cities (Cairo, Giza, Alexandria, Mansoura, Tanta).
  - Service filter chips (Babysitting, Childcare, Cleaning, Cooking).
  - Availability indicators ("Available Now" vs "Currently Busy").
  - Detailed profiles with ratings, experience, verified credentials, and hourly rates.

- **Booking Flow & Scheduling:**
  - Direct booking form with date, start time, end time, service type, and address.
  - Real-time estimated cost calculation.
  - Multi-state booking management (Pending, Confirmed, Completed, Cancelled).
  - Caregiver booking acceptance and family cancellation support.

- **Community Safety & Incident Reports:**
  - Public directory of verified safety reports.
  - In-app reporting form with name, national ID, incident date, and factual descriptions.

- **Account & Security:**
  - Dual registration: Family accounts vs Caregiver accounts.
  - Full authentication with JWT session persistence using `@react-native-async-storage/async-storage`.
  - In-app password change and email updates.
  - Password recovery flow powered by the CareNest backend mailer.
  - Caregiver instant availability toggle switch.

- **Side Menu Navigation & Top Menu Button:**
  - Responsive, animated slide-out Side Menu triggered by the menu button (`☰`) at the top of every screen.
  - Quick navigation to Caregiver Search, Bookings, Safety Warnings, and Account Profile.
  - Shows authenticated user dossier, avatar, and quick sign-in / registration for guests.

- **Bilingual with Arabic as Default:**
  - **Default language is Arabic (`ar`)** across the entire app with proper RTL layout alignment.
  - Language can be toggled at any time between **العربية** and **English** using the dedicated language switcher button directly inside the Side Menu.

- **Backend API Integration:**
  - Fully integrated with the live CareNest backend:
    `https://nodejsbabysitterbookingplatformbackend.onrender.com`
  - All network requests automatically authenticate with JWT tokens via `x-auth-token` headers.

---

## Directory Structure

```text
mobile/
├── assets/                  # App icons, splash screens, and images
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Badge.js         # Status and service tag pills
│   │   ├── Button.js        # Plum & outline action buttons
│   │   ├── Card.js          # Translucent rounded cards
│   │   ├── Header.js        # CareNest brand header with language toggle
│   │   ├── Input.js         # LTR/RTL text inputs
│   │   └── ScreenWrapper.js # Signature gradient background container
│   ├── context/
│   │   └── AuthContext.js   # User session, JWT persistence, login & register
│   ├── locales/
│   │   └── index.js         # English & Arabic bilingual dictionary & context
│   ├── navigation/
│   │   └── AppNavigator.js  # Bottom tabs (Explore, Bookings, Safety, Profile) & Stacks
│   ├── screens/
│   │   ├── ExploreScreen.js          # Sitter search & marketplace
│   │   ├── CaregiverDetailsScreen.js # Detailed sitter profile
│   │   ├── BookCaregiverScreen.js    # Booking appointment request form
│   │   ├── BookingsScreen.js         # Scheduled bookings list & actions
│   │   ├── BlacklistScreen.js        # Safety reports & incident filing
│   │   ├── ProfileScreen.js          # Account info, security, & sitter controls
│   │   ├── LoginScreen.js            # User sign in
│   │   ├── RegisterScreen.js         # Family & Caregiver sign up
│   │   └── ForgotPasswordScreen.js   # Recovery link dispatch
│   ├── services/
│   │   └── api.js           # API client with token injection & error handling
│   └── theme/
│       └── index.js         # CareNest color palette, radius, spacing, shadows
├── App.js                   # Application root with providers
├── app.json                 # Expo project configuration
└── package.json
```

---

## How to Run Locally

### 1. Prerequisites
Ensure you have Node.js (>= 18) installed on your machine.

### 2. Install Dependencies (if not already installed)
```bash
cd mobile
npm install
```

### 3. Start the Development Server
```bash
npm start
```
This boots the Expo CLI and displays an interactive QR code in your terminal.

### 4. Running on Devices

- **Physical iOS or Android Device:**
  1. Download the free **Expo Go** app from the [App Store](https://apps.apple.com/app/expo-go/id982107779) (iOS) or [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) (Android).
  2. Scan the QR code displayed in the terminal with your phone camera (iOS) or the Expo Go app (Android).

- **iOS Simulator (macOS):**
  Press `i` in the terminal to launch on the iOS Simulator.

- **Android Emulator:**
  Press `a` in the terminal to launch on the Android Emulator.

- **Web Browser (Preview):**
  Press `w` in the terminal to test the React Native layout in your web browser.
