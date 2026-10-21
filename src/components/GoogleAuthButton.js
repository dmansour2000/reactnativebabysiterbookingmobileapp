import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { colors, radius, spacing } from '../theme';
import { useLocale } from '../locales';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

const GOOGLE_CLIENT_ID = '146671912539-sctdecp31oeebjq3868adrj9eqbsjl33.apps.googleusercontent.com';

export default function GoogleAuthButton({
  flow = 'login', // 'login' | 'register'
  onSuccess,
}) {
  const { t, locale, isRTL } = useLocale();
  const { handleOAuthSession } = useAuth();
  const isArabic = locale === 'ar';

  const [loading, setLoading] = useState(false);
  const [showWebModal, setShowWebModal] = useState(false);
  const [nonce, setNonce] = useState(null);
  const [pendingGoogleRegistration, setPendingGoogleRegistration] = useState(null);
  const [selectedRole, setSelectedRole] = useState('user'); // 'user' | 'babysitter'
  const [completingRegistration, setCompletingRegistration] = useState(false);

  // 1. Issue nonce from backend
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

  const startGoogleAuth = async () => {
    setLoading(true);
    try {
      const activeNonce = await fetchNonce();
      setNonce(activeNonce);
      setShowWebModal(true);
    } catch (err) {
      Alert.alert(t('error'), err.message || (isArabic ? 'تعذر بدء تسجيل الدخول' : 'Failed to start Google sign-in'));
    } finally {
      setLoading(false);
    }
  };

  // Google GSI HTML page rendered in webview
  const getGsiHtml = (currentNonce) => `
    <!DOCTYPE html>
    <html lang="${locale}">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <title>Google Sign-In</title>
      <script src="https://accounts.google.com/gsi/client" async defer></script>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body {
          display: flex;
          flex-direction: column;
          align-items: center;
          justifyContent: center;
          min-height: 100vh;
          background: #ffffff;
          padding: 24px;
        }
        .header {
          text-align: center;
          margin-bottom: 24px;
        }
        .logo {
          font-size: 32px;
          margin-bottom: 8px;
        }
        .title {
          font-size: 18px;
          font-weight: 700;
          color: #30243a;
          margin-bottom: 4px;
        }
        .subtitle {
          font-size: 13px;
          color: #6c6270;
        }
        .btn-wrapper {
          width: 100%;
          max-width: 320px;
          display: flex;
          justifyContent: center;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">👶</div>
        <div class="title">${isArabic ? 'تسجيل الدخول باستخدام Google' : 'Sign in with Google'}</div>
        <div class="subtitle">${isArabic ? 'منصة كير نست المعتمدة' : 'CareNest Platform'}</div>
      </div>
      <div class="btn-wrapper" id="g_btn"></div>

      <script>
        function handleCredentialResponse(response) {
          if (response && response.credential) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'GOOGLE_CREDENTIAL',
              credential: response.credential
            }));
          }
        }

        window.onload = function () {
          google.accounts.id.initialize({
            client_id: "${GOOGLE_CLIENT_ID}",
            callback: handleCredentialResponse,
            nonce: "${currentNonce}",
            auto_select: false
          });

          google.accounts.id.renderButton(
            document.getElementById("g_btn"),
            {
              theme: "outline",
              size: "large",
              text: "continue_with",
              shape: "rectangular",
              width: 300,
              locale: "${locale}"
            }
          );
        };
      </script>
    </body>
    </html>
  `;

  const onWebViewMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'GOOGLE_CREDENTIAL' && data.credential) {
        setShowWebModal(false);
        setLoading(true);

        const authResult = await apiRequest('/api/user/oauth', {
          method: 'POST',
          body: JSON.stringify({
            provider: 'google',
            credential: data.credential,
            flow,
            nonce,
          }),
        });

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
      }
    } catch (err) {
      console.error('Google Auth Processing Error:', err);
      Alert.alert(t('error'), err.message || (isArabic ? 'فشل تسجيل الدخول عبر Google' : 'Google sign-in failed'));
    } finally {
      setLoading(false);
    }
  };

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
        onPress={startGoogleAuth}
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

      {/* WebView Google Identity Services Modal */}
      <Modal
        visible={showWebModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowWebModal(false)}
      >
        <SafeAreaView style={styles.webModalRoot}>
          <View style={styles.webModalTopBar}>
            <Text style={styles.webModalTitle}>CareNest</Text>
            <TouchableOpacity
              onPress={() => setShowWebModal(false)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={24} color="#30243a" />
            </TouchableOpacity>
          </View>
          {nonce && (
            <WebView
              originWhitelist={['*']}
              source={{
                html: getGsiHtml(nonce),
                baseUrl: 'https://dmansour2000.github.io',
              }}
              onMessage={onWebViewMessage}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              style={{ flex: 1 }}
            />
          )}
        </SafeAreaView>
      </Modal>

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
  webModalRoot: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webModalTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1e8f2',
  },
  webModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.primary,
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
