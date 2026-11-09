/**
 * Water Shell — App Splash Screen Component
 *
 * Full-screen branded splash view featuring the official leaf-droplet emblem,
 * "Water SHELL" wordmark, and "Pure Water, Pure Life" tagline.
 * Maintains exact 3:2 aspect ratio for zero cropping or distortion.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '@/theme';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { AquaPureLogo } from './AquaPureLogo';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AppSplashScreenProps {
  message?: string;
  showSpinner?: boolean;
}

export function AppSplashScreen({
  message = 'Loading pure water experience…',
  showSpinner = true,
}: AppSplashScreenProps) {
  const { colors, isDark } = useTheme();

  // Dynamically size logo cleanly for all screen sizes while preserving 1.5 aspect ratio
  const logoWidth = Math.min(Math.round(SCREEN_WIDTH * 0.52), 220);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <View
          style={[
            styles.logoCard,
            {
              backgroundColor: '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : colors.border,
            },
          ]}
        >
          <AquaPureLogo width={logoWidth} />
        </View>

        {showSpinner && (
          <View style={styles.spinnerWrap}>
            <ActivityIndicator size="small" color={colors.primary} />
            {message ? (
              <Text style={[styles.message, { color: colors.textSecondary }]}>
                {message}
              </Text>
            ) : null}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Water Shell • Pure Water, Pure Life
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  logoCard: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: spacing['2xl'],
  },
  spinnerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  message: {
    ...typography.bodySmall,
    fontSize: 13,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    ...typography.labelSmall,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    opacity: 0.8,
  },
});
