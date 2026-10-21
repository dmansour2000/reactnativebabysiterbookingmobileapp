import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { useLocale } from '../locales';

export default function Header({ title, subtitle, rightElement }) {
  const { locale, setLocale, isRTL } = useLocale();

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'ar' : 'en');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.inner, isRTL && styles.innerRTL]}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoEmoji}>👶</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>{title || 'CareNest'}</Text>
            {subtitle ? <Text style={styles.brandSubtitle}>{subtitle}</Text> : null}
          </View>
        </View>

        <View style={styles.actionsRow}>
          {rightElement}
          <TouchableOpacity 
            style={styles.langButton} 
            onPress={toggleLanguage}
            activeOpacity={0.8}
          >
            <Text style={styles.langText}>{locale === 'en' ? 'عربي' : 'EN'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.lg,
    shadowColor: '#4a154b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  innerRTL: {
    flexDirection: 'row-reverse',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 22,
  },
  brandTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  brandSubtitle: {
    color: '#ffe4f7',
    fontSize: 11,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  langText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
