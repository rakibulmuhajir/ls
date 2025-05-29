// src/data/animations/AnimationFactory.ts
import { ReactionAnimationTemplate } from './templates/ReactionTemplate';
import { StateChangeAnimationTemplate } from './templates/StateChangeTemplate';
import { DissolutionAnimationTemplate } from './templates/DissolutionTemplate';

export type AnimationType =
  | 'reaction'
  | 'state-change'
  | 'dissolution'
  | 'bonding'
  | 'equilibrium';

export interface AnimationConfig {
  type: AnimationType;
  containerId: string;
  params: any;
}

export class AnimationFactory {
  static create(config: AnimationConfig): ChemistryAnimationEngine {
    switch (config.type) {
      case 'reaction':
        return new ReactionAnimationTemplate(
          config.containerId,
          config.params
        );

      case 'state-change':
        return new StateChangeAnimationTemplate(
          config.containerId,
          config.params.substance,
          config.params.initialState
        );

      case 'dissolution':
        return new DissolutionAnimationTemplate(
          config.containerId,
          config.params.solute,
          config.params.solvent,
          config.params.saturationPoint
        );

      default:
        throw new Error(`Unknown animation type: ${config.type}`);
    }
  }
}
