import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { colors, radius } from '../theme';

export default function Badge({ label, variant = 'tag', style, textStyle }) {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'available':
        return { bg: colors.availableBg, text: colors.available, border: '#a7f3d0' };
      case 'busy':
        return { bg: colors.busyBg, text: colors.busy, border: '#fecdd3' };
      case 'confirmed':
      case 'accepted':
        return { bg: colors.successBg, text: colors.success, border: '#bbf7d0' };
      case 'completed':
        return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' };
      case 'pending':
        return { bg: colors.warningBg, text: colors.warning, border: '#fef08a' };
      case 'cancelled':
      case 'declined':
        return { bg: colors.dangerBg, text: colors.danger, border: '#fecaca' };
      case 'primary':
        return { bg: '#fdf2f8', text: colors.primary, border: '#fbcfe8' };
      case 'tag':
      default:
        return { bg: colors.tagBg, text: colors.tagText, border: '#e9d5ff' };
    }
  };

  const styleConfig = getBadgeStyle();

  return (
    <View style={[
      styles.badge, 
      { backgroundColor: styleConfig.bg, borderColor: styleConfig.border }, 
      style
    ]}>
      <Text style={[styles.text, { color: styleConfig.text }, textStyle]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
  },
});
