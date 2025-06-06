// src/lib/designSystem.tsx (or your preferred path/name)

import { useColorScheme } from 'react-native'; // For system theme detection

// --- 1. FOUNDATION CONSTANTS ---

// COLOR FOUNDATION (Derived from HTML & Greywolf principles)
export const baseColors = {
  // Background System
  gradientStart: '#e2e8f0',
  gradientEnd: '#cbd5e0',
  backgroundSolid: '#e2e8f0',

  // Surface System (Glassmorphism inspired)
  surfacePrimary: 'rgba(255, 255, 255, 0.75)',
  surfaceSecondary: 'rgba(255, 255, 255, 0.6)',
  surfaceVariant: 'rgba(255, 255, 255, 0.5)',

  // Text Hierarchy
  textRoot: '#1a202c',      // For H1 level, strongest text
  textPrimary: '#2d3748',    // For general content, card titles
  textSecondary: '#4a5568', // Subtitles, less emphasized text
  textMuted: '#718096',      // Hints, footers

  // Interactive Colors
  blue: '#4299e1',
  green: '#48bb78',
  red: '#f56565',
  orange: '#ed8936', // General warning/accent
  yellow: '#FFD700', // Gold/yellow

  // Neutrals (useful for light/dark themes)
  white: '#ffffff',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Fire Colors
  fireYellow: '#FFFF99',
  fireGold: '#FFD700',
  fireOrange: '#FF8C00',
  fireBlue: '#00BFFF',
};

// TYPOGRAPHY SYSTEM
export const typography = {
  fontFamily: {
    primary: 'Inter', // Ensure this font is loaded in your project
    mono: 'monospace', // Generic monospace
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 22,
    '2xl': 35,
    '3xl': 44,
    '4xl': 56,
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.6,
    relaxed: 1.8,
  },
} as const;

// SPACING SYSTEM
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 30,
  '2xl': 48,
  '3xl': 64,
} as const;

// BORDER RADIUS SYSTEM
export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

// --- 2. SHADOW FUNCTION ---
export const createShadow = (elevation: number) => {
  if (elevation <= 0) {
    return {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    };
  }
  const shadowColor = baseColors.black; // Standard black shadow
  switch (elevation) {
    case 1: return { shadowColor, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 2 };
    case 2: return { shadowColor, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 5 };
    case 3: return { shadowColor, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 8 };
    case 4: return { shadowColor, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 15, elevation: 12 };
    case 5: return { shadowColor, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.10, shadowRadius: 20, elevation: 16 };
    default: return { shadowColor, shadowOffset: { width: 0, height: 12 + (elevation - 5) * 2 }, shadowOpacity: Math.min(0.15, 0.10 + (elevation - 5) * 0.01), shadowRadius: 20 + (elevation - 5) * 3, elevation: 16 + (elevation - 5) * 2, };
  }
};

// --- 3. THEME INTERFACE ---
export type ThemeMode = 'greywolf' | 'light' | 'dark' | 'sepia' | 'highContrast' | 'system';

export interface ThemeColors {
  // Backgrounds
  background: string;
  backgroundGradient?: { start: string; end: string };
  surface: string;         // Main card surface
  surfaceSecondary: string; // Secondary elements
  surfaceVariant: string;   // Subtle backgrounds

  // Text
  onBackground: string;     // Text on main background (e.g., h1)
  onSurface: string;        // Text on primary surface (e.g., card titles)
  onSurfaceSecondary: string; // Text on secondary surface
  onSurfaceVariant: string; // Text on variant surface
  textMuted: string;        // Hints, placeholders

  // Actions & Accents
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

  // Educational Section Theming
  coreLearning: string;
  enhancedLearning: string;
  supplementary: string;

  // Interactive Elements (for animations, states)
  interactive: {
    cold: string;
    medium: string;
    hot: string;
    fire: { low: string; medium: string; high: string; extreme: string; };
  };

  // Semantic States
  success: string;
  warning: string;
  error: string;
  info: string;

  // Structural
  outline: string;
  outlineVariant: string;
  border: string;

  // Navigation
  navigationBackground: string;
  navigationSurface: string;

  // Specific (example from HTML)
  sliderTrack?: string; // Can be a gradient string for web, or a set of colors for native
  sliderThumb?: string;
  sliderThumbBorder?: string;
}

