import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { colors, radius, spacing } from '../theme';
import { useLocale } from '../locales';
import { apiRequest } from '../services/api';

export default function ForgotPasswordScreen({ navigation }) {
  const { t, isRTL } = useLocale();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert(t('error'), t('enterValidEmail') || 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/api/user/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      setSubmitted(true);
    } catch (err) {
      Alert.alert(t('error'), err.message || t('passwordRecoveryError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <Header showBack navigation={navigation} title={t('forgotPassword')} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Card style={styles.card}>
          <Text style={[styles.title, isRTL && styles.textRTL]}>{t('forgotPassword')}</Text>

          {submitted ? (
            <View style={styles.successBox}>
              <Ionicons name="mail-open-outline" size={48} color={colors.plum} />
              <Text style={[styles.successTitle, isRTL && styles.textRTL]}>{t('passwordRecoverySent')}</Text>
              <Text style={[styles.spamNotice, isRTL && styles.textRTL]}>
                {t('checkInboxSpamNotice')}
              </Text>
              <Button
                title={t('backToLogin')}
                variant="plum"
                onPress={() => navigation.navigate('Login')}
                style={styles.backBtn}
              />
            </View>
          ) : (
            <>
              <Text style={[styles.instructions, isRTL && styles.textRTL]}>
                {t('passwordRecoveryInstructions')}
              </Text>

              <Input
                label={t('email')}
                value={email}
                onChangeText={setEmail}
                placeholder={t('emailPlaceholder') || 'you@example.com'}
                keyboardType="email-address"
                autoCapitalize="none"
                required
              />

              <Button
                title={t('sendResetLink')}
                variant="plum"
                onPress={handleSubmit}
                loading={loading}
                style={styles.submitBtn}
              />

              <TouchableOpacity
                style={styles.backLink}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backLinkText}>{t('backToLogin')}</Text>
              </TouchableOpacity>
            </>
          )}
        </Card>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  card: {
    padding: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  instructions: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
    marginBottom: spacing.lg,
  },
  submitBtn: {
    marginTop: spacing.xs,
  },
  backLink: {
    alignSelf: 'center',
    marginTop: spacing.lg,
  },
  backLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.plum,
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  successTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 6,
  },
  spamNotice: {
    fontSize: 12,
    color: colors.plum,
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    padding: 10,
    borderRadius: radius.md,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 18,
  },
  backBtn: {
    minWidth: 160,
  },
  textRTL: {
    textAlign: 'right',
  },
});
