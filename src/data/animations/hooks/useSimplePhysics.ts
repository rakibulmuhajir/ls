import { useState, useEffect, useCallback } from 'react';
import type { Particle, PhysicsConfig } from '../core/types';
import { UnifiedPhysicsEngine } from '../core/UnifiedPhysicsEngine';

export const useSimplePhysics = () => {
  const [engine] = useState(() => new UnifiedPhysicsEngine({
    width: 300,
    height: 500,
    performanceLevel: 'medium'
  }));
  const [particles, setParticles] = useState<Particle[]>([]);

  const init = useCallback((config: PhysicsConfig) => {
    engine.reset({
      width: config.width,
      height: config.height,
      performanceLevel: 'medium'
    });
  }, [engine]);

  const addParticles = useCallback((newParticles: Particle[]) => {
    newParticles.forEach(p => engine.addParticle(p));
    setParticles(prev => [...prev, ...newParticles]);
  }, [engine]);

  const addParticle = useCallback((particle: Particle) => {
    engine.addParticle(particle);
    setParticles(prev => [...prev, particle]);
  }, [engine]);

  // Update particles on each frame
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const update = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Only update if we have particles
      if (particles.length > 0) {
        engine.update(deltaTime, currentTime);
        const updatedParticles = [...engine.getState(currentTime).particles];
        setParticles(updatedParticles);
      }

      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, [engine, particles.length]);

  return {
    init,
    particles,
    addParticle,
    addParticles,
    getParticles: () => particles,
  };
};
