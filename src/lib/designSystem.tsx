// ============================================
// IMPROVED DESIGN SYSTEM WITH BETTER CONTRAST
// ============================================

import { useColorScheme } from 'react-native';

// Base color definitions - Enhanced for better contrast
const baseColors = {
  // Trust Blue (Claude AI inspired) - Made more vibrant
  trustBlue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#2563eb', // Darker, more vibrant primary
    600: '#1d4ed8',
    700: '#1e40af',
    800: '#1e3a8a',
    900: '#1e293b',
  },

  // Growth Green - Enhanced contrast
  growthGreen: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#059669', // Darker, more visible
    600: '#047857',
    700: '#065f46',
    800: '#064e3b',
    900: '#022c22',
  },

  // Warm Terra Cotta - More vibrant
  terraCotta: {
    50: '#fef7ed',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#d97706', // Much more vibrant
    500: '#b45309',
    600: '#92400e',
    700: '#78350f',
    800: '#5d2a0a',
    900: '#451a03',
  },

  // Neutrals with better contrast
  neutral: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#18181b', // Much darker for better contrast
    900: '#0f0f0f',
  },

  // Semantic colors - Enhanced
  success: '#16a34a',
  warning: '#d97706',
  error: '#dc2626',
  info: '#2563eb',
};

// Book page colors - Better contrast
const bookPageColors = {
  parchment: '#F5F1E8',
  antiquePaper: '#E8E0D0',
  agedPaper: '#F0E8D4',
  vintageCream: '#F7F3E9',
  sepiaText: '#3D3B36', // Much darker for readability
  sepiaBackground: '#FAF7F0', // Lighter background
  nightModeWarm: '#E8E3D3',
};

// Dracula colors - Enhanced contrast
const draculaColors = {
  background: '#1a1a2e', // Slightly lighter
  currentLine: '#16213e',
  foreground: '#ffffff', // Pure white for better contrast
  comment: '#8b94b8', // Lighter purple-gray
  cyan: '#8be9fd',
  green: '#50fa7b',
  orange: '#ffb86c',
  pink: '#ff79c6',
  purple: '#bd93f9',
  red: '#ff5555',
  yellow: '#f1fa8c',
};

// Typography system - Enhanced for readability
export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 22, // Increased
    '2xl': 26, // Increased
    '3xl': 32, // Increased
    '4xl': 40, // Increased
  },
  fontWeight: {
    normal: '400' as const,
    medium: '600' as const, // Increased from 500
    semibold: '700' as const, // Increased from 600
    bold: '800' as const, // Increased from 700
  },
  lineHeight: {
    tight: 1.3, // Slightly increased
    normal: 1.5, // Increased
    relaxed: 1.7, // Increased
  },
} as const;

// Rest of the interfaces remain the same...
export type ThemeMode = 'light' | 'dark' | 'sepia' | 'highContrast' | 'system';

export interface Theme {
  mode: ThemeMode;
  colors: {
    background: string;
    surface: string;
    surfaceVariant: string;

    onBackground: string;
    onSurface: string;
    onSurfaceVariant: string;

    primary: string;
    onPrimary: string;
    primaryContainer: string;
    onPrimaryContainer: string;

    secondary: string;
    onSecondary: string;
    secondaryContainer: string;
    onSecondaryContainer: string;

    accent: string;
    onAccent: string;
    accentContainer: string;
    onAccentContainer: string;

    // Enhanced section group colors with better contrast
    coreLearning: string;
    enhancedLearning: string;
    supplementary: string;

    success: string;
    warning: string;
    error: string;
    info: string;

    outline: string;
    outlineVariant: string;

    navigationBackground: string;
    navigationSurface: string;
  };
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
}

// Spacing and border radius remain the same
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
} as const;

export const createShadow = (elevation: number) => ({
  shadowColor: '#000000',
  shadowOffset: {
    width: 0,
    height: elevation,
  },
  shadowOpacity: 0.1 + (elevation * 0.02),
  shadowRadius: elevation * 2,
  elevation: elevation * 2,
});

