// src/screens/BookListScreen.tsx

import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../layouts/AppNavigator'; // Adjust path if needed
import { useFetch } from '@/hooks/useFetch';

// Shared Components
import Loader from '@/components/Loader';
import ScreenWrapper from '@/components/ScreenWrapper';
import ScreenHeader from '@/components/ScreenHeader';
// MainMenuBottomNavigation is specific, keep its import
import MainMenuBottomNavigation from '@/components/MainMenuBottomNavigation';

import { getBooks } from '@/lib/api/getBooks';

// Theme and Design System
import { Theme } from '@/lib/designSystem'; // Adjust path
import { useThemedStyles, useTheme } from '@/lib/ThemeContext'; // <<<<<<<<<<< IMPORT useTheme HERE

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Books'>;

interface Book {
  book_pk: number;
  title: string;
  author?: string | null;
  grade?: string | null;
  cover_image?: string | null;
}

export default function BookListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme(); // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< INITIALIZE THEME HERE

  const { data: books, loading, error, refetch } = useFetch<Book[]>(getBooks);

  const hasUpdates = false;
  const screenWidth = Dimensions.get('window').width;

  const getBookCoverImage = (coverImage?: string | null) => {
    const bookCovers: { [key: string]: any } = {
      'IX-chem-25-26-PCTB.jpg': require('../../assets/images/books/IX-chem-25-26-PCTB.jpg'),
      'default-book-cover.png': require('../../assets/images/books/default-cover.svg'),
    };
    const defaultCoverKey = 'default-book-cover.png';
    if (coverImage && bookCovers[coverImage]) {
      return bookCovers[coverImage];
    }
    return bookCovers[defaultCoverKey];
  };

  const styles = useThemedStyles((currentTheme: Theme) => { // Renamed theme to currentTheme to avoid conflict
    const cardSpacing = currentTheme.spacing.md;
    const numColumns = 2;
    // ScreenWrapper provides currentTheme.spacing.md horizontal padding.
    // availableWidth for grid content inside ScreenWrapper's padding:
    const availableWidthForGrid = screenWidth - (2 * currentTheme.spacing.md);
    // Now, calculate itemWidth based on this availableWidthForGrid
    const itemWidth = (availableWidthForGrid - (cardSpacing * (numColumns - 1)) - (cardSpacing*2) ) / numColumns;
    // The (cardSpacing*2) is for padding on the left of the first column and right of the last column within the grid itself.

    return {
      screenContentContainer: {
        flex: 1,
      },
      gridContentContainer: {
        paddingHorizontal: cardSpacing, // Padding for the grid items themselves
        paddingBottom: currentTheme.spacing.lg + 80,
      },
      // row style for columnWrapperStyle is not strictly needed if cards have marginBottom
      // and FlatList contentContainerStyle has horizontal padding
      bookCard: {
        backgroundColor: currentTheme.colors.surface,
        borderRadius: currentTheme.borderRadius.lg,
        ...currentTheme.shadows.sm,
        borderWidth: 1,
        borderColor: currentTheme.colors.outlineVariant,
        width: itemWidth,
        marginBottom: cardSpacing,
        // Add left/right margin if not using columnWrapperStyle's justifyContent: 'space-between'
        // For a simple grid, often easier to let FlatList handle column spacing through item width and container padding
      },
      imageContainer: {
        width: '100%',
        aspectRatio: 3 / 4,
        backgroundColor: currentTheme.colors.surfaceVariant,
        borderTopLeftRadius: currentTheme.borderRadius.lg -1, // Slightly less to fit border
        borderTopRightRadius: currentTheme.borderRadius.lg -1,
        overflow: 'hidden',
      },
      bookImage: {
        width: '100%',
        height: '100%',
      },
      bookInfo: {
        padding: currentTheme.spacing.sm,
      },
      bookTitle: {
        fontSize: currentTheme.typography.fontSize.base,
        fontWeight: currentTheme.typography.fontWeight.semibold,
        color: currentTheme.colors.onSurface,
        textAlign: 'left',
        marginBottom: currentTheme.spacing.xs,
        lineHeight: currentTheme.typography.fontSize.base * 1.3,
      },
      bookAuthor: {
        fontSize: currentTheme.typography.fontSize.sm,
        color: currentTheme.colors.onSurfaceVariant,
        textAlign: 'left',
        marginBottom: currentTheme.spacing.xs,
        fontStyle: 'italic',
      },
      bookGrade: {
        fontSize: currentTheme.typography.fontSize.xs,
        color: currentTheme.colors.accent, // Or onAccentContainer
        fontWeight: currentTheme.typography.fontWeight.medium,
        backgroundColor: currentTheme.colors.accentContainer,
        paddingHorizontal: currentTheme.spacing.sm,
        paddingVertical: currentTheme.spacing.xs / 2,
        borderRadius: currentTheme.borderRadius.sm,
        alignSelf: 'flex-start',
        marginTop: currentTheme.spacing.xs,
      },
      emptyListContainerAsCard: {
        backgroundColor: currentTheme.colors.surface,
        borderRadius: currentTheme.borderRadius.xl,
        ...currentTheme.shadows.sm,
        marginHorizontal: currentTheme.spacing.md, // Match ScreenWrapper outer padding
        padding: currentTheme.spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: currentTheme.spacing.lg,
        flexGrow: 1,
      },
      emptyListText: {
        fontSize: currentTheme.typography.fontSize.lg,
        color: currentTheme.colors.onSurfaceVariant,
        textAlign: 'center',
      },
    };
  });

  return (
    <ScreenWrapper>
      <View style={styles.screenContentContainer}>
        <Loader loading={loading} error={error?.message} onRetry={refetch} overlay={!books && loading} />

        {/* ScreenHeader uses ScreenWrapper's padding, so no extra horizontal padding here */}
        <ScreenHeader title="Select a Book" iconName="library-shelves" />

        {!loading && !error && books && books.length > 0 && (
          <FlatList
            data={books}
            keyExtractor={(item) => item.book_pk.toString()}
            numColumns={2}
            contentContainerStyle={styles.gridContentContainer}
            // To ensure spacing between columns with numColumns={2} without columnWrapperStyle,
            // you'd typically make the itemWidth slightly less and rely on the
            // gridContentContainer's padding and distribute items within that.
            // Or, ensure itemWidth + its potential margin fits.
            // The current itemWidth calculation and gridContentContainer padding should work.
            renderItem={({ item, index }) => {
              // Logic for spacing between columns if not using columnWrapperStyle
              const isFirstInRow = index % 2 === 0;
              const cardDynamicStyle = {
                  // marginRight: isFirstInRow ? styles.bookCard.width * 0.05 : 0, // Example: 5% margin for first item in row
                  // marginLeft: !isFirstInRow ? styles.bookCard.width * 0.05 : 0, // Example: 5% margin for second item
              };
              return (
                <TouchableOpacity
                  style={[styles.bookCard, cardDynamicStyle]}
                  onPress={() => navigation.navigate('Chapters', { bookId: item.book_pk, bookTitle: item.title })}
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
              );
            }}
            showsVerticalScrollIndicator={false}
          />
        )}
        {!loading && !error && (!books || books.length === 0) && (
          <View style={styles.emptyListContainerAsCard}>
            <Text style={styles.emptyListText}>No books available at the moment.</Text>
          </View>
        )}
      </View>
      <MainMenuBottomNavigation hasUpdates={hasUpdates} />
    </ScreenWrapper>
  );
}
