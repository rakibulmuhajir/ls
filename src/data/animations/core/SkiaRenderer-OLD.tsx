import React, { useEffect, useState } from 'react';
import { View, Platform, ActivityIndicator } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import type { PhysicsState, Particle, Bond, PerformanceSettings, HeatSource, LabBoundary } from "./types";
import { RenderConfig } from "./RenderConfig";
import { ColorSystem } from "./Colors";
import { FallbackRenderer } from './FallbackRenderer';

declare global {
  interface Window {
    CanvasKit: any;
  }
}

interface SkiaRendererProps {
  physicsState: PhysicsState;
  performanceSettings: PerformanceSettings;
  heatSources?: HeatSource[];
  boundaries?: LabBoundary[];
  showTrails?: boolean;
  showHeatFields?: boolean;
  width: number;
  height: number;
}

export const SkiaRenderer: React.FC<SkiaRendererProps> = ({
  physicsState = {
    particles: [],
    bonds: [],
    timestamp: Date.now()
  },
  performanceSettings = {
    level: 'medium',
    frameRate: 60,
    maxParticles: 1000,
    physicsQuality: 'standard',
    enableParticleTrails: false,
    enableComplexCollisions: true
  },
  heatSources = [],
  boundaries = [],
  showTrails = false,
  showHeatFields = false,
  width = 300,
  height = 300
}) => {
  const { particles = [], bonds = [] } = physicsState || {};
  const activeHeatSources = heatSources.filter(source => source.isActive);

  const [skiaError, setSkiaError] = useState<string | null>(null);
  const [isSkiaReady, setIsSkiaReady] = useState(false);

  // Initialize Skia and check if it's available
  useEffect(() => {
    const checkSkia = async () => {
      try {
        // Wait for Skia to load (especially important for web)
        let attempts = 0;
        while (!Skia?.Path?.Make && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (Platform.OS === 'web') {
          if (typeof window === 'undefined' || !window.CanvasKit) {
            throw new Error('CanvasKit not loaded');
          }
        }

        if (!Skia?.Path?.Make || typeof Skia.Path.Make !== "function") {
          throw new Error('Skia Path module not available');
        }

        setIsSkiaReady(true);
      } catch (error) {
        const errMsg = `Skia initialization failed: ${error instanceof Error ? error.message : String(error)}`;
        console.error(errMsg);
        setSkiaError(errMsg);
      }
    };

    checkSkia();
  }, []);

  // Show loading state while initializing
  if (!isSkiaReady && !skiaError) {
    return (
      <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Use fallback canvas renderer if Skia fails
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

  // Create paths for all renderable elements with safety checks
  const particlePaths = particles.map(particle => {
    const path = Skia.Path.Make();
    const x = particle.x || 0;
    const y = particle.y || 0;
    const radius = Math.max(0.1, particle.radius || RenderConfig.Particle.DefaultRadius);
    path.addCircle(x, y, radius);
    return path;
  });

  const bondPaths = bonds
    .filter(bond => bond.stability >= RenderConfig.Bond.MinVisibleStability)
    .map(bond => {
      const path = Skia.Path.Make();
      const p1x = bond.particle1?.x || 0;
      const p1y = bond.particle1?.y || 0;
      const p2x = bond.particle2?.x || 0;
      const p2y = bond.particle2?.y || 0;
      path.moveTo(p1x, p1y);
      path.lineTo(p2x, p2y);
      return path;
    });

  const heatFieldPaths = showHeatFields
    ? activeHeatSources.map(source => {
        const path = Skia.Path.Make();
        const x = source.x || 0;
        const y = source.y || 0;
        const radius = Math.max(1, source.radius || 10);
        path.addCircle(x, y, radius);
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

        {/* Equipment Boundaries */}
        {boundaries?.map((boundary, i) => {
          const path = Skia.Path.Make();
          if (boundary.shape === 'circle') {
            path.addCircle(boundary.x, boundary.y, boundary.radius);
          } else {
            path.addRect(Skia.XYWHRect(
              boundary.x,
              boundary.y,
              boundary.width,
              boundary.height
            ));
          }
          return (
            <Path
              key={`boundary-${i}`}
              path={path}
              color={boundary.type === 'heater' ? 'rgba(255,100,0,0.3)' : 'rgba(0,123,255,0.1)'}
              style="fill"
            />
          );
        })}

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
