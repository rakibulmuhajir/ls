import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet, useWindowDimensions } from 'react-native';
import { useAnimationSystem } from '@/data/animations/hooks/useAnimationSystem';
import { ConnectedAnimationCanvas } from '@/data/animations/components/ConnectedAnimationCanvas';
import type { AnimationConfig } from '@/data/animations/core/types';

const AnimationTestScreen = () => {
  // Use the animation system hook to get the API
  const { resetSimulation, isRunning, getPhysicsState } = useAnimationSystem();
  const { width, height } = useWindowDimensions();

  /**
   * Initialize the animation scene when the component mounts.
   * This effect runs once when the screen loads.
   */
  useEffect(() => {
    // Define the configuration for the animation scene.
    // Here, we're creating a 'gas' simulation.
    const config: AnimationConfig = {
      type: 'states',
      stateType: 'gas', // Particles will move around randomly
      particleCount: 50,
      width: width,
      height: height - 200, // Adjust height to leave space for UI elements
      initialTemperature: 50, // Higher temperature means faster particles
      performanceMode: 'medium',
    };

    // Call resetSimulation to build and start the scene
    resetSimulation(config);

  }, [width, height, resetSimulation]); // Rerun if screen dimensions change

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Animation Test Screen</Text>

      {/* This component renders the actual animation */}
      <View style={styles.canvasContainer}>
        <ConnectedAnimationCanvas />
      </View>

      <View style={styles.controls}>
        <Button
          title="Check Animation Status"
          onPress={() => {
            console.log('Animation status:', {
              isRunning: isRunning,
              particleCount: getPhysicsState().particles.length,
            });
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  canvasContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  controls: {
    padding: 20,
    paddingBottom: 40,
  },
});

export default AnimationTestScreen;
