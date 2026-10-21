import React from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { useLocale } from '../locales';

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  spellCheck = false,
  multiline = false,
  numberOfLines = 1,
  error,
  required = false,
  style,
  inputStyle,
  ...rest
}) {
  const { isRTL } = useLocale();

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, isRTL && styles.textRTL]}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          error && styles.inputError,
          isRTL && styles.inputRTL,
          inputStyle,
        ]}
        value={value != null ? String(value) : ''}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        spellCheck={spellCheck}
        multiline={multiline}
        numberOfLines={numberOfLines}
        blurOnSubmit={!multiline}
        {...rest}
      />
      {error ? <Text style={[styles.errorText, isRTL && styles.textRTL]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  required: {
    color: colors.danger,
  },
  textRTL: {
    textAlign: 'right',
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#c9bfcd',
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: colors.text,
    width: '100%',
  },
  inputRTL: {
    textAlign: 'right',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: '#fffbfa',
  },
  errorText: {
    color: colors.danger,
    fontSize: 11,
    marginTop: 4,
  },
});
