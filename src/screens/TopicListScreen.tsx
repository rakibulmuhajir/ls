// src/screens/TopicListScreen.tsx

import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../layouts/AppNavigator'; // Adjust path

import { getTopics } from '@/lib/api/getTopics';
import { useFetch } from '@/hooks/useFetch';

// Shared Components
import Loader from '@/components/Loader';
import ScreenWrapper from '@/components/ScreenWrapper';
import ScreenHeader from '@/components/ScreenHeader';
import ListItem from '@/components/ListItem'; // Assuming you created this

// Theme and Design System
import { Theme } from '@/lib/designSystem';
import { useThemedStyles, useTheme } from '@/lib/ThemeContext';

interface Topic {
  topic_pk: number;
  title: string;
}

type TopicNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Topics'>;
type TopicListScreenRouteProp = RouteProp<RootStackParamList, 'Topics'>;

export default function TopicListScreen() {
  const route = useRoute<TopicListScreenRouteProp>();
  const navigation = useNavigation<TopicNavigationProp>();
  const { chapterId, chapterTitle, bookId } = route.params;
  const { theme } = useTheme();

  const fetcher = React.useCallback(() => getTopics(chapterId), [chapterId]);
  const { data: topics, loading, error, refetch } = useFetch<Topic[]>(fetcher);

  const handleTopicPress = (selectedTopic: Topic) => {
    navigation.navigate('Content', {
      topicId: selectedTopic.topic_pk,
      topicTitle: selectedTopic.title,
      chapterId: chapterId,
      bookId: bookId,
      topics: topics || [],
    });
  };

  const styles = useThemedStyles((theme: Theme) => ({
    screenContentContainer: {
      flex: 1,
    },
    listContainerCard: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      ...theme.shadows.sm,
      marginHorizontal: theme.spacing.xs,
      overflow: 'hidden',
    },
    emptyListContainerAsCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      ...theme.shadows.sm,
      marginHorizontal: theme.spacing.xs,
      padding: theme.spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.lg,
      flexGrow: 1,
    },
    emptyListText: {
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
    },
  }));

  const renderTopicItem = ({ item, index }: { item: Topic; index: number }) => (
    <ListItem
      title={item.title}
      isFirstItem={index === 0}
      isLastItem={index === (topics?.length || 0) - 1}
      onPress={() => handleTopicPress(item)}
    />
  );

  return (
    <ScreenWrapper>
      <View style={styles.screenContentContainer}>
        <Loader loading={loading} error={error?.message} onRetry={refetch} overlay={!topics && loading} />

        <ScreenHeader
          title={chapterTitle ? `${chapterTitle}` : "Select Topic"} // Shorter title
          iconName="flask-outline"
          iconColor={theme.colors.secondary}
          style={{ paddingHorizontal: theme.spacing.md }}
        />

        {!loading && !error && topics && topics.length > 0 && (
          <FlatList
            data={topics}
            keyExtractor={(item) => item.topic_pk.toString()}
            renderItem={renderTopicItem}
            showsVerticalScrollIndicator={false}
            style={styles.listContainerCard}
          />
        )}

        {!loading && !error && (!topics || topics.length === 0) && (
          <View style={styles.emptyListContainerAsCard}>
            <Text style={styles.emptyListText}>No topics found for this chapter.</Text>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
}
