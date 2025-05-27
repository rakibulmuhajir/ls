import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  brandColors,
  typography,
  spacing,
  layout,
  createShadow
} from '@/lib/designSystem';

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

  //console.log('BottomNavigationBar rendered', { topicId, chapterId, bookId, topics });

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
            color={!previousTopic ? brandColors.neutral.light : brandColors.primary.main}
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
            color={!nextTopic ? brandColors.neutral.light : brandColors.primary.main}
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
            color={brandColors.accent.main}
          />
          <Text style={[styles.navText, { color: brandColors.accent.main }]}>Topics</Text>
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
            color={brandColors.secondary.main}
          />
          <Text style={[styles.navText, { color: brandColors.secondary.main }]}>Chapters</Text>
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
            color={brandColors.primary.main}
          />
          <Text style={[styles.navText, { color: brandColors.primary.main }]}>Books</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  navigationBar: {
    borderTopWidth: 1,
    borderColor: brandColors.neutral.lighter,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: '#ffffff',
    ...createShadow(4),
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginHorizontal: spacing.xs / 2,
    borderRadius: layout.borderRadius.lg,
    minHeight: 36,
  },
  enabledButton: {
    backgroundColor: brandColors.neutral.lightest,
    borderWidth: 1,
    borderColor: brandColors.neutral.lighter,
  },
  disabledButton: {
    backgroundColor: brandColors.neutral.lighter,
    opacity: 0.5,
  },
  navText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginHorizontal: spacing.xs / 2,
  },
  enabledText: {
    color: brandColors.neutral.dark,
  },
  disabledText: {
    color: brandColors.neutral.light,
  },
});
