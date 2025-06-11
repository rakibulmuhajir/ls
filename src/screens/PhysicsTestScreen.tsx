import React from 'react';
import { View, Text, Button, StyleSheet, useWindowDimensions, ScrollView } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Slider from '@react-native-community/slider';

import { useAnimation } from '@/data/animations/providers/AnimationProvider';
import { SkiaRenderer } from '@/data/animations/core/SkiaRenderer';
import * as LabAssets from '@/data/animations/lab/assets';

// Tab 1: The interactive physics simulation we've built
const PhysicsScene = () => {
  const { width, height } = useWindowDimensions();
  const canvasHeight = height - 350; // Adjust height for tabs and controls

  const animation = useAnimation();
  const particlesShared = useSharedValue<any[]>([]);
  const draggedParticleIdShared = useSharedValue<string | null>(null);

  React.useEffect(() => {
    particlesShared.value = animation.particles;
  }, [animation.particles, particlesShared]);

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
    <View style={styles.sceneContainer}>
      <GestureDetector gesture={panGesture}>
        <View style={[styles.canvasContainer, { height: canvasHeight }]}>
          <SkiaRenderer
            physicsState={{ particles: animation.particles, bonds: [], timestamp: Date.now() }}
            width={width}
            height={canvasHeight}
            performanceSettings={{ level: 'high' } as any}
          />
        </View>
      </GestureDetector>
      <View style={styles.controls}>
        <Text style={styles.label}>Temperature</Text>
        <Slider style={styles.slider} minimumValue={0} maximumValue={100} defaultValue={50} onSlidingComplete={(v) => animation.setParams({ temperature: v })} />
        <Text style={styles.label}>Fluid Density</Text>
        <Slider style={styles.slider} minimumValue={0.1} maximumValue={1} defaultValue={0.4} onSlidingComplete={(v) => animation.setParams({ density: v })} />
        <Button title="Add 5 Particles" onPress={() => animation.addParticles(5)} />
      </View>
    </View>
  );
};

// Tab 2: A gallery to display all your lab equipment assets
const ComponentsScene = () => {
    // We import everything from the assets index file
    const assetEntries = Object.entries(LabAssets);

    return (
        <ScrollView contentContainerStyle={styles.galleryContainer}>
            <Text style={styles.galleryTitle}>Lab Asset Gallery</Text>
            {assetEntries.map(([name, Component]) => {
                // Filter out non-component exports if any
                if (typeof Component !== 'function') return null;

                return (
                    <View key={name} style={styles.assetWrapper}>
                        <Text style={styles.assetName}>{name}</Text>
                        <View style={styles.assetView}>
                            <Component width={100} height={100} />
                        </View>
                    </View>
                );
            })}
        </ScrollView>
    );
};

// Main component that manages the TabView
const PhysicsTestScreen = () => {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'physics', title: 'Physics' },
    { key: 'components', title: 'Components' },
  ]);

  const renderScene = SceneMap({
    physics: PhysicsScene,
    components: ComponentsScene,
  });

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      renderTabBar={props => <TabBar {...props} style={styles.tabBar} />}
    />
  );
};

const styles = StyleSheet.create({
  sceneContainer: { flex: 1, backgroundColor: '#f0f4f8' },
  tabBar: { backgroundColor: '#4a90e2' },
  title: { textAlign: 'center', marginVertical: 8, fontSize: 18, fontWeight: 'bold', color: '#333' },
  canvasContainer: { borderWidth: 1, borderColor: '#ccc', backgroundColor: '#001' },
  controls: { paddingHorizontal: 15, paddingTop: 10, flex: 1, justifyContent: 'flex-start' },
  label: { fontSize: 14, color: '#555', marginTop: 4 },
  slider: { width: '100%', height: 30 },
  galleryContainer: { padding: 10, alignItems: 'center' },
  galleryTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  assetWrapper: { marginBottom: 20, alignItems: 'center', backgroundColor: '#fff', padding: 10, borderRadius: 8, elevation: 2, width: '90%' },
  assetName: { fontWeight: '600', marginBottom: 10, color: '#555' },
  assetView: { height: 120, width: 120, alignItems: 'center', justifyContent: 'center' },
});

export default PhysicsTestScreen;
