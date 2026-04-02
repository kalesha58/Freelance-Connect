import { COLORS_DARK, COLORS_LIGHT } from './colors';

export const Colors = {
    ...COLORS_LIGHT,
    text: COLORS_LIGHT.foreground,
    textSecondary: COLORS_LIGHT.mutedForeground,
    textTertiary: '#94A3B8',
    surface: COLORS_LIGHT.background,
    primaryLight: COLORS_LIGHT.blueLight,
    error: COLORS_LIGHT.destructive,
    white: '#FFFFFF',
    background: COLORS_LIGHT.background,
    secondary: COLORS_LIGHT.success, // Mapping secondary to success as per user screens usage
    secondaryLight: '#F0FDF4',
    warning: COLORS_LIGHT.warning,
};

export const Spacing = {
    xs: 4,
    sm: 8,
    base: 16,
    md: 12,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
};

export const Typography = {
    xs: 12,
    sm: 14,
    base: 16,
    md: 18,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 32,
    '4xl': 40,
    bold: '700' as const,
    semibold: '600' as const,
    medium: '500' as const,
    regular: '400' as const,
    extrabold: '800' as const,
    tight: 1.1,
    relaxed: 1.5,
};

export const BorderRadius = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
};
