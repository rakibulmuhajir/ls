import { AnimationConfig } from '../../types';
import { AnimationFactory } from '../../core/AnimationFactory';
import { baseStyles } from '../../styles/baseStyles';

export const createHydrogenOxygenWater = (): AnimationConfig => {
  return {
    height: 500,
    autoPlay: false,
    loop: false,
    features: {
      temperature: true,
      beforeAfter: true,
      speed: true
    },
    html: `
      ${baseStyles}
      <div id="animation-container" class="chemistry-animation">
        <!-- Container for dynamic content -->
      </div>
      <script>
        // Initialize animation
        const animation = new ReactionAnimation({
          containerId: 'animation-container',
          reaction: {
            reactants: [
              { formula: 'H2', count: 2, position: { x: 150, y: 250 } },
              { formula: 'O2', count: 1, position: { x: 500, y: 250 } }
            ],
            products: [
              { formula: 'H2O', count: 2, position: { x: 300, y: 250 } }
            ],
            activationEnergy: 100,
            effects: ['explosion', 'flame']
          }
        });

        // Handle controls from React Native
        window.addEventListener('message', (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'controlUpdate') {
            animation.handleControl(data.control, data.value);
          }
        });

        // Auto-start if configured
        if (window.animationState?.isPlaying) {
          animation.play();
        }
      </script>
    `
  };
};
