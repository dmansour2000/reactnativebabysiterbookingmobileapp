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
  `Book trusted, verified babysitters and caregivers for your family with ease.`
- **Full Description** *(max 4000 characters)*:
```
CareNest connects families with certified, trustworthy babysitters and caregivers. Whether you need reliable childcare, elderly support, cooking, or home assistance, CareNest offers a secure and seamless booking experience.

KEY FEATURES:

👶 Verified Caregivers & Moderation
Every caregiver undergoes identity verification, including national ID and background checks before profile approval. Review credentials, ratings, and bios with full transparency.

📅 Instant & Flexible Bookings
Browse verified babysitters by location, availability, hourly rates, and specialized services (pediatric care, elderly support, meal preparation, housekeeping). Submit booking requests directly with custom dates, timings, and notes.

⭐ Ratings & Verified Reviews
Read real experiences and reviews left by other families to choose the perfect caregiver for your home.

🔔 Real-Time Notifications
Receive instant status updates when your booking request is accepted, updated, or completed.

🛡️ Community Trust & Safety Reporting
CareNest enforces a zero-tolerance policy for safety violations. Users can securely submit confidential incident reports with supporting documentation directly to platform administrators.

🌐 Bilingual Experience
Full support for both Arabic and English with seamless Right-to-Left (RTL) navigation and language switching.

Download CareNest today and experience trusted, professional family care at your fingertips!
```

---

### App Details (Arabic / العربية)
- **اسم التطبيق** *(بحد أقصى 30 حرفاً)*:
  `كير نست - حجز جليسات الأطفال`
- **الوصف القصير** *(بحد أقصى 80 حرفاً)*:
  `احجز جليسات أطفال ومقدمات رعاية موثوقات ومعتمدات لعائلتك بسهولة وأمان.`
- **الوصف الكامل** *(بحد أقصى 4000 حرف)*:
```
تطبيق كير نست (CareNest) يربط العائلات بنخبة من أفضل جليسات الأطفال ومقدمات الرعاية الموثوقات والمعتمدات. سواء كنت تبحثين عن رعاية أطفال موثوقة، رعاية كبار السن، المساعدة المنزلية أو الطبخ، يوفر كير نست تجربة حجز آمنة وسلسة.

أبرز مميزات التطبيق:

👶 جليسات معتمدات ومراجعة شاملة
تخضع جميع مقدمات الرعاية لفحص دقيق للوثائق الرسمية وبطاقات الهوية قبل اعتماد الحسابات. يمكنك الاطلاع على الملف الشخصي، التقييمات، والنبذة التعريفية بكل شفافية.

📅 حجز فوري ومرن
تصفح الجليسات المتاحات حسب المدينة، السعر، والخدمات المطلوبة (مجالسة أطفال، رعاية مسنين، تحضير وجبات، نظافة منزلية). أرسل طلب الحجز بمرونة تامة مع تحديد التواريخ والملاحظات الخاصة.

⭐ تقييمات وآراء حقيقية
اطلع على آراء وتجارب الأسر السابقة مع كل جليسة لتختاري الأنسب لأطفالك وعائلتك بكل راحة بال.

🔔 إشعارات وتنبيهات فورية
تابعي حالة طلبات الحجز أولاً بأول فور قبولها أو تحديثها من قبل مقدمة الرعاية.

🛡️ أمان المجتمع وسجل الملاحظات
يلتزم كير نست بأعلى معايير السلامة والأمان، مع إمكانية تقديم بلاغات سرية وموثقة لفريق الإدارة مباشرة لضمان حماية جميع أفراد المجتمع.

🌐 دعم كامل للغتين العربية والإنجليزية
واجهة مصممة خصيصاً لتناسب المستخدم العربي مع دعم كامل للاتجاه من اليمين إلى اليسار (RTL) والتبديل الفوري بين اللغتين.

حملي كير نست الآن واستمتعي برعاية آمنة وموثوقة لعائلتك في أي وقت!
```

---

## 3. Store Categorization & Contact Details

- **Package Name (Application ID)**: `com.carenestbooking.app`
- **Version Code**: `1`
- **Version Name**: `1.0.0`
- **Category**: `Parenting` (Alternative: `Lifestyle` / `Family`)
- **Tags**: `Babysitter`, `Child Care`, `Nanny`, `Family`, `Parenting`, `Home Care`
- **Target Audience**: Families, Parents, Adults (18+)
- **Developer / Contact Email**: `dinamansour2000@gmail.com`
- **Official Website**: `https://dmansour2000.github.io`
- **Privacy Policy URL**: `https://dmansour2000.github.io/#/policies`

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

