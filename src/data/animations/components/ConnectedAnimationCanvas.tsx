// src/data/animations/components/ConnectedAnimationCanvas.tsx

import React from 'react';
import { View } from 'react-native';
import { SkiaRenderer } from '../core/SkiaRenderer';
import { useAnimation } from '../UnifiedAnimationProvider';

interface ConnectedAnimationCanvasProps {
  width: number;
  height: number;
  showTrails?: boolean;
  showHeatFields?: boolean;
  style?: object;
  children?: React.ReactNode; // SVG overlays for equipment
}

export const ConnectedAnimationCanvas: React.FC<ConnectedAnimationCanvasProps> = ({
  width,
  height,
  showTrails = false,
  showHeatFields = false,
  style,
  children
}) => {
  const {
    getPhysicsState,
    performanceManager,
    physicsEngine
  } = useAnimation();

  const physicsState = getPhysicsState();
  const performanceSettings = performanceManager.getPerformanceSettings();

  // Get heat sources from physics state
  const heatSources = physicsState.heatSources || [];

  return (
    <View style={[{ width, height, position: 'relative' }, style]}>
      {/* Skia Physics Layer */}
      <View style={{ position: 'absolute', top: 0, left: 0, width, height }}>
        <SkiaRenderer
          physicsState={physicsState}
          performanceSettings={performanceSettings}
          heatSources={[...heatSources]} // Create mutable copy
          showTrails={showTrails}
          showHeatFields={showHeatFields}
          width={width}
          height={height}
        />
      </View>

      {/* SVG Equipment Overlay Layer */}
      {children && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width,
          height,
          pointerEvents: 'box-none' // Allow touches to pass through to equipment
        }}>
          {children}
        </View>
      )}
    </View>
  );
};

export default ConnectedAnimationCanvas;
