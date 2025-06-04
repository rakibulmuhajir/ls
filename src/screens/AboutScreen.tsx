import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  Dimensions,
  TouchableOpacity,
  Linking,
  Image
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  brandColors,
  typography,
  spacing,
  screenStyles,
  createShadow
} from '@/lib/designSystem';
import { useTheme, useThemedStyles } from '@/lib/ThemeContext';

interface TeamMember {
  name: string;
  role: string;
  icon: string;
  description: string;
  avatar: any;
  emoji: string;
}

interface AppStat {
  label: string;
  value: string;
  icon: string;
  color: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Banna",
    role: "Chief Vision Architect",
    description: "Always dreaming up the next big feature (sometimes too big).",
    icon: "lightbulb-on-outline",
    avatar: require("../../assets/images/avatars/avatar_young.png"), // Replace with actual path
    emoji: "🤔",
  },
  {
    name: "T2",
    role: "The Nitpick Knight",
    description: "Zoomed in to 500% just to fix a one-pixel misalignment. Worth it?",
    icon: "magnify-scan",
    avatar: require("../../assets/images/avatars/avatar_funny.png"), // Replace with actual path
    emoji: "🧐",
  },
  {
    name: "Bantoo",
    role: "Chief Overthinker & Button Color Strategist",
    description: "Spent 3 days picking the perfect shade of blue. Still not happy.",
    icon: "palette-outline",
    avatar: require("../../assets/images/avatars/avatar_angry.png"), // Replace with actual path
    emoji: "🎨",
  },
  {
    name: "Jawwi",
    role: "QA Department",
    description: "Randomly taps until something breaks. Legendary bug finder.",
    icon: "baby-face-outline",
    avatar: require("../../assets/images/avatars/avatar_kid.png"), // Replace or skip if none
    emoji: "🧪",
  },
];

