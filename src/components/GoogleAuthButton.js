import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { colors, radius, spacing } from '../theme';
import { useLocale } from '../locales';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

WebBrowser.maybeCompleteAuthSession();

// The Google Web Client ID configured on backend
const GOOGLE_CLIENT_ID = '146671912539-sctdecp31oeebjq3868adrj9eqbsjl33.apps.googleusercontent.com';

export default function GoogleAuthButton({
  flow = 'login', // 'login' | 'register'
  onSuccess,
}) {
  const { t, locale, isRTL } = useLocale();
  const { handleOAuthSession } = useAuth();
  const isArabic = locale === 'ar';

  const [loading, setLoading] = useState(false);
  const [pendingGoogleRegistration, setPendingGoogleRegistration] = useState(null);
  const [selectedRole, setSelectedRole] = useState('user'); // 'user' (Family) | 'babysitter' (Caregiver)
  const [completingRegistration, setCompletingRegistration] = useState(false);

  // Issue nonce from backend
  const fetchNonce = async () => {
    const data = await apiRequest('/api/user/oauth/nonce', {
      method: 'POST',
      body: JSON.stringify({ provider: 'google' }),
    });
    if (!data?.nonce) {
      throw new Error(isArabic ? 'تعذر الاتصال بخدمة تسجيل الدخول' : 'Could not fetch OAuth nonce');
    }
    return data.nonce;
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const nonce = await fetchNonce();

      // Configure Google OAuth Request with nonce and id_token response
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'carenest',
        preferLocalhost: false,
      });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
        `&response_type=id_token` +
        `&scope=${encodeURIComponent('openid email profile')}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&nonce=${encodeURIComponent(nonce)}` +
        `&prompt=select_account`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        // Parse the id_token returned in URL hash or query params
        const urlPart = result.url.includes('#') ? result.url.split('#')[1] : result.url.split('?')[1];
        const params = new URLSearchParams(urlPart);
        const idToken = params.get('id_token');

        if (!idToken) {
          throw new Error(isArabic ? 'لم يتم العثور على رمز Google' : 'Google ID token was not returned');
        }

        // Send to backend /api/user/oauth
        const authResult = await apiRequest('/api/user/oauth', {
          method: 'POST',
          body: JSON.stringify({
            provider: 'google',
            credential: idToken,
            flow,
            nonce,
          }),
        });

        // Check if registration requires choosing role
        if (authResult.registrationRequired && authResult.registrationToken) {
          setPendingGoogleRegistration(authResult);
          return;
        }

        if (authResult.token && authResult.user) {
          await handleOAuthSession(authResult);
          Alert.alert(t('success'), t('loginSuccess'));
          onSuccess?.(authResult);
        } else {
          throw new Error(authResult.msg || (isArabic ? 'فشل تسجيل الدخول عبر Google' : 'Google sign-in failed'));
        }
      } else if (result.type === 'cancel' || result.type === 'dismiss') {
        // User closed the browser window
      } else {
        throw new Error(isArabic ? 'تم إلغاء عملية التسجيل' : 'Authentication was cancelled');
      }
    } catch (err) {
      console.error('Google Auth Error:', err);
      const msg = err.message || (isArabic ? 'فشل تسجيل الدخول عبر Google' : 'Google authentication failed');
      Alert.alert(t('error'), msg);
    } finally {
      setLoading(false);
    }
  };

  // Complete Google Registration by selecting role
  const finishGoogleRegistration = async () => {
    if (!pendingGoogleRegistration?.registrationToken) return;
    setCompletingRegistration(true);
    try {
      const res = await apiRequest('/api/user/oauth/complete-registration', {
        method: 'POST',
        body: JSON.stringify({
          registrationToken: pendingGoogleRegistration.registrationToken,
          role: selectedRole,
        }),
      });

      if (res.token && res.user) {
        await handleOAuthSession(res);
        setPendingGoogleRegistration(null);
        Alert.alert(
          t('success'),
          isArabic ? 'تم إنشاء الحساب بنجاح عبر Google!' : 'Account registered successfully with Google!'
        );
        onSuccess?.(res);
      } else {
        throw new Error(res.msg || (isArabic ? 'تعذر إتمام التسجيل' : 'Could not complete registration'));
      }
    } catch (err) {
      Alert.alert(t('error'), err.message || (isArabic ? 'تعذر إتمام التسجيل' : 'Registration failed'));
    } finally {
      setCompletingRegistration(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>
          {isArabic ? 'أو المتابعة باستخدام' : 'or continue with'}
        </Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleGoogleAuth}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#4285F4" />
        ) : (
          <View style={[styles.buttonContent, isRTL && styles.rowRTL]}>
            <View style={styles.googleIconCircle}>
              <Ionicons name="logo-google" size={18} color="#EA4335" />
            </View>
            <Text style={styles.buttonText}>
              {flow === 'register'
                ? (isArabic ? 'التسجيل بواسطة Google' : 'Sign up with Google')
                : (isArabic ? 'المتابعة باستخدام Google' : 'Continue with Google')}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Role Selection Modal when registering with Google */}
      <Modal
        visible={!!pendingGoogleRegistration}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPendingGoogleRegistration(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalBadge}>
                <Ionicons name="logo-google" size={24} color="#EA4335" />
              </View>
              <Text style={styles.modalTitle}>
                {isArabic ? 'أكملي إنشاء حسابك في كير نست' : 'Complete your CareNest account'}
              </Text>
              <Text style={styles.modalSubtitle}>
                {pendingGoogleRegistration?.googleUser?.email}
              </Text>
            </View>

            <Text style={[styles.roleSelectHeading, isRTL && styles.textRTL]}>
              {isArabic ? 'أرغب في الانضمام إلى كير نست بصفة:' : 'I want to join CareNest as:'}
            </Text>

            {/* Role Options */}
            <View style={styles.rolesRow}>
              <TouchableOpacity
                style={[
                  styles.roleOption,
                  selectedRole === 'user' && styles.roleOptionActive,
                ]}
                onPress={() => setSelectedRole('user')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="home"
                  size={20}
                  color={selectedRole === 'user' ? '#ffffff' : colors.plum}
                />
                <Text
                  style={[
                    styles.roleOptionText,
                    selectedRole === 'user' && styles.roleOptionTextActive,
                  ]}
                >
                  {isArabic ? 'عائلة / ولي أمر' : 'Family Account'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleOption,
                  selectedRole === 'babysitter' && styles.roleOptionActive,
                ]}
                onPress={() => setSelectedRole('babysitter')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="heart"
                  size={20}
                  color={selectedRole === 'babysitter' ? '#ffffff' : colors.plum}
                />
                <Text
                  style={[
                    styles.roleOptionText,
                    selectedRole === 'babysitter' && styles.roleOptionTextActive,
                  ]}
                >
                  {isArabic ? 'مقدمة رعاية / جليسة' : 'Caregiver Account'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.modalSubmitBtn}
              onPress={finishGoogleRegistration}
              disabled={completingRegistration}
              activeOpacity={0.8}
            >
              {completingRegistration ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.modalSubmitText}>
                  {isArabic ? 'تأكيد ودخول المنصة' : 'Confirm & Continue'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setPendingGoogleRegistration(null)}
            >
              <Text style={styles.modalCancelText}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e7dbe9',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: '#8b8090',
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#dadce0',
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  googleIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3c4043',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(26, 12, 34, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: radius.xl,
    padding: spacing.lg,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#30243a',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#7a3b79',
    fontWeight: '600',
  },
  roleSelectHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4e4354',
    marginBottom: 10,
  },
  rolesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: '#e7dbe9',
    backgroundColor: '#faf5ff',
    alignItems: 'center',
    gap: 6,
  },
  roleOptionActive: {
    backgroundColor: '#683f80',
    borderColor: '#683f80',
  },
  roleOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#683f80',
    textAlign: 'center',
  },
  roleOptionTextActive: {
    color: '#ffffff',
  },
  modalSubmitBtn: {
    backgroundColor: '#683f80',
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  modalSubmitText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  modalCancelBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    color: '#8b8090',
    fontWeight: '600',
  },
  textRTL: {
    textAlign: 'right',
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
});
