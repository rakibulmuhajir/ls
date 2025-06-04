// src/data/animations/templates/ReactionTemplateFactory.ts
import { TemplateFactory, TemplateMetadata } from '../core/TemplateRegistry';
import { AnimationTemplate, TemplateConfig } from '../core/BaseAnimationTemplate';
import { ReactionTemplate } from './ReactionTemplate';

export class ReactionTemplateFactory implements TemplateFactory {
  create(config: TemplateConfig): AnimationTemplate {
    return new ReactionTemplate();
  }

  getMetadata(): TemplateMetadata {
    return {
      id: 'reaction',
      name: 'Chemical Reaction Template',
      description: 'Template for chemical reaction animations with molecular dynamics',
      version: '1.0.0',
      author: 'Chemistry App Team',
      tags: ['chemistry', 'reaction', 'molecules'],
      features: ['temperature-control', 'speed-control', 'before-after', '3d-rotation'],
      dependencies: ['three.js']
    };
  }
}
