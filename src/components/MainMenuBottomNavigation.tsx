// ============================================
// UPDATED MAIN MENU NAVIGATION WITH THEME SUPPORT
// ============================================

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme, useThemedStyles } from '@/lib/ThemeContext';
import { ThemePicker } from '@/lib/ThemePicker';
import { createShadow } from '@/lib/designSystem';


interface Props {
  hasUpdates?: boolean; // Badge indicator for available updates
}

export default function MainMenuBottomNavigation({ hasUpdates = false }: Props) {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const [showThemePicker, setShowThemePicker] = useState(false);

  const styles = useThemedStyles((theme) => ({
    navigationBar: {
      borderTopWidth: 1,
      borderColor: theme.colors.outlineVariant,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      backgroundColor: theme.colors.navigationBackground,
      ...createShadow(4),
    },
    buttonsContainer: {
      flexDirection: 'row' as const,
      justifyContent: 'space-around' as const,
      alignItems: 'center' as const,
    },
    navButton: {
      alignItems: 'center' as const,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      minHeight: 56,
      justifyContent: 'center' as const,
      flex: 1,
      marginHorizontal: theme.spacing.xs / 2,
    },
    iconContainer: {
      position: 'relative' as const,
      marginBottom: theme.spacing.xs / 2,
    },
    navText: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.medium,
      textAlign: 'center' as const,
      lineHeight: theme.typography.fontSize.xs * 1.2,
    },
    badge: {
      position: 'absolute' as const,
      top: -4,
      right: -4,
      backgroundColor: theme.colors.error,
      borderRadius: 8,
      width: 16,
      height: 16,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      borderWidth: 2,
      borderColor: theme.colors.navigationBackground,
    },
    badgeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.onError || '#ffffff',
    },
    // Theme picker modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      margin: theme.spacing.lg,
      maxHeight: '80%',
      width: '90%',
      ...createShadow(8),
    },
    modalHeader: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: theme.spacing.lg,
    },
    modalTitle: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.onSurface,
    },
    closeButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surfaceVariant,
    },
  }));

  const navigationItems = [
    {
      id: 'updates',
      label: 'Check for Updates',
      icon: 'refresh',
      color: theme.colors.primary,
      onPress: () => navigation.navigate('Updates'),
      showBadge: hasUpdates,
    },
    {
      id: 'about',
      label: 'About',
      icon: 'information',
      color: theme.colors.secondary,
      onPress: () => navigation.navigate('About'),
      showBadge: false,
    },
    {
      id: 'features',
      label: 'Features',
      icon: 'clipboard-list', // 📋 Clipboard list icon for features
      color: theme.colors.accent,
      onPress: () => navigation.navigate('Features'),
      showBadge: false,
    },
    {
      id: 'lab',
      label: 'Lab',
      icon: 'flask',                           // 🧪 Flask icon for chemistry lab
      color: theme.colors.accent,              // Uses your theme accent color
      onPress: () => navigation.navigate('LabExperiment'),  // Navigates to lab screen
      showBadge: false,
    },
    {
      id: 'theme',
      label: 'Theme',
      icon: 'palette',
      color: theme.colors.primary,
      onPress: () => setShowThemePicker(true),
      showBadge: false,
    },
  ];

  const handleThemeChange = () => {
    setShowThemePicker(false);
    // Optional: Show a toast or feedback about theme change
  };

  return (
    <>
      <View style={styles.navigationBar}>
        <View style={styles.buttonsContainer}>
          {navigationItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.navButton}
              onPress={item.onPress}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityHint={item.id === 'theme' ? 'Opens theme selection' : undefined}
            >
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={20}
                  color={item.color}
                />
                {item.showBadge && (
                  <View style={styles.badge}>
                    <View style={styles.badgeDot} />
                  </View>
                )}
              </View>
              <Text style={[styles.navText, { color: item.color }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Theme Picker Modal */}
      <Modal
        visible={showThemePicker}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setShowThemePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Theme</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowThemePicker(false)}
                accessibilityRole="button"
                accessibilityLabel="Close theme picker"
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={theme.colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            </View>

            <ThemePicker
              onThemeChange={handleThemeChange}
              showHeader={false}
              compact={true}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
