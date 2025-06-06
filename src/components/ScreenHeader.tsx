// src/components/ScreenHeader.tsx

import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '@/lib/designSystem'; // Adjust path as needed
import { useThemedStyles } from '@/lib/ThemeContext'; // Adjust path as needed

interface ScreenHeaderProps {
  title: string;
  iconName: string;
  iconColor?: string;
  style?: ViewStyle | ViewStyle[];
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, iconName, iconColor, style }) => {
  const styles = useThemedStyles((theme: Theme) => ({ // theme object is available here
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.lg,
      // Horizontal padding is now handled by ScreenWrapper globally
      // For specific alignment within ScreenWrapper's padding, the parent can pass style
      // or this component can add its own internal padding if needed (e.g. paddingHorizontal: theme.spacing.md)
      // If ScreenWrapper has paddingHorizontal: theme.spacing.md, this component's content will align correctly.
    },
    icon: {
      marginRight: theme.spacing.md,
      color: iconColor || theme.colors.primary,
    },
    text: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.onBackground,
    },
    // Storing iconSize in styles to access theme.typography
    iconSizeStyle: {
      size: theme.typography.fontSize['2xl'] * 1.1, // Calculate size using theme
    }
  }));

  const combinedStyle = [styles.container, style].filter(Boolean);

  return (
    <View style={combinedStyle}>
      <MaterialCommunityIcons
        name={iconName as any}
        size={styles.iconSizeStyle.size} // Use the calculated size from styles
        style={styles.icon}
      />
      <Text style={styles.text}>{title}</Text>
    </View>
  );
};

export default ScreenHeader;
