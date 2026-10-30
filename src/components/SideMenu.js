import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Dimensions, Alert, Modal, Image, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing } from '../theme';
import { useLocale } from '../locales';
import { useAuth } from '../context/AuthContext';
import { useDrawer } from '../context/DrawerContext';
import { API_BASE, apiRequest } from '../services/api';

const DRAWER_WIDTH = Math.min(Dimensions.get('window').width * 0.8, 320);

export default function SideMenu({ navigation }) {
  const { t, locale, setLocale, isRTL } = useLocale();
  const { user, token, isAuthenticated, logout } = useAuth();
  const { isOpen, closeDrawer, currentScreen, navigateTo } = useDrawer();
  const isArabic = locale === 'ar';
  const [photoError, setPhotoError] = useState(false);
  const [caregiverInfo, setCaregiverInfo] = useState({ name: '', photoUrl: '' });
  const [modalVisible, setModalVisible] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const animation = useRef(null);
  const shown = useRef(false);
  const open = useRef(isOpen);
  const pendingAction = useRef(null);
  open.current = isOpen;

  const finishAction = useCallback(() => {
    const action = pendingAction.current;
    pendingAction.current = null;
    action?.();
  }, []);

  const animate = useCallback((opening) => {
    animation.current?.stop();
    animation.current = Animated.timing(progress, {
      toValue: opening ? 1 : 0,
      duration: opening ? 250 : 180,
      useNativeDriver: true,
    });
    animation.current.start(({ finished }) => {
      if (!finished || opening || open.current) return;
      setModalVisible(false);
      if (Platform.OS !== 'ios') {
        shown.current = false;
        finishAction();
      }
    });
  }, [progress, finishAction]);

  useEffect(() => {
    if (isOpen) {
      pendingAction.current = null;
      setModalVisible(true);
      if (shown.current) animate(true);
    } else if (shown.current) {
      animate(false);
    } else {
      setModalVisible(false);
    }
  }, [isOpen, animate]);

  useEffect(() => () => {
    animation.current?.stop();
    pendingAction.current = null;
  }, []);

  useEffect(() => {
    let active = true;
    setPhotoError(false);
    if (isOpen && isAuthenticated && user?.role === 'babysitter') {
      apiRequest('/api/babysitter/profile').then((prof) => {
        if (active && prof) setCaregiverInfo({ name: prof.name || '', photoUrl: prof.photoUrl || '' });
      }).catch(() => {});
    }
    return () => { active = false; };
  }, [isOpen, isAuthenticated, user]);

  const handleClose = (action) => {
    if (!open.current) return;
    pendingAction.current = typeof action === 'function' ? action : null;
    open.current = false;
    closeDrawer();
  };
  const handleNav = (screen) => handleClose(() => navigateTo(screen, navigation));
  const handleLogout = () => handleClose(() => Alert.alert(
    t('logout'), isArabic ? 'هل أنت متأكد من تسجيل الخروج؟' : 'Are you sure you want to sign out?',
    [{ text: t('close'), style: 'cancel' }, { text: t('logout'), style: 'destructive', onPress: logout }]
  ));

  const caregiverName = caregiverInfo.name || user?.name || '';
  const displayName = user?.role === 'babysitter'
    ? (caregiverName || (user?.username && !user.username.startsWith('google-user') ? user.username : '') || t('caregiver') || 'Caregiver')
    : (user?.name || user?.username || 'User');
  const rawPhoto = user?.role === 'babysitter' ? (caregiverInfo.photoUrl || user?.photoUrl) : user?.photoUrl;
  let photoUri = null;
  if (rawPhoto) {
    photoUri = /^(file:|content:|http)/.test(rawPhoto) ? rawPhoto : `${API_BASE}${rawPhoto.startsWith('/') ? '' : '/'}${rawPhoto}`;
    if (token && !photoUri.includes('token=')) photoUri += `${photoUri.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`;
  }
  const items = [
    ['Home', 'home', 'home'],
    ...(isAuthenticated ? [
      ...(user?.role === 'user' ? [['Explore', 'explore', 'search']] : []),
      ['Bookings', 'bookings', 'calendar'],
      ...(user?.role === 'user' ? [['Safety', 'safety', 'shield-checkmark']] : []),
    ] : []),
    ['Services', 'services', 'sparkles'], ['Policies', 'policies', 'document-text'],
    ['ContactUs', 'contactUs', 'mail'], ['Profile', 'profile', 'person'],
  ];

  return (
    <Modal visible={modalVisible} transparent animationType="none" statusBarTranslucent
      onRequestClose={() => handleClose()}
      onShow={() => { shown.current = true; animate(open.current); }}
      onDismiss={() => { shown.current = false; if (!open.current) finishAction(); }}>
      <View style={styles.modalRoot}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={() => handleClose()}
          accessibilityRole="button" accessibilityLabel={isArabic ? 'إغلاق القائمة' : 'Close menu'}>
          <Animated.View style={[styles.backdrop, { opacity: progress }]} />
        </TouchableOpacity>
        <Animated.View accessibilityViewIsModal style={[styles.drawerPanel, {
          transform: [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [-DRAWER_WIDTH, 0] }) }],
        }]}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.topBar}>
              <TouchableOpacity style={styles.closeBtn} onPress={() => handleClose()}
                accessibilityRole="button" accessibilityLabel={isArabic ? 'إغلاق القائمة' : 'Close menu'}
                hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }} activeOpacity={0.5}>
                <Ionicons name="close" size={24} color="#f0f2f5" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <View style={styles.userCard}>
                {isAuthenticated ? (
                  <TouchableOpacity style={[styles.userRow, isRTL && styles.rowRTL]} activeOpacity={0.75} onPress={() => handleNav('Profile')}>
                    {!photoError && photoUri ? (
                      <Image key={photoUri} source={{ uri: photoUri, headers: token ? { Authorization: `Bearer ${token}`, 'x-auth-token': token } : undefined }}
                        style={styles.avatarPhoto} onError={() => setPhotoError(true)} />
                    ) : <View style={styles.avatarCircle}><Text style={styles.avatarLetter}>{(displayName || 'U').charAt(0).toUpperCase()}</Text></View>}
                    <View style={styles.userDetails}>
                      <Text style={[styles.userName, isRTL && styles.textRTL]} numberOfLines={1}>{displayName}</Text>
                      <Text style={[styles.userEmail, isRTL && styles.textRTL]} numberOfLines={1}>{user?.email}</Text>
                      {user?.role === 'babysitter' && <View style={[styles.roleBadge, isRTL && styles.rowRTL]}>
                        <Ionicons name="sparkles" size={11} color="#f1a2d2" />
                        <Text style={styles.roleBadgeText}>{t('caregiver') || t('babysitterRole') || (isArabic ? 'جليسة أطفال' : 'Caregiver')}</Text>
                      </View>}
                    </View>
                  </TouchableOpacity>
                ) : <View style={styles.guestBox}>
                  <Text style={[styles.guestTitle, isRTL && styles.textRTL]}>{t('welcome')}</Text>
                  <Text style={[styles.guestSubtitle, isRTL && styles.textRTL]}>{isArabic ? 'سجّل دخولك للتمتع بكافة الميزات' : 'Sign in to access all features'}</Text>
                  <View style={styles.guestButtonsRow}>
                    <TouchableOpacity style={styles.guestBtn} onPress={() => handleNav('Login')}><Text style={styles.guestBtnText}>{t('login')}</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.guestBtn, styles.guestBtnOutline]} onPress={() => handleNav('Register')}><Text style={styles.guestBtnTextOutline}>{t('register')}</Text></TouchableOpacity>
                  </View>
                </View>}
              </View>
              <View style={styles.menuList}>
                {items.map(([id, label, icon]) => {
                  const active = currentScreen === id;
                  return <TouchableOpacity key={id} style={[styles.menuItem, active && styles.menuItemActive, isRTL && styles.rowRTL]}
                    onPress={() => handleNav(id)} activeOpacity={0.7} accessibilityRole="button" accessibilityState={{ selected: active }}>
                    <Ionicons name={icon} size={20} color={active ? '#ffffff' : '#a2adb9'} />
                    <Text style={[styles.menuText, active && styles.menuTextActive, isRTL && styles.textRTL]}>{t(label)}</Text>
                    {active && <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={16} color="#ffffff" style={styles.activeChevron} />}
                  </TouchableOpacity>;
                })}
              </View>
              <View style={styles.langSection}>
                <View style={[styles.langHeaderRow, isRTL && styles.rowRTL]}>
                  <Ionicons name="language" size={17} color="#d4dbe3" />
                  <Text style={styles.langSectionTitle}>{isArabic ? 'لغة التطبيق' : 'App Language'}</Text>
                </View>
                <View style={styles.langToggleRow}>
                  {['ar', 'en'].map((language) => <TouchableOpacity key={language}
                    style={[styles.langOption, locale === language && styles.langOptionActive]} onPress={() => setLocale(language)}>
                    <Text style={[styles.langOptionText, locale === language && styles.langOptionTextActive]}>{language === 'ar' ? 'العربية' : 'English'}</Text>
                  </TouchableOpacity>)}
                </View>
              </View>
            </ScrollView>
            <View style={styles.footerContainer}>
              {isAuthenticated && <TouchableOpacity style={[styles.logoutButton, isRTL && styles.rowRTL]} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={18} color="#f87171" /><Text style={styles.logoutText}>{t('logout')}</Text>
              </TouchableOpacity>}
              <Text style={styles.versionText}>CareNest Mobile v1.0 • منصة كير نست</Text>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(26, 12, 34, 0.65)' },
  drawerPanel: { position: 'absolute', top: 0, bottom: 0, left: 0, width: DRAWER_WIDTH, backgroundColor: '#1e232a', shadowColor: '#000000', shadowOffset: { width: 4, height: 0 }, shadowOpacity: 0.5, shadowRadius: 24, elevation: 24, borderTopRightRadius: radius.lg, borderBottomRightRadius: radius.lg },
  safeArea: { flex: 1, flexDirection: 'column', backgroundColor: '#1e232a' },
  scrollContent: { flexGrow: 1 },
  topBar: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xs, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  closeBtn: { width: 40, height: 40, borderRadius: radius.pill, backgroundColor: 'rgba(255, 255, 255, 0.15)', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  userCard: { backgroundColor: '#272d36', marginHorizontal: spacing.sm, marginVertical: spacing.xs, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: '#343b46' },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#683f80', alignItems: 'center', justifyContent: 'center' },
  avatarPhoto: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#683f80' },
  avatarLetter: { color: '#ffffff', fontSize: 20, fontWeight: '800' },
  userDetails: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '800', color: '#f3f4f6' },
  userEmail: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, alignSelf: 'flex-start', backgroundColor: 'rgba(217, 84, 178, 0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(217, 84, 178, 0.4)' },
  roleBadgeText: { fontSize: 11, fontWeight: '700', color: '#f1a2d2' },
  guestBox: { paddingVertical: 4 },
  guestTitle: { fontSize: 15, fontWeight: '800', color: '#f3f4f6' },
  guestSubtitle: { fontSize: 12, color: '#9ca3af', marginTop: 2, marginBottom: 10 },
  guestButtonsRow: { flexDirection: 'row', gap: 8 },
  guestBtn: { flex: 1, backgroundColor: '#683f80', paddingVertical: 8, borderRadius: radius.md, alignItems: 'center' },
  guestBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  guestBtnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#4e5664' },
  guestBtnTextOutline: { color: '#e5e7eb', fontSize: 12, fontWeight: '700' },
  menuList: { flex: 1, paddingVertical: spacing.sm, paddingHorizontal: spacing.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderRadius: radius.md, marginBottom: 6, gap: 12 },
  menuItemActive: { backgroundColor: '#373f4c' },
  menuText: { fontSize: 14, fontWeight: '700', color: '#cbd5e1', flex: 1 },
  menuTextActive: { color: '#ffffff' },
  activeChevron: { marginLeft: 'auto' },
  langSection: { backgroundColor: '#272d36', marginHorizontal: spacing.sm, padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: '#343b46', marginBottom: 8 },
  langHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  langSectionTitle: { fontSize: 12, fontWeight: '800', color: '#e2e8f0' },
  langToggleRow: { flexDirection: 'row', backgroundColor: '#1b1f24', borderRadius: radius.pill, padding: 3, borderWidth: 1, borderColor: '#343b46' },
  langOption: { flex: 1, paddingVertical: 7, alignItems: 'center', borderRadius: radius.pill },
  langOptionActive: { backgroundColor: '#683f80' },
  langOptionText: { fontSize: 12, fontWeight: '700', color: '#9ca3af' },
  langOptionTextActive: { color: '#ffffff' },
  footerContainer: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, borderTopWidth: 1, borderTopColor: '#2f3640', paddingTop: 10 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, marginBottom: 6 },
  logoutText: { fontSize: 13, fontWeight: '700', color: '#f87171' },
  versionText: { fontSize: 10, color: '#6b7280', textAlign: 'center', marginTop: 4 },
  rowRTL: { flexDirection: 'row-reverse' },
  textRTL: { textAlign: 'right' },
});