export interface Theme {
  mode: ThemeMode;
  isDark: boolean; // Helper to know if the current theme is dark
  colors: ThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: {
    xs: ReturnType<typeof createShadow>; // Elevation 1
    sm: ReturnType<typeof createShadow>; // Elevation 2 (Cards)
    md: ReturnType<typeof createShadow>; // Elevation 3
    lg: ReturnType<typeof createShadow>; // Elevation 4 (Modals)
    xl: ReturnType<typeof createShadow>; // Elevation 5 (Major Overlays)
  };
  transitions: { // Primarily for web, but good to define
    fast: string;
    normal: string;
    slow: string;
  };
}

// --- 4. THEME IMPLEMENTATIONS ---

// GREYWOLF THEME (HTML Aligned)
export const greywolfTheme: Theme = {
  mode: 'greywolf',
  isDark: false,
  colors: {
    background: baseColors.backgroundSolid,
    backgroundGradient: { start: baseColors.gradientStart, end: baseColors.gradientEnd },
    surface: baseColors.surfacePrimary,
    surfaceSecondary: baseColors.surfaceSecondary,
    surfaceVariant: baseColors.surfaceVariant,

    onBackground: baseColors.textRoot,
    onSurface: baseColors.textPrimary,
    onSurfaceSecondary: baseColors.textSecondary,
    onSurfaceVariant: baseColors.textSecondary, // Usually same as onSurfaceSecondary or textMuted
    textMuted: baseColors.textMuted,

    primary: baseColors.blue,
    onPrimary: baseColors.white,
    primaryContainer: `rgba(${hexToRgb(baseColors.blue)}, 0.15)`,
    onPrimaryContainer: baseColors.blue,

    secondary: baseColors.green,
    onSecondary: baseColors.white,
    secondaryContainer: `rgba(${hexToRgb(baseColors.green)}, 0.15)`,
    onSecondaryContainer: baseColors.green,

    accent: baseColors.red,
    onAccent: baseColors.white,
    accentContainer: `rgba(${hexToRgb(baseColors.red)}, 0.15)`,
    onAccentContainer: baseColors.red,

    coreLearning: `rgba(${hexToRgb(baseColors.blue)}, 0.08)`,
    enhancedLearning: `rgba(${hexToRgb(baseColors.green)}, 0.08)`,
    supplementary: `rgba(${hexToRgb(baseColors.orange)}, 0.08)`,

    interactive: {
      cold: baseColors.blue,
      medium: baseColors.green,
      hot: baseColors.red,
      fire: { low: baseColors.fireYellow, medium: baseColors.fireGold, high: baseColors.fireOrange, extreme: baseColors.fireBlue },
    },

    success: baseColors.green,
    warning: baseColors.orange,
    error: baseColors.red,
    info: baseColors.blue,

    outline: baseColors.gradientStart, // Matches lighter part of gradient
    outlineVariant: `rgba(${hexToRgb(baseColors.gradientStart)}, 0.8)`, // More subtle
    border: baseColors.surfaceVariant, // `rgba(255, 255, 255, 0.5)`

    navigationBackground: baseColors.surfacePrimary,
    navigationSurface: baseColors.surfaceSecondary,

    sliderThumb: baseColors.white,
    sliderThumbBorder: baseColors.blue,
  },
  typography,
  spacing,
  borderRadius,
  shadows: {
    xs: createShadow(1), sm: createShadow(2), md: createShadow(3), lg: createShadow(4), xl: createShadow(5),
  },
  transitions: { fast: '150ms ease-in-out', normal: '300ms ease-in-out', slow: '500ms ease-in-out' },
};

// LIGHT THEME
export const lightTheme: Theme = {
  ...greywolfTheme, // Base structure
  mode: 'light',
  isDark: false,
  colors: {
    ...greywolfTheme.colors, // Inherit interactive, semantic etc.
    background: baseColors.gray50,
    backgroundGradient: undefined,
    surface: baseColors.white,
    surfaceSecondary: baseColors.gray100,
    surfaceVariant: baseColors.gray200,

    onBackground: baseColors.gray900,
    onSurface: baseColors.gray800,
    onSurfaceSecondary: baseColors.gray700,
    onSurfaceVariant: baseColors.gray600,
    textMuted: baseColors.gray500,

    primaryContainer: `rgba(${hexToRgb(baseColors.blue)}, 0.1)`, // Lighter container for light theme
    secondaryContainer: `rgba(${hexToRgb(baseColors.green)}, 0.1)`,
    accentContainer: `rgba(${hexToRgb(baseColors.red)}, 0.1)`,

    coreLearning: `rgba(${hexToRgb(baseColors.blue)}, 0.07)`,
    enhancedLearning: `rgba(${hexToRgb(baseColors.green)}, 0.07)`,
    supplementary: `rgba(${hexToRgb(baseColors.orange)}, 0.07)`,

    border: baseColors.gray200,
    outline: baseColors.gray300,
    outlineVariant: baseColors.gray200,

    navigationBackground: baseColors.white,
    navigationSurface: baseColors.gray50,
  },
  // Shadows are generally effective with createShadow on light themes
};

