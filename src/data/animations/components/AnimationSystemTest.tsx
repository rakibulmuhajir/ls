// src/components/AnimationSystemTest.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { UnifiedAnimationProvider, useAnimation } from '@/data/animations/UnifiedAnimationProvider';
import { SkiaRenderer } from '@/data/animations/core/SkiaRenderer';
import type { AnimationConfig } from '@/data/animations/core/types';

// Inner component that uses the animation system
const AnimationTestInner: React.FC = () => {
  const {
    getPhysicsState,
    performanceManager,
    physicsEngine,
    addParticle,
    setTemperature,
    isRunning,
    toggleAnimation,
    resetSimulation
  } = useAnimation();

  const [temperature, setTemp] = useState(25);
  const [particleCount, setParticleCount] = useState(0);

  // Get current physics state
  const physicsState = getPhysicsState();
  const performanceSettings = performanceManager.getPerformanceSettings();

  // Update particle count when state changes
  useEffect(() => {
    setParticleCount(physicsState.particles.length);
  }, [physicsState.particles.length]);

  // Add a test particle
  const addTestParticle = () => {
    addParticle({
      x: 200 + Math.random() * 200,
      y: 150 + Math.random() * 200,
      radius: 10 + Math.random() * 10,
      mass: 1,
      color: '#FF0000',
      boundaryWidth: 400,
      boundaryHeight: 300,
      maxSpeed: 2,
      vibrationIntensity: 0.1,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      data: { test: true }
    });
  };

  // Temperature control
  const handleTemperatureChange = (newTemp: number) => {
    setTemp(newTemp);
    setTemperature(newTemp);
  };

  // Reset simulation
  const handleReset = () => {
    const config: AnimationConfig = {
      type: 'custom',
      width: 400,
      height: 300,
      initialTemperature: 25,
      performanceMode: 'medium'
    };
    resetSimulation(config);
    setTemp(25);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Animation System Test</Text>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.stat}>Particles: {particleCount}</Text>
        <Text style={styles.stat}>Temperature: {temperature}°C</Text>
        <Text style={styles.stat}>Running: {isRunning ? '✅' : '❌'}</Text>
        <Text style={styles.stat}>FPS Target: {performanceSettings.frameRate}</Text>
      </View>

      {/* Skia Canvas */}
      <View style={styles.canvasContainer}>
        <SkiaRenderer
          physicsState={physicsState}
          performanceSettings={performanceSettings}
          heatSources={[]}
          showTrails={temperature > 50}
          showHeatFields={false}
          width={400}
          height={300}
        />
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.button} onPress={addTestParticle}>
          <Text style={styles.buttonText}>Add Particle</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={toggleAnimation}>
          <Text style={styles.buttonText}>
            {isRunning ? 'Pause' : 'Play'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleReset}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Temperature Slider */}
      <View style={styles.temperatureContainer}>
        <Text style={styles.tempLabel}>Temperature: {temperature}°C</Text>
        <View style={styles.tempButtons}>
          <TouchableOpacity
            style={styles.tempButton}
            onPress={() => handleTemperatureChange(Math.max(0, temperature - 10))}
          >
            <Text style={styles.tempButtonText}>-10°</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tempButton}
            onPress={() => handleTemperatureChange(Math.min(100, temperature + 10))}
          >
            <Text style={styles.tempButtonText}>+10°</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Main component with provider
export const AnimationSystemTest: React.FC = () => {
  const initialConfig: AnimationConfig = {
    type: 'custom',
    width: 400,
    height: 300,
    initialTemperature: 25,
    performanceMode: 'medium'
  };

  return (
    <UnifiedAnimationProvider initialConfig={initialConfig} autoStart={true}>
      <AnimationTestInner />
    </UnifiedAnimationProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  stat: {
    fontSize: 14,
    color: '#666',
    margin: 5,
  },
  canvasContainer: {
    width: 400,
    height: 300,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  controlsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  temperatureContainer: {
    alignItems: 'center',
  },
  tempLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  tempButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  tempButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  tempButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AnimationSystemTest;
