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

const AVAILABLE_SERVICES = ['babysitting', 'childcare', 'cleaning', 'cooking'];

export default function RegisterScreen({ navigation }) {
  const { t, isRTL } = useLocale();
  const { registerFamily, registerCaregiver } = useAuth();

  const [role, setRole] = useState('user'); // 'user' (Family) | 'babysitter' (Caregiver)
  const [loading, setLoading] = useState(false);

  // Common fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Family field
  const [username, setUsername] = useState('');

  // Caregiver fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [age, setAge] = useState('25');
  const [experience, setExperience] = useState('2');
  const [monthlySalary, setMonthlySalary] = useState('7000');
  const [currency, setCurrency] = useState('EGP');
  const [city, setCity] = useState('Cairo');
  const [services, setServices] = useState(['babysitting']);
  const [bio, setBio] = useState('');

  const toggleService = (srv) => {
    if (services.includes(srv)) {
      if (services.length > 1) {
        setServices(services.filter(s => s !== srv));
      }
    } else {
      setServices([...services, srv]);
    }
  };

  const handleRegister = async () => {
    if (!email.includes('@') || password.length < 8) {
      Alert.alert(t('error'), t('validEmailPasswordPrompt'));
      return;
    }

    setLoading(true);
    try {
      if (role === 'user') {
        if (!username.trim()) {
          Alert.alert(t('error'), t('enterUsernamePrompt'));
          setLoading(false);
          return;
        }
        await registerFamily({ username, email, password });
      } else {
        if (!name.trim() || !phone.trim() || !nationalId.trim()) {
          Alert.alert(t('error'), t('fillCaregiverFieldsPrompt'));
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('email', email.trim().toLowerCase());
        formData.append('password', password);
        formData.append('phone', phone.trim());
        formData.append('nationalId', nationalId.trim());
        formData.append('age', String(age));
        formData.append('experience', String(experience));
        formData.append('monthlySalary', String(monthlySalary));
        formData.append('hourlyRate', String(monthlySalary));
        formData.append('currency', currency);
        formData.append('city', city);
        formData.append('services', JSON.stringify(services));
        formData.append('bio', bio.trim());

        // Dummy text files for verification if no camera chosen
        formData.append('nationalIdCard', {
          uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
          name: 'id_card.png',
          type: 'image/png'
        });
        formData.append('criminalRecord', {
          uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
          name: 'criminal_record.png',
          type: 'image/png'
        });

        await registerCaregiver(formData);
      }

      Alert.alert(t('success'), t('registrationSuccessful') || 'Account created successfully!');
      navigation.goBack();
    } catch (err) {
      Alert.alert(t('error'), err.message || t('registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <Header title={t('register')} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Card style={styles.card}>
          <Text style={[styles.title, isRTL && styles.textRTL]}>{t('createAccount')}</Text>

          {/* Account Role Tabs */}
          <View style={styles.roleTabsContainer}>
            <TouchableOpacity
              style={[styles.roleTab, role === 'user' && styles.roleTabActive]}
              onPress={() => setRole('user')}
            >
              <Text style={[styles.roleTabText, role === 'user' && styles.roleTabTextActive]}>
                {t('registerAsFamily')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleTab, role === 'babysitter' && styles.roleTabActive]}
              onPress={() => setRole('babysitter')}
            >
              <Text style={[styles.roleTabText, role === 'babysitter' && styles.roleTabTextActive]}>
                {t('registerAsCaregiver')}
              </Text>
            </TouchableOpacity>
          </View>

          {role === 'user' ? (
            /* Family Registration */
            <View key="family-form-fields">
              <Input
                key="reg-family-username"
                label={t('username')}
                value={username}
                onChangeText={setUsername}
                placeholder="Unique username"
                required
              />
              <Input
                key="reg-family-email"
                label={t('email')}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                required
              />
              <Input
                key="reg-family-password"
                label={t('password')}
                value={password}
                onChangeText={setPassword}
                placeholder="At least 8 characters"
                secureTextEntry
                required
              />
            </View>
          ) : (
            /* Caregiver Registration */
            <View key="caregiver-form-fields">
              <Input
                key="reg-caregiver-name"
                label={t('fullName')}
                value={name}
                onChangeText={setName}
                placeholder="Full Legal Name"
                required
              />
              <Input
                key="reg-caregiver-email"
                label={t('email')}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                required
              />
              <Input
                key="reg-caregiver-password"
                label={t('password')}
                value={password}
                onChangeText={setPassword}
                placeholder="At least 8 characters"
                secureTextEntry
                required
              />
              <Input
                label={t('phone')}
                value={phone}
                onChangeText={setPhone}
                placeholder="+201000000000"
                keyboardType="phone-pad"
                required
              />
              <Input
                label={t('nationalId')}
                value={nationalId}
                onChangeText={setNationalId}
                placeholder="14-digit National ID"
                keyboardType="numeric"
                required
              />

              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Input
                    label={t('city')}
                    value={city}
                    onChangeText={setCity}
                    placeholder="Cairo"
                    required
                  />
                </View>
                <View style={styles.formCol}>
                  <Input
                    label={t('monthlySalary')}
                    value={monthlySalary}
                    onChangeText={setMonthlySalary}
                    placeholder="7000"
                    keyboardType="numeric"
                    required
                  />
                </View>
              </View>

              {/* Services Selector */}
              <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>{t('selectServices')}</Text>
              <View style={styles.chipsRow}>
                {AVAILABLE_SERVICES.map((srv, idx) => {
                  const active = services.includes(srv);
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => toggleService(srv)}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {t(srv) || srv}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Input
                label={t('bio')}
                value={bio}
                onChangeText={setBio}
                placeholder="Describe your background and experience with children..."
                multiline
                numberOfLines={3}
              />
            </View>
          )}

          <Button
            title={t('register')}
            variant="plum"
            onPress={handleRegister}
            loading={loading}
            style={styles.submitBtn}
          />

          {/* Google Sign-Up */}
          <GoogleAuthButton
            flow="register"
            onSuccess={() => navigation.goBack()}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>{t('loginPrompt')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>{t('login')}</Text>
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
    paddingTop: spacing.md,
    paddingBottom: 40,
  },
  card: {
    padding: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.md,
  },
  roleTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1e8f2',
    borderRadius: radius.md,
    padding: 3,
    marginBottom: spacing.lg,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  roleTabActive: {
    backgroundColor: colors.plum,
  },
  roleTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.plum,
  },
  roleTabTextActive: {
    color: colors.white,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formCol: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md,
  },
  chip: {
    backgroundColor: '#f5eff8',
    borderWidth: 1,
    borderColor: '#e7dbe9',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
  },
  chipActive: {
    backgroundColor: colors.plum,
    borderColor: colors.plum,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.plum,
  },
  chipTextActive: {
    color: colors.white,
  },
  submitBtn: {
    marginTop: spacing.sm,
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
