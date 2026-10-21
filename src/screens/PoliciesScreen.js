import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
} from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import Card from '../components/Card';
import { radius, spacing } from '../theme';
import { useLocale } from '../locales';
import { Ionicons } from '@expo/vector-icons';

export default function PoliciesScreen({ navigation }) {
  const { t, locale, isRTL } = useLocale();
  const isArabic = locale === 'ar';

  const caregiverPolicies = [
    {
      title: isArabic ? 'التحقق من الهوية والبيانات' : 'Identity Verification',
      desc: isArabic
        ? 'يلتزم جميع مقدمي الرعاية بتقديم بطاقة الرقم القومي سارية والبيانات الشخصية الصحيحة للمراجعة والاعتماد.'
        : 'All caregivers must submit a valid National ID and genuine credentials before being listed on the platform.',
    },
    {
      title: isArabic ? 'معايير الأمان والتعامل' : 'Safety & Professional Conduct',
      desc: isArabic
        ? 'الحفاظ على أعلى معايير السلامة والأمان للأطفال والنزاهة واحترام خصوصية المنازل والعائلات.'
        : 'Adhere to safe childcare practices, punctual attendance, respectful communication, and complete household integrity.',
    },
    {
      title: isArabic ? 'سياسة الحجوزات والمواعيد' : 'Booking Commitments',
      desc: isArabic
        ? 'الالتزام بمواعيد الحضور وساعات العمل المحددة وإخطار الأسرة مبكراً في حالات الطوارئ القصوى فقط.'
        : 'Honor agreed session schedules and communicate any rare emergency immediately through the platform.',
    },
    {
      title: isArabic ? 'الإجراءات التنظيمية والحظر' : 'Platform Enforcement',
      desc: isArabic
        ? 'أي انتهاك لقواعد الأمان أو تقديم بيانات غير صحيحة يعرض الحساب للتعليق الفوري والإدراج في سجل الأمان.'
        : 'Unverified claims or breaches of safety result in immediate profile suspension and permanent listing on the safety registry.',
    },
  ];

  const familyPolicies = [
    {
      title: isArabic ? 'توفير بيئة عمل آمنة' : 'Safe Working Environment',
      desc: isArabic
        ? 'توفير بيئة منزلية آمنة ومحترمة لمقدمة الرعاية وتقديم كافة التعليمات والملاحظات الخاصة بالأطفال بوضوح.'
        : 'Ensure a safe, courteous home environment and provide clear instructions regarding children routines.',
    },
    {
      title: isArabic ? 'وضوح تفاصيل الحجز' : 'Accurate Booking Details',
      desc: isArabic
        ? 'تحديد العنوان الصحيح، وساعات العمل، والخدمات المطلوبة بدقة لضمان حقوق الطرفين.'
        : 'Specify exact location, hours, required tasks, and child details before booking confirmation.',
    },
    {
      title: isArabic ? 'احترام الخصوصية والبيانات' : 'Privacy & Confidentiality',
      desc: isArabic
        ? 'حماية البيانات الشخصية لمقدمات الرعاية واستخدامها لأغراض تقديم الخدمة فقط دون مشاركتها خارج المنصة.'
        : 'Caregiver personal information must be respected and used solely for scheduled care services.',
    },
    {
      title: isArabic ? 'الالتزام المالي' : 'Payment & Respect',
      desc: isArabic
        ? 'الالتزام بالاتفاقيات المالية وفق الراتب الشهري المتوقع وساعات العمل دون تأخير.'
        : 'Honoring agreed compensation based on expected monthly salary terms without unwarranted delays.',
    },
  ];

  return (
    <ScreenWrapper>
      <Header
        title={t('policies')}
        subtitle={isArabic ? 'سياسات وقواعد المجتمع' : 'Platform Community Policies'}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <Card style={styles.introCard}>
          <Text style={[styles.eyebrow, isRTL && styles.textRTL]}>
            {isArabic ? 'المعلومات العامة والضمانات' : 'Safety & Platform Integrity'}
          </Text>
          <Text style={[styles.title, isRTL && styles.textRTL]}>
            {isArabic ? 'سياسات مجتمع كير نست' : 'CareNest Community Policies'}
          </Text>
          <Text style={[styles.description, isRTL && styles.textRTL]}>
            {isArabic
              ? 'تضع كير نست سلامة الأطفال والعائلات ومقدمات الرعاية كأولوية قصوى. هذه القواعد تضمن تجربة آمنة وعادلة للجميع.'
              : 'Our policies are designed to uphold mutual trust, family safety, and professional dignity for every community member.'}
          </Text>
        </Card>

        {/* Caregiver Policies */}
        <View style={styles.sectionHeader}>
          <Ionicons name="shield-checkmark" size={20} color="#683f80" />
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
            {isArabic ? 'سياسات مقدمات الرعاية والجليسات' : 'Caregiver Guidelines'}
          </Text>
        </View>

        {caregiverPolicies.map((item, idx) => (
          <Card key={idx} style={styles.policyCard}>
            <Text style={[styles.policyHeading, isRTL && styles.textRTL]}>
              {item.title}
            </Text>
            <Text style={[styles.policyBody, isRTL && styles.textRTL]}>
              {item.desc}
            </Text>
          </Card>
        ))}

        {/* Family Policies */}
        <View style={[styles.sectionHeader, { marginTop: spacing.md }]}>
          <Ionicons name="home" size={20} color="#683f80" />
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
            {isArabic ? 'سياسات العائلات وأولياء الأمور' : 'Family Guidelines'}
          </Text>
        </View>

        {familyPolicies.map((item, idx) => (
          <Card key={idx} style={styles.policyCard}>
            <Text style={[styles.policyHeading, isRTL && styles.textRTL]}>
              {item.title}
            </Text>
            <Text style={[styles.policyBody, isRTL && styles.textRTL]}>
              {item.desc}
            </Text>
          </Card>
        ))}
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#30243a',
  },
  policyCard: {
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e7dbe9',
  },
  policyHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#30243a',
    marginBottom: 4,
  },
  policyBody: {
    fontSize: 12,
    lineHeight: 18,
    color: '#554a5c',
  },
  textRTL: {
    textAlign: 'right',
  },
});

