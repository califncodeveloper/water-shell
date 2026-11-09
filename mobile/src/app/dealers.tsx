/**
 * AquaPure / Water Shell — Authorized Dealer Locator Screen
 * Route: /dealers
 *
 * Role-Based Access Control:
 * - Customers & Guests: Full access to search, locate, and contact authorized local dealers.
 * - Dealers: Strictly RESTRICTED. Direct navigation is blocked and redirected to Wholesale Catalog.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Linking,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { showToast } from '@/stores/toastStore';
import { useTheme, useThemedStyles, ThemeColors, spacing, radius, typography } from '@/theme';
import {
  DeliveryService,
  AuthorizedDealerInfo,
  TAMBARAM_BASE_ORIGIN,
  DeliveryZoneId,
  calculateHaversineDistanceKm,
  useDeliveryZones,
} from '@/services/deliveryService';
import { LocationService } from '@/services/locationService';
import { EmptyState, AppRefreshControl, Button } from '@/components/ui';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

type TabKey = 'all' | DeliveryZoneId | string;

export interface ZoneTab {
  id: TabKey;
  label: string;
}

export const ZONE_TABS: ZoneTab[] = [
  { id: 'all', label: 'All Zones' },
  { id: 'chennai', label: 'Chennai' },
  { id: 'chengalpattu', label: 'Chengalpattu' },
  { id: 'kanchipuram', label: 'Kanchipuram' },
  { id: 'pondicherry', label: 'Pondicherry' },
];

export default function DealersScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const styles = useThemedStyles(getStyles);

  const isDealer = useAuthStore((state) => state.isDealer);
  const profile = useAuthStore((state) => state.profile);
  const isDealerUser = isDealer || profile?.role === 'dealer';

  const { activeZones } = useDeliveryZones();

  const zoneTabs: ZoneTab[] = useMemo(() => {
    return [
      { id: 'all', label: 'All Zones' },
      ...activeZones.map((z) => ({
        id: z.id as TabKey,
        label: z.name,
      })),
    ];
  }, [activeZones]);

  // Dealers & Filter states
  const [dealers, setDealers] = useState<AuthorizedDealerInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<TabKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);

  // 1. Enforce Role-Based Navigation Guard for Dealer Accounts
  useEffect(() => {
    if (isDealerUser) {
      showToast({
        title: 'Access Restricted',
        message: 'Dealer accounts do not have access to the Dealer Locator.',
        type: 'warning',
      });
      const timer = setTimeout(() => {
        try {
          router.replace('/(tabs)/categories');
        } catch {
          // ignore navigation errors
        }
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isDealerUser]);

  // 2. Load live authorized dealers for customers/guests
  const loadDealers = useCallback(async () => {
    if (isDealerUser) {
      setDealers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await DeliveryService.getAuthorizedDealers();
      setDealers(data);
    } catch (err) {
      console.error('Failed to load authorized dealers:', err);
      setErrorMessage('Unable to load authorized dealers right now. Please check your internet connection.');
      setDealers([]);
    } finally {
      setLoading(false);
    }
  }, [isDealerUser]);

  useEffect(() => {
    if (!isDealerUser) {
      loadDealers();
    }
  }, [isDealerUser, loadDealers]);

  const { refreshing, onRefresh } = usePullToRefresh(loadDealers);

  // Acquire device GPS location
  const handleUseMyLocation = async () => {
    setLocating(true);
    setLocationLabel(null);
    try {
      const result = await LocationService.getCurrentCoordinates();
      if (result.success && result.address) {
        setUserCoords({
          latitude: result.address.latitude,
          longitude: result.address.longitude,
        });
        setLocationLabel(
          result.address.city || result.address.pincode
            ? `${result.address.city || ''} ${result.address.pincode || ''}`.trim()
            : 'GPS Location'
        );
      } else {
        setLocationLabel(result.error || 'Location unavailable');
      }
    } catch {
      setLocationLabel('Location permission denied');
    } finally {
      setLocating(false);
    }
  };

  const clearLocation = () => {
    setUserCoords(null);
    setLocationLabel(null);
  };

  // Filter and sort dealers
  const filteredDealers = useMemo(() => {
    return dealers
      .filter((d) => !d.isMainHub)
      .map((d) => {
        let distanceKm: number | undefined = undefined;
        if (
          userCoords &&
          typeof d.latitude === 'number' &&
          typeof d.longitude === 'number'
        ) {
          distanceKm = calculateHaversineDistanceKm(
            userCoords.latitude,
            userCoords.longitude,
            d.latitude,
            d.longitude
          );
        }
        return { ...d, distanceKm };
      })
      .filter((d) => {
        if (selectedTab !== 'all' && d.zoneId !== selectedTab) {
          return false;
        }
        if (searchQuery.trim().length > 0) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = d.name.toLowerCase().includes(q);
          const matchShop = d.shopName.toLowerCase().includes(q);
          const matchCity = d.city.toLowerCase().includes(q);
          const matchPin = (d.pincode || '').includes(q);
          const matchAddress = d.address.toLowerCase().includes(q);
          return matchName || matchShop || matchCity || matchPin || matchAddress;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
          return a.distanceKm - b.distanceKm;
        }
        if (a.distanceKm !== undefined) return -1;
        if (b.distanceKm !== undefined) return 1;
        return a.shopName.localeCompare(b.shopName);
      });
  }, [dealers, selectedTab, searchQuery, userCoords]);

  // Action Handlers: Call, WhatsApp, Maps
  const handleCall = (phone?: string) => {
    if (!phone) {
      Alert.alert('No Phone', 'No contact number listed for this dealer.');
      return;
    }
    const clean = phone.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${clean}`).catch(() => {
      Alert.alert('Call Error', `Unable to place call to ${phone}.`);
    });
  };

  const handleWhatsApp = (whatsapp?: string, shopName?: string) => {
    if (!whatsapp) {
      Alert.alert('No WhatsApp', 'No WhatsApp number listed for this dealer.');
      return;
    }
    const clean = whatsapp.replace(/[^0-9]/g, '');
    const query = `Hello ${shopName || 'Dealer'}, I found your store on Water Shell and would like to inquire about water purifiers, replacement filters, and accessories.`;
    const appUrl = `whatsapp://send?phone=${clean}&text=${encodeURIComponent(query)}`;

    Linking.openURL(appUrl).catch(() => {
      const webUrl = `https://wa.me/${clean}?text=${encodeURIComponent(query)}`;
      Linking.openURL(webUrl).catch(() => {
        Alert.alert('WhatsApp', `Message ${whatsapp} for dealer assistance.`);
      });
    });
  };

  const handleOpenMap = (latitude?: number, longitude?: number, name?: string) => {
    if (typeof latitude !== 'number' || typeof longitude !== 'number') return;
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(name || 'Dealer')}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${encodeURIComponent(name || 'Dealer')})`,
      default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    });
    Linking.openURL(url!).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
    });
  };

  // ── Access Denied Render for Dealer Accounts ──
  if (isDealerUser) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.replace('/(tabs)/categories')}
            accessibilityLabel="Back"
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Dealer Locator</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.restrictedContainer}>
          <View style={[styles.restrictedIconWrap, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2' }]}>
            <Ionicons name="shield" size={48} color={colors.error} />
          </View>
          <Text style={[styles.restrictedTitle, { color: colors.text }]}>Access Restricted</Text>
          <Text style={[styles.restrictedSubtitle, { color: colors.error }]}>
            Dealer Accounts Cannot Access Dealer Locator
          </Text>
          <Text style={[styles.restrictedDesc, { color: colors.textSecondary }]}>
            As an authorized dealer partner, your account is configured for B2B wholesale purchasing. The consumer Dealer Locator is reserved for retail customer fulfillment.
          </Text>

          <View style={styles.restrictedActions}>
            <Button
              title="Browse Wholesale Catalog"
              variant="primary"
              onPress={() => router.replace('/(tabs)/categories')}
              style={{ width: '100%', marginBottom: spacing.md }}
            />
            <Button
              title="Go to Home"
              variant="secondary"
              onPress={() => router.replace('/(tabs)')}
              style={{ width: '100%' }}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Customer & Guest Dealer Locator Page ──
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)');
            }
          }}
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitleLight}>Find Nearest Dealer</Text>
          <Text style={[styles.headerSubtitle, { color: colors.peach }]}>
            Authorized Local Partners & Spares Pickup
          </Text>
        </View>
        <TouchableOpacity
          style={styles.headerActionBtn}
          onPress={loadDealers}
          accessibilityLabel="Reload dealers"
        >
          <Ionicons name="refresh" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <AppRefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            title="Refreshing authorized dealers..."
          />
        }
      >
        {/* Search & Location Bar */}
        <View style={[styles.searchSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.searchInputWrap, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
            <Ionicons name="search" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search by city, area, or 6-digit PIN..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* GPS Quick Location Bar */}
          <View style={styles.gpsBar}>
            {userCoords ? (
              <View style={[styles.gpsActivePill, { backgroundColor: colors.primaryMuted, borderColor: colors.primary }]}>
                <Ionicons name="navigate" size={13} color={colors.primary} />
                <Text style={[styles.gpsActiveText, { color: colors.primary }]} numberOfLines={1}>
                  GPS: {locationLabel || 'Location Active'}
                </Text>
                <TouchableOpacity onPress={clearLocation} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close" size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.gpsBtn, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}
                onPress={handleUseMyLocation}
                disabled={locating}
                activeOpacity={0.7}
              >
                {locating ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Ionicons name="locate-outline" size={15} color={colors.primary} />
                    <Text style={[styles.gpsBtnText, { color: colors.primary }]}>Use Current GPS Location</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Zone Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.zoneTabsContent}
          style={styles.zoneTabsScroll}
        >
          {zoneTabs.map((tab) => {
            const isSelected = selectedTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.zoneTab,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedTab(tab.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.zoneTabText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.textSecondary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Results Counter */}
        <View style={styles.resultsCounterRow}>
          <Text style={[styles.resultsCounterText, { color: colors.textSecondary }]}>
            {loading ? 'Finding dealers...' : `${filteredDealers.length} authorized dealer${filteredDealers.length === 1 ? '' : 's'} available`}
          </Text>
          {userCoords && (
            <Text style={[styles.nearestSortedNotice, { color: colors.primary }]}>
              Sorted by closest to you
            </Text>
          )}
        </View>

        {/* Loading State */}
        {loading && dealers.length === 0 && (
          <View style={styles.stateCenter}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading authorized local dealers from database...
            </Text>
          </View>
        )}

        {/* Error State */}
        {errorMessage && !loading && (
          <View style={[styles.errorCard, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2', borderColor: colors.error }]}>
            <Ionicons name="alert-circle-outline" size={24} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>{errorMessage}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={loadDealers} activeOpacity={0.8}>
              <Text style={styles.retryBtnText}>Retry Loading</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {!loading && !errorMessage && filteredDealers.length === 0 && (
          <EmptyState
            icon="storefront-outline"
            title="No verified dealer available in this area"
            description={
              searchQuery
                ? `No authorized dealer matched "${searchQuery}". Try searching for another city, district, or PIN code.`
                : 'No approved dealers in this zone yet. Tambaram Main Hub provides direct dispatch for this region.'
            }
            actionLabel={searchQuery ? 'Clear Search' : 'View All Zones'}
            onAction={() => {
              setSearchQuery('');
              setSelectedTab('all');
            }}
          />
        )}

        {/* Central Origin Hub Callout */}
        {!loading && (
          <View style={styles.hubCard}>
            <View style={styles.hubHeader}>
              <View style={styles.hubBadge}>
                <Ionicons name="cube" size={12} color="#FFFFFF" />
                <Text style={styles.hubBadgeText}>Base Origin & Dispatch</Text>
              </View>
              <View style={styles.hubDirectBadge}>
                <Ionicons name="flash" size={11} color="#38BDF8" />
                <Text style={styles.hubDirectBadgeText}>Direct Delivery Center</Text>
              </View>
            </View>

            <View style={styles.hubTitleWrap}>
              <Text style={styles.hubTitle}>{TAMBARAM_BASE_ORIGIN.name}</Text>
              {TAMBARAM_BASE_ORIGIN.tagline ? (
                <Text style={styles.hubTagline}>{TAMBARAM_BASE_ORIGIN.tagline}</Text>
              ) : null}
            </View>

            <View style={styles.hubAddressRow}>
              <Ionicons name="location-outline" size={14} color="#94A3B8" style={styles.hubIconAlign} />
              <View style={styles.hubAddressContent}>
                <Text style={styles.hubAddress}>
                  {TAMBARAM_BASE_ORIGIN.address}, {TAMBARAM_BASE_ORIGIN.landmark}
                </Text>
                <Text style={styles.hubCity}>
                  {TAMBARAM_BASE_ORIGIN.city} – {TAMBARAM_BASE_ORIGIN.pincode}
                </Text>
              </View>
            </View>

            {TAMBARAM_BASE_ORIGIN.operatingHours ? (
              <View style={styles.hubHoursRow}>
                <Ionicons name="time-outline" size={13} color="#94A3B8" style={styles.hubIconAlign} />
                <Text style={styles.hubHoursText}>{TAMBARAM_BASE_ORIGIN.operatingHours}</Text>
              </View>
            ) : null}

            <View style={styles.hubActionRow}>
              <TouchableOpacity
                style={styles.hubCallBtn}
                onPress={() => handleCall(TAMBARAM_BASE_ORIGIN.phone)}
                activeOpacity={0.8}
              >
                <Ionicons name="call" size={14} color="#FFFFFF" />
                <Text style={styles.hubCallBtnText} numberOfLines={1}>Call Dispatch</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.hubWhatsAppBtn}
                onPress={() => handleWhatsApp(TAMBARAM_BASE_ORIGIN.phoneAlt, 'Tambaram Main Branch Dispatch')}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-whatsapp" size={15} color="#4ADE80" />
                <Text style={styles.hubWhatsAppBtnText} numberOfLines={1}>WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Dealer Cards List */}
        {!loading &&
          filteredDealers.map((dealer, index) => {
            const hasCoords = typeof dealer.latitude === 'number' && typeof dealer.longitude === 'number';

            return (
              <View
                key={dealer.id}
                style={[
                  styles.dealerCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  index === 0 && userCoords && styles.nearestCardHighlight,
                ]}
              >
                {/* Nearest Tag */}
                {index === 0 && userCoords && (
                  <View style={styles.nearestBadge}>
                    <Ionicons name="sparkles" size={11} color="#FFFFFF" />
                    <Text style={styles.nearestBadgeText}>NEAREST TO YOU</Text>
                  </View>
                )}

                <View style={[styles.cardHeaderRow, index === 0 && userCoords && { paddingTop: 14 }]}>
                  <View style={styles.shopNameCol}>
                    <Text style={[styles.shopName, { color: colors.text }]} numberOfLines={2}>
                      {dealer.shopName}
                    </Text>
                    <View style={styles.contactNameRow}>
                      <Ionicons name="person-circle-outline" size={13} color={colors.textSecondary} />
                      <Text style={[styles.contactName, { color: colors.textSecondary }]}>
                        {dealer.name}
                      </Text>
                    </View>
                  </View>

                  {/* Zone Badge / Distance Badge */}
                  <View style={styles.badgesCol}>
                    <View style={[styles.zoneBadge, { backgroundColor: colors.surfaceMuted }]}>
                      <Text style={[styles.zoneBadgeText, { color: colors.primary }]}>{dealer.zone}</Text>
                    </View>
                    {dealer.distanceKm !== undefined ? (
                      <View style={[styles.distanceBadge, { backgroundColor: isDark ? '#143026' : '#DCFCE7' }]}>
                        <Ionicons name="navigate" size={10} color={colors.success} />
                        <Text style={[styles.distanceBadgeText, { color: colors.success }]}>
                          {dealer.distanceKm} km
                        </Text>
                      </View>
                    ) : hasCoords ? (
                      <View style={[styles.distanceBadge, { backgroundColor: colors.surfaceMuted }]}>
                        <Ionicons name="location" size={10} color={colors.textSecondary} />
                        <Text style={[styles.distanceBadgeText, { color: colors.textSecondary }]}>GPS Available</Text>
                      </View>
                    ) : (
                      <View style={[styles.distanceBadge, { backgroundColor: colors.surfaceMuted }]}>
                        <Text style={[styles.distanceBadgeText, { color: colors.textSecondary }]}>Zone Verified</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Address */}
                <View style={styles.addressRow}>
                  <Ionicons name="location-outline" size={15} color={colors.textSecondary} style={{ marginTop: 2 }} />
                  <Text style={[styles.addressText, { color: colors.textSecondary }]}>
                    {dealer.address}
                    {dealer.pincode ? ` — ${dealer.pincode}` : ''}
                  </Text>
                </View>

                {/* Specialties Chips */}
                {dealer.specialties && dealer.specialties.length > 0 && (
                  <View style={styles.specialtiesWrap}>
                    {dealer.specialties.slice(0, 3).map((spec, i) => (
                      <View key={i} style={[styles.specChip, { backgroundColor: colors.surfaceMuted }]}>
                        <Text style={[styles.specChipText, { color: colors.textSecondary }]}>{spec}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Action Buttons: Call, WhatsApp, Directions */}
                <View style={[styles.cardActionsRow, { borderTopColor: colors.border }]}>
                  {dealer.phone ? (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.callBtn, { borderColor: colors.primary }]}
                      onPress={() => handleCall(dealer.phone)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="call" size={14} color={colors.primary} />
                      <Text style={[styles.callBtnText, { color: colors.primary }]}>Call</Text>
                    </TouchableOpacity>
                  ) : null}

                  {dealer.whatsapp || dealer.phone ? (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.waBtn]}
                      onPress={() => handleWhatsApp(dealer.whatsapp || dealer.phone, dealer.shopName)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="logo-whatsapp" size={15} color="#FFFFFF" />
                      <Text style={styles.waBtnText}>WhatsApp</Text>
                    </TouchableOpacity>
                  ) : null}

                  {hasCoords ? (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.mapBtn, { backgroundColor: colors.surfaceMuted }]}
                      onPress={() => handleOpenMap(dealer.latitude, dealer.longitude, dealer.shopName)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="map-outline" size={14} color={colors.text} />
                      <Text style={[styles.mapBtnText, { color: colors.text }]}>Directions</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            );
          })}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    header: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitleWrap: {
      flex: 1,
      marginLeft: spacing.xs,
    },
    headerTitle: {
      ...typography.heading2,
      fontSize: 18,
    },
    headerTitleLight: {
      ...typography.heading2,
      fontSize: 18,
      color: '#FFFFFF',
    },
    headerSubtitle: {
      ...typography.bodySmall,
      fontSize: 11,
      marginTop: 2,
    },
    headerActionBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: spacing.md,
    },

    /* ── Access Restricted Card ── */
    restrictedContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    restrictedIconWrap: {
      width: 96,
      height: 96,
      borderRadius: 48,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    restrictedTitle: {
      ...typography.heading1,
      fontSize: 22,
      marginBottom: spacing.xs,
      textAlign: 'center',
    },
    restrictedSubtitle: {
      ...typography.label,
      fontSize: 14,
      marginBottom: spacing.md,
      textAlign: 'center',
      fontWeight: '700',
    },
    restrictedDesc: {
      ...typography.body,
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 21,
      marginBottom: spacing.xl,
      maxWidth: 320,
    },
    restrictedActions: {
      width: '100%',
      maxWidth: 320,
    },

    /* ── Search & GPS ── */
    searchSection: {
      borderRadius: radius.lg,
      borderWidth: 1,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    searchInputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: radius.md,
      paddingHorizontal: spacing.sm,
      height: 42,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      paddingVertical: 0,
    },
    gpsBar: {
      marginTop: spacing.sm,
    },
    gpsBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingVertical: 8,
      borderRadius: radius.md,
      borderWidth: 1,
    },
    gpsBtnText: {
      ...typography.bodySmall,
      fontWeight: '600',
      fontSize: 12,
    },
    gpsActivePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: 7,
      borderRadius: radius.md,
      borderWidth: 1,
    },
    gpsActiveText: {
      flex: 1,
      fontSize: 12,
      fontWeight: '600',
    },

    /* ── Zone Tabs ── */
    zoneTabsScroll: {
      marginBottom: spacing.md,
    },
    zoneTabsContent: {
      gap: spacing.xs,
      paddingRight: spacing.md,
    },
    zoneTab: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: radius.full,
      borderWidth: 1,
    },
    zoneTabText: {
      fontSize: 12,
    },

    /* ── Counter ── */
    resultsCounterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
      paddingHorizontal: 2,
    },
    resultsCounterText: {
      ...typography.bodySmall,
      fontSize: 12,
    },
    nearestSortedNotice: {
      ...typography.bodySmall,
      fontSize: 11,
      fontWeight: '600',
    },

    /* ── State Views ── */
    stateCenter: {
      paddingVertical: spacing['2xl'],
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.md,
    },
    loadingText: {
      ...typography.bodySmall,
      fontSize: 13,
    },
    errorCard: {
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      alignItems: 'center',
      gap: spacing.sm,
      marginVertical: spacing.md,
    },
    errorText: {
      ...typography.body,
      textAlign: 'center',
      fontSize: 13,
    },
    retryBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: 8,
      borderRadius: radius.md,
      marginTop: spacing.xs,
    },
    retryBtnText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 13,
    },

    /* ── Central Logistics Hub Card (Tambaram) ── */
    hubCard: {
      backgroundColor: isDark ? '#111827' : '#0F172A',
      borderRadius: radius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : '#334155',
      marginBottom: spacing.md,
    },
    hubHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: spacing.sm,
    },
    hubBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: radius.sm,
      alignSelf: 'flex-start',
    },
    hubBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#FFFFFF',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    hubDirectBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(56, 189, 248, 0.12)',
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: 'rgba(56, 189, 248, 0.25)',
      alignSelf: 'flex-start',
    },
    hubDirectBadgeText: {
      fontSize: 10,
      fontWeight: '600',
      color: '#38BDF8',
    },
    hubTitleWrap: {
      marginBottom: spacing.xs,
    },
    hubTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#F8FAFC',
      lineHeight: 22,
    },
    hubTagline: {
      fontSize: 11,
      color: '#94A3B8',
      marginTop: 2,
      lineHeight: 16,
    },
    hubAddressRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 6,
      marginTop: 4,
      marginBottom: 6,
    },
    hubIconAlign: {
      marginTop: 2,
      flexShrink: 0,
    },
    hubAddressContent: {
      flex: 1,
    },
    hubAddress: {
      fontSize: 12,
      color: '#CBD5E1',
      lineHeight: 18,
    },
    hubCity: {
      fontSize: 12,
      fontWeight: '600',
      color: '#38BDF8',
      marginTop: 2,
      lineHeight: 16,
    },
    hubHoursRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: radius.sm,
      marginTop: 4,
      marginBottom: spacing.xs,
    },
    hubHoursText: {
      fontSize: 11,
      color: '#94A3B8',
      fontWeight: '500',
      flex: 1,
    },
    hubActionRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    hubCallBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: colors.primary,
      paddingVertical: 9,
      borderRadius: radius.sm,
    },
    hubCallBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    hubWhatsAppBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: '#1E293B',
      paddingVertical: 9,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: 'rgba(22, 163, 74, 0.4)',
    },
    hubWhatsAppBtnText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#4ADE80',
    },

    /* ── Dealer Card ── */
    dealerCard: {
      borderRadius: radius.lg,
      borderWidth: 1,
      padding: spacing.md,
      marginBottom: spacing.md,
      position: 'relative',
      overflow: 'hidden',
    },
    nearestCardHighlight: {
      borderWidth: 2,
      borderColor: colors.primary,
    },
    nearestBadge: {
      position: 'absolute',
      top: 0,
      right: 0,
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderBottomLeftRadius: radius.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    nearestBadgeText: {
      color: '#FFFFFF',
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    cardHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    shopNameCol: {
      flex: 1,
    },
    shopName: {
      ...typography.heading3,
      fontSize: 15,
      fontWeight: '700',
      lineHeight: 20,
    },
    contactNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 2,
    },
    contactName: {
      ...typography.bodySmall,
      fontSize: 12,
    },
    badgesCol: {
      alignItems: 'flex-end',
      gap: 4,
    },
    zoneBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: radius.sm,
    },
    zoneBadgeText: {
      fontSize: 10,
      fontWeight: '700',
    },
    distanceBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: radius.sm,
    },
    distanceBadgeText: {
      fontSize: 10,
      fontWeight: '700',
    },
    addressRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 6,
      marginTop: spacing.sm,
    },
    addressText: {
      flex: 1,
      ...typography.bodySmall,
      fontSize: 12,
      lineHeight: 16,
    },
    specialtiesWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
      marginTop: spacing.sm,
    },
    specChip: {
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: radius.sm,
    },
    specChipText: {
      fontSize: 10,
    },
    cardActionsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.md,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
    },
    actionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingVertical: 8,
      borderRadius: radius.md,
    },
    callBtn: {
      borderWidth: 1,
    },
    callBtnText: {
      fontSize: 12,
      fontWeight: '700',
    },
    waBtn: {
      backgroundColor: '#25D366',
    },
    waBtnText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },
    mapBtn: {},
    mapBtnText: {
      fontSize: 12,
      fontWeight: '600',
    },
  });
