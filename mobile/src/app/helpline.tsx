/**
 * Water Shell — Contact Us / Helpline Directory Screen
 * Route: /helpline (and alias /contact)
 *
 * Displays authorized Water Shell customer support and branch contacts:
 * - Customer Support:
 *     • +91 88255 41297
 *     • +91 86108 76009
 * - Branch Contacts:
 *     • Tambaram: 9789009889
 *     • Mudichur: 6383156647
 *     • Guduvanchery: 8682020588
 *
 * Fully responsive, supports both Light and Dark themes.
 * Uses native phone dialer linking via React Native Linking.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme, useThemedStyles, ThemeColors, spacing, radius, typography } from '@/theme';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { showToast } from '@/stores/toastStore';

export interface HelplineContact {
  id: string;
  section: 'support' | 'branch';
  name: string;
  phone: string;
  dialPhone: string;
  role: string;
  hours: string;
  badgeLabel: string;
  badgeVariant: 'info' | 'success' | 'warning' | 'neutral';
  icon: keyof typeof Ionicons.glyphMap;
  isMainHub?: boolean;
}

const SUPPORT_CONTACTS: HelplineContact[] = [
  {
    id: 'support-1',
    section: 'support',
    name: 'Customer Support Desk 1',
    phone: '+91 88255 41297',
    dialPhone: '+918825541297',
    role: 'Orders, Purifier Sales & General Inquiries',
    hours: 'Mon – Sat: 9:00 AM – 8:00 PM',
    badgeLabel: 'Primary Desk',
    badgeVariant: 'info',
    icon: 'headset',
  },
  {
    id: 'support-2',
    section: 'support',
    name: 'Customer Support Desk 2',
    phone: '+91 86108 76009',
    dialPhone: '+918610876009',
    role: 'Technician Visits, Repairs & Service Escalation',
    hours: 'Mon – Sat: 9:00 AM – 8:00 PM',
    badgeLabel: 'Service Support',
    badgeVariant: 'success',
    icon: 'construct',
  },
];

const BRANCH_CONTACTS: HelplineContact[] = [
  {
    id: 'branch-tambaram',
    section: 'branch',
    name: 'Tambaram',
    phone: '9789009889',
    dialPhone: '9789009889',
    role: 'Main Base Hub • Showroom, Parts & Service Desk',
    hours: 'Mon – Sun: 9:30 AM – 8:30 PM',
    badgeLabel: 'Main Base Origin',
    badgeVariant: 'warning',
    icon: 'business',
    isMainHub: true,
  },
  {
    id: 'branch-mudichur',
    section: 'branch',
    name: 'Mudichur',
    phone: '6383156647',
    dialPhone: '6383156647',
    role: 'Branch Service Station • Spares & Filter Replacement',
    hours: 'Mon – Sat: 9:30 AM – 8:00 PM',
    badgeLabel: 'Service Station',
    badgeVariant: 'info',
    icon: 'location',
  },
  {
    id: 'branch-guduvanchery',
    section: 'branch',
    name: 'Guduvanchery',
    phone: '8682020588',
    dialPhone: '8682020588',
    role: 'Branch Service Center • Technician Dispatch & Repairs',
    hours: 'Mon – Sat: 9:30 AM – 8:00 PM',
    badgeLabel: 'Service Center',
    badgeVariant: 'info',
    icon: 'location',
  },
];

type FilterTab = 'all' | 'support' | 'branch';

export default function HelplineScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const styles = useThemedStyles(getStyles);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const filteredSupport = useMemo(() => {
    if (activeTab === 'branch') return [];
    return SUPPORT_CONTACTS;
  }, [activeTab]);

  const filteredBranches = useMemo(() => {
    if (activeTab === 'support') return [];
    return BRANCH_CONTACTS;
  }, [activeTab]);

  const handleCall = async (contact: HelplineContact) => {
    const cleanNumber = contact.dialPhone.replace(/[^\d+]/g, '');
    const url = `tel:${cleanNumber}`;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(url);
      }
    } catch {
      Alert.alert(
        'Phone Call',
        `Unable to open phone dialer automatically.\n\nPlease call ${contact.name} at:\n${contact.phone}`,
        [{ text: 'OK' }]
      );
    }
  };

  const renderContactCard = (contact: HelplineContact) => {
    const isSupport = contact.section === 'support';

    return (
      <View
        key={contact.id}
        style={[
          styles.card,
          contact.isMainHub && styles.cardMainHub,
        ]}
      >
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: isSupport
                  ? isDark
                    ? 'rgba(115, 129, 240, 0.2)'
                    : 'rgba(27, 31, 94, 0.08)'
                  : contact.isMainHub
                  ? isDark
                    ? 'rgba(245, 166, 35, 0.2)'
                    : 'rgba(245, 166, 35, 0.12)'
                  : isDark
                  ? 'rgba(62, 175, 118, 0.2)'
                  : 'rgba(46, 139, 87, 0.1)',
              },
            ]}
          >
            <Ionicons
              name={contact.icon}
              size={22}
              color={
                isSupport
                  ? colors.primary
                  : contact.isMainHub
                  ? colors.accent
                  : colors.secondary
              }
            />
          </View>

          <View style={styles.cardTitleWrap}>
            <View style={styles.titleRow}>
              <Text style={styles.contactName} numberOfLines={1}>
                {contact.name}
              </Text>
              <StatusBadge
                label={contact.badgeLabel}
                variant={contact.badgeVariant}
              />
            </View>
            <Text style={styles.contactRole} numberOfLines={2}>
              {contact.role}
            </Text>
          </View>
        </View>

        {/* Operating Hours & Availability */}
        <View style={styles.metaRow}>
          <View style={styles.hoursChip}>
            <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
            <Text style={styles.hoursText}>{contact.hours}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.cardDivider} />

        {/* Phone & Call Action Container */}
        <View style={styles.cardActionRow}>
          <View style={styles.phoneBlock}>
            <Text style={styles.phoneLabel}>
              {isSupport ? 'TOLL-FREE / SUPPORT NUMBER' : 'BRANCH PHONE NUMBER'}
            </Text>
            <Text style={styles.phoneNumber} selectable>
              {contact.phone}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.callButton}
            onPress={() => handleCall(contact)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Call ${contact.name} at ${contact.phone}`}
          >
            <Ionicons name="call" size={16} color="#FFFFFF" />
            <Text style={styles.callButtonText}>Call Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const headerBg = colors.headerBackground;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: headerBg }]} edges={['top']}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Helpline Directory</Text>
            <Text style={[styles.headerSubtitle, { color: colors.peach }]}>
              Customer Support & Local Branch Contacts
            </Text>
          </View>
        </View>

        {/* Quick Filter Tabs */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              activeTab === 'all' && styles.filterTabActive,
            ]}
            onPress={() => setActiveTab('all')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterTabText,
                activeTab === 'all' && styles.filterTabTextActive,
              ]}
            >
              All Numbers (5)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              activeTab === 'support' && styles.filterTabActive,
            ]}
            onPress={() => setActiveTab('support')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterTabText,
                activeTab === 'support' && styles.filterTabTextActive,
              ]}
            >
              Customer Support (2)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              activeTab === 'branch' && styles.filterTabActive,
            ]}
            onPress={() => setActiveTab('branch')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterTabText,
                activeTab === 'branch' && styles.filterTabTextActive,
              ]}
            >
              Branch Desks (3)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Scroll Content */}
      <ScrollView
        style={[styles.scrollView, { backgroundColor: colors.background }]}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 30 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Card */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerIconWrap}>
            <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Official Water Shell Assistance</Text>
            <Text style={styles.bannerDesc}>
              Tap "Call Now" beside any contact number to instantly connect via your phone dialer.
            </Text>
          </View>
        </View>

        {/* Section 1: Customer Support */}
        {filteredSupport.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={[styles.sectionDot, { backgroundColor: colors.primary }]} />
              <Text style={styles.sectionTitle}>CUSTOMER SUPPORT</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{filteredSupport.length}</Text>
              </View>
            </View>
            <Text style={styles.sectionSubtitle}>
              Centralized hotline for orders, general assistance and technician dispatch.
            </Text>

            <View style={styles.cardsList}>
              {filteredSupport.map(renderContactCard)}
            </View>
          </View>
        )}

        {/* Section 2: Branch Contacts */}
        {filteredBranches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={[styles.sectionDot, { backgroundColor: colors.secondary }]} />
              <Text style={styles.sectionTitle}>BRANCH CONTACTS</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{filteredBranches.length}</Text>
              </View>
            </View>
            <Text style={styles.sectionSubtitle}>
              Direct branch lines for walk-ins, genuine spares, and local technician coordination.
            </Text>

            <View style={styles.cardsList}>
              {filteredBranches.map(renderContactCard)}
            </View>
          </View>
        )}

        {/* Emergency / Service Quick Link Card */}
        <TouchableOpacity
          style={styles.quickServiceCard}
          onPress={() => router.push('/service/book')}
          activeOpacity={0.8}
        >
          <View style={styles.quickServiceIcon}>
            <Ionicons name="calendar-outline" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.quickServiceTitle}>Need a Technician at Doorstep?</Text>
            <Text style={styles.quickServiceSubtitle}>
              Book online for Leakage, Low Flow, Filter Change or General Service.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </TouchableOpacity>

        {/* Brand Note Footer */}
        <View style={styles.footerNote}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.footerNoteText}>
            Water Shell • Pure Water, Pure Life • Genuine parts & certified service
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    header: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
      gap: spacing.md,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTextWrap: {
      flex: 1,
    },
    headerTitle: {
      ...typography.heading2,
      color: '#FFFFFF',
      fontWeight: '700',
    },
    headerSubtitle: {
      ...typography.bodySmall,
      color: colors.peach,
      marginTop: 2,
    },
    filterRow: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    filterTab: {
      paddingVertical: 6,
      paddingHorizontal: spacing.md,
      borderRadius: radius.full,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    filterTabActive: {
      backgroundColor: colors.peach,
    },
    filterTabText: {
      ...typography.labelSmall,
      color: '#FFFFFF',
      fontSize: 11,
    },
    filterTabTextActive: {
      color: '#1B1F5E',
      fontWeight: '700',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: spacing.lg,
      gap: spacing.xl,
    },
    bannerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: isDark ? '#191D30' : '#FFFFFF',
      borderRadius: radius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    bannerIconWrap: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: isDark ? 'rgba(115, 129, 240, 0.2)' : 'rgba(27, 31, 94, 0.08)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    bannerTitle: {
      ...typography.label,
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
    },
    bannerDesc: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },
    section: {
      gap: spacing.sm,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    sectionDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    sectionTitle: {
      ...typography.label,
      color: colors.text,
      fontWeight: '700',
      letterSpacing: 0.6,
      fontSize: 13,
    },
    countBadge: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: radius.full,
      paddingHorizontal: 8,
      paddingVertical: 1,
      marginLeft: 4,
    },
    countBadgeText: {
      ...typography.labelSmall,
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: '700',
    },
    sectionSubtitle: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontSize: 12,
      marginBottom: spacing.xs,
    },
    cardsList: {
      gap: spacing.md,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.md,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: isDark ? 0.4 : 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    cardMainHub: {
      borderColor: isDark ? 'rgba(245, 166, 35, 0.5)' : '#FDE68A',
      borderWidth: 1.5,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
    },
    iconWrapper: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardTitleWrap: {
      flex: 1,
      gap: 3,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    contactName: {
      ...typography.heading3,
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
      flex: 1,
    },
    contactRole: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 16,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    hoursChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: colors.surfaceMuted,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: radius.md,
    },
    hoursText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontSize: 11,
    },
    cardDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
    },
    cardActionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    phoneBlock: {
      flex: 1,
      gap: 2,
    },
    phoneLabel: {
      ...typography.labelSmall,
      color: colors.textMuted,
      fontSize: 9,
      letterSpacing: 0.5,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    phoneNumber: {
      ...typography.heading3,
      color: colors.text,
      fontSize: 17,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    callButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.secondary,
      paddingVertical: spacing.sm + 2,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.full,
      shadowColor: colors.secondary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 2,
    },
    callButtonText: {
      ...typography.label,
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 13,
    },
    quickServiceCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: isDark ? 'rgba(115, 129, 240, 0.12)' : '#EFF6FF',
      borderRadius: radius.xl,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(115, 129, 240, 0.25)' : '#BFDBFE',
    },
    quickServiceIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    quickServiceTitle: {
      ...typography.heading3,
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
    },
    quickServiceSubtitle: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontSize: 11,
      marginTop: 2,
    },
    footerNote: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: spacing.sm,
    },
    footerNoteText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontSize: 11,
    },
  });
}
