# CareNest — Google Play Store Listing & Publishing Kit

This document provides all required metadata, descriptions, graphics, and build instructions for publishing **CareNest** to the Google Play Store, as well as producing an installable `.apk` file for testing.

---

## 1. Important: `.apk` vs `.aab` for Google Play Store

> **Crucial Google Play Requirement:**
> Since August 1, 2021, Google Play Console **strictly requires Android App Bundle (`.aab`)** for publishing new apps. Google Play rejects `.apk` uploads for production releases.
>
> - **`.aab` (Android App Bundle)**: Upload this to the Google Play Console.
> - **`.apk` (Android Package)**: Use this for direct sideloading and installing on physical Android devices for testing.

Both formats can be produced using either **EAS Build** (cloud) or **Android Studio / Gradle** (local).

---

## 2. Store Listing Metadata

### App Details (English)
- **App Name** *(max 30 characters)*:
  `CareNest - Babysitter Booking`
- **Short Description** *(max 80 characters)*:
  `Find and book babysitters and caregivers with transparent profiles and reviews.`
- **Full Description** *(max 4000 characters)*:
```
CareNest is a community marketplace app designed to help families find, connect with, and book local babysitters and caregivers. Whether you are a parent looking for childcare assistance or a caregiver offering your babysitting services, CareNest provides a dedicated platform to coordinate bookings, manage schedules, and communicate preferences.

WHAT YOU CAN DO WITH CARENEST:

FOR PARENTS AND FAMILIES:
• Browse Caregiver Profiles: View available babysitters and caregivers with detailed profiles, experience summaries, bios, photos, and hourly rates.
• Filter and Search: Narrow down search results by location, city, availability, and specific services offered (childcare, tutoring, meal prep, or general home assistance).
• Submit Booking Requests: Select your preferred caregiver, choose booking dates, set start and end times, and add specific instructions or care notes.
• Track Booking Status: Follow the status of your requests in real-time (Pending, Confirmed, Completed, or Cancelled).
• Ratings and Community Feedback: Read reviews and ratings from other families to make informed decisions for your household.

FOR CAREGIVERS AND BABYSITTERS:
• Profile Management: Create a detailed caregiver profile showcasing your experience, qualifications, languages spoken, and bio.
• Set Your Availability & Rates: Define your hourly rates and specify the services you provide.
• Manage Incoming Bookings: Receive and review booking requests from families, with the ability to accept or decline based on your schedule.
• Track Your Schedule: Keep all your upcoming and past bookings organized in one central dashboard.

ADDITIONAL APP FEATURES:
• Bilingual Interface: Full native support for both English and Arabic with complete Right-to-Left (RTL) navigation.
• In-App Notifications: Receive timely updates regarding booking status changes and important account alerts.
• User Account Controls: Easily manage your profile details, password, and account preferences directly within the app settings.

CareNest makes family care scheduling transparent, organized, and straightforward.
```

---

### App Details (Arabic / العربية)
- **اسم التطبيق** *(بحد أقصى 30 حرفاً)*:
  `كير نست - حجز جليسات الأطفال`
- **الوصف القصير** *(بحد أقصى 80 حرفاً)*:
  `ابحث عن جليسات الأطفال ومقدمات الرعاية وتواصل معهن لحجز المواعيد بسهولة.`
- **الوصف الكامل** *(بحد أقصى 4000 حرف)*:
```
تطبيق كير نست (CareNest) هو منصة مخصصة لمساعدة العائلات في البحث عن جليسات الأطفال ومقدمات الرعاية المحليات والتواصل معهن وحجز خدماتهن. يوفر التطبيق تجربة منظمة ومريحة للتنسيق بين أولياء الأمور ومقدمات الرعاية وإدارة المواعيد بكل شفافية.

ما الذي يمكنك القيام به عبر تطبيق كير نست:

لأولياء الأمور والعائلات:
• تصفح الملفات الشخصية: استعراض جليسات الأطفال المتاحات مع تفاصيل الخبرات السابقة، النبذة التعريفية، الصور، وأسعار الساعة.
• البحث والتصفية: إمكانية تصفية النتائج حسب المدينة، النطاق الجغرافي، التوفر، والخدمات المطلوبة (رعاية أطفال، مساعدة في الواجبات المدرسية، تحضير وجبات، أو المساعدة المنزلية).
• إرسال طلبات الحجز: اختيار مقدمة الرعاية المناسبة، وتحديد التاريخ، ووقت البدء والانتهاء، وإضافة أي ملاحظات أو تعليمات خاصة.
• متابعة حالة الحجوزات: متابعة حالة كل طلب مباشرة (قيد الانتظار، مؤكد، مكتمل، أو ملغي).
• التقييمات والآراء: قراءة تجارب وتقييمات العائلات السابقة للمساعدة في اختيار الأنسب لمنزلك.

لمقدمات الرعاية وجليسات الأطفال:
• إدارة الملف الشخصي: إنشاء ملف تعريفي يوضح الخبرات، المؤهلات، اللغات، ونبذة شخصية.
• تحديد الأسعار والخدمات: تحديد السعر بالساعة ونوعية الخدمات المقدمة وفقاً لتخصصك.
• استقبال وإدارة الطلبات: استلام طلبات الحجز من العائلات مع إمكانية قبول الطلب أو رفضه بحسب جدولك.
• تنظيم المواعيد: لوحة تحكم تعرض الحجوزات القادمة والسابقة بطريقة منظمة وواضحة.

مميزات إضافية في التطبيق:
• واجهة ثنائية اللغة: دعم كامل للغتين العربية والإنجليزية مع دعم متكامل للاتجاه من اليمين إلى اليسار (RTL).
• تنبيهات وإشعارات: إشعارات فورية عند تحديث حالة الحجز أو وصول تنبيهات متعلقة بالحساب.
• تحكم كامل بالحساب: إمكانية تعديل البيانات الشخصية، كلمة المرور، وإعدادات الحساب بسهولة داخل التطبيق.

يهدف كير نست إلى جعل تنسيق الرعاية الأسرية تجربة آمنة ومنظمة وسهلة للجميع.
```

