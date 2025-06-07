import type { AnimationConfig } from '../core/types';

export const PhysicsPresets = {
  // Gravity configurations
  earthGravity: (): AnimationConfig => ({
    type: 'custom',
    width: 400,
    height: 400,
    particleCount: 20,
    initialTemperature: 25,
    performanceMode: 'medium',
    enablePhysics: true,
    physicsConfig: {
      gravity: { x: 0, y: 0.5 },
      globalDamping: 0.01,
      collisionRestitution: 0.7
    }
  }),

  zeroGravity: (): AnimationConfig => ({
    type: 'custom',
    width: 400,
    height: 400,
    particleCount: 20,
    initialTemperature: 25,
    performanceMode: 'medium',
    enablePhysics: true,
    physicsConfig: {
      gravity: { x: 0, y: 0 },
      globalDamping: 0.01,
      collisionRestitution: 0.9
    }
  }),

  // Collision scenarios
  elasticCollisions: (): AnimationConfig => ({
    type: 'custom',
    width: 400,
    height: 400,
    particleCount: 10,
    initialTemperature: 25,
    performanceMode: 'high',
    enablePhysics: true,
    physicsConfig: {
      gravity: { x: 0, y: 0 },
      globalDamping: 0,
      collisionRestitution: 1.0
    }
  }),

  inelasticCollisions: (): AnimationConfig => ({
    type: 'custom',
    width: 400,
    height: 400,
    particleCount: 10,
    initialTemperature: 25,
    performanceMode: 'high',
    enablePhysics: true,
    physicsConfig: {
      gravity: { x: 0, y: 0 },
      globalDamping: 0,
      collisionRestitution: 0.3
    }
  }),

  // Force fields
  magneticField: (strength = 1): AnimationConfig => ({
    type: 'custom',
    width: 400,
    height: 400,
    particleCount: 15,
    initialTemperature: 25,
    performanceMode: 'high',
    enablePhysics: true,
    physicsConfig: {
      gravity: { x: 0, y: 0 },
      globalDamping: 0.02,
      collisionRestitution: 0.7,
      forceFields: [
        {
          type: 'magnetic',
          x: 200,
          y: 200,
          strength,
          radius: 150
        }
      ]
    }
  }),

  // Planetary motion
  planetarySystem: (): AnimationConfig => ({
    type: 'custom',
    width: 500,
    height: 500,
    particleCount: 5,
    initialTemperature: 25,
    performanceMode: 'high',
    enablePhysics: true,
    physicsConfig: {
      gravity: { x: 0, y: 0 },
      globalDamping: 0,
      collisionRestitution: 0.9,
      centralForce: {
        x: 250,
        y: 250,
        strength: 0.5
      }
    }
  })
};
