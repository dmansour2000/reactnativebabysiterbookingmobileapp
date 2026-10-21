import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { colors, radius, spacing } from '../theme';

export default function Button({
  title,
  onPress,
  variant = 'plum', // 'plum' | 'primary' | 'outline' | 'danger'
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) {
  const getBackgroundColor = () => {
    if (disabled) return '#d1c7d4';
    if (variant === 'primary') return colors.primary;
    if (variant === 'outline') return 'transparent';
    if (variant === 'danger') return colors.danger;
    return colors.plum;
  };

  const getTextColor = () => {
    if (disabled) return '#8c8090';
    if (variant === 'outline') return colors.plum;
    return colors.white;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && styles.outlineButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    gap: 8,
    shadowColor: '#4a2b5c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  outlineButton: {
    borderWidth: 1.5,
    borderColor: colors.plum,
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});
