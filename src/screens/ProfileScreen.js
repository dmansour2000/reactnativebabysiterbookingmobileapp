import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Switch,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Input from '../components/Input';
import { colors, radius, spacing } from '../theme';
import { useLocale } from '../locales';
import { useAuth } from '../context/AuthContext';
import { apiRequest, getApiBaseUrl, setApiBaseUrl } from '../services/api';

export default function ProfileScreen({ navigation }) {
  const { t, locale, setLocale, isRTL } = useLocale();
  const { user, isAuthenticated, isCaregiver, logout, changePassword, changeEmail } = useAuth();

  // Caregiver availability toggle
  const [isAvailable, setIsAvailable] = useState(true);
  const [togglingAvailability, setTogglingAvailability] = useState(false);

  // Password Modal
  const [passwordModal, setPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Email Modal
  const [emailModal, setEmailModal] = useState(false);
  const [emailCurrentPassword, setEmailCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);

  // Server URL Modal
  const [serverModal, setServerModal] = useState(false);
  const [serverUrl, setServerUrl] = useState('');

  const handleToggleAvailability = async (val) => {
    setIsAvailable(val);
    setTogglingAvailability(true);
    try {
      await apiRequest('/api/babysitter/availability', {
        method: 'PATCH',
        body: JSON.stringify({ isAvailable: val }),
      });
      Alert.alert(t('success'), `Availability set to ${val ? 'Available' : 'Busy'}`);
    } catch (err) {
      setIsAvailable(!val);
      Alert.alert(t('error'), err.message || 'Failed to update availability');
    } finally {
      setTogglingAvailability(false);
    }
  };

  const handleSavePassword = async () => {
    if (!currentPassword || newPassword.length < 8) {
      Alert.alert(t('error'), 'New password must be at least 8 characters.');
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      Alert.alert(t('success'), 'Password updated successfully!');
    } catch (err) {
      Alert.alert(t('error'), err.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveEmail = async () => {
    if (!emailCurrentPassword || !newEmail.includes('@')) {
      Alert.alert(t('error'), 'Please enter a valid email address.');
      return;
    }
    setSavingEmail(true);
    try {
      await changeEmail(emailCurrentPassword, newEmail);
      setEmailModal(false);
      setEmailCurrentPassword('');
      setNewEmail('');
      Alert.alert(t('success'), 'Email address updated!');
    } catch (err) {
      Alert.alert(t('error'), err.message || 'Failed to update email');
    } finally {
      setSavingEmail(false);
    }
  };

  const handleOpenServerModal = async () => {
    const current = await getApiBaseUrl();
    setServerUrl(current);
    setServerModal(true);
  };

  const handleSaveServerUrl = async () => {
    await setApiBaseUrl(serverUrl);
    setServerModal(false);
    Alert.alert(t('success'), 'API Base URL updated.');
  };

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      'Are you sure you want to sign out?',
      [
        { text: t('close'), style: 'cancel' },
        { text: t('logout'), style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <ScreenWrapper>
      <Header title={t('profile')} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isAuthenticated ? (
          <>
            {/* Account Card */}
            <Card style={styles.userCard}>
              <View style={[styles.userHeader, isRTL && styles.rowRTL]}>
                <View style={styles.avatarBadge}>
                  <Text style={styles.avatarLetter}>
                    {(user?.username || user?.name || 'U').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.username}>{user?.username || user?.name}</Text>
                  <Text style={styles.userEmail}>{user?.email}</Text>
                  <Badge
                    label={user?.role?.toUpperCase() || 'USER'}
                    variant={user?.role === 'babysitter' ? 'primary' : 'tag'}
                    style={styles.roleBadge}
                  />
                </View>
              </View>
            </Card>

            {/* Caregiver Quick Controls */}
            {isCaregiver && (
              <Card>
                <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>Caregiver Controls</Text>
                <View style={[styles.toggleRow, isRTL && styles.rowRTL]}>
                  <View style={styles.toggleInfo}>
                    <Text style={styles.toggleTitle}>{t('available')}</Text>
                    <Text style={styles.toggleSub}>
                      Accepting new family booking requests
                    </Text>
                  </View>
                  <Switch
                    value={isAvailable}
                    onValueChange={handleToggleAvailability}
                    trackColor={{ false: '#e2d7e5', true: colors.primary }}
                    thumbColor={isAvailable ? colors.white : '#f4f3f4'}
                    disabled={togglingAvailability}
                  />
                </View>
              </Card>
            )}

            {/* Security Section */}
            <Card>
              <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('accountSecurity')}</Text>
              
              <TouchableOpacity
                style={[styles.menuItem, isRTL && styles.rowRTL]}
                onPress={() => setPasswordModal(true)}
              >
                <Ionicons name="key-outline" size={20} color={colors.plum} />
                <Text style={styles.menuItemText}>{t('changePassword')}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuItem, isRTL && styles.rowRTL]}
                onPress={() => setEmailModal(true)}
              >
                <Ionicons name="mail-outline" size={20} color={colors.plum} />
                <Text style={styles.menuItemText}>{t('changeEmail')}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
              </TouchableOpacity>
            </Card>
          </>
        ) : (
          /* Unauthenticated State */
          <Card style={styles.authPromptCard}>
            <Ionicons name="person-circle-outline" size={60} color={colors.plum} />
            <Text style={styles.authPromptTitle}>{t('welcome')}</Text>
            <Text style={styles.authPromptSubtitle}>
              Sign in or create an account to start booking verified caregivers or offer child care services.
            </Text>

            <View style={styles.authButtonsRow}>
              <Button
                title={t('login')}
                variant="plum"
                onPress={() => navigation.navigate('Login')}
                style={styles.authBtn}
              />
              <Button
                title={t('register')}
                variant="outline"
                onPress={() => navigation.navigate('Register')}
                style={styles.authBtn}
              />
            </View>
          </Card>
        )}

        {/* Preferences / Settings */}
        <Card>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>App Settings</Text>

          <TouchableOpacity
            style={[styles.menuItem, isRTL && styles.rowRTL]}
            onPress={() => setLocale(locale === 'en' ? 'ar' : 'en')}
          >
            <Ionicons name="globe-outline" size={20} color={colors.plum} />
            <Text style={styles.menuItemText}>{t('language')}</Text>
            <Text style={styles.settingValueText}>{locale === 'en' ? 'English' : 'العربية'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, isRTL && styles.rowRTL]}
            onPress={handleOpenServerModal}
          >
            <Ionicons name="server-outline" size={20} color={colors.plum} />
            <Text style={styles.menuItemText}>Backend API Server</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
        </Card>

        {isAuthenticated && (
          <Button
            title={t('logout')}
            variant="danger"
            onPress={handleLogout}
            icon={<Ionicons name="log-out-outline" size={18} color={colors.white} />}
            style={styles.logoutBtn}
          />
        )}
      </ScrollView>

      {/* Password Modal */}
      <Modal visible={passwordModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalHeader, isRTL && styles.rowRTL]}>
              <Text style={styles.modalTitle}>{t('changePassword')}</Text>
              <TouchableOpacity onPress={() => setPasswordModal(false)}>
                <Ionicons name="close-circle" size={26} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Input
              label={t('currentPassword')}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              required
            />
            <Input
              label={t('newPassword')}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="Min 8 characters"
              required
            />
            <Button
              title={t('saveChanges')}
              variant="plum"
              onPress={handleSavePassword}
              loading={savingPassword}
            />
          </View>
        </View>
      </Modal>

      {/* Email Modal */}
      <Modal visible={emailModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalHeader, isRTL && styles.rowRTL]}>
              <Text style={styles.modalTitle}>{t('changeEmail')}</Text>
              <TouchableOpacity onPress={() => setEmailModal(false)}>
                <Ionicons name="close-circle" size={26} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Input
              label={t('currentPassword')}
              value={emailCurrentPassword}
              onChangeText={setEmailCurrentPassword}
              secureTextEntry
              required
            />
            <Input
              label={t('email')}
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
              placeholder="new@example.com"
              required
            />
            <Button
              title={t('saveChanges')}
              variant="plum"
              onPress={handleSaveEmail}
              loading={savingEmail}
            />
          </View>
        </View>
      </Modal>

      {/* API Server Modal */}
      <Modal visible={serverModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalHeader, isRTL && styles.rowRTL]}>
              <Text style={styles.modalTitle}>Configure API Server</Text>
              <TouchableOpacity onPress={() => setServerModal(false)}>
                <Ionicons name="close-circle" size={26} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Input
              label="Backend Endpoint URL"
              value={serverUrl}
              onChangeText={setServerUrl}
              placeholder="https://..."
            />
            <Button
              title={t('saveChanges')}
              variant="plum"
              onPress={handleSaveServerUrl}
            />
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 80,
  },
  userCard: {
    paddingVertical: spacing.md,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.plum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.white,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  userEmail: {
    fontSize: 13,
    color: colors.textMuted,
    marginVertical: 2,
  },
  roleBadge: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  toggleSub: {
    fontSize: 12,
    color: colors.textMuted,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1e8f2',
    gap: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  settingValueText: {
    fontSize: 13,
    color: colors.plum,
    fontWeight: '700',
  },
  authPromptCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  authPromptTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginTop: 10,
    marginBottom: 6,
  },
  authPromptSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  authButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  authBtn: {
    flex: 1,
  },
  logoutBtn: {
    marginTop: spacing.md,
    borderRadius: radius.md,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  textRTL: {
    textAlign: 'right',
  },
});
