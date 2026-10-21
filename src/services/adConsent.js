import { Platform } from 'react-native';

let mobileAds, AdsConsent, AdsConsentStatus;
let isNativeAdMobAvailable = false;

try {
  const GoogleMobileAds = require('react-native-google-mobile-ads');
  mobileAds = GoogleMobileAds.default;
  AdsConsent = GoogleMobileAds.AdsConsent;
  AdsConsentStatus = GoogleMobileAds.AdsConsentStatus;
  isNativeAdMobAvailable = Boolean(mobileAds && AdsConsent);
} catch (e) {
  isNativeAdMobAvailable = false;
}

let trackingTransparency;
try {
  trackingTransparency = require('expo-tracking-transparency');
} catch (e) {
  trackingTransparency = null;
}

/**
 * Initializes Google Mobile Ads with Google's User Messaging Platform (UMP) consent
 * and Apple's App Tracking Transparency (ATT) on iOS.
 */
export async function initializeAdMobWithConsent() {
  if (!isNativeAdMobAvailable || !mobileAds) {
    return { canRequestAds: false, isNative: false };
  }

  try {
    // 1. Gather consent using Google UMP
    // This requests info update and presents the Google consent form if required (e.g. in EEA/UK)
    let consentInfo;
    try {
      consentInfo = await AdsConsent.gatherConsent();
    } catch (consentError) {
      console.warn('[AdMob UMP] gatherConsent failed or was dismissed:', consentError?.message);
    }

    // 2. On iOS, request App Tracking Transparency (ATT) permission if available
    if (Platform.OS === 'ios' && trackingTransparency?.requestTrackingPermissionsAsync) {
      try {
        const { status } = await trackingTransparency.requestTrackingPermissionsAsync();
        console.log('[ATT] Tracking permission status:', status);
      } catch (attError) {
        console.warn('[ATT] Tracking permission request skipped:', attError?.message);
      }
    }

    // 3. Initialize the AdMob Mobile Ads SDK
    const adapterStatuses = await mobileAds().initialize();
    console.log('[AdMob] SDK initialized successfully');

    return {
      canRequestAds: consentInfo ? consentInfo.canRequestAds : true,
      consentStatus: consentInfo?.status,
      adapterStatuses,
      isNative: true,
    };
  } catch (err) {
    console.warn('[AdMob] Initialization with consent encountered an error:', err.message);
    return { canRequestAds: false, error: err.message, isNative: true };
  }
}

/**
 * Opens Google's Privacy Options form (e.g., to allow European users to change/revoke consent).
 * Required by Google UMP policies to be accessible from app settings or privacy policies.
 */
export async function showPrivacyOptionsForm() {
  if (!isNativeAdMobAvailable || !AdsConsent?.showPrivacyOptionsForm) {
    return null;
  }

  try {
    const result = await AdsConsent.showPrivacyOptionsForm();
    return result;
  } catch (err) {
    console.warn('[AdMob UMP] showPrivacyOptionsForm error:', err.message);
    throw err;
  }
}

export { isNativeAdMobAvailable };
