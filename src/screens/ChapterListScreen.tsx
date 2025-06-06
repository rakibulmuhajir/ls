// src/screens/ChapterListScreen.tsx

import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../layouts/AppNavigator'; // Adjust path

import { getChapters } from '@/lib/api/getChapters';
import { useFetch } from '@/hooks/useFetch';

// Shared Components
import Loader from '@/components/Loader';
import ScreenWrapper from '@/components/ScreenWrapper';
import ScreenHeader from '@/components/ScreenHeader';
import ListItem from '@/components/ListItem'; // Assuming you created this

// Theme and Design System
import { Theme } from '@/lib/designSystem';
import { useThemedStyles, useTheme } from '@/lib/ThemeContext';

interface Chapter {
  chapter_pk: number;
  title: string;
  chapter_number_display: string;
}

type ChapterNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Chapters'>;
type ChapterListScreenRouteProp = RouteProp<RootStackParamList, 'Chapters'>;


export default function ChapterListScreen() {
  const route = useRoute<ChapterListScreenRouteProp>();
  const navigation = useNavigation<ChapterNavigationProp>();
  const { bookId, bookTitle } = route.params;
  const { theme } = useTheme(); // For dynamic values not in useThemedStyles, e.g. iconColor prop

  const fetcher = React.useCallback(() => getChapters(bookId), [bookId]);
  const { data: chapters, loading, error, refetch } = useFetch<Chapter[]>(fetcher);

  const styles = useThemedStyles((theme: Theme) => ({
    screenContentContainer: {
      flex: 1,
    },
    listContainerCard: {
      flex: 1, // Important for FlatList to fill available space
      backgroundColor: theme.colors.surface, // Card background
      borderRadius: theme.borderRadius.xl,
      ...theme.shadows.sm,
      marginHorizontal: theme.spacing.xs, // Slight inset from ScreenWrapper's padding
      overflow: 'hidden', // Clip ListItem separators correctly
    },
    emptyListContainerAsCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      ...theme.shadows.sm,
      marginHorizontal: theme.spacing.xs,
      padding: theme.spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.lg, // Space below header
      flexGrow: 1,
    },
    emptyListText: {
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
    },
  }));

  const renderChapterItem = ({ item, index }: { item: Chapter; index: number }) => (
    <ListItem
      title={item.title}
      number={`${item.chapter_number_display}:`}
      isFirstItem={index === 0} // Pass these for ListItem to handle internal styling if needed (e.g. top/bottom radius of itself)
      isLastItem={index === (chapters?.length || 0) - 1}
      onPress={() =>
        navigation.navigate('Topics', {
          chapterId: item.chapter_pk,
          chapterTitle: item.title,
          bookId: bookId,
        })
      }
    />
  );

  return (
    <ScreenWrapper>
      <View style={styles.screenContentContainer}>
        <Loader loading={loading} error={error?.message} onRetry={refetch} overlay={!chapters && loading} />

        <ScreenHeader
          title={bookTitle ? `${bookTitle}` : "Select Chapter"} // Shorter title
          iconName="book-open-page-variant-outline"
          iconColor={theme.colors.primary}
          style={{ paddingHorizontal: theme.spacing.md }} // Ensure header aligns with ScreenWrapper padding
        />

        {!loading && !error && chapters && chapters.length > 0 && (
          <FlatList
            data={chapters}
            keyExtractor={(item) => item.chapter_pk.toString()}
            renderItem={renderChapterItem}
            showsVerticalScrollIndicator={false}
            style={styles.listContainerCard} // FlatList IS the card
            // contentContainerStyle={{ paddingTop: StyleSheet.hairlineWidth, paddingBottom: StyleSheet.hairlineWidth }} // Optional: if separators look cut off
          />
        )}

        {!loading && !error && (!chapters || chapters.length === 0) && (
          <View style={styles.emptyListContainerAsCard}>
            <Text style={styles.emptyListText}>No chapters found for this book.</Text>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
}
