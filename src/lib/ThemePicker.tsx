// src/components/ThemePicker.tsx (or your path)

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
// Adjust import path if ThemeContext.tsx is in a different directory
import { useTheme, useThemedStyles, ActiveThemeMode } from '../lib/ThemeContext'; // Assuming ThemeContext.tsx is in lib
// createShadow is accessed via theme.shadows, no direct import needed for styles
// designSystem types might be needed if ThemeOption refers to FullThemeMode
import { Theme as FullThemeType } from '../lib/designSystem'; // For previewColors if they are more extensive

interface ThemeOptionPreview {
  mode: ActiveThemeMode; // Use the active mode
  label: string;
  description: string;
  icon?: string;
  image?: any;
  previewColors: {
    background: string;
    surface: string;
    primary: string;
    text: string;
  };
}

// Theme options configuration - ONLY GREYWOLF FOR NOW
const allThemeOptions: ThemeOptionPreview[] = [
  {
    mode: 'greywolf',
    label: 'Greywolf',
    description: 'Premium educational experience with glassmorphism',
    image: require('../../assets/images/wolf.png'), // Ensure path is correct
    previewColors: { // These should ideally come from greywolfTheme.colors
      background: '#e2e8f0', // baseColors.backgroundSolid from greywolfTheme
      surface: 'rgba(255, 255, 255, 0.75)', // baseColors.surfacePrimary
      primary: '#4299e1', // baseColors.blue
      text: '#1a202c',    // baseColors.textRoot
    },
  },
  // {
  //   mode: 'light',
  //   label: 'Light',
  //   // ... (keep for later)
  // },
  // {
  //   mode: 'dark',
  //   label: 'Dark',
  //   // ... (keep for later)
  // },
  // ... other themes commented out
];

// Filter to only show currently active themes (which is just greywolf for now)
const currentDisplayableThemes = allThemeOptions.filter(option =>
  option.mode === 'greywolf' // Add 'light', 'dark' to this condition when they are re-enabled
);


interface ThemePickerProps {
  onThemeChange?: (theme: ActiveThemeMode) => void;
  showHeader?: boolean;
  compact?: boolean;
}

