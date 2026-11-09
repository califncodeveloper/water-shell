/**
 * AquaPure — Status Badge Component
 * Follows DESIGN.md §5 Status Badges with dynamic light/dark theming.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, spacing, radius, typography } from '@/theme';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function StatusBadge({ label, variant = 'neutral' }: StatusBadgeProps) {
  const { colors, isDark } = useTheme();

  const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
    success: {
      bg: isDark ? 'rgba(62, 175, 118, 0.2)' : '#E8F5EE',
      text: colors.success,
    },
    warning: {
      bg: isDark ? 'rgba(245, 166, 35, 0.2)' : '#FEF5E7',
      text: colors.warning,
    },
    error: {
      bg: isDark ? 'rgba(248, 113, 113, 0.2)' : '#FEE2E2',
      text: colors.error,
    },
    info: {
      bg: isDark ? 'rgba(115, 129, 240, 0.2)' : '#EEF0F9',
      text: colors.info,
    },
    neutral: {
      bg: colors.surfaceMuted,
      text: colors.textSecondary,
    },
  };

  const c = variantColors[variant];

  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.label, { color: c.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
});