// IMPROVED THEMES WITH BETTER CONTRAST

const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background: '#ffffff',
    surface: '#f8fafc',
    surfaceVariant: '#f1f5f9',

    onBackground: baseColors.neutral[900], // Very dark
    onSurface: baseColors.neutral[800], // Dark
    onSurfaceVariant: baseColors.neutral[700], // Medium-dark

    primary: baseColors.trustBlue[500],
    onPrimary: '#ffffff',
    primaryContainer: baseColors.trustBlue[50],
    onPrimaryContainer: baseColors.trustBlue[800],

    secondary: baseColors.growthGreen[500],
    onSecondary: '#ffffff',
    secondaryContainer: baseColors.growthGreen[50],
    onSecondaryContainer: baseColors.growthGreen[800],

    accent: baseColors.terraCotta[400],
    onAccent: '#ffffff',
    accentContainer: baseColors.terraCotta[50],
    onAccentContainer: baseColors.terraCotta[800],

    // Much more distinct section colors
    coreLearning: '#e0f2fe', // Strong blue tint
    enhancedLearning: '#dcfce7', // Strong green tint
    supplementary: '#fef3c7', // Strong yellow tint

    success: baseColors.success,
    warning: baseColors.warning,
    error: baseColors.error,
    info: baseColors.info,

    outline: baseColors.neutral[400],
    outlineVariant: baseColors.neutral[300],

    navigationBackground: '#ffffff',
    navigationSurface: '#f8fafc',
  },
  typography,
  spacing,
  borderRadius,
};

const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    background: draculaColors.background,
    surface: draculaColors.currentLine,
    surfaceVariant: '#1f2937',

    onBackground: draculaColors.foreground, // Pure white
    onSurface: '#f1f5f9', // Very light gray
    onSurfaceVariant: '#d1d5db', // Light gray

    primary: draculaColors.purple,
    onPrimary: draculaColors.background,
    primaryContainer: '#4c1d95',
    onPrimaryContainer: draculaColors.purple,

    secondary: draculaColors.green,
    onSecondary: draculaColors.background,
    secondaryContainer: '#14532d',
    onSecondaryContainer: draculaColors.green,

    accent: draculaColors.pink,
    onAccent: draculaColors.background,
    accentContainer: '#831843',
    onAccentContainer: draculaColors.pink,

    // Much more distinct dark section colors
    coreLearning: '#1e3a8a', // Strong dark blue
    enhancedLearning: '#166534', // Strong dark green
    supplementary: '#92400e', // Strong dark orange

    success: draculaColors.green,
    warning: draculaColors.orange,
    error: draculaColors.red,
    info: draculaColors.cyan,

    outline: '#4b5563',
    outlineVariant: '#374151',

    navigationBackground: draculaColors.background,
    navigationSurface: draculaColors.currentLine,
  },
  typography,
  spacing,
  borderRadius,
};

const sepiaTheme: Theme = {
  mode: 'sepia',
  colors: {
    background: bookPageColors.sepiaBackground,
    surface: bookPageColors.vintageCream,
    surfaceVariant: bookPageColors.agedPaper,

    onBackground: bookPageColors.sepiaText, // Much darker
    onSurface: '#2d2a24', // Very dark brown
    onSurfaceVariant: '#4a453e', // Medium-dark brown

    primary: '#8b4513', // Saddle brown - much darker
    onPrimary: bookPageColors.sepiaBackground,
    primaryContainer: '#d2b48c',
    onPrimaryContainer: '#3e2723',

    secondary: '#556b2f', // Dark olive green
    onSecondary: bookPageColors.sepiaBackground,
    secondaryContainer: '#d7ccc8',
    onSecondaryContainer: '#2e3c1a',

    accent: '#a0522d', // Sienna - darker
    onAccent: bookPageColors.sepiaBackground,
    accentContainer: '#efebe9',
    onAccentContainer: '#4e2a1a',

    // Warmer, more distinct paper tones
    coreLearning: '#f3e5f5', // Light lavender
    enhancedLearning: '#e8f5e8', // Light mint
    supplementary: '#fff8e1', // Light cream

    success: '#558b2f',
    warning: '#f57f17',
    error: '#d84315',
    info: '#1976d2',

    outline: '#8d6e63',
    outlineVariant: '#a1887f',

    navigationBackground: bookPageColors.sepiaBackground,
    navigationSurface: bookPageColors.vintageCream,
  },
  typography,
  spacing,
  borderRadius,
};

