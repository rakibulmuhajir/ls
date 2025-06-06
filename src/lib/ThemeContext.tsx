// src/lib/ThemeContext.tsx (or your preferred path)

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Assuming designSystem.ts is in the same directory or adjust path
import {
    Theme,
    // ThemeMode as FullThemeMode, // We'll define a simpler one for now
    greywolfTheme, // Import the specific theme
    // lightTheme, // Keep for later
    // darkTheme,  // Keep for later
    defaultTheme, // This should be greywolfTheme
} from './designSystem';

// Define the ThemeModes you currently support
export type ActiveThemeMode = 'greywolf'; // | 'light' | 'dark' | 'system'; // Add these back later

// Theme context interface
interface ThemeContextType {
  theme: Theme;
  themeMode: ActiveThemeMode; // Use the active modes
  updateTheme: (newTheme: ActiveThemeMode) => Promise<void>;
  isLoading: boolean;
  // isSystemDark: boolean; // Keep if 'system' mode is planned for re-introduction
}

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider props
interface ThemeProviderProps {
  children: ReactNode;
}

// AsyncStorage key
const THEME_STORAGE_KEY = 'app_theme_preference_v2'; // Changed key to avoid conflicts with old structure

// Define the themes you currently make available
// When you add light/dark, uncomment them here and in designSystem imports
const availableThemes: Record<ActiveThemeMode, Theme> = {
  greywolf: greywolfTheme,
  // light: lightTheme, // Add back when ready
  // dark: darkTheme,   // Add back when ready
  // system: defaultTheme, // 'system' will resolve to light/dark based on system preference
};


// Theme Provider component
export const AppThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme(); // Still useful if you plan to re-add 'system' mode
  const [themeMode, setThemeMode] = useState<ActiveThemeMode>('greywolf'); // Default to greywolf
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference on app start
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        // Check if the saved theme is one of the currently active ones
        if (savedTheme && (savedTheme as ActiveThemeMode) in availableThemes) {
          setThemeMode(savedTheme as ActiveThemeMode);
        } else {
          // If not valid or not present, default to greywolf
          setThemeMode('greywolf');
          // Optionally save greywolf as the default if nothing was saved
          await AsyncStorage.setItem(THEME_STORAGE_KEY, 'greywolf');
        }
      } catch (error) {
        console.warn('Failed to load theme preference:', error);
        setThemeMode('greywolf'); // Fall back to greywolf on error
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, []);

  // Compute current theme based on mode
  const currentTheme = useMemo(() => {
    // If you re-introduce 'system' mode:
    // if (themeMode === 'system') {
    //   const systemSelectedTheme = systemColorScheme === 'dark' ? availableThemes.dark : availableThemes.light;
    //   return {
    //     ...(systemSelectedTheme || defaultTheme), // Fallback if dark/light not in availableThemes
    //     mode: 'system' as ThemeMode, // Keep track that this is system mode
    //   };
    // }
    return availableThemes[themeMode] || defaultTheme; // defaultTheme is greywolfTheme
  }, [themeMode, systemColorScheme]); // systemColorScheme needed if 'system' is active

  // Update theme function with persistence
  const updateTheme = useCallback(async (newTheme: ActiveThemeMode) => {
    if ((newTheme as ActiveThemeMode) in availableThemes) {
      try {
        setThemeMode(newTheme);
        await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      } catch (error) {
        console.warn('Failed to save theme preference:', error);
      }
    } else {
      console.warn(`Attempted to set an unsupported theme: ${newTheme}`);
    }
  }, []);

  // Context value
  const contextValue = useMemo(() => ({
    theme: currentTheme,
    themeMode,
    updateTheme,
    isLoading,
    // isSystemDark: systemColorScheme === 'dark', // keep if 'system' mode is re-added
  }), [currentTheme, themeMode, updateTheme, isLoading, /*systemColorScheme*/]);

  if (isLoading) {
    // Optional: Render a loading indicator or null while theme is loading
    // This prevents a flash of unstyled content if styles depend heavily on the theme
    return null; // Or your app's splash screen / global loader
  }

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
    throw new Error('useTheme must be used within an AppThemeProvider');
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

// Helper hook for quick theme checks (simplified)
export const useThemeModeInfo = () => {
  const { themeMode, theme } = useTheme();
  // const systemIsDark = useColorScheme() === 'dark'; // Needed if 'system' is re-added

  return {
    isGreywolf: themeMode === 'greywolf',
    // isLight: themeMode === 'light' || (themeMode === 'system' && !systemIsDark),
    // isDark: themeMode === 'dark' || (themeMode === 'system' && systemIsDark),
    // isSystem: themeMode === 'system',
    currentMode: themeMode,
    isThemeDark: theme.isDark, // Use the isDark property from the theme object
  };
};


// Theme-aware component HOC (optional utility) - No changes needed here functionally
export const withTheme = <P extends object>(
  Component: React.ComponentType<P & { theme: Theme }>
) => {
  return React.forwardRef<any, P>((props, ref) => {
    const { theme } = useTheme();
    return <Component {...props} theme={theme} ref={ref} />;
  });
};

// Theme transition helper (optional utility) - No changes needed here functionally
// but `transitionToTheme` will now expect `ActiveThemeMode`
export const useThemeTransition = () => {
  const { theme, updateTheme } = useTheme();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const transitionToTheme = useCallback(async (newTheme: ActiveThemeMode) => {
    setIsTransitioning(true);
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

export default AppThemeProvider; // Export default if this is the main export for App.tsx
