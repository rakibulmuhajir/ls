// src/layouts/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// --- Screen Imports ---
import BookListScreen from '@/screens/BookListScreen';
import ChapterListScreen from '@/screens/ChapterListScreen';
import TopicListScreen from '@/screens/TopicListScreen';
import ContentScreen from '@/screens/ContentScreen';
import FeaturesScreen from '@/screens/FeaturesScreen';
import AboutScreen from '@/screens/AboutScreen';
import LabExperimentScreen from '@/screens/LabExperimentScreen';
import BreatheScreen from '@/screens/BreatheScreen';
import SkiaTestScreen from '@/screens/SkiaTestScreen';
import PhysicsTestScreenWrapper from '@/screens/PhysicsTestScreenWrapper';
import AnimationTestScreen from '@/screens/AnimationTestScreen';

export type RootStackParamList = {
  Books: undefined;
  Chapters: { bookId: number };
  Topics: { chapterId: number };
  Content: { topicId: number };
  Features: undefined;
  Updates: undefined;
  About: undefined;
  LabExperiment: undefined;
  Breathe: undefined;
  SkiaTest: undefined;
  PhysicsTest: undefined;
  AnimationTest: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// This component now only contains the stack navigator logic
const AppStack = () => (
  <Stack.Navigator initialRouteName="Books">
    <Stack.Screen name="Books" component={BookListScreen} options={{ title: 'LearnSpark 📚' }} />
    <Stack.Screen name="Chapters" component={ChapterListScreen} options={{ title: 'Chapters' }} />
    <Stack.Screen name="Topics" component={TopicListScreen} options={{ title: 'Topics' }} />
    <Stack.Screen name="Content" component={ContentScreen} />
    <Stack.Screen name="Features" component={FeaturesScreen} options={{ title: 'Features & Roadmap' }} />
    <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About LearnSpark' }} />
    <Stack.Screen name="LabExperiment" component={LabExperimentScreen} options={{ title: 'Chemistry Lab' }} />
    <Stack.Screen name="Breathe" component={BreatheScreen} options={{ title: 'Breathing Exercise' }} />
    <Stack.Screen name="SkiaTest" component={SkiaTestScreen} options={{ title: 'Skia Test' }} />
    <Stack.Screen name="PhysicsTest" component={PhysicsTestScreenWrapper} options={{ title: 'Physics Lab' }} />
    <Stack.Screen name="AnimationTest" component={AnimationTestScreen} options={{ title: 'Animation Test' }} />
  </Stack.Navigator>
);

export default AppStack;
