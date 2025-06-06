// src/data/animations/core/SkiaRenderer.tsx

import React from 'react';
import { Canvas, Group, Circle, Path, Skia, vec } from "@shopify/react-native-skia";
import type { PhysicsState, Particle, Bond, PerformanceSettings } from "./types";
import { RenderConfig } from "./RenderConfig";
import { ColorSystem } from "./Colors";

// ===== PARTICLE COMPONENT =====
interface SkiaParticleProps {
  particle: Particle;
}

const SkiaParticle: React.FC<SkiaParticleProps> = React.memo(({ particle }) => {
  return (
    <Circle
      cx={particle.x}
      cy={particle.y}
      r={particle.radius}
      color={particle.color}
      opacity={0.9}
    />
  );
});

// ===== BOND COMPONENT =====
interface SkiaBondProps {
  bond: Bond;
}

const SkiaBond: React.FC<SkiaBondProps> = React.memo(({ bond }) => {
  if (bond.stability < RenderConfig.Bond.MinVisibleStability) return null;

  const path = Skia.Path.Make();
  path.moveTo(bond.particle1.x, bond.particle1.y);
  path.lineTo(bond.particle2.x, bond.particle2.y);

  const strokeWidth = Math.max(1, RenderConfig.Bond.StrokeWidthMultiplier * bond.stability);

  return (
    <Path
      path={path}
      style="stroke"
      strokeWidth={strokeWidth}
      color={bond.color || ColorSystem.getBondColor(bond.type)}
      strokeCap="round"
    />
  );
});

// ===== PARTICLE TRAIL COMPONENT =====
interface SkiaParticleTrailProps {
  particle: Particle;
}

const SkiaParticleTrail: React.FC<SkiaParticleTrailProps> = React.memo(({ particle }) => {
  const speed = Math.sqrt(particle.vx ** 2 + particle.vy ** 2);
  if (speed < RenderConfig.Trail.MinSpeedThreshold) return null;

  const path = Skia.Path.Make();
  path.moveTo(particle.x, particle.y);

  // Trail length proportional to velocity
  const trailLength = speed * RenderConfig.Trail.LengthMultiplier;
  const trailEndX = particle.x - (particle.vx / speed) * trailLength;
  const trailEndY = particle.y - (particle.vy / speed) * trailLength;

  path.lineTo(trailEndX, trailEndY);

  // Create gradient effect using opacity
  const trailColor = particle.color + RenderConfig.Trail.OpacityHex;

  return (
    <Path
      path={path}
      style="stroke"
      strokeWidth={RenderConfig.Trail.StrokeWidth}
      color={trailColor}
      strokeCap="round"
    />
  );
});

// ===== HEAT FIELD COMPONENT =====
interface SkiaHeatFieldProps {
  x: number;
  y: number;
  radius: number;
  intensity: number;
  temperature: number;
}

const SkiaHeatField: React.FC<SkiaHeatFieldProps> = React.memo(({
  x,
  y,
  radius,
  intensity,
  temperature
}) => {
  const color = ColorSystem.getColorFromNormalizedTemperature(temperature / 100);
  const opacity = Math.min(0.3, intensity * 0.4);

  return (
    <Circle
      cx={x}
      cy={y}
      r={radius}
      color={color}
      opacity={opacity}
    />
  );
});

// ===== MAIN SKIA RENDERER =====
interface SkiaRendererProps {
  physicsState: PhysicsState;
  performanceSettings: PerformanceSettings;
  heatSources?: Array<{
    id: string;
    x: number;
    y: number;
    radius: number;
    intensity: number;
    temperature: number;
    isActive: boolean;
  }>;
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

  // Filter active heat sources
  const activeHeatSources = heatSources.filter(source => source.isActive);

  // Performance optimizations
  const shouldShowTrails = showTrails && performanceSettings.enableParticleTrails;
  const maxParticles = performanceSettings.maxParticles;
  const visibleParticles = particles.slice(0, maxParticles);

  return (
    <Canvas style={{ width, height }}>
      <Group>
        {/* Heat fields (render first, behind everything) */}
        {showHeatFields && activeHeatSources.map(source => (
          <SkiaHeatField
            key={`heat-${source.id}`}
            x={source.x}
            y={source.y}
            radius={source.radius}
            intensity={source.intensity}
            temperature={source.temperature}
          />
        ))}

        {/* Particle trails (render before particles) */}
        {shouldShowTrails && visibleParticles.map(particle => (
          <SkiaParticleTrail
            key={`trail-${particle.id}`}
            particle={particle}
          />
        ))}

        {/* Bonds (render before particles so particles appear on top) */}
        {bonds.map(bond => (
          <SkiaBond
            key={bond.id}
            bond={bond}
          />
        ))}

        {/* Particles (render on top) */}
        {visibleParticles.map(particle => (
          <SkiaParticle
            key={particle.id}
            particle={particle}
          />
        ))}
      </Group>
    </Canvas>
  );
};

