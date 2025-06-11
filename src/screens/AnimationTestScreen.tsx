import React, { useState, useMemo, useEffect, useCallback } from 'react'; // Fixed: useEffect is now imported
import { View, Text, Button, StyleSheet, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import Slider from '@react-native-community/slider';
// Updated imports to use the '@/' alias for consistency
import { AnimationProvider, useAnimation } from '@/data/animations/providers/AnimationProvider';
import { SkiaRenderer } from '@/data/animations/core/SkiaRenderer';

// A wrapper component to provide the animation context
const AnimationTestScreen = () => {
    const { width, height } = useWindowDimensions();
    const canvasHeight = height - 300;

    // The initial parameters for our simulation
    const initialParams = useMemo(() => ({
        temperature: 0.5,
        density: 0.4,
        surfaceTension: 0.2,
        gravity: 0.5,
    }), []);

    return (
        <AnimationProvider width={width} height={canvasHeight} initialParams={initialParams}>
            <SimulationView />
        </AnimationProvider>
    );
}

// The actual UI for the screen
const SimulationView = () => {
  const { width, height } = useWindowDimensions();
  const canvasHeight = height - 300;

  // Get the animation state and controls from our custom hook
  const animation = useAnimation();

  const particlesShared = useSharedValue<any[]>([]);
  const draggedParticleIdShared = useSharedValue<string | null>(null);

  // This useEffect hook was causing the crash because it was not imported. It is now fixed.
  useEffect(() => {
    particlesShared.value = animation.particles;
  }, [animation.particles, particlesShared]);

  // Gesture handler now calls methods from the useAnimation hook
  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      'worklet';
      const p = [...particlesShared.value].reverse().find(part => {
        const dx = e.x - part.x;
        const dy = e.y - part.y;
        return dx * dx + dy * dy < (part.radius || 10) * (part.radius || 10) * 2.5;
      });
      if (p) {
        draggedParticleIdShared.value = p.id;
        runOnJS(animation.handleDragStart)(p.id);
      }
    })
    .onUpdate((e) => {
      'worklet';
      const draggedId = draggedParticleIdShared.value;
      if (draggedId) {
        runOnJS(animation.handleDragUpdate)(draggedId, e.x, e.y);
      }
    })
    .onEnd((e) => {
      'worklet';
      const draggedId = draggedParticleIdShared.value;
      if (draggedId) {
        runOnJS(animation.handleDragEnd)(draggedId, e.velocityX / 60, e.velocityY / 60);
        draggedParticleIdShared.value = null;
      }
    });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Unified Animation System</Text>
      <GestureDetector gesture={panGesture}>
        <View style={[styles.canvasContainer, { height: canvasHeight }]}>
          {/* This is the reusable renderer component */}
          <SkiaRenderer
            physicsState={{ particles: animation.particles, bonds: [], timestamp: Date.now() }}
            width={width}
            height={canvasHeight}
            performanceSettings={{ level: 'high' } as any} // Cast as any to satisfy the older type
          />
        </View>
      </GestureDetector>
      <View style={styles.controls}>
        {/* Sliders now use onSlidingComplete for better performance */}
        <Text style={styles.label}>Temperature</Text>
        <Slider style={styles.slider} minimumValue={0} maximumValue={1} defaultValue={0.5} onSlidingComplete={(v) => animation.setParams({ temperature: v })} />

        <Text style={styles.label}>Fluid Density</Text>
        <Slider style={styles.slider} minimumValue={0.1} maximumValue={1} defaultValue={0.4} onSlidingComplete={(v) => animation.setParams({ density: v })} />

        <Text style={styles.label}>Surface Tension</Text>
        <Slider style={styles.slider} minimumValue={0} maximumValue={0.5} defaultValue={0.2} onSlidingComplete={(v) => animation.setParams({ surfaceTension: v })} />

        <Text style={styles.label}>Gravity</Text>
        <Slider style={styles.slider} minimumValue={0} maximumValue={1} defaultValue={0.5} onSlidingComplete={(v) => animation.setParams({ gravity: v })} />

        <Button title="Add 5 Particles" onPress={() => animation.addParticles(5)} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  title: { textAlign: 'center', marginVertical: 8, fontSize: 18, fontWeight: 'bold', color: '#333' },
  canvasContainer: { borderWidth: 1, borderColor: '#ccc', backgroundColor: '#001' },
  controls: { paddingHorizontal: 15, paddingTop: 10, flex: 1, justifyContent: 'flex-end', paddingBottom: 10 },
  label: { fontSize: 14, color: '#555', marginTop: 4 },
  slider: { width: '100%', height: 30 },
});

export default AnimationTestScreen;
