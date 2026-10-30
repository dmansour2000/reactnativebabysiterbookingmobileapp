import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius, shadows, spacing } from '../theme';

export default function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    ...shadows.card,
    backgroundColor: colors.cardBg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
});
