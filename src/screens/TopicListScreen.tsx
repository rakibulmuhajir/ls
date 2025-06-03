import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getTopics } from '@/lib/api/getTopics';
import { useFetch } from '@/hooks/useFetch';
import Loader from '@/components/Loader';
import {
  brandColors,
  typography,
  spacing,
  screenStyles,
  createShadow
} from '@/lib/designSystem';
import { useTheme, useThemedStyles } from '@/lib/ThemeContext';

export default function TopicListScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { chapterId, bookId } = route.params;
  const { theme } = useTheme();

  // Debug logging
  //console.log('TopicListScreen params:', route.params);

  const fetcher = React.useCallback(() => getTopics(chapterId), [chapterId]);
  const { data: topics, loading, error, refetch } = useFetch(fetcher);

  const handleTopicPress = (selectedTopic: any) => {
    console.log('Navigating to Content with:', {
      topicId: selectedTopic.topic_pk,
      chapterId,
      bookId,
      topics: topics?.length || 0
    });

    navigation.navigate('Content', {
      topicId: selectedTopic.topic_pk,
      chapterId: chapterId,
      bookId: bookId,
      topics: topics || []
    });
  };

  const styles = useThemedStyles((theme) => ({
    container: {
      flexGrow: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.lg,
    },
    heading: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.accent,
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    card: {
      backgroundColor: theme.colors.accentContainer,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      marginBottom: spacing.sm,
      borderRadius: theme.borderRadius.lg,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.accent,
      ...createShadow(2),
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.medium,
      color: theme.colors.onAccentContainer,
      lineHeight: typography.lineHeight.normal * typography.fontSize.lg,
    },
  }));

  return (
    <View style={styles.container}>
      <Loader loading={loading} error={error} onRetry={refetch} />

      {!loading && topics && (
        <>
          <Text style={styles.heading}>🧪 Select a Topic</Text>
          <FlatList
            data={topics}
            keyExtractor={(item) => item.topic_pk.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => handleTopicPress(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.title}>{item.title}</Text>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  );
}
