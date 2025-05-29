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
            constructor() {
              this.container = document.getElementById('animation-container');
              this.init();
            }

            init() {
              const keywords = ['Properties', 'Composition', 'Structure'];

              keywords.forEach((keyword, index) => {
                const card = document.createElement('div');
                card.className = 'concept-card';
                card.textContent = keyword;
                card.style.cssText = \`
                  width: 120px;
                  height: 120px;
                  margin: 10px;
                  background: #4ecdc4;
                  color: white;
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: bold;
                  font-size: 16px;
                  border-radius: 12px;
                  cursor: pointer;
                  transition: transform 0.3s ease;
                \`;

                card.addEventListener('click', () => this.showDetail(keyword));
                this.container.appendChild(card);
              });
            }

            showDetail(keyword) {
              const detail = document.createElement('div');
              detail.className = 'concept-detail';
              detail.style.cssText = \`
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                padding: 20px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                border-radius: 12px;
                font-size: 16px;
                text-align: center;
                max-width: 300px;
              \`;

              if (keyword === 'Properties') {
                detail.innerHTML = '<strong>Oxygen (O₂)</strong><br>• Supports combustion<br>• Colorless gas<br>• Essential for life';
              } else if (keyword === 'Composition') {
                detail.innerHTML = '<strong>Water (H₂O)</strong><br>• 2 Hydrogen + 1 Oxygen<br>• Forms by chemical reaction';
              } else if (keyword === 'Structure') {
                detail.innerHTML = '<strong>Carbon dioxide (CO₂)</strong><br>• Linear molecule<br>• Double bonds between C and O';
              }

              // Remove existing detail panels
              const existing = this.container.querySelector('.concept-detail');
              if (existing) existing.remove();

              this.container.appendChild(detail);

              setTimeout(() => {
                detail.style.opacity = '0';
                setTimeout(() => detail.remove(), 2000);
              }, 3000);
            }

            play() {
              console.log('Definition animation started');
            }
          }
        `;

      default:
        return '';
    }
  }
}
