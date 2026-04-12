import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextValue {
    themeMode: ThemeMode;
    resolvedScheme: "light" | "dark";
    setThemeMode: (mode: ThemeMode) => void;
    toggleTheme: () => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
    themeMode: "system",
    resolvedScheme: "light",
    setThemeMode: () => { },
    toggleTheme: () => { },
    isDark: false,
});

const STORAGE_KEY = "@skill_link_theme_mode";

/**
 * ThemeProvider manages the visual theme of the application.
 * Supports manual light/dark overrides and automatic system theme detection.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemScheme: "light" | "dark" = useSystemColorScheme() === "dark" ? "dark" : "light";
    const [themeMode, setThemeModeState] = useState<ThemeMode>("system");

    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY).then(stored => {
            if (stored === "light" || stored === "dark" || stored === "system") {
                setThemeModeState(stored);
            }
        });
    }, []);

    const setThemeMode = useCallback(async (mode: ThemeMode) => {
        setThemeModeState(mode);
        await AsyncStorage.setItem(STORAGE_KEY, mode);
    }, []);

    const toggleTheme = useCallback(() => {
        const next: ThemeMode =
            themeMode === "system"
                ? systemScheme === "dark"
                    ? "light"
                    : "dark"
                : themeMode === "dark"
                    ? "light"
                    : "dark";
        setThemeMode(next);
    }, [themeMode, systemScheme, setThemeMode]);

    const resolvedScheme: "light" | "dark" =
        themeMode === "system" ? systemScheme : (themeMode as "light" | "dark");

    const isDark = resolvedScheme === "dark";

    return (
        <ThemeContext.Provider
            value={{ themeMode, resolvedScheme, setThemeMode, toggleTheme, isDark }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

/**
 * Custom hook to consume the theme context.
 */
export function useTheme() {
    return useContext(ThemeContext);
}
