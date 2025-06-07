import { useCallback, useContext } from 'react';
import { AnimationContext } from '../contexts/AnimationContext';
import type { Particle, Bond, PhysicsState } from '../core/types';

export const usePhysics = () => {
  const context = useContext(AnimationContext);

  if (!context) {
    throw new Error('usePhysics must be used within an AnimationProvider');
  }

  // Core physics state access
  const getPhysicsState = useCallback((): PhysicsState => {
    return context.getPhysicsState();
  }, [context]);

  // Particle operations
  const addParticle = useCallback((particle: Omit<Particle, 'id'> & { id?: string }) => {
    return context.addParticle(particle);
  }, [context]);

  const removeParticle = useCallback((particleId: string) => {
    context.removeParticle(particleId);
  }, [context]);

  // Bond operations
  const addBond = useCallback((p1Id: string, p2Id: string, type?: Bond['type']) => {
    return context.addBond({ p1Id, p2Id, type });
  }, [context]);

  const removeBond = useCallback((bondId: string) => {
    context.removeBond(bondId);
  }, [context]);

  // Temperature control
  const setTemperature = useCallback((temp: number) => {
    context.setTemperature(temp);
  }, [context]);

  const getTemperatureAt = useCallback((x: number, y: number) => {
    return context.getTemperatureAt(x, y);
  }, [context]);

  // Simulation control
  const resetSimulation = useCallback((config?: any) => {
    context.resetSimulation(config);
  }, [context]);

  return {
    // State access
    getPhysicsState,
    particles: getPhysicsState().particles,
    bonds: getPhysicsState().bonds,

    // Particle operations
    addParticle,
    removeParticle,

    // Bond operations
    addBond,
    removeBond,

    // Temperature control
    setTemperature,
    getTemperatureAt,

    // Simulation control
    resetSimulation
  };
};
