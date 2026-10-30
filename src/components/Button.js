import React from 'react';
import { StyleSheet, Pressable, Text, ActivityIndicator } from 'react-native';
import { colors, radius, spacing, shadows } from '../theme';

export default function Button({
  title,
  onPress,
  variant = 'plum',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  accessibilityLabel,
  accessibilityHint,
  testID,
}) {
  const blocked = disabled || loading;
  const outlined = variant === 'outline';
  const backgroundColor = disabled
    ? '#e7dfe9'
    : outlined
      ? colors.white
      : variant === 'primary'
        ? colors.primary
        : variant === 'danger'
          ? colors.danger
          : colors.plum;
  const foregroundColor = disabled
    ? colors.textMuted
    : outlined ? colors.plum : colors.white;

  return (
    <Pressable
      onPress={onPress}
      disabled={blocked}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: blocked, busy: loading }}
      testID={testID}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor },
        outlined && styles.outline,
        disabled && styles.disabled,
        style,
        pressed && !blocked && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={foregroundColor} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, { color: foregroundColor }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    ...shadows.card,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    gap: spacing.sm,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: colors.plum,
    shadowOpacity: 0,
    elevation: 0,
  },
  disabled: {
    borderColor: colors.borderLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  pressed: {
    opacity: 0.86,
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    flexShrink: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
});
