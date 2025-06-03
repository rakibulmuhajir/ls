// ============================================
// ENHANCED DESIGN SYSTEM WITH THEME SUPPORT
// ============================================

import { useColorScheme } from 'react-native';

// Base color definitions
const baseColors = {
  // Trust Blue (Claude AI inspired)
  trustBlue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#4A90E2', // Primary trust blue
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Growth Green
  growthGreen: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#7ED321', // Primary growth green
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },

  // Warm Terra Cotta (Accent)
  terraCotta: {
    50: '#fef7ed',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#F4A460', // Primary terra cotta
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Neutrals (Gray scale)
  neutral: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
  },

  // Semantic colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

// Book page colors
const bookPageColors = {
  parchment: '#F0E68C',
  antiquePaper: '#CCC0B2',
  agedPaper: '#E0D3AF',
  vintageCream: '#EBD5B3',
  sepiaText: '#5F5F54',
  sepiaBackground: '#F1E7D0',
  nightModeWarm: '#E8E3D3',
};

// Dracula colors
const draculaColors = {
  background: '#282a36',
  currentLine: '#44475a',
  foreground: '#f8f8f2',
  comment: '#6272a4',
  cyan: '#8be9fd',
  green: '#50fa7b',
  orange: '#ffb86c',
  pink: '#ff79c6',
  purple: '#bd93f9',
  red: '#ff5555',
  yellow: '#f1fa8c',
};

// Theme definitions
export type ThemeMode = 'light' | 'dark' | 'sepia' | 'highContrast' | 'system';

export interface Theme {
  mode: ThemeMode;
  colors: {
    // Background colors
    background: string;
    surface: string;
    surfaceVariant: string;

    // Text colors
    onBackground: string;
    onSurface: string;
    onSurfaceVariant: string;

    // Primary colors
    primary: string;
    onPrimary: string;
    primaryContainer: string;
    onPrimaryContainer: string;

    // Secondary colors
    secondary: string;
    onSecondary: string;
    secondaryContainer: string;
    onSecondaryContainer: string;

    // Accent colors
    accent: string;
    onAccent: string;
    accentContainer: string;
    onAccentContainer: string;

    // Section group colors (3 main categories)
    coreLearning: string;
    enhancedLearning: string;
    supplementary: string;

    // Semantic colors
    success: string;
    warning: string;
    error: string;
    info: string;

    // Border and divider
    outline: string;
    outlineVariant: string;

    // Navigation
    navigationBackground: string;
    navigationSurface: string;
  };
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
}

// Typography system
export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

// Spacing system
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

// Border radius
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
} as const;

// Shadow utility
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

