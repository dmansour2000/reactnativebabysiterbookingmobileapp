import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, radius, spacing } from '../theme';
import { useLocale } from '../locales';
import { Ionicons } from '@expo/vector-icons';

export default function ContactUsScreen({ navigation }) {
  const { t, locale, isRTL } = useLocale();
  const isArabic = locale === 'ar';

  const email = 'dinamansour2000@gmail.com';

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${email}?subject=CareNest Support Inquiry`);
  };

  return (
    <ScreenWrapper>
      <Header
        title={t('contactUs')}
        subtitle={isArabic ? 'فريق الدعم وخدمة العملاء' : 'Support & Assistance'}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <Card style={styles.introCard}>
          <Text style={[styles.eyebrow, isRTL && styles.textRTL]}>
            {isArabic ? 'تواصل مع فريقنا' : 'Get in Touch'}
          </Text>
          <Text style={[styles.title, isRTL && styles.textRTL]}>
            {isArabic ? 'يسعدنا دائماً تقديم المساعدة' : 'We are here to support your family'}
          </Text>
          <Text style={[styles.description, isRTL && styles.textRTL]}>
            {isArabic
              ? 'هل لديك استفسار حول حجز جليسة، أو ترغب في توثيق حسابك، أو الإبلاغ عن ملاحظة؟ فريق دعم كير نست متاح للمساعدة السريعة.'
              : 'Have questions about a booking, need help verifying your account, or want to share feedback? Our team is ready to help.'}
          </Text>
        </Card>

        {/* Direct Contact Card */}
        <Card style={styles.contactCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="mail-open" size={30} color="#683f80" />
          </View>
          <Text style={styles.emailLabel}>
            {isArabic ? 'البريد الإلكتروني الرسمي للمنصة' : 'Official Platform Email'}
          </Text>
          <TouchableOpacity onPress={handleEmailPress} activeOpacity={0.7}>
            <Text style={styles.emailText}>{email}</Text>
          </TouchableOpacity>
          <Text style={styles.responseTime}>
            {isArabic
              ? 'نرد على كافة الاستفسارات خلال 24 ساعة كحد أقصى على مدار أيام الأسبوع.'
              : 'We respond to inquiries within 24 hours throughout the week.'}
          </Text>

          <Button
            title={isArabic ? 'إرسال بريد إلكتروني الآن' : 'Send Email Now'}
            variant="plum"
            onPress={handleEmailPress}
            style={styles.actionBtn}
          />
        </Card>

        {/* Community & Safety Notice */}
        <Card style={styles.noticeCard}>
          <View style={[styles.noticeHeader, isRTL && styles.rowRTL]}>
            <Ionicons name="shield-checkmark" size={20} color="#15803d" />
            <Text style={[styles.noticeTitle, isRTL && styles.textRTL]}>
              {isArabic ? 'إبلاغ عن حالات الطوارئ أو الأمان' : 'Safety & Urgent Reports'}
            </Text>
          </View>
          <Text style={[styles.noticeBody, isRTL && styles.textRTL]}>
            {isArabic
              ? 'إذا كانت هناك شكوى تتعلق بسلامة الأطفال أو سوء سلوك، يرجى تقديم تقرير مباشر عبر قسم الأمان في القائمة الجانبية لاتخاذ الإجراء الإداري فوراً.'
              : 'For urgent safety or misconduct reports, please use the Safety Directory in the side menu for immediate moderator review.'}
          </Text>
        </Card>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  introCard: {
    backgroundColor: '#ffffff',
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(104, 63, 128, 0.12)',
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7a3b79',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#30243a',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    color: '#6c6270',
  },
  contactCard: {
    backgroundColor: '#ffffff',
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#e7dbe9',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#786f7e',
    marginBottom: 6,
  },
  emailText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#683f80',
    marginBottom: 10,
    textAlign: 'center',
  },
  responseTime: {
    fontSize: 12,
    color: '#948898',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  actionBtn: {
    width: '100%',
  },
  noticeCard: {
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#15803d',
  },
  noticeBody: {
    fontSize: 12,
    lineHeight: 18,
    color: '#554a5c',
  },
  textRTL: {
    textAlign: 'right',
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
});

