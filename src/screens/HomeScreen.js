import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import AdMobBanner from '../components/AdMobBanner';
import { colors, radius, spacing } from '../theme';
import { useLocale } from '../locales';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const { t, locale, isRTL } = useLocale();
  const { isAuthenticated } = useAuth();

  const isArabic = locale === 'ar';

  return (
    <ScreenWrapper>
      <Header
        title="CareNest"
        subtitle={isArabic ? 'رعاية موثوقة للأطفال وكبار السن' : 'Trusted care for families'}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <Card style={styles.heroCard}>
          <View style={styles.heroBadgeRow}>
            <View style={styles.appIconWrap}>
              <Image
                source={require('../../assets/icon.png')}
                style={styles.heroAppIcon}
                resizeMode="cover"
              />
            </View>
            <View style={styles.heroTag}>
              <Text style={styles.heroTagText}>
                {isArabic ? 'منصة معتمدة وموثوقة' : 'Verified Care Platform'}
              </Text>
            </View>
          </View>

          <Text style={[styles.heroTitle, isRTL && styles.textRTL]}>
            {isArabic
              ? 'رعاية موثوقة للأطفال وكبار السن في مصر'
              : 'Trusted care for children and older adults'}
          </Text>

          <Text style={[styles.heroDescription, isRTL && styles.textRTL]}>
            {isArabic
              ? 'تربط كير نست العائلات في مصر بمقدمات الرعاية للأطفال وخدمات المساعدة المنزلية ورعاية كبار السن. قارنوا الملفات المعتمدة واطلبوا الخدمات التي تناسب جدول عائلتكم.'
              : 'Care Nest connects families in Egypt with babysitting, household support, and care for older adults. Compare approved caregiver profiles and request services that suit your family’s schedule.'}
          </Text>

          {/* Quick Action Button */}
          {isAuthenticated ? (
            <Button
              title={t('explore')}
              variant="plum"
              onPress={() => navigation.navigate('Main', { screen: 'ExploreTab' })}
              style={styles.heroButton}
            />
          ) : (
            <View style={styles.heroAuthRow}>
              <Button
                title={t('login')}
                variant="plum"
                onPress={() => navigation.navigate('Login')}
                style={styles.heroAuthBtn}
              />
              <Button
                title={t('register')}
                variant="secondary"
                onPress={() => navigation.navigate('Register')}
                style={styles.heroAuthBtn}
              />
            </View>
          )}
        </Card>

        {/* Feature Highlights Grid */}
        <View style={styles.featuresRow}>
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate('Services')}
            activeOpacity={0.8}
          >
            <View style={[styles.featureIconBox, { backgroundColor: '#eff6ff' }]}>
              <Ionicons name="sparkles" size={24} color="#3b82f6" />
            </View>
            <Text style={styles.featureTitle}>{t('services')}</Text>
            <Text style={styles.featureSubtitle}>
              {isArabic ? 'مجالسة، تنظيف، طبخ، كبار السن' : 'Babysitting, cleaning, elderly care'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate('Policies')}
            activeOpacity={0.8}
          >
            <View style={[styles.featureIconBox, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="document-text" size={24} color="#d97706" />
            </View>
            <Text style={styles.featureTitle}>{t('policies')}</Text>
            <Text style={styles.featureSubtitle}>
              {isArabic ? 'سياسات المجتمع والضمانات' : 'Community rules & guidelines'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.featuresRow}>
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate('ContactUs')}
            activeOpacity={0.8}
          >
            <View style={[styles.featureIconBox, { backgroundColor: '#fdf2f8' }]}>
              <Ionicons name="mail" size={24} color="#db2777" />
            </View>
            <Text style={styles.featureTitle}>{t('contactUs')}</Text>
            <Text style={styles.featureSubtitle}>
              {isArabic ? 'فريق الدعم الفني والمساعدة' : 'Support & general inquiries'}
            </Text>
          </TouchableOpacity>

          {isAuthenticated ? (
            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => navigation.navigate('Safety')}
              activeOpacity={0.8}
            >
              <View style={[styles.featureIconBox, { backgroundColor: '#f0fdf4' }]}>
                <Ionicons name="shield-checkmark" size={24} color="#16a34a" />
              </View>
              <Text style={styles.featureTitle}>{t('safety')}</Text>
              <Text style={styles.featureSubtitle}>
                {isArabic ? 'سجل الأمان والتحقق والنزاهة' : 'Verified ID & Incident directory'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <View style={[styles.featureIconBox, { backgroundColor: '#f3e8ff' }]}>
                <Ionicons name="log-in" size={24} color="#683f80" />
              </View>
              <Text style={styles.featureTitle}>{t('login')}</Text>
              <Text style={styles.featureSubtitle}>
                {isArabic ? 'سجل دخولك للوصول لسجل الأمان' : 'Sign in to access safety directory'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Why Choose CareNest Card */}
        <Card style={styles.trustCard}>
          <Text style={[styles.trustHeading, isRTL && styles.textRTL]}>
            {isArabic ? 'لماذا تختار منصة كير نست؟' : 'Why choose CareNest?'}
          </Text>

          <View style={[styles.trustPoint, isRTL && styles.rowRTL]}>
            <Ionicons name="checkmark-circle" size={20} color="#15803d" />
            <Text style={[styles.trustPointText, isRTL && styles.textRTL]}>
              {isArabic
                ? 'فحص شامل للهويات الوطنية والبيانات الشخصية لكافة مقدمات الرعاية.'
                : 'Thorough verification of National IDs and backgrounds for all caregivers.'}
            </Text>
          </View>

          <View style={[styles.trustPoint, isRTL && styles.rowRTL]}>
            <Ionicons name="checkmark-circle" size={20} color="#15803d" />
            <Text style={[styles.trustPointText, isRTL && styles.textRTL]}>
              {isArabic
                ? 'حساب تكلفة شفاف يعتمد على الراتب الشهري المتوقع وساعات العمل المطلوبة.'
                : 'Transparent pricing calculated directly from verified monthly salary expectations.'}
            </Text>
          </View>

          <View style={[styles.trustPoint, isRTL && styles.rowRTL]}>
            <Ionicons name="checkmark-circle" size={20} color="#15803d" />
            <Text style={[styles.trustPointText, isRTL && styles.textRTL]}>
              {isArabic
                ? 'لوحة إدارة متقدمة وسجل أمان يحمي كلا الطرفين بموضوعية.'
                : 'Safety directory and incident moderation to safeguard both families and caregivers.'}
            </Text>
          </View>
        </Card>

        {/* Google AdMob / AdSense Placement */}
        <AdMobBanner />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(104, 63, 128, 0.12)',
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  appIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  heroAppIcon: {
    width: 44,
    height: 44,
  },
  heroTag: {
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  heroTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7e22ce',
  },
  heroTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#30243a',
    lineHeight: 28,
    marginBottom: 10,
  },
  heroDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: '#6c6270',
    marginBottom: 18,
  },
  heroButton: {
    marginTop: 4,
  },
  heroAuthRow: {
    flexDirection: 'row',
    gap: 10,
  },
  heroAuthBtn: {
    flex: 1,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e7dbe9',
    shadowColor: '#4a154b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  featureIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#30243a',
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 11,
    color: '#786f7e',
    lineHeight: 16,
  },
  trustCard: {
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#e7dbe9',
  },
  trustHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#30243a',
    marginBottom: 12,
  },
  trustPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  trustPointText: {
    flex: 1,
    fontSize: 13,
    color: '#554a5c',
    lineHeight: 19,
  },
  textRTL: {
    textAlign: 'right',
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
});

