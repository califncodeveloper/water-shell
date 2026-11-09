/**
 * Water Shell Design System — Color Tokens & Theme Definitions
 * Brand Colors:
 * - Primary (Deep Navy): #1B1F5E
 * - Secondary (Forest Green): #2E8B57
 * - Accent (Vibrant Orange): #F5A623
 * - White: #FFFFFF
 * - Light Gray: #F8FAFC
 *
 * Dark Mode Backgrounds:
 * - Background (Deep Canvas): #101321
 * - Card (Elevated Surface): #191D30
 * - Surface Muted / Badges: #222740
 *
 * Supports Light Mode, Dark Mode and System Default with dynamic proxy resolution and reactive theme tokens.
 */

export const lightColors = {
  // Brand Core
  primary: '#1B1F5E',
  primaryLight: '#2D3487',
  primaryMuted: '#EEF0F9',

  secondary: '#2E8B57',
  secondaryLight: '#3BAA6B',
  secondaryMuted: '#E8F5EE',

  accent: '#F5A623',
  accentLight: '#FBBF57',
  accentMuted: '#FEF5E7',

  // Neutrals & Surfaces
  white: '#FFFFFF',
  lightGray: '#F8FAFC',
  card: '#FFFFFF',
  cardBackground: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F5F9',
  background: '#F8FAFC',

  // Typography
  text: '#1B1F5E',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',

  // Borders
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  // Controls & Navigation
  inputBackground: '#FFFFFF',
  headerBackground: '#1B1F5E',
  headerTitle: '#FFFFFF',
  headerSubtitle: '#F5A623',

  // Semantic
  success: '#2E8B57',
  warning: '#F5A623',
  error: '#DC2626',
  info: '#1B1F5E',

  // Compatibility Tokens (Legacy mappings)
  peach: '#F5A623',
  coral: '#2E8B57',
  yellow: '#F5A623',

  // Raw Utilities
  rawWhite: '#FFFFFF',
  rawBlack: '#000000',
  cardShadow: 'rgba(27, 31, 94, 0.08)',
  overlay: 'rgba(16, 19, 33, 0.6)',
} as const;

export type ThemeColors = {
  [K in keyof typeof lightColors]: string;
};

export const darkColors: ThemeColors = {
  // Brand Core (Accessible brand tints for dark surfaces)
  primary: '#7381F0',
  primaryLight: '#949FF5',
  primaryMuted: '#222740',

  secondary: '#3EAF76',
  secondaryLight: '#5FD498',
  secondaryMuted: '#183626',

  accent: '#F5A623',
  accentLight: '#FBBF57',
  accentMuted: '#3D2B11',

  // Dark Neutrals & Surfaces
  white: '#FFFFFF',
  lightGray: '#F8FAFC',
  card: '#191D30',
  cardBackground: '#191D30',
  surface: '#191D30',
  surfaceMuted: '#222740',
  background: '#101321',

  // Typography
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',

  // Borders
  border: '#222740',
  borderLight: '#2B3252',

  // Controls & Navigation
  inputBackground: '#191D30',
  headerBackground: '#101321',
  headerTitle: '#FFFFFF',
  headerSubtitle: '#F5A623',

  // Semantic
  success: '#3EAF76',
  warning: '#F5A623',
  error: '#F87171',
  info: '#7381F0',

  // Compatibility Tokens (Legacy mappings)
  peach: '#F5A623',
  coral: '#3EAF76',
  yellow: '#F5A623',

  // Raw Utilities
  rawWhite: '#FFFFFF',
  rawBlack: '#000000',
  cardShadow: 'rgba(0, 0, 0, 0.5)',
  overlay: 'rgba(0, 0, 0, 0.75)',
};

let currentActiveColors: ThemeColors = lightColors;

export function setActiveColors(newColors: ThemeColors) {
  currentActiveColors = newColors;
}

export function getActiveColors(): ThemeColors {
  return currentActiveColors;
}

/**
 * Dynamic colors export.
 * Forwards properties to the currently active theme palette (light or dark).
 */
export const colors: ThemeColors = new Proxy(lightColors as ThemeColors, {
  get(_target, prop: string) {
    if (prop in currentActiveColors) {
      return currentActiveColors[prop as keyof ThemeColors];
    }
    return (lightColors as any)[prop];
  },
});

export type ColorToken = keyof typeof lightColors;