// DARK THEME
export const darkTheme: Theme = {
  ...greywolfTheme, // Base structure
  mode: 'dark',
  isDark: true,
  colors: {
    ...greywolfTheme.colors, // Inherit interactive, semantic etc.
    background: baseColors.gray900,
    backgroundGradient: { start: baseColors.gray800, end: baseColors.gray900 },
    surface: baseColors.gray800,
    surfaceSecondary: baseColors.gray700,
    surfaceVariant: baseColors.gray600,

    onBackground: baseColors.gray50,
    onSurface: baseColors.gray100, // Brighter than gray50 for better readability on gray800
    onSurfaceSecondary: baseColors.gray200,
    onSurfaceVariant: baseColors.gray400,
    textMuted: baseColors.gray500,

    primaryContainer: `rgba(${hexToRgb(baseColors.blue)}, 0.2)`, // More opaque for dark
    secondaryContainer: `rgba(${hexToRgb(baseColors.green)}, 0.2)`,
    accentContainer: `rgba(${hexToRgb(baseColors.red)}, 0.2)`,

    coreLearning: `rgba(${hexToRgb(baseColors.blue)}, 0.12)`,
    enhancedLearning: `rgba(${hexToRgb(baseColors.green)}, 0.12)`,
    supplementary: `rgba(${hexToRgb(baseColors.orange)}, 0.12)`,

    border: baseColors.gray700,
    outline: baseColors.gray600,
    outlineVariant: baseColors.gray700,

    navigationBackground: baseColors.gray900,
    navigationSurface: baseColors.gray800,
  },
  shadows: { // Dark shadows on dark background are subtle. Consider lighter shadows or less elevation.
    xs: createShadow(1), // Will be a very dark, subtle shadow
    sm: createShadow(1), // For cards, might want very low elevation or alternative styling
    md: createShadow(2),
    lg: createShadow(2),
    xl: createShadow(3),
  },
};

// SEPIA THEME
export const sepiaTheme: Theme = {
  ...greywolfTheme,
  mode: 'sepia',
  isDark: false, // Or true if the sepia is dark enough
  colors: {
    ...greywolfTheme.colors,
    background: '#FBF0E4',
    backgroundGradient: undefined,
    surface: '#F5E5D3',
    surfaceSecondary: '#EADBC8',
    surfaceVariant: '#E0D1BE',

    onBackground: '#5D4037',
    onSurface: '#6D4C41',
    onSurfaceSecondary: '#795548',
    onSurfaceVariant: '#8D6E63',
    textMuted: '#A1887F',

    primary: '#795548', // Brownish primary
    onPrimary: baseColors.white,
    primaryContainer: `rgba(${hexToRgb('#795548')}, 0.15)`,
    onPrimaryContainer: '#5D4037',

    secondary: '#8BC34A', // A muted green for sepia
    onSecondary: baseColors.black,
    secondaryContainer: `rgba(${hexToRgb('#8BC34A')}, 0.15)`,
    onSecondaryContainer: '#558B2F',


    coreLearning: `rgba(${hexToRgb('#795548')}, 0.1)`,
    enhancedLearning: `rgba(${hexToRgb('#8BC34A')}, 0.1)`,
    supplementary: `rgba(${hexToRgb('#FF9800')}, 0.1)`, // Muted orange

    border: '#D7CCC8',
    outline: '#BCAAA4',
    outlineVariant: '#D7CCC8',

    navigationBackground: '#FBF0E4',
    navigationSurface: '#F5E5D3',
  },
};

