// src/data/animations/core/FallbackRenderer.tsx

import React, { useRef, useEffect } from 'react';
import { View } from 'react-native';
import type { PhysicsState, Particle, Bond, PerformanceSettings, HeatSource } from "./types";
import { RenderConfig } from "./RenderConfig";
import { ColorSystem } from "./Colors";

interface FallbackRendererProps {
  physicsState: PhysicsState;
  performanceSettings: PerformanceSettings;
  heatSources?: HeatSource[];
  showTrails?: boolean;
  showHeatFields?: boolean;
  width: number;
  height: number;
}

export const FallbackRenderer: React.FC<FallbackRendererProps> = ({
  physicsState,
  performanceSettings,
  heatSources = [],
  showTrails = false,
  showHeatFields = false,
  width,
  height
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Set canvas background
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, width, height);

      const { particles, bonds } = physicsState;
      const activeHeatSources = heatSources.filter(source => source.isActive);

      // Draw heat fields
      if (showHeatFields) {
        activeHeatSources.forEach(source => {
          const gradient = ctx.createRadialGradient(
            source.x, source.y, 0,
            source.x, source.y, source.radius
          );
          const color = ColorSystem.getColorFromNormalizedTemperature(source.temperature / 100);
          gradient.addColorStop(0, color + '40');
          gradient.addColorStop(1, color + '00');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(source.x, source.y, source.radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Draw particle trails
      if (showTrails && performanceSettings.enableParticleTrails) {
        particles.forEach(particle => {
          const speed = Math.sqrt(particle.vx ** 2 + particle.vy ** 2);
          if (speed < RenderConfig.Trail.MinSpeedThreshold) return;

          const trailLength = speed * RenderConfig.Trail.LengthMultiplier;
          const trailEndX = particle.x - (particle.vx / speed) * trailLength;
          const trailEndY = particle.y - (particle.vy / speed) * trailLength;

          ctx.strokeStyle = particle.color + RenderConfig.Trail.OpacityHex;
          ctx.lineWidth = RenderConfig.Trail.StrokeWidth;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(trailEndX, trailEndY);
          ctx.stroke();
        });
      }

      // Draw bonds
      bonds.forEach(bond => {
        if (bond.stability < RenderConfig.Bond.MinVisibleStability) return;

        const strokeWidth = Math.max(1, RenderConfig.Bond.StrokeWidthMultiplier * bond.stability);

        ctx.strokeStyle = bond.color || ColorSystem.getBondColor(bond.type);
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(bond.particle1.x, bond.particle1.y);
        ctx.lineTo(bond.particle2.x, bond.particle2.y);
        ctx.stroke();
      });

      // Draw particles
      const maxParticles = performanceSettings.maxParticles;
      const visibleParticles = particles.slice(0, maxParticles);

      visibleParticles.forEach(particle => {
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [physicsState, performanceSettings, heatSources, showTrails, showHeatFields, width, height]);

  return (
    <View style={{ width, height }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          width: width,
          height: height,
          borderRadius: 8,
        }}
      />
    </View>
  );
};
