import { useTheme } from '../context/ThemeContext';
import { COLORS_DARK, COLORS_LIGHT, ColorsType } from '../theme/colors';

export const useColors = (): ColorsType => {
    const { resolvedScheme } = useTheme();
    return resolvedScheme === 'dark' ? COLORS_DARK : COLORS_LIGHT;
};
