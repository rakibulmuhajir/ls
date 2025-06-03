// ============================================
// UPDATED BOTTOM NAVIGATION WITH THEME SUPPORT
// ============================================

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme, useThemedStyles } from '@/lib/ThemeContext';
import { createShadow } from '@/lib/designSystem';

interface Topic {
  topic_pk: number;
  title: string;
}

interface Props {
  topicId: number;
  chapterId: number;
  bookId: number;
  topics: Topic[];
}

export default function BottomNavigationBar({ topicId, chapterId, bookId, topics }: Props) {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();

  const styles = useThemedStyles((theme) => ({
    navigationBar: {
      borderTopWidth: 1,
      borderColor: theme.colors.outlineVariant,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      backgroundColor: theme.colors.navigationBackground,
      ...createShadow(4),
    },
    scrollContent: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: theme.spacing.xs,
    },
    navButton: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      marginHorizontal: theme.spacing.xs / 2,
      borderRadius: theme.borderRadius.lg,
      minHeight: 36,
    },
    enabledButton: {
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
    },
    disabledButton: {
      backgroundColor: theme.colors.surfaceVariant,
      opacity: 0.5,
    },
    navText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      marginHorizontal: theme.spacing.xs / 2,
    },
    enabledText: {
      color: theme.colors.onSurface,
    },
    disabledText: {
      color: theme.colors.onSurfaceVariant,
    },
  }));

  if (!topics || topics.length === 0) {
    return null;
  }

  const topicIndex = topics.findIndex((t) => t.topic_pk === topicId);
  const previousTopic = topics[topicIndex - 1];
  const nextTopic = topics[topicIndex + 1];

  const goToTopic = (targetTopicId: number) => {
    navigation.replace('Content', {
      topicId: targetTopicId,
      chapterId,
      bookId,
      topics,
    });
  };

  return (
    <View style={styles.navigationBar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Previous Button */}
        <TouchableOpacity
          style={[
            styles.navButton,
            !previousTopic && styles.disabledButton,
            previousTopic && styles.enabledButton
          ]}
          onPress={() => previousTopic && goToTopic(previousTopic.topic_pk)}
          disabled={!previousTopic}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={18}
            color={!previousTopic ? theme.colors.onSurfaceVariant : theme.colors.primary}
          />
          <Text style={[
            styles.navText,
            !previousTopic && styles.disabledText,
            previousTopic && styles.enabledText
          ]}>
            Previous
          </Text>
        </TouchableOpacity>

        {/* Next Button */}
        <TouchableOpacity
          style={[
            styles.navButton,
            !nextTopic && styles.disabledButton,
            nextTopic && styles.enabledButton
          ]}
          onPress={() => nextTopic && goToTopic(nextTopic.topic_pk)}
          disabled={!nextTopic}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.navText,
            !nextTopic && styles.disabledText,
            nextTopic && styles.enabledText
          ]}>
            Next
          </Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={18}
            color={!nextTopic ? theme.colors.onSurfaceVariant : theme.colors.primary}
          />
        </TouchableOpacity>

        {/* Topics Button */}
        <TouchableOpacity
          style={[styles.navButton, styles.enabledButton]}
          onPress={() => navigation.navigate('Topics', { chapterId, bookId })}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="format-list-bulleted"
            size={18}
            color={theme.colors.accent}
          />
          <Text style={[styles.navText, { color: theme.colors.accent }]}>Topics</Text>
        </TouchableOpacity>

        {/* Chapters Button */}
        <TouchableOpacity
          style={[styles.navButton, styles.enabledButton]}
          onPress={() => navigation.navigate('Chapters', { bookId })}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="view-list"
            size={18}
            color={theme.colors.secondary}
          />
          <Text style={[styles.navText, { color: theme.colors.secondary }]}>Chapters</Text>
        </TouchableOpacity>

        {/* Books Button */}
        <TouchableOpacity
          style={[styles.navButton, styles.enabledButton]}
          onPress={() => navigation.navigate('Books')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="book-open-page-variant"
            size={18}
            color={theme.colors.primary}
          />
          <Text style={[styles.navText, { color: theme.colors.primary }]}>Books</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
