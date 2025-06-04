// src/data/animations/templates/StateChangeTemplateFactory.ts
import { TemplateFactory, TemplateMetadata } from '../core/TemplateRegistry';
import { AnimationTemplate, TemplateConfig } from '../core/BaseAnimationTemplate';
import { StateChangeTemplate } from './StateChangeTemplate';

export class StateChangeTemplateFactory implements TemplateFactory {
  create(config: TemplateConfig): AnimationTemplate {
    return new StateChangeTemplate();
  }

  getMetadata(): TemplateMetadata {
    return {
      id: 'state-change',
      name: 'State Change Template',
      description: 'Template for phase transition animations (solid, liquid, gas)',
      version: '1.0.0',
      author: 'Chemistry App Team',
      tags: ['chemistry', 'states', 'phases'],
      features: ['temperature-control', 'speed-control', 'particle-control', '3d-rotation'],
      dependencies: ['three.js']
    };
  }
}
