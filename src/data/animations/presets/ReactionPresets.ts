import type { AnimationConfig } from '../core/types';

export const ReactionPresets = {
  // Acid-base neutralization
  acidBaseNeutralization: (): AnimationConfig => ({
    type: 'reaction',
    width: 400,
    height: 400,
    particleCount: 20,
    initialTemperature: 25,
    performanceMode: 'high',
    reactionType: 'acid-base',
    reactants: ['HCl', 'NaOH'],
    products: ['NaCl', 'H2O']
  }),

  // Precipitation reaction
  precipitation: (): AnimationConfig => ({
    type: 'reaction',
    width: 400,
    height: 400,
    particleCount: 15,
    initialTemperature: 25,
    performanceMode: 'high',
    reactionType: 'precipitation',
    reactants: ['AgNO3', 'NaCl'],
    products: ['AgCl', 'NaNO3']
  }),

  // Combustion reaction
  combustion: (fuel = 'CH4'): AnimationConfig => ({
    type: 'reaction',
    width: 500,
    height: 500,
    particleCount: 30,
    initialTemperature: 100,
    performanceMode: 'high',
    reactionType: 'combustion',
    reactants: [fuel, 'O2'],
    products: ['CO2', 'H2O']
  }),

  // Redox reaction
  redox: (): AnimationConfig => ({
    type: 'reaction',
    width: 400,
    height: 400,
    particleCount: 15,
    initialTemperature: 25,
    performanceMode: 'high',
    reactionType: 'redox',
    reactants: ['Zn', 'CuSO4'],
    products: ['ZnSO4', 'Cu']
  }),

  // Custom reaction
  createCustomReaction: (reactants: string[], products: string[]): AnimationConfig => ({
    type: 'reaction',
    width: 400,
    height: 400,
    particleCount: reactants.length + products.length,
    initialTemperature: 25,
    performanceMode: 'high',
    reactionType: 'custom',
    reactants,
    products
  })
};
