import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../layouts/AppNavigator';
import { useFetch } from '@/hooks/useFetch';
import Loader from '@/components/Loader';
import MainMenuBottomNavigation from '@/components/MainMenuBottomNavigation';
import { getBooks } from '@/lib/api/getBooks';
import {
  brandColors,
  typography,
  spacing,
  screenStyles,
  createShadow
} from '@/lib/designSystem';
import { useTheme, useThemedStyles } from '@/lib/ThemeContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Books'>;

export default function BookListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  const { data: books, loading, error, refetch } = useFetch(getBooks);

  // You can add logic here to check for updates
  // For now, setting to false - replace with your update check logic
  const hasUpdates = false;

  const screenWidth = Dimensions.get('window').width;
  const itemWidth = (screenWidth - spacing.lg * 3) / 2; // 2 columns with spacing

  // Helper function to get book cover image
  const getBookCoverImage = (coverImage: string | null) => {
    // Static mapping of cover images since React Native requires static imports
    const bookCovers: { [key: string]: any } = {
      'IX-chem-25-26-PCTB.jpg': require('../../assets/images/books/IX-chem-25-26-PCTB.jpg'),
      'default-book-cover.jpg': require('../../assets/images/books/default-cover.svg'),
      // Add more books here as you add them:
      // 'X-physics-25-26-PCTB.jpg': require('@/assets/images/books/X-physics-25-26-PCTB.jpg'),
    };

    if (!coverImage || !bookCovers[coverImage]) {
      return bookCovers['default-book-cover.jpg'];
    }

    return bookCovers[coverImage];
  };

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.lg,
    },
    heading: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.primary,
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    gridContainer: {
      paddingBottom: spacing.lg,
    },
    row: {
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    bookCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: spacing.sm,
      ...createShadow(3),
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
    },
    imageContainer: {
      width: '100%',
      height: 180, // Increased for better 3:4 aspect ratio visibility
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
      backgroundColor: theme.colors.surfaceVariant,
      marginBottom: spacing.sm,
    },
    bookImage: {
      width: '100%',
      height: '100%',
    },
    bookInfo: {
      alignItems: 'center',
      paddingHorizontal: spacing.xs,
    },
    bookTitle: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.onSurface,
      textAlign: 'center',
      marginBottom: spacing.xs,
      lineHeight: typography.fontSize.md * 1.3,
    },
    bookAuthor: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      marginBottom: spacing.xs / 2,
      fontStyle: 'italic',
    },
    bookGrade: {
      fontSize: typography.fontSize.xs,
      color: theme.colors.accent,
      fontWeight: typography.fontWeight.medium,
      backgroundColor: theme.colors.accentContainer,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xs / 2,
      borderRadius: theme.borderRadius.sm,
      textAlign: 'center',
    },
  }));

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Loader loading={loading} error={error} onRetry={refetch} />

        {!loading && books && (
          <>
            <Text style={styles.heading}>📚 Select a Book</Text>
            <FlatList
              data={books}
              keyExtractor={(item) => item.book_pk.toString()}
              numColumns={2}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.gridContainer}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.bookCard, { width: itemWidth }]}
                  onPress={() => navigation.navigate('Chapters', {
                    bookId: item.book_pk,
                  })}
                  activeOpacity={0.8}
                >
                  <View style={styles.imageContainer}>
                    <Image
                      source={getBookCoverImage(item.cover_image)}
                      style={styles.bookImage}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.bookInfo}>
                    <Text style={styles.bookTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    {item.author && (
                      <Text style={styles.bookAuthor} numberOfLines={1}>
                        by {item.author}
                      </Text>
                    )}
                    {item.grade && (
                      <Text style={styles.bookGrade}>
                        Grade {item.grade}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </View>

      <MainMenuBottomNavigation hasUpdates={hasUpdates} />
    </View>
  );
}
