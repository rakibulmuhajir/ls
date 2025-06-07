// src/screens/LabExperimentScreen.tsx

import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { AnimationSystemTest } from '@/data/animations/components/AnimationSystemTest';

const LabExperimentScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <AnimationSystemTest />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default LabExperimentScreen;
