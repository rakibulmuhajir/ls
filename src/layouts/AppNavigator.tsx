// navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BookListScreen from '@/screens/BookListScreen';
import ChapterListScreen from '@/screens/ChapterListScreen';
import TopicListScreen from '@/screens/TopicListScreen';
import ContentScreen from '@/screens/ContentScreen';
import FeaturesScreen from '@/screens/FeaturesScreen';
import AboutScreen from '@/screens/AboutScreen';
import LabExperimentScreen from '@/screens/LabExperimentScreen';

export type RootStackParamList = {
  Books: undefined;
  Chapters: { bookId: number };
  Topics: { chapterId: number };
  Content: { topicId: number }; // optional future screen
  Features: undefined;
  Updates: undefined;
  About: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Books">
      <Stack.Screen name="Books" component={BookListScreen} options={{ title: 'LearnSpark 📚' }} />
      <Stack.Screen name="Chapters" component={ChapterListScreen} options={{ title: 'Chapters' }} />
      <Stack.Screen name="Topics" component={TopicListScreen} options={{ title: 'Topics' }} />
      <Stack.Screen name="Content" component={ContentScreen} />
      <Stack.Screen name="Features" component={FeaturesScreen} options={{ title: 'Features & Roadmap' }} />
      {/* TODO: Create these screens */}
      {/* <Stack.Screen name="Updates" component={UpdatesScreen} options={{ title: 'Updates' }} /> */}
      <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About LearnSpark' }} />
      <Stack.Screen name="LabExperiment" component={LabExperimentScreen} options={{ title: 'Chemistry Lab' }} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;
