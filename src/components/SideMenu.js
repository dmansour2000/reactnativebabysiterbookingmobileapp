import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  SafeAreaView,
  Alert,
  Modal,
  Image,
} from 'react-native';
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

  // Animation values
  const slideAnim = useRef(new Animated.Value(isRTL ? DRAWER_WIDTH : -DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      // Reset starting position before animating in
      slideAnim.setValue(isRTL ? DRAWER_WIDTH : -DRAWER_WIDTH);
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
  }, [isOpen, isRTL]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: isRTL ? DRAWER_WIDTH : -DRAWER_WIDTH,
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

        {/* Animated Drawer Panel */}
        <Animated.View
          style={[
            styles.drawerPanel,
            isRTL ? styles.drawerRight : styles.drawerLeft,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Drawer Brand Header */}
            <View style={styles.brandHeader}>
              <View style={[styles.brandRow, isRTL && styles.rowRTL]}>
                <View style={styles.logoBadge}>
                  <Image
                    source={require('../../assets/icon.png')}
                    style={styles.logoImage}
                    resizeMode="cover"
                  />
                </View>
                <View>
                  <Text style={styles.brandTitle}>CareNest</Text>
                  <Text style={styles.brandArabicTitle}>كير نست</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={handleClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={colors.white} />
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
                    <Text style={styles.userName} numberOfLines={1}>
                      {user?.username || user?.name}
                    </Text>
                    <Text style={styles.userEmail} numberOfLines={1}>
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
                      color={active ? colors.white : colors.plum}
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
                        color={colors.white}
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
                <Ionicons name="language" size={18} color={colors.plum} />
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
                  <Ionicons name="log-out-outline" size={18} color={colors.danger} />
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
    backgroundColor: '#ffffff',
    shadowColor: '#300f38',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
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
  },
  brandHeader: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
  },
  brandTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  brandArabicTitle: {
    color: '#ffe4f7',
    fontSize: 12,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  userCard: {
    backgroundColor: '#fbf7fb',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f1e4f2',
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
    backgroundColor: colors.plum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '800',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textMuted,
    marginVertical: 2,
  },
  rolePill: {
    marginTop: 2,
  },
  guestBox: {
    paddingVertical: 4,
  },
  guestTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  guestSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 10,
  },
  guestButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  guestBtn: {
    flex: 1,
    backgroundColor: colors.plum,
    paddingVertical: 8,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  guestBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  guestBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.plum,
  },
  guestBtnTextOutline: {
    color: colors.plum,
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
    marginBottom: 4,
    gap: 12,
  },
  menuItemActive: {
    backgroundColor: colors.plum,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  menuTextActive: {
    color: colors.white,
  },
  activeChevron: {
    marginLeft: 'auto',
  },
  langSection: {
    backgroundColor: '#faf5ff',
    marginHorizontal: spacing.sm,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#eedcee',
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
    color: colors.plum,
  },
  langToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: radius.pill,
    padding: 3,
    borderWidth: 1,
    borderColor: '#e7dbe9',
  },
  langOption: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: radius.pill,
  },
  langOptionActive: {
    backgroundColor: colors.primary,
  },
  langOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.plum,
  },
  langOptionTextActive: {
    color: colors.white,
  },
  footerContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#f1e8f2',
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
    color: colors.danger,
  },
  versionText: {
    fontSize: 10,
    color: colors.textLight,
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
