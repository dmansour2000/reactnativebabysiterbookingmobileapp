import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Switch,
  Alert,
  Modal,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { colors, radius, spacing } from '../theme';
import { useLocale } from '../locales';
import { useAuth } from '../context/AuthContext';
import { apiRequest, API_BASE } from '../services/api';
import NotificationsModal from '../components/NotificationsModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const NATIONALITY_OPTIONS = [
  'Egypt',
  'Sudan',
  'Nigeria',
  'Ethiopia',
  'Philippines',
  'Other African',
  'Indonesia',
  'Other',
];

export default function ProfileScreen({ navigation, route }) {
  const { t, locale, setLocale, isRTL } = useLocale();
  const { user, token, isAuthenticated, isCaregiver, logout, changePassword, changeEmail, refreshUser, updateUserLocal } = useAuth();
  const isArabic = locale === 'ar';

  // Photo viewer modal
  const [photoModalVisible, setPhotoModalVisible] = useState(false);

  // Edit Profile Modal
  const [editModal, setEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editNationality, setEditNationality] = useState('Egypt');
  const [editNationalitySelection, setEditNationalitySelection] = useState('Egypt');
  const [editOtherNationality, setEditOtherNationality] = useState('');
  const [editMonthlySalary, setEditMonthlySalary] = useState('');
  const [editCurrency, setEditCurrency] = useState('EGP');
  const [editPhoto, setEditPhoto] = useState(null);
  const [editDocuments, setEditDocuments] = useState([]);
  const [existingDocsCount, setExistingDocsCount] = useState(0);
  const [savingProfile, setSavingProfile] = useState(false);

  // Notifications state
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);

  // Caregiver stats and reviews
  const [caregiverStats, setCaregiverStats] = useState({ averageRating: 5.0, ratingsCount: 0 });
  const [caregiverReviews, setCaregiverReviews] = useState([]);
  const [caregiverPhoto, setCaregiverPhoto] = useState(null);
  const [caregiverName, setCaregiverName] = useState('');
  const [caregiverProfile, setCaregiverProfile] = useState(null);
  const [photoError, setPhotoError] = useState(false);
  const [photoTimestamp, setPhotoTimestamp] = useState(Date.now());

  // Caregiver availability toggle
  const [isAvailable, setIsAvailable] = useState(true);
  const [togglingAvailability, setTogglingAvailability] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      // 1. Fetch notifications
      apiRequest('/api/notifications')
        .then((res) => {
          if (Array.isArray(res?.notifications)) {
            setRecentNotifications(res.notifications.slice(0, 3));
            setUnreadCount(res.unreadCount || 0);
          }
        })
        .catch(() => {});

      // 2. If caregiver, load profile rating stats, reviews & profile info
      if (isCaregiver) {
        if (user?.id) {
          apiRequest(`/api/babysitter/users/${user.id}`)
            .then((data) => {
              if (data?.name) {
                setCaregiverName(data.name);
              }
              if (data?.averageRating != null) {
                setCaregiverStats({
                  averageRating: data.averageRating,
                  ratingsCount: data.ratingsCount || 0,
                });
              }
              if (Array.isArray(data?.reviews)) {
                setCaregiverReviews(data.reviews);
              }
              if (data?.photoUrl) {
                setCaregiverPhoto((prev) => (prev?.startsWith('file://') ? prev : data.photoUrl));
              }
            })
            .catch(() => {});
        }

        // Fetch own caregiver profile to ensure name, photo & full details are retrieved
        apiRequest('/api/babysitter/profile')
          .then((prof) => {
            if (prof) {
              setCaregiverProfile(prof);
              if (prof.name) {
                setCaregiverName(prof.name);
              }
              if (prof.photoUrl) {
                setCaregiverPhoto((prev) => (prev?.startsWith('file://') ? prev : prof.photoUrl));
                setPhotoError(false);
              }
              if (prof.available !== undefined) {
                setIsAvailable(prof.available);
              }
              const count = prof.documentsCount || (Boolean(prof.verificationDocuments?.nationalId) + Boolean(prof.verificationDocuments?.passport)) || 0;
              setExistingDocsCount(count);
              if (typeof updateUserLocal === 'function' && (prof.name || prof.photoUrl)) {
                updateUserLocal({
                  name: prof.name || user?.name,
                  photoUrl: prof.photoUrl || user?.photoUrl,
                });
              }
            }
          })
          .catch(() => {});
      }
    }
  }, [isAuthenticated, isCaregiver, user?.id]);

  React.useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => {
      if (isAuthenticated && isCaregiver) {
        setPhotoError(false);
        apiRequest('/api/babysitter/profile')
          .then((prof) => {
            if (prof) {
              setCaregiverProfile(prof);
              if (prof.name) setCaregiverName(prof.name);
              if (prof.photoUrl) {
                setCaregiverPhoto((prev) => (prev?.startsWith('file://') ? prev : prof.photoUrl));
                setPhotoError(false);
              }
              if (prof.available !== undefined) setIsAvailable(prof.available);
              const count = prof.documentsCount || (Boolean(prof.verificationDocuments?.nationalId) + Boolean(prof.verificationDocuments?.passport)) || 0;
              setExistingDocsCount(count);
              if (typeof updateUserLocal === 'function' && (prof.name || prof.photoUrl)) {
                updateUserLocal({
                  name: prof.name || user?.name,
                  photoUrl: prof.photoUrl || user?.photoUrl,
                });
              }
            }
          })
          .catch(() => {});
      }
    });
    return unsubscribe;
  }, [navigation, isAuthenticated, isCaregiver]);

  // Password Modal
  const [passwordModal, setPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Email Modal
  const [emailModal, setEmailModal] = useState(false);
  const [emailCurrentPassword, setEmailCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);

  const handleToggleAvailability = async (val) => {
    setIsAvailable(val);
    setTogglingAvailability(true);
    try {
      await apiRequest('/api/babysitter/availability', {
        method: 'PATCH',
        body: JSON.stringify({ isAvailable: val }),
      });
      Alert.alert(t('success'), t('availabilityUpdated'));
    } catch (err) {
      setIsAvailable(!val);
      Alert.alert(t('error'), err.message || t('availabilityUpdateFailed'));
    } finally {
      setTogglingAvailability(false);
    }
  };

  const handleSavePassword = async () => {
    if (!currentPassword || newPassword.length < 8) {
      Alert.alert(t('error'), t('newPasswordMinChars'));
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      Alert.alert(t('success'), t('passwordUpdatedSuccess'));
    } catch (err) {
      Alert.alert(t('error'), err.message || t('passwordUpdateFailed'));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveEmail = async () => {
    if (!emailCurrentPassword || !newEmail.includes('@')) {
      Alert.alert(t('error'), t('validEmailRequired'));
      return;
    }
    setSavingEmail(true);
    try {
      await changeEmail(emailCurrentPassword, newEmail);
      setEmailModal(false);
      setEmailCurrentPassword('');
      setNewEmail('');
      Alert.alert(t('success'), t('emailUpdatedSuccess'));
    } catch (err) {
      Alert.alert(t('error'), err.message || t('emailUpdateFailed'));
    } finally {
      setSavingEmail(false);
    }
  };

  const handleOpenEditProfile = () => {
    setEditName(caregiverName || user?.name || user?.username || '');
    setEditPhoto(null);
    setEditDocuments([]);
    if (isCaregiver || user?.role === 'babysitter') {
      apiRequest('/api/babysitter/profile')
        .then((prof) => {
          if (prof) {
            setCaregiverProfile(prof);
            if (prof.name) {
              setEditName(prof.name);
              setCaregiverName(prof.name);
            }
            if (prof.phone) setEditPhone(prof.phone);
            if (prof.city) setEditCity(prof.city);
            if (prof.bio) setEditBio(prof.bio);
            if (prof.photoUrl) setCaregiverPhoto(prof.photoUrl);

            // Nationality
            const existingNat = prof.nationality || '';
            const standardNat = NATIONALITY_OPTIONS.slice(0, -1).find(
              (o) => o.toLowerCase() === existingNat.toLowerCase()
            );
            const isEgyptian = /^(egypt|egyptian)$/i.test(existingNat);
            const selection = standardNat || (isEgyptian ? 'Egypt' : existingNat ? 'Other' : 'Egypt');
            setEditNationalitySelection(selection);
            setEditOtherNationality(standardNat || isEgyptian ? '' : existingNat);
            setEditNationality(selection === 'Other' ? (existingNat || '') : selection);

            // Monthly Salary & Currency
            const currentSalary = prof.monthlySalary != null ? String(prof.monthlySalary) : (prof.hourlyRate != null ? String(prof.hourlyRate) : '');
            setEditMonthlySalary(currentSalary);
            setEditCurrency(prof.currency || 'EGP');

            const count = prof.documentsCount || (Boolean(prof.verificationDocuments?.nationalId) + Boolean(prof.verificationDocuments?.passport)) || 0;
            setExistingDocsCount(count);
          }
        })
        .catch(() => {});
    }
    setEditModal(true);
  };

  const handlePickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.uri;
        const filename = asset.fileName || uri.split('/').pop() || `caregiver_${Date.now()}.jpg`;
        const mimeType = asset.mimeType || (filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg');
        setEditPhoto({ uri, name: filename, type: mimeType });
      }
    } catch (err) {
      console.warn('Image picker error:', err);
      try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status === 'granted') {
          const retry = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });
          if (!retry.canceled && retry.assets && retry.assets.length > 0) {
            const asset = retry.assets[0];
            const uri = asset.uri;
            const filename = asset.fileName || uri.split('/').pop() || `caregiver_${Date.now()}.jpg`;
            const mimeType = asset.mimeType || (filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg');
            setEditPhoto({ uri, name: filename, type: mimeType });
            return;
          }
        }
      } catch (_) {}
      Alert.alert(t('error'), isArabic ? 'يرجى السماح بالوصول للصور لاختيار صورة الملف الشخصي' : 'Please allow photo access to choose a profile photo');
    }
  };

  const handlePickDocument = async () => {
    if (editDocuments.length >= 2) {
      Alert.alert(t('error'), t('twoDocsReached'));
      return;
    }
    try {
      const remainingLimit = 2 - editDocuments.length;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: remainingLimit,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newDocs = result.assets.slice(0, remainingLimit).map((asset, idx) => {
          const uri = asset.uri;
          const filename = asset.fileName || uri.split('/').pop() || `verification_${Date.now()}_${idx}.jpg`;
          const mimeType = asset.mimeType || (filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg');
          return { uri, name: filename, type: mimeType };
        });
        setEditDocuments((prev) => [...prev, ...newDocs].slice(0, 2));
      }
    } catch (err) {
      console.warn('Document picker error:', err);
      try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status === 'granted') {
          const remainingLimit = 2 - editDocuments.length;
          const retry = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            selectionLimit: remainingLimit,
            quality: 0.8,
          });
          if (!retry.canceled && retry.assets && retry.assets.length > 0) {
            const newDocs = retry.assets.slice(0, remainingLimit).map((asset, idx) => {
              const uri = asset.uri;
              const filename = asset.fileName || uri.split('/').pop() || `verification_${Date.now()}_${idx}.jpg`;
              const mimeType = asset.mimeType || (filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg');
              return { uri, name: filename, type: mimeType };
            });
            setEditDocuments((prev) => [...prev, ...newDocs].slice(0, 2));
            return;
          }
        }
      } catch (_) {}
      Alert.alert(t('error'), isArabic ? 'يرجى السماح بالوصول للصور لاختيار وثائق الإثبات' : 'Please allow photo access to upload documents');
    }
  };

  const handleRemoveDocument = (index) => {
    setEditDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  React.useEffect(() => {
    if (route?.params?.openEdit && isAuthenticated) {
      const timer = setTimeout(() => {
        handleOpenEditProfile();
        navigation?.setParams?.({ openEdit: false });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [route?.params?.openEdit, isAuthenticated]);

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert(t('error'), t('nameRequired'));
      return;
    }
    setSavingProfile(true);
    try {
      try {
        await apiRequest('/api/user/profile', {
          method: 'PATCH',
          body: JSON.stringify({ name: editName.trim() }),
        });
      } catch (patchErr) {
        console.warn('PATCH /api/user/profile skipped or not supported:', patchErr?.message);
      }

      if (isCaregiver) {
        const finalNationality = editNationalitySelection === 'Other'
          ? editOtherNationality.trim()
          : editNationalitySelection;
        const finalNationalityType = (finalNationality.toLowerCase() === 'egypt' || finalNationality.toLowerCase() === 'egyptian')
          ? 'egyptian'
          : 'other';

        await apiRequest('/api/babysitter/profile', {
          method: 'PUT',
          body: JSON.stringify({
            name: editName.trim(),
            phone: editPhone.trim(),
            city: editCity.trim(),
            bio: editBio.trim(),
            nationality: finalNationality || 'Egypt',
            nationalityType: finalNationalityType,
            monthlySalary: editMonthlySalary.trim() === '' ? undefined : Number(editMonthlySalary),
            currency: editCurrency || 'EGP',
          }),
        });
        setCaregiverName(editName.trim());

        // Upload new photo and/or verification documents if chosen
        if (editPhoto || editDocuments.length > 0) {
          const newPhotoUri = editPhoto?.uri;
          if (newPhotoUri) {
            setCaregiverPhoto(newPhotoUri);
            setPhotoTimestamp(Date.now());
            setPhotoError(false);
          }

          const formData = new FormData();
          if (editPhoto) {
            const isPng = editPhoto.name?.toLowerCase().endsWith('.png');
            formData.append('photo', {
              uri: editPhoto.uri,
              name: isPng ? 'caregiver_photo.png' : 'caregiver_photo.jpg',
              type: isPng ? 'image/png' : 'image/jpeg',
            });
          }
          if (editDocuments[0]) {
            const isPdf = editDocuments[0].name?.toLowerCase().endsWith('.pdf');
            const isPng = editDocuments[0].name?.toLowerCase().endsWith('.png');
            formData.append('nationalId', {
              uri: editDocuments[0].uri,
              name: isPdf ? 'verification_doc_1.pdf' : (isPng ? 'verification_doc_1.png' : 'verification_doc_1.jpg'),
              type: isPdf ? 'application/pdf' : (isPng ? 'image/png' : 'image/jpeg'),
            });
          }
          if (editDocuments[1]) {
            const isPdf = editDocuments[1].name?.toLowerCase().endsWith('.pdf');
            const isPng = editDocuments[1].name?.toLowerCase().endsWith('.png');
            formData.append('passport', {
              uri: editDocuments[1].uri,
              name: isPdf ? 'verification_doc_2.pdf' : (isPng ? 'verification_doc_2.png' : 'verification_doc_2.jpg'),
              type: isPdf ? 'application/pdf' : (isPng ? 'image/png' : 'image/jpeg'),
            });
          }

          const docRes = await apiRequest('/api/babysitter/profile/documents', {
            method: 'POST',
            body: formData,
          });

          if (newPhotoUri) {
            setCaregiverPhoto(newPhotoUri);
          } else if (docRes?.photoUrl) {
            setCaregiverPhoto(docRes.photoUrl);
          }
          setPhotoTimestamp(Date.now());
          setPhotoError(false);
          if (docRes?.documentsCount != null) {
            setExistingDocsCount(docRes.documentsCount);
          }
          if (typeof updateUserLocal === 'function') {
            updateUserLocal({
              name: editName.trim(),
              photoUrl: newPhotoUri || docRes?.photoUrl || user?.photoUrl,
            });
          }
        } else {
          if (typeof updateUserLocal === 'function') {
            updateUserLocal({
              name: editName.trim(),
            });
          }
        }
      }
      if (typeof refreshUser === 'function') {
        await refreshUser();
      }
      if (isCaregiver) {
        apiRequest('/api/babysitter/profile')
          .then((prof) => {
            if (prof) setCaregiverProfile(prof);
          })
          .catch(() => {});
      }
      setEditModal(false);
      Alert.alert(t('success'), t('profileUpdatedSuccess'));
    } catch (err) {
      Alert.alert(t('error'), err.message || t('profileUpdateFailed'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      t('confirmSignOut'),
      [
        { text: t('close'), style: 'cancel' },
        { text: t('logout'), style: 'destructive', onPress: logout },
      ]
    );
  };

  const rawPhoto = caregiverPhoto || caregiverProfile?.photoUrl || user?.photoUrl;
  let photoUri = null;
  if (rawPhoto) {
    if (rawPhoto.startsWith('file://') || rawPhoto.startsWith('content://') || rawPhoto.startsWith('http')) {
      photoUri = rawPhoto;
    } else {
      photoUri = `${API_BASE}${rawPhoto.startsWith('/') ? '' : '/'}${rawPhoto}`;
    }
    if (token && !photoUri.includes('token=')) {
      photoUri += `${photoUri.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`;
    }
    photoUri += `${photoUri.includes('?') ? '&' : '?'}t=${photoTimestamp}`;
  }
  const caregiverDisplayName = caregiverName || caregiverProfile?.name || user?.name || '';
  const displayName = isCaregiver
    ? (caregiverDisplayName || (user?.username && !user.username.startsWith('google-user') ? user.username : ''))
    : (user?.name || user?.username || t('userRole'));

  return (
    <ScreenWrapper>
      <Header title={t('profile')} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {isAuthenticated ? (
          <>
            {/* Account Card */}
            <Card style={styles.userCard}>
              <View style={[styles.userHeader, isRTL && styles.rowRTL]}>
                {!photoError && photoUri ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setPhotoModalVisible(true)}
                    style={styles.avatarTouchArea}
                  >
                    <Image
                      key={`${photoUri}_${photoTimestamp}`}
                      source={{
                        uri: photoUri,
                        headers: token ? {
                          Authorization: `Bearer ${token}`,
                          'x-auth-token': token,
                        } : undefined,
                      }}
                      style={styles.avatarPhoto}
                      onError={() => setPhotoError(true)}
                    />
                    <View style={styles.avatarZoomBadge}>
                      <Ionicons name="expand" size={10} color="#ffffff" />
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.avatarBadge}>
                    <Text style={styles.avatarLetter}>
                      {((displayName || user?.name || user?.email || (isCaregiver ? 'C' : 'U')).charAt(0)).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.userInfo}>
                  <Text style={styles.username}>
                    {displayName || (isCaregiver ? (caregiverName || user?.name || '') : t('userRole'))}
                  </Text>
                  <Text style={styles.userEmail}>{user?.email}</Text>
                  <TouchableOpacity
                    style={[styles.editProfileBtn, isRTL && styles.rowRTL]}
                    onPress={handleOpenEditProfile}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="create-outline" size={13} color={colors.white} />
                    <Text style={styles.editProfileBtnText}>{t('editProfile')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>

            {/* Caregiver Profile Details View Card */}
            {isCaregiver && (
              <Card style={styles.caregiverProfileCard}>
                {/* Moderation / Verification Status Banner */}
                <View style={[
                  styles.statusBanner,
                  caregiverProfile?.moderationStatus === 'approved' ? styles.statusBannerApproved : styles.statusBannerPending,
                  isRTL && styles.rowRTL
                ]}>
                  <Ionicons
                    name={caregiverProfile?.moderationStatus === 'approved' ? 'checkmark-circle' : 'time'}
                    size={20}
                    color={caregiverProfile?.moderationStatus === 'approved' ? colors.success : '#b87700'}
                  />
                  <View style={{ flex: 1, marginHorizontal: 8 }}>
                    <Text style={[
                      styles.statusBannerTitle,
                      { color: caregiverProfile?.moderationStatus === 'approved' ? '#1b5e20' : '#8c5000' },
                      isRTL && styles.textRTL
                    ]}>
                      {caregiverProfile?.moderationStatus === 'approved'
                        ? (t('moderation_approved') || 'Approved Caregiver')
                        : (t('moderation_pending') || 'Pending Admin Review')}
                    </Text>
                    <Text style={[styles.statusBannerDesc, isRTL && styles.textRTL]}>
                      {caregiverProfile?.moderationStatus === 'approved'
                        ? (t('accountApprovedDesc') || 'Your profile is approved and actively visible to families on CareNest.')
                        : (t('accountPendingDesc') || 'Your account is under review by our moderation team. You can update your details or add documents anytime.')}
                    </Text>
                  </View>
                </View>

                {/* Caregiver Photo & Identity Preview Header */}
                <View style={[styles.caregiverPhotoHeader, isRTL && styles.rowRTL]}>
                  <TouchableOpacity
                    style={styles.caregiverPhotoContainer}
                    activeOpacity={0.85}
                    onPress={() => {
                      if (!photoError && photoUri) {
                        setPhotoModalVisible(true);
                      } else {
                        handleOpenEditProfile();
                      }
                    }}
                  >
                    {!photoError && photoUri ? (
                      <Image
                        key={`card_${photoUri}_${photoTimestamp}`}
                        source={{
                          uri: photoUri,
                          headers: token ? {
                            Authorization: `Bearer ${token}`,
                            'x-auth-token': token,
                          } : undefined,
                        }}
                        style={styles.caregiverCardPhoto}
                        onError={() => setPhotoError(true)}
                      />
                    ) : (
                      <View style={styles.caregiverCardPhotoFallback}>
                        <Ionicons name="camera" size={32} color={colors.white} />
                        <Text style={styles.uploadPhotoHintText}>
                          {t('uploadPhoto') || (isArabic ? 'إضافة صورة' : 'Add Photo')}
                        </Text>
                      </View>
                    )}
                    {!photoError && photoUri && (
                      <View style={styles.enlargeBadge}>
                        <Ionicons name="expand" size={14} color="#ffffff" />
                      </View>
                    )}
                  </TouchableOpacity>

                  <View style={[styles.caregiverPhotoInfo, isRTL && styles.alignRTL]}>
                    <Text style={[styles.caregiverMainName, isRTL && styles.textRTL]}>
                      {caregiverDisplayName || user?.name || user?.username}
                    </Text>
                    <View style={[styles.verifiedRoleTag, isRTL && styles.rowRTL]}>
                      <Ionicons name="sparkles" size={12} color="#c026d3" />
                      <Text style={styles.verifiedRoleTagText}>
                        {t('caregiver') || t('babysitterRole') || (isArabic ? 'جليسة أطفال' : 'Caregiver')}
                      </Text>
                    </View>
                    {!photoError && photoUri ? (
                      <TouchableOpacity
                        style={[styles.viewPhotoTextBtn, isRTL && styles.rowRTL]}
                        onPress={() => setPhotoModalVisible(true)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="eye-outline" size={14} color={colors.primary} />
                        <Text style={styles.viewPhotoTextBtnLabel}>
                          {isArabic ? 'عرض الصورة بالحجم الكامل' : 'View Full Photo'}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.viewPhotoTextBtn, isRTL && styles.rowRTL]}
                        onPress={handleOpenEditProfile}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="add-circle-outline" size={14} color={colors.primary} />
                        <Text style={styles.viewPhotoTextBtnLabel}>
                          {isArabic ? 'إضافة صورة شخصية' : 'Add Profile Picture'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Section Title */}
                <View style={[styles.sectionHeadingRow, isRTL && styles.rowRTL, { marginTop: 14 }]}>
                  <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
                    {t('caregiverProfileTitle') || 'Caregiver Profile Details'}
                  </Text>
                </View>

                {/* Key Details Rows */}
                <View style={styles.detailsGrid}>
                  {/* City */}
                  <View style={[styles.detailRow, isRTL && styles.rowRTL]}>
                    <View style={styles.detailIconWrapper}>
                      <Ionicons name="location-outline" size={16} color={colors.primary} />
                    </View>
                    <Text style={[styles.detailLabel, isRTL && styles.textRTL]}>{t('city')}:</Text>
                    <Text style={[styles.detailValue, isRTL && styles.textRTL]}>
                      {t(caregiverProfile?.city) || caregiverProfile?.city || t('notAvailable') || 'Cairo'}
                    </Text>
                  </View>

                  {/* Nationality */}
                  {caregiverProfile?.nationality ? (
                    <View style={[styles.detailRow, isRTL && styles.rowRTL]}>
                      <View style={styles.detailIconWrapper}>
                        <Ionicons name="flag-outline" size={16} color={colors.primary} />
                      </View>
                      <Text style={[styles.detailLabel, isRTL && styles.textRTL]}>{t('nationality')}:</Text>
                      <Text style={[styles.detailValue, isRTL && styles.textRTL]}>
                        {t(`nationality_${caregiverProfile.nationality.toLowerCase().replaceAll(' ', '_')}`) !== `nationality_${caregiverProfile.nationality.toLowerCase().replaceAll(' ', '_')}`
                          ? t(`nationality_${caregiverProfile.nationality.toLowerCase().replaceAll(' ', '_')}`)
                          : caregiverProfile.nationality}
                      </Text>
                    </View>
                  ) : null}

                  {/* Phone */}
                  {caregiverProfile?.phone ? (
                    <View style={[styles.detailRow, isRTL && styles.rowRTL]}>
                      <View style={styles.detailIconWrapper}>
                        <Ionicons name="call-outline" size={16} color={colors.primary} />
                      </View>
                      <Text style={[styles.detailLabel, isRTL && styles.textRTL]}>{t('phone')}:</Text>
                      <Text style={[styles.detailValue, isRTL && styles.textRTL]}>{caregiverProfile.phone}</Text>
                    </View>
                  ) : null}

                  {/* Age */}
                  {caregiverProfile?.age ? (
                    <View style={[styles.detailRow, isRTL && styles.rowRTL]}>
                      <View style={styles.detailIconWrapper}>
                        <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                      </View>
                      <Text style={[styles.detailLabel, isRTL && styles.textRTL]}>{t('age')}:</Text>
                      <Text style={[styles.detailValue, isRTL && styles.textRTL]}>
                        {caregiverProfile.age} {t('years') || 'years'}
                      </Text>
                    </View>
                  ) : null}

                  {/* Salary */}
                  {caregiverProfile?.monthlySalary ? (
                    <View style={[styles.detailRow, isRTL && styles.rowRTL]}>
                      <View style={styles.detailIconWrapper}>
                        <Ionicons name="cash-outline" size={16} color={colors.primary} />
                      </View>
                      <Text style={[styles.detailLabel, isRTL && styles.textRTL]}>{t('monthlySalary')}:</Text>
                      <Text style={[styles.detailValue, isRTL && styles.textRTL]}>
                        {caregiverProfile.monthlySalary} {caregiverProfile.currency || 'EGP'} / {t('perMonth') || 'month'}
                      </Text>
                    </View>
                  ) : null}

                  {/* Verification Documents */}
                  <View style={[styles.detailRow, isRTL && styles.rowRTL]}>
                    <View style={styles.detailIconWrapper}>
                      <Ionicons name="document-text-outline" size={16} color={colors.primary} />
                    </View>
                    <Text style={[styles.detailLabel, isRTL && styles.textRTL]}>{t('verificationDocs')}:</Text>
                    <Text style={[styles.detailValue, isRTL && styles.textRTL]}>
                      {existingDocsCount > 0
                        ? `${existingDocsCount} ${t('verified') || 'uploaded'} ✓`
                        : (t('noDocsYet') || 'No documents yet')}
                    </Text>
                  </View>
                </View>

                {/* Services Provided */}
                {Array.isArray(caregiverProfile?.services) && caregiverProfile.services.length > 0 && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={[styles.subSectionTitle, isRTL && styles.textRTL]}>{t('selectServices')}</Text>
                    <View style={[styles.servicesBadgeContainer, isRTL && styles.rowRTL]}>
                      {caregiverProfile.services.map((srv) => (
                        <View key={srv} style={[styles.servicePill, isRTL && styles.rowRTL]}>
                          <Ionicons
                            name={srv === 'cleaning' ? 'sparkles' : srv === 'cooking' ? 'restaurant' : 'heart'}
                            size={12}
                            color={colors.primary}
                          />
                          <Text style={styles.servicePillText}>{t(srv) || srv}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Bio */}
                {caregiverProfile?.bio ? (
                  <View style={{ marginTop: 12 }}>
                    <Text style={[styles.subSectionTitle, isRTL && styles.textRTL]}>{t('bio')}</Text>
                    <Text style={[styles.bioText, isRTL && styles.textRTL]}>{caregiverProfile.bio}</Text>
                  </View>
                ) : null}

                {/* Actions inside profile card */}
                <View style={[styles.profileActionsRow, isRTL && styles.rowRTL]}>
                  <TouchableOpacity
                    style={styles.previewBtn}
                    onPress={() => {
                      if (caregiverProfile?._id || user?.id) {
                        navigation.navigate('CaregiverDetails', {
                          sitterId: caregiverProfile?._id || user?.id,
                          sitter: {
                            ...caregiverProfile,
                            _id: caregiverProfile?._id || user?.id,
                            name: caregiverDisplayName || user?.name,
                            photoUrl: photoUri,
                          },
                        });
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="eye-outline" size={15} color={colors.primary} />
                    <Text style={styles.previewBtnText}>{t('previewPublicProfile') || 'Preview Public View'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.editCardBtn}
                    onPress={handleOpenEditProfile}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="create-outline" size={15} color={colors.white} />
                    <Text style={styles.editCardBtnText}>{t('editProfile')}</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            )}

            {/* Caregiver Quick Controls */}
            {isCaregiver && (
              <Card>
                <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('caregiverControls')}</Text>
                <View style={[styles.toggleRow, isRTL && styles.rowRTL]}>
                  <View style={styles.toggleInfo}>
                    <Text style={styles.toggleTitle}>{t('available')}</Text>
                    <Text style={styles.toggleSub}>
                      {t('acceptingRequests')}
                    </Text>
                  </View>
                  <Switch
                    value={isAvailable}
                    onValueChange={handleToggleAvailability}
                    trackColor={{ false: '#e2d7e5', true: colors.primary }}
                    thumbColor={isAvailable ? colors.white : '#f4f3f4'}
                    disabled={togglingAvailability}
                  />
                </View>
              </Card>
            )}

            {/* Caregiver Ratings & Reviews */}
            {isCaregiver && (
              <Card>
                <View style={[styles.sectionHeadingRow, isRTL && styles.rowRTL]}>
                  <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('ratingsAndReviews')}</Text>
                  <View style={styles.profileRatingBadge}>
                    <Ionicons name="star" size={14} color={colors.gold} />
                    <Text style={styles.profileRatingText}>
                      {caregiverStats.averageRating != null ? caregiverStats.averageRating.toFixed(1) : '5.0'} ({caregiverStats.ratingsCount || 0})
                    </Text>
                  </View>
                </View>

                {caregiverReviews && caregiverReviews.length > 0 ? (
                  <View style={styles.reviewsFeed}>
                    {caregiverReviews.slice(0, 3).map((rev, idx) => (
                      <View key={rev._id || idx} style={styles.reviewSnippet}>
                        <View style={[styles.reviewSnippetHeader, isRTL && styles.rowRTL]}>
                          <Text style={styles.snippetUserName}>{rev.userName || t('familyMember')}</Text>
                          <View style={styles.snippetStars}>
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Ionicons
                                key={s}
                                name={s <= rev.rating ? 'star' : 'star-outline'}
                                size={12}
                                color={s <= rev.rating ? colors.gold : '#d3cad6'}
                              />
                            ))}
                          </View>
                        </View>
                        <Text style={styles.snippetTitle}>{rev.title}</Text>
                        <Text style={styles.snippetDesc} numberOfLines={2}>{rev.description}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={[styles.emptySectionText, isRTL && styles.textRTL]}>
                    {t('noReviewsYet')}
                  </Text>
                )}
              </Card>
            )}

            {/* Notifications Center Card */}
            <Card>
              <View style={[styles.sectionHeadingRow, isRTL && styles.rowRTL]}>
                <View style={[styles.headingWithBadge, isRTL && styles.rowRTL]}>
                  <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('notifications')}</Text>
                  {unreadCount > 0 && (
                    <View style={styles.unreadPill}>
                      <Text style={styles.unreadPillText}>{unreadCount}</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  onPress={() => setShowNotifModal(true)}
                  style={styles.viewAllBtn}
                >
                  <Text style={styles.viewAllBtnText}>{t('viewAll')}</Text>
                </TouchableOpacity>
              </View>

              {recentNotifications && recentNotifications.length > 0 ? (
                <View style={styles.notifFeed}>
                  {recentNotifications.map((notif) => (
                    <TouchableOpacity
                      key={notif._id}
                      style={[styles.notifSnippet, !notif.read && styles.notifSnippetUnread, isRTL && styles.rowRTL]}
                      onPress={() => setShowNotifModal(true)}
                    >
                      <View style={styles.notifSnippetIcon}>
                        <Ionicons
                          name={notif.type === 'rating_received' ? 'star' : notif.type === 'booking_requested' ? 'calendar' : 'notifications'}
                          size={16}
                          color={notif.type === 'rating_received' ? colors.gold : colors.plum}
                        />
                      </View>
                      <View style={styles.notifSnippetContent}>
                        <Text style={[styles.notifSnippetTitle, !notif.read && styles.notifSnippetTitleBold, isRTL && styles.textRTL]} numberOfLines={1}>
                          {notif.title}
                        </Text>
                        <Text style={[styles.notifSnippetMsg, isRTL && styles.textRTL]} numberOfLines={1}>
                          {notif.message}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={[styles.emptySectionText, isRTL && styles.textRTL]}>
                  {t('noNotifications')}
                </Text>
              )}
            </Card>

            {/* Security Section */}
            <Card>
              <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('accountSecurity')}</Text>
              
              <TouchableOpacity
                style={[styles.menuItem, isRTL && styles.rowRTL]}
                onPress={() => setPasswordModal(true)}
              >
                <Ionicons name="key-outline" size={20} color={colors.plum} />
                <Text style={styles.menuItemText}>{t('changePassword')}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuItem, isRTL && styles.rowRTL]}
                onPress={() => setEmailModal(true)}
              >
                <Ionicons name="mail-outline" size={20} color={colors.plum} />
                <Text style={styles.menuItemText}>{t('changeEmail')}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
              </TouchableOpacity>
            </Card>
          </>
        ) : (
          /* Unauthenticated State */
          <Card style={styles.authPromptCard}>
            <Ionicons name="person-circle-outline" size={60} color={colors.plum} />
            <Text style={styles.authPromptTitle}>{t('welcome')}</Text>
            <Text style={styles.authPromptSubtitle}>
              {t('authPromptDesc')}
            </Text>

            <View style={styles.authButtonsRow}>
              <Button
                title={t('login')}
                variant="plum"
                onPress={() => navigation.navigate('Login')}
                style={styles.authBtn}
              />
              <Button
                title={t('register')}
                variant="outline"
                onPress={() => navigation.navigate('Register')}
                style={styles.authBtn}
              />
            </View>
          </Card>
        )}

        {/* Preferences / Settings */}
        <Card>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('appSettings')}</Text>

          <TouchableOpacity
            style={[styles.menuItem, isRTL && styles.rowRTL]}
            onPress={() => setLocale(locale === 'en' ? 'ar' : 'en')}
          >
            <Ionicons name="globe-outline" size={20} color={colors.plum} />
            <Text style={styles.menuItemText}>{t('language')}</Text>
            <Text style={styles.settingValueText}>{locale === 'en' ? 'English' : 'العربية'}</Text>
          </TouchableOpacity>
        </Card>

        {isAuthenticated && (
          <Button
            title={t('logout')}
            variant="danger"
            onPress={handleLogout}
            icon={<Ionicons name="log-out-outline" size={18} color={colors.white} />}
            style={styles.logoutBtn}
          />
        )}
      </ScrollView>

      {/* Full-Screen Caregiver Photo Modal */}
      <Modal
        visible={photoModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <View style={styles.photoModalBackdrop}>
          <TouchableOpacity
            style={styles.photoModalCloseBtn}
            onPress={() => setPhotoModalVisible(false)}
            activeOpacity={0.7}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Ionicons name="close-circle" size={38} color="#ffffff" />
          </TouchableOpacity>

          <View style={styles.photoModalContent}>
            <View style={styles.photoModalImageCard}>
              {photoUri ? (
                <Image
                  key={`modal_${photoUri}_${photoTimestamp}`}
                  source={{
                    uri: photoUri,
                    headers: token ? {
                      Authorization: `Bearer ${token}`,
                      'x-auth-token': token,
                    } : undefined,
                  }}
                  style={styles.photoModalFullImage}
                  resizeMode="contain"
                />
              ) : null}
            </View>
            <Text style={styles.photoModalSitterName}>
              {caregiverDisplayName || user?.name || user?.username}
            </Text>
            <Text style={styles.photoModalSitterRole}>
              {t('caregiver') || t('babysitterRole') || (isArabic ? 'جليسة أطفال' : 'Caregiver')}
            </Text>
            {caregiverProfile?.city ? (
              <Text style={styles.photoModalSitterCity}>
                {t(caregiverProfile.city) || caregiverProfile.city}
              </Text>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Password Modal */}
      <Modal visible={passwordModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalHeader, isRTL && styles.rowRTL]}>
              <Text style={styles.modalTitle}>{t('changePassword')}</Text>
              <TouchableOpacity onPress={() => setPasswordModal(false)}>
                <Ionicons name="close-circle" size={26} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Input
              label={t('currentPassword')}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              required
            />
            <Input
              label={t('newPassword')}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder={t('min8Chars')}
              required
            />
            <Button
              title={t('saveChanges')}
              variant="plum"
              onPress={handleSavePassword}
              loading={savingPassword}
            />
          </View>
        </View>
      </Modal>

      {/* Email Modal */}
      <Modal visible={emailModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalHeader, isRTL && styles.rowRTL]}>
              <Text style={styles.modalTitle}>{t('changeEmail')}</Text>
              <TouchableOpacity onPress={() => setEmailModal(false)}>
                <Ionicons name="close-circle" size={26} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Input
              label={t('currentPassword')}
              value={emailCurrentPassword}
              onChangeText={setEmailCurrentPassword}
              secureTextEntry
              required
            />
            <Input
              label={t('email')}
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
              placeholder="new@example.com"
              required
            />
            <Button
              title={t('saveChanges')}
              variant="plum"
              onPress={handleSaveEmail}
              loading={savingEmail}
            />
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal visible={editModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalHeader, isRTL && styles.rowRTL]}>
              <Text style={styles.modalTitle}>{t('editProfile')}</Text>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <Ionicons name="close-circle" size={26} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              {/* Profile Photo Uploader for Caregiver */}
              {isCaregiver && (
                <View style={styles.modalPhotoSection}>
                  <View style={styles.modalPhotoWrapper}>
                    {editPhoto ? (
                      <Image source={{ uri: editPhoto.uri }} style={styles.modalPhotoImg} />
                    ) : photoUri ? (
                      <Image source={{ uri: photoUri }} style={styles.modalPhotoImg} />
                    ) : (
                      <View style={styles.modalPhotoPlaceholder}>
                        <Ionicons name="person" size={32} color={colors.plum} />
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.photoBadgeBtn}
                      onPress={handlePickPhoto}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="camera" size={14} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.uploadPhotoBtn}
                    onPress={handlePickPhoto}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="cloud-upload-outline" size={15} color={colors.primary} />
                    <Text style={styles.uploadPhotoBtnText}>
                      {editPhoto || photoUri ? t('changePhoto') : t('uploadPhoto')}
                    </Text>
                  </TouchableOpacity>
                  {editPhoto && (
                    <TouchableOpacity onPress={() => setEditPhoto(null)} style={{ marginTop: 6 }}>
                      <Text style={styles.resetPhotoText}>
                        {t('cancelChange')}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <Input
                label={t('fullName')}
                value={editName}
                onChangeText={setEditName}
                placeholder={displayName}
                required
              />
              {isCaregiver && (
                <>
                  <Input
                    label={t('phone')}
                    value={editPhone}
                    onChangeText={setEditPhone}
                    placeholder="010XXXXXXXX"
                    keyboardType="phone-pad"
                  />

                  {/* Nationality Section */}
                  <View style={styles.formSection}>
                    <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>
                      {t('nationality')}
                    </Text>
                    <View style={[styles.chipsContainer, isRTL && styles.rowRTL]}>
                      {NATIONALITY_OPTIONS.map((item) => {
                        const active = editNationalitySelection === item;
                        const key = item.toLowerCase().replaceAll(' ', '_');
                        const label = t(`nationality_${key}`) !== `nationality_${key}`
                          ? t(`nationality_${key}`)
                          : item;
                        return (
                          <TouchableOpacity
                            key={item}
                            style={[styles.choiceChip, active && styles.choiceChipActive]}
                            onPress={() => {
                              setEditNationalitySelection(item);
                              if (item !== 'Other') {
                                setEditNationality(item);
                              }
                            }}
                          >
                            <Text style={[styles.choiceChipText, active && styles.choiceChipTextActive]}>
                              {label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    {editNationalitySelection === 'Other' && (
                      <Input
                        label={t('specifyNationality')}
                        value={editOtherNationality}
                        onChangeText={(txt) => {
                          setEditOtherNationality(txt);
                          setEditNationality(txt);
                        }}
                        placeholder="e.g. Kenya"
                        required
                        style={{ marginTop: 8 }}
                      />
                    )}
                  </View>

                  {/* Expected Monthly Salary & Currency Row */}
                  <View style={[styles.salaryRow, isRTL && styles.rowRTL]}>
                    <View style={styles.salaryInputCol}>
                      <Input
                        label={t('monthlySalary')}
                        value={editMonthlySalary}
                        onChangeText={setEditMonthlySalary}
                        placeholder="7000"
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.currencyCol}>
                      <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>{t('currency')}</Text>
                      <View style={[styles.currencyToggleRow, isRTL && styles.rowRTL]}>
                        {['EGP', 'USD'].map((curr) => {
                          const active = editCurrency === curr;
                          return (
                            <TouchableOpacity
                              key={curr}
                              style={[styles.currencyPill, active && styles.currencyPillActive]}
                              onPress={() => setEditCurrency(curr)}
                            >
                              <Text style={[styles.currencyPillText, active && styles.currencyPillTextActive]}>
                                {curr}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  </View>

                  <Input
                    label={t('city')}
                    value={editCity}
                    onChangeText={setEditCity}
                    placeholder={t('Cairo')}
                  />
                  <Input
                    label={t('bio')}
                    value={editBio}
                    onChangeText={setEditBio}
                    placeholder={t('bioPlaceholder')}
                    multiline
                    numberOfLines={3}
                  />

                  {/* Verification Documents Section (Up to 2 documents) */}
                  <View style={styles.modalDocsSection}>
                    <View style={[styles.docsHeaderRow, isRTL && styles.rowRTL]}>
                      <Text style={[styles.docsSectionTitle, isRTL && styles.textRTL]}>
                        {t('verificationDocs')}
                      </Text>
                      <Text style={styles.docsLimitHint}>
                        {editDocuments.length}/2
                      </Text>
                    </View>
                    <Text style={[styles.docsSubtext, isRTL && styles.textRTL]}>
                      {t('twoDocsLimit')}
                    </Text>

                    {/* Existing verified documents indicator */}
                    {existingDocsCount > 0 && editDocuments.length === 0 && (
                      <View style={[styles.existingDocsBadge, isRTL && styles.rowRTL]}>
                        <Ionicons name="shield-checkmark" size={16} color="#16a34a" />
                        <Text style={styles.existingDocsText}>
                          {`${existingDocsCount} ${t('verifiedDocsOnFile')}`}
                        </Text>
                      </View>
                    )}

                    {/* Newly picked documents preview list */}
                    {editDocuments.length > 0 && (
                      <View style={styles.docsList}>
                        {editDocuments.map((doc, idx) => (
                          <View key={idx} style={[styles.docItemCard, isRTL && styles.rowRTL]}>
                            <Image source={{ uri: doc.uri }} style={styles.docThumbnail} />
                            <View style={styles.docDetails}>
                              <Text style={styles.docNameText} numberOfLines={1}>
                                {doc.name || `${t('documentWord')} ${idx + 1}`}
                              </Text>
                              <Text style={styles.docStatusText}>
                                {t('readyToSave')}
                              </Text>
                            </View>
                            <TouchableOpacity
                              onPress={() => handleRemoveDocument(idx)}
                              style={styles.docRemoveBtn}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                              <Ionicons name="trash-outline" size={18} color="#dc2626" />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Add Document button */}
                    {editDocuments.length < 2 && (
                      <TouchableOpacity
                        style={[styles.addDocBtn, isRTL && styles.rowRTL]}
                        onPress={handlePickDocument}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="document-attach-outline" size={18} color={colors.primary} />
                        <Text style={styles.addDocBtnText}>
                          {editDocuments.length === 0 && existingDocsCount > 0
                            ? t('uploadReplacementDocs')
                            : t('addDocument')}
                        </Text>
                      </TouchableOpacity>
                    )}
                    <Text style={[styles.noticeText, isRTL && styles.textRTL]}>
                      {t('documentsNotice')}
                    </Text>
                  </View>
                </>
              )}
              <Button
                title={t('saveChanges')}
                variant="plum"
                onPress={handleSaveProfile}
                loading={savingProfile}
                style={styles.modalSaveBtn}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <NotificationsModal
        visible={showNotifModal}
        onClose={() => setShowNotifModal(false)}
        onNotificationCountChange={setUnreadCount}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 80,
  },
  userCard: {
    paddingVertical: spacing.md,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.plum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTouchArea: {
    position: 'relative',
  },
  avatarZoomBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatarPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.plum,
  },
  avatarLetter: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.white,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  userEmail: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.plum,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  editProfileBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  caregiverProfileCard: {
    paddingVertical: spacing.md,
  },
  caregiverPhotoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1e5f3',
    marginBottom: 10,
  },
  caregiverPhotoContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.primary,
    backgroundColor: '#f5eff7',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  caregiverCardPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 37,
  },
  caregiverCardPhotoFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.plum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadPhotoHintText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 2,
    textAlign: 'center',
  },
  enlargeBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  caregiverPhotoInfo: {
    flex: 1,
  },
  caregiverMainName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  verifiedRoleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fdf2f8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#fbcfe8',
  },
  verifiedRoleTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#be185d',
  },
  viewPhotoTextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  viewPhotoTextBtnLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  photoModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 10, 20, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  photoModalCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 24,
    zIndex: 999,
  },
  photoModalContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  photoModalImageCard: {
    width: Math.min(SCREEN_WIDTH - 48, 320),
    height: Math.min(SCREEN_WIDTH - 48, 320),
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: '#000000',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: spacing.md,
  },
  photoModalFullImage: {
    width: '100%',
    height: '100%',
  },
  photoModalSitterName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 8,
    textAlign: 'center',
  },
  photoModalSitterRole: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f1a2d2',
    marginTop: 2,
    textAlign: 'center',
  },
  photoModalSitterCity: {
    fontSize: 14,
    color: '#e2d7e5',
    marginTop: 4,
    textAlign: 'center',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: 4,
  },
  statusBannerApproved: {
    backgroundColor: '#edf7ed',
    borderColor: '#c8e6c9',
  },
  statusBannerPending: {
    backgroundColor: '#fff8e1',
    borderColor: '#ffe082',
  },
  statusBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  statusBannerDesc: {
    fontSize: 11,
    color: '#665c54',
    marginTop: 2,
    lineHeight: 15,
  },
  detailsGrid: {
    marginTop: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#f7eff8',
  },
  detailIconWrapper: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
    width: 110,
  },
  detailValue: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    fontWeight: '700',
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 6,
  },
  servicesBadgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  servicePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f6ecf8',
    borderColor: '#ebd2ef',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  servicePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.plum,
  },
  bioText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
    backgroundColor: '#faf6fb',
    padding: 10,
    borderRadius: radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  profileActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  previewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: '#ffffff',
  },
  previewBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  editCardBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.plum,
  },
  editCardBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  modalSaveBtn: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  toggleSub: {
    fontSize: 12,
    color: colors.textMuted,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1e8f2',
    gap: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  settingValueText: {
    fontSize: 13,
    color: colors.plum,
    fontWeight: '700',
  },
  authPromptCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  authPromptTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginTop: 10,
    marginBottom: 6,
  },
  authPromptSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  authButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  authBtn: {
    flex: 1,
  },
  logoutBtn: {
    marginTop: spacing.md,
    borderRadius: radius.md,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalScroll: {
    paddingBottom: 20,
  },
  modalPhotoSection: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalPhotoWrapper: {
    position: 'relative',
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#f1e8f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  modalPhotoImg: {
    width: 82,
    height: 82,
    borderRadius: 41,
  },
  modalPhotoPlaceholder: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#f1e8f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoBadgeBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  uploadPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#e7dbe9',
  },
  uploadPhotoBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  resetPhotoText: {
    fontSize: 11,
    color: colors.danger,
    fontWeight: '600',
  },
  modalDocsSection: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: '#fcfafc',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#f1e8f2',
  },
  docsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  docsSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  docsLimitHint: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  docsSubtext: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 10,
  },
  existingDocsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ecfdf5',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    marginBottom: 10,
  },
  existingDocsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803d',
  },
  docsList: {
    gap: 8,
    marginBottom: 10,
  },
  docItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#e7dbe9',
    gap: 10,
  },
  docThumbnail: {
    width: 42,
    height: 42,
    borderRadius: 6,
    backgroundColor: '#f1e8f2',
  },
  docDetails: {
    flex: 1,
  },
  docNameText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  docStatusText: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  docRemoveBtn: {
    padding: 6,
  },
  addDocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    backgroundColor: '#ffffff',
  },
  addDocBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  noticeText: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  textRTL: {
    textAlign: 'right',
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  headingWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadPill: {
    backgroundColor: colors.danger,
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: radius.pill,
  },
  unreadPillText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  viewAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewAllBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  profileRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff9e6',
    borderWidth: 1,
    borderColor: '#ffe8a3',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
  },
  profileRatingText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.plum,
  },
  reviewsFeed: {
    marginTop: 8,
  },
  reviewSnippet: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1e8f2',
  },
  reviewSnippetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  snippetUserName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  snippetStars: {
    flexDirection: 'row',
    gap: 2,
  },
  snippetTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.plum,
    marginTop: 2,
  },
  snippetDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  notifFeed: {
    marginTop: 6,
  },
  notifSnippet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1e8f2',
  },
  notifSnippetUnread: {
    backgroundColor: '#fbf7fc',
  },
  notifSnippetIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5eff7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifSnippetContent: {
    flex: 1,
  },
  notifSnippetTitle: {
    fontSize: 12,
    color: colors.text,
  },
  notifSnippetTitleBold: {
    fontWeight: '800',
    color: colors.plum,
  },
  notifSnippetMsg: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  emptySectionText: {
    fontSize: 12,
    color: colors.textMuted,
    marginVertical: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  formSection: {
    marginBottom: spacing.sm,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
    marginBottom: 4,
  },
  choiceChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#e7dbe9',
  },
  choiceChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  choiceChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  choiceChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  salaryInputCol: {
    flex: 1.2,
  },
  currencyCol: {
    flex: 0.9,
  },
  currencyToggleRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  currencyPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#e7dbe9',
  },
  currencyPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  currencyPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  currencyPillTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
});