export const ThemePicker: React.FC<ThemePickerProps> = ({
  onThemeChange,
  showHeader = true,
  compact = false,
}) => {
  const { theme, themeMode, updateTheme } = useTheme();

  const styles = useThemedStyles((currentTheme: FullThemeType) => ({ // Use FullThemeType for styling access
    container: {
      backgroundColor: currentTheme.colors.background,
    },
    header: {
      marginBottom: currentTheme.spacing.lg,
    },
    title: {
      fontSize: currentTheme.typography.fontSize['2xl'],
      fontWeight: currentTheme.typography.fontWeight.bold,
      color: currentTheme.colors.onBackground,
      marginBottom: currentTheme.spacing.xs,
    },
    subtitle: {
      fontSize: currentTheme.typography.fontSize.base,
      color: currentTheme.colors.onSurfaceVariant,
      lineHeight: currentTheme.typography.lineHeight.relaxed * currentTheme.typography.fontSize.base,
    },
    optionsContainer: { // This should be the ScrollView style
      // No direct style, contentContainerStyle will handle padding
    },
    optionsContentContainer: { // For ScrollView's contentContainerStyle
        gap: compact ? currentTheme.spacing.sm : currentTheme.spacing.md,
        paddingBottom: currentTheme.spacing.xl, // Ensure scroll content has padding
    },
    optionCard: {
      backgroundColor: currentTheme.colors.surface,
      borderRadius: currentTheme.borderRadius.xl,
      padding: compact ? currentTheme.spacing.md : currentTheme.spacing.lg,
      borderWidth: 2,
      borderColor: 'transparent', // Or currentTheme.colors.surface for no visual border initially
      ...currentTheme.shadows.sm, // Use themed shadow
    },
    optionCardActive: {
      borderColor: currentTheme.colors.primary,
      backgroundColor: currentTheme.colors.primaryContainer,
      ...currentTheme.shadows.md, // Slightly more pronounced shadow when active
    },
    optionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: currentTheme.spacing.sm,
    },
    optionIconContainer: {
      width: compact ? 32 : 40,
      height: compact ? 32 : 40,
      marginRight: currentTheme.spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    wolfImage: {
      width: compact ? 28 : 36,
      height: compact ? 28 : 36,
      borderRadius: currentTheme.borderRadius.full, // Make it fully circular
    },
    optionLabel: {
      fontSize: compact ? currentTheme.typography.fontSize.lg : currentTheme.typography.fontSize.xl,
      fontWeight: currentTheme.typography.fontWeight.semibold,
      color: currentTheme.colors.onSurface,
      flex: 1,
    },
    greywolfLabel: { // This can be merged with optionLabel and conditional styling
      fontSize: compact ? currentTheme.typography.fontSize.lg : currentTheme.typography.fontSize.xl,
      fontWeight: currentTheme.typography.fontWeight.bold,
      color: currentTheme.colors.primary, // Highlight if it's Greywolf
      flex: 1,
    },
    selectedBadge: {
      backgroundColor: currentTheme.colors.primary,
      paddingHorizontal: currentTheme.spacing.sm,
      paddingVertical: currentTheme.spacing.xs / 2,
      borderRadius: currentTheme.borderRadius.md,
    },
    selectedText: {
      color: currentTheme.colors.onPrimary,
      fontSize: currentTheme.typography.fontSize.xs,
      fontWeight: currentTheme.typography.fontWeight.medium,
    },
    defaultBadge: { // "Default" badge for Greywolf if not selected
      backgroundColor: currentTheme.colors.secondary, // Use secondary or accent for "default"
      paddingHorizontal: currentTheme.spacing.sm,
      paddingVertical: currentTheme.spacing.xs / 2,
      borderRadius: currentTheme.borderRadius.md,
      marginLeft: currentTheme.spacing.xs,
    },
    defaultText: {
      color: currentTheme.colors.onSecondary, // Match defaultBadge background
      fontSize: currentTheme.typography.fontSize.xs,
      fontWeight: currentTheme.typography.fontWeight.medium,
    },
    optionDescription: {
      fontSize: currentTheme.typography.fontSize.sm,
      color: currentTheme.colors.onSurfaceVariant,
      marginBottom: compact ? currentTheme.spacing.sm : currentTheme.spacing.md,
      lineHeight: currentTheme.typography.lineHeight.relaxed * currentTheme.typography.fontSize.sm,
    },
    previewContainer: {
      flexDirection: 'row',
      gap: currentTheme.spacing.xs,
      alignItems: 'center',
    },
    previewLabel: {
      fontSize: currentTheme.typography.fontSize.xs,
      color: currentTheme.colors.onSurfaceVariant,
      marginRight: currentTheme.spacing.sm,
      fontWeight: currentTheme.typography.fontWeight.medium,
    },
    previewDot: {
      width: compact ? 16 : 20,
      height: compact ? 16 : 20,
      borderRadius: currentTheme.borderRadius.full, // Circular
      marginHorizontal: 1,
    },
  }));

  const handleThemeSelect = async (selectedMode: ActiveThemeMode) => {
    try {
      await updateTheme(selectedMode);
      onThemeChange?.(selectedMode);
    } catch (error) {
      Alert.alert('Theme Error', 'Failed to update theme.', [{ text: 'OK' }]);
    }
  };

  const renderThemeOption = (option: ThemeOptionPreview) => {
    const isSelected = themeMode === option.mode;
    const isGreywolfThemeOption = option.mode === 'greywolf';

    return (
      <TouchableOpacity
        key={option.mode}
        style={[styles.optionCard, isSelected && styles.optionCardActive]}
        onPress={() => handleThemeSelect(option.mode)}
        activeOpacity={0.7}
        // ... accessibility props
      >
        <View style={styles.optionHeader}>
          <View style={styles.optionIconContainer}>
            {option.image ? (
              <Image source={option.image} style={styles.wolfImage} resizeMode="cover" />
            ) : (
              <MaterialCommunityIcons name={option.icon as any} size={compact ? 20 : 24} color={isSelected ? theme.colors.primary : theme.colors.onSurface} />
            )}
          </View>
          <Text style={isGreywolfThemeOption ? styles.greywolfLabel : styles.optionLabel}>
            {option.label}
          </Text>
          {isGreywolfThemeOption && !isSelected && ( // Show "DEFAULT" only for Greywolf if it's not active
            <View style={styles.defaultBadge}><Text style={styles.defaultText}>DEFAULT</Text></View>
          )}
          {isSelected && (
            <View style={styles.selectedBadge}><Text style={styles.selectedText}>ACTIVE</Text></View>
          )}
        </View>
        <Text style={styles.optionDescription}>{option.description}</Text>
        <View style={styles.previewContainer}>
          <Text style={styles.previewLabel}>Preview:</Text>
          <View style={[styles.previewDot, { backgroundColor: option.previewColors.background, borderColor: theme.colors.outline, borderWidth: 1 }]} />
          <View style={[styles.previewDot, { backgroundColor: option.previewColors.surface, borderColor: theme.colors.outline, borderWidth: 1 }]} />
          <View style={[styles.previewDot, { backgroundColor: option.previewColors.primary }]} />
          <View style={[styles.previewDot, { backgroundColor: option.previewColors.text }]} />
        </View>
      </TouchableOpacity>
    );
  };

  if (currentDisplayableThemes.length === 0) {
    // This case should ideally not happen if greywolf is always an option
    return <Text>No themes available for selection.</Text>;
  }

  if (currentDisplayableThemes.length === 1 && !showHeader && compact) {
    // If only one theme (Greywolf) and it's compact mode without header,
    // maybe don't show the picker at all or show a simplified message.
    // For now, it will render the single Greywolf card.
  }


  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.title}>Choose Theme</Text>
          <Text style={styles.subtitle}>
            Select a visual theme. Greywolf is our premium default.
          </Text>
        </View>
      )}
      <ScrollView
        // style={styles.optionsContainer} // Apply to contentContainerStyle if it's about spacing between items
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.optionsContentContainer} // Use this for gap and padding
      >
        {currentDisplayableThemes.map(renderThemeOption)}
      </ScrollView>
    </View>
  );
};

