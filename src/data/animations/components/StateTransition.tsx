import React, { useEffect, useRef } from 'react';
import type { AnimationConfig } from '../core/types';
import { useAnimationSystem } from '../hooks/useAnimationSystem';

interface StateTransitionProps {
  fromConfig: AnimationConfig;
  toConfig: AnimationConfig;
  duration?: number;
  easing?: (t: number) => number;
  onComplete?: () => void;
  children?: React.ReactNode;
}

export const StateTransition: React.FC<StateTransitionProps> = ({
  fromConfig,
  toConfig,
  duration = 1000,
  easing = (t) => t,
  onComplete,
  children
}) => {
  const animationSystem = useAnimationSystem();
  if (!animationSystem) {
    console.warn('Animation system not available - make sure component is wrapped in UnifiedAnimationProvider');
    return null;
  }

  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const currentConfigRef = useRef<AnimationConfig>(fromConfig);

  useEffect(() => {
    if (!animationSystem) {
      console.warn('Animation system not available - make sure component is wrapped in UnifiedAnimationProvider');
      return;
    }

    // Initialize with from config
    if (animationSystem.resetSimulation) {
      animationSystem.resetSimulation(fromConfig);
    } else {
      console.warn('resetSimulation method not available on animation system');
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);

      // Interpolate between configs
      currentConfigRef.current = {
        ...fromConfig,
        width: fromConfig.width + (toConfig.width - fromConfig.width) * easedProgress,
        height: fromConfig.height + (toConfig.height - fromConfig.height) * easedProgress,
        initialTemperature: fromConfig.initialTemperature !== undefined && toConfig.initialTemperature !== undefined
          ? fromConfig.initialTemperature + (toConfig.initialTemperature - fromConfig.initialTemperature) * easedProgress
          : fromConfig.initialTemperature,
        physicsConfig: interpolatePhysicsConfig(
          fromConfig.physicsConfig,
          toConfig.physicsConfig,
          easedProgress
        )
      };

      // Apply the interpolated config
      animationSystem.resetSimulation(currentConfigRef.current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else if (onComplete) {
        onComplete();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [fromConfig, toConfig, duration, easing, onComplete, animationSystem]);

  function interpolatePhysicsConfig(
    from: AnimationConfig['physicsConfig'] | undefined,
    to: AnimationConfig['physicsConfig'] | undefined,
    progress: number
  ): AnimationConfig['physicsConfig'] | undefined {
    if (!from || !to) return from || to;

    const result: AnimationConfig['physicsConfig'] = {
      gravity: {
        x: from.gravity.x + (to.gravity.x - from.gravity.x) * progress,
        y: from.gravity.y + (to.gravity.y - from.gravity.y) * progress
      },
      globalDamping: from.globalDamping + (to.globalDamping - from.globalDamping) * progress,
      collisionRestitution: from.collisionRestitution + (to.collisionRestitution - from.collisionRestitution) * progress
    };

    if (from.forceFields && to.forceFields) {
      result.forceFields = interpolateForceFields(from.forceFields, to.forceFields, progress);
    }

    if (from.centralForce && to.centralForce) {
      result.centralForce = interpolateCentralForce(from.centralForce, to.centralForce, progress);
    }

    return result;
  }

  function interpolateForceFields(
    from: NonNullable<AnimationConfig['physicsConfig']>['forceFields'],
    to: NonNullable<AnimationConfig['physicsConfig']>['forceFields'],
    progress: number
  ) {
    // Simplified interpolation - in a real app you'd want more sophisticated handling
    return progress < 0.5 ? from : to;
  }

  function interpolateCentralForce(
    from: NonNullable<AnimationConfig['physicsConfig']>['centralForce'],
    to: NonNullable<AnimationConfig['physicsConfig']>['centralForce'],
    progress: number
  ) {
    if (!from || !to) return from || to;

    return {
      x: from.x + (to.x - from.x) * progress,
      y: from.y + (to.y - from.y) * progress,
      strength: from.strength + (to.strength - from.strength) * progress
    };
  }

  return <>{children}</>;
};
