// src/data/animations/core/TemplateLoader.ts
import { AnimationTemplateType } from '../types';

export class TemplateLoader {
  static getTemplateCode(templateType: AnimationTemplateType): string {
    switch (templateType) {
      case 'reaction':
        return `
          class ReactionAnimation {
            constructor(config) {
              this.config = config;
              this.container = document.getElementById('animation-container');
              this.init();
            }

            init() {
              const equation = document.createElement('div');
              equation.className = 'equation-display';
              equation.innerHTML = this.buildEquation();
              this.container.appendChild(equation);
              this.createReactants();
            }

            buildEquation() {
              const reactants = this.config.reactants.map(r =>
                r.count > 1 ? \`\${r.count}\${r.formula}\` : r.formula
              ).join(' + ');

              const products = this.config.products.map(p =>
                p.count > 1 ? \`\${p.count}\${p.formula}\` : p.formula
              ).join(' + ');

              return \`\${reactants} → \${products}\`;
            }

            createReactants() {
              console.log('Creating reactants:', this.config.reactants);
            }

            play() {
              console.log('Playing reaction animation');
            }
          }
        `;

      case 'state-change':
        return `
          class StateChangeAnimation {
            constructor(config) {
              this.config = config;
              this.container = document.getElementById('animation-container');
              this.currentState = config.initialState;
              this.init();
            }

            init() {
              this.createParticles();
              this.arrangeParticles(this.currentState);
            }

            createParticles() {
              console.log('Creating particles for', this.config.substance);
            }

            arrangeParticles(state) {
              console.log('Arranging particles in', state, 'state');
            }

            transitionTo(newState) {
              this.currentState = newState;
              this.arrangeParticles(newState);
            }
          }
        `;

      case 'definition':
  return `
    class DefinitionAnimation {
      constructor(config) {
        this.config = config;
        this.container = document.getElementById('animation-container');
        console.log('Definition animation initialized with config:', config);
      }

      play() {
        console.log('Definition animation playing');
        return Promise.resolve();
      }

      pause() {
        console.log('Definition animation paused');
      }

      reset() {
        console.log('Definition animation reset');
      }

      setSpeed(speed) {
        console.log('Definition animation speed set to:', speed);
      }
    }
  `;

      default:
        return '';
    }
  }
}
