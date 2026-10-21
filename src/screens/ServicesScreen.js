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
import { colors, radius, spacing } from '../theme';
import { useLocale } from '../locales';
import { Ionicons } from '@expo/vector-icons';

export default function ServicesScreen({ navigation }) {
  const { t, locale, isRTL } = useLocale();
  const isArabic = locale === 'ar';

  const corePillars = [
    {
      num: '01',
      title: isArabic ? 'ملفات معتمدة لمقدمات الرعاية' : 'Approved Caregiver Profiles',
      desc: isArabic
        ? 'نقوم بفحص ومراجعة بيانات كل مقدمة رعاية لضمان التحقق من الهوية والخبرة والموثوقية قبل قبول الحجوزات.'
        : 'Caregiver profiles are reviewed with identity and credential verification to support safe household choices.',
      icon: 'shield-checkmark',
      color: '#16a34a',
      bg: '#f0fdf4',
    },
    {
      num: '02',
      title: isArabic ? 'خيارات رعاية متكاملة ومرنة' : 'Flexible Care Options',
      desc: isArabic
        ? 'سواء كنتم بحاجة إلى رعاية أطفال بالساعات، أو رعاية كبار السن، أو تنظيف وطبخ، تجدون ما يناسب جدول عائلتكم.'
        : 'Choose childcare, older adult companion care, or domestic help tailored to your family schedule.',
      icon: 'heart',
      color: '#d954b2',
      bg: '#fdf2f8',
    },
    {
      num: '03',
      title: isArabic ? 'حجز وتواصل منظم ومباشر' : 'Streamlined Bookings',
      desc: isArabic
        ? 'طلب الخدمة وتحديد الساعات والموقع ومتابعة حالة الطلب وقبوله بشكل فوري وسهل.'
        : 'Request specific dates and times, communicate instructions, and review booking statuses clearly.',
      icon: 'calendar',
      color: '#683f80',
      bg: '#f3e8ff',
    },
  ];

  const serviceCategories = [
    {
      key: 'babysitting',
      title: isArabic ? 'مجالسة ورعاية الأطفال' : 'Childcare & Babysitting',
      desc: isArabic
        ? 'رعاية آمنة للأطفال من جميع الفئات العمرية، تشمل متابعة الواجبات، الأنشطة، والوجبات.'
        : 'Attentive support for infants, toddlers, and school-age children with engaging activities.',
      icon: 'happy',
    },
    {
      key: 'cleaning',
      title: isArabic ? 'المساعدة والتنظيف المنزلي' : 'House Cleaning',
      desc: isArabic
        ? 'تنظيم وترتيب المنزل، العناية بغرف الأطفال، ودعم نظافة البيئة المعيشية للأسرة.'
        : 'Regular cleaning, dusting, tidying children rooms, and keeping your home orderly.',
      icon: 'sparkles',
    },
    {
      key: 'cooking',
      title: isArabic ? 'الطبخ وإعداد الوجبات' : 'Meal Preparation',
      desc: isArabic
        ? 'إعداد وجبات صحية ومغذية للأطفال وكبار السن حسب إرشادات الأسرة والحمية الغذائية.'
        : 'Nutritious everyday home cooking customized for family nutrition guidelines.',
      icon: 'restaurant',
    },
    {
      key: 'elderlyCare',
      title: isArabic ? 'رعاية كبار السن والمرافقة' : 'Elderly Companion Care',
      desc: isArabic
        ? 'مرافقة يومية محبة، التذكير بمواعيد الأدوية، والمساعدة في التنقل والأنشطة الخفيفة.'
        : 'Daily companionship, gentle walking, medication reminders, and domestic assistance.',
      icon: 'people',
    },
  ];

  return (
    <ScreenWrapper>
      <Header
        title={t('services')}
        subtitle={isArabic ? 'خدمات الرعاية المعتمدة' : 'Verified Care Offerings'}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro Card */}
        <Card style={styles.introCard}>
          <Text style={[styles.eyebrow, isRTL && styles.textRTL]}>
            {isArabic ? 'خدمات معتمدة للأسر في مصر' : 'Quality Care for Families'}
          </Text>
          <Text style={[styles.title, isRTL && styles.textRTL]}>
            {isArabic ? 'حلول رعاية متكاملة لمنزلك' : 'Comprehensive Care for Every Home'}
          </Text>
          <Text style={[styles.description, isRTL && styles.textRTL]}>
            {isArabic
              ? 'تساعد كير نست العائلات في مصر على العثور على دعم لاحتياجات المنزل ورعاية الأطفال وكبار السن، من خلال تجربة حجز واضحة وميسرة.'
              : 'Care Nest helps families find dependable support for childcare, home assistance, and senior companionship with confidence and transparency.'}
          </Text>
        </Card>

        {/* 3 Core Pillars */}
        <Text style={[styles.sectionHeading, isRTL && styles.textRTL]}>
          {isArabic ? 'ركائز المنصة' : 'Core Standards'}
        </Text>
        {corePillars.map((p) => (
          <Card key={p.num} style={styles.pillarCard}>
            <View style={[styles.pillarHeader, isRTL && styles.rowRTL]}>
              <View style={[styles.iconCircle, { backgroundColor: p.bg }]}>
                <Ionicons name={p.icon} size={22} color={p.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pillarNum}>{p.num}</Text>
                <Text style={[styles.pillarTitle, isRTL && styles.textRTL]}>{p.title}</Text>
              </View>
            </View>
            <Text style={[styles.pillarDesc, isRTL && styles.textRTL]}>{p.desc}</Text>
          </Card>
        ))}

        {/* Available Service Categories */}
        <Text style={[styles.sectionHeading, isRTL && styles.textRTL]}>
          {isArabic ? 'الخدمات المتاحة للحجز' : 'Available Service Options'}
        </Text>
        <View style={styles.servicesGrid}>
          {serviceCategories.map((item) => (
            <Card key={item.key} style={styles.serviceItemCard}>
              <View style={[styles.categoryHeader, isRTL && styles.rowRTL]}>
                <View style={styles.categoryIconWrap}>
                  <Ionicons name={item.icon} size={20} color="#683f80" />
                </View>
                <Text style={[styles.categoryTitle, isRTL && styles.textRTL]}>
                  {item.title}
                </Text>
              </View>
              <Text style={[styles.categoryDesc, isRTL && styles.textRTL]}>
                {item.desc}
              </Text>
            </Card>
          ))}
        </View>
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
  sectionHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#30243a',
    marginVertical: 10,
  },
  pillarCard: {
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e7dbe9',
  },
  pillarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarNum: {
    fontSize: 11,
    fontWeight: '800',
    color: '#948898',
  },
  pillarTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#30243a',
  },
  pillarDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: '#554a5c',
  },
  servicesGrid: {
    gap: 10,
  },
  serviceItemCard: {
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#e7dbe9',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  categoryIconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#30243a',
    flex: 1,
  },
  categoryDesc: {
    fontSize: 12,
    lineHeight: 18,
    color: '#6c6270',
  },
  textRTL: {
    textAlign: 'right',
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
});

