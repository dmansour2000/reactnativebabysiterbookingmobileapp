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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { colors, radius, spacing } from '../theme';
import { useLocale } from '../locales';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

export default function BlacklistScreen() {
  const { t, isRTL } = useLocale();
  const { isAuthenticated, isFamily } = useAuth();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Submit Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [incidentDate, setIncidentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [incidentDescription, setIncidentDescription] = useState('');
  const [phone, setPhone] = useState('');
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
      Alert.alert(t('login'), 'Only registered family members can submit incident reports for verification.');
      return;
    }
    setModalVisible(true);
  };

  const handleSubmitReport = async () => {
    if (!name.trim() || !nationalId.trim() || !incidentDescription.trim()) {
      Alert.alert(t('error'), 'Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('nationalId', nationalId.trim());
      formData.append('incidentDate', incidentDate);
      formData.append('incidentDescription', incidentDescription.trim());
      if (phone.trim()) formData.append('phone', phone.trim());

      await apiRequest('/api/blacklist', {
        method: 'POST',
        body: formData,
      });

      setModalVisible(false);
      setName('');
      setNationalId('');
      setIncidentDescription('');
      setPhone('');
      Alert.alert(t('success'), t('reportSubmitSuccess'));
      fetchReports();
    } catch (err) {
      Alert.alert(t('error'), err.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const renderReportCard = ({ item }) => {
    return (
      <Card style={styles.card}>
        <View style={[styles.cardHeader, isRTL && styles.rowRTL]}>
          <View style={styles.avatarIconWrapper}>
            <Ionicons name="shield-alert" size={24} color={colors.danger} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.personName}>{item.name}</Text>
            <Text style={styles.dateText}>
              {item.incidentDate ? new Date(item.incidentDate).toLocaleDateString() : 'Recent'}
            </Text>
          </View>
        </View>

        <Text style={[styles.description, isRTL && styles.textRTL]}>
          {item.incidentDescription}
        </Text>
      </Card>
    );
  };

  return (
    <ScreenWrapper>
      <Header title={t('safety')} />

      <View style={styles.container}>
        <Card style={styles.noticeCard}>
          <View style={styles.noticeHeader}>
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
                <Text style={styles.emptyTitle}>All Clear</Text>
                <Text style={styles.emptyText}>No verified warnings currently listed.</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Report Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalHeader, isRTL && styles.rowRTL]}>
              <Text style={styles.modalTitle}>{t('reportIncident')}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              <Input
                label={t('reportedPersonName')}
                value={name}
                onChangeText={setName}
                placeholder="Caregiver's name"
                required
              />
              <Input
                label={t('nationalId')}
                value={nationalId}
                onChangeText={setNationalId}
                placeholder="14-digit National ID number"
                keyboardType="numeric"
                required
              />
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

              <Text style={styles.confidentialNotice}>
                {t('evidenceNotice')}
              </Text>

              <Button
                title="Submit for Review"
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
    maxHeight: '90%',
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
    paddingBottom: 30,
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
