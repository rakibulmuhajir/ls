import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../layouts/AppNavigator';
import { useFetch } from '@/hooks/useFetch';
import Loader from '@/components/Loader';
import { getBooks } from '@/lib/api/getBooks';
import {
  brandColors,
  typography,
  spacing,
  screenStyles,
  createShadow
} from '@/lib/designSystem';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Books'>;

export default function BookListScreen() {
  const navigation = useNavigation<NavigationProp>();

  const { data: books, loading, error, refetch } = useFetch(getBooks);

  return (
    <View style={styles.container}>
      <Loader loading={loading} error={error} onRetry={refetch} />

      {!loading && books && (
        <>
          <Text style={styles.heading}>📚 Select a Book</Text>
          <FlatList
            data={books}
            keyExtractor={(item) => item.book_pk.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('Chapters', {
                  bookId: item.book_pk,
                })}
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
    color: brandColors.primary.main,
  },
  card: {
    ...screenStyles.listItem,
    backgroundColor: brandColors.primary.lightest,
    borderLeftColor: brandColors.primary.main,
  },
  title: {
    ...screenStyles.listItemText,
    color: brandColors.primary.dark,
  },
});
