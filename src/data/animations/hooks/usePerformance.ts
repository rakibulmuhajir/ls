import { useState, useEffect, useCallback } from 'react';
import type { PerformanceSettings } from '../core/types';

export const usePerformance = (initialMode: 'low' | 'medium' | 'high' = 'low') => {
  const [performanceMode, setPerformanceMode] = useState<'low' | 'medium' | 'high'>(initialMode);
  const [fps, setFps] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const [lastTimestamp, setLastTimestamp] = useState(performance.now());

  // Performance settings based on mode
  const getPerformanceSettings = useCallback((): PerformanceSettings => {
    switch (performanceMode) {
      case 'high':
        return {
          level: 'high',
          frameRate: 60,
          maxParticles: 500,
          enableParticleTrails: true,
          enableComplexCollisions: true,
          physicsQuality: 'advanced',
          enableShadows: true
        };
      case 'medium':
        return {
          level: 'medium',
          frameRate: 45,
          maxParticles: 200,
          enableParticleTrails: true,
          enableComplexCollisions: true,
          physicsQuality: 'standard',
          enableShadows: false
        };
      case 'low':
      default:
        return {
          level: 'low',
          frameRate: 30,
          maxParticles: 100,
          enableParticleTrails: false,
          enableComplexCollisions: false,
          physicsQuality: 'basic',
          enableShadows: false
        };
    }
  }, [performanceMode]);

  // FPS tracking
  useEffect(() => {
    let animationFrameId: number;
    let lastFpsUpdate = performance.now();

    const updateFps = (timestamp: number) => {
      setFrameCount(prev => prev + 1);

      // Update FPS every second
      if (timestamp - lastFpsUpdate >= 1000) {
        setFps(Math.round((frameCount * 1000) / (timestamp - lastFpsUpdate)));
        setFrameCount(0);
        lastFpsUpdate = timestamp;
      }

      animationFrameId = requestAnimationFrame(updateFps);
    };

    animationFrameId = requestAnimationFrame(updateFps);
    return () => cancelAnimationFrame(animationFrameId);
  }, [frameCount]);

  // Adjust performance based on FPS
  useEffect(() => {
    if (fps < 20 && performanceMode !== 'low') {
      setPerformanceMode('low');
    } else if (fps < 40 && performanceMode === 'high') {
      setPerformanceMode('medium');
    }
  }, [fps, performanceMode]);

  return {
    performanceMode,
    fps,
    performanceSettings: getPerformanceSettings(),
    setPerformanceMode,
    getPerformanceSettings
  };
};