// Theme definitions
const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background: '#ffffff',
    surface: '#f8fafc',
    surfaceVariant: '#f1f5f9',

    onBackground: baseColors.neutral[900],
    onSurface: baseColors.neutral[800],
    onSurfaceVariant: baseColors.neutral[600],

    primary: baseColors.trustBlue[500],
    onPrimary: '#ffffff',
    primaryContainer: baseColors.trustBlue[100],
    onPrimaryContainer: baseColors.trustBlue[900],

    secondary: baseColors.growthGreen[500],
    onSecondary: '#ffffff',
    secondaryContainer: baseColors.growthGreen[100],
    onSecondaryContainer: baseColors.growthGreen[900],

    accent: baseColors.terraCotta[400],
    onAccent: '#ffffff',
    accentContainer: baseColors.terraCotta[100],
    onAccentContainer: baseColors.terraCotta[900],

    // Section groups - subtle but distinct
    coreLearning: '#f0f9ff', // Light blue
    enhancedLearning: '#f0fdf4', // Light green
    supplementary: '#fefce8', // Light yellow

    success: baseColors.success,
    warning: baseColors.warning,
    error: baseColors.error,
    info: baseColors.info,

    outline: baseColors.neutral[300],
    outlineVariant: baseColors.neutral[200],

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
    surfaceVariant: '#3b3e56',

    onBackground: draculaColors.foreground,
    onSurface: draculaColors.foreground,
    onSurfaceVariant: '#a6accd',

    primary: draculaColors.purple,
    onPrimary: draculaColors.background,
    primaryContainer: '#8b5fb94d',
    onPrimaryContainer: draculaColors.purple,

    secondary: draculaColors.green,
    onSecondary: draculaColors.background,
    secondaryContainer: '#50fa7b4d',
    onSecondaryContainer: draculaColors.green,

    accent: draculaColors.pink,
    onAccent: draculaColors.background,
    accentContainer: '#ff79c64d',
    onAccentContainer: draculaColors.pink,

    // Section groups - darker themed
    coreLearning: '#1e293b', // Dark blue
    enhancedLearning: '#14532d', // Dark green
    supplementary: '#451a03', // Dark amber

    success: draculaColors.green,
    warning: draculaColors.orange,
    error: draculaColors.red,
    info: draculaColors.cyan,

    outline: '#52525b',
    outlineVariant: '#3f3f46',

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

    onBackground: bookPageColors.sepiaText,
    onSurface: '#4a4a42',
    onSurfaceVariant: '#6b6b5f',

    primary: '#8b7355',
    onPrimary: bookPageColors.sepiaBackground,
    primaryContainer: '#d4c5a9',
    onPrimaryContainer: '#5d4e3a',

    secondary: '#7a8471',
    onSecondary: bookPageColors.sepiaBackground,
    secondaryContainer: '#c8d0bf',
    onSecondaryContainer: '#404740',

    accent: '#a67c52',
    onAccent: bookPageColors.sepiaBackground,
    accentContainer: '#e8d5c4',
    onAccentContainer: '#5d3e26',

    // Section groups - warm paper tones
    coreLearning: '#f4eed7', // Warm cream
    enhancedLearning: '#ede5d3', // Aged paper
    supplementary: '#f0e3c7', // Light parchment

    success: '#7a8471',
    warning: '#b8860b',
    error: '#a0522d',
    info: '#4682b4',

    outline: '#c4b5a0',
    outlineVariant: '#d4c5a9',

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
    surface: '#f8f9fa',
    surfaceVariant: '#e9ecef',

    onBackground: '#000000',
    onSurface: '#000000',
    onSurfaceVariant: '#212529',

    primary: '#0d47a1',
    onPrimary: '#ffffff',
    primaryContainer: '#bbdefb',
    onPrimaryContainer: '#0d47a1',

    secondary: '#1b5e20',
    onSecondary: '#ffffff',
    secondaryContainer: '#c8e6c9',
    onSecondaryContainer: '#1b5e20',

    accent: '#e65100',
    onAccent: '#ffffff',
    accentContainer: '#ffccbc',
    onAccentContainer: '#e65100',

    // Section groups - high contrast
    coreLearning: '#e3f2fd', // Light blue
    enhancedLearning: '#e8f5e8', // Light green
    supplementary: '#fff3e0', // Light orange

    success: '#2e7d32',
    warning: '#f57f17',
    error: '#d32f2f',
    info: '#1976d2',

    outline: '#424242',
    outlineVariant: '#757575',

    navigationBackground: '#ffffff',
    navigationSurface: '#f5f5f5',
  },
  typography,
  spacing,
  borderRadius,
};

// Auto theme (follows system)
const autoTheme: Theme = {
  mode: 'system',
  colors: lightTheme.colors, // Default to light, will be overridden
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

// Section group configuration for ContentScreen
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

// Helper function to get section group
export const getSectionGroup = (sectionType: string): keyof typeof sectionGroups | null => {
  const normalizedType = sectionType?.replace(/[^A-Z_]/g, '') || '';

  for (const [groupKey, group] of Object.entries(sectionGroups)) {
    if (group.sections.includes(normalizedType)) {
      return groupKey as keyof typeof sectionGroups;
    }
  }
  return null;
};

// Backwards compatibility - keep existing exports
export const brandColors = lightTheme.colors;
export { createShadow };

// Legacy exports for backward compatibility
export const layout = {
  borderRadius: borderRadius,
  containerPadding: spacing.md,
} as const;

// Legacy screen styles - will be updated to use themes
export const screenStyles = {
  container: {
    flexGrow: 1,
    backgroundColor: lightTheme.colors.background,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },

  screenHeader: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: lightTheme.colors.onBackground,
    marginBottom: spacing.lg,
    textAlign: 'center' as const,
  },

  listItem: {
    backgroundColor: lightTheme.colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    ...createShadow(2),
  },

  listItemText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: lightTheme.colors.onSurface,
    lineHeight: typography.lineHeight.normal * typography.fontSize.lg,
  },

  centeredContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: lightTheme.colors.background,
    paddingHorizontal: spacing.lg,
  },

  errorText: {
    fontSize: typography.fontSize.lg,
    color: lightTheme.colors.error,
    textAlign: 'center' as const,
    fontWeight: typography.fontWeight.medium,
  },

  emptyText: {
    fontSize: typography.fontSize.lg,
    color: lightTheme.colors.onSurfaceVariant,
    textAlign: 'center' as const,
    fontWeight: typography.fontWeight.medium,
  },
} as const;
