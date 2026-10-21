import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import CaregiverAvatar from '../components/CaregiverAvatar';
import { colors, radius, spacing } from '../theme';
import { useLocale } from '../locales';
import { useAuth } from '../context/AuthContext';
import { apiRequest, API_BASE } from '../services/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CaregiverDetailsScreen({ route, navigation }) {
  const { sitterId, sitter: initialSitter } = route.params || {};
  const { t, isRTL } = useLocale();
  const { isAuthenticated } = useAuth();

  const [sitter, setSitter] = useState(initialSitter || null);
  const [loading, setLoading] = useState(!initialSitter);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiRequest(`/api/babysitter/users/${sitterId}`);
        if (data?.babysitter) {
          setSitter(data.babysitter);
        } else if (data?._id) {
          setSitter(data);
        }
      } catch (err) {
        console.warn('Failed to load caregiver:', err.message);
        if (!sitter) {
          Alert.alert(t('error'), err.message || 'Could not load caregiver details');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [sitterId]);

  if (loading && !sitter) {
    return (
      <ScreenWrapper>
        <Header showBack navigation={navigation} title={sitter?.name} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.plum} />
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!sitter) {
    return (
      <ScreenWrapper>
        <Header showBack navigation={navigation} title={sitter?.name} />
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>{t('noSittersFound')}</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // Only put the busy status if they are both currently booked and accepted that booking
  const isBusy = !!(sitter.hasAcceptedBooking || sitter.isBookedAndAccepted);
  const isAvailable = !isBusy;
  const servicesList = Array.isArray(sitter.services) ? sitter.services : [];

  const photoUri = sitter.photoUrl
    ? (sitter.photoUrl.startsWith('http') ? sitter.photoUrl : `${API_BASE}${sitter.photoUrl}`)
    : (sitter._id ? `${API_BASE}/api/babysitter/photo/${sitter._id}` : null);

  const handleBookNow = () => {
    if (isBusy) {
      Alert.alert(
        t('unavailable'),
        isRTL ? 'هذه الجليسة مشغولة حالياً بحجز مؤكد.' : 'This caregiver is currently booked and unavailable.'
      );
      return;
    }
    if (!isAuthenticated) {
      Alert.alert(
        t('login'),
        isRTL ? 'يرجى تسجيل الدخول بحساب عائلة لحجز الجليسة.' : 'Please sign in with a family account to book this caregiver.',
        [
          { text: t('close'), style: 'cancel' },
          { text: t('login'), onPress: () => navigation.navigate('ProfileTab') },
        ]
      );
      return;
    }
    navigation.navigate('BookCaregiver', { sitter });
  };

  return (
    <ScreenWrapper>
      <Header showBack navigation={navigation} title={sitter?.name} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.profileCard}>
          <View style={styles.avatarSection}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setPhotoModalVisible(true)}
              style={styles.avatarWrapper}
            >
              <CaregiverAvatar
                uri={photoUri}
                style={styles.avatarImage}
                imageStyle={styles.avatarImage}
              />
              <View style={styles.zoomBadge}>
                <Ionicons name="expand" size={13} color={colors.white} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setPhotoModalVisible(true)}
              style={styles.enlargeHintBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="search" size={12} color={colors.primary} />
              <Text style={styles.enlargeHintText}>{t('tapToEnlarge') || 'Tap photo to enlarge'}</Text>
            </TouchableOpacity>

            <Text style={styles.name}>{sitter.name}</Text>
            <Text style={styles.city}>{sitter.city || 'Cairo, Egypt'}</Text>

            <View style={styles.badgeRow}>
              <Badge
                label={isAvailable ? t('available') : t('unavailable')}
                variant={isAvailable ? 'available' : 'busy'}
              />
              <View style={styles.verifiedPill}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>
          </View>

          {/* Key Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {Number(sitter.monthlySalary != null ? sitter.monthlySalary : (sitter.hourlyRate || 7000)).toLocaleString()} {sitter.currency || 'EGP'}
              </Text>
              <Text style={styles.statLabel}>{t('monthlySalary')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{sitter.experience || 2}+ Yrs</Text>
              <Text style={styles.statLabel}>{t('experienceYears')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{sitter.age || 25}</Text>
              <Text style={styles.statLabel}>{t('age')}</Text>
            </View>
          </View>
        </Card>

        {/* Bio Section */}
        {sitter.bio ? (
          <Card>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('bio')}</Text>
            <Text style={[styles.bioText, isRTL && styles.textRTL]}>{sitter.bio}</Text>
          </Card>
        ) : null}

        {/* Services Section */}
        <Card>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('selectServices')}</Text>
          <View style={styles.servicesGrid}>
            {servicesList.map((srv, idx) => (
              <View key={idx} style={styles.serviceItem}>
                <Ionicons name="sparkles" size={14} color={colors.primary} />
                <Text style={styles.serviceItemText}>{t(srv) || srv}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Booking CTA Button */}
        <View style={styles.ctaContainer}>
          <Button
            title={isAvailable ? t('bookCaregiver') : t('unavailable')}
            variant={isAvailable ? 'plum' : 'outline'}
            onPress={handleBookNow}
            disabled={!isAvailable}
            icon={<Ionicons name="calendar-outline" size={18} color={isAvailable ? colors.white : colors.textMuted} />}
            style={styles.ctaButton}
          />
        </View>
      </ScrollView>

      {/* Full-Screen Photo Modal */}
      <Modal
        visible={photoModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setPhotoModalVisible(false)}
            activeOpacity={0.7}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Ionicons name="close-circle" size={36} color="#ffffff" />
          </TouchableOpacity>

          <View style={styles.modalContent}>
            <View style={styles.modalImageCard}>
              <CaregiverAvatar
                uri={photoUri}
                style={styles.modalAvatarContainer}
                imageStyle={styles.modalImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.modalSitterName}>{sitter.name}</Text>
            <Text style={styles.modalSitterCity}>{sitter.city || 'Cairo, Egypt'}</Text>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  loadingText: {
    marginTop: 8,
    color: colors.plum,
    fontWeight: '600',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: colors.primary,
    marginBottom: 6,
    position: 'relative',
    backgroundColor: '#f5eff7',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
  zoomBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: colors.plum,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  enlargeHintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    backgroundColor: '#f3e8f4',
  },
  enlargeHintText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  city: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successBg,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.success,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#f1e8f2',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#e7dbe9',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.plum,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  bioText: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fbf7fb',
    borderWidth: 1,
    borderColor: '#eedcee',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.md,
  },
  serviceItemText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  ctaContainer: {
    marginTop: spacing.md,
  },
  ctaButton: {
    paddingVertical: 15,
    borderRadius: radius.lg,
  },
  textRTL: {
    textAlign: 'right',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 5, 15, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 25,
    zIndex: 10,
  },
  modalContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  modalImageCard: {
    width: Math.min(SCREEN_WIDTH - 40, 320),
    height: Math.min(SCREEN_WIDTH - 40, 320),
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: spacing.md,
  },
  modalAvatarContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5eff7',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalSitterName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 8,
    textAlign: 'center',
  },
  modalSitterCity: {
    fontSize: 14,
    color: '#e7dbe9',
    marginTop: 4,
    textAlign: 'center',
  },
});
