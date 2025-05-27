// src/data/animations/animationRegistry.ts
import { AnimationType, AnimationConfig } from './types';
import { hydrogenOxygenWater } from './library/hydrogenOxygenWater';
import { statesOfMatter } from './library/statesOfMatter';
// Import other animations as you create them

const animationLibrary: Record<AnimationType, AnimationConfig> = {
  'hydrogen-oxygen-water': hydrogenOxygenWater,
  'states-of-matter': statesOfMatter,
  // Add more animations here
  'phase-changes': { html: '', height: 300, autoPlay: true, loop: false },
  'carbon-allotropes': { html: '', height: 300, autoPlay: true, loop: false },
  'solutions-colloids': { html: '', height: 250, autoPlay: false, loop: true },
  'temperature-solubility': { html: '', height: 350, autoPlay: true, loop: false },
};

export const getAnimation = (type: AnimationType): AnimationConfig => {
  return animationLibrary[type] || { html: '', height: 300, autoPlay: true, loop: false };
};
