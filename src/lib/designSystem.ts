// ============================================
// COMPLETE DESIGN SYSTEM
// ============================================

// 1. BASE COLORS
export const brandColors = {
  primary: {
    main: '#2563eb',
    dark: '#1e40af',
    light: '#3b82f6',
    lighter: '#dbeafe',
    lightest: '#eff6ff',
  },
  secondary: {
    main: '#059669',
    dark: '#047857',
    light: '#10b981',
    lighter: '#d1fae5',
    lightest: '#ecfdf5',
  },
  accent: {
    main: '#7c3aed',
    dark: '#6d28d9',
    light: '#8b5cf6',
    lighter: '#e0e7ff',
    lightest: '#f3f4f6',
  },
  neutral: {
    dark: '#1f2937',
    main: '#6b7280',
    light: '#9ca3af',
    lighter: '#f3f4f6',
    lightest: '#fafafa',
  },
  success: '#10b981',
  warning: '#f59e0b',
  error: '#dc2626',
  background: '#f8fafc',
} as const;

// 2. TYPOGRAPHY
export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
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

// 3. SPACING
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

// 4. LAYOUT
export const layout = {
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  containerPadding: spacing.md,
} as const;

// 5. SHADOW UTILITY
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

// 6. SCREEN-SPECIFIC STYLES
export const screenStyles = {
  // Common container for all screens
  container: {
    flex: 1,
    backgroundColor: brandColors.background,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },

  // Screen headers/titles
  screenHeader: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: brandColors.neutral.dark,
    marginBottom: spacing.lg,
    textAlign: 'center' as const,
  },

  // List items for navigation screens
  listItem: {
    backgroundColor: '#ffffff',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: layout.borderRadius.lg,
    borderLeftWidth: 4,
    ...createShadow(2),
  },

  listItemText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: brandColors.neutral.dark,
    lineHeight: typography.lineHeight.normal * typography.fontSize.lg,
  },

  // Loading and error states
  centeredContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: brandColors.background,
    paddingHorizontal: spacing.lg,
  },

  errorText: {
    fontSize: typography.fontSize.lg,
    color: brandColors.error,
    textAlign: 'center' as const,
    fontWeight: typography.fontWeight.medium,
  },

  emptyText: {
    fontSize: typography.fontSize.lg,
    color: brandColors.neutral.main,
    textAlign: 'center' as const,
    fontWeight: typography.fontWeight.medium,
  },
} as const;

// 7. SECTION STYLING (for ContentScreen)
export const sectionColorPalette = {
  coreDefinition: {
    header: '#1e40af',
    emoji: '🔑'
  },
  explanation: {
    header: '#2563eb',
    emoji: '💡'
  },
  examples: {
    header: '#059669',
    emoji: '🔍'
  },
  analogies: {
    header: '#0d9488',
    emoji: '🧩'
  },
  interactive: {
    header: '#065f46',
    emoji: '🎯'
  },
  exercises: {
    header: '#ea580c',
    emoji: '💪'
  },
  summary: {
    header: '#7c3aed',
    emoji: '📌'
  },
  connections: {
    header: '#6d28d9',
    emoji: '🔗'
  },
  funFacts: {
    header: '#6b7280',
    emoji: '🎉'
  },
  default: {
    header: '#4b5563',
    emoji: '📄'
  }
} as const;

// 8. SECTION MAPPING
const sectionTypeMapping: Record<string, keyof typeof sectionColorPalette> = {
  'CORE_DEFINITION': 'coreDefinition',
  'DEFINITION': 'coreDefinition',
  'EXPLANATION': 'explanation',
  'EXAMPLES': 'examples',
  'ANALOGIES_&_VISUALIZATIONS': 'analogies',
  'ANALOGIES_VISUALIZATIONS': 'analogies',
  'INTERACTIVE_ELEMENTS': 'interactive',
  'EXERCISES': 'exercises',
  'KEY_POINTS_&_SUMMARY': 'summary',
  'KEY_POINTS_SUMMARY': 'summary',
  'SUMMARY': 'summary',
  'CONNECTIONS': 'connections',
  'FUN_FACTS_&_TRIVIA': 'funFacts',
  'FUN_FACTS_TRIVIA': 'funFacts'
};

// 9. SECTION STYLING FUNCTIONS
export const getSectionStyles = (normalizedTitle: string) => {
  const sectionType = sectionTypeMapping[normalizedTitle] || 'default';
  const colorScheme = sectionColorPalette[sectionType];

  return {
    headerBgColor: colorScheme.header,
    headerTextColor: '#ffffff',
    iconEmoji: colorScheme.emoji,
    contentBgColor: '#ffffff',
    contentTextColor: '#374151',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderRadius: 12,
  };
};

export const getContentBackground = (normalizedTitle: string): string => {
  switch (normalizedTitle) {
    case 'KEY_POINTS_&_SUMMARY':
    case 'KEY_POINTS_SUMMARY':
    case 'SUMMARY':
      return '#f8fafc';
    case 'FUN_FACTS_&_TRIVIA':
    case 'FUN_FACTS_TRIVIA':
      return '#fefce8';
    case 'EXERCISES':
      return '#fefdf2';
    default:
      return '#ffffff';
  }
};

// 10. ENHANCED COMPONENT STYLES
export const enhancedComponentStyles = {
  sectionCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    ...createShadow(3),
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 64,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#ffffff',
    flex: 1,
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  sectionContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 12,
  },
  listItem: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 8,
  },
  listBullet: {
    fontSize: 16,
    color: '#6b7280',
    marginRight: 8,
    marginTop: 2,
  },
  listText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    flex: 1,
  },
} as const;
