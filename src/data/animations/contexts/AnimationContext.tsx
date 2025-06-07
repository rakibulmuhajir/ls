import { createContext, useContext } from 'react';
import type {
  AnimationContextAPI,
  AnimationConfig,
  PhysicsState,
  Particle,
  Bond,
  LabBoundary,
  HeatSource
} from '../core/types';

// Create the animation context
const AnimationContext = createContext<AnimationContextAPI | undefined>(undefined);

// Main animation hook
export const useAnimation = (): AnimationContextAPI => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};

// Lab-specific animation hook
export const useLabAnimation = () => {
  const context = useAnimation();

  return {
    // Core physics
    particles: context.getPhysicsState().particles,
    bonds: context.getPhysicsState().bonds,

    // Lab-specific
    addHeatSource: context.addHeatSource,
    updateHeatSource: context.updateHeatSource,
    addBoundary: context.addBoundary,
    getTemperatureAt: context.getTemperatureAt,
    setTemperature: context.setTemperature,

    // Particle management
    addParticle: context.addParticle,
    removeParticle: context.removeParticle,

    // Simulation control
    reset: () => context.resetSimulation(),

    // Animation control
    isRunning: context.isRunning,
    pause: context.pauseAnimation,
    resume: context.resumeAnimation,
    toggle: context.toggleAnimation,
  };
};

// Molecular animation hook
export const useMolecularAnimation = () => {
  const context = useAnimation();

  return {
    // Core physics
    particles: context.getPhysicsState().particles,
    bonds: context.getPhysicsState().bonds,

    // Molecular-specific
    addParticle: context.addParticle,
    removeParticle: context.removeParticle,
    addBond: context.addBond,
    removeBond: context.removeBond,
    setTemperature: context.setTemperature,

    // Scene building
    sceneBuilder: context.sceneBuilder,

    // Simulation control
    reset: (config?: AnimationConfig) => context.resetSimulation(config),

    // Animation control
    isRunning: context.isRunning,
    pause: context.pauseAnimation,
    resume: context.resumeAnimation,
    toggle: context.toggleAnimation,
  };
};

// Export types for convenience
export type {
  AnimationContextAPI,
  AnimationConfig,
  PhysicsState,
  Particle,
  Bond,
  LabBoundary,
  HeatSource
} from '../core/types';

// Export the context for provider usage
export { AnimationContext };
