import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { View, Text } from 'react-native'; // ✅ ADDED MISSING IMPORTS
import { LabPhysicsEngine } from './core/LabPhysicsEngine';
import type { Particle, LabBoundary, HeatSource } from './core/labTypes';

interface LabAnimationContextType {
  physics: LabPhysicsEngine;
  particles: Particle[];
  boundaries: LabBoundary[];
  heatSources: HeatSource[];
  addParticle: (data: Omit<Particle, 'id'>) => string;
  addHeatSource: (data: Omit<HeatSource, 'id'>) => string;
  updateHeatSource: (id: string, updates: Partial<HeatSource>) => void;
  addBoundary: (data: Omit<LabBoundary, 'id'>) => string;
  getTemperatureAt: (x: number, y: number) => number;
  reset: () => void;
}

const LabAnimationContext = createContext<LabAnimationContextType | null>(null);

export const LabAnimationProvider: React.FC<{
  children: ReactNode;
  width: number;
  height: number;
}> = ({ children, width, height }) => {
  const physicsRef = useRef<LabPhysicsEngine | null>(null);
  const [tick, setTick] = useState(0);
  const animationRef = useRef<number>();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize physics engine safely
  useEffect(() => {
    try {
      if (!physicsRef.current) {
        physicsRef.current = new LabPhysicsEngine(width, height);
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('Failed to initialize physics engine:', error);
    }
  }, [width, height]);

  // Animation loop with error handling
  useEffect(() => {
    if (!isInitialized || !physicsRef.current) return;

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      try {
        if (!physicsRef.current) return;

        const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.016); // Cap at 60fps
        physicsRef.current.update(deltaTime);
        lastTime = currentTime;
        setTick(t => t + 1);
        animationRef.current = requestAnimationFrame(animate);
      } catch (error) {
        console.error('Animation loop error:', error);
        // Continue animation despite errors
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isInitialized]);

  // Safe API methods with error handling
  const addParticle = useCallback((data: Omit<Particle, 'id'>) => {
    try {
      if (!physicsRef.current) throw new Error('Physics engine not initialized');
      return physicsRef.current.addParticle(data);
    } catch (error) {
      console.error('Failed to add particle:', error);
      return 'error';
    }
  }, []);

  const addHeatSource = useCallback((data: Omit<HeatSource, 'id'>) => {
    try {
      if (!physicsRef.current) throw new Error('Physics engine not initialized');
      return physicsRef.current.addHeatSource(data);
    } catch (error) {
      console.error('Failed to add heat source:', error);
      return 'error';
    }
  }, []);

  const updateHeatSource = useCallback((id: string, updates: Partial<HeatSource>) => {
    try {
      if (!physicsRef.current) throw new Error('Physics engine not initialized');
      physicsRef.current.updateHeatSource(id, updates);
    } catch (error) {
      console.error('Failed to update heat source:', error);
    }
  }, []);

  const addBoundary = useCallback((data: Omit<LabBoundary, 'id'>) => {
    try {
      if (!physicsRef.current) throw new Error('Physics engine not initialized');
      return physicsRef.current.addBoundary(data);
    } catch (error) {
      console.error('Failed to add boundary:', error);
      return 'error';
    }
  }, []);

  const getTemperatureAt = useCallback((x: number, y: number) => {
    try {
      if (!physicsRef.current) return 25;
      return physicsRef.current.getTemperatureAt(x, y);
    } catch (error) {
      console.error('Failed to get temperature:', error);
      return 25;
    }
  }, []);

  const reset = useCallback(() => {
    try {
      if (!physicsRef.current) return;
      physicsRef.current.reset();
    } catch (error) {
      console.error('Failed to reset physics:', error);
    }
  }, []);

  // Safe getters with fallbacks
  const getParticles = () => {
    try {
      return physicsRef.current?.getParticles() || [];
    } catch (error) {
      console.error('Failed to get particles:', error);
      return [];
    }
  };

  const getBoundaries = () => {
    try {
      return physicsRef.current?.getBoundaries() || [];
    } catch (error) {
      console.error('Failed to get boundaries:', error);
      return [];
    }
  };

  const getHeatSources = () => {
    try {
      return physicsRef.current?.getHeatSources() || [];
    } catch (error) {
      console.error('Failed to get heat sources:', error);
      return [];
    }
  };

  // Don't provide context until initialized
  if (!isInitialized || !physicsRef.current) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Initializing Lab...</Text>
      </View>
    );
  }

  const contextValue: LabAnimationContextType = {
    physics: physicsRef.current,
    particles: getParticles(),
    boundaries: getBoundaries(),
    heatSources: getHeatSources(),
    addParticle,
    addHeatSource,
    updateHeatSource,
    addBoundary,
    getTemperatureAt,
    reset
  };

  return (
    <LabAnimationContext.Provider value={contextValue}>
      {children}
    </LabAnimationContext.Provider>
  );
};

export const useLabAnimation = () => {
  const context = useContext(LabAnimationContext);
  if (!context) {
    throw new Error('useLabAnimation must be used within LabAnimationProvider');
  }
  return context;
};

interface LabAnimationContextType {
  physics: LabPhysicsEngine;
  particles: Particle[];
  boundaries: LabBoundary[];
  heatSources: HeatSource[];
  addParticle: (data: Omit<Particle, 'id'>) => string;
  addHeatSource: (data: Omit<HeatSource, 'id'>) => string;
  updateHeatSource: (id: string, updates: Partial<HeatSource>) => void;
  addBoundary: (data: Omit<LabBoundary, 'id'>) => string;
  getTemperatureAt: (x: number, y: number) => number;
  reset: () => void;
}
