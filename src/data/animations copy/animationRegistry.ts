// src/data/animations/animationRegistry.ts - Updated
import { AnimationType, AnimationConfig } from './types';
import { baseAnimationTemplate } from './library/baseAnimationTemplate';
import { chemistryDefinition } from './library/chapter1/chemistryDefinition';
import { chemistryDefinitionInteractive } from './library/chapter1/chemistryDefinitionInteractive';

// Animation builders that create configs
const animationBuilders: Record<AnimationType, () => AnimationConfig> = {
  'hydrogen-oxygen-water': () => ({
    height: 500,
    autoPlay: false,
    loop: false,
    features: {
      temperature: true,
      beforeAfter: true,
      speed: true
    },
    safety: {
      maxTemperature: 100,
      requiredEquipment: ['Safety Goggles', 'Gloves'],
      hazardousReactions: ['explosive']
    },
    template: {
      type: 'reaction',
      config: {
        reactants: [
          { formula: 'H2', count: 2, position: { x: 150, y: 250 } },
          { formula: 'O2', count: 1, position: { x: 500, y: 250 } }
        ],
        products: [
          { formula: 'H2O', count: 2, position: { x: 300, y: 250 } }
        ],
        activationEnergy: 100,
        reactionType: 'synthesis',
        effects: ['explosion', 'flame']
      }
    },
    html: baseAnimationTemplate + `
      <script>
        const config = ${JSON.stringify({
          reactants: [
            { formula: 'H2', count: 2, position: { x: 150, y: 250 } },
            { formula: 'O2', count: 1, position: { x: 500, y: 250 } }
          ],
          products: [
            { formula: 'H2O', count: 2, position: { x: 300, y: 250 } }
          ],
          activationEnergy: 100,
          reactionType: 'synthesis',
          effects: ['explosion', 'flame']
        })};

        window.initAnimation = function() {
          console.log('Animation initialized with config:', config);
        };

        window.addEventListener('load', () => {
          window.initAnimation();
        });
      </script>
    `
  }),

  'states-of-matter': () => ({
    height: 350,
    autoPlay: true,
    loop: true,
    features: {
      temperature: true,
      zoom: true,
      speed: true,
      particleCount: true
    },
    safety: {
      maxTemperature: 100,
      requiredEquipment: ['Safety Goggles']
    },
    template: {
      type: 'state-change',
      config: {
        substance: 'H2O',
        initialState: 'solid',
        particleCount: 50
      }
    },
    html: baseAnimationTemplate + `
      <script>
        const config = ${JSON.stringify({
          substance: 'H2O',
          initialState: 'solid',
          particleCount: 50
        })};

        window.initAnimation = function() {
          console.log('States of matter animation ready');
        };

        window.addEventListener('load', () => {
          window.initAnimation();
        });
      </script>
    `
  }),

  // NEW: Interactive Chemistry Definition Animation
  'chemistry-definition-interactive': () => chemistryDefinitionInteractive,

  // Keep the original static version
  'chemistry-definition': () => chemistryDefinition,
};

export const getAnimation = (type: AnimationType): AnimationConfig => {
  const builder = animationBuilders[type];
  return builder ? builder() : {
    html: '<div>Animation not found</div>',
    height: 300,
    autoPlay: true,
    loop: false
  };
};
