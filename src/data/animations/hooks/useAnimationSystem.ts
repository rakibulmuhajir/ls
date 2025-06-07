// src/data/animations/hooks/useAnimationSystem.ts
// This hook provides the AnimationContextAPI and can be a place for complex, multi-step animation sequences.
// Simple presets are now better handled by the SceneBuilder.

import { useAnimation } from '../UnifiedAnimationProvider';
import type { AnimationConfig } from '../core/types';

// This hook now primarily serves as a convenient re-export of the main API.
// For building scenes, you should now use the `sceneBuilder` from the context.
export const useAnimationSystem = () => {
  const animationAPI = useAnimation();

  // Presets are now better handled by `sceneBuilder.buildFromConfig(config)`
  // or by calling `sceneBuilder.createWaterMolecule(...)` directly.
  // This hook is for getting the API. A component would use it like this:
  //
  // const { sceneBuilder, resetSimulation } = useAnimationSystem();
  // useEffect(() => {
  //   const config = { type: 'molecule', moleculeType: 'water', ... };
  //   resetSimulation(config);
  // }, []);
  //
  // No need to replicate preset logic here anymore.

  return animationAPI;
};
