// ============================================
// THEME PICKER COMPONENT
// ============================================

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from './ThemeContext';
import { ThemeMode, createShadow } from './designSystem';

interface ThemeOption {
  mode: ThemeMode;
  label: string;
  description: string;
  icon: string;
  previewColors: {
    background: string;
    surface: string;
    primary: string;
    text: string;
  };
}

// Theme options configuration
const themeOptions: ThemeOption[] = [
  {
    mode: 'light',
    label: 'Light',
    description: 'Clean and bright for daytime study',
    icon: 'white-balance-sunny',
    previewColors: {
      background: '#ffffff',
      surface: '#f8fafc',
      primary: '#4A90E2',
      text: '#18181b',
    },
  },
  {
    mode: 'dark',
    label: 'Dark',
    description: 'Easy on the eyes for night sessions',
    icon: 'moon-waning-crescent',
    previewColors: {
      background: '#282a36',
      surface: '#44475a',
      primary: '#bd93f9',
      text: '#f8f8f2',
    },
  },
  {
    mode: 'sepia',
    label: 'Book Pages',
    description: 'Warm paper-like reading experience',
    icon: 'book-open-page-variant',
    previewColors: {
      background: '#F1E7D0',
      surface: '#EBD5B3',
      primary: '#8b7355',
      text: '#5F5F54',
    },
  },
  {
    mode: 'highContrast',
    label: 'High Contrast',
    description: 'Maximum readability and accessibility',
    icon: 'contrast-circle',
    previewColors: {
      background: '#ffffff',
      surface: '#f8f9fa',
      primary: '#0d47a1',
      text: '#000000',
    },
  },
  {
    mode: 'system',
    label: 'System',
    description: 'Follow your device preference',
    icon: 'phone-settings',
    previewColors: {
      background: '#f5f5f5',
      surface: '#ffffff',
      primary: '#666666',
      text: '#333333',
    },
  },
];

interface ThemePickerProps {
  onThemeChange?: (theme: ThemeMode) => void;
  showHeader?: boolean;
  compact?: boolean;
}

export const ThemePicker: React.FC<ThemePickerProps> = ({
  onThemeChange,
  showHeader = true,
  compact = false,
}) => {
  const { theme, themeMode, updateTheme } = useTheme();

  const styles = useThemedStyles((theme) => ({
    container: {
      backgroundColor: theme.colors.background,
    },
    header: {
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.onBackground,
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.onSurfaceVariant,
      lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
    },
    optionsContainer: {
      gap: compact ? theme.spacing.sm : theme.spacing.md,
    },
    optionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: compact ? theme.spacing.md : theme.spacing.lg,
      borderWidth: 2,
      borderColor: 'transparent',
      ...createShadow(2),
    },
    optionCardActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryContainer,
      ...createShadow(4),
    },
    optionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    optionIcon: {
      marginRight: theme.spacing.md,
    },
    optionLabel: {
      fontSize: compact ? theme.typography.fontSize.lg : theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.onSurface,
      flex: 1,
    },
    selectedBadge: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs / 2,
      borderRadius: theme.borderRadius.md,
    },
    selectedText: {
      color: theme.colors.onPrimary,
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.medium,
    },
    optionDescription: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.onSurfaceVariant,
      marginBottom: compact ? theme.spacing.sm : theme.spacing.md,
      lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
    },
    previewContainer: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
      alignItems: 'center',
    },
    previewLabel: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.onSurfaceVariant,
      marginRight: theme.spacing.sm,
      fontWeight: theme.typography.fontWeight.medium,
    },
    previewDot: {
      width: compact ? 16 : 20,
      height: compact ? 16 : 20,
      borderRadius: compact ? 8 : 10,
      marginHorizontal: 1,
    },
  }));

  const handleThemeSelect = async (selectedMode: ThemeMode) => {
    try {
      await updateTheme(selectedMode);
      onThemeChange?.(selectedMode);
    } catch (error) {
      Alert.alert(
        'Theme Error',
        'Failed to update theme. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const renderThemeOption = (option: ThemeOption) => {
    const isSelected = themeMode === option.mode;

    return (
      <TouchableOpacity
        key={option.mode}
        style={[
          styles.optionCard,
          isSelected && styles.optionCardActive,
        ]}
        onPress={() => handleThemeSelect(option.mode)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${option.label} theme`}
        accessibilityHint={option.description}
        accessibilityState={{ selected: isSelected }}
      >
        {/* Option Header */}
        <View style={styles.optionHeader}>
          <MaterialCommunityIcons
            name={option.icon as any}
            size={compact ? 20 : 24}
            color={isSelected ? theme.colors.primary : theme.colors.onSurface}
            style={styles.optionIcon}
          />
          <Text style={styles.optionLabel}>{option.label}</Text>
          {isSelected && (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedText}>ACTIVE</Text>
            </View>
          )}
        </View>

        {/* Description */}
        <Text style={styles.optionDescription}>
          {option.description}
        </Text>

        {/* Color Preview */}
        <View style={styles.previewContainer}>
          <Text style={styles.previewLabel}>Preview:</Text>
          <View
            style={[
              styles.previewDot,
              { backgroundColor: option.previewColors.background },
              { borderWidth: 1, borderColor: theme.colors.outline }
            ]}
          />
          <View
            style={[
              styles.previewDot,
              { backgroundColor: option.previewColors.surface },
              { borderWidth: 1, borderColor: theme.colors.outline }
            ]}
          />
          <View
            style={[
              styles.previewDot,
              { backgroundColor: option.previewColors.primary }
            ]}
          />
          <View
            style={[
              styles.previewDot,
              { backgroundColor: option.previewColors.text }
            ]}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.title}>Choose Theme</Text>
          <Text style={styles.subtitle}>
            Select a visual theme that's comfortable for your learning style.
            Your choice will be saved for future sessions.
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.optionsContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
      >
        {themeOptions.map(renderThemeOption)}
      </ScrollView>
    </View>
  );
};

// Compact theme selector for settings/navigation
export const CompactThemePicker: React.FC<Omit<ThemePickerProps, 'compact'>> = (props) => {
  return <ThemePicker {...props} compact={true} showHeader={false} />;
};

// Quick theme toggle button (for navigation bars)
export const ThemeToggleButton: React.FC<{
  size?: number;
  onPress?: () => void;
}> = ({ size = 24, onPress }) => {
  const { theme, themeMode } = useTheme();

  const getIconName = () => {
    switch (themeMode) {
      case 'light': return 'white-balance-sunny';
      case 'dark': return 'moon-waning-crescent';
      case 'sepia': return 'book-open-page-variant';
      case 'highContrast': return 'contrast-circle';
      case 'system': return 'phone-settings';
      default: return 'palette';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        padding: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.surfaceVariant,
      }}
      accessibilityRole="button"
      accessibilityLabel="Change theme"
      accessibilityHint="Opens theme selection"
    >
      <MaterialCommunityIcons
        name={getIconName() as any}
        size={size}
        color={theme.colors.onSurface}
      />
    </TouchableOpacity>
  );
};

export default ThemePicker;
