# Educational App Theme System - Developer Guide

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Theme Structure](#theme-structure)
3. [Core Components](#core-components)
4. [Implementation Patterns](#implementation-patterns)
5. [Adding New Themes](#adding-new-themes)
6. [Customizing Existing Themes](#customizing-existing-themes)
7. [Best Practices](#best-practices)
8. [Performance Considerations](#performance-considerations)
9. [Troubleshooting](#troubleshooting)
10. [Migration Guide](#migration-guide)

---

## Architecture Overview

The theme system is built on React Context with TypeScript for type safety and uses a centralized design token approach. Here's the high-level architecture:

```
App.tsx
└── ThemeProvider (Context)
    ├── Theme State Management
    ├── AsyncStorage Persistence
    ├── System Theme Detection
    └── Child Components
        ├── Screens (auto-themed)
        ├── Navigation (themed)
        └── Content Components (fully themed)
```

### Key Design Decisions

1. **Centralized Theme Definitions**: All themes defined in `designSystem.ts`
2. **Context-Based Distribution**: React Context provides theme to all components
3. **Persistent User Preference**: AsyncStorage saves user choice
4. **System Integration**: Respects device dark/light mode preferences
5. **Semantic Color System**: Colors have meaningful names, not just hex values
6. **Backward Compatibility**: Existing components work without modification

---

## Theme Structure

### Core Theme Interface

```typescript
interface Theme {
  mode: ThemeMode;           // 'light' | 'dark' | 'sepia' | 'highContrast' | 'system'
  colors: ThemeColors;       // Semantic color definitions
  typography: Typography;    // Font sizes, weights, line heights
  spacing: Spacing;         // Consistent spacing scale
  borderRadius: BorderRadius; // Border radius scale
}
```

### Color System Hierarchy

```typescript
interface ThemeColors {
  // Background Layers (from back to front)
  background: string;        // App background
  surface: string;          // Card/container backgrounds
  surfaceVariant: string;   // Secondary container backgrounds

  // Text Colors (semantic pairing)
  onBackground: string;     // Text on background
  onSurface: string;       // Text on surface
  onSurfaceVariant: string; // Text on surfaceVariant

  // Brand Colors (primary actions)
  primary: string;          // Main brand color
  onPrimary: string;       // Text on primary
  primaryContainer: string; // Light primary background
  onPrimaryContainer: string; // Text on primaryContainer

  // Secondary & Accent (supporting colors)
  secondary: string;        // Secondary actions
  accent: string;          // Accent highlights

  // Educational Specific (content organization)
  coreLearning: string;     // Core content background
  enhancedLearning: string; // Enhanced content background
  supplementary: string;    // Supplementary content background

  // Semantic States
  success: string;
  warning: string;
  error: string;
  info: string;

  // Structure
  outline: string;          // Borders, dividers
  outlineVariant: string;   // Subtle borders
  navigationBackground: string; // Navigation specific
  navigationSurface: string;
}
```

### Theme Token Examples

```typescript
// Light Theme Example
const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background: '#ffffff',           // Pure white
    surface: '#f8fafc',             // Subtle gray
    surfaceVariant: '#f1f5f9',      // Lighter gray

    onBackground: '#18181b',         // Near black text
    onSurface: '#27272a',           // Dark gray text
    onSurfaceVariant: '#52525b',    // Medium gray text

    primary: '#4A90E2',             // Trust blue
    onPrimary: '#ffffff',           // White text on blue
    primaryContainer: '#dbeafe',     // Light blue background
    onPrimaryContainer: '#1e3a8a',  // Dark blue text

    // Educational sections
    coreLearning: '#f0f9ff',        // Light blue tint
    enhancedLearning: '#f0fdf4',    // Light green tint
    supplementary: '#fefce8',       // Light yellow tint
  },
  typography: { /* ... */ },
  spacing: { /* ... */ },
  borderRadius: { /* ... */ }
};
```

---

## Core Components

### 1. ThemeProvider

The root component that manages theme state and provides context.

```typescript
// Usage in App.tsx
export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
```

**Key Features:**
- Loads saved theme preference on app start
- Handles system theme changes automatically
- Provides theme switching functionality
- Manages loading states during initialization

**State Management:**
```typescript
const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);

  // Memoized theme prevents unnecessary re-renders
  const currentTheme = useMemo(() => {
    if (themeMode === 'system') {
      const systemTheme = systemColorScheme === 'dark' ? 'dark' : 'light';
      return { ...themes[systemTheme], mode: 'system' };
    }
    return themes[themeMode] || themes.light;
  }, [themeMode, systemColorScheme]);
};
```

### 2. Theme Hooks

#### `useTheme()`
Primary hook for accessing theme in components.

```typescript
const { theme, themeMode, updateTheme, isLoading } = useTheme();

// Access theme properties
const backgroundColor = theme.colors.background;
const primaryColor = theme.colors.primary;
const largeText = theme.typography.fontSize.lg;
```

#### `useThemedStyles()`
Hook for creating theme-aware StyleSheet objects.

```typescript
const MyComponent = () => {
  const styles = useThemedStyles((theme) => ({
    container: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
    },
    text: {
      color: theme.colors.onSurface,
      fontSize: theme.typography.fontSize.base,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    primaryButtonText: {
      color: theme.colors.onPrimary,
      fontWeight: theme.typography.fontWeight.semibold,
    }
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Themed Content</Text>
      <TouchableOpacity style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Action</Text>
      </TouchableOpacity>
    </View>
  );
};
```

#### `useThemeColors()`
Shortcut hook for accessing colors only.

```typescript
const colors = useThemeColors();
// Equivalent to: const { theme } = useTheme(); const colors = theme.colors;
```

#### `useThemeMode()`
Hook for theme mode detection.

```typescript
const { isLight, isDark, isSepia, isHighContrast, isSystem } = useThemeMode();

// Conditional rendering based on theme
if (isSepia) {
  return <BookStyleComponent />;
}
```

### 3. ThemePicker Component

User interface for theme selection.

```typescript
// Full theme picker (for dedicated theme screen)
<ThemePicker
  onThemeChange={(theme) => console.log('Theme changed to:', theme)}
  showHeader={true}
  compact={false}
/>

// Compact version (for modals/settings)
<ThemePicker
  showHeader={false}
  compact={true}
/>

// Quick toggle button (for navigation)
<ThemeToggleButton
  size={24}
  onPress={() => setShowThemePicker(true)}
/>
```

---

## Implementation Patterns

### Pattern 1: Basic Component Theming

```typescript
import { useTheme, useThemedStyles } from '@/lib/ThemeContext';

const BasicCard = ({ title, content }) => {
  const { theme } = useTheme();

  const styles = useThemedStyles((theme) => ({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
    },
    title: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.sm,
    },
    content: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.onSurfaceVariant,
      lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
    }
  }));

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.content}>{content}</Text>
    </View>
  );
};
```

### Pattern 2: Conditional Theme Styling

```typescript
const ReadingComponent = ({ content }) => {
  const { theme } = useTheme();
  const { isSepia, isDark } = useThemeMode();

  const styles = useThemedStyles((theme) => ({
    container: {
      backgroundColor: theme.colors.background,
      // Sepia theme gets special treatment
      ...(isSepia && {
        backgroundColor: '#F1E7D0',
        borderWidth: 1,
        borderColor: '#D4C5A9',
      }),
    },
    text: {
      color: theme.colors.onBackground,
      fontSize: theme.typography.fontSize.base,
      // Larger text for sepia reading
      ...(isSepia && {
        fontSize: theme.typography.fontSize.lg,
        lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.lg,
      }),
      // Different shadow for dark theme
      ...(isDark && {
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      }),
    }
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{content}</Text>
    </View>
  );
};
```

### Pattern 3: Section Group Theming (ContentScreen specific)

```typescript
import { getSectionGroup, sectionGroups } from '@/lib/designSystem';

const SectionCard = ({ section }) => {
  const { theme } = useTheme();
  const groupKey = getSectionGroup(section.section_type_xml);
  const group = groupKey ? sectionGroups[groupKey] : null;

  const styles = useThemedStyles((theme) => ({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      marginBottom: theme.spacing.md,
    },
    header: {
      // Use section group color if available
      backgroundColor: groupKey ? theme.colors[groupKey] : theme.colors.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    headerText: {
      color: theme.colors.onPrimary,
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
    },
    content: {
      // Subtle tint based on section group
      backgroundColor: groupKey ? theme.colors[groupKey] : theme.colors.surfaceVariant,
      padding: theme.spacing.lg,
    }
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {group?.emoji} {section.title}
        </Text>
      </View>
      <View style={styles.content}>
        {/* Section content */}
      </View>
    </View>
  );
};
```

### Pattern 4: Navigation Component Theming

```typescript
const ThemedNavigationBar = ({ items }) => {
  const { theme } = useTheme();

  const styles = useThemedStyles((theme) => ({
    navigationBar: {
      backgroundColor: theme.colors.navigationBackground,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outlineVariant,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    navButton: {
      backgroundColor: theme.colors.navigationSurface,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginHorizontal: theme.spacing.xs,
    },
    navButtonText: {
      color: theme.colors.onSurface,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
    },
    activeNavButton: {
      backgroundColor: theme.colors.primaryContainer,
    },
    activeNavButtonText: {
      color: theme.colors.onPrimaryContainer,
    }
  }));

  return (
    <View style={styles.navigationBar}>
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.navButton,
            item.active && styles.activeNavButton
          ]}
        >
          <Text style={[
            styles.navButtonText,
            item.active && styles.activeNavButtonText
          ]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
```

---

## Adding New Themes

### Step 1: Define Theme Colors

```typescript
// In designSystem.ts, add new theme definition
const cyberpunkTheme: Theme = {
  mode: 'cyberpunk', // Add to ThemeMode type
  colors: {
    background: '#0a0a0a',
    surface: '#1a1a2e',
    surfaceVariant: '#16213e',

    onBackground: '#00ff9f',
    onSurface: '#00d4aa',
    onSurfaceVariant: '#4cc9f0',

    primary: '#ff006e',
    onPrimary: '#ffffff',
    primaryContainer: '#4a0e2d',
    onPrimaryContainer: '#ff9fc7',

    secondary: '#7209b7',
    onSecondary: '#ffffff',
    secondaryContainer: '#2d0a4b',
    onSecondaryContainer: '#c77dff',

    accent: '#f72585',
    onAccent: '#ffffff',
    accentContainer: '#5a0e2a',
    onAccentContainer: '#ffb3d1',

    coreLearning: '#1a0e2e',
    enhancedLearning: '#0e1a2e',
    supplementary: '#2e1a0e',

    success: '#39ff14',
    warning: '#ffaa00',
    error: '#ff073a',
    info: '#00c9ff',

    outline: '#4a4a4a',
    outlineVariant: '#2a2a2a',

    navigationBackground: '#0a0a0a',
    navigationSurface: '#1a1a2e',
  },
  typography,
  spacing,
  borderRadius,
};
```

### Step 2: Update Type Definitions

```typescript
// Update ThemeMode type
export type ThemeMode = 'light' | 'dark' | 'sepia' | 'highContrast' | 'cyberpunk' | 'system';

// Add to themes registry
export const themes: Record<ThemeMode, Theme> = {
  light: lightTheme,
  dark: darkTheme,
  sepia: sepiaTheme,
  highContrast: highContrastTheme,
  cyberpunk: cyberpunkTheme, // Add new theme
  system: autoTheme,
};
```

### Step 3: Add to Theme Picker

```typescript
// In ThemePicker.tsx, add new option
const themeOptions: ThemeOption[] = [
  // existing options...
  {
    mode: 'cyberpunk',
    label: 'Cyberpunk',
    description: 'Neon-inspired futuristic theme',
    icon: 'robot',
    previewColors: {
      background: '#0a0a0a',
      surface: '#1a1a2e',
      primary: '#ff006e',
      text: '#00ff9f',
    },
  },
];
```

### Step 4: Test New Theme

```typescript
// Test in any component
const TestNewTheme = () => {
  const { updateTheme } = useTheme();

  return (
    <TouchableOpacity onPress={() => updateTheme('cyberpunk')}>
      <Text>Switch to Cyberpunk Theme</Text>
    </TouchableOpacity>
  );
};
```

---

## Customizing Existing Themes

### Modifying Colors

```typescript
// Create theme variant
const darkBlueTheme: Theme = {
  ...darkTheme, // Inherit from existing theme
  colors: {
    ...darkTheme.colors, // Keep most colors
    primary: '#4285f4', // Override specific colors
    primaryContainer: '#1a73e8',
    accent: '#34a853',
  }
};
```

### Creating Theme Variations

```typescript
// Helper function for theme variations
const createThemeVariation = (baseTheme: Theme, overrides: Partial<Theme>): Theme => ({
  ...baseTheme,
  ...overrides,
  colors: {
    ...baseTheme.colors,
    ...overrides.colors,
  }
});

// Usage
const warmLightTheme = createThemeVariation(lightTheme, {
  colors: {
    background: '#fefdfb',
    surface: '#faf9f7',
    primary: '#d2691e',
  }
});
```

### Dynamic Theme Generation

```typescript
// Generate theme from primary color
const generateThemeFromPrimary = (primaryColor: string, mode: 'light' | 'dark'): Theme => {
  const baseTheme = mode === 'light' ? lightTheme : darkTheme;

  // Use color manipulation library or predefined variations
  const primaryVariations = {
    primary: primaryColor,
    primaryContainer: mode === 'light' ? lighten(primaryColor, 0.4) : darken(primaryColor, 0.3),
    onPrimary: mode === 'light' ? '#ffffff' : '#000000',
    onPrimaryContainer: mode === 'light' ? darken(primaryColor, 0.2) : lighten(primaryColor, 0.2),
  };

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      ...primaryVariations,
    }
  };
};
```

---

## Best Practices

### 1. Semantic Color Usage

**✅ Do:**
```typescript
// Use semantic color names
backgroundColor: theme.colors.surface,
color: theme.colors.onSurface,
borderColor: theme.colors.outline,
```

**❌ Don't:**
```typescript
// Don't use hex values directly
backgroundColor: '#f8fafc',
color: '#27272a',
borderColor: '#e4e4e7',
```

### 2. Consistent Spacing

**✅ Do:**
```typescript
// Use theme spacing scale
paddingHorizontal: theme.spacing.lg,
marginBottom: theme.spacing.md,
gap: theme.spacing.sm,
```

**❌ Don't:**
```typescript
// Don't use arbitrary numbers
paddingHorizontal: 20,
marginBottom: 16,
gap: 8,
```

### 3. Typography Scale

**✅ Do:**
```typescript
// Use theme typography
fontSize: theme.typography.fontSize.lg,
fontWeight: theme.typography.fontWeight.semibold,
lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.lg,
```

### 4. Performance Optimization

**✅ Do:**
```typescript
// Memoize style objects
const styles = useThemedStyles((theme) => ({
  container: {
    backgroundColor: theme.colors.surface,
  }
}));

// Memoize expensive calculations
const computedStyle = useMemo(() => ({
  shadowColor: theme.colors.onSurface,
  shadowOpacity: theme.mode === 'dark' ? 0.3 : 0.1,
}), [theme.colors.onSurface, theme.mode]);
```

**❌ Don't:**
```typescript
// Don't create styles on every render
const styles = {
  container: {
    backgroundColor: theme.colors.surface, // This recreates object every render
  }
};
```

### 5. Accessibility Compliance

**✅ Do:**
```typescript
// Ensure sufficient contrast
const textColor = theme.colors.onSurface; // Pre-calculated for WCAG compliance
const backgroundColor = theme.colors.surface;

// Use semantic colors for states
const errorColor = theme.colors.error;
const successColor = theme.colors.success;
```

### 6. Theme Transition Handling

**✅ Do:**
```typescript
// Handle theme loading states
const { theme, isLoading } = useTheme();

if (isLoading) {
  return <LoadingScreen />;
}

// Smooth transitions
const animatedStyle = useAnimatedStyle(() => ({
  backgroundColor: withTiming(theme.colors.background, { duration: 300 }),
}));
```

---

## Performance Considerations

### 1. Memoization Strategy

The theme system uses several memoization techniques:

```typescript
// Theme object is memoized in ThemeProvider
const currentTheme = useMemo(() => {
  // Theme calculation
}, [themeMode, systemColorScheme]);

// Style objects are memoized in useThemedStyles
const styles = useMemo(() => styleFactory(theme), [theme, styleFactory]);

// Component-level memoization
const ThemedComponent = React.memo(({ data }) => {
  const styles = useThemedStyles(createStyles);
  // Component logic
});
```

### 2. Re-render Optimization

```typescript
// Split theme context for better performance
const ThemeContext = createContext<ThemeContextType>();
const ThemeUpdateContext = createContext<ThemeUpdateType>();

// Components only re-render when theme actually changes
const useTheme = () => useContext(ThemeContext);
const useThemeUpdate = () => useContext(ThemeUpdateContext);
```

### 3. Lazy Loading

```typescript
// Lazy load theme definitions
const themes = {
  light: lightTheme,
  dark: darkTheme,
  sepia: () => import('./themes/sepiaTheme').then(m => m.sepiaTheme),
  cyberpunk: () => import('./themes/cyberpunkTheme').then(m => m.cyberpunkTheme),
};
```

### 4. Bundle Size Optimization

```typescript
// Tree-shake unused themes in production
const getTheme = (mode: ThemeMode) => {
  switch (mode) {
    case 'light': return lightTheme;
    case 'dark': return darkTheme;
    // Only include themes that are actually used
    default: return lightTheme;
  }
};
```

---

## Troubleshooting

### Common Issues

#### 1. "useTheme must be used within a ThemeProvider"

**Problem:** Component is trying to use theme outside of ThemeProvider.

**Solution:**
```typescript
// Ensure App.tsx has ThemeProvider at root
export default function App() {
  return (
    <ThemeProvider> {/* This must wrap everything */}
      <AppNavigator />
    </ThemeProvider>
  );
}
```

#### 2. Theme not persisting between app restarts

**Problem:** AsyncStorage not saving theme preference.

**Solution:**
```typescript
// Check AsyncStorage permissions and error handling
const updateTheme = async (newTheme: ThemeMode) => {
  try {
    setThemeMode(newTheme);
    await AsyncStorage.setItem('app_theme_preference', newTheme);
  } catch (error) {
    console.error('Failed to save theme:', error);
    // Handle error - maybe show user notification
  }
};
```

#### 3. Styles not updating on theme change

**Problem:** StyleSheet not responsive to theme changes.

**Solution:**
```typescript
// Use useThemedStyles instead of StyleSheet.create
const styles = useThemedStyles((theme) => ({
  container: {
    backgroundColor: theme.colors.background, // This will update
  }
}));

// Instead of:
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background, // This won't update
  }
});
```

#### 4. Performance issues with frequent theme changes

**Problem:** Components re-rendering too often.

**Solution:**
```typescript
// Memoize expensive style calculations
const expensiveStyles = useMemo(() => {
  return createComplexStyles(theme);
}, [theme.colors.primary, theme.spacing.lg]); // Only depend on used values

// Use React.memo for pure components
const OptimizedComponent = React.memo(({ title, content }) => {
  const styles = useThemedStyles(createStyles);
  return <View style={styles.container}>{/* ... */}</View>;
});
```

#### 5. System theme not detecting properly

**Problem:** System auto-theme not switching correctly.

**Solution:**
```typescript
// Ensure useColorScheme is properly imported and used
import { useColorScheme } from 'react-native';

// Check system theme detection
const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme(); // This should be 'light' | 'dark' | null

  console.log('System theme:', systemColorScheme); // Debug system detection

  // Handle null case
  const effectiveSystemTheme = systemColorScheme || 'light';
};
```

### Debug Tools

#### 1. Theme Inspector Component

```typescript
const ThemeInspector = () => {
  const { theme, themeMode } = useTheme();
  const systemScheme = useColorScheme();

  if (__DEV__) {
    return (
      <View style={{ position: 'absolute', top: 50, right: 10, backgroundColor: 'rgba(0,0,0,0.8)', padding: 10 }}>
        <Text style={{ color: 'white', fontSize: 12 }}>
          Mode: {themeMode}{'\n'}
          System: {systemScheme}{'\n'}
          Primary: {theme.colors.primary}
        </Text>
      </View>
    );
  }
  return null;
};
```

#### 2. Theme Validation

```typescript
const validateTheme = (theme: Theme): boolean => {
  const requiredColors = ['background', 'surface', 'primary', 'onPrimary'];

  for (const color of requiredColors) {
    if (!theme.colors[color]) {
      console.error(`Missing required color: ${color}`);
      return false;
    }
  }

  return true;
};
```

---

## Migration Guide

### From No Theme System

#### 1. Gradual Migration Approach

```typescript
// Step 1: Install theme system but keep existing styles
const MyComponent = () => {
  // Existing styles still work
  const oldStyles = StyleSheet.create({
    container: { backgroundColor: '#ffffff' }
  });

  // Gradually add theme support
  const { theme } = useTheme();
  const themedBackground = theme.colors.background;

  return (
    <View style={[oldStyles.container, { backgroundColor: themedBackground }]}>
      {/* Content */}
    </View>
  );
};

// Step 2: Full migration
const MyComponent = () => {
  const styles = useThemedStyles((theme) => ({
    container: { backgroundColor: theme.colors.background }
  }));

  return <View style={styles.container}>{/* Content */}</View>;
};
```

#### 2. Backwards Compatibility Layer

```typescript
// Create compatibility layer for old brand colors
export const brandColors = {
  get primary() { return themes.light.colors.primary; },
  get secondary() { return themes.light.colors.secondary; },
  // ... other mappings
};

// This allows existing code to continue working:
// backgroundColor: brandColors.primary (still works)
```

### From Other Theme Systems

#### 1. From react-native-elements Theme

```typescript
// Old react-native-elements approach
const theme = {
  colors: {
    primary: '#2089dc',
    secondary: '#ca71eb',
  }
};

// Convert to our system
const convertedTheme: Theme = {
  mode: 'light',
  colors: {
    primary: '#2089dc',
    onPrimary: '#ffffff',
    secondary: '#ca71eb',
    onSecondary: '#ffffff',
    // ... map other colors
  },
  // ... other theme properties
};
```

#### 2. From styled-components ThemeProvider

```typescript
// Old styled-components theme
const oldTheme = {
  colors: { primary: '#007bff' },
  space: [0, 4, 8, 16, 32],
};

// Convert to our system
const newTheme: Theme = {
  mode: 'light',
  colors: {
    primary: oldTheme.colors.primary,
    // ... convert other colors
  },
  spacing: {
    xs: oldTheme.space[1],    // 4
    sm: oldTheme.space[2],    // 8
    md: oldTheme.space[3],    // 16
    lg: oldTheme.space[4],    // 32
    // ... convert other spacing
  },
  // ... other properties
};
```

---

## Conclusion

This theme system provides a robust, scalable foundation for educational app theming with:

- **Type Safety**: Full TypeScript support prevents theme-related bugs
- **Performance**: Optimized for React Native with proper memoization
- **Accessibility**: WCAG 2.1 compliant color combinations
- **User Experience**: Persistent preferences and smooth transitions
- **Developer Experience**: Intuitive API and comprehensive debugging tools
- **Educational Focus**: Specialized themes and section organization for learning

The system balances flexibility with consistency, allowing developers to create beautiful, accessible educational experiences while maintaining code quality and performance.

For questions or contributions, refer to the implementation files and this documentation. The theme system is designed to grow with your app's needs while maintaining a solid foundation for educational content delivery.
