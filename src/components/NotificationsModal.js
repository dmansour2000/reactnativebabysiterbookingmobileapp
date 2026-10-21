import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';
import { useLocale } from '../locales';
import { apiRequest } from '../services/api';

export default function NotificationsModal({ visible, onClose, onNotificationCountChange }) {
  const { t, isRTL, locale } = useLocale();
  const isArabic = locale === 'ar';

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await apiRequest('/api/notifications');
      if (Array.isArray(data?.notifications)) {
        setNotifications(data.notifications);
        const count = data.unreadCount || 0;
        setUnreadCount(count);
        onNotificationCountChange?.(count);
      }
    } catch (err) {
      console.warn('Failed to fetch notifications:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [onNotificationCountChange]);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      fetchNotifications();
    }
  }, [visible, fetchNotifications]);

  const handleMarkAsRead = async (item) => {
    if (item.read) return;
    try {
      await apiRequest(`/api/notifications/${item._id}/read`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n._id === item._id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      onNotificationCountChange?.(Math.max(0, unreadCount - 1));
    } catch (_) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await apiRequest('/api/notifications/read-all', { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      onNotificationCountChange?.(0);
    } catch (_) {}
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'rating_received':
        return { name: 'star', color: colors.gold, bg: '#fff8e6' };
      case 'booking_requested':
        return { name: 'calendar', color: colors.plum, bg: '#f2e9f4' };
      case 'booking_accepted':
        return { name: 'checkmark-circle', color: colors.success, bg: '#eefaf0' };
      case 'booking_cancelled':
      case 'booking_declined':
        return { name: 'close-circle', color: colors.danger, bg: '#fdf2f2' };
      default:
        return { name: 'notifications', color: colors.primary, bg: '#f2eef8' };
    }
  };

  const renderItem = ({ item }) => {
    const iconMeta = getIconForType(item.type);
    return (
      <TouchableOpacity
        style={[
          styles.notifItem,
          !item.read && styles.unreadItem,
          isRTL && styles.rowRTL,
        ]}
        onPress={() => handleMarkAsRead(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconCircle, { backgroundColor: iconMeta.bg }]}>
          <Ionicons name={iconMeta.name} size={20} color={iconMeta.color} />
        </View>
        <View style={styles.contentCol}>
          <View style={[styles.titleRow, isRTL && styles.rowRTL]}>
            <Text style={[styles.itemTitle, !item.read && styles.unreadTitle, isRTL && styles.textRTL]}>
              {item.title}
            </Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <Text style={[styles.itemMessage, isRTL && styles.textRTL]}>
            {item.message}
          </Text>
          <Text style={[styles.itemTime, isRTL && styles.textRTL]}>
            {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={[styles.topBar, isRTL && styles.rowRTL]}>
            <View style={[styles.headingRow, isRTL && styles.rowRTL]}>
              <Ionicons name="notifications" size={22} color={colors.plum} />
              <Text style={styles.sheetTitle}>{t('notifications')}</Text>
              {unreadCount > 0 && (
                <View style={styles.badgePill}>
                  <Text style={styles.badgePillText}>{unreadCount}</Text>
                </View>
              )}
            </View>

            <View style={[styles.topActions, isRTL && styles.rowRTL]}>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
                  <Text style={styles.markAllText}>{t('markAllAsRead')}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close-circle" size={26} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Body */}
          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={colors.plum} />
            </View>
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item._id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => {
                    setRefreshing(true);
                    fetchNotifications();
                  }}
                  colors={[colors.plum]}
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyBox}>
                  <Ionicons name="notifications-off-outline" size={44} color={colors.textLight} />
                  <Text style={styles.emptyTitle}>{t('noNotifications')}</Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    height: '80%',
    paddingTop: spacing.md,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0e6f2',
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  badgePill: {
    backgroundColor: colors.danger,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  badgePillText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  listContent: {
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
  },
  notifItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: '#ffffff',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f2eaf3',
    gap: 12,
  },
  unreadItem: {
    backgroundColor: '#fbf7fc',
    borderColor: '#e8d8eb',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '800',
    color: colors.plum,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    marginLeft: 6,
  },
  itemMessage: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  itemTime: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 4,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 10,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  textRTL: {
    textAlign: 'right',
  },
});

