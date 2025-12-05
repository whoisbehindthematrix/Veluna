import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  lightTheme,
  darkTheme,
  type AppTheme,
  type ThemeName,
} from '@/styles/theme';

type ThemeContextType = {
  theme: AppTheme;
  themeName: ThemeName;
  accentColor: string;
  setAccentColor: (color: string) => void;
  setThemeName: (name: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEYS = {
  THEME: 'app_theme',
  ACCENT: 'app_accent_color',
} as const;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, _setThemeName] = useState<ThemeName>('light');
  const [customAccent, setCustomAccent] = useState<string | null>(null);

  // Load persisted theme + accent once
  useEffect(() => {
    (async () => {
      try {
        const [storedTheme, storedAccent] = await AsyncStorage.multiGet([
          STORAGE_KEYS.THEME,
          STORAGE_KEYS.ACCENT,
        ]);

        const savedTheme = storedTheme?.[1] as ThemeName | null;
        const savedAccent = storedAccent?.[1] || null;

        if (savedTheme === 'light' || savedTheme === 'dark') {
          _setThemeName(savedTheme);
        }
        if (savedAccent) {
          setCustomAccent(savedAccent);
        }
      } catch (e) {
        console.warn('[ThemeProvider] Failed to load theme from storage', e);
      }
    })();
  }, []);

  const baseTheme = useMemo(() => {
    return themeName === 'dark' ? darkTheme : lightTheme;
  }, [themeName]);

  const theme: AppTheme = useMemo(() => {
    const accent = customAccent || baseTheme.accent;
    return {
      ...baseTheme,
      accent,
      primary: accent, // keep primary in sync with accent by default
    };
  }, [baseTheme, customAccent]);

  const setThemeName = async (name: ThemeName) => {
    _setThemeName(name);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, name);
    } catch (e) {
      console.warn('[ThemeProvider] Failed to persist theme name', e);
    }
  };

  const setAccentColor = async (color: string) => {
    setCustomAccent(color);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACCENT, color);
    } catch (e) {
      console.warn('[ThemeProvider] Failed to persist accent color', e);
    }
  };

  const value = useMemo(
    () => ({
      theme,
      themeName,
      accentColor: theme.accent,
      setAccentColor,
      setThemeName,
    }),
    [theme, themeName],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}


