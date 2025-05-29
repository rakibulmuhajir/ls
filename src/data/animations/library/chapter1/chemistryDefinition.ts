// src/data/animations/library/chapter1/chemistryDefinition.ts
import { AnimationConfig } from '../../types';
import { baseAnimationTemplate } from '../baseAnimationTemplate';

export const chemistryDefinition: AnimationConfig = {
  height: 600,
  autoPlay: true,
  loop: false,
  features: {
    speed: true,
  },
  html: baseAnimationTemplate + `
    <style>
      #animation-container {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
        position: relative;
        overflow: hidden;
      }

      /* Title Section */
      .title-section {
        text-align: center;
        margin-bottom: 30px;
        opacity: 0;
        transform: translateY(-20px);
        animation: fadeInDown 1s forwards;
      }

      .main-title {
        font-size: 28px;
        font-weight: bold;
        color: white;
        margin-bottom: 10px;
      }

      .definition-text {
        font-size: 16px;
        color: rgba(255, 255, 255, 0.9);
        line-height: 1.5;
        max-width: 500px;
        margin: 0 auto;
      }

      .highlight {
        background: rgba(255, 255, 255, 0.2);
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .highlight:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.05);
      }

      /* Branch Cards */
      .branches-container {
        display: flex;
        gap: 20px;
        margin-top: 40px;
        opacity: 0;
        animation: fadeIn 1s forwards 0.5s;
      }

      .branch-card {
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 16px;
        padding: 20px;
        width: 160px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .branch-card:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      }

      .branch-card.active {
        background: rgba(255, 255, 255, 0.3);
        border-color: rgba(255, 255, 255, 0.5);
      }

      .branch-icon {
        font-size: 48px;
        margin-bottom: 10px;
      }

      .branch-title {
        font-size: 18px;
        font-weight: bold;
        color: white;
        margin-bottom: 5px;
      }

      .branch-subtitle {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
      }

      /* Content Panels */
      .content-panel {
        position: absolute;
        bottom: 20px;
        left: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        border-radius: 16px;
        padding: 20px;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.5s ease;
        max-height: 200px;
        overflow-y: auto;
      }

      .content-panel.active {
        opacity: 1;
        transform: translateY(0);
      }

      .panel-title {
        font-size: 20px;
        font-weight: bold;
        color: #4ecdc4;
        margin-bottom: 10px;
      }

      .panel-content {
        color: white;
        line-height: 1.6;
      }

      /* Properties Panel */
      .element-display {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-top: 15px;
      }

      .element-box {
        background: radial-gradient(circle at 30% 30%, #ff6b6b, #cc0000);
        width: 80px;
        height: 80px;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        animation: pulse 2s infinite;
      }

      .element-symbol {
        font-size: 36px;
        font-weight: bold;
      }

      .element-name {
        font-size: 12px;
      }

      .properties-list {
        flex: 1;
      }

      .property-item {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
        opacity: 0;
        animation: slideInRight 0.5s forwards;
      }

      .property-item:nth-child(1) { animation-delay: 0.1s; }
      .property-item:nth-child(2) { animation-delay: 0.2s; }
      .property-item:nth-child(3) { animation-delay: 0.3s; }
      .property-item:nth-child(4) { animation-delay: 0.4s; }

      .property-icon {
        font-size: 20px;
      }

      .property-text {
        font-size: 14px;
      }

      /* Composition Panel */
      .molecule-display {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        margin: 20px 0;
      }

      .atom {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 20px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        animation: bounceIn 0.5s;
      }

      .atom-hydrogen {
        background: radial-gradient(circle at 30% 30%, #ffffff, #e0e0e0);
        color: #333;
      }

      .atom-oxygen {
        background: radial-gradient(circle at 30% 30%, #ff6b6b, #cc0000);
      }

      .bond {
        width: 30px;
        height: 3px;
        background: #4ecdc4;
        animation: expandWidth 0.5s;
      }

      .formula-display {
        text-align: center;
        margin-top: 10px;
        font-size: 24px;
        font-weight: bold;
        color: white;
      }

      /* Structure Panel */
      .structure-display {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 20px 0;
        position: relative;
        height: 120px;
      }

      .structure-molecule {
        position: relative;
        animation: rotate3d 10s linear infinite;
        transform-style: preserve-3d;
      }

      .structure-atom {
        position: absolute;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 16px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
      }

      .structure-bond {
        position: absolute;
        background: #4ecdc4;
        height: 3px;
        transform-origin: left center;
      }

      .angle-display {
        position: absolute;
        bottom: -20px;
        left: 50%;
        transform: translateX(-50%);
        color: #4ecdc4;
        font-size: 14px;
        font-weight: bold;
      }

      /* Animations */
      @keyframes fadeInDown {
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes fadeIn {
        to {
          opacity: 1;
        }
      }

      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
      }

      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes bounceIn {
        0% {
          transform: scale(0);
        }
        50% {
          transform: scale(1.2);
        }
        100% {
          transform: scale(1);
        }
      }

      @keyframes expandWidth {
        from {
          width: 0;
        }
        to {
          width: 30px;
        }
      }

      @keyframes rotate3d {
        from {
          transform: rotateY(0deg);
        }
        to {
          transform: rotateY(360deg);
        }
      }

      /* Mobile responsiveness */
      @media (max-width: 600px) {
        .branches-container {
          flex-direction: column;
          gap: 15px;
          align-items: center;
        }

        .branch-card {
          width: 200px;
        }

        .main-title {
          font-size: 24px;
        }

        .definition-text {
          font-size: 14px;
        }
      }
    </style>

    <div id="animation-container">
      <!-- Title Section -->
      <div class="title-section">
        <h1 class="main-title">What is Chemistry?</h1>
        <p class="definition-text">
          Chemistry is the branch of science that deals with the
          <span class="highlight" data-branch="properties">properties</span>,
          <span class="highlight" data-branch="composition">composition</span>, and
          <span class="highlight" data-branch="structure">structure</span>
          of substances, as well as the physical and chemical changes in matter.
        </p>
      </div>

      <!-- Branch Cards -->
      <div class="branches-container">
        <div class="branch-card" data-branch="properties">
          <div class="branch-icon">🔬</div>
          <div class="branch-title">Properties</div>
          <div class="branch-subtitle">What it's like</div>
        </div>

        <div class="branch-card" data-branch="composition">
          <div class="branch-icon">⚛️</div>
          <div class="branch-title">Composition</div>
          <div class="branch-subtitle">What it's made of</div>
        </div>

        <div class="branch-card" data-branch="structure">
          <div class="branch-icon">🧬</div>
          <div class="branch-title">Structure</div>
          <div class="branch-subtitle">How it's arranged</div>
        </div>
      </div>

      <!-- Content Panels -->
      <div class="content-panel" id="properties-panel">
        <div class="panel-title">Properties of Matter</div>
        <div class="panel-content">
          <div class="element-display">
            <div class="element-box">
              <div class="element-symbol">O</div>
              <div class="element-name">Oxygen</div>
            </div>
            <div class="properties-list">
              <div class="property-item">
                <span class="property-icon">🌡️</span>
                <span class="property-text">Boiling point: -183°C</span>
              </div>
              <div class="property-item">
                <span class="property-icon">💨</span>
                <span class="property-text">Colorless gas</span>
              </div>
              <div class="property-item">
                <span class="property-icon">🔥</span>
                <span class="property-text">Supports combustion</span>
              </div>
              <div class="property-item">
                <span class="property-icon">⚗️</span>
                <span class="property-text">Highly reactive</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="content-panel" id="composition-panel">
        <div class="panel-title">Composition of Matter</div>
        <div class="panel-content">
          <div class="molecule-display">
            <div class="atom atom-hydrogen">H</div>
            <div class="bond"></div>
            <div class="atom atom-oxygen">O</div>
            <div class="bond"></div>
            <div class="atom atom-hydrogen">H</div>
          </div>
          <div class="formula-display">H₂O = 2 Hydrogen + 1 Oxygen</div>
          <p style="text-align: center; margin-top: 10px; font-size: 14px;">
            Water is composed of hydrogen and oxygen atoms in a 2:1 ratio
          </p>
        </div>
      </div>

      <div class="content-panel" id="structure-panel">
        <div class="panel-title">Structure of Matter</div>
        <div class="panel-content">
          <div class="structure-display">
            <div class="structure-molecule">
              <div class="structure-atom atom-oxygen" style="left: 50px; top: 40px;">O</div>
              <div class="structure-atom atom-hydrogen" style="left: 20px; top: 80px;">H</div>
              <div class="structure-atom atom-hydrogen" style="left: 80px; top: 80px;">H</div>
              <div class="structure-bond" style="left: 50px; top: 50px; width: 40px; transform: rotate(140deg);"></div>
              <div class="structure-bond" style="left: 70px; top: 50px; width: 40px; transform: rotate(40deg);"></div>
            </div>
            <div class="angle-display">Bond angle: 104.5°</div>
          </div>
          <p style="text-align: center; font-size: 14px;">
            The bent shape of water gives it unique properties like polarity
          </p>
        </div>
      </div>
    </div>

    <script>
      // Initialize animation
      let currentPanel = null;
      // Local animationSpeed variable is removed, use window.animationState.speed

      // Get all interactive elements
      const highlights = document.querySelectorAll('.highlight');
      const branchCards = document.querySelectorAll('.branch-card');
      const contentPanels = document.querySelectorAll('.content-panel');

      // Add click handlers to highlights
      highlights.forEach(highlight => {
        highlight.addEventListener('click', () => {
          const branch = highlight.dataset.branch;
          showPanel(branch);
        });
      });

      // Add click handlers to branch cards
      branchCards.forEach(card => {
        card.addEventListener('click', () => {
          const branch = card.dataset.branch;
          showPanel(branch);
        });
      });

      // Show panel function
       function showPanel(branch) {
    branchCards.forEach(card => card.classList.remove('active'));
    contentPanels.forEach(panel => panel.classList.remove('active'));

    const panel = document.getElementById(branch + '-panel');
    if (panel) {
      const card = document.querySelector('.branch-card[data-branch="' + branch + '"]');
      if (card) card.classList.add('active');
      setTimeout(() => {
        panel.classList.add('active');
        if (branch === 'properties') {
          resetPropertyAnimations(window.animationState.speed);
        } else if (branch === 'composition') {
          resetCompositionAnimations(window.animationState.speed);
        }
      }, 50);
      currentPanel = branch;
    }
  }

      // Reset animations and apply current speed
      function resetPropertyAnimations(currentSpeed) {
    const items = document.querySelectorAll('#properties-panel .property-item');
    items.forEach((item, index) => {
      item.style.animation = 'none';
      item.offsetHeight;
      const baseDuration = 0.5;
      const baseDelay = index * 0.1;
      item.style.animationName = 'slideInRight';
      item.style.animationDuration = (baseDuration / currentSpeed) + 's';
      item.style.animationDelay = (baseDelay / currentSpeed) + 's';
      item.style.animationFillMode = 'forwards';
      item.style.animationTimingFunction = 'ease';
    });
  }

  function resetCompositionAnimations(currentSpeed) {
    const atoms = document.querySelectorAll('#composition-panel .molecule-display .atom');
    const bonds = document.querySelectorAll('#composition-panel .molecule-display .bond');
    const baseDuration = 0.5;

    atoms.forEach(atom => {
      atom.style.animation = 'none';
      atom.offsetHeight;
      atom.style.animationName = 'bounceIn';
      atom.style.animationDuration = (baseDuration / currentSpeed) + 's';
      atom.style.animationFillMode = 'forwards';
    });

    bonds.forEach(bond => {
      bond.style.animation = 'none';
      bond.offsetHeight;
      bond.style.animationName = 'expandWidth';
      bond.style.animationDuration = (baseDuration / currentSpeed) + 's';
      bond.style.animationFillMode = 'forwards';
    });
  }

      // Function to adjust durations of CSS-defined animations
        function updateStaticCssAnimationSpeeds(currentSpeed) {
    const speedMultiplier = 1 / currentSpeed;

    const titleSection = document.querySelector('.title-section');
    if (titleSection) {
      titleSection.style.animationDuration = (1 * speedMultiplier) + 's';
    }

    const branchesContainer = document.querySelector('.branches-container');
    if (branchesContainer) {
      branchesContainer.style.animationDuration = (1 * speedMultiplier) + 's';
      branchesContainer.style.animationDelay = (0.5 * speedMultiplier) + 's';
    }

    const elementBox = document.querySelector('#properties-panel .element-box');
    if (elementBox) {
      elementBox.style.animationDuration = (2 * speedMultiplier) + 's';
    }

    const structureMolecule = document.querySelector('#structure-panel .structure-molecule');
    if (structureMolecule) {
      structureMolecule.style.animationDuration = (10 * speedMultiplier) + 's';
    }
  }

        // Add any other elements with CSS @keyframe animations here
      }


      // Auto-show first panel after intro, respecting initial speed
      // This needs to wait for window.animationState to be potentially updated by initialState
      window.addEventListener('load', () => {
        // Initialize animations with the current speed
        updateStaticCssAnimationSpeeds(window.animationState.speed);

        // If properties panel is the first one, its animations will be set by showPanel
        setTimeout(() => {
          showPanel('properties');
        }, 2000 / window.animationState.speed);


        // Set up handler for future speed changes from React Native
        window.handleControlUpdate = function(control, value) {
          if (control === 'speed') {
            updateStaticCssAnimationSpeeds(value);
            // If a panel is active, re-apply its dynamic animations with new speed
            if (currentPanel === 'properties') {
              resetPropertyAnimations(value);
            } else if (currentPanel === 'composition') {
              resetCompositionAnimations(value);
            }
          }
          // Handle other controls if necessary for this specific animation
        };

        // Send ready message
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'animationReady',
            animation: 'chemistry-definition'
          }));
        }
      });
    </script>
  </body>
  </html>
`
};
