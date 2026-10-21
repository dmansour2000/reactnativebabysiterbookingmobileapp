import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';
import { useLocale } from '../locales';
import { useDrawer } from '../context/DrawerContext';

export default function Header({
  title,
  subtitle,
  showBack = false,
  navigation,
  rightElement,
}) {
  const { isRTL } = useLocale();
  const { openDrawer } = useDrawer();

  return (
    <View style={styles.container}>
      <View style={[styles.inner, isRTL && styles.innerRTL]}>
        {/* Left Side: Menu Hamburger Button or Back Button */}
        <View style={styles.leftRow}>
          {showBack && navigation ? (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isRTL ? 'arrow-forward' : 'arrow-back'}
                size={22}
                color={colors.white}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={openDrawer}
              activeOpacity={0.7}
            >
              <Ionicons name="menu" size={24} color={colors.white} />
            </TouchableOpacity>
          )}

          <View style={styles.brandGroup}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoEmoji}>👶</Text>
            </View>
            <View>
              <Text style={styles.brandTitle}>{title || 'CareNest'}</Text>
              {subtitle ? <Text style={styles.brandSubtitle} numberOfLines={1}>{subtitle}</Text> : null}
            </View>
          </View>
        </View>

        {/* Right Side: Additional action or Side Menu trigger */}
        <View style={styles.rightRow}>
          {rightElement}
          {showBack ? (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={openDrawer}
              activeOpacity={0.7}
            >
              <Ionicons name="menu" size={22} color={colors.white} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
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
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 20,
  },
  brandTitle: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  brandSubtitle: {
    color: '#ffe4f7',
    fontSize: 10,
    fontWeight: '500',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