// ===== ANIMATION CANVAS COMPONENT =====
interface AnimationCanvasProps {
  width: number;
  height: number;
  showTrails?: boolean;
  showHeatFields?: boolean;
  style?: object;
  children?: React.ReactNode; // For SVG overlays
}

export const AnimationCanvas: React.FC<AnimationCanvasProps> = ({
  width,
  height,
  showTrails = false,
  showHeatFields = false,
  style,
  children
}) => {
  // This will be connected to the UnifiedAnimationProvider
  // For now, return a placeholder that shows the structure

  return (
    <div style={[{ width, height, position: 'relative' }, style]}>
      {/* Skia Canvas Layer */}
      <div style={{ position: 'absolute', top: 0, left: 0, width, height }}>
        {/* SkiaRenderer will be rendered here when connected to provider */}
        <div style={{
          width,
          height,
          backgroundColor: 'rgba(240, 248, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          border: '1px dashed #ccc'
        }}>
          <span style={{ color: '#666', fontSize: 12 }}>
            Skia Physics Canvas ({width}×{height})
          </span>
        </div>
      </div>

      {/* SVG Overlay Layer */}
      {children && (
        <div style={{ position: 'absolute', top: 0, left: 0, width, height, pointerEvents: 'none' }}>
          {children}
        </div>
      )}
    </div>
  );
};

// ===== CONNECTED CANVAS COMPONENT =====
// This will be created separately to connect with the provider
export const ConnectedAnimationCanvas: React.FC<AnimationCanvasProps> = (props) => {
  // This component will use useAnimation() hook to get physics state
  // and render the SkiaRenderer with live data

  return (
    <AnimationCanvas {...props}>
      {/* Connected SkiaRenderer will be rendered here */}
    </AnimationCanvas>
  );
};

// ===== UTILITY FUNCTIONS =====

/**
 * Creates a Skia path for complex molecular bonds
 */
export const createBondPath = (
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  bondType: Bond['type'] = 'single'
): ReturnType<typeof Skia.Path.Make> => {
  const path = Skia.Path.Make();

  switch (bondType) {
    case 'single':
      path.moveTo(p1.x, p1.y);
      path.lineTo(p2.x, p2.y);
      break;

    case 'double':
      // Create two parallel lines
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const offsetX = (-dy / length) * 2; // Perpendicular offset
      const offsetY = (dx / length) * 2;

      // First line
      path.moveTo(p1.x + offsetX, p1.y + offsetY);
      path.lineTo(p2.x + offsetX, p2.y + offsetY);

      // Second line
      path.moveTo(p1.x - offsetX, p1.y - offsetY);
      path.lineTo(p2.x - offsetX, p2.y - offsetY);
      break;

    case 'triple':
      // Create three parallel lines
      const dx3 = p2.x - p1.x;
      const dy3 = p2.y - p1.y;
      const length3 = Math.sqrt(dx3 * dx3 + dy3 * dy3);
      const offsetX3 = (-dy3 / length3) * 3;
      const offsetY3 = (dx3 / length3) * 3;

      // Center line
      path.moveTo(p1.x, p1.y);
      path.lineTo(p2.x, p2.y);

      // Side lines
      path.moveTo(p1.x + offsetX3, p1.y + offsetY3);
      path.lineTo(p2.x + offsetX3, p2.y + offsetY3);
      path.moveTo(p1.x - offsetX3, p1.y - offsetY3);
      path.lineTo(p2.x - offsetX3, p2.y - offsetY3);
      break;

    default:
      path.moveTo(p1.x, p1.y);
      path.lineTo(p2.x, p2.y);
  }

  return path;
};

/**
 * Performance monitoring for Skia rendering
 */
export const useSkiaPerformance = () => {
  const [fps, setFps] = React.useState(60);
  const frameCountRef = React.useRef(0);
  const lastTimeRef = React.useRef(performance.now());

  React.useEffect(() => {
    const updateFPS = () => {
      frameCountRef.current++;
      const now = performance.now();
      const elapsed = now - lastTimeRef.current;

      if (elapsed >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / elapsed));
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      requestAnimationFrame(updateFPS);
    };

    requestAnimationFrame(updateFPS);
  }, []);

  return { fps };
};