// HIGH CONTRAST THEME
export const highContrastTheme: Theme = {
  ...greywolfTheme,
  mode: 'highContrast',
  isDark: false, // Typically light background
  colors: {
    ...greywolfTheme.colors,
    background: baseColors.white,
    backgroundGradient: undefined,
    surface: baseColors.white,
    surfaceSecondary: baseColors.gray100, // Slight differentiation
    surfaceVariant: baseColors.gray200,

    onBackground: baseColors.black,
    onSurface: baseColors.black,
    onSurfaceSecondary: baseColors.black,
    onSurfaceVariant: baseColors.black,
    textMuted: baseColors.black, // Still black for high contrast

    primary: '#0000FF', // Pure Blue
    onPrimary: baseColors.white,
    primaryContainer: '#E0E0FF', // Light blue container
    onPrimaryContainer: baseColors.black, // Black text on light blue

    secondary: '#008000', // Pure Green
    onSecondary: baseColors.white,
    secondaryContainer: '#E0FFE0',
    onSecondaryContainer: baseColors.black,

    accent: '#FF0000', // Pure Red
    onAccent: baseColors.white,
    accentContainer: '#FFE0E0',
    onAccentContainer: baseColors.black,

    coreLearning: '#D0D0FF', // Distinct light colors
    enhancedLearning: '#D0FFD0',
    supplementary: '#FFE0D0',

    border: baseColors.black,
    outline: baseColors.black,
    outlineVariant: baseColors.black,

    navigationBackground: baseColors.white,
    navigationSurface: baseColors.gray100,
  },
  shadows: { // No shadows for high contrast
    xs: createShadow(0), sm: createShadow(0), md: createShadow(0), lg: createShadow(0), xl: createShadow(0),
  },
};

// SYSTEM THEME (Resolved by ThemeProvider)
export const systemTheme: Theme = {
  ...greywolfTheme, // Default for SSR or if detection fails
  mode: 'system',
};


// --- 5. THEME REGISTRY ---
export const themes: Record<Exclude<ThemeMode, 'system'>, Theme> = {
  greywolf: greywolfTheme,
  light: lightTheme,
  dark: darkTheme,
  sepia: sepiaTheme,
  highContrast: highContrastTheme,
};

// --- 6. HELPER FUNCTIONS ---

// Helper to convert hex to RGB string for rgba()
function hexToRgb(hex: string): string | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
}


export const getTemperatureColor = (temperature: number, theme: Theme) => {
  if (temperature <= 33) return theme.colors.interactive.cold;
  if (temperature <= 66) return theme.colors.interactive.medium;
  return theme.colors.interactive.hot;
};

export const getFireColor = (temperature: number, theme: Theme) => {
  if (temperature < 25) return theme.colors.interactive.fire.low;
  if (temperature < 50) return theme.colors.interactive.fire.medium;
  if (temperature < 75) return theme.colors.interactive.fire.high;
  return theme.colors.interactive.fire.extreme;
};

export const sectionGroups = {
  coreLearning: { title: 'Core Learning', emoji: '📚', sections: ['CORE_DEFINITION', 'DEFINITION', 'EXPLANATION', 'EXAMPLES', 'SUMMARY', 'EXERCISES', 'KEY_POINTS_&_SUMMARY', 'KEY_POINTS_SUMMARY'] },
  enhancedLearning: { title: 'Enhanced Learning', emoji: '🧠', sections: ['ANALOGIES_&_VISUALIZATIONS', 'ANALOGIES_VISUALIZATIONS', 'INTERACTIVE_ELEMENTS', 'CONNECTIONS', 'MEMORY_TECHNIQUES'] },
  supplementary: { title: 'Additional Resources', emoji: '💡', sections: ['FUN_FACTS_&_TRIVIA', 'FUN_FACTS_TRIVIA', 'ANNOTATIONS'] }
};

export const getSectionGroup = (sectionTypeXml: string): keyof typeof sectionGroups | null => {
  const normalizedType = sectionTypeXml?.replace(/[^A-Z_]/g, '').toUpperCase() || '';
  for (const [groupKey, group] of Object.entries(sectionGroups)) {
    if (group.sections.includes(normalizedType)) {
      return groupKey as keyof typeof sectionGroups;
    }
  }
  return 'supplementary'; // Default to supplementary if not found
};


// --- 7. EXPORT ALIASES & CONTEXT (if this file also manages ThemeContext) ---

// If you have ThemeContext and useThemedStyles in another file, import them.
// Otherwise, you can define them here. For simplicity, assuming they might be here or imported.

// Example:
// export const ThemeContext = React.createContext<{ theme: Theme; setThemeMode: (mode: ThemeMode) => void } | undefined>(undefined);
// export const useTheme = () => { /* ... context hook ... */ }
// export const useThemedStyles = (styleFn: (theme: Theme) => any) => { /* ... hook to get themed styles ... */ }


// Backwards compatibility / Convenience exports
export const defaultTheme = greywolfTheme; // Export a default for convenience

// For direct import of scales if needed, though using theme.spacing etc. is preferred
export const designTypography = typography;
export const designSpacing = spacing;
export const designBorderRadius = borderRadius;
export const designColors = baseColors; // Exporting the base color palette

export const layout = {
  borderRadius, // Uses the const directly
  containerPadding: spacing.md,
} as const;