---

## 3. Store Categorization & Contact Details

- **Package Name (Application ID)**: `com.carenestbooking.app`
- **Version Code**: `2`
- **Version Name**: `1.0.0`
- **Category**: `Parenting` (Alternative: `Lifestyle` / `Family`)
- **Tags**: `Babysitter`, `Child Care`, `Nanny`, `Family`, `Parenting`, `Home Care`
- **Target Audience**: Families, Parents, Adults (18+)
- **Developer / Contact Email**: `dinamansour2000@gmail.com`
- **Official Website**: `https://dmansour2000.github.io`
- **Privacy Policy URL**: `https://dmansour2000.github.io/#/privacy` (or `https://dmansour2000.github.io/#/policies`)

---

## 4. Google Play Store Assets

All store graphic assets are saved in `mobile/store-assets/`:

| Asset Type | File Path | Dimensions | Requirements |
|---|---|---|---|
| **App Icon** | `mobile/store-assets/icon-512.png` | 512 x 512 px | 32-bit PNG, max 1024 KB |
| **Feature Graphic** | `mobile/store-assets/feature-graphic.png` | 1024 x 500 px | PNG / JPEG, max 15 MB |
| **Screenshot 1** | `mobile/store-assets/screenshots/01-browse-caregivers.png` | 1080 x 2254 px | Phone portrait screenshot |
| **Screenshot 2** | `mobile/store-assets/screenshots/02-caregiver-profile-details.png` | 1080 x 2079 px | Profile & pricing details |
| **Screenshot 3** | `mobile/store-assets/screenshots/03-caregiver-registration.png` | 1080 x 2113 px | Caregiver registration |
| **Screenshot 4** | `mobile/store-assets/screenshots/04-view-profile-screen.png` | 1080 x 2113 px | Verified credentials view |
| **Screenshot 5** | `mobile/store-assets/screenshots/05-google-oauth-flow.png` | 1080 x 2171 px | Secure Google OAuth sign-in |

---

## 5. How to Produce the `.apk` & `.aab` Files

### Method 1: Using EAS Build (Recommended & Easiest)
EAS Build creates the binaries in the Expo Cloud with signed certificates and zero local configuration.

1. Install EAS CLI and login to your Expo account:
   ```bash
   npm install -g eas-cli
   eas login
   ```
2. **To produce the `.apk` file** (for direct installation on Android devices):
   ```bash
   cd mobile
   eas build -p android --profile preview
   ```
   *EAS will generate a direct download link for the `.apk` file.*

3. **To produce the `.aab` file** (for Google Play Console upload):
   ```bash
   cd mobile
   eas build -p android --profile production
   ```
   *EAS will generate the signed `.aab` bundle ready to upload to Google Play.*

---

### Method 2: Using Android Studio on your Mac
Since Android Studio is already installed on your Mac, you can build both locally:

1. Open **Android Studio**.
2. Click **Open** and select the directory:
   `/Users/dinamansour/Desktop/babysitterapp/mobile/android`
3. Wait for the initial Gradle sync to complete.
4. **To build the `.apk` file**:
   - Menu: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
   - Once finished, Android Studio displays a notification with a **locate** link to the `.apk` file:
     `mobile/android/app/build/outputs/apk/debug/app-debug.apk`
5. **To build the `.aab` bundle for Google Play**:
   - Menu: **Build > Generate Signed Bundle / APK**.
   - Select **Android App Bundle** and click **Next**.
   - Choose or create a new Keystore (remember your password and alias).
   - Select **release** destination and click **Create**.
   - The signed `.aab` bundle will be generated in:
     `mobile/android/app/release/app-release.aab`

---

## 6. Data Safety Disclosures (Google Play Questionnaire)

When completing the **Data safety** section in Google Play Console:

| Data Type | Collected | Purpose | Shared with 3rd Parties? |
|---|---|---|---|
| **Name** | Yes | App functionality (Account management) | No |
| **Email address** | Yes | Account authentication & recovery | No |
| **Photos / Videos** | Yes (Optional) | Profile photo & verification documents | No |
| **Device or other IDs** | Yes | Advertising (Google AdMob SDK) | Google AdMob only |

- **Is data encrypted in transit?** Yes (all API endpoints use HTTPS/TLS).
- **Can users request data deletion?** Yes (via in-app account management and contact email).

