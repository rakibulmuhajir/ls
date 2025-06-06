// src/data/animations/examples/LabExperimentExample.tsx

import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Rect, Circle } from 'react-native-svg';
import { UnifiedAnimationProvider, useLabAnimation } from '../UnifiedAnimationProvider';
import { ConnectedAnimationCanvas } from '../components/ConnectedAnimationCanvas';
import type { AnimationConfig } from '../core/types';

// ===== EQUIPMENT OVERLAY COMPONENTS =====

interface BunsenBurnerOverlayProps {
  x: number;
  y: number;
  width: number;
  height: number;
  isActive: boolean;
  onToggle: () => void;
}

const BunsenBurnerOverlay: React.FC<BunsenBurnerOverlayProps> = ({
  x, y, width, height, isActive, onToggle
}) => (
  <TouchableOpacity
    onPress={onToggle}
    style={{ position: 'absolute', left: x, top: y, width, height }}
    activeOpacity={0.7}
  >
    <Svg width={width} height={height}>
      {/* Burner base */}
      <Rect
        x={width * 0.3}
        y={height * 0.7}
        width={width * 0.4}
        height={height * 0.3}
        rx={4}
        fill={isActive ? "#ff6600" : "#666"}
        stroke="#333"
        strokeWidth={1}
      />

      {/* Gas outlet */}
      <Circle
        cx={width * 0.5}
        cy={height * 0.6}
        r={width * 0.1}
        fill={isActive ? "#ff9900" : "#999"}
        stroke="#333"
      />

      {/* Status indicator */}
      <Circle
        cx={width * 0.8}
        cy={height * 0.8}
        r={4}
        fill={isActive ? "#00ff00" : "#ff0000"}
      />
    </Svg>
  </TouchableOpacity>
);

interface BeakerOverlayProps {
  x: number;
  y: number;
  width: number;
  height: number;
  temperature: number;
}

const BeakerOverlay: React.FC<BeakerOverlayProps> = ({
  x, y, width, height, temperature
}) => (
  <View style={{ position: 'absolute', left: x, top: y, width, height, pointerEvents: 'none' }}>
    <Svg width={width} height={height}>
      {/* Beaker outline */}
      <Rect
        x={width * 0.1}
        y={height * 0.3}
        width={width * 0.8}
        height={height * 0.6}
        rx={8}
        fill="transparent"
        stroke="rgba(100, 100, 100, 0.8)"
        strokeWidth={2}
      />

      {/* Temperature indicator */}
      <Rect
        x={width * 0.02}
        y={height * 0.1}
        width={width * 0.15}
        height={height * 0.8}
        rx={4}
        fill="rgba(255, 255, 255, 0.9)"
        stroke="#666"
      />

      {/* Temperature mercury */}
      <Rect
        x={width * 0.04}
        y={height * 0.9 - (temperature / 100) * height * 0.76}
        width={width * 0.11}
        height={(temperature / 100) * height * 0.76}
        rx={2}
        fill={temperature > 60 ? "#ff4444" : temperature > 30 ? "#ff8844" : "#4488ff"}
      />
    </Svg>
  </View>
);

// ===== MAIN LAB EXPERIMENT COMPONENT =====

interface LabExperimentProps {
  width?: number;
  height?: number;
}

