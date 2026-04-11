import { COLORS_LIGHT } from './colors';

/**
 * @deprecated Use the `useColors()` hook instead for theme-aware colors.
 * This static object only provides light mode colors and will not update when the theme changes.
 */
export const Colors = {
    ...COLORS_LIGHT,
    background: COLORS_LIGHT.background,
    white: '#FFFFFF',
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