const highContrastTheme: Theme = {
  mode: 'highContrast',
  colors: {
    background: '#ffffff',
    surface: '#f5f5f5',
    surfaceVariant: '#eeeeee',

    onBackground: '#000000', // Pure black
    onSurface: '#000000', // Pure black
    onSurfaceVariant: '#212121', // Very dark gray

    primary: '#0d47a1', // Very dark blue
    onPrimary: '#ffffff',
    primaryContainer: '#e3f2fd',
    onPrimaryContainer: '#0d47a1',

    secondary: '#1b5e20', // Very dark green
    onSecondary: '#ffffff',
    secondaryContainer: '#e8f5e8',
    onSecondaryContainer: '#1b5e20',

    accent: '#e65100', // Strong orange
    onAccent: '#ffffff',
    accentContainer: '#fff3e0',
    onAccentContainer: '#e65100',

    // High contrast section colors
    coreLearning: '#e1f5fe', // Strong blue
    enhancedLearning: '#e0f2f1', // Strong green
    supplementary: '#fff8e1', // Strong yellow

    success: '#1b5e20',
    warning: '#ef6c00',
    error: '#c62828',
    info: '#0d47a1',

    outline: '#000000',
    outlineVariant: '#424242',

    navigationBackground: '#ffffff',
    navigationSurface: '#f0f0f0',
  },
  typography,
  spacing,
  borderRadius,
};

// Auto theme remains the same
const autoTheme: Theme = {
  mode: 'system',
  colors: lightTheme.colors,
  typography,
  spacing,
  borderRadius,
};

// Theme registry
export const themes: Record<ThemeMode, Theme> = {
  light: lightTheme,
  dark: darkTheme,
  sepia: sepiaTheme,
  highContrast: highContrastTheme,
  system: autoTheme,
};

// Section group configuration - unchanged
export const sectionGroups = {
  coreLearning: {
    title: 'Core Learning',
    emoji: '📚',
    sections: ['CORE_DEFINITION', 'DEFINITION', 'EXPLANATION', 'EXAMPLES', 'SUMMARY', 'EXERCISES', 'KEY_POINTS_&_SUMMARY', 'KEY_POINTS_SUMMARY']
  },
  enhancedLearning: {
    title: 'Enhanced Learning',
    emoji: '🧠',
    sections: ['ANALOGIES_&_VISUALIZATIONS', 'ANALOGIES_VISUALIZATIONS', 'INTERACTIVE_ELEMENTS', 'CONNECTIONS', 'MEMORY_TECHNIQUES']
  },
  supplementary: {
    title: 'Additional Resources',
    emoji: '💡',
    sections: ['FUN_FACTS_&_TRIVIA', 'FUN_FACTS_TRIVIA', 'ANNOTATIONS']
  }
};

// Helper function remains the same
export const getSectionGroup = (sectionType: string): keyof typeof sectionGroups | null => {
  const normalizedType = sectionType?.replace(/[^A-Z_]/g, '') || '';

  for (const [groupKey, group] of Object.entries(sectionGroups)) {
    if (group.sections.includes(normalizedType)) {
      return groupKey as keyof typeof sectionGroups;
    }
  }
  return null;
};

// Backwards compatibility
export const brandColors = lightTheme.colors;
export { createShadow };

export const layout = {
  borderRadius: borderRadius,
  containerPadding: spacing.md,
} as const;

export { typography, spacing, borderRadius };
