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
import Input from '../components/Input';
import CaregiverAvatar from '../components/CaregiverAvatar';
import { colors, radius, spacing } from '../theme';
import { useLocale } from '../locales';
import { useAuth } from '../context/AuthContext';
import { apiRequest, API_BASE } from '../services/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CaregiverDetailsScreen({ route, navigation }) {
  const { sitterId, sitter: initialSitter } = route.params || {};
  const { t, isRTL } = useLocale();
  const { isAuthenticated, user } = useAuth();

  const [sitter, setSitter] = useState(initialSitter || null);
  const [loading, setLoading] = useState(!initialSitter);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);

  // Reviews & Rating Modal state
  const [rateModalVisible, setRateModalVisible] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewDescription, setReviewDescription] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviews, setReviews] = useState(initialSitter?.reviews || []);

  useEffect(() => {
    if (initialSitter?.role === 'user') {
      Alert.alert(t('error'), 'Regular user profiles are private.');
      navigation.goBack();
      return;
    }

    (async () => {
      try {
        const data = await apiRequest(`/api/babysitter/users/${sitterId}`);
        const loadedSitter = data?.babysitter || (data?._id ? data : null);
        if (loadedSitter?.role === 'user') {
          Alert.alert(t('error'), 'Regular user profiles are private.');
          navigation.goBack();
          return;
        }
        if (loadedSitter) {
          setSitter(loadedSitter);
          if (Array.isArray(loadedSitter.reviews)) {
            setReviews(loadedSitter.reviews);
          }
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

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      Alert.alert(t('login'), t('loginToBookNotice'));
      return;
    }
    if (!isCaregiverProfile) {
      Alert.alert(t('error'), 'Regular users cannot be rated.');
      return;
    }
    if (!reviewTitle.trim()) {
      Alert.alert(t('error'), 'Please enter a review title.');
      return;
    }
    if (!reviewDescription.trim()) {
      Alert.alert(t('error'), 'Please enter a review description.');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await apiRequest(`/api/babysitter/${sitter._id}/reviews`, {
        method: 'POST',
        body: JSON.stringify({
          rating: selectedRating,
          title: reviewTitle.trim(),
          description: reviewDescription.trim(),
        }),
      });

      if (res.review) {
        setReviews((prev) => [
          res.review,
          ...prev.filter((r) => String(r.userId) !== String(user?.id)),
        ]);
      }
      if (res.stats) {
        setSitter((prev) => ({
          ...prev,
          averageRating: res.stats.averageRating,
          ratingsCount: res.stats.ratingsCount,
        }));
      }

      setRateModalVisible(false);
      setReviewTitle('');
      setReviewDescription('');
      Alert.alert(t('success'), t('reviewSubmittedSuccess'));
    } catch (err) {
      Alert.alert(t('error'), err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

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
  const isCaregiverProfile = sitter?.role !== 'user' && !sitter?.isUser;

  const photoUri = sitter.photoUrl
    ? (sitter.photoUrl.startsWith('http') ? sitter.photoUrl : `${API_BASE}${sitter.photoUrl}`)
    : (sitter._id ? `${API_BASE}/api/babysitter/photo/${sitter._id}` : null);

  const handleBookNow = () => {
    if (isBusy) {
      Alert.alert(
        t('unavailable'),
        t('caregiverCurrentlyBooked')
      );
      return;
    }
    if (!isAuthenticated) {
      Alert.alert(
        t('login'),
        t('loginToBookNotice'),
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
                name={sitter?.name}
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
            <Text style={styles.city}>{sitter.city || (locale === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt')}</Text>

            {/* Star Rating Badge - caregivers only */}
            {isCaregiverProfile && (
              <View style={styles.ratingBadgeLarge}>
                <Ionicons name="star" size={17} color={colors.gold} />
                <Text style={styles.ratingLargeText}>
                  {sitter.averageRating != null ? sitter.averageRating.toFixed(1) : '5.0'} ({sitter.ratingsCount != null ? sitter.ratingsCount : 0})
                </Text>
              </View>
            )}

            <View style={styles.badgeRow}>
              <Badge
                label={isAvailable ? t('available') : t('unavailable')}
                variant={isAvailable ? 'available' : 'busy'}
              />
              <View style={styles.verifiedPill}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                <Text style={styles.verifiedText}>{t('verified')}</Text>
              </View>
            </View>

            {/* Rate Caregiver Action for Regular Users - regular users cannot be rated */}
            {isAuthenticated && user?.role === 'user' && isCaregiverProfile && (
              <TouchableOpacity
                style={styles.rateSitterButton}
                onPress={() => setRateModalVisible(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="star-outline" size={17} color={colors.plum} />
                <Text style={styles.rateSitterButtonText}>{t('rateCaregiver')}</Text>
              </TouchableOpacity>
            )}
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
              <Text style={styles.statValue}>{sitter.experience || 2}+ {t('years')}</Text>
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

        {/* Ratings & Reviews Section */}
        <Card>
          <View style={[styles.reviewsSectionHeader, isRTL && styles.rowRTL]}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {t('ratingsAndReviews')} ({sitter.ratingsCount != null ? sitter.ratingsCount : 0})
            </Text>
            {isAuthenticated && user?.role === 'user' && isCaregiverProfile && (
              <TouchableOpacity
                onPress={() => setRateModalVisible(true)}
                style={styles.headerRateAction}
              >
                <Text style={styles.headerRateActionText}>{t('leaveReview')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {reviews && reviews.length > 0 ? (
            <View style={styles.reviewsList}>
              {reviews.map((rev, idx) => (
                <View key={rev._id || idx} style={styles.reviewItem}>
                  <View style={[styles.reviewTopRow, isRTL && styles.rowRTL]}>
                    <View style={styles.reviewerAvatar}>
                      <Text style={styles.reviewerAvatarLetter}>
                        {(rev.userName || 'U').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.reviewerInfo}>
                      <Text style={[styles.reviewerName, isRTL && styles.textRTL]}>
                        {rev.userName || 'Family Member'}
                      </Text>
                      <Text style={[styles.reviewDate, isRTL && styles.textRTL]}>
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                      </Text>
                    </View>
                    <View style={[styles.starRow, isRTL && styles.rowRTL]}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons
                          key={s}
                          name={s <= rev.rating ? 'star' : 'star-outline'}
                          size={14}
                          color={s <= rev.rating ? colors.gold : '#d3cad6'}
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={[styles.reviewTitleText, isRTL && styles.textRTL]}>
                    {rev.title}
                  </Text>
                  <Text style={[styles.reviewBodyText, isRTL && styles.textRTL]}>
                    {rev.description}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyReviewsBox}>
              <Ionicons name="star-outline" size={32} color={colors.textLight} />
              <Text style={styles.emptyReviewsTitle}>{t('noReviewsYet')}</Text>
              <Text style={styles.emptyReviewsSubtitle}>{t('firstToReview')}</Text>
            </View>
          )}
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

      {/* Rate Caregiver Popup Modal */}
      <Modal
        visible={rateModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setRateModalVisible(false)}
      >
        <View style={styles.rateModalOverlay}>
          <View style={styles.rateModalContent}>
            <View style={[styles.rateModalHeader, isRTL && styles.rowRTL]}>
              <Text style={styles.rateModalTitle}>{t('rateCaregiver')}</Text>
              <TouchableOpacity onPress={() => setRateModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close-circle" size={26} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.rateModalScroll}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              {/* Star selector */}
              <Text style={[styles.starsPickerLabel, isRTL && styles.textRTL]}>
                {t('selectRating')}
              </Text>
              <View style={styles.interactiveStarsRow}>
                {[1, 2, 3, 4, 5].map((starNum) => (
                  <TouchableOpacity
                    key={starNum}
                    onPress={() => setSelectedRating(starNum)}
                    activeOpacity={0.7}
                    style={styles.starTouchTarget}
                  >
                    <Ionicons
                      name={starNum <= selectedRating ? 'star' : 'star-outline'}
                      size={36}
                      color={starNum <= selectedRating ? colors.gold : '#d3cad6'}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <Input
                label={t('reviewTitle')}
                value={reviewTitle}
                onChangeText={setReviewTitle}
                placeholder={t('reviewTitlePlaceholder')}
                required
              />

              <Input
                label={t('reviewDescription')}
                value={reviewDescription}
                onChangeText={setReviewDescription}
                placeholder={t('reviewDescriptionPlaceholder')}
                multiline
                numberOfLines={4}
                required
              />

              <Button
                title={t('submitReview')}
                variant="plum"
                onPress={handleSubmitReview}
                loading={submittingReview}
                style={styles.submitReviewBtn}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

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
                name={sitter?.name}
                style={styles.modalAvatarContainer}
                imageStyle={styles.modalImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.modalSitterName}>{sitter.name}</Text>
            <Text style={styles.modalSitterCity}>{sitter.city || (locale === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt')}</Text>
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
  // Rating & Review styles
  ratingBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#fff9e6',
    borderWidth: 1,
    borderColor: '#ffe8a3',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    marginBottom: 10,
  },
  ratingLargeText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.plum,
  },
  rateSitterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.plum,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    marginTop: 12,
  },
  rateSitterButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  reviewsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerRateAction: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  headerRateActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  reviewsList: {
    marginTop: 6,
  },
  reviewItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1e8f2',
  },
  reviewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 10,
  },
  reviewerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f1e5f3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerAvatarLetter: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.plum,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  reviewDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  starRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 3,
  },
  reviewBodyText: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  emptyReviewsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyReviewsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginTop: 6,
  },
  emptyReviewsSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  // Rate Modal Overlay
  rateModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  rateModalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '90%',
    padding: spacing.lg,
  },
  rateModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  rateModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  rateModalScroll: {
    paddingBottom: 30,
  },
  starsPickerLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  interactiveStarsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: spacing.lg,
  },
  starTouchTarget: {
    padding: 4,
  },
  submitReviewBtn: {
    marginTop: spacing.sm,
    borderRadius: radius.md,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
});
