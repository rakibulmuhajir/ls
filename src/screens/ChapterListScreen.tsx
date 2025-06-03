import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
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
import { useTheme, useThemedStyles } from '@/lib/ThemeContext';

export default function ChapterListScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { bookId } = route.params;
  const { theme } = useTheme();

  const fetcher = React.useCallback(() => getChapters(bookId), [bookId]);
  const { data: chapters, loading, error, refetch } = useFetch(fetcher);

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
      color: theme.colors.secondary,
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    card: {
      backgroundColor: theme.colors.secondaryContainer,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      marginBottom: spacing.sm,
      borderRadius: theme.borderRadius.lg,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.secondary,
      ...createShadow(2),
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.medium,
      color: theme.colors.onSecondaryContainer,
      lineHeight: typography.lineHeight.normal * typography.fontSize.lg,
    },
  }));

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
