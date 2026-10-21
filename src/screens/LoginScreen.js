import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { colors, radius, spacing } from '../theme';
import { useLocale } from '../locales';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { t, isRTL } = useLocale();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier.trim() || !password) {
      Alert.alert(t('error'), t('enterCredentialsPrompt'));
      return;
    }

    setLoading(true);
    try {
      const data = await login(identifier, password);
      if (data?.user?.role === 'babysitter') {
        navigation.navigate('Main', { screen: 'BookingsTab' });
      } else {
        navigation.navigate('Main', { screen: 'ExploreTab' });
      }
    } catch (err) {
      Alert.alert(t('error'), err.message || t('loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <Header title={t('login')} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Card style={styles.card}>
          <Text style={[styles.title, isRTL && styles.textRTL]}>{t('login')}</Text>
          <Text style={[styles.subtitle, isRTL && styles.textRTL]}>{t('welcome')}</Text>

          <Input
            key="login-identifier"
            label={t('email') + ' / ' + t('username')}
            value={identifier}
            onChangeText={setIdentifier}
            placeholder="user@example.com or username"
            autoCapitalize="none"
            required
          />

          <Input
            key="login-password"
            label={t('password')}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            required
          />

          <TouchableOpacity
            style={[styles.forgotBtn, isRTL && styles.alignLeft]}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotText}>{t('forgotPassword')}</Text>
          </TouchableOpacity>

          <Button
            title={t('login')}
            variant="plum"
            onPress={handleLogin}
            loading={loading}
            style={styles.submitBtn}
          />

          {/* Google Sign-In */}
          <GoogleAuthButton
            flow="login"
            onSuccess={(authResult) => {
              if (authResult?.user?.role === 'babysitter') {
                navigation.navigate('Main', { screen: 'BookingsTab' });
              } else {
                navigation.navigate('Main', { screen: 'ExploreTab' });
              }
            }}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>{t('signUpPrompt')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>{t('register')}</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: spacing.md,
  },
  alignLeft: {
    alignSelf: 'flex-start',
  },
  forgotText: {
    color: colors.plum,
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: spacing.xs,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  textRTL: {
    textAlign: 'right',
  },
});
