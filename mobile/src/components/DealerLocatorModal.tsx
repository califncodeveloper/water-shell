/**
 * Water Shell — Local Dealer & Accessory Service Modal
 *
 * Provides customer access to authorized local dealers in:
 * - Chennai
 * - Chengalpattu
 * - Kanchipuram
 * - Pondicherry
 * - Base Hub: Tambaram Main Branch
 *
 * 100% Live Firestore Data from `users` collection (role='dealer', dealerStatus='approved').
 * Supports GPS distance calculation, PIN/city search, dealer selection, call & WhatsApp actions.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Linking,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
import { useAuthStore } from '@/stores/authStore';

interface DealerLocatorModalProps {
  visible: boolean;
  onClose: () => void;
  initialZone?: DeliveryZoneId;
  productName?: string;
  sourceContext?: 'product' | 'cart' | 'checkout' | 'general';
  onSelectDealer?: (dealer: AuthorizedDealerInfo) => void;
  selectedDealerId?: string;
}

type TabKey = 'all' | DeliveryZoneId | string;

export function DealerLocatorModal({
  visible,
  onClose,
  initialZone,
  productName,
  sourceContext = 'general',
  onSelectDealer,
  selectedDealerId,
}: DealerLocatorModalProps) {
  const { colors, isDark } = useTheme();
  const styles = useThemedStyles(getStyles);

  const isDealer = useAuthStore((state) => state.isDealer);
  const profile = useAuthStore((state) => state.profile);
  const isDealerUser = isDealer || profile?.role === 'dealer';

  const { activeZones } = useDeliveryZones();

  const zoneTabs = useMemo(() => {
    return [
      { id: 'all', label: 'All Zones' },
      ...activeZones.map((z) => ({
        id: z.id as TabKey,
        label: z.name,
      })),
    ];
  }, [activeZones]);

  const [selectedTab, setSelectedTab] = useState<TabKey>(initialZone || 'all');
  const [dealers, setDealers] = useState<AuthorizedDealerInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search & GPS states
  const [searchQuery, setSearchQuery] = useState('');
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);

  useEffect(() => {
    if (visible && isDealerUser) {
      onClose();
      Alert.alert(
        'Access Restricted',
        'Dealer accounts do not have access to the Dealer Locator.'
      );
      return;
    }

    if (visible && !isDealerUser) {
      if (initialZone) setSelectedTab(initialZone);
      loadDealers();
    } else {
      setSearchQuery('');
      setLocationLabel(null);
      setUserCoords(null);
    }
  }, [visible, initialZone, isDealerUser]);

  const loadDealers = async () => {
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
    } catch (err: unknown) {
      console.error('Failed to load authorized dealers from Firestore:', err);
      setErrorMessage('Unable to load authorized dealers right now. Please check your internet connection.');
      setDealers([]);
    } finally {
      setLoading(false);
    }
  };

  // Acquire device GPS location to find nearest dealer
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
        // Tab zone filter
        if (selectedTab !== 'all' && d.zoneId !== selectedTab) {
          return false;
        }

        // Search query filter (matches shop name, city, pincode, address)
        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          const cleanQPin = q.replace(/\D/g, '');
          const pinMatch = cleanQPin.length > 0 && (d.pincode || '').replace(/\D/g, '').includes(cleanQPin);
          const cityMatch = (d.city || '').toLowerCase().includes(q);
          const shopMatch = (d.shopName || '').toLowerCase().includes(q);
          const nameMatch = (d.name || '').toLowerCase().includes(q);
          const addrMatch = (d.address || '').toLowerCase().includes(q);
          const zoneMatch = (d.zone || '').toLowerCase().includes(q);
          return pinMatch || cityMatch || shopMatch || nameMatch || addrMatch || zoneMatch;
        }

        return true;
      })
      .sort((a, b) => {
        // If GPS distance is known, sort nearest first
        if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
          return a.distanceKm - b.distanceKm;
        }
        if (a.distanceKm !== undefined) return -1;
        if (b.distanceKm !== undefined) return 1;
        return a.shopName.localeCompare(b.shopName);
      });
  }, [dealers, selectedTab, searchQuery, userCoords]);

  const handleCall = (phone: string) => {
    const clean = phone.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${clean}`).catch(() => {
      Alert.alert('Phone Call', `Dial ${phone} to contact dealer.`);
    });
  };

  const handleWhatsApp = (whatsapp?: string, name?: string) => {
    if (!whatsapp) return;
    const clean = whatsapp.replace(/[^\d]/g, '');
    const query = productName
      ? `Hello ${name}, I am inquiring about accessories & servicing for ${productName} through Water Shell.`
      : `Hello ${name}, I would like to inquire about Water Shell accessories and service availability in my area.`;
    const url = `whatsapp://send?phone=${clean}&text=${encodeURIComponent(query)}`;

    Linking.openURL(url).catch(() => {
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

  if (isDealerUser) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.sheetContainer} edges={['bottom']}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIndicator} />
            <View style={styles.headerTop}>
              <View style={styles.headerTitleWrap}>
                <View style={styles.headerIconWrap}>
                  <Ionicons name="business" size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.headerTitle}>Authorized Dealer Network</Text>
                  <Text style={styles.headerSubtitle}>
                    Admin-Approved Local Spares & Service Hubs
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                accessibilityLabel="Close dealer locator"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Product Notice Banner if opened for an accessory */}
            {productName ? (
              <View style={styles.accessoryNotice}>
                <Ionicons name="information-circle" size={18} color={colors.primary} />
                <Text style={styles.accessoryNoticeText}>
                  <Text style={{ fontWeight: '700' }}>{productName}</Text> is an accessory/spares item and is fulfilled via authorized local dealers for authentic warranty and technician installation.
                </Text>
              </View>
            ) : null}

            {/* Search and GPS Bar */}
            <View style={styles.searchBarRow}>
              <View style={styles.searchInputWrap}>
                <Ionicons name="search" size={16} color={colors.textSecondary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by City, Area, or PIN Code..."
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  clearButtonMode="while-editing"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={[styles.nearMeBtn, userCoords ? styles.nearMeBtnActive : null]}
                onPress={userCoords ? clearLocation : handleUseMyLocation}
                disabled={locating}
                activeOpacity={0.7}
              >
                {locating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons
                      name={userCoords ? 'navigate' : 'navigate-outline'}
                      size={15}
                      color={userCoords ? '#FFFFFF' : colors.primary}
                    />
                    <Text style={[styles.nearMeBtnText, userCoords ? styles.nearMeBtnTextActive : null]}>
                      {userCoords ? 'Reset GPS' : 'Near Me'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* GPS Status Indicator */}
            {locationLabel && (
              <View style={styles.locationStatusWrap}>
                <Ionicons name="location" size={12} color={userCoords ? colors.success : colors.warning} />
                <Text style={styles.locationStatusText}>
                  {userCoords ? `Sorting by proximity to: ${locationLabel}` : locationLabel}
                </Text>
              </View>
            )}

            {/* Zone Selector Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsContainer}
            >
              {zoneTabs.map((tab) => {
                const active = selectedTab === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => setSelectedTab(tab.id as TabKey)}
                    style={[styles.zoneTab, active && styles.zoneTabActive]}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.zoneTabText,
                        active && styles.zoneTabTextActive,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Scrollable Dealer List */}
          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Central Origin Hub Callout */}
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

            {loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Loading authorized local dealers from database...</Text>
              </View>
            ) : errorMessage ? (
              <View style={styles.errorWrap}>
                <Ionicons name="alert-circle-outline" size={36} color={colors.error || '#DC2626'} />
                <Text style={styles.errorText}>{errorMessage}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={loadDealers}>
                  <Text style={styles.retryBtnText}>Retry Loading</Text>
                </TouchableOpacity>
              </View>
            ) : filteredDealers.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Ionicons name="location-outline" size={36} color={colors.textSecondary} />
                <Text style={styles.emptyText}>No verified dealer available in this area.</Text>
                <Text style={styles.emptySub}>
                  {searchQuery
                    ? `No registered dealers matched "${searchQuery}". Please try another locality or contact our Tambaram Main Branch base hub directly.`
                    : 'No authorized dealers registered in this zone yet. Our central logistics hub provides direct dispatch and warranty fulfillment.'}
                </Text>
                {searchQuery.length > 0 && (
                  <TouchableOpacity style={styles.clearSearchBtn} onPress={() => setSearchQuery('')}>
                    <Text style={styles.clearSearchBtnText}>Clear Search Filter</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              filteredDealers.map((dealer, index) => {
                const isSelected = selectedDealerId === dealer.id;
                const hasCoordinates = typeof dealer.latitude === 'number' && typeof dealer.longitude === 'number';

                return (
                  <View
                    key={dealer.id}
                    style={[
                      styles.dealerCard,
                      isSelected && styles.dealerCardSelected,
                    ]}
                  >
                    {/* Top Row: Zone pill & Distance */}
                    <View style={styles.dealerHeaderRow}>
                      <View style={styles.zoneTagRow}>
                        <View style={styles.zonePill}>
                          <Ionicons name="location" size={11} color={colors.primary} />
                          <Text style={styles.zonePillText}>{dealer.zone}</Text>
                        </View>
                        {dealer.distanceKm !== undefined ? (
                          <View style={styles.distanceBadge}>
                            <Ionicons name="speedometer-outline" size={11} color="#0284C7" />
                            <Text style={styles.distanceBadgeText}>
                              {index === 0 && userCoords ? 'Nearest: ' : ''}
                              {dealer.distanceKm} km away
                            </Text>
                          </View>
                        ) : hasCoordinates ? (
                          <View style={styles.gpsBadge}>
                            <Ionicons name="navigate-circle" size={11} color={colors.success} />
                            <Text style={styles.gpsBadgeText}>GPS Verified</Text>
                          </View>
                        ) : (
                          <View style={styles.areaBadge}>
                            <Ionicons name="shield-checkmark" size={11} color={colors.textSecondary} />
                            <Text style={styles.areaBadgeText}>Zone Verified</Text>
                          </View>
                        )}
                      </View>

                      {/* Optional Dealer Selection Button */}
                      {onSelectDealer && (
                        <TouchableOpacity
                          style={[styles.selectDealerBtn, isSelected && styles.selectDealerBtnActive]}
                          onPress={() => onSelectDealer(dealer)}
                        >
                          <Ionicons
                            name={isSelected ? 'checkmark-circle' : 'checkmark-circle-outline'}
                            size={14}
                            color={isSelected ? '#FFFFFF' : colors.primary}
                          />
                          <Text style={[styles.selectDealerBtnText, isSelected && styles.selectDealerBtnTextActive]}>
                            {isSelected ? 'Selected' : 'Select'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <Text style={styles.dealerShopName}>{dealer.shopName}</Text>
                    {dealer.name && dealer.name !== dealer.shopName && (
                      <Text style={styles.dealerContactName}>Contact: {dealer.name}</Text>
                    )}

                    <Text style={styles.dealerAddress}>
                      {dealer.address}
                      {dealer.city ? `, ${dealer.city}` : ''}
                      {dealer.pincode ? ` - ${dealer.pincode}` : ''}
                    </Text>

                    {dealer.specialties && dealer.specialties.length > 0 ? (
                      <View style={styles.specialtiesWrap}>
                        {dealer.specialties.map((spec, i) => (
                          <View key={i} style={styles.specialtyChip}>
                            <Text style={styles.specialtyChipText}>{spec}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}

                    {/* Action buttons */}
                    <View style={styles.dealerActionsRow}>
                      {dealer.phone ? (
                        <TouchableOpacity
                          style={styles.dealerActionCall}
                          onPress={() => handleCall(dealer.phone)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="call-outline" size={15} color={colors.primary} />
                          <Text style={styles.dealerActionCallText}>Call {dealer.phone}</Text>
                        </TouchableOpacity>
                      ) : null}

                      {dealer.whatsapp ? (
                        <TouchableOpacity
                          style={styles.dealerActionWhatsApp}
                          onPress={() => handleWhatsApp(dealer.whatsapp, dealer.shopName)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="logo-whatsapp" size={16} color="#16A34A" />
                          <Text style={styles.dealerActionWhatsAppText}>WhatsApp</Text>
                        </TouchableOpacity>
                      ) : null}

                      {/* Map Directions button (rendered only if dealer has genuine GPS coordinates) */}
                      {hasCoordinates && (
                        <TouchableOpacity
                          style={styles.dealerActionMap}
                          onPress={() => handleOpenMap(dealer.latitude, dealer.longitude, dealer.shopName)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="map-outline" size={15} color={colors.textSecondary} />
                          <Text style={styles.dealerActionMapText}>Directions</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            )}

            {/* Policy Footer Note */}
            <View style={styles.policyFooter}>
              <Ionicons name="shield-checkmark" size={16} color={colors.success} />
              <Text style={styles.policyFooterText}>
                All authorized dealers supply 100% genuine Water Shell spare parts, certified membrane filters, and factory-authorized technician service.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const getStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      justifyContent: 'flex-end',
    },
    sheetContainer: {
      backgroundColor: colors.card,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      maxHeight: '92%',
      minHeight: '70%',
    },
    headerIndicator: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginBottom: spacing.sm,
    },
    header: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xs,
      paddingBottom: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitleWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    headerIconWrap: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      ...typography.subtitle1,
      color: colors.text,
      fontWeight: '700',
    },
    headerSubtitle: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    accessoryNotice: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: isDark ? 'rgba(56, 189, 248, 0.1)' : '#F0F9FF',
      borderRadius: radius.md,
      padding: spacing.sm,
      marginTop: spacing.sm,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(56, 189, 248, 0.2)' : '#BAE6FD',
    },
    accessoryNoticeText: {
      ...typography.caption,
      color: isDark ? '#7DD3FC' : '#0369A1',
      flex: 1,
      lineHeight: 18,
    },
    searchBarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    searchInputWrap: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceMuted,
      borderRadius: radius.md,
      paddingHorizontal: spacing.sm,
      height: 40,
      gap: 6,
    },
    searchInput: {
      flex: 1,
      fontSize: 13,
      color: colors.text,
      paddingVertical: 0,
    },
    nearMeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      height: 40,
      paddingHorizontal: 12,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
    },
    nearMeBtnActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    nearMeBtnText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
    },
    nearMeBtnTextActive: {
      color: '#FFFFFF',
    },
    locationStatusWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 6,
      paddingHorizontal: 2,
    },
    locationStatusText: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    tabsContainer: {
      gap: spacing.xs,
      paddingTop: spacing.sm,
      paddingBottom: 2,
    },
    zoneTab: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: radius.full,
      backgroundColor: colors.surfaceMuted,
      marginRight: 6,
    },
    zoneTabActive: {
      backgroundColor: colors.primary,
    },
    zoneTabText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    zoneTabTextActive: {
      color: '#FFFFFF',
    },
    listContent: {
      padding: spacing.lg,
      gap: spacing.md,
    },
    hubCard: {
      backgroundColor: isDark ? '#111827' : '#0F172A',
      borderRadius: radius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : '#334155',
      marginBottom: spacing.xs,
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
    dealerCard: {
      backgroundColor: colors.card,
      borderRadius: radius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dealerCardSelected: {
      borderColor: colors.primary,
      borderWidth: 2,
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.05)' : '#F0F9FF',
    },
    dealerHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
    },
    zoneTagRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 6,
    },
    zonePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: colors.surfaceMuted,
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 4,
    },
    zonePillText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.primary,
      textTransform: 'uppercase',
    },
    distanceBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: isDark ? 'rgba(2, 132, 199, 0.15)' : '#E0F2FE',
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 4,
    },
    distanceBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#0284C7',
    },
    gpsBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: isDark ? 'rgba(22, 163, 74, 0.15)' : '#DCFCE7',
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 4,
    },
    gpsBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#16A34A',
    },
    areaBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: colors.surfaceMuted,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    areaBadgeText: {
      fontSize: 10,
      color: colors.textSecondary,
    },
    selectDealerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    selectDealerBtnActive: {
      backgroundColor: colors.primary,
    },
    selectDealerBtnText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.primary,
    },
    selectDealerBtnTextActive: {
      color: '#FFFFFF',
    },
    dealerShopName: {
      ...typography.subtitle1,
      color: colors.text,
      fontSize: 15,
      fontWeight: '700',
    },
    dealerContactName: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: 1,
    },
    dealerAddress: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginTop: spacing.xs,
      lineHeight: 19,
    },
    specialtiesWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 5,
      marginTop: spacing.sm,
    },
    specialtyChip: {
      backgroundColor: colors.surfaceMuted,
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 4,
    },
    specialtyChipText: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    dealerActionsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.md,
      paddingTop: spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      flexWrap: 'wrap',
    },
    dealerActionCall: {
      flex: 1,
      minWidth: 120,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: colors.surfaceMuted,
      paddingVertical: 8,
      borderRadius: radius.sm,
    },
    dealerActionCallText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
    },
    dealerActionWhatsApp: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: isDark ? '#15241C' : '#ECFDF5',
      paddingHorizontal: spacing.md,
      paddingVertical: 8,
      borderRadius: radius.sm,
    },
    dealerActionWhatsAppText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#16A34A',
    },
    dealerActionMap: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      backgroundColor: colors.surfaceMuted,
      paddingHorizontal: spacing.sm,
      paddingVertical: 8,
      borderRadius: radius.sm,
    },
    dealerActionMapText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    loadingWrap: {
      padding: spacing.xl,
      alignItems: 'center',
      gap: spacing.sm,
    },
    loadingText: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    errorWrap: {
      padding: spacing.xl,
      alignItems: 'center',
      gap: spacing.sm,
    },
    errorText: {
      ...typography.bodySmall,
      color: colors.error || '#DC2626',
      textAlign: 'center',
    },
    retryBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: 8,
      borderRadius: radius.sm,
      marginTop: 4,
    },
    retryBtnText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    emptyWrap: {
      padding: spacing.xl,
      alignItems: 'center',
      gap: spacing.xs,
    },
    emptyText: {
      ...typography.subtitle2,
      color: colors.text,
      textAlign: 'center',
    },
    emptySub: {
      ...typography.caption,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
    },
    clearSearchBtn: {
      backgroundColor: colors.surfaceMuted,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      borderRadius: radius.sm,
      marginTop: spacing.sm,
    },
    clearSearchBtnText: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '600',
    },
    policyFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: isDark ? '#0D1E16' : '#F0FDF4',
      padding: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: 'rgba(22, 163, 74, 0.2)',
      marginTop: spacing.sm,
    },
    policyFooterText: {
      ...typography.caption,
      color: '#166534',
      flex: 1,
      lineHeight: 18,
    },
  });
