import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Modal,
  ScrollView,
  Alert,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { colors, radius, spacing } from '../theme';
import { useLocale } from '../locales';
import { useAuth } from '../context/AuthContext';
import { apiRequest, API_BASE } from '../services/api';

export default function BlacklistScreen() {
  const { t, locale, isRTL } = useLocale();
  const { isAuthenticated } = useAuth();
  const isArabic = locale === 'ar';

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Submit Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [nationality, setNationality] = useState(isArabic ? 'مصر' : 'Egypt');
  const [age, setAge] = useState('');
  const [incidentDate, setIncidentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [incidentDescription, setIncidentDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = async () => {
    try {
      const data = await apiRequest('/api/blacklist');
      if (Array.isArray(data)) {
        setReports(data);
      }
    } catch (e) {
      console.warn('Failed to load blacklist reports:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const handleOpenReportModal = () => {
    if (!isAuthenticated) {
      Alert.alert(
        t('login'),
        isArabic
          ? 'يجب تسجيل الدخول بحساب أسرة لتقديم بلاغ للمراجعة والتدقيق.'
          : 'Only registered family members can submit incident reports for verification.'
      );
      return;
    }
    setModalVisible(true);
  };

  // Pick Caregiver Profile Photo
  const handlePickPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          t('error'),
          isArabic
            ? 'يرجى منح صلاحية الوصول للصور لاختيار صورة مقدمة الرعاية.'
            : 'Permission to access photos is required to upload a caregiver photo.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.uri;
        const filename = asset.fileName || uri.split('/').pop() || 'caregiver.jpg';
        const mimeType = asset.mimeType || (filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg');
        setPhoto({ uri, name: filename, type: mimeType });
      }
    } catch (err) {
      Alert.alert(t('error'), err.message || (isArabic ? 'تعذر اختيار الصورة' : 'Failed to pick photo'));
    }
  };

  // Pick Verification Documents (Max 2)
  const handlePickDocument = async () => {
    if (documents.length >= 2) {
      Alert.alert(t('error'), t('maxDocumentsReached'));
      return;
    }

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          t('error'),
          isArabic
            ? 'يرجى منح صلاحية الوصول للصور لاختيار وثائق الإثبات.'
            : 'Permission to access photos is required to upload verification documents.'
        );
        return;
      }

      const remainingLimit = 2 - documents.length;
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

        setDocuments((prev) => [...prev, ...newDocs].slice(0, 2));
      }
    } catch (err) {
      Alert.alert(t('error'), err.message || (isArabic ? 'تعذر اختيار الوثيقة' : 'Failed to pick document'));
    }
  };

  const handleRemoveDocument = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReport = async () => {
    if (!name.trim()) {
      Alert.alert(t('error'), isArabic ? 'يرجى إدخال اسم مقدمة الرعاية.' : 'Please enter the caregiver name.');
      return;
    }

    if (!incidentDescription.trim() || incidentDescription.trim().length < 10) {
      Alert.alert(
        t('error'),
        isArabic
          ? 'يرجى تقديم تفاصيل واضحة للواقعة (10 أحرف على الأقل).'
          : 'Please provide details of the incident (at least 10 characters).'
      );
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('nationality', nationality.trim() || (isArabic ? 'مصر' : 'Egypt'));
      if (age.trim() && !isNaN(Number(age))) {
        formData.append('age', String(Number(age)));
      }
      formData.append('reason', incidentDescription.trim());
      formData.append('incidentDescription', incidentDescription.trim());
      formData.append('incidentDate', incidentDate);
      if (phone.trim()) formData.append('phone', phone.trim());

      // Caregiver Photo (Optional)
      if (photo) {
        formData.append('photo', {
          uri: photo.uri,
          name: photo.name || 'caregiver.jpg',
          type: photo.type || 'image/jpeg',
        });
      }

      // Verification Documents (Max 2)
      documents.slice(0, 2).forEach((doc, idx) => {
        formData.append('documents', {
          uri: doc.uri,
          name: doc.name || `verification_doc_${idx + 1}.jpg`,
          type: doc.type || 'image/jpeg',
        });
      });

      await apiRequest('/api/blacklist', {
        method: 'POST',
        body: formData,
      });

      setModalVisible(false);
      setName('');
      setPhoto(null);
      setDocuments([]);
      setAge('');
      setIncidentDescription('');
      setPhone('');
      Alert.alert(t('success'), t('reportSubmitSuccess'));
      fetchReports();
    } catch (err) {
      Alert.alert(t('error'), err.message || (isArabic ? 'فشل إرسال البلاغ' : 'Failed to submit report'));
    } finally {
      setSubmitting(false);
    }
  };

  const renderReportCard = ({ item }) => {
    return (
      <Card style={styles.card}>
        <View style={[styles.cardHeader, isRTL && styles.rowRTL]}>
          {item.photoUrl ? (
            <Image
              source={{ uri: `${API_BASE}${item.photoUrl}` }}
              style={styles.cardPhoto}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.avatarIconWrapper}>
              <Ionicons name="shield-alert" size={24} color={colors.danger} />
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text style={[styles.personName, isRTL && styles.textRTL]}>{item.name}</Text>
            <Text style={[styles.dateText, isRTL && styles.textRTL]}>
              {item.nationality ? `${item.nationality} • ` : ''}
              {item.incidentDate ? new Date(item.incidentDate).toLocaleDateString() : 'Recent'}
            </Text>
          </View>
        </View>

        <Text style={[styles.description, isRTL && styles.textRTL]}>
          {item.reason || item.incidentDescription}
        </Text>
      </Card>
    );
  };

  return (
    <ScreenWrapper>
      <Header title={t('safety')} />

      <View style={styles.container}>
        <Card style={styles.noticeCard}>
          <View style={[styles.noticeHeader, isRTL && styles.rowRTL]}>
            <Ionicons name="information-circle" size={20} color={colors.plum} />
            <Text style={styles.noticeTitle}>{t('safetyDirectory')}</Text>
          </View>
          <Text style={[styles.noticeText, isRTL && styles.textRTL]}>
            {t('safetySubhead')}. All reports are strictly vetted and verified against official documentation by our safety team.
          </Text>

          <Button
            title={t('reportIncident')}
            variant="danger"
            onPress={handleOpenReportModal}
            icon={<Ionicons name="alert-circle-outline" size={18} color={colors.white} />}
            style={styles.reportBtn}
          />
        </Card>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.plum} />
            <Text style={styles.loadingText}>{t('loading')}</Text>
          </View>
        ) : (
          <FlatList
            data={reports}
            keyExtractor={(item) => item._id}
            renderItem={renderReportCard}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.plum]} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="checkmark-done-circle-outline" size={50} color={colors.success} />
                <Text style={styles.emptyTitle}>{isArabic ? 'الوضع آمن' : 'All Clear'}</Text>
                <Text style={styles.emptyText}>
                  {isArabic ? 'لا توجد أي بلاغات معتمدة حالياً.' : 'No verified warnings currently listed.'}
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* Report Caregiver Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalHeader, isRTL && styles.rowRTL]}>
              <Text style={styles.modalTitle}>{t('reportIncident')}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close-circle" size={28} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.modalScroll}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              <Input
                label={t('reportedPersonName')}
                value={name}
                onChangeText={setName}
                placeholder="Caregiver's name"
                required
              />

              <View style={styles.rowTwoCols}>
                <View style={styles.colHalf}>
                  <Input
                    label={t('nationality')}
                    value={nationality}
                    onChangeText={setNationality}
                    placeholder="e.g. Egypt"
                    required
                  />
                </View>
                <View style={styles.colHalf}>
                  <Input
                    label={t('age')}
                    value={age}
                    onChangeText={setAge}
                    placeholder="e.g. 28"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* 1. Caregiver Photo Upload (Optional) */}
              <View style={styles.uploadBlock}>
                <Text style={[styles.uploadSectionLabel, isRTL && styles.textRTL]}>
                  {t('caregiverPhoto')} <Text style={styles.optionalHint}>({isArabic ? 'اختياري' : 'Optional'})</Text>
                </Text>

                {photo ? (
                  <View style={[styles.pickedPhotoCard, isRTL && styles.rowRTL]}>
                    <Image source={{ uri: photo.uri }} style={styles.photoThumbnail} />
                    <View style={styles.photoMeta}>
                      <Text style={[styles.photoName, isRTL && styles.textRTL]} numberOfLines={1}>
                        {photo.name}
                      </Text>
                      <TouchableOpacity onPress={handlePickPhoto}>
                        <Text style={styles.changeActionText}>{t('changePhoto')}</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => setPhoto(null)} style={styles.deleteBtn}>
                      <Ionicons name="trash-outline" size={20} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.uploadDashedBox}
                    onPress={handlePickPhoto}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="camera-outline" size={28} color={colors.plum} />
                    <Text style={styles.uploadBoxTitle}>{t('uploadPhoto')}</Text>
                    <Text style={styles.uploadBoxHint}>JPG, PNG, WebP (1:1)</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* 2. Verification Documents (Max 2) */}
              <View style={styles.uploadBlock}>
                <View style={[styles.sectionHeadingRow, isRTL && styles.rowRTL]}>
                  <Text style={[styles.uploadSectionLabel, isRTL && styles.textRTL]}>
                    {t('verificationDocs')} ({documents.length}/2)
                  </Text>
                </View>
                <Text style={[styles.uploadSectionSubtitle, isRTL && styles.textRTL]}>
                  {t('verificationDocsLimit')}
                </Text>

                {/* Uploaded Documents List */}
                {documents.map((doc, idx) => (
                  <View key={idx} style={[styles.docCard, isRTL && styles.rowRTL]}>
                    <Image source={{ uri: doc.uri }} style={styles.docThumbnail} />
                    <View style={styles.docMeta}>
                      <Text style={[styles.photoName, isRTL && styles.textRTL]} numberOfLines={1}>
                        {doc.name}
                      </Text>
                      <Text style={styles.docIndexBadge}>Doc #{idx + 1}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveDocument(idx)} style={styles.deleteBtn}>
                      <Ionicons name="trash-outline" size={20} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Add Document button if less than 2 */}
                {documents.length < 2 && (
                  <TouchableOpacity
                    style={styles.addDocButton}
                    onPress={handlePickDocument}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="document-attach-outline" size={18} color={colors.plum} />
                    <Text style={styles.addDocButtonText}>{t('addDocument')}</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Input
                label={t('incidentDate')}
                value={incidentDate}
                onChangeText={setIncidentDate}
                placeholder="YYYY-MM-DD"
                required
              />

              <Input
                label={t('phone')}
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone number (optional)"
                keyboardType="phone-pad"
              />

              <Input
                label={t('incidentDescription')}
                value={incidentDescription}
                onChangeText={setIncidentDescription}
                placeholder="Provide factual details of what happened..."
                multiline
                numberOfLines={4}
                required
              />

              <Text style={[styles.confidentialNotice, isRTL && styles.textRTL]}>
                {t('evidenceNotice')}
              </Text>

              <Button
                title={isArabic ? 'إرسال البلاغ للمراجعة' : 'Submit for Review'}
                variant="danger"
                onPress={handleSubmitReport}
                loading={submitting}
                style={styles.modalSubmitBtn}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  noticeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginVertical: 6,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.plum,
  },
  noticeText: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 12,
  },
  reportBtn: {
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 80,
  },
  card: {
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  cardPhoto: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#f0eaf2',
  },
  avatarIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.dangerBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  dateText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  description: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
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
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
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
    maxHeight: '92%',
    padding: spacing.lg,
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
  modalScroll: {
    paddingBottom: 36,
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 12,
  },
  colHalf: {
    flex: 1,
  },
  uploadBlock: {
    marginBottom: spacing.md,
  },
  uploadSectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  requiredStar: {
    color: colors.danger,
  },
  optionalHint: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textMuted,
  },
  uploadSectionSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 8,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  uploadDashedBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#c9bfcd',
    borderRadius: radius.md,
    backgroundColor: '#faf8fb',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.plum,
    marginTop: 6,
  },
  uploadBoxHint: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  pickedPhotoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#faf8fb',
    borderWidth: 1,
    borderColor: '#e8dfe9',
    borderRadius: radius.md,
    gap: 10,
  },
  photoThumbnail: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: '#e8dfe9',
  },
  photoMeta: {
    flex: 1,
  },
  photoName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  changeActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 4,
  },
  deleteBtn: {
    padding: 6,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fdfbfe',
    borderWidth: 1,
    borderColor: '#eee4f0',
    borderRadius: radius.md,
    gap: 10,
    marginBottom: 6,
  },
  docThumbnail: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: '#ece3ee',
  },
  docMeta: {
    flex: 1,
  },
  docIndexBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.plum,
    marginTop: 2,
  },
  addDocButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: '#f8f4f9',
    borderWidth: 1,
    borderColor: '#e0d4e3',
    borderRadius: radius.md,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  addDocButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.plum,
  },
  confidentialNotice: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 16,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  modalSubmitBtn: {
    borderRadius: radius.md,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  textRTL: {
    textAlign: 'right',
  },
});
