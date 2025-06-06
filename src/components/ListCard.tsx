// src/components/ListCard.tsx
import React from 'react';
import { View } from 'react-native';
import { useThemedStyles, Theme } from '@/lib/ThemeContext'; // Adjust paths

const ListCard: React.FC<{children: React.ReactNode, style?: object}> = ({ children, style }) => {
  const styles = useThemedStyles((theme: Theme) => ({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      ...theme.shadows.sm,
      marginHorizontal: theme.spacing.sm, // Default inset
      overflow: 'hidden',
    },
  }));
  return <View style={[styles.card, style]}>{children}</View>;
};
export default ListCard;
