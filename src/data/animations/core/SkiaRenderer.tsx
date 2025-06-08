import React, { useEffect, useState } from 'react';
import { View, Platform } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import type { PhysicsState, Particle, Bond, PerformanceSettings, HeatSource } from "./types";
import { RenderConfig } from "./RenderConfig";
import { ColorSystem } from "./Colors";
import { FallbackRenderer } from './FallbackRenderer';

interface SkiaRendererProps {
  physicsState: PhysicsState;
  performanceSettings: PerformanceSettings;
  heatSources?: HeatSource[];
  showTrails?: boolean;
  showHeatFields?: boolean;
  width: number;
  height: number;
}

export const SkiaRenderer: React.FC<SkiaRendererProps> = ({
  physicsState,
  performanceSettings,
  heatSources = [],
  showTrails = false,
  showHeatFields = false,
  width,
  height
}) => {
  const { particles, bonds } = physicsState;
  const activeHeatSources = heatSources.filter(source => source.isActive);

  const [skiaError, setSkiaError] = useState<string | null>(null);

  // Initialize Skia and check if it's available
  useEffect(() => {
      try {
    if (Platform.OS === 'web') {
      // For web, we need to wait for CanvasKit to load
      if (typeof window !== 'undefined' && !window.CanvasKit) {
        console.warn('CanvasKit not loaded yet, using fallback');
        setSkiaError('CanvasKit not loaded');
        return;
      }
    }

    // Check if Skia and required methods exist
    const canUseSkia =
  Skia?.Path?.Make &&
  typeof Skia.Path.Make === "function" &&
  (Platform.OS !== "web" || typeof window.CanvasKit !== "undefined");

if (!canUseSkia) {
  throw new Error("Skia or CanvasKit not available");
}


    // Test path creation
    const testPath = Skia.Path.Make();
    if (!testPath) {
      throw new Error('Failed to create Skia path');
    }
  } catch (error) {
      let errorMessage = 'Unknown Skia initialization error';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      const errMsg = `Skia initialization failed: ${errorMessage}`;
      console.error(errMsg);
      setSkiaError(errMsg);
    }
  }, []);

  // If Skia fails to initialize, use fallback canvas renderer
  if (skiaError) {
    console.warn('Falling back to canvas renderer due to Skia initialization error');
    return (
      <FallbackRenderer
        physicsState={physicsState}
        performanceSettings={performanceSettings}
        heatSources={heatSources}
        showTrails={showTrails}
        showHeatFields={showHeatFields}
        width={width}
        height={height}
      />
    );
  }

  // Create paths for all renderable elements
  const particlePaths = particles.map(particle => {
    const path = Skia.Path.Make();
    path.addCircle(particle.x, particle.y, particle.radius);
    return path;
  });

  const bondPaths = bonds
    .filter(bond => bond.stability >= RenderConfig.Bond.MinVisibleStability)
    .map(bond => {
      const path = Skia.Path.Make();
      path.moveTo(bond.particle1.x, bond.particle1.y);
      path.lineTo(bond.particle2.x, bond.particle2.y);
      return path;
    });

  const heatFieldPaths = showHeatFields
    ? activeHeatSources.map(source => {
        const path = Skia.Path.Make();
        path.addCircle(source.x, source.y, source.radius);
        return path;
      })
    : [];

  const trailPaths = showTrails && performanceSettings.enableParticleTrails
    ? particles.map(particle => {
        const speed = Math.sqrt(particle.vx ** 2 + particle.vy ** 2);
        if (speed < RenderConfig.Trail.MinSpeedThreshold) return null;

        const trailLength = speed * RenderConfig.Trail.LengthMultiplier;
        const trailEndX = particle.x - (particle.vx / speed) * trailLength;
        const trailEndY = particle.y - (particle.vy / speed) * trailLength;

        const path = Skia.Path.Make();
        path.moveTo(particle.x, particle.y);
        path.lineTo(trailEndX, trailEndY);
        return path;
      }).filter(Boolean)
    : [];

  return (
    <View style={{ width, height }}>
      <Canvas style={{ width, height }}>
        {/* Background */}
        <Path
          path={Skia.Path.Make().addRect(Skia.XYWHRect(0, 0, width, height))}
          color="#f8f9fa"
        />

        {/* Heat Fields */}
        {showHeatFields && heatFieldPaths.map((path, i) => (
          <Path
            key={`heat-${i}`}
            path={path}
            color={ColorSystem.getColorFromNormalizedTemperature(
              activeHeatSources[i].temperature / 100
            ) + "40"}
            style="fill"
          />
        ))}

        {/* Particle Trails */}
        {showTrails && trailPaths.map((path, i) => (
          <Path
            key={`trail-${i}`}
            path={path!}
            color={particles[i].color + RenderConfig.Trail.OpacityHex}
            style="stroke"
            strokeWidth={RenderConfig.Trail.StrokeWidth}
          />
        ))}

        {/* Bonds */}
        {bondPaths.map((path, i) => {
          const bond = bonds[i];
          return (
            <Path
              key={`bond-${i}`}
              path={path}
              color={bond.color || ColorSystem.getBondColor(bond.type)}
              style="stroke"
              strokeWidth={Math.max(1, RenderConfig.Bond.StrokeWidthMultiplier * bond.stability)}
            />
          );
        })}

        {/* Particles */}
        {particlePaths.map((path, i) => (
          <Path
            key={`particle-${i}`}
            path={path}
            color={particles[i].color}
            style="fill"
          />
        ))}
      </Canvas>
    </View>
  );
};