// Compact Theme Picker - No changes needed if ThemePicker handles compact correctly
export const CompactThemePicker: React.FC<Omit<ThemePickerProps, 'compact' | 'showHeader'>> = (props) => {
  return <ThemePicker {...props} compact={true} showHeader={false} />;
};


// Theme Toggle Button - Simplified as only one theme is active
export const ThemeToggleButton: React.FC<{
  size?: number;
  onPress?: () => void; // onPress would open the full ThemePicker
}> = ({ size = 24, onPress }) => {
  const { theme } = useTheme(); // themeMode isn't strictly needed here if only one theme

  // Since only greywolf is active, the icon will always be for greywolf
  const iconName = 'wolf'; // Or your preferred icon for Greywolf

  return (
    <TouchableOpacity
      onPress={onPress} // This should likely navigate to a screen with the ThemePicker
      style={{
        padding: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.surfaceVariant, // A subtle background
        ...theme.shadows.xs, // Add a very subtle shadow
      }}
      accessibilityRole="button"
      accessibilityLabel="Change theme"
    >
      <MaterialCommunityIcons
        name={iconName as any} // You might need a custom wolf icon if 'wolf' isn't in MCI
        size={size}
        color={theme.colors.onSurface}
      />
    </TouchableOpacity>
  );
};

export default ThemePicker;
