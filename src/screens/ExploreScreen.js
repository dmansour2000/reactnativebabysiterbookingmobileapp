import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { colors, radius, spacing } from '../theme';
import { useLocale } from '../locales';
import { apiRequest } from '../services/api';

const CITIES = ['All', 'Cairo', 'Giza', 'Alexandria', 'Mansoura', 'Tanta'];
const SERVICES = [
  { id: 'all', labelKey: 'allServices' },
  { id: 'babysitting', labelKey: 'babysitting' },
  { id: 'childcare', labelKey: 'childcare' },
  { id: 'cleaning', labelKey: 'cleaning' },
  { id: 'cooking', labelKey: 'cooking' },
];

export default function ExploreScreen({ navigation }) {
  const { t, isRTL } = useLocale();
  const [sitters, setSitters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedService, setSelectedService] = useState('all');
  const [availableOnly, setAvailableOnly] = useState(false);

  const fetchSitters = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams();
      if (search.trim()) queryParams.append('search', search.trim());
      if (selectedCity !== 'All') queryParams.append('city', selectedCity);
      if (selectedService !== 'all') queryParams.append('service', selectedService);

      const queryString = queryParams.toString();
      const endpoint = `/api/babysitter${queryString ? `?${queryString}` : ''}`;
      
      const data = await apiRequest(endpoint);
      if (Array.isArray(data)) {
        setSitters(data);
      }
    } catch (e) {
      console.warn('Failed to load sitters:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, selectedCity, selectedService]);

  useEffect(() => {
    fetchSitters();
  }, [fetchSitters]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSitters();
  };

  const filteredSitters = sitters.filter(sitter => {
    if (availableOnly && !sitter.isAvailable) return false;
    return true;
  });

  const renderSitterCard = ({ item }) => {
    const isAvailable = !!item.isAvailable;
    const servicesList = Array.isArray(item.services) ? item.services : [];

    return (
      <Card style={styles.card}>
        <View style={[styles.cardHeader, isRTL && styles.rowRTL]}>
          <View style={styles.avatarContainer}>
            {item.hasProfilePhoto ? (
              <Image 
                source={{ uri: `https://nodejsbabysitterbookingplatformbackend.onrender.com/api/babysitter/photo/${item._id}` }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>
                  {(item.name || 'C').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.headerInfo}>
            <View style={[styles.nameRow, isRTL && styles.rowRTL]}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={13} color={colors.gold} />
                <Text style={styles.ratingText}>
                  {item.averageRating ? item.averageRating.toFixed(1) : '5.0'}
                </Text>
              </View>
            </View>

            <View style={[styles.metaRow, isRTL && styles.rowRTL]}>
              <Ionicons name="location-outline" size={14} color={colors.textMuted} />
              <Text style={styles.metaText}>{item.city || 'Cairo'}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Ionicons name="briefcase-outline" size={14} color={colors.textMuted} />
              <Text style={styles.metaText}>{item.experience || 2}+ yrs</Text>
            </View>
          </View>
        </View>

        {item.bio ? (
          <Text style={[styles.bio, isRTL && styles.textRTL]} numberOfLines={2}>
            {item.bio}
          </Text>
        ) : null}

        <View style={styles.servicesRow}>
          {servicesList.slice(0, 3).map((srv, idx) => (
            <Badge key={idx} label={t(srv) || srv} variant="tag" style={styles.serviceBadge} />
          ))}
        </View>

        <View style={[styles.cardFooter, isRTL && styles.rowRTL]}>
          <View>
            <Text style={[styles.rateLabel, isRTL && styles.textRTL]}>{t('monthlySalary')}</Text>
            <Text style={styles.rateValue}>
              {Number(item.monthlySalary != null ? item.monthlySalary : (item.hourlyRate || 7000)).toLocaleString()} {item.currency || 'EGP'} {t('perMonth')}
            </Text>
          </View>

          <View style={styles.footerActions}>
            <Badge 
              label={isAvailable ? t('available') : t('unavailable')} 
              variant={isAvailable ? 'available' : 'busy'} 
            />
            <Button
              title={t('bookCaregiver')}
              variant="plum"
              style={styles.bookButton}
              textStyle={styles.bookButtonText}
              onPress={() => navigation.navigate('CaregiverDetails', { sitterId: item._id })}
            />
          </View>
        </View>
      </Card>
    );
  };

  return (
    <ScreenWrapper>
      <Header subtitle={t('tagline')} />

      <View style={styles.container}>
        {/* Search Bar */}
        <View style={[styles.searchContainer, isRTL && styles.rowRTL]}>
          <Ionicons name="search" size={18} color={colors.plum} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, isRTL && styles.inputRTL]}
            placeholder={t('searchPlaceholder')}
            placeholderTextColor={colors.textLight}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={fetchSitters}
            returnKeyType="search"
          />
          {search ? (
            <TouchableOpacity onPress={() => { setSearch(''); fetchSitters(); }}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* City Filter Chips */}
        <View style={styles.filtersScroll}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CITIES}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedCity === item && styles.filterChipActive
                ]}
                onPress={() => setSelectedCity(item)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedCity === item && styles.filterChipTextActive
                ]}>
                  {item === 'All' ? t('allCities') : item}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.filterChipsRow}
          />
        </View>

        {/* Service Filter Chips */}
        <View style={styles.filtersScroll}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={SERVICES}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedService === item.id && styles.filterChipActive
                ]}
                onPress={() => setSelectedService(item.id)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedService === item.id && styles.filterChipTextActive
                ]}>
                  {t(item.labelKey)}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.filterChipsRow}
          />
        </View>

        {/* Sitters List */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.plum} />
            <Text style={styles.loadingText}>{t('loading')}</Text>
          </View>
        ) : (
          <FlatList
            data={filteredSitters}
            keyExtractor={item => item._id}
            renderItem={renderSitterCard}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.plum]} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={48} color={colors.textLight} />
                <Text style={styles.emptyText}>{t('noSittersFound')}</Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 6,
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  inputRTL: {
    textAlign: 'right',
  },
  filtersScroll: {
    marginBottom: 6,
  },
  filterChipsRow: {
    gap: 6,
    paddingVertical: 2,
  },
  filterChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(104, 63, 128, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
  },
  filterChipActive: {
    backgroundColor: colors.plum,
    borderColor: colors.plum,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.plum,
  },
  filterChipTextActive: {
    color: colors.white,
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
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.plum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '800',
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  metaDot: {
    color: colors.textLight,
  },
  bio: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 8,
  },
  servicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  serviceBadge: {
    marginBottom: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f1e8f2',
    paddingTop: 10,
    marginTop: 4,
  },
  rateLabel: {
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  rateValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.plum,
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookButton: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
  },
  bookButtonText: {
    fontSize: 13,
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
    fontWeight: '600',
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
});
