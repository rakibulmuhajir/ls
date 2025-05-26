import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getChapters } from '@/lib/api/getChapters';
import { useFetch } from '@/hooks/useFetch';
import Loader from '@/components/Loader';
import {
  brandColors,
  typography,
  spacing,
  screenStyles,
  createShadow
} from '@/lib/designSystem';

export default function ChapterListScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { bookId } = route.params;

  const fetcher = React.useCallback(() => getChapters(bookId), [bookId]);
  const { data: chapters, loading, error, refetch } = useFetch(fetcher);

  return (
    <View style={styles.container}>
      <Loader loading={loading} error={error} onRetry={refetch} />

      {!loading && chapters && (
        <>
          <Text style={styles.heading}>📘 Select a Chapter</Text>
          <FlatList
            data={chapters}
            keyExtractor={(item) => item.chapter_pk.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  navigation.navigate('Topics', {
                    chapterId: item.chapter_pk,
                    bookId: bookId, // Pass bookId forward
                  })
                }
                activeOpacity={0.7}
              >
                <Text style={styles.title}>
                  {item.chapter_number_display}: {item.title}
                </Text>
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
    color: brandColors.secondary.main,
  },
  card: {
    ...screenStyles.listItem,
    backgroundColor: brandColors.secondary.lightest,
    borderLeftColor: brandColors.secondary.main,
  },
  title: {
    ...screenStyles.listItemText,
    color: brandColors.secondary.dark,
  },
});
