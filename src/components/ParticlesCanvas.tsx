import React, { useEffect, useState } from 'react';
import { Canvas, Circle } from '@shopify/react-native-skia';
import { Particle } from '@/data/animations/core/types';
import { useFrameCallback, useSharedValue, useDerivedValue } from 'react-native-reanimated';

interface ParticlesCanvasProps {
  particles: readonly Particle[];
  size: number;
}

const ParticlesCanvas: React.FC<ParticlesCanvasProps> = ({ particles, size }) => {
  const frameCount = useSharedValue(0);

  // Force re-render every animation frame
  useFrameCallback(() => {
    'worklet';
    frameCount.value += 1;
  }, true);

  // This derived value will trigger re-renders when frameCount changes
  useDerivedValue(() => {
    'worklet';
    return frameCount.value;
  });

  return (
    <Canvas style={{ width: size, height: size, backgroundColor: '#f0f0f0' }}>
      {particles.map((p) => (
        <Circle
          key={p.id}
          cx={p.x}
          cy={p.y}
          r={p.radius}
          color={p.color}
        />
      ))}
    </Canvas>
  );
};

export default ParticlesCanvas;
