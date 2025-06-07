// src/data/animations/components/Bond.tsx

import React, { useEffect, useLayoutEffect, useRef } from 'react';
// No direct Skia import
import { useAnimationSystem } from '../hooks/useAnimationSystem';
import type { AnimationBond, Particle } from '../core/types';
import { UniqueID } from '../utils/UniqueID';

interface BondComponentProps {
  id?: string; // Optional ID
  p1Id: string; // ID of the first particle
  p2Id: string; // ID of the second particle
  type?: AnimationBond['type'];
  restLength?: number; // Optional: if not provided, calculated from initial positions
  stiffness?: number;
  stability?: number;
  color?: string;
}

export const Bond: React.FC<BondComponentProps> = ({
  id: propId,
  p1Id,
  p2Id,
  type = 'single',
  restLength,
  stiffness,
  stability,
  color,
}) => {
  const { addBond, removeBond, getPhysicsState } = useAnimationSystem();
  const bondIdRef = useRef(propId || UniqueID.generate('b_'));

  useLayoutEffect(() => {
    const bondId = bondIdRef.current;

    let calculatedRestLength = restLength;
    // Calculate restLength if not provided, based on current particle positions
    if (calculatedRestLength === undefined) {
      const state = getPhysicsState(); // Get current state to find particles
      const particle1 = state.particles.find((p: Particle) => p.id === p1Id);
      const particle2 = state.particles.find((p: Particle) => p.id === p2Id);

      if (particle1 && particle2) {
        const dx = particle2.x - particle1.x;
        const dy = particle2.y - particle1.y;
        calculatedRestLength = Math.sqrt(dx * dx + dy * dy);
      } else {
        console.warn(`Bond: Could not find particles ${p1Id} or ${p2Id} to calculate rest length.`);
        // Don't add bond if particles are missing for restLength calculation
        return;
      }
    }

    if (calculatedRestLength === undefined) return; // Still undefined, something went wrong

    const bondData = {
      id: bondId,
      p1Id,
      p2Id,
      type,
      restLength: calculatedRestLength,
      stiffness,
      stability,
      color,
    };

    const addedBondId = addBond(bondData);

    return () => {
      if (addedBondId) { // Only try to remove if it was successfully added
        removeBond(addedBondId);
      }
    };
    // Add all props that define the bond to the dependency array
  }, [addBond, removeBond, getPhysicsState, p1Id, p2Id, type, restLength, stiffness, stability, color /*propId*/]);

  return null; // Logical component
};
