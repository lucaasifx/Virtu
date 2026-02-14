import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SystemUI from 'expo-system-ui';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextData {
    themeMode: ThemeMode;
    resolvedTheme: ResolvedTheme;
    setThemeMode: (mode: ThemeMode) => void;
    isLoaded: boolean;
}

const STORAGE_KEY = '@virtu_theme_mode';
const ThemeContext = createContext<ThemeContextData | undefined>(undefined);

const isThemeMode = (value: string): value is ThemeMode => {
    return value === 'system' || value === 'light' || value === 'dark';
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemTheme = useColorScheme();
    const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadThemeMode = async () => {
            try {
                const stored = await AsyncStorage.getItem(STORAGE_KEY);
                if (stored && isThemeMode(stored)) {
                    setThemeModeState(stored);
                }
            } finally {
                setIsLoaded(true);
            }
        };

        loadThemeMode();
    }, []);

    const resolvedTheme: ResolvedTheme = useMemo(() => {
        if (themeMode === 'system') {
            return systemTheme === 'dark' ? 'dark' : 'light';
        }
        return themeMode;
    }, [systemTheme, themeMode]);

    useEffect(() => {
        if (!isLoaded) {
            return;
        }
        AsyncStorage.setItem(STORAGE_KEY, themeMode);
    }, [isLoaded, themeMode]);

    useEffect(() => {
        SystemUI.setBackgroundColorAsync(resolvedTheme === 'dark' ? '#0B0B0C' : '#FFFFFF');
    }, [resolvedTheme]);

    const setThemeMode = (mode: ThemeMode) => {
        setThemeModeState(mode);
    };

    const contextValue = useMemo(
        () => ({
            themeMode,
            resolvedTheme,
            setThemeMode,
            isLoaded,
        }),
        [isLoaded, resolvedTheme, themeMode]
    );

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useAppTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useAppTheme must be used within a ThemeProvider');
    }
    return context;
}
