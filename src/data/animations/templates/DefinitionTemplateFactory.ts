
// src/data/animations/templates/DefinitionTemplateFactory.ts
import { TemplateFactory, TemplateMetadata } from '../core/TemplateRegistry';
import { AnimationTemplate, TemplateConfig } from '../core/BaseAnimationTemplate';
import { DefinitionTemplate } from './DefinitionTemplate';

export class DefinitionTemplateFactory implements TemplateFactory {
  create(config: TemplateConfig): AnimationTemplate {
    return new DefinitionTemplate();
  }

  getMetadata(): TemplateMetadata {
    return {
      id: 'definition',
      name: 'Definition Template',
      description: 'Template for concept definition animations with interactive elements',
      version: '1.0.0',
      author: 'Chemistry App Team',
      tags: ['concepts', 'definitions', 'interactive'],
      features: ['speed-control', 'zoom-control'],
      dependencies: ['three.js']
    };
  }
}
