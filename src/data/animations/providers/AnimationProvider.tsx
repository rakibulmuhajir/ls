import React, { createContext, useContext, useState, useEffect, useRef, useMemo, ReactNode, useCallback } from 'react';
import { PhysicsEngine, PhysicsParams } from '../core/PhysicsEngine';

interface AnimationContextType {
  particles: any[];
  addParticles: (count: number) => void;
  setParams: (newParams: Partial<PhysicsParams>) => void;
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
  const engineRef = useRef<PhysicsEngine | null>(null);

  // Initialize the engine
  useEffect(() => {
    engineRef.current = new PhysicsEngine(width, height, initialParams);
    engineRef.current.addParticles(15);
    setParticles([...engineRef.current.particles]);
  }, [width, height, initialParams]);

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
    addParticles: addParticlesHandler,
    setParams,
    handleDragStart,
    handleDragUpdate,
    handleDragEnd,
  }), [particles, setParams, addParticlesHandler, handleDragStart, handleDragUpdate, handleDragEnd]);

  return <AnimationContext.Provider value={value}>{children}</AnimationContext.Provider>;
};
