export const COLORS_LIGHT = {
  primary: '#1E63A9',
  /** Top app bars / screen headers */
  headerBackground: '#1E63A9',
  /** Filled primary actions (CTAs) */
  buttonPrimary: '#1E63A9',
  /** Label/icon on filled primary buttons */
  onButtonPrimary: '#FFFFFF',
  navyDeep: '#1E1B4B',
  navyMid: '#312E81',
  background: '#F8FAFC',
  foreground: '#0F172A',
  card: '#FFFFFF',
  border: '#E2E8F0',
  muted: '#F1F5F9',
  mutedForeground: '#64748B',
  destructive: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
  blueLight: '#E0F2FE',
  purpleAccent: '#7C3AED',
  // Additional tokens
  text: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  surface: '#F8FAFC',
  primaryLight: '#E0F2FE',
  error: '#EF4444',
  white: '#FFFFFF',
  secondary: '#22C55E',
  secondaryLight: '#F0FDF4',
};

export const COLORS_DARK = {
  /** Links, icons, tabs — readable blue on dark surfaces */
  primary: '#60A5FA',
  /** Black header as requested */
  headerBackground: '#000000',
  /** Neutral light gray buttons on dark surfaces */
  buttonPrimary: '#E2E8F0',
  onButtonPrimary: '#0F172A',
  navyDeep: '#020617',
  navyMid: '#1E1B4B',
  /** Gray background as requested */
  background: '#121212',
  foreground: '#F8FAFC',
  card: '#1E1E1E',
  border: '#334155',
  muted: '#1E293B',
  mutedForeground: '#94A3B8',
  destructive: '#F87171',
  success: '#4ADE80',
  warning: '#F59E0B',
  blueLight: '#1E293B',
  purpleAccent: '#A78BFA',
  // Additional tokens for dark mode
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  surface: '#121212',
  primaryLight: '#1E293B',
  error: '#F87171',
  white: '#FFFFFF',
  secondary: '#4ADE80',
  secondaryLight: '#064E3B',
};

export type ColorsType = typeof COLORS_LIGHT;
