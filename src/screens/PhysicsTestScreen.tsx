import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Button } from 'react-native';
import { useSimpleAnimation } from '@/data/animations/SimpleAnimationProvider';
import type { LabBoundary } from '@/data/animations/core/types';
// Define a local type since the LabEquipment import isn't working
type LabEquipmentType = 'container' | 'heater' | 'solid';

interface LabEquipment {
  id: string;
  type: LabEquipmentType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  liquidLevel?: number;
  temperature?: number;
  radius?: number;
}
import { SceneBuilder } from '@/data/animations/core/SceneBuilder';
import {
  BeakerFromRepassets as Beaker,
  FlaskEnhanced as Flask,
  BunsenBurnerFromRepassets as BunsenBurner,
  TestTubeRackEnhanced as TestTube,
  GraduatedCylinder,
} from '@/data/animations/lab/assets';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Canvas } from '@shopify/react-native-skia';
import { SkiaRenderer } from '@/data/animations/core/SkiaRenderer';
import { useMemo } from 'react';

const PhysicsTestScreen = () => {
const animationAPI = useSimpleAnimation();
  const [selectedTab, setSelectedTab] = useState<'equipment' | 'physics' | 'particles' | 'bonds' | 'performance'>('equipment');

  // Initialize physics on first render
  useEffect(() => {
    animationAPI.resetSimulation({
      type: 'lab',
      width: 300,
      height: 500,
      physicsConfig: {
        gravity: { x: 0, y: 0.5 },
        globalDamping: 0.99,
        collisionRestitution: 0.8
      }
    });
    animationAPI.resumeAnimation();
  }, []);
  const [activeEquipment, setActiveEquipment] = useState<LabEquipment | null>(null);
  const activeEquipmentRef = useRef<LabEquipment | null>(null);

  // Equipment drag gesture
  const panGesture = useMemo(() => Gesture.Pan()
    .onStart((e) => {
      if (activeEquipmentRef.current) {
        activeEquipmentRef.current = {
          ...activeEquipmentRef.current,
          x: e.x,
          y: e.y
        };
      }
    })
    .onUpdate((e) => {
      if (activeEquipmentRef.current) {
        activeEquipmentRef.current = {
          ...activeEquipmentRef.current,
          x: activeEquipmentRef.current.x + e.translationX,
          y: activeEquipmentRef.current.y + e.translationY
        };
      }
    })
    .onEnd((e) => {
      if (activeEquipmentRef.current?.type === 'container') {
        checkPourInteraction(activeEquipmentRef.current);
      }
      activeEquipmentRef.current = null;
    }), []);

  const handleSelectEquipment = (equipment: Omit<LabEquipment, 'id'>) => {
    const newEquipment = {
      ...equipment,
      id: `equip_${Date.now()}`,
      width: equipment.width || 100,
      height: equipment.height || 150,
      radius: equipment.radius || 30
    };

    // Add as boundary if it's a container
    if (newEquipment.type === 'container') {
      if (newEquipment.radius) {
        const circleBoundary: Omit<Extract<LabBoundary, { shape: 'circle' }>, 'id'> = {
          type: 'container',
          shape: 'circle',
          x: newEquipment.x,
          y: newEquipment.y,
          radius: newEquipment.radius,
          restitution: 0.8,
          friction: 0.1
        };
        animationAPI.addBoundary(circleBoundary);
      } else {
        const rectBoundary: Omit<Extract<LabBoundary, { shape: 'rectangle' }>, 'id'> = {
          type: 'container',
          shape: 'rectangle',
          x: newEquipment.x,
          y: newEquipment.y,
          width: newEquipment.width || 100,
          height: newEquipment.height || 150,
          restitution: 0.8,
          friction: 0.1
        };
        animationAPI.addBoundary(rectBoundary);
      }
    } else if (newEquipment.type === 'heater') {
      animationAPI.addHeatSource({
        x: newEquipment.x,
        y: newEquipment.y,
        radius: newEquipment.radius || 30,
        intensity: 1,
        temperature: newEquipment.temperature || 500,
        isActive: true
      });
    }

    setActiveEquipment(newEquipment);
    activeEquipmentRef.current = newEquipment;
  };

  const checkPourInteraction = (source: LabEquipment) => {
    // Implementation will be added in Phase 2
  };

  const applyPhysicsEffect = (type: string) => {
    // Save current particles
    const currentParticles = animationAPI.getPhysicsState().particles;

    // Update physics config without full reset
    animationAPI.performanceManager.setPerformanceLevel('medium');

    // Apply new physics settings
    const physicsConfig = {
      gravity: { x: 0, y: type === 'gravity' ? 0.5 : 0 },
      globalDamping: 0.99,
      collisionRestitution: 0.8
    };

    // Recreate particles with new physics
    currentParticles.forEach(p => {
      animationAPI.addParticle({
        ...p,
        vx: type === 'gravity' ? 0 : p.vx,
        vy: type === 'gravity' ? 0 : p.vy
      });
    });

    console.log(`Applied ${type} physics effect`);
  };

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <Button
          title="Equipment"
          onPress={() => setSelectedTab('equipment')}
          color={selectedTab === 'equipment' ? '#007bff' : '#6c757d'}
        />
        <Button
          title="Physics"
          onPress={() => setSelectedTab('physics')}
          color={selectedTab === 'physics' ? '#007bff' : '#6c757d'}
        />
        <Button
          title="Particles"
          onPress={() => setSelectedTab('particles')}
          color={selectedTab === 'particles' ? '#007bff' : '#6c757d'}
        />
        <Button
          title="Bonds"
          onPress={() => setSelectedTab('bonds')}
          color={selectedTab === 'bonds' ? '#007bff' : '#6c757d'}
        />
        <Button
          title="Performance"
          onPress={() => setSelectedTab('performance')}
          color={selectedTab === 'performance' ? '#007bff' : '#6c757d'}
        />
      </View>

      {/* Equipment Library */}
      {selectedTab === 'equipment' && (
        <ScrollView horizontal style={styles.equipmentLibrary}>
          <EquipmentIcon name="Beaker" onPress={() => handleSelectEquipment({
            type: 'container',
            x: 0,
            y: 0,
            width: 100,
            height: 150,
            liquidLevel: 0.7
          })} />
          <EquipmentIcon name="Flask" onPress={() => handleSelectEquipment({
            type: 'container',
            x: 0,
            y: 0,
            width: 80,
            height: 120,
            liquidLevel: 0.5
          })} />
          <EquipmentIcon name="Bunsen Burner" onPress={() => handleSelectEquipment({
            type: 'heater',
            x: 0,
            y: 0,
            width: 60,
            height: 80,
            temperature: 500,
            radius: 30
          })} />
          <EquipmentIcon name="Test Tube" onPress={() => handleSelectEquipment({
            type: 'container',
            x: 0,
            y: 0,
            width: 40,
            height: 100,
            liquidLevel: 0.3
          })} />
          <EquipmentIcon name="Cylinder" onPress={() => handleSelectEquipment({
            type: 'container',
            x: 0,
            y: 0,
            width: 50,
            height: 120,
            liquidLevel: 0.9
          })} />
          <EquipmentIcon name="Thermometer" onPress={() => console.warn('Thermometer not implemented')} />
        </ScrollView>
      )}

      {/* Physics Demos */}
      {selectedTab === 'physics' && (
        <View style={styles.physicsPanel}>
          <Button title="Gravity Demo" onPress={() => applyPhysicsEffect('gravity')} />
          <Button title="Collision Demo" onPress={() => applyPhysicsEffect('collision')} />
          <Button title="Fluid Dynamics" onPress={() => applyPhysicsEffect('fluid')} />
          <Button title="State Changes" onPress={() => applyPhysicsEffect('state-change')} />
        </View>
      )}

      {/* Particles Controls */}
      {selectedTab === 'particles' && (
        <View style={styles.physicsPanel}>
          <Button
            title="Add Random Particles"
            onPress={() => {
              for (let i = 0; i < 10; i++) {
                animationAPI.addParticle({
                  x: Math.random() * 300,
                  y: Math.random() * 500,
                  vx: 0,
                  vy: 0,
                  radius: 5 + Math.random() * 10,
                  color: `hsl(${Math.random() * 360}, 100%, 50%)`,
                  mass: 1,
                  maxSpeed: 1,
                  vibrationIntensity: 0.1,
                  boundaryWidth: 300,
                  boundaryHeight: 500
                });
              }
            }}
          />
          <Button
            title="Clear Particles"
            onPress={() => {
              animationAPI.getPhysicsState().particles.forEach(p => {
                animationAPI.removeParticle(p.id);
              });
            }}
          />
        </View>
      )}

      {/* Bonds Controls */}
      {selectedTab === 'bonds' && (
        <View style={styles.physicsPanel}>
          <Button
            title="Create Random Bonds"
            onPress={() => {
              const particles = animationAPI.getPhysicsState().particles;
              if (particles.length >= 2) {
                // Create bonds between random particles
                for (let i = 0; i < 5; i++) {
                  const p1 = particles[Math.floor(Math.random() * particles.length)];
                  const p2 = particles[Math.floor(Math.random() * particles.length)];
                  if (p1.id !== p2.id) {
                    animationAPI.addBond({
                      p1Id: p1.id,
                      p2Id: p2.id,
                      restLength: 50 + Math.random() * 100,
                      type: 'single'
                    });
                  }
                }
              }
            }}
          />
          <Button
            title="Clear All Bonds"
            onPress={() => {
              animationAPI.getPhysicsState().bonds.forEach(b => {
                animationAPI.removeBond(b.id);
              });
            }}
          />
        </View>
      )}

      {/* Performance Metrics */}
      {selectedTab === 'performance' && (
        <View style={styles.physicsPanel}>
          <Button
            title={animationAPI.isRunning ? "Pause Animation" : "Resume Animation"}
            onPress={() => animationAPI.isRunning ?
              animationAPI.pauseAnimation() :
              animationAPI.resumeAnimation()}
          />
          <Button
            title="Get Stats"
            onPress={() => {
              const state = animationAPI.getPhysicsState();
              console.log('Performance Stats:', {
                particles: state.particles.length,
                bonds: state.bonds.length,
                isRunning: animationAPI.isRunning
              });
            }}
          />
        </View>
      )}

      {/* Animation Canvas */}
      <GestureDetector gesture={panGesture}>
        <View collapsable={false}>
          <SkiaRenderer
            physicsState={animationAPI.getPhysicsState()}
            performanceSettings={animationAPI.performanceManager.getPerformanceSettings()}
            boundaries={Array.from(animationAPI.getPhysicsState().boundaries || [])}
            width={300}
            height={500}
          />
          {/* Equipment is now rendered within SkiaRenderer */}
        </View>
      </GestureDetector>
    </View>
  );
};

interface EquipmentIconProps {
  name: string;
  onPress: () => void;
}

const EquipmentIcon = ({ name, onPress }: EquipmentIconProps) => (
  <View style={styles.equipmentIcon}>
    <Button title={name} onPress={onPress} />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#e9ecef'
  },
  equipmentLibrary: {
    flexGrow: 0,
    padding: 10,
    backgroundColor: '#dee2e6'
  },
  equipmentIcon: {
    marginHorizontal: 8
  },
  physicsPanel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#dee2e6'
  },
  canvas: {
    flex: 1,
    backgroundColor: '#ffffff'
  }
});

export default PhysicsTestScreen;
