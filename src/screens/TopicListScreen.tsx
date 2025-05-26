import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
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

export default function TopicListScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { chapterId, bookId } = route.params;

  // Debug logging
  console.log('TopicListScreen params:', route.params);

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

const styles = StyleSheet.create({
  container: {
    ...screenStyles.container,
  },
  heading: {
    ...screenStyles.screenHeader,
    color: brandColors.accent.main,
  },
  card: {
    ...screenStyles.listItem,
    backgroundColor: brandColors.accent.lightest,
    borderLeftColor: brandColors.accent.main,
  },
  title: {
    ...screenStyles.listItemText,
    color: brandColors.accent.dark,
  },
});
