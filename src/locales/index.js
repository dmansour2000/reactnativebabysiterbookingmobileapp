import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

const translations = {
  en: {
    appName: 'CareNest',
    tagline: 'Connecting Families with Verified Caregivers',
    welcome: 'Welcome to CareNest',
    home: 'Home',
    explore: 'Find Caregivers',
    bookings: 'Bookings',
    safety: 'Safety',
    profile: 'Profile',
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    email: 'Email Address',
    username: 'Username',
    password: 'Password',
    newPassword: 'New Password',
    currentPassword: 'Current Password',
    changePassword: 'Change Password',
    changeEmail: 'Change Email',
    forgotPassword: 'Forgot password?',
    sendResetLink: 'Send reset link',
    passwordRecoveryInstructions: 'Enter your account email to receive a recovery link that expires in 15 minutes.',
    passwordRecoverySent: 'If an account matches that email, a password reset link has been sent.',
    checkInboxSpamNotice: 'Please check your inbox (and Spam folder if you don’t see it right away).',
    loginFailed: 'Invalid credentials. Please verify your details.',
    loginSuccess: 'Welcome back!',
    signUpPrompt: "Don't have an account?",
    loginPrompt: 'Already have an account?',
    registerAsFamily: 'Family Account',
    registerAsCaregiver: 'Caregiver Account',
    fullName: 'Full Legal Name',
    phone: 'Phone Number',
    nationalId: 'National ID Number',
    city: 'City',
    age: 'Age',
    experienceYears: 'Years of Experience',
    monthlySalary: 'Expected monthly salary',
    hourlyRate: 'Expected monthly salary',
    perMonth: 'per month',
    currency: 'Currency',
    bio: 'About You / Bio',
    selectServices: 'Services Provided',
    searchPlaceholder: 'Search name, city, bio...',
    allCities: 'All Cities',
    allServices: 'All Services',
    available: 'Available Now',
    unavailable: 'Currently Busy',
    availableOnly: 'Available only',
    noSittersFound: 'No caregivers found matching your filters.',
    bookCaregiver: 'Book Caregiver',
    bookingDetails: 'Booking Details',
    selectDate: 'Date',
    startTime: 'Start Time',
    endTime: 'End Time',
    address: 'Service Address / Location',
    notes: 'Special Instructions / Child Ages',
    estimatedCost: 'Estimated Cost',
    confirmBooking: 'Confirm & Send Request',
    bookingSuccess: 'Booking request sent successfully!',
    myBookings: 'My Bookings',
    noBookings: 'No bookings found yet.',
    statusPending: 'Pending',
    statusConfirmed: 'Confirmed',
    statusCompleted: 'Completed',
    statusCancelled: 'Cancelled',
    cancelBooking: 'Cancel Booking',
    cancelReason: 'Reason for cancellation',
    acceptBooking: 'Accept Booking',
    safetyDirectory: 'Community Safety Directory',
    safetySubhead: 'Verified incident reports and platform safety notices',
    reportIncident: 'Report Safety Incident',
    reportSubmitSuccess: 'Report submitted for administrative review.',
    reportedPersonName: 'Reported Person Name',
    incidentDate: 'Date of Incident',
    incidentDescription: 'Factual Description of Incident',
    evidenceNotice: 'Evidence and ID are kept strictly confidential by moderators.',
    accountSecurity: 'Account Security',
    language: 'Language / اللغة',
    saveChanges: 'Save Changes',
    loading: 'Loading...',
    required: 'Required',
    close: 'Close',
    error: 'Error',
    success: 'Success',
    // Services
    babysitting: 'Babysitting',
    childcare: 'Child Care',
    cleaning: 'House Cleaning',
    cooking: 'Cooking / Meal Prep',
    elderlyCare: 'Elderly Care',
    services: 'Services',
    policies: 'Policies',
    contactUs: 'Contact Us',
    aboutUs: 'About Us',
    viewProfile: 'View Profile',
    tapToEnlarge: 'Tap photo to enlarge',
  },
  ar: {
    appName: 'كير نست',
    tagline: 'منصة حجز جليسات ومقدمات الرعاية المعتمدة',
    welcome: 'مرحباً بك في كير نست',
    home: 'الرئيسية',
    explore: 'البحث عن جليسة',
    bookings: 'الحجوزات',
    safety: 'الأمان',
    profile: 'الحساب',
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    register: 'إنشاء حساب جديد',
    email: 'البريد الإلكتروني',
    username: 'اسم المستخدم',
    password: 'كلمة المرور',
    newPassword: 'كلمة المرور الجديدة',
    currentPassword: 'كلمة المرور الحالية',
    changePassword: 'تغيير كلمة المرور',
    changeEmail: 'تغيير البريد الإلكتروني',
    forgotPassword: 'نسيت كلمة المرور؟',
    sendResetLink: 'إرسال رابط الاستعادة',
    passwordRecoveryInstructions: 'أدخل بريدك الإلكتروني لإرسال رابط إعادة تعيين صالح لمدة 15 دقيقة.',
    passwordRecoverySent: 'إذا كان البريد مسجلاً لدينا، فقد تم إرسال رابط إعادة التعيين.',
    checkInboxSpamNotice: 'يرجى التحقق من صندوق الوارد (ومجلد الرسائل غير المرغوب فيها Spam إذا لم تجدها على الفور).',
    loginFailed: 'بيانات الدخول غير صحيحة. يرجى التأكد وإعادة المحاولة.',
    loginSuccess: 'مرحباً بك مجدداً!',
    signUpPrompt: 'ليس لديك حساب؟',
    loginPrompt: 'لديك حساب بالفعل؟',
    registerAsFamily: 'حساب عائلة / ولي أمر',
    registerAsCaregiver: 'حساب مقدمة رعاية / جليسة',
    fullName: 'الاسم القانوني الكامل',
    phone: 'رقم الهاتف',
    nationalId: 'الرقم القومي',
    city: 'المدينة',
    age: 'العمر',
    experienceYears: 'سنوات الخبرة',
    monthlySalary: 'الراتب الشهري المتوقع',
    hourlyRate: 'الراتب الشهري المتوقع',
    perMonth: 'شهرياً',
    currency: 'العملة',
    bio: 'نبذة عنك / الخبرات',
    selectServices: 'الخدمات المقدمة',
    searchPlaceholder: 'ابحث بالاسم، المدينة، التخصص...',
    allCities: 'كل المدن',
    allServices: 'كل الخدمات',
    available: 'متاحة الآن',
    unavailable: 'مشغولة حالياً',
    availableOnly: 'المتاحات فقط',
    noSittersFound: 'لم يتم العثور على جليسات مطابقة للبحث.',
    bookCaregiver: 'حجز جليسة',
    bookingDetails: 'تفاصيل الحجز',
    selectDate: 'التاريخ',
    startTime: 'وقت البدء',
    endTime: 'وقت الانتهاء',
    address: 'عنوان الحجز / الموقع',
    notes: 'ملاحظات خاصة / أعمار الأطفال',
    estimatedCost: 'التكلفة التقديرية',
    confirmBooking: 'تأكيد وإرسال طلب الحجز',
    bookingSuccess: 'تم إرسال طلب الحجز بنجاح!',
    myBookings: 'حجوزاتي',
    noBookings: 'لا توجد حجوزات حتى الآن.',
    statusPending: 'قيد الانتظار',
    statusConfirmed: 'مؤكد',
    statusCompleted: 'مكتمل',
    statusCancelled: 'ملغي',
    cancelBooking: 'إلغاء الحجز',
    cancelReason: 'سبب الإلغاء',
    acceptBooking: 'قبول الحجز',
    safetyDirectory: 'دليل الأمان والملاحظات السلوكية',
    safetySubhead: 'بلاغات موثقة وإشعارات سلامة الأسرة والطفل',
    reportIncident: 'تقديم بلاغ أمان',
    reportSubmitSuccess: 'تم استلام البلاغ وجاري مراجعته من الإدارة.',
    reportedPersonName: 'اسم الشخص المبلغ عنه',
    incidentDate: 'تاريخ الواقعة',
    incidentDescription: 'وصف دقيق وموضوعي للواقعة',
    evidenceNotice: 'يتم التعامل مع الإثباتات والوثائق بسرية تامة من قِبل المشرفين.',
    accountSecurity: 'أمان الحساب',
    language: 'Language / اللغة',
    saveChanges: 'حفظ التغييرات',
    loading: 'جاري التحميل...',
    required: 'مطلوب',
    close: 'إغلاق',
    error: 'خطأ',
    success: 'نجاح',
    // Services
    babysitting: 'مجالسة أطفال',
    childcare: 'رعاية أطفال متكاملة',
    cleaning: 'تنظيف منزلي',
    cooking: 'طبخ وإعداد وجبات',
    elderlyCare: 'رعاية كبار السن',
    services: 'خدماتنا',
    policies: 'السياسات والشروط',
    contactUs: 'تواصل معنا',
    aboutUs: 'من نحن',
    viewProfile: 'عرض الملف الشخصي',
    tapToEnlarge: 'اضغط على الصورة للتكبير',
  }
};

const LocaleContext = createContext();

export const LocaleProvider = ({ children }) => {
  const [locale, setLocale] = useState('ar'); // Default language is Arabic

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('@carenest_locale');
        if (saved && (saved === 'en' || saved === 'ar')) {
          setLocale(saved);
        } else {
          setLocale('ar'); // Default to Arabic
        }
      } catch (e) {
        setLocale('ar');
      }
    })();
  }, []);

  const changeLocale = async (newLocale) => {
    setLocale(newLocale);
    try {
      await AsyncStorage.setItem('@carenest_locale', newLocale);
    } catch (e) {}
  };

  const t = (key) => {
    return translations[locale]?.[key] || translations['en']?.[key] || key;
  };

  const isRTL = locale === 'ar';

  return (
    <LocaleContext.Provider value={{ locale, setLocale: changeLocale, t, isRTL }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => useContext(LocaleContext);
