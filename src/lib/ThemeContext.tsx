// ============================================
// THEME CONTEXT AND PROVIDER
// ============================================

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ThemeMode, themes } from './designSystem';

// Theme context interface
interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  updateTheme: (newTheme: ThemeMode) => Promise<void>;
  isLoading: boolean;
}

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider props
interface ThemeProviderProps {
  children: ReactNode;
}

// AsyncStorage key
const THEME_STORAGE_KEY = 'app_theme_preference';

// Theme Provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference on app start
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && Object.keys(themes).includes(savedTheme)) {
          setThemeMode(savedTheme as ThemeMode);
        }
      } catch (error) {
        console.warn('Failed to load theme preference:', error);
        // Fall back to system default
        setThemeMode('system');
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, []);

  // Compute current theme based on mode and system preference
  const currentTheme = useMemo(() => {
    if (themeMode === 'system') {
      // Use system preference
      const systemTheme = systemColorScheme === 'dark' ? 'dark' : 'light';
      return {
        ...themes[systemTheme],
        mode: 'system' as ThemeMode, // Keep track that this is system mode
      };
    }

    return themes[themeMode] || themes.light;
  }, [themeMode, systemColorScheme]);

  // Update theme function with persistence
  const updateTheme = useCallback(async (newTheme: ThemeMode) => {
    try {
      setThemeMode(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
      // Theme will still be updated in memory
    }
  }, []);

  // Context value
  const contextValue = useMemo(() => ({
    theme: currentTheme,
    themeMode,
    updateTheme,
    isLoading,
  }), [currentTheme, themeMode, updateTheme, isLoading]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Custom hook for theme-aware styles
export const useThemedStyles = <T extends Record<string, any>>(
  styleFactory: (theme: Theme) => T
): T => {
  const { theme } = useTheme();
  return useMemo(() => styleFactory(theme), [theme, styleFactory]);
};

// Helper hook for common theme colors
export const useThemeColors = () => {
  const { theme } = useTheme();
  return theme.colors;
};

// Helper hook for quick theme checks
export const useThemeMode = () => {
  const { themeMode } = useTheme();
  return {
    isLight: themeMode === 'light' || (themeMode === 'system' && useColorScheme() === 'light'),
    isDark: themeMode === 'dark' || (themeMode === 'system' && useColorScheme() === 'dark'),
    isSepia: themeMode === 'sepia',
    isHighContrast: themeMode === 'highContrast',
    isSystem: themeMode === 'system',
  };
};

// Theme-aware component HOC (optional utility)
export const withTheme = <P extends object>(
  Component: React.ComponentType<P & { theme: Theme }>
) => {
  return React.forwardRef<any, P>((props, ref) => {
    const { theme } = useTheme();
    return <Component {...props} theme={theme} ref={ref} />;
  });
};

// Theme transition helper (for smooth animations - optional)
export const useThemeTransition = () => {
  const { theme, updateTheme } = useTheme();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const transitionToTheme = useCallback(async (newTheme: ThemeMode) => {
    setIsTransitioning(true);

    // Optional: Add a small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 150));

    await updateTheme(newTheme);
    setIsTransitioning(false);
  }, [updateTheme]);

  return {
    theme,
    isTransitioning,
    transitionToTheme,
  };
};

export default ThemeProvider;
