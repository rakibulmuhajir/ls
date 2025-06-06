// src/components/ListItem.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '@/lib/designSystem';
import { useThemedStyles } from '@/lib/ThemeContext';

interface ListItemProps {
  title: string;
  number?: string; // Optional, for chapter numbers
  onPress: () => void;
  isLastItem?: boolean;
}

const ListItem: React.FC<ListItemProps> = ({ title, number, onPress, isLastItem }) => {
  const styles = useThemedStyles((theme: Theme) => ({
    touchable: {
        // No specific style here, handled by inner View
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      backgroundColor: 'transparent', // Assumes it's on a card surface
    },
    separator: {
      borderBottomWidth: StyleSheet.hairlineWidth, // Use StyleSheet.hairlineWidth for the thinnest possible line
      borderBottomColor: theme.colors.outlineVariant,
      marginLeft: number ? theme.spacing.lg + theme.spacing.md + (theme.spacing.sm * 2) : theme.spacing.lg, // Indent past number/icon
    },
    content: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    numberText: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.primary,
      marginRight: theme.spacing.sm,
      minWidth: 25,
    },
    titleText: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.onSurface,
      flexShrink: 1,
    },
    chevron: {
      marginLeft: theme.spacing.sm,
      color: theme.colors.onSurfaceVariant,
    },
  }));

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.touchable}>
        <View style={[styles.container, !isLastItem && styles.separator]}>
            <View style={styles.content}>
                {number && <Text style={styles.numberText}>{number}</Text>}
                <Text style={styles.titleText} numberOfLines={2}>{title}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} style={styles.chevron} />
        </View>
    </TouchableOpacity>
  );
};
export default ListItem;
