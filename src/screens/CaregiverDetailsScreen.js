import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { colors, radius, spacing } from '../theme';
import { useLocale } from '../locales';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

export default function CaregiverDetailsScreen({ route, navigation }) {
  const { sitterId } = route.params || {};
  const { t, isRTL } = useLocale();
  const { isAuthenticated, isFamily } = useAuth();

  const [sitter, setSitter] = useState(null);
  const [loading, setLoading] = useState(true);

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
        Alert.alert(t('error'), err.message || 'Could not load caregiver details');
      } finally {
        setLoading(false);
      }
    })();
  }, [sitterId]);

  if (loading) {
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

  const isAvailable = !!sitter.isAvailable;
  const servicesList = Array.isArray(sitter.services) ? sitter.services : [];

  const handleBookNow = () => {
    if (!isAuthenticated) {
      Alert.alert(
        t('login'),
        'Please sign in with a family account to book this caregiver.',
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
            <View style={styles.avatarWrapper}>
              {sitter.hasProfilePhoto ? (
                <Image
                  source={{ uri: `https://nodejsbabysitterbookingplatformbackend.onrender.com/api/babysitter/photo/${sitter._id}` }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitials}>
                    {(sitter.name || 'C').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

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
              <Text style={styles.statValue}>{sitter.hourlyRate || 100} {sitter.currency || 'EGP'}</Text>
              <Text style={styles.statLabel}>{t('hourlyRate')}</Text>
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
            title={t('bookCaregiver')}
            variant="plum"
            onPress={handleBookNow}
            icon={<Ionicons name="calendar-outline" size={18} color={colors.white} />}
            style={styles.ctaButton}
          />
        </View>
      </ScrollView>
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
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.primary,
    marginBottom: 10,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.plum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 34,
    color: colors.white,
    fontWeight: '800',
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
});
