import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo
} from 'react';
import {
  Particle,
  Bond,
  AnimationConfig,
  PhysicsState,
  LabBoundary,
  HeatSource
} from './core/types';
import { UnifiedPhysicsEngine } from './core/UnifiedPhysicsEngine';
import { PerformanceManager } from './core/Performance';

interface AnimationAPI {
  // Particle management
  addParticle: (particle: Omit<Particle, 'id'>) => string;
  removeParticle: (id: string) => void;

  // Bond management
  addBond: (bondData: {
    p1Id: string;
    p2Id: string;
    restLength?: number;
    type?: 'single' | 'double' | 'triple';
    id?: string;
  }) => string | null;
  removeBond: (bondId: string) => void;

  // Lab equipment
  addBoundary: (boundary: Omit<LabBoundary, 'id'>) => string;
  addHeatSource: (heatSource: Omit<HeatSource, 'id'>) => string;
  updateHeatSource: (id: string, updates: Partial<HeatSource>) => void;

  // Simulation control
  resetSimulation: (config?: AnimationConfig) => void;
  pauseAnimation: () => void;
  resumeAnimation: () => void;
  toggleAnimation: () => void;

  // State access
  getPhysicsState: () => PhysicsState;
  isRunning: boolean;
  performanceManager: PerformanceManager;
}

const SimpleAnimationContext = createContext<AnimationAPI | null>(null);

interface SimpleAnimationProviderProps {
  children: React.ReactNode;
  initialConfig?: AnimationConfig;
  autoStart?: boolean;
}

export const SimpleAnimationProvider: React.FC<SimpleAnimationProviderProps> = ({
  children,
  initialConfig,
  autoStart = true
}) => {
  // Core engine instances
  const performanceManagerRef = useRef(
    new PerformanceManager(initialConfig?.performanceMode || 'medium')
  );

  const physicsEngineRef = useRef(
    new UnifiedPhysicsEngine({
      width: initialConfig?.width || 300,
      height: initialConfig?.height || 300,
      performanceLevel: performanceManagerRef.current.getPerformanceSettings().level
    })
  );

  // State
  const [tick, setTick] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [frameCount, setFrameCount] = useState(0);
  const animationFrameIdRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number>(performance.now());

  // Initialize with config
  useEffect(() => {
    if (initialConfig) {
      physicsEngineRef.current.reset({
        width: initialConfig.width,
        height: initialConfig.height,
        performanceLevel: performanceManagerRef.current.getPerformanceSettings().level
      });
      performanceManagerRef.current.setPerformanceLevel(
        initialConfig.performanceMode || 'medium'
      );
    }
    // Always start animation if autoStart is true
    if (autoStart) {
      setIsRunning(true);
    }
    setTick(t => t + 1);
  }, [initialConfig, autoStart]);

  const addParticle = useCallback((particle: Omit<Particle, 'id'>) => {
    const id = physicsEngineRef.current.addParticle({
      ...particle,
      id: Math.random().toString(36).substring(2, 9)
    });
    setTick(t => t + 1);
    return id;
  }, []);

  const removeParticle = useCallback((id: string) => {
    physicsEngineRef.current.removeParticle(id);
    setTick(t => t + 1);
  }, []);

  // Physics engine animation loop
  const animationLoop = useCallback(() => {
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;
    let lastFrameTime = performance.now();

    const animate = (timestamp: number) => {
      try {
        const deltaTime = timestamp - lastTimestampRef.current;
        const elapsed = timestamp - lastFrameTime;

          if (elapsed > frameInterval) {
            physicsEngineRef.current.update(deltaTime, timestamp);
            const state = physicsEngineRef.current.getState(timestamp);
            setFrameCount(prev => prev + 1);

            // Only log state changes every 60 frames (~1 second at 60fps)
            if (frameCount % 60 === 0) {
              console.debug('Physics state:', {
                particles: state.particles.length,
                bonds: state.bonds.length,
                boundaries: state.boundaries?.length
              });
            }
          setParticles(prev => {
            // Only update if particles actually changed
            if (JSON.stringify(prev) !== JSON.stringify(state.particles)) {
              return [...state.particles];
            }
            return prev;
          });

          lastFrameTime = timestamp - (elapsed % frameInterval);
        }

        lastTimestampRef.current = timestamp;
        if (isRunning) {
          animationFrameIdRef.current = requestAnimationFrame(animate);
        }
      } catch (error) {
        console.error('Animation loop error:', error);
        setIsRunning(false);
      }
    };

    lastTimestampRef.current = performance.now();
    if (isRunning) {
      animationFrameIdRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isRunning, frameCount]);

  useEffect(() => {
    if (!isRunning && animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
      return;
    }
    return animationLoop();
  }, [isRunning, animationLoop]);

  const addBond = useCallback((bondData: {
    p1Id: string;
    p2Id: string;
    restLength?: number;
    type?: 'single' | 'double' | 'triple';
    id?: string;
  }) => {
    const id = physicsEngineRef.current.addBond(bondData);
    setTick(t => t + 1);
    return id;
  }, []);

  const removeBond = useCallback((bondId: string) => {
    physicsEngineRef.current.removeBond(bondId);
    setTick(t => t + 1);
  }, []);

  const addBoundary = useCallback((boundary: Omit<LabBoundary, 'id'>) => {
    const id = physicsEngineRef.current.addBoundary(boundary);
    setTick(t => t + 1);
    return id;
  }, []);

  const addHeatSource = useCallback((heatSource: Omit<HeatSource, 'id'>) => {
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
    physicsEngineRef.current.reset({
      width: config?.width || 300,
      height: config?.height || 300,
      performanceLevel: performanceManagerRef.current.getPerformanceSettings().level
    });
    setTick(t => t + 1);
    setIsRunning(true);
  }, []);

  const pauseAnimation = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resumeAnimation = useCallback(() => {
    setIsRunning(true);
  }, []);

  const toggleAnimation = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  const api: AnimationAPI = {
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
    getPhysicsState: () => physicsEngineRef.current.getState(performance.now()),
    isRunning,
    performanceManager: performanceManagerRef.current
  };

  return (
    <SimpleAnimationContext.Provider value={api}>
      {children}
    </SimpleAnimationContext.Provider>
  );
};

export const useSimpleAnimation = () => {
  const context = useContext(SimpleAnimationContext);
  if (!context) {
    throw new Error('useSimpleAnimation must be used within a SimpleAnimationProvider');
  }
  return context;
};
