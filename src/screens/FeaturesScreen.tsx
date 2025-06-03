import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  brandColors,
  typography,
  spacing,
  screenStyles,
  createShadow
} from '@/lib/designSystem';
import { useTheme, useThemedStyles } from '@/lib/ThemeContext';

interface Feature {
  title: string;
  description: string;
  icon?: string; // Optional icon for individual features
}

interface FeaturesData {
  live: Feature[];
  planned: Feature[];
  experimental: Feature[];
  vision: Feature[];
}

export default function FeaturesScreen() {
  const { theme } = useTheme();
  const [featuresData, setFeaturesData] = useState<FeaturesData | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load features from JSON file
    const loadFeatures = async () => {
      try {
        const featuresJson = require('@/data/features.json');
        setFeaturesData(featuresJson);
      } catch (error) {
        console.error('Error loading features:', error);
      }
    };

    loadFeatures();
  }, []);

  const categoryConfig = {
    live: {
      title: 'Live Features',
      emoji: '🚀',
      icon: 'check-circle',
      color: theme.colors.success,
      description: 'Features currently available in the app'
    },
    planned: {
      title: 'Coming Soon',
      emoji: '🛠️',
      icon: 'clock-outline',
      color: theme.colors.primary,
      description: 'Features in active development'
    },
    experimental: {
      title: 'In Testing',
      emoji: '🧪',
      icon: 'flask',
      color: theme.colors.warning,
      description: 'Features being researched and tested'
    },
    vision: {
      title: 'Future Vision',
      emoji: '🔮',
      icon: 'lightbulb-outline',
      color: theme.colors.accent,
      description: 'Ambitious features for long-term roadmap'
    }
  };

  const toggleExpanded = (itemKey: string) => {
    const newExpandedItems = new Set(expandedItems);
    if (newExpandedItems.has(itemKey)) {
      newExpandedItems.delete(itemKey);
    } else {
      newExpandedItems.add(itemKey);
    }
    setExpandedItems(newExpandedItems);
  };

  const styles = useThemedStyles((theme) => ({
    container: {
      flexGrow: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.lg,
    },
    loading: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: typography.fontSize.lg,
      color: theme.colors.onSurfaceVariant,
    },
    heading: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.accent,
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionHeader: {
      marginBottom: spacing.md,
    },
    sectionTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    sectionIconContainer: {
      width: 48,
      height: 48,
      borderRadius: theme.borderRadius.lg,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.sm,
    },
    sectionInfo: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.onBackground,
      marginBottom: spacing.xs / 2,
    },
    sectionDescription: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.onSurfaceVariant,
    },
    featureCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      marginBottom: spacing.sm,
      ...createShadow(2),
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      overflow: 'hidden',
    },
    featureHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.md,
    },
    featureTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    featureIcon: {
      marginRight: spacing.xs,
    },
    featureTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.colors.onSurface,
    },
    featureDescription: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.outlineVariant,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: theme.colors.surfaceVariant,
    },
    descriptionText: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.onSurfaceVariant,
      lineHeight: typography.fontSize.sm * 1.4,
    },
    footer: {
      backgroundColor: theme.colors.accentContainer,
      borderRadius: theme.borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.xl,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
    },
    footerText: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.onAccentContainer,
      textAlign: 'center',
      fontStyle: 'italic',
    },
  }));

  const FeatureCard = ({
    feature,
    categoryKey,
    index
  }: {
    feature: Feature;
    categoryKey: string;
    index: number;
  }) => {
    const itemKey = `${categoryKey}-${index}`;
    const isExpanded = expandedItems.has(itemKey);
    const categoryInfo = categoryConfig[categoryKey as keyof typeof categoryConfig];

    return (
      <View style={styles.featureCard}>
        <TouchableOpacity
          style={styles.featureHeader}
          onPress={() => toggleExpanded(itemKey)}
          activeOpacity={0.7}
        >
          <View style={styles.featureTitleContainer}>
            {feature.icon && (
              <MaterialCommunityIcons
                name={feature.icon as any}
                size={20}
                color={categoryInfo.color}
                style={styles.featureIcon}
              />
            )}
            <Text style={styles.featureTitle}>{feature.title}</Text>
          </View>
          <MaterialCommunityIcons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={theme.colors.onSurfaceVariant}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.featureDescription}>
            <Text style={styles.descriptionText}>{feature.description}</Text>
          </View>
        )}
      </View>
    );
  };

  const FeatureSection = ({
    categoryKey,
    features
  }: {
    categoryKey: string;
    features: Feature[];
  }) => {
    const config = categoryConfig[categoryKey as keyof typeof categoryConfig];

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <View style={[styles.sectionIconContainer, { backgroundColor: `${config.color}15` }]}>
              <MaterialCommunityIcons
                name={config.icon as any}
                size={24}
                color={config.color}
              />
            </View>
            <View style={styles.sectionInfo}>
              <Text style={styles.sectionTitle}>{config.emoji} {config.title}</Text>
              <Text style={styles.sectionDescription}>{config.description}</Text>
            </View>
          </View>
        </View>

        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            feature={feature}
            categoryKey={categoryKey}
            index={index}
          />
        ))}
      </View>
    );
  };

  if (!featuresData) {
    return (
      <View style={[styles.container, styles.loading]}>
        <Text style={styles.loadingText}>Loading features...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>✨ Features & Roadmap</Text>

      {Object.entries(featuresData).map(([categoryKey, features]) => (
        <FeatureSection
          key={categoryKey}
          categoryKey={categoryKey}
          features={features}
        />
      ))}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Have suggestions? We'd love to hear your ideas for new features!
        </Text>
      </View>
    </ScrollView>
  );
}
