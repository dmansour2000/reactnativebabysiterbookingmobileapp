import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';
import { useLocale } from '../locales';
import { useAuth } from '../context/AuthContext';
import { useDrawer } from '../context/DrawerContext';
import Badge from './Badge';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.8, 320);

export default function SideMenu({ navigation }) {
  const { t, locale, setLocale, isRTL } = useLocale();
  const { user, isAuthenticated, logout } = useAuth();
  const { isOpen, closeDrawer, currentScreen, navigateTo } = useDrawer();

  // Animation values - always slide from left (-DRAWER_WIDTH to 0)
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      // Reset starting position before animating in (always from left)
      slideAnim.setValue(-DRAWER_WIDTH);
      fadeAnim.setValue(0);

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      closeDrawer();
    });
  };

  const handleNav = (screenName) => {
    handleClose();
    setTimeout(() => {
      navigateTo(screenName, navigation);
    }, 150);
  };

  const handleLogout = () => {
    handleClose();
    setTimeout(() => {
      Alert.alert(
        t('logout'),
        locale === 'ar' ? 'هل أنت متأكد من تسجيل الخروج؟' : 'Are you sure you want to sign out?',
        [
          { text: t('close'), style: 'cancel' },
          { text: t('logout'), style: 'destructive', onPress: logout },
        ]
      );
    }, 200);
  };

  const menuItems = [
    {
      id: 'Explore',
      title: t('explore'),
      icon: 'search',
    },
    {
      id: 'Bookings',
      title: t('bookings'),
      icon: 'calendar',
    },
    {
      id: 'Safety',
      title: t('safety'),
      icon: 'shield-checkmark',
    },
    {
      id: 'Profile',
      title: t('profile'),
      icon: 'person',
    },
  ];

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalRoot}>
        {/* Semi-transparent Backdrop with Tap-To-Close */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        </TouchableWithoutFeedback>

        {/* Animated Drawer Panel - always anchored to the left */}
        <Animated.View
          style={[
            styles.drawerPanel,
            styles.drawerLeft,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Top Close Action (No header bar) */}
            <View style={[styles.topBar, isRTL && styles.rowRTL]}>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={handleClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={22} color="#f0f2f5" />
              </TouchableOpacity>
            </View>

            {/* User Account / Guest Snippet */}
            <View style={styles.userCard}>
              {isAuthenticated ? (
                <View style={[styles.userRow, isRTL && styles.rowRTL]}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarLetter}>
                      {(user?.username || user?.name || 'U').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={[styles.userName, isRTL && styles.textRTL]} numberOfLines={1}>
                      {user?.username || user?.name}
                    </Text>
                    <Text style={[styles.userEmail, isRTL && styles.textRTL]} numberOfLines={1}>
                      {user?.email}
                    </Text>
                    <Badge
                      label={user?.role === 'babysitter' ? t('babysitter') : t('user')}
                      variant={user?.role === 'babysitter' ? 'primary' : 'tag'}
                      style={styles.rolePill}
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.guestBox}>
                  <Text style={[styles.guestTitle, isRTL && styles.textRTL]}>{t('welcome')}</Text>
                  <Text style={[styles.guestSubtitle, isRTL && styles.textRTL]}>
                    {locale === 'ar' ? 'سجّل دخولك للتمتع بكافة الميزات' : 'Sign in to access all features'}
                  </Text>
                  <View style={styles.guestButtonsRow}>
                    <TouchableOpacity
                      style={styles.guestBtn}
                      onPress={() => handleNav('Login')}
                    >
                      <Text style={styles.guestBtnText}>{t('login')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.guestBtn, styles.guestBtnOutline]}
                      onPress={() => handleNav('Register')}
                    >
                      <Text style={styles.guestBtnTextOutline}>{t('register')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* Navigation Menu List */}
            <View style={styles.menuList}>
              {menuItems.map((item) => {
                const active = currentScreen === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.menuItem,
                      active && styles.menuItemActive,
                      isRTL && styles.rowRTL,
                    ]}
                    onPress={() => handleNav(item.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={active ? '#ffffff' : '#a2adb9'}
                    />
                    <Text
                      style={[
                        styles.menuText,
                        active && styles.menuTextActive,
                        isRTL && styles.textRTL,
                      ]}
                    >
                      {item.title}
                    </Text>
                    {active && (
                      <Ionicons
                        name={isRTL ? 'chevron-back' : 'chevron-forward'}
                        size={16}
                        color="#ffffff"
                        style={styles.activeChevron}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Language Switcher Section Inside Side Menu */}
            <View style={styles.langSection}>
              <View style={[styles.langHeaderRow, isRTL && styles.rowRTL]}>
                <Ionicons name="language" size={17} color="#d4dbe3" />
                <Text style={styles.langSectionTitle}>
                  {locale === 'ar' ? 'لغة التطبيق' : 'App Language'}
                </Text>
              </View>

              <View style={styles.langToggleRow}>
                <TouchableOpacity
                  style={[
                    styles.langOption,
                    locale === 'ar' && styles.langOptionActive,
                  ]}
                  onPress={() => setLocale('ar')}
                >
                  <Text
                    style={[
                      styles.langOptionText,
                      locale === 'ar' && styles.langOptionTextActive,
                    ]}
                  >
                    العربية (افتراضي)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.langOption,
                    locale === 'en' && styles.langOptionActive,
                  ]}
                  onPress={() => setLocale('en')}
                >
                  <Text
                    style={[
                      styles.langOptionText,
                      locale === 'en' && styles.langOptionTextActive,
                    ]}
                  >
                    English
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer / Logout */}
            <View style={styles.footerContainer}>
              {isAuthenticated ? (
                <TouchableOpacity
                  style={[styles.logoutButton, isRTL && styles.rowRTL]}
                  onPress={handleLogout}
                >
                  <Ionicons name="log-out-outline" size={18} color="#f87171" />
                  <Text style={styles.logoutText}>{t('logout')}</Text>
                </TouchableOpacity>
              ) : null}

              <Text style={styles.versionText}>
                CareNest Mobile v1.0 • منصة كير نست
              </Text>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 12, 34, 0.65)',
  },
  drawerPanel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#1e232a', // Dark grey background
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 24,
  },
  drawerLeft: {
    left: 0,
    borderTopRightRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  drawerRight: {
    right: 0,
    borderTopLeftRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
  },
  safeArea: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#1e232a',
  },
  topBar: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userCard: {
    backgroundColor: '#272d36', // Darker grey card surface
    marginHorizontal: spacing.sm,
    marginVertical: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#343b46',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#683f80',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#f3f4f6',
  },
  userEmail: {
    fontSize: 12,
    color: '#9ca3af',
    marginVertical: 2,
  },
  rolePill: {
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  guestBox: {
    paddingVertical: 4,
  },
  guestTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#f3f4f6',
  },
  guestSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
    marginBottom: 10,
  },
  guestButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  guestBtn: {
    flex: 1,
    backgroundColor: '#683f80',
    paddingVertical: 8,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  guestBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  guestBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4e5664',
  },
  guestBtnTextOutline: {
    color: '#e5e7eb',
    fontSize: 12,
    fontWeight: '700',
  },
  menuList: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    marginBottom: 6,
    gap: 12,
  },
  menuItemActive: {
    backgroundColor: '#373f4c', // Refined active item in dark grey menu
  },
  menuText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#cbd5e1',
    flex: 1,
  },
  menuTextActive: {
    color: '#ffffff',
  },
  activeChevron: {
    marginLeft: 'auto',
  },
  langSection: {
    backgroundColor: '#272d36',
    marginHorizontal: spacing.sm,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#343b46',
    marginBottom: 8,
  },
  langHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  langSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#e2e8f0',
  },
  langToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#1b1f24',
    borderRadius: radius.pill,
    padding: 3,
    borderWidth: 1,
    borderColor: '#343b46',
  },
  langOption: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: radius.pill,
  },
  langOptionActive: {
    backgroundColor: '#683f80',
  },
  langOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9ca3af',
  },
  langOptionTextActive: {
    color: '#ffffff',
  },
  footerContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#2f3640',
    paddingTop: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    marginBottom: 6,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f87171',
  },
  versionText: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  textRTL: {
    textAlign: 'right',
  },
});