export default function AboutScreen() {
  const { theme } = useTheme();
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;
  const cardAnimations = useRef([...Array(6)].map(() => new Animated.Value(0))).current;

  const inspirationalQuotes = [
    "Seek knowledge from the cradle to the grave. - Prophet Muhammad (PBUH)",
    "Learning is the only thing the mind never exhausts, never fears, and never regrets. - Leonardo da Vinci",
    "Education is the passport to the future, for tomorrow belongs to those who prepare for it today. - Malcolm X",
    "The beautiful thing about learning is that no one can take it away from you. - B.B. King",
    "Live as if you were to die tomorrow. Learn as if you were to live forever. - Mahatma Gandhi"
  ];

  const appStats: AppStat[] = [
    { label: "Books", value: "1+", icon: "book-open-page-variant", color: theme.colors.primary },
    { label: "Chapters", value: "13+", icon: "view-list", color: theme.colors.secondary },
    { label: "Topics", value: "80+", icon: "format-list-bulleted", color: theme.colors.accent },
    { label: "Students", value: "Growing", icon: "account-group", color: brandColors.warning.main }
  ];

  const styles = useThemedStyles((theme) => ({
    container: {
      flexGrow: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.lg,
    },
    heroSection: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
      marginBottom: spacing.lg,
    },
    logoContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: `${theme.colors.primary}10`,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
      ...createShadow(4),
    },
    appName: {
      fontSize: typography.fontSize['3xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.primary,
      marginBottom: spacing.xs,
    },
    appIconContainer: {
      position: 'absolute',
      top: 20,
      left: 20,
      width: 80,
      height: 80,
      justifyContent: 'center',
      alignItems: 'center',
    },
    appIcon: {
      width: 70,
      height: 70,
      borderRadius: theme.borderRadius.md,
    },
    appTagline: {
      fontSize: typography.fontSize.lg,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      marginBottom: spacing.xs,
      fontStyle: 'italic',
    },
    version: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.onSurfaceVariant,
      backgroundColor: theme.colors.surfaceVariant,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs / 2,
      borderRadius: theme.borderRadius.md,
    },
    quoteSection: {
      backgroundColor: `${theme.colors.accent}08`,
      borderRadius: theme.borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.xl,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
    },
    quote: {
      fontSize: typography.fontSize.md,
      color: theme.colors.onSurface,
      textAlign: 'center',
      lineHeight: typography.fontSize.md * 1.5,
      fontStyle: 'italic',
      marginHorizontal: spacing.sm,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.onBackground,
      marginBottom: spacing.md,
    },
    statsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    statCard: {
      width: '48%',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: spacing.md,
      alignItems: 'center',
      marginBottom: spacing.sm,
      ...createShadow(2),
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
    },
    statIconContainer: {
      width: 48,
      height: 48,
      borderRadius: theme.borderRadius.lg,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    statValue: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.onSurface,
      marginBottom: spacing.xs / 2,
    },
    statLabel: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
    },
    missionCard: {
      backgroundColor: theme.colors.primaryContainer,
      borderRadius: theme.borderRadius.lg,
      padding: spacing.lg,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    missionText: {
      fontSize: typography.fontSize.md,
      color: theme.colors.onPrimaryContainer,
      lineHeight: typography.fontSize.md * 1.6,
    },
    teamCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
      ...createShadow(2),
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
    },
    teamHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    teamAvatarContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: `${theme.colors.primary}10`,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.sm,
      overflow: 'hidden',
      position: 'relative',
    },
    teamAvatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
    },
    teamEmoji: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      backgroundColor: theme.colors.surface,
      borderRadius: 10,
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.outline,
    },
    teamEmojiText: {
      fontSize: 10,
    },
    teamInfo: {
      flex: 1,
    },
    teamName: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.onSurface,
      marginBottom: spacing.xs / 2,
    },
    teamRole: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.primary,
      fontWeight: typography.fontWeight.medium,
    },
    teamDescription: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.onSurfaceVariant,
      lineHeight: typography.fontSize.sm * 1.4,
    },
    contactCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: spacing.md,
      ...createShadow(2),
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
    },
    contactItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    contactText: {
      fontSize: typography.fontSize.md,
      color: theme.colors.onSurface,
      marginLeft: spacing.sm,
    },
    footer: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
      marginTop: spacing.lg,
    },
    footerText: {
      fontSize: typography.fontSize.base,
      color: theme.colors.onBackground,
      fontWeight: typography.fontWeight.medium,
      marginBottom: spacing.xs,
    },
    footerSubtext: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.onSurfaceVariant,
    },
  }));

  useEffect(() => {
    // Logo rotation animation
    const rotateLoop = () => {
      Animated.loop(
        Animated.timing(logoRotateAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        })
      ).start();
    };
    rotateLoop();

    // Stagger card animations
    const animateCards = () => {
      const animations = cardAnimations.map((anim, index) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 600,
          delay: index * 150,
          useNativeDriver: true,
        })
      );
      Animated.stagger(100, animations).start();
    };
    animateCards();

    // Quote rotation
    const quoteInterval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start();

      setCurrentQuoteIndex((prev) => (prev + 1) % inspirationalQuotes.length);
    }, 4000);

    return () => clearInterval(quoteInterval);
  }, []);

  const handleLogoPress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
  };

  const StatCard = ({ stat, index }: { stat: AppStat; index: number }) => {
    const cardAnim = cardAnimations[index] || new Animated.Value(1);

    return (
      <Animated.View
        style={[
          styles.statCard,
          {
            opacity: cardAnim,
            transform: [
              {
                translateY: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}15` }]}>
          <MaterialCommunityIcons name={stat.icon as any} size={24} color={stat.color} />
        </View>
        <Text style={styles.statValue}>{stat.value}</Text>
        <Text style={styles.statLabel}>{stat.label}</Text>
      </Animated.View>
    );
  };

  const TeamCard = ({ member, index }: { member: TeamMember; index: number }) => {
    const cardAnim = cardAnimations[index + 3] || new Animated.Value(1);

    return (
      <Animated.View
        style={[
          styles.teamCard,
          {
            opacity: cardAnim,
            transform: [
              {
                scale: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.teamHeader}>
          <View style={styles.teamAvatarContainer}>
            <Image source={member.avatar} style={styles.teamAvatar} />
            <View style={styles.teamEmoji}>
              <Text style={styles.teamEmojiText}>{member.emoji}</Text>
            </View>
          </View>
          <View style={styles.teamInfo}>
            <Text style={styles.teamName}>{member.name}</Text>
            <Text style={styles.teamRole}>{member.role}</Text>
          </View>
        </View>
        <Text style={styles.teamDescription}>{member.description}</Text>
      </Animated.View>
    );
  };

  const logoRotation = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <TouchableOpacity onPress={handleLogoPress} activeOpacity={0.8}>
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [{ rotate: logoRotation }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.appIconContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Image
              source={require('../../assets/icon.png')}
              style={styles.appIcon}
            />
          </Animated.View>
        </TouchableOpacity>

        <Text style={styles.appName}>LearnSpark</Text>
        <Text style={styles.appTagline}>The Future of Learning is Here.</Text>
        <Text style={styles.version}>Version 2.1.5</Text>
      </View>

      {/* Quote Section */}
      <View style={styles.quoteSection}>
        <MaterialCommunityIcons
          name="format-quote-open"
          size={24}
          color={theme.colors.accent}
        />
        <Animated.Text
          style={[styles.quote, { opacity: fadeAnim }]}
        >
          {inspirationalQuotes[currentQuoteIndex]}
        </Animated.Text>
        <MaterialCommunityIcons
          name="format-quote-close"
          size={24}
          color={theme.colors.accent}
        />
      </View>

      {/* Stats Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 At a Glance</Text>
        <View style={styles.statsContainer}>
          {appStats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </View>
      </View>

      {/* Mission Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Our Mission</Text>
        <View style={styles.missionCard}>
          <Text style={styles.missionText}>
            To democratize quality education by creating engaging, accessible, and comprehensive
            learning experiences for students across Pakistan. We believe every student deserves
            access to world-class educational content, regardless of their location or background.
          </Text>
        </View>
      </View>

      {/* Team Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👥 Our Team</Text>
        {teamMembers.map((member, index) => (
          <TeamCard key={index} member={member} index={index} />
        ))}
      </View>

      {/* Contact & Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💬 Get in Touch</Text>
        <View style={styles.contactCard}>
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => Linking.openURL('whatsapp://send?phone=923020403456&text=I want to give feedback about LearnSpark app')}
          >
            <MaterialCommunityIcons name="whatsapp" size={20} color="#25D366" />
            <Text style={styles.contactText}>WhatsApp Support</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Made with ❤️ in Pakistan by Ferasa Ai
        </Text>
        <Text style={styles.footerSubtext}>
          © 2025 LearnSpark by Ferasa Ai. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
}
