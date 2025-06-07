// src/data/animations/components/Particle.tsx

import React, { useEffect, useLayoutEffect } from 'react';
import { useAnimationSystem } from '../hooks/useAnimationSystem';
import type { AnimationParticle } from '../core/types';
import { ColorSystem } from '../core/Colors';
import { UniqueID } from '../utils/UniqueID';
import { RenderConfig } from '../core/RenderConfig';

// Props for the declarative Particle component
// Most physics properties (vx, vy, maxSpeed etc.) are managed by the engine.
// We define the initial setup.
export interface ParticleComponentProps {
  id?: string; // Optional: if not provided, one will be generated
  x: number;
  y: number;
  z?: number;
  radius: number;
  mass?: number;
  boundaryWidth: number; // The boundaries this particle adheres to
  boundaryHeight: number;
  initialColor?: string; // Override default color logic
  elementType?: string; // e.g., 'H', 'O' for specific element coloring
  isFixed?: boolean;
  data?: Record<string, any>;
}

export const Particle: React.FC<ParticleComponentProps> = ({
  id: propId,
  x,
  y,
  z,
  radius,
  mass,
  boundaryWidth,
  boundaryHeight,
  initialColor,
  elementType,
  isFixed,
  data
}) => {
  const { addParticle, removeParticle } = useAnimationSystem();

  // useLayoutEffect to ensure particle is added before first paint if possible,
  // and to get a stable ID for the effect's dependency array.
  const particleIdRef = React.useRef(propId || UniqueID.generate('p_')); // Generate ID if not provided

  useLayoutEffect(() => {
    const particleId = particleIdRef.current;

    let determinedColor = initialColor;
    if (!determinedColor) {
      if (elementType) {
        determinedColor = ColorSystem.getElementColor(elementType);
      } else {
        determinedColor = RenderConfig.Particle.DefaultColor; // Fallback if no element type
      }
    }

    // Construct the particle data for the engine
    // Engine will set vx, vy, maxSpeed, vibrationIntensity etc.
    const particleData: Omit<AnimationParticle, 'vx' | 'vy' | 'maxSpeed' | 'vibrationIntensity'> & Partial<AnimationParticle> = {
      id: particleId,
      x,
      y,
      z,
      radius,
      mass: mass || radius, // Default mass proportional to radius
      color: determinedColor,
      boundaryWidth,
      boundaryHeight,
      isFixed,
      data
    };

    addParticle(particleData);

    return () => {
      removeParticle(particleId);
    };
    // Dependencies: include all props that define the particle's initial state
    // Note: If x, y, etc., are dynamic props that can change, this effect will
    // re-add/remove the particle. For dynamic updates to existing particles,
    // you'd need a different mechanism (e.g., physicsEngine.updateParticle(id, newProps)).
    // For now, this assumes initial setup.
  }, [
    addParticle, removeParticle, x, y, z, radius, mass,
    boundaryWidth, boundaryHeight, initialColor, elementType, isFixed, data
    // propId is not in deps because particleIdRef.current is used, which is stable
  ]);

  return null; // This component doesn't render anything itself
};
