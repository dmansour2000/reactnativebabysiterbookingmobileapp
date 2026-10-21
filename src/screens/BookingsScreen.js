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
import { colors, radius, spacing } from '../theme';
import { useLocale } from '../locales';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

export default function BookingsScreen({ navigation }) {
  const { t, isRTL } = useLocale();
  const { isAuthenticated, isCaregiver } = useAuth();

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

  const handleCancelBooking = (bookingId) => {
    Alert.alert(
      t('cancelBooking'),
      'Are you sure you want to cancel this booking?',
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
                  cancellationReason: 'Cancelled via mobile app',
                }),
              });
              fetchBookings();
              Alert.alert(t('success'), 'Booking cancelled.');
            } catch (err) {
              Alert.alert(t('error'), err.message || 'Failed to cancel');
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
      Alert.alert(t('success'), 'Booking accepted!');
    } catch (err) {
      Alert.alert(t('error'), err.message || 'Failed to accept booking');
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
            Please sign in to view and manage your scheduled appointments.
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
    const sitterName = item.babysitter?.name || item.babysitterName || 'Caregiver';
    const familyName = item.family?.username || item.family?.name || 'Family';
    const otherParty = isCaregiver ? familyName : sitterName;
    const formattedDate = item.startTime ? new Date(item.startTime).toLocaleDateString() : '';
    const startHour = item.startTime ? new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    const endHour = item.endTime ? new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    return (
      <Card style={styles.bookingCard}>
        <View style={[styles.cardTop, isRTL && styles.rowRTL]}>
          <View>
            <Text style={styles.participantName}>{otherParty}</Text>
            <Text style={styles.serviceText}>{t(item.service) || item.service}</Text>
          </View>
          <Badge
            label={t(`status${item.status.charAt(0).toUpperCase() + item.status.slice(1)}`) || item.status}
            variant={item.status}
          />
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar" size={14} color={colors.plum} />
            <Text style={styles.metaValue}>{formattedDate}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time" size={14} color={colors.plum} />
            <Text style={styles.metaValue}>{startHour} - {endHour}</Text>
          </View>
        </View>

        {item.address ? (
          <View style={styles.addressRow}>
            <Ionicons name="location" size={14} color={colors.textMuted} />
            <Text style={styles.addressText} numberOfLines={1}>{item.address}</Text>
          </View>
        ) : null}

        <View style={[styles.cardBottom, isRTL && styles.rowRTL]}>
          <View>
            <Text style={styles.costLabel}>{t('estimatedCost')}</Text>
            <Text style={styles.costValue}>{item.totalCost || 0} EGP</Text>
          </View>

          <View style={styles.actionButtonsRow}>
            {isCaregiver && item.status === 'pending' && (
              <Button
                title={t('acceptBooking')}
                variant="primary"
                onPress={() => handleAcceptBooking(item._id)}
                style={styles.actionBtn}
                textStyle={styles.actionBtnText}
              />
            )}
            {item.status !== 'cancelled' && item.status !== 'completed' && (
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
                  {item === 'all' ? 'All' : t(`status${item.charAt(0).toUpperCase() + item.slice(1)}`)}
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
    marginBottom: 8,
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
});