const LabExperimentInner: React.FC<LabExperimentProps> = ({
  width = 400,
  height = 300
}) => {
  const {
    addParticle,
    addBoundary,
    addHeatSource,
    updateHeatSource,
    getTemperatureAt,
    setTemperature,
    isRunning,
    toggle,
    reset
  } = useLabAnimation();

  const [burnerActive, setBurnerActive] = useState(false);
  const [heatSourceId, setHeatSourceId] = useState<string | null>(null);
  const [containerId, setContainerId] = useState<string | null>(null);
  const [particlesAdded, setParticlesAdded] = useState(false);

  // Initialize lab setup
  React.useEffect(() => {
    // Create beaker container
    const containerId = addBoundary({
      type: 'container',
      shape: 'rectangle',
      x: width * 0.25 + 8,
      y: height * 0.3 + height * 0.5 * 0.3,
      width: width * 0.4 - 16,
      height: height * 0.5 * 0.6,
      restitution: 0.3,
      friction: 0.1,
    });
    setContainerId(containerId);

    // Create heat source
    const heatId = addHeatSource({
      x: width * 0.45,
      y: height * 0.85,
      radius: 80,
      intensity: 0,
      temperature: 0,
      isActive: false
    });
    setHeatSourceId(heatId);

    // Add water particles
    if (!particlesAdded) {
      for (let i = 0; i < 25; i++) {
        addParticle({
          x: width * 0.25 + 15 + Math.random() * (width * 0.4 - 30),
          y: height * 0.3 + height * 0.5 * 0.4 + Math.random() * (height * 0.5 * 0.4),
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: 2 + Math.random() * 1.5,
          mass: 1,
          color: '#4A90E2',
          maxSpeed: 1,
          vibrationIntensity: 0.1,
          temperature: 25,
          data: { elementType: 'H2O', liquidType: 'water' }
        });
      }
      setParticlesAdded(true);
    }
  }, [addBoundary, addHeatSource, addParticle, width, height, particlesAdded]);

  const toggleBurner = () => {
    if (heatSourceId) {
      const newActive = !burnerActive;
      setBurnerActive(newActive);

      updateHeatSource(heatSourceId, {
        intensity: newActive ? 0.8 : 0,
        temperature: newActive ? 75 : 0,
        isActive: newActive
      });
    }
  };

  const addMoreWater = () => {
    for (let i = 0; i < 5; i++) {
      addParticle({
        x: width * 0.25 + 20 + Math.random() * (width * 0.4 - 40),
        y: height * 0.3 + 10,
        vx: (Math.random() - 0.5) * 0.2,
        vy: 0.5,
        radius: 2 + Math.random() * 1.5,
        mass: 1,
        color: '#4A90E2',
        maxSpeed: 1,
        vibrationIntensity: 0.1,
        temperature: 25,
        data: { elementType: 'H2O', liquidType: 'water' }
      });
    }
  };

  const currentTemp = getTemperatureAt(width * 0.45, height * 0.6);

  return (
    <View style={{ width, height, backgroundColor: '#f8f9fa', borderRadius: 12, overflow: 'hidden' }}>
      {/* Header */}
      <View style={{
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0'
      }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
          🧪 Interactive Heating Experiment
        </Text>
        <Text style={{ fontSize: 12, color: '#666', textAlign: 'center', marginTop: 4 }}>
          Skia Physics + SVG Equipment • Temperature: {Math.round(currentTemp)}°C
        </Text>
      </View>

      {/* Animation Canvas with Equipment Overlays */}
      <View style={{ flex: 1, position: 'relative' }}>
        <ConnectedAnimationCanvas
          width={width}
          height={height - 100}
          showTrails={currentTemp > 40}
          showHeatFields={burnerActive}
        >
          {/* Bunsen Burner Overlay */}
          <BunsenBurnerOverlay
            x={width * 0.35}
            y={height * 0.7}
            width={width * 0.2}
            height={height * 0.25}
            isActive={burnerActive}
            onToggle={toggleBurner}
          />

          {/* Beaker Overlay */}
          <BeakerOverlay
            x={width * 0.25}
            y={height * 0.3}
            width={width * 0.4}
            height={height * 0.5}
            temperature={currentTemp}
          />
        </ConnectedAnimationCanvas>
      </View>

      {/* Controls */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0'
      }}>
        <TouchableOpacity
          onPress={toggleBurner}
          style={{
            backgroundColor: burnerActive ? '#ff6600' : '#666',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 6,
            flex: 1,
            marginHorizontal: 4
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            {burnerActive ? '🔥 Turn Off' : '🔥 Heat'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={addMoreWater}
          style={{
            backgroundColor: '#4A90E2',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 6,
            flex: 1,
            marginHorizontal: 4
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            💧 Add Water
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={toggle}
          style={{
            backgroundColor: isRunning ? '#ff9900' : '#00aa00',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 6,
            flex: 1,
            marginHorizontal: 4
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            {isRunning ? '⏸️ Pause' : '▶️ Play'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => reset()}
          style={{
            backgroundColor: '#cc0000',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 6,
            flex: 1,
            marginHorizontal: 4
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            🔄 Reset
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ===== EXPORTED COMPONENT WITH PROVIDER =====

export const LabExperimentExample: React.FC<LabExperimentProps> = (props) => {
  const labConfig: AnimationConfig = {
    type: 'lab',
    width: props.width || 400,
    height: (props.height || 300) - 100, // Account for header/controls
    experimentType: 'heating',
    initialTemperature: 25,
    performanceMode: 'medium',
    enablePhysics: true,
    enableLabEquipment: true,
  };

  return (
    <UnifiedAnimationProvider initialConfig={labConfig} autoStart={true}>
      <LabExperimentInner {...props} />
    </UnifiedAnimationProvider>
  );
};

export default LabExperimentExample;
