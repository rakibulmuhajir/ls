// src/data/animations/2d/AnimationProvider.tsx

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { PhysicsEngine } from '../core/UnifiedPhysicsEngine';
import { PerformanceManager } from '../core/Performance';
import { SceneBuilder } from '../core/SceneBuilder';
import type { Particle, Bond, PhysicsState, AnimationContextAPI, AnimationConfig } from '../core/types';
import { UniqueID } from '@/utils/UniqueID';

const AnimationContext = createContext<AnimationContextAPI | undefined>(undefined);

export const AnimationProvider: React.FC<{ children: ReactNode, initialConfig?: AnimationConfig }> = ({ children, initialConfig }) => {
  const performanceManagerRef = useRef(new PerformanceManager(initialConfig?.performanceMode || 'low'));
  const physicsEngineRef = useRef(new PhysicsEngine(performanceManagerRef.current.getPerformanceSettings().level, initialConfig?.width || 300, initialConfig?.height || 300));
  const sceneBuilderRef = useRef(new SceneBuilder(physicsEngineRef.current));

  const [tick, setTick] = useState(0);
  const animationFrameIdRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number>(performance.now());
  const isRunningRef = useRef(true); // CHANGE: Use a ref to control the animation loop

  useEffect(() => {
    if (initialConfig) {
      sceneBuilderRef.current.buildFromConfig(initialConfig);
      if (initialConfig.initialTemperature !== undefined) {
        physicsEngineRef.current.setTemperature(initialConfig.initialTemperature);
      }
      setTick(t => t + 1);
    }
  }, [initialConfig]);

  useEffect(() => {
    isRunningRef.current = true;
    const engine = physicsEngineRef.current;
    const perfManager = performanceManagerRef.current;

    const animate = (currentTime: number) => {
      if (!isRunningRef.current) return;

      const deltaTime = currentTime - lastTimestampRef.current;
      const targetInterval = 1000 / perfManager.getPerformanceSettings().frameRate;

      if (deltaTime >= targetInterval * 0.9 || deltaTime > 250) {
        engine.update(Math.min(deltaTime, 250), currentTime);
        lastTimestampRef.current = currentTime;
        setTick(t => t + 1);
      }
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animationFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      isRunningRef.current = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  const getPhysicsState = useCallback((): PhysicsState => {
    return physicsEngineRef.current.getState(lastTimestampRef.current);
  }, []);

  // ... (addParticle, addBond, removeParticle, removeBond callbacks remain the same) ...
  const setTemperature = useCallback((temp: number) => { physicsEngineRef.current.setTemperature(temp); setTick(t => t + 1); }, []);
  const addParticle = useCallback((particleData: Omit<Particle, 'vx' | 'vy' | 'maxSpeed' | 'vibrationIntensity' | 'color' | 'id'> & Partial<Particle>): string => { const id = particleData.id || UniqueID.generate('p_'); physicsEngineRef.current.addParticle({ ...particleData, id }); setTick(t => t + 1); return id; }, []);
  const addBond = useCallback((bondData: { p1Id: string, p2Id: string, restLength?: number, type?: Bond['type'], id?: string }) : string | null => { const id = bondData.id || UniqueID.generate('b_'); const resultId = physicsEngineRef.current.addBond({ ...bondData, id }); if (resultId) setTick(t => t + 1); return resultId; }, []);
  const removeParticle = useCallback((particleId: string) => { physicsEngineRef.current.removeParticle(particleId); setTick(t => t + 1); }, []);
  const removeBond = useCallback((bondId: string) => { physicsEngineRef.current.removeBond(bondId); setTick(t => t + 1); }, []);

  const resetSimulation = useCallback((config?: AnimationConfig) => {
    isRunningRef.current = false; // Pause the loop
    if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);

    physicsEngineRef.current.reset(config?.width, config?.height);
    if (config?.performanceMode) {
      performanceManagerRef.current.setPerformanceLevel(config.performanceMode);
      physicsEngineRef.current.setPerformanceMode(performanceManagerRef.current.getPerformanceSettings().level);
    }
    if (config) {
      sceneBuilderRef.current.buildFromConfig(config);
    }

    lastTimestampRef.current = performance.now();
    setTick(t => t + 1); // Render the reset state

    // Restart the loop
    isRunningRef.current = true;
    animationFrameIdRef.current = requestAnimationFrame(animate);
    function animate(currentTime: number){ /* as defined in useEffect */ } // just to satisfy linter, it will use the one from scope
  }, []);

  const contextValue: AnimationContextAPI = useMemo(() => ({
    physicsEngine: physicsEngineRef.current,
    performanceManager: performanceManagerRef.current,
    sceneBuilder: sceneBuilderRef.current, // CHANGE: Add sceneBuilder to context
    getPhysicsState,
    setTemperature,
    addParticle,
    addBond,
    removeParticle,
    removeBond,
    resetSimulation,
  }), [getPhysicsState, setTemperature, addParticle, addBond, removeParticle, removeBond, resetSimulation]);

  return (
    <AnimationContext.Provider value={contextValue}>
      {children}
    </AnimationContext.Provider>
  );
};

export const useAnimationAPI = (): AnimationContextAPI => {
  const context = useContext(AnimationContext);
  if (!context) { throw new Error('useAnimationAPI must be used within an AnimationProvider'); }
  return context;
};

export type { AnimationParticle, AnimationBond, PhysicsState, AnimationConfig } from '../core/types';
