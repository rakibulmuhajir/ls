import React, { createContext, useContext, useState, useEffect, useRef, useMemo, ReactNode, useCallback } from 'react';
import { PhysicsEngine, PhysicsParams } from '../core/PhysicsEngine';
import { ParticleFactory } from '../core/ParticleFactory';

import { ChemicalProperties } from '../core/ChemicalData';

interface AnimationContextType {
  particles: any[];
  addParticles: (count: number) => void;
  setParams: (newParams: Partial<PhysicsParams>) => void;
  // Substance properties
  substance: ChemicalProperties | undefined;
  substanceKey: string;
  isBoiling: boolean;
  setSubstance: (key: string) => void;
  // Interaction handlers
  handleDragStart: (id: string) => void;
  handleDragUpdate: (id: string, x: number, y: number) => void;
  handleDragEnd: (id: string, vx: number, vy: number) => void;
}

const AnimationContext = createContext<AnimationContextType | null>(null);

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) throw new Error('useAnimation must be used within an AnimationProvider');
  return context;
};

interface AnimationProviderProps {
  children: ReactNode;
  width: number;
  height: number;
  initialParams: PhysicsParams;
}

export const AnimationProvider: React.FC<AnimationProviderProps> = ({ children, width, height, initialParams }) => {
  const [particles, setParticles] = useState<any[]>([]);
  const [substanceKey, setSubstanceKey] = useState('H2O');
  const [isBoiling, setIsBoiling] = useState(false);
  const engineRef = useRef<PhysicsEngine | null>(null);

  const substance = useMemo(() => {
    if (!engineRef.current) return undefined;
    return engineRef.current.substance;
  }, [substanceKey]);

// Initialize the engine
useEffect(() => {
  engineRef.current = new PhysicsEngine(width, height, initialParams);

  // Use ParticleFactory instead of simple addParticles
  const initialState = ParticleFactory.determineState(substanceKey, initialParams.temperature);
  const factoryParticles = ParticleFactory.createParticles(
    substanceKey,
    15,
    {
      containerWidth: width,
      containerHeight: height,
      temperature: initialParams.temperature,
      state: initialState
    }
  );

  // Set particles directly on engine
  engineRef.current.particles = factoryParticles;
  setParticles([...engineRef.current.particles]);
}, [width, height, initialParams, substanceKey]);

  // The animation loop
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    let animationFrameId: number;
    const animate = () => {
      engine.update();
      setParticles([...engine.particles]);
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const setParams = useCallback((newParams: Partial<PhysicsParams>) => {
    if (engineRef.current) {
      engineRef.current.params = { ...engineRef.current.params, ...newParams };
      setIsBoiling(engineRef.current.params.temperature >= (engineRef.current.substance?.boilingPoint ?? 100));
    }
  }, []);

  const setSubstance = useCallback((key: string) => {
    if (engineRef.current) {
      engineRef.current.setSubstance(key);
      setSubstanceKey(key);
      setIsBoiling(engineRef.current.params.temperature >= (engineRef.current.substance?.boilingPoint ?? 100));
    }
  }, []);

  const addParticlesHandler = useCallback((count: number) => {
    engineRef.current?.addParticles(count);
  }, []);

  const handleDragStart = useCallback((id: string) => engineRef.current?.startDrag(id), []);
  const handleDragUpdate = useCallback((id: string, x: number, y: number) => engineRef.current?.updateDrag(id, x, y), []);
  const handleDragEnd = useCallback((id: string, vx: number, vy: number) => engineRef.current?.endDrag(id, vx, vy), []);

  const value = useMemo(() => ({
    particles,
    substance,
    substanceKey,
    isBoiling,
    addParticles: addParticlesHandler,
    setParams,
    setSubstance,
    handleDragStart,
    handleDragUpdate,
    handleDragEnd,
  }), [particles, setParams, addParticlesHandler, handleDragStart, handleDragUpdate, handleDragEnd]);

  return <AnimationContext.Provider value={value}>{children}</AnimationContext.Provider>;
};
