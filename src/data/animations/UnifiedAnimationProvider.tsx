// src/data/animations/UnifiedAnimationProvider.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  ReactNode
} from 'react';
import { UnifiedPhysicsEngine } from './core/UnifiedPhysicsEngine';
import { PerformanceManager } from './core/Performance';
import { SceneBuilder } from './core/SceneBuilder';
import type {
  AnimationContextAPI,
  AnimationConfig,
  PhysicsState,
  Particle,
  Bond,
  LabBoundary,
  HeatSource
} from './core/types';
import { UniqueID } from './utils/UniqueID';

// ===== CONTEXT =====
export const UnifiedAnimationContext = createContext<AnimationContextAPI | undefined>(undefined);

// ===== PROVIDER PROPS =====
interface UnifiedAnimationProviderProps {
  children: ReactNode;
  initialConfig?: AnimationConfig;
  autoStart?: boolean;
}

// ===== MAIN PROVIDER =====
export const UnifiedAnimationProvider: React.FC<UnifiedAnimationProviderProps> = ({
  children,
  initialConfig,
  autoStart = true
}) => {
  // Core engine instances
  const performanceManagerRef = useRef(
    new PerformanceManager(initialConfig?.performanceMode || 'low')
  );

  const physicsEngineRef = useRef(
    new UnifiedPhysicsEngine(
      initialConfig?.width || 300,
      initialConfig?.height || 300,
      performanceManagerRef.current.getPerformanceSettings().level
    )
  );

  const sceneBuilderRef = useRef(
    new SceneBuilder(physicsEngineRef.current)
  );

  // State
  const [tick, setTick] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);

  // Animation control
  const animationFrameIdRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number>(performance.now());

  // ===== INITIALIZATION =====
  useEffect(() => {
    if (initialConfig) {
      try {
        sceneBuilderRef.current.buildFromConfig(initialConfig);
        if (initialConfig.initialTemperature !== undefined) {
          physicsEngineRef.current.setTemperature(initialConfig.initialTemperature);
        }
        setTick(t => t + 1);
      } catch (error) {
        console.error('Failed to initialize animation with config:', error);
      }
    }
  }, [initialConfig]);

  // ===== ANIMATION LOOP =====
  useEffect(() => {
    if (!isRunning) return;

    const engine = physicsEngineRef.current;
    const perfManager = performanceManagerRef.current;

  const animate = (currentTime: number) => {
    if (!isRunning) return;

    try {
      const deltaTime = currentTime - lastTimestampRef.current;
      const targetInterval = 1000 / perfManager.getPerformanceSettings().frameRate;

      if (deltaTime >= targetInterval * 0.9 || deltaTime > 250) {
        engine.update(Math.min(deltaTime, 250), currentTime);
        lastTimestampRef.current = currentTime;

        // Create fresh state object
        const state = engine.getState(currentTime);

        // Force re-render with new state
        setTick(t => t + 1);
      }

      animationFrameIdRef.current = requestAnimationFrame(animate);
    } catch (error) {
      console.error('Animation loop error:', error);
      // Pause animation on critical errors
      setIsRunning(false);
    }
  };

    animationFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isRunning]);

  // ===== API METHODS =====
  const getPhysicsState = useCallback((): PhysicsState => {
    // Create fresh state object each call
    const state = physicsEngineRef.current.getState(lastTimestampRef.current);
    return {
      ...state,
      particles: [...state.particles],
      bonds: [...state.bonds]
    };
  }, []);

  const setTemperature = useCallback((temp: number) => {
    physicsEngineRef.current.setTemperature(temp);
    setTick(t => t + 1);
  }, []);

  const getTemperatureAt = useCallback((x: number, y: number) => {
    return physicsEngineRef.current.getTemperatureAt(x, y);
  }, []);

  const addParticle = useCallback((particleData: Omit<Particle, 'id'> & { id?: string }): string => {
    const id = physicsEngineRef.current.addParticle(particleData);
    setTick(t => t + 1);
    return id;
  }, []);

  const removeParticle = useCallback((particleId: string) => {
    physicsEngineRef.current.removeParticle(particleId);
    setTick(t => t + 1);
  }, []);

  const addBond = useCallback((bondData: {
    p1Id: string;
    p2Id: string;
    restLength?: number;
    type?: Bond['type'];
    id?: string;
  }): string | null => {
    const id = physicsEngineRef.current.addBond(bondData);
    if (id) setTick(t => t + 1);
    return id;
  }, []);

  const removeBond = useCallback((bondId: string) => {
    physicsEngineRef.current.removeBond(bondId);
    setTick(t => t + 1);
  }, []);

  const addBoundary = useCallback((boundary: Omit<LabBoundary, 'id'>): string => {
    const id = physicsEngineRef.current.addBoundary(boundary);
    setTick(t => t + 1);
    return id;
  }, []);

  const addHeatSource = useCallback((heatSource: Omit<HeatSource, 'id'>): string => {
    const id = physicsEngineRef.current.addHeatSource(heatSource);
    setTick(t => t + 1);
    return id;
  }, []);

  const updateHeatSource = useCallback((id: string, updates: Partial<HeatSource>) => {
    physicsEngineRef.current.updateHeatSource(id, updates);
    setTick(t => t + 1);
  }, []);

  const resetSimulation = useCallback((config?: AnimationConfig) => {
    setIsRunning(false);

    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }

    // Reset physics engine
    physicsEngineRef.current.reset(config?.width, config?.height);

    if (config?.performanceMode) {
      performanceManagerRef.current.setPerformanceLevel(config.performanceMode);
      physicsEngineRef.current.setPerformanceMode(config.performanceMode);
    }

    if (config) {
      sceneBuilderRef.current.buildFromConfig(config);
    }

    lastTimestampRef.current = performance.now();
    setTick(t => t + 1);

    // Restart animation
    setIsRunning(true);
  }, []);

  // ===== ANIMATION CONTROL =====
  const pauseAnimation = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resumeAnimation = useCallback(() => {
    lastTimestampRef.current = performance.now();
    setIsRunning(true);
  }, []);

  const toggleAnimation = useCallback(() => {
    if (isRunning) {
      pauseAnimation();
    } else {
      resumeAnimation();
    }
  }, [isRunning, pauseAnimation, resumeAnimation]);

  // ===== CONTEXT VALUE =====
  const contextValue = useMemo(() => ({
    physicsEngine: physicsEngineRef.current,
    performanceManager: performanceManagerRef.current,
    sceneBuilder: sceneBuilderRef.current,

    // State
    getPhysicsState,

    // Temperature
    setTemperature,
    getTemperatureAt,

    // Particles
    addParticle,
    removeParticle,

    // Bonds
    addBond,
    removeBond,

    // Lab equipment
    addBoundary,
    addHeatSource,
    updateHeatSource,

    // Simulation control
    resetSimulation,

    // Animation control (additional utilities)
    pauseAnimation,
    resumeAnimation,
    toggleAnimation,
    isRunning,
  }), [
    getPhysicsState,
    setTemperature,
    getTemperatureAt,
    addParticle,
    removeParticle,
    addBond,
    removeBond,
    addBoundary,
    addHeatSource,
    updateHeatSource,
    resetSimulation,
    pauseAnimation,
    resumeAnimation,
    toggleAnimation,
    isRunning
  ]);

  return (
    <UnifiedAnimationContext.Provider value={contextValue}>
      {children}
    </UnifiedAnimationContext.Provider>
  );
};

// ===== HOOKS =====

// Main hook for accessing the animation API
export const useAnimation = (): AnimationContextAPI & {
  pauseAnimation: () => void;
  resumeAnimation: () => void;
  toggleAnimation: () => void;
  isRunning: boolean;
} => {
  const context = useContext(UnifiedAnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within a UnifiedAnimationProvider');
  }
  return context as any;
};

// Alias for backward compatibility
export const useAnimationAPI = useAnimation;

// Hook for lab-specific functionality
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

// Hook for molecular simulations
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
} from './core/types';
