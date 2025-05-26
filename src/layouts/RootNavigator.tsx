import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookListScreen from '@/screens/BookListScreen';
import ChapterListScreen from '@/screens/ChapterListScreen'; // create later

export type RootStackParamList = {
  BookList: undefined;
  Chapter: { bookId: string; chapterId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="BookList" component={BookListScreen} />
        <Stack.Screen name="Chapter" component={ChapterListScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
