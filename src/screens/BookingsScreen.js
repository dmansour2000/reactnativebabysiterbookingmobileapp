import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
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

const STATUS_FILTERS = ['all', 'pending', 'accepted', 'confirmed', 'completed', 'cancelled'];

export default function BookingsScreen({ navigation }) {
  const { t, locale, isRTL } = useLocale();
  const { isAuthenticated, isCaregiver, user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const fetchBookings = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const data = await apiRequest('/api/bookings');
      if (Array.isArray(data)) {
        setBookings(data);
      }
    } catch (err) {
      console.warn('Failed to load bookings:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return t('statusPending');
      case 'accepted':
        return t('statusAccepted');
      case 'confirmed':
        return t('statusConfirmed');
      case 'completed':
        return t('statusCompleted');
      case 'cancelled':
        return t('statusCancelled');
      case 'declined':
        return t('statusDeclined');
      default:
        return t(`status${status.charAt(0).toUpperCase() + status.slice(1)}`) || status;
    }
  };

  const handleCancelBooking = (bookingId) => {
    Alert.alert(
      t('cancelBooking'),
      t('confirmCancelBooking'),
      [
        { text: t('close'), style: 'cancel' },
        {
          text: t('cancelBooking'),
          style: 'destructive',
          onPress: async () => {
            try {
              await apiRequest(`/api/bookings/${bookingId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({
                  status: 'cancelled',
                  cancellationReason: t('cancellationReasonDefault'),
                }),
              });
              fetchBookings();
              Alert.alert(t('success'), t('bookingCancelledSuccess'));
            } catch (err) {
              Alert.alert(t('error'), err.message || t('bookingCancelFailed'));
            }
          },
        },
      ]
    );
  };

  const handleAcceptBooking = async (bookingId) => {
    try {
      await apiRequest(`/api/babysitter/accept/${bookingId}`, {
        method: 'PUT',
      });
      fetchBookings();
      Alert.alert(t('success'), t('bookingAcceptedSuccess'));
    } catch (err) {
      Alert.alert(t('error'), err.message || t('bookingAcceptFailed'));
    }
  };

  if (!isAuthenticated) {
    return (
      <ScreenWrapper>
        <Header title={t('bookings')} />
        <View style={styles.centerContainer}>
          <Ionicons name="calendar-outline" size={54} color={colors.plum} />
          <Text style={styles.unauthTitle}>{t('myBookings')}</Text>
          <Text style={styles.unauthDesc}>
            {t('bookingsSignInPrompt')}
          </Text>
          <Button
            title={t('login')}
            variant="plum"
            onPress={() => navigation.navigate('ProfileTab')}
            style={styles.signInBtn}
          />
        </View>
      </ScreenWrapper>
    );
  }

  const filteredBookings = bookings.filter((b) => {
    if (selectedStatus === 'all') return true;
    return b.status === selectedStatus;
  });

  const renderBookingCard = ({ item }) => {
    const isCaregiverUser = isCaregiver || user?.role === 'babysitter';
    const sitter = item.babysitter || (typeof item.babysitterId === 'object' ? item.babysitterId : null);
    const sitterId = sitter?._id || (typeof item.babysitterId === 'string' ? item.babysitterId : sitter?.userId);
    const sitterName = sitter?.name || item.babysitterName || t('caregiver');
    const familyName = item.family?.username || item.family?.name || (typeof item.parentId === 'object' ? item.parentId?.name || item.parentId?.username : null) || t('family');
    const otherParty = isCaregiverUser ? familyName : sitterName;

    const sitterPhotoUri = sitter?.photoUrl
      ? (sitter.photoUrl.startsWith('http') ? sitter.photoUrl : `${API_BASE}${sitter.photoUrl}`)
      : (sitterId ? `${API_BASE}/api/babysitter/photo/${sitterId}` : null);

    const dateObj = item.startTime ? new Date(item.startTime) : (item.startAt ? new Date(item.startAt) : null);
    const dateLocale = locale === 'ar' ? 'ar-EG' : 'en-US';
    const formattedDate = dateObj && !isNaN(dateObj)
      ? dateObj.toLocaleDateString(dateLocale, { year: 'numeric', month: 'short', day: 'numeric' })
      : '';

    const currencyLabel = item.currency === 'USD' ? 'USD' : t('egp');

    return (
      <Card style={styles.bookingCard}>
        <View style={[styles.cardTop, isRTL && styles.rowRTL]}>
          <View style={[styles.participantInfoRow, isRTL && styles.rowRTL]}>
            {isCaregiverUser ? (
              <View style={styles.bookingAvatarWrapper}>
                <CaregiverAvatar
                  uri={null}
                  name={otherParty}
                  style={styles.bookingAvatar}
                  imageStyle={styles.bookingAvatarImage}
                />
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={sitterId ? 0.7 : 1}
                onPress={() => {
                  if (sitterId) {
                    navigation.navigate('CaregiverDetails', { sitterId, sitter });
                  }
                }}
                style={styles.bookingAvatarWrapper}
              >
                <CaregiverAvatar
                  uri={sitterPhotoUri}
                  name={otherParty}
                  style={styles.bookingAvatar}
                  imageStyle={styles.bookingAvatarImage}
                />
              </TouchableOpacity>
            )}

            <View style={[styles.participantTextCol, isRTL && styles.alignRTL]}>
              <Text style={[styles.participantName, isRTL && styles.textRTL]}>{otherParty}</Text>
              {!isCaregiverUser && item.service ? (
                <Text style={[styles.serviceText, isRTL && styles.textRTL]}>{t(item.service) || item.service}</Text>
              ) : null}
              {!isCaregiverUser && sitterId ? (
                <TouchableOpacity
                  onPress={() => navigation.navigate('CaregiverDetails', { sitterId, sitter })}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Text style={[styles.viewProfileLink, isRTL && styles.textRTL]}>{t('viewProfile')} →</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <Badge
            label={getStatusLabel(item.status)}
            variant={item.status}
          />
        </View>

        <View style={[styles.detailsRow, isRTL && styles.rowRTL]}>
          <View style={[styles.metaItem, isRTL && styles.rowRTL]}>
            <Ionicons name="calendar" size={14} color={colors.plum} />
            <Text style={styles.metaValue}>{formattedDate}</Text>
          </View>
        </View>

        {item.address ? (
          <View style={[styles.addressRow, isRTL && styles.rowRTL]}>
            <Ionicons name="location" size={14} color={colors.textMuted} />
            <Text style={[styles.addressText, isRTL && styles.textRTL]} numberOfLines={1}>{item.address}</Text>
          </View>
        ) : null}

        <View style={[styles.cardBottom, isRTL && styles.rowRTL]}>
          <View style={isRTL && styles.alignRTL}>
            <Text style={[styles.costLabel, isRTL && styles.textRTL]}>{t('estimatedCost')}</Text>
            <Text style={[styles.costValue, isRTL && styles.textRTL]}>{item.totalCost || 0} {currencyLabel}</Text>
          </View>

          <View style={[styles.actionButtonsRow, isRTL && styles.rowRTL]}>
            {isCaregiver && item.status === 'pending' && (
              <Button
                title={t('acceptBooking')}
                variant="primary"
                onPress={() => handleAcceptBooking(item._id)}
                style={styles.actionBtn}
                textStyle={styles.actionBtnText}
              />
            )}
            {item.status !== 'cancelled' && item.status !== 'completed' && item.status !== 'declined' && (
              <Button
                title={t('cancelBooking')}
                variant="outline"
                onPress={() => handleCancelBooking(item._id)}
                style={styles.actionBtn}
                textStyle={styles.actionBtnText}
              />
            )}
          </View>
        </View>
      </Card>
    );
  };

  return (
    <ScreenWrapper>
      <Header title={t('bookings')} />

      <View style={styles.container}>
        {/* Status Filter Tabs */}
        <View style={styles.filterTabsContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={STATUS_FILTERS}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.tabChip,
                  selectedStatus === item && styles.tabChipActive,
                ]}
                onPress={() => setSelectedStatus(item)}
              >
                <Text
                  style={[
                    styles.tabChipText,
                    selectedStatus === item && styles.tabChipTextActive,
                  ]}
                >
                  {item === 'all' ? t('all') : getStatusLabel(item)}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.tabsRow}
          />
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.plum} />
            <Text style={styles.loadingText}>{t('loading')}</Text>
          </View>
        ) : (
          <FlatList
            data={filteredBookings}
            keyExtractor={(item) => item._id}
            renderItem={renderBookingCard}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.plum]} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-clear-outline" size={48} color={colors.textLight} />
                <Text style={styles.emptyText}>{t('noBookings')}</Text>
              </View>
            }
          />
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  filterTabsContainer: {
    marginVertical: 8,
  },
  tabsRow: {
    gap: 6,
  },
  tabChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(104, 63, 128, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
  },
  tabChipActive: {
    backgroundColor: colors.plum,
    borderColor: colors.plum,
  },
  tabChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.plum,
  },
  tabChipTextActive: {
    color: colors.white,
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 80,
  },
  bookingCard: {
    padding: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  participantInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  bookingAvatarWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: '#f5eff7',
  },
  bookingAvatar: {
    width: '100%',
    height: '100%',
  },
  bookingAvatarImage: {
    width: '100%',
    height: '100%',
  },
  participantTextCol: {
    flex: 1,
  },
  viewProfileLink: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 3,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  serviceText: {
    fontSize: 12,
    color: colors.plum,
    fontWeight: '600',
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
    marginVertical: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaValue: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 12,
    color: colors.textMuted,
    flex: 1,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1e8f2',
    paddingTop: 10,
    marginTop: 6,
  },
  costLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  costValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.plum,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
  },
  actionBtnText: {
    fontSize: 12,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  unauthTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginTop: 12,
  },
  unauthDesc: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    maxWidth: 280,
  },
  signInBtn: {
    minWidth: 160,
  },
  loadingText: {
    marginTop: 8,
    color: colors.plum,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    color: colors.textMuted,
    fontSize: 14,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  textRTL: {
    textAlign: 'right',
  },
  alignRTL: {
    alignItems: 'flex-end',
  },
});
