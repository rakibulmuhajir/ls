// src/data/animations/components/MolecularView.tsx

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider'; // You might need to install this: npx expo install @react-native-community/slider
import { AnimationCanvas } from './AnimationCanvas'; // The Skia canvas
import { UnifiedAnimationProvider } from '../UnifiedAnimationProvider';
import { useAnimationSystem } from '../hooks/useAnimationSystem';
import type { AnimationConfig } from '../core/types';
import { useThemedStyles, useTheme } from '@/lib/ThemeContext'; // Your app's theme
import { Theme } from '@/lib/designSystem';

interface MolecularViewProps {
  moleculeType: 'water' | 'co2' | 'nacl';
  width: number;
  height: number;
  initialTemperature?: number;
}

// Inner component that consumes the animation context
const MoleculeScene: React.FC<MolecularViewProps> = ({ moleculeType, width, height, initialTemperature }) => {
  const { setTemperature } = useAnimationSystem();
  const { theme } = useTheme();

  const styles = useThemedStyles((theme: Theme) => ({
    container: {
      alignItems: 'center',
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.lg,
    },
    canvasContainer: {
      width: width,
      height: height,
      backgroundColor: theme.colors.surface, // Background for the canvas area
      borderRadius: theme.borderRadius.md,
      ...theme.shadows.xs,
    },
    controlsContainer: {
      width: '100%',
      marginTop: theme.spacing.md,
    },
    sliderLabel: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
    },
  }));

  return (
    <View style={styles.container}>
      <View style={styles.canvasContainer}>
        <AnimationCanvas width={width} height={height} />
      </View>

      <View style={styles.controlsContainer}>
        <Text style={styles.sliderLabel}>Temperature</Text>
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={initialTemperature || 25}
          minimumTrackTintColor={theme.colors.primary}
          maximumTrackTintColor={theme.colors.outlineVariant}
          thumbTintColor={theme.colors.primary}
          onValueChange={setTemperature}
        />
      </View>
    </View>
  );
};


// The exported component that wraps the scene in its own Provider
export const MolecularView: React.FC<MolecularViewProps> = (props) => {
  // Define the initial configuration for this specific animation instance
  const animationConfig: AnimationConfig = {
    type: 'molecule',
    moleculeType: props.moleculeType,
    width: props.width,
    height: props.height,
    initialTemperature: props.initialTemperature || 25,
    performanceMode: 'medium', // Molecules are not too intensive
  };

  return (
    <UnifiedAnimationProvider initialConfig={animationConfig}>
      <MoleculeScene {...props} />
    </UnifiedAnimationProvider>
  );
};
