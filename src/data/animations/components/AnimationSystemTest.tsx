// src/components/AnimationSystemTest.tsx

import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { UnifiedAnimationProvider, useAnimation } from '@/data/animations/UnifiedAnimationProvider';
import { SkiaRenderer } from '@/data/animations/core/SkiaRenderer';
import type { AnimationConfig } from '@/data/animations/core/types';

const TEST_CONFIG = {
  width: 400,
  height: 300,
  boundaryWidth: 400,
  boundaryHeight: 300
};

const AnimationTestInner: React.FC = () => {
  const {
    getPhysicsState,
    performanceManager,
    addParticle,
    setTemperature,
    isRunning,
    toggleAnimation,
    resetSimulation
  } = useAnimation();

  const [particleCount, setParticleCount] = useState(0);
  const [temperature, setTemp] = useState(25);
  const physicsState = getPhysicsState();
  const performanceSettings = performanceManager.getPerformanceSettings();

  // Test Cases
  const runBasicTest = () => {
    resetSimulation({
      type: 'custom',
      ...TEST_CONFIG,
      initialTemperature: 25
    });

    // Static particles
    addParticle({
      x: 100, y: 150, radius: 20, mass: 1,
      color: '#FF0000', vx: 0, vy: 0,
      maxSpeed: 10, vibrationIntensity: 1,
      ...TEST_CONFIG
    });
    addParticle({
      x: 300, y: 150, radius: 20, mass: 1,
      color: '#00FF00', vx: 0, vy: 0,
      maxSpeed: 10, vibrationIntensity: 1,
      ...TEST_CONFIG
    });
  };

  const runMovementTest = () => {
    resetSimulation({
      type: 'custom',
      ...TEST_CONFIG,
      initialTemperature: 25
    });

    // Moving particles
    addParticle({
      x: 50, y: 150, radius: 15, mass: 1,
      color: '#FF0000', vx: 2, vy: 0,
      maxSpeed: 10, vibrationIntensity: 1,
      ...TEST_CONFIG
    });
    addParticle({
      x: 350, y: 150, radius: 15, mass: 1,
      color: '#0000FF', vx: -2, vy: 0,
      maxSpeed: 10, vibrationIntensity: 1,
      ...TEST_CONFIG
    });
  };

  const runCollisionTest = () => {
    resetSimulation({
      type: 'custom',
      ...TEST_CONFIG,
      initialTemperature: 25
    });

    // Colliding particles
    addParticle({
      x: 100, y: 150, radius: 20, mass: 1,
      color: '#FF0000', vx: 3, vy: 0,
      maxSpeed: 15, vibrationIntensity: 1.5,
      ...TEST_CONFIG
    });
    addParticle({
      x: 300, y: 150, radius: 20, mass: 1,
      color: '#0000FF', vx: -3, vy: 0,
      maxSpeed: 15, vibrationIntensity: 1.5,
      ...TEST_CONFIG
    });
  };

  const runPerformanceTest = () => {
    resetSimulation({
      type: 'custom',
      ...TEST_CONFIG,
      initialTemperature: 25
    });

    // Add 20 random particles
    for (let i = 0; i < 20; i++) {
      addParticle({
        x: Math.random() * TEST_CONFIG.width,
        y: Math.random() * TEST_CONFIG.height,
        radius: 5 + Math.random() * 10,
        mass: 0.5 + Math.random(),
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        maxSpeed: 10 + Math.random() * 5,
        vibrationIntensity: 0.5 + Math.random(),
        ...TEST_CONFIG
      });
    }
  };

  // Track particle movement and debug physics
  useEffect(() => {
    let lastPositions = new Map<string, {x: number, y: number}>();
    let frameCount = 0;

    const interval = setInterval(() => {
      const state = getPhysicsState();
      setParticleCount(state.particles.length);
      frameCount++;

      // Detailed movement debugging
      if (state.particles.length > 0 && frameCount % 5 === 0) {
        const movingParticles = state.particles.filter(p =>
          p.vx !== 0 || p.vy !== 0
        );

        console.log(`Frame ${frameCount} - Physics Update:`, {
          running: isRunning,
          timestamp: Date.now(),
          particlesMoving: movingParticles.length,
          sampleParticle: movingParticles.length > 0 ? {
            id: movingParticles[0].id,
            x: movingParticles[0].x,
            y: movingParticles[0].y,
            vx: movingParticles[0].vx,
            vy: movingParticles[0].vy,
            moved: lastPositions.has(movingParticles[0].id) ? {
              dx: movingParticles[0].x - lastPositions.get(movingParticles[0].id)!.x,
              dy: movingParticles[0].y - lastPositions.get(movingParticles[0].id)!.y
            } : null
          } : null
        });

        // Update last positions
        lastPositions = new Map(state.particles.map(p => [p.id, {x: p.x, y: p.y}]));
      }
    }, 50); // Faster polling for smoother debugging
    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Animation System Tests</Text>

      <View style={styles.statsContainer}>
        <Text style={styles.stat}>Particles: {particleCount}</Text>
        <Text style={styles.stat}>Running: {isRunning ? '✅' : '❌'}</Text>
        <Text style={styles.stat}>FPS: {performanceSettings.frameRate}</Text>
      </View>

      <View style={styles.canvasContainer}>
        <SkiaRenderer
          physicsState={physicsState}
          performanceSettings={performanceSettings}
          width={TEST_CONFIG.width}
          height={TEST_CONFIG.height}
        />
      </View>

      <View style={styles.testButtons}>
        <Text style={styles.sectionTitle}>Basic Tests</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.testButton} onPress={runBasicTest}>
            <Text style={styles.buttonText}>Static Test</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.testButton} onPress={runMovementTest}>
            <Text style={styles.buttonText}>Movement Test</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Advanced Tests</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.testButton} onPress={runCollisionTest}>
            <Text style={styles.buttonText}>Collision Test</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.testButton} onPress={runPerformanceTest}>
            <Text style={styles.buttonText}>Performance Test</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Controls</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.controlButton} onPress={toggleAnimation}>
            <Text style={styles.buttonText}>{isRunning ? 'Pause' : 'Play'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={() => resetSimulation({
            type: 'custom',
            ...TEST_CONFIG,
            initialTemperature: 25
          })}>
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export const AnimationSystemTest: React.FC = () => {
  return (
    <UnifiedAnimationProvider
      initialConfig={{
        type: 'custom',
        ...TEST_CONFIG,
        initialTemperature: 25,
        performanceMode: 'high', // Ensure maximum frame rate
        enablePhysics: true,
        physicsConfig: {
          gravity: { x: 0, y: 0 },
          globalDamping: 0.01, // Reduced damping for more movement
          collisionRestitution: 0.9 // More bouncy collisions
        }
      }}
      autoStart={true}
    >
      <AnimationTestInner />
    </UnifiedAnimationProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8
  },
  stat: {
    fontSize: 14,
    fontWeight: '500'
  },
  canvasContainer: {
    height: 300,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden'
  },
  testButtons: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  testButton: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    alignItems: 'center'
  },
  controlButton: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    backgroundColor: '#2196F3',
    borderRadius: 6,
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontWeight: '500'
  }
});

export default AnimationSystemTest;
