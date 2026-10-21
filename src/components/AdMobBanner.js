import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { useLocale } from '../locales';
import AdSenseBanner from './AdSenseBanner';

export const IOS_APP_ID = 'ca-app-pub-3496568058228119~7037691726';
export const IOS_BANNER_AD_UNIT_ID = 'ca-app-pub-3496568058228119/3868602907';

let mobileAds, BannerAd, BannerAdSize, TestIds;
let isNativeAdMobAvailable = false;

try {
  const GoogleMobileAds = require('react-native-google-mobile-ads');
  mobileAds = GoogleMobileAds.default;
  BannerAd = GoogleMobileAds.BannerAd;
  BannerAdSize = GoogleMobileAds.BannerAdSize;
  TestIds = GoogleMobileAds.TestIds;
  isNativeAdMobAvailable = Boolean(mobileAds && BannerAd);
} catch (e) {
  isNativeAdMobAvailable = false;
}

export { TestIds, BannerAdSize, isNativeAdMobAvailable };

export default function AdMobBanner({
  adUnitId,
  size,
  forceLiveAd = false,
  style,
}) {
  const { t, isRTL } = useLocale();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (isNativeAdMobAvailable && mobileAds) {
      try {
        mobileAds()
          .initialize()
          .then(() => setInitialized(true))
          .catch((err) => {
            console.warn('AdMob initialize failed:', err?.message);
            setInitialized(false);
          });
      } catch (err) {
        console.warn('AdMob native call skipped:', err?.message);
      }
    }
  }, []);

  // Use real iOS Ad Unit ID in production or if forceLiveAd is set; otherwise use Google Test ID in dev
  const defaultUnit = Platform.OS === 'ios'
    ? ((__DEV__ && !forceLiveAd) ? (TestIds?.BANNER || 'ca-app-pub-3940256099942544/2934735716') : IOS_BANNER_AD_UNIT_ID)
    : (TestIds?.BANNER || 'ca-app-pub-3940256099942544/6300978111');

  const bannerUnit = adUnitId || defaultUnit;
  const bannerSize = size || (BannerAdSize ? BannerAdSize.BANNER : 'BANNER');

  if (isNativeAdMobAvailable && initialized && BannerAd) {
    return (
      <View style={[styles.container, style]}>
        <View style={[styles.badgeRow, isRTL && styles.badgeRowRTL]}>
          <Text style={styles.adLabel}>{t('advertisement') || 'Advertisement'}</Text>
        </View>
        <View style={styles.adWrapper}>
          <BannerAd
            unitId={bannerUnit}
            size={bannerSize}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
          />
        </View>
      </View>
    );
  }

  // Graceful fallback for Expo Go / Web / Dev environments without native AdMob build
  return <AdSenseBanner style={style} />;
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  badgeRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  badgeRowRTL: {
    justifyContent: 'flex-end',
  },
  adLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: colors.textLight,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  adWrapper: {
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e8dfe9',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

