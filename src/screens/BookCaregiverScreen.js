import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import CaregiverAvatar from '../components/CaregiverAvatar';
import { colors, radius, spacing } from '../theme';
import { useLocale } from '../locales';
import { apiRequest, API_BASE } from '../services/api';

export default function BookCaregiverScreen({ route, navigation }) {
  const { sitter } = route.params || {};
  const { t, isRTL } = useLocale();

  const [service, setService] = useState(sitter?.services?.[0] || 'babysitting');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [startHour, setStartHour] = useState('10:00');
  const [endHour, setEndHour] = useState('14:00');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Duration & Salary
  const durationHours = 4; // default between 10:00 and 14:00
  const monthlySalary = sitter?.monthlySalary != null ? sitter.monthlySalary : (sitter?.hourlyRate || 7000);
  const currency = sitter?.currency || 'EGP';
  const estimatedHourly = Math.round(monthlySalary / (26 * 8));
  const totalCost = Math.max(durationHours * estimatedHourly, 250);

  const handleBookingSubmit = async () => {
    if (!address.trim()) {
      Alert.alert(t('error'), t('pleaseEnterAddress'));
      return;
    }

    setSubmitting(true);
    try {
      const startTime = new Date(`${date}T${startHour}:00`).toISOString();
      const endTime = new Date(`${date}T${endHour}:00`).toISOString();

      await apiRequest('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          babysitterId: sitter._id,
          startTime,
          endTime,
          service,
          address: address.trim(),
          notes: notes.trim(),
        }),
      });

      Alert.alert(
        t('success'),
        t('bookingSuccess'),
        [
          {
            text: t('viewMyBookings'),
            onPress: () => navigation.navigate('BookingsTab'),
          },
        ]
      );
    } catch (err) {
      Alert.alert(t('error'), err.message || t('bookingSubmitFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const servicesList = Array.isArray(sitter?.services) ? sitter.services : ['babysitting'];

  const photoUri = sitter?.photoUrl
    ? (sitter.photoUrl.startsWith('http') ? sitter.photoUrl : `${API_BASE}${sitter.photoUrl}`)
    : (sitter?._id ? `${API_BASE}/api/babysitter/photo/${sitter._id}` : null);

  return (
    <ScreenWrapper>
      <Header showBack navigation={navigation} title={t('bookCaregiver')} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Card>
          <View style={[styles.sitterHeaderRow, isRTL && styles.rowRTL]}>
            <CaregiverAvatar
              uri={photoUri}
              name={sitter?.name}
              style={styles.headerAvatar}
              imageStyle={styles.headerAvatarImage}
            />
            <View style={styles.headerTextCol}>
              <Text style={[styles.heading, isRTL && styles.textRTL]}>{t('bookingDetails')}</Text>
              <Text style={[styles.subheading, isRTL && styles.textRTL]}>
                {t('bookingWith')} <Text style={styles.boldText}>{sitter?.name}</Text>
              </Text>
            </View>
          </View>

          {/* Service Selector */}
          <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>{t('selectServices')}</Text>
          <View style={styles.serviceChipsRow}>
            {servicesList.map((srv, idx) => {
              const active = service === srv;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.serviceChip, active && styles.serviceChipActive]}
                  onPress={() => setService(srv)}
                >
                  <Text style={[styles.serviceChipText, active && styles.serviceChipTextActive]}>
                    {t(srv) || srv}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Date & Times */}
          <Input
            label={t('selectDate')}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            required
          />

          <View style={styles.timeRow}>
            <View style={styles.timeInputWrapper}>
              <Input
                label={t('startTime')}
                value={startHour}
                onChangeText={setStartHour}
                placeholder="10:00"
                required
              />
            </View>
            <View style={styles.timeInputWrapper}>
              <Input
                label={t('endTime')}
                value={endHour}
                onChangeText={setEndHour}
                placeholder="14:00"
                required
              />
            </View>
          </View>

          {/* Address */}
          <Input
            label={t('address')}
            value={address}
            onChangeText={setAddress}
            placeholder={t('addressPlaceholder')}
            multiline
            numberOfLines={2}
            required
          />

          {/* Notes */}
          <Input
            label={t('notes')}
            value={notes}
            onChangeText={setNotes}
            placeholder={t('bookingNotesPlaceholder')}
            multiline
            numberOfLines={3}
          />

          {/* Cost Summary Box */}
          <View style={styles.costBox}>
            <Text style={styles.costLabel}>{t('monthlySalary')}</Text>
            <Text style={styles.costAmount}>
              {Number(monthlySalary).toLocaleString()} {currency} {t('perMonth')}
            </Text>
            <Text style={styles.costDisclaimer}>
              {t('estimatedCost')}: ~ {totalCost} {currency} ({durationHours} {t('hours')})
            </Text>
          </View>

          <Button
            title={t('confirmBooking')}
            variant="plum"
            onPress={handleBookingSubmit}
            loading={submitting}
            style={styles.submitButton}
          />
        </Card>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  sitterHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: spacing.md,
  },
  headerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.primary,
    overflow: 'hidden',
  },
  headerAvatarImage: {
    width: '100%',
    height: '100%',
  },
  headerTextCol: {
    flex: 1,
  },
  heading: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2,
  },
  subheading: {
    fontSize: 14,
    color: colors.textMuted,
  },
  boldText: {
    color: colors.plum,
    fontWeight: '700',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  serviceChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md,
  },
  serviceChip: {
    backgroundColor: '#f5eff8',
    borderWidth: 1,
    borderColor: '#e7dbe9',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
  },
  serviceChipActive: {
    backgroundColor: colors.plum,
    borderColor: colors.plum,
  },
  serviceChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.plum,
  },
  serviceChipTextActive: {
    color: colors.white,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInputWrapper: {
    flex: 1,
  },
  costBox: {
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  costLabel: {
    fontSize: 12,
    color: colors.plum,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  costAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.plum,
    marginVertical: 4,
  },
  costDisclaimer: {
    fontSize: 11,
    color: colors.textMuted,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  textRTL: {
    textAlign: 'right',
  },
});
