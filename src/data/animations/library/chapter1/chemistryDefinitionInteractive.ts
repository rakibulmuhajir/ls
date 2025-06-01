// src/data/animations/library/chapter1/chemistryDefinitionInteractive.ts
import { AnimationConfig } from '../../types';
import { baseAnimationTemplate } from '../baseAnimationTemplate';

// Scene definitions with additional examples
const openingDuration = 2;
const definitionDisplayAndHighlightDuration = 2.5;
const finalDefinitionSummaryDuration = 3.5;

// Durations for explanation content scenes
const branchExplanationDuration = 4;
const propertyExplanationDuration = 2;
const compositionExplanationDuration = 2.5;
const physicalChangeExplanationDuration = 3;
const chemicalChangeExplanationDuration = 4;
const lawExplanationDuration = 2;

const configScenes = [];
const configDurations = [];

// 1. Opening Title
configScenes.push('opening');                           configDurations.push(openingDuration);

// 2. Initial Definition view
configScenes.push('definition-show-initial');           configDurations.push(definitionDisplayAndHighlightDuration);

// 3. Branch of Science
configScenes.push('definition-highlight-branch');       configDurations.push(definitionDisplayAndHighlightDuration);
configScenes.push('branch-of-science-content');         configDurations.push(branchExplanationDuration);

// 4. Properties
configScenes.push('definition-highlight-properties');   configDurations.push(definitionDisplayAndHighlightDuration);
configScenes.push('property-1-content');                configDurations.push(propertyExplanationDuration);
configScenes.push('property-2-content');                configDurations.push(propertyExplanationDuration);
configScenes.push('property-3-content');                configDurations.push(propertyExplanationDuration);

// 5. Composition & Structure
configScenes.push('definition-highlight-composition');  configDurations.push(definitionDisplayAndHighlightDuration);
configScenes.push('composition-1-content');             configDurations.push(compositionExplanationDuration);
configScenes.push('composition-2-content');             configDurations.push(compositionExplanationDuration);
configScenes.push('composition-3-content');             configDurations.push(compositionExplanationDuration);

// 6. Physical Changes - Added ammonia and CO2 examples
configScenes.push('definition-highlight-physical');     configDurations.push(definitionDisplayAndHighlightDuration);
configScenes.push('physical-changes-1-content');        configDurations.push(physicalChangeExplanationDuration);
configScenes.push('physical-changes-2-content');        configDurations.push(physicalChangeExplanationDuration);
configScenes.push('physical-changes-3-content');        configDurations.push(physicalChangeExplanationDuration);

// 7. Chemical Changes - Added more examples, removed subtitles
configScenes.push('definition-highlight-chemical');     configDurations.push(definitionDisplayAndHighlightDuration);
configScenes.push('chemical-changes-1-content');        configDurations.push(chemicalChangeExplanationDuration);
configScenes.push('chemical-changes-2-content');        configDurations.push(chemicalChangeExplanationDuration);
configScenes.push('chemical-changes-3-content');        configDurations.push(chemicalChangeExplanationDuration);

// 8. Laws
configScenes.push('definition-highlight-laws');         configDurations.push(definitionDisplayAndHighlightDuration);
configScenes.push('law-1-content');                     configDurations.push(lawExplanationDuration);
configScenes.push('law-2-content');                     configDurations.push(lawExplanationDuration);
configScenes.push('law-3-content');                     configDurations.push(lawExplanationDuration);
configScenes.push('law-4-content');                     configDurations.push(lawExplanationDuration);

// 9. Final Definition Summary
configScenes.push('final-definition-summary');          configDurations.push(finalDefinitionSummaryDuration);

const newTotalDuration = configDurations.reduce((a, b) => a + b, 0);

export const chemistryDefinitionInteractive: AnimationConfig = {
  height: 600,
  autoPlay: false,
  loop: false,
  features: {
    speed: true,
  },
  template: {
    type: 'definition',
    config: {
      scenes: configScenes,
      sceneDurations: configDurations,
      totalDuration: newTotalDuration
    }
  },
  html: baseAnimationTemplate.replace('</body>', '') + `
    <style>
      body {
        margin: 0;
        padding: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        color: white;
      }

      #animation-container {
        width: 100vw;
        height: 100vh;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        transform-origin: center center;
        transition: transform 0.3s ease;
      }

      #canvas-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
      }

      #ui-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 10;
        padding: 1rem;
        box-sizing: border-box;
        transform-origin: center center;
        transition: transform 0.3s ease;
      }

      .scene-title {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.95);
        font-size: 3rem;
        font-weight: bold;
        text-align: center;
        opacity: 0; visibility: hidden;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        transition: opacity 0.8s ease, transform 0.8s ease, visibility 0s linear 0.8s;
      }
      .scene-title.visible {
        opacity: 1; visibility: visible;
        transform: translate(-50%, -50%) scale(1);
        transition-delay: 0s;
      }

      .section-title {
        position: absolute;
        top: 8%;
        left: 50%;
        transform: translateX(-50%) translateY(-20px) scale(0.95);
        font-size: 1.5rem;
        font-weight: bold;
        text-align: center;
        opacity: 0; visibility: hidden;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        color: #FFD700;
        width: 90%;
        transition: opacity 0.8s ease, transform 0.8s ease, visibility 0s linear 0.8s;
      }
      .section-title.visible {
        opacity: 1; visibility: visible;
        transform: translateX(-50%) translateY(0) scale(1);
        transition-delay: 0s;
      }

      .property-subtitle {
        position: absolute;
        top: 15%;
        left: 50%;
        transform: translateX(-50%) translateY(-10px) scale(0.95);
        font-size: 1.4rem;
        font-weight: bold;
        text-align: center;
        opacity: 0; visibility: hidden;
        color: rgba(255,255,255,0.9);
        background: rgba(0,0,0,0.5);
        padding: 0.5rem 1rem;
        border-radius: 8px;
        width: auto;
        max-width: 80%;
        transition: opacity 0.8s ease, transform 0.8s ease, visibility 0s linear 0.8s;
      }
      .property-subtitle.visible {
        opacity: 1; visibility: visible;
        transform: translateX(-50%) translateY(0) scale(1);
        transition-delay: 0s;
      }

      .definition-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.95);
        background: rgba(0,0,0,0.85);
        padding: 2.5rem 3rem;
        border-radius: 20px;
        font-size: 1.3rem;
        max-width: 90%;
        width: auto;
        min-width: 300px;
        text-align: center;
        opacity: 0; visibility: hidden;
        line-height: 1.7;
        border: 3px solid #FFD700;
        transition: opacity 0.8s ease, transform 0.8s ease, visibility 0s linear 0.8s;
        box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
      }
      .definition-text.visible {
        opacity: 1; visibility: visible;
        transform: translate(-50%, -50%) scale(1);
        transition-delay: 0s;
      }

      .highlight-word {
        transition: all 0.5s ease;
        padding: 0.1em 0.25em;
        border-radius: 4px;
        display: inline-block;
      }
      .highlight-word.active {
        background: linear-gradient(45deg, #FFD700, #FFA500);
        color: #333;
        font-weight: bold;
        box-shadow: 0 0 15px rgba(255, 215, 0, 0.75);
        animation: activeHighlightPulseAnim 1.5s ease-in-out infinite alternate;
        transform: scale(1.06);
      }
      @keyframes activeHighlightPulseAnim {
        to { opacity: 0.9; transform: scale(1.09); box-shadow: 0 2px 18px rgba(255, 200, 0, 0.8); }
      }
      .highlight-word.explained {
        background-color: rgba(78, 205, 196, 0.22);
        border-bottom: 2px dotted rgba(78, 205, 196, 0.65);
        color: #E8E8E8;
        font-weight: normal;
        transform: scale(1);
        animation: none;
        opacity: 0.95;
      }

      .science-tree {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -40%) scale(0.95);
        opacity: 0; visibility: hidden;
        transition: opacity 0.8s ease, transform 0.8s ease, visibility 0s linear 0.8s;
        width: 100%;
        max-width: 500px;
      }
      .science-tree.visible {
        opacity: 1; visibility: visible;
        transform: translate(-50%, -40%) scale(1);
        transition-delay: 0s;
      }

      .science-center {
        width: 60px; height: 60px;
        background: radial-gradient(circle at 30% 30%, #FFD700, #FFA000);
        border-radius: 50%; display: flex; align-items: center; justify-content: center;
        font-size: 0.8rem; font-weight: bold; color: #333;
        margin: 0 auto 35px; box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
        animation: centerPulseAnimCSS 2s ease-in-out infinite;
      }
      @keyframes centerPulseAnimCSS {0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }

      .branches-container { display: flex; justify-content: center; gap: 15px; position: relative; flex-wrap: wrap; }
      .branch-card {
        background: rgba(255,255,255,0.15); padding: 1rem; border-radius: 12px;
        text-align: center; min-width: 90px; backdrop-filter: blur(10px);
        border: 2px solid rgba(255,255,255,0.2); transition: all 0.5s ease;
        position: relative; cursor: default; margin: 0.25rem;
      }
      .branch-card.chemistry {
        min-width: 120px; transform: scale(1.1);
        background: rgba(255,215,0,0.2); border: 3px solid #FFD700;
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
      }
      .branch-card.active-highlight {
        transform: scale(1.25);
        background: rgba(255,215,0,0.35); border: 3px solid #FFEB3B;
        box-shadow: 0 0 25px rgba(255, 215, 0, 0.5);
      }
      .branch-icon { font-size: 2rem; margin-bottom: 0.5rem; }
      .branch-title { font-size: 0.9rem; font-weight: bold; }

      .single-item-container {
        position: absolute;
        top: 55%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.95);
        opacity: 0; visibility: hidden;
        transition: opacity 0.8s ease, transform 0.8s ease, visibility 0s linear 0.8s;
        text-align: center;
        width: 90%;
        max-width: 400px;
      }
      .single-item-container.visible {
        opacity: 1; visibility: visible;
        transform: translate(-50%, -50%) scale(1);
        transition-delay: 0s;
      }

      .property-showcase, .composition-showcase, .law-showcase, .reaction-demo-card, .phase-change-card {
        background: rgba(255,255,255,0.1); border-radius: 20px; padding: 2rem;
        backdrop-filter: blur(10px); border: 2px solid rgba(255,255,255,0.2);
        transition: all 0.3s ease;
        min-height: 200px; display: flex; flex-direction: column; justify-content: center;
      }

      .property-visual { width: 80px; height: 80px; margin: 0 auto 1rem; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 2rem; position: relative; overflow: hidden; }
      .liquid { background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%); }
      .solid { background: linear-gradient(45deg, #90A4AE 0%, #607D8B 100%); }
      .gas { background: linear-gradient(135deg, #E1F5FE 0%, #B3E5FC 100%); }
      .property-title { font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem; color: #FFD700; }
      .property-value { font-size: 1.2rem; background: rgba(255,193,7,0.9); color: #333; padding: 0.5rem 1rem; border-radius: 8px; font-weight: bold; display: inline-block; margin-top: 0.5rem; }

      .composition-icon { font-size: 3rem; margin-bottom: 1rem; }
      .composition-name { font-size: 1.4rem; font-weight: bold; margin-bottom: 1rem; color: #FFD700; }
      .molecule-structure { display: flex; align-items: center; justify-content: center; margin: 1rem 0; flex-wrap: wrap; gap: 0.25rem; min-height: 40px; }
      .atom { width: 35px; height: 35px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; margin: 0.125rem; color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.5); position: relative; animation: atomPulseCSS 2s ease-in-out infinite; font-size: 0.8rem; }
      .sodium { background: radial-gradient(circle at 30% 30%, #FFD700, #FFA000); }
      .chlorine { background: radial-gradient(circle at 30% 30%, #4CAF50, #388E3C); }
      .hydrogen { background: radial-gradient(circle at 30% 30%, #FFFFFF, #E0E0E0); color: #333; }
      .oxygen { background: radial-gradient(circle at 30% 30%, #F44336, #C62828); }
      .carbon { background: radial-gradient(circle at 30% 30%, #333333, #000000); }
      .nitrogen { background: radial-gradient(circle at 30% 30%, #2196F3, #1976D2); }
      @keyframes atomPulseCSS { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
      .bond { width: 20px; height: 3px; background: #4ECDC4; animation: bondGlowCSS 2s ease-in-out infinite; }
      @keyframes bondGlowCSS { 0%, 100% { box-shadow: 0 0 3px #4ECDC4; } 50% { box-shadow: 0 0 8px #4ECDC4; } }
      .info-text { font-size: 1rem; margin-top: 1rem; color: rgba(255,255,255,0.9); background: rgba(0,0,0,0.3); padding: 0.5rem 1rem; border-radius: 8px; }

      .phase-change-card-content { display: flex; align-items: center; gap: 1rem; justify-content:center; }
      .phase-visual { width: 60px; height: 60px; border-radius: 10px; margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
      .ice { background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%); }
      .water { background: linear-gradient(135deg, #4FC3F7 0%, #29B6F6 100%); }
      .vapor { background: linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%); }
      .arrow-right { font-size: 1.5rem; color: #FFD700; animation: arrowPulseCSS 1s ease-in-out infinite; }
      @keyframes arrowPulseCSS { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }

      .reaction-equation { font-size: 1.5rem; text-align: center; margin-bottom: 1rem; font-family: 'Courier New', monospace; color: #FFD700; background: rgba(0,0,0,0.3); padding: 0.5rem 1rem; border-radius: 8px; }
      .reaction-visual { display: flex; align-items: center; justify-content: center; gap: 0.5rem; flex-wrap: wrap; }
      .reactant, .product { padding: 0.5rem; background: rgba(255,255,255,0.1); border-radius: 8px; text-align: center; min-width: 60px; font-size: 0.8rem; }
      .plus, .arrow-reaction { font-size: 1.2rem; color: #FFD700; align-self: center; }

      .law-icon { font-size: 3rem; margin-bottom: 1rem; }
      .law-title { font-size: 1.3rem; font-weight: bold; margin-bottom: 1rem; color: #FFD700; }
      .law-description { font-size: 1rem; line-height: 1.5; color: rgba(255,255,255,0.9); }

      .controls { position: absolute; bottom: 60px; right: 15px; display: flex; gap: 8px; z-index: 20; pointer-events: auto; flex-direction: column; align-items: flex-end; }
      .control-row { display: flex; gap: 8px; margin-bottom: 8px; }
      .control-btn { background: rgba(255,255,255,0.2); border: none; color: white; padding: 8px 15px; border-radius: 20px; cursor: pointer; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3); transition: all 0.3s ease; font-size: 12px; }
      .control-btn:hover { background: rgba(255,255,255,0.3); transform: translateY(-1px); }
      .control-btn.active { background: rgba(255,215,0,0.3); border-color: #FFD700; }
      .progress-bar { position: absolute; bottom: 50px; left: 0; height: 3px; background: #FFD700; transition: width 0.5s ease; z-index: 20; width: 0%; }

      /* Mobile Optimizations */
      @media (max-width: 768px) {
        .scene-title { font-size: 2.5rem; padding: 0 1rem; }
        .section-title { font-size: 1.3rem; padding: 0 1rem; top: 10%; }
        .definition-text { font-size: 1rem; max-width: 95%; padding: 1.5rem; }
        .single-item-container { width: 95%; max-width: none; padding: 0 0.5rem; }
        .property-showcase, .composition-showcase, .law-showcase, .reaction-demo-card, .phase-change-card { padding: 1.5rem; }
        .controls { bottom: 50px; right: 10px; }
        .progress-bar { bottom: 40px; }
      }
      @media (max-width: 480px) {
        .scene-title { font-size: 2rem; }
        .section-title { font-size: 1.1rem; }
        .definition-text { font-size: 0.9rem; padding: 1rem; }
        .property-showcase, .composition-showcase, .law-showcase, .reaction-demo-card, .phase-change-card { padding: 1rem; }
        .reaction-equation { font-size: 1.2rem; }
        .control-btn { padding: 6px 12px; font-size: 11px; }
        .controls { flex-direction: row; bottom: 10px; right: 50%; transform: translateX(50%); }
        .control-row { margin-bottom: 0; }
      }
    </style>

    <div id="animation-container">
      <div id="canvas-container"></div>
      <div id="ui-overlay">
        <!-- Scene: Opening Title -->
        <div class="scene-title" id="title">Chemistry</div>

        <!-- Main Definition Text -->
        <div class="definition-text" id="main-definition">
          <strong>Chemistry</strong> is the <span id="highlight-branch" class="highlight-word">branch of science</span> that deals with the
          <span id="highlight-properties" class="highlight-word">properties</span>,
          <span id="highlight-composition" class="highlight-word">composition</span>, and
          <span id="highlight-structure" class="highlight-word">structure</span> of substances, as well as the
          <span id="highlight-physical" class="highlight-word">physical</span> and <span id="highlight-chemical" class="highlight-word">chemical changes</span>
          in matter and the <span id="highlight-laws" class="highlight-word">laws or principles</span>
          that govern these changes.
        </div>

        <!-- Branch of Science Content -->
        <div class="section-title" id="section-title-branch">1. Branch of Science</div>
        <div class="science-tree" id="science-tree-content">
          <div class="science-center">SCIENCE</div>
          <div class="branches-container">
            <div class="branch-card chemistry" id="chemistry-branch">
              <div class="branch-icon">🧪</div><div class="branch-title">Chemistry</div>
            </div>
            <div class="branch-card"><div class="branch-icon">🔬</div><div class="branch-title">Biology</div></div>
            <div class="branch-card"><div class="branch-icon">📐</div><div class="branch-title">Physics</div></div>
          </div>
        </div>

        <!-- Properties Content -->
        <div class="section-title" id="section-title-properties">2. Substance Properties</div>
        <div class="property-subtitle" id="property-subtitle-1">Density</div>
        <div class="single-item-container" id="property-1">
          <div class="property-showcase">
            <div class="property-visual liquid">💧</div><div class="property-title">Water</div>
            <div class="property-value">Density: 1.0 g/mL</div>
          </div>
        </div>
        <div class="property-subtitle" id="property-subtitle-2">Color</div>
        <div class="single-item-container" id="property-2">
          <div class="property-showcase">
            <div class="property-visual solid">⚫</div><div class="property-title">Carbon</div>
            <div class="property-value">Color: Black</div>
          </div>
        </div>
        <div class="property-subtitle" id="property-subtitle-3">Boiling Point</div>
        <div class="single-item-container" id="property-3">
          <div class="property-showcase">
            <div class="property-visual gas">💨</div><div class="property-title">Nitrogen</div>
            <div class="property-value">Boiling: -196°C</div>
          </div>
        </div>

        <!-- Composition & Structure Content -->
        <div class="section-title" id="section-title-composition">3. Composition & Structure</div>
        <div class="property-subtitle" id="composition-subtitle-1">Salt (NaCl)</div>
        <div class="single-item-container" id="composition-1">
          <div class="composition-showcase">
            <div class="composition-icon">🧂</div><div class="composition-name">Salt (NaCl)</div>
            <div class="molecule-structure"><div class="atom sodium">Na</div><div class="bond"></div><div class="atom chlorine">Cl</div></div>
            <div class="info-text">Ionic Compound</div>
          </div>
        </div>
        <div class="property-subtitle" id="composition-subtitle-2">Water (H₂O)</div>
        <div class="single-item-container" id="composition-2">
          <div class="composition-showcase">
            <div class="composition-icon">💧</div><div class="composition-name">Water (H₂O)</div>
            <div class="molecule-structure"><div class="atom hydrogen">H</div><div class="bond"></div><div class="atom oxygen">O</div><div class="bond"></div><div class="atom hydrogen">H</div></div>
            <div class="info-text">Covalent Compound</div>
          </div>
        </div>
        <div class="property-subtitle" id="composition-subtitle-3">Sugar (C₆H₁₂O₆)</div>
        <div class="single-item-container" id="composition-3">
          <div class="composition-showcase">
            <div class="composition-icon">🍯</div><div class="composition-name">Sugar (C₆H₁₂O₆)</div>
            <div class="molecule-structure"><div class="atom carbon">C</div><div class="atom hydrogen">H</div><div class="atom oxygen">O</div></div>
            <div class="info-text">Complex Organic</div>
          </div>
        </div>

        <!-- Physical Changes Content - Added Ammonia and CO2 examples -->
        <div class="section-title" id="section-title-physical">4. Physical Changes</div>
        <div class="property-subtitle" id="physical-subtitle-1">Water States</div>
        <div class="single-item-container" id="physical-changes-1">
          <div class="phase-change-card">
            <div class="phase-change-card-content">
              <div style="text-align: center;"><div class="phase-visual ice">🧊</div><div>Ice</div></div>
              <div class="arrow-right">→</div>
              <div style="text-align: center;"><div class="phase-visual water">💧</div><div>Water</div></div>
              <div class="arrow-right">→</div>
              <div style="text-align: center;"><div class="phase-visual vapor">☁️</div><div>Steam</div></div>
            </div>
            <div class="info-text">Changes state, not identity.</div>
          </div>
        </div>
        <div class="property-subtitle" id="physical-subtitle-2">Ammonia (NH₃)</div>
        <div class="single-item-container" id="physical-changes-2">
          <div class="phase-change-card">
            <div class="phase-change-card-content">
              <div style="text-align: center;"><div class="phase-visual ice">❄️</div><div>Solid NH₃</div></div>
              <div class="arrow-right">→</div>
              <div style="text-align: center;"><div class="phase-visual water">💨</div><div>Liquid NH₃</div></div>
              <div class="arrow-right">→</div>
              <div style="text-align: center;"><div class="phase-visual vapor">☁️</div><div>Gas NH₃</div></div>
            </div>
            <div class="info-text">Ammonia changing phases.</div>
          </div>
        </div>
        <div class="property-subtitle" id="physical-subtitle-3">Carbon Dioxide (CO₂)</div>
        <div class="single-item-container" id="physical-changes-3">
          <div class="phase-change-card">
            <div class="phase-change-card-content">
              <div style="text-align: center;"><div class="phase-visual ice">🧊</div><div>Dry Ice</div></div>
              <div class="arrow-right">→</div>
              <div style="text-align: center;"><div class="phase-visual vapor">💨</div><div>CO₂ Gas</div></div>
            </div>
            <div class="info-text">Sublimation: solid to gas directly.</div>
          </div>
        </div>

        <!-- Chemical Changes Content - Removed subtitles, added more examples -->
        <div class="section-title" id="section-title-chemical">5. Chemical Changes</div>
        <div class="single-item-container" id="chemical-changes-1">
          <div class="reaction-demo-card">
            <div class="reaction-equation">2H₂ + O₂ → 2H₂O</div>
            <div class="reaction-visual">
              <div class="reactant"><div class="molecule-structure"><div class="atom hydrogen">H</div><div class="bond"></div><div class="atom hydrogen">H</div></div><div>Hydrogen</div></div>
              <div class="plus">+</div>
              <div class="reactant"><div class="molecule-structure"><div class="atom oxygen">O</div><div class="bond"></div><div class="atom oxygen">O</div></div><div>Oxygen</div></div>
              <div class="arrow-reaction">→</div>
              <div class="product"><div class="molecule-structure"><div class="atom hydrogen">H</div><div class="bond"></div><div class="atom oxygen">O</div><div class="bond"></div><div class="atom hydrogen">H</div></div><div>Water</div></div>
            </div>
            <div class="info-text">New substance (water) formed.</div>
          </div>
        </div>
        <div class="single-item-container" id="chemical-changes-2">
          <div class="reaction-demo-card">
            <div class="reaction-equation">CH₄ + 2O₂ → CO₂ + 2H₂O</div>
            <div class="reaction-visual">
              <div class="reactant"><div class="molecule-structure"><div class="atom carbon">C</div><div class="atom hydrogen">H₄</div></div><div>Methane</div></div>
              <div class="plus">+</div><div class="reactant"><div class="molecule-structure"><div class="atom oxygen">O₂</div></div><div>Oxygen</div></div>
              <div class="arrow-reaction">→</div><div class="product"><div class="molecule-structure"><div class="atom carbon">C</div><div class="atom oxygen">O₂</div></div><div>CO₂ + H₂O</div></div>
            </div>
            <div class="info-text">Combustion reaction.</div>
          </div>
        </div>
        <div class="single-item-container" id="chemical-changes-3">
          <div class="reaction-demo-card">
            <div class="reaction-equation">4Fe + 3O₂ → 2Fe₂O₃</div>
            <div class="reaction-visual">
              <div class="reactant"><div class="molecule-structure"><div class="atom" style="background: radial-gradient(circle at 30% 30%, #B0B0B0, #808080);">Fe</div></div><div>Iron</div></div>
              <div class="plus">+</div><div class="reactant"><div class="molecule-structure"><div class="atom oxygen">O₂</div></div><div>Oxygen</div></div>
              <div class="arrow-reaction">→</div><div class="product"><div class="molecule-structure"><div class="atom" style="background: radial-gradient(circle at 30% 30%, #CD853F, #A0522D);">Fe₂O₃</div></div><div>Rust</div></div>
            </div>
            <div class="info-text">Iron oxidation (rusting).</div>
          </div>
        </div>

        <!-- Laws Content - Added judge emoji -->
        <div class="section-title" id="section-title-laws">6. Study of Laws</div>
        <div class="single-item-container" id="law-1">
          <div class="law-showcase">
            <div class="law-icon">👨‍⚖️</div><div class="law-title">Conservation of Mass</div>
            <div class="law-description">Mass is not created or destroyed.</div>
          </div>
        </div>
        <div class="single-item-container" id="law-2">
          <div class="law-showcase">
            <div class="law-icon">🔨</div><div class="law-title">Conservation of Energy</div>
            <div class="law-description">Energy changes form, not lost.</div>
          </div>
        </div>
        <div class="single-item-container" id="law-3">
          <div class="law-showcase">
            <div class="law-icon">⚖️</div><div class="law-title">Le Chatelier's Principle</div>
            <div class="law-description">Equilibrium shifts to relieve stress.</div>
          </div>
        </div>
        <div class="single-item-container" id="law-4">
          <div class="law-showcase">
            <div class="law-icon">👩‍⚖️</div><div class="law-title">Definite Proportions</div>
            <div class="law-description">Compounds have fixed element ratios.</div>
          </div>
        </div>

      </div>

      <div class="controls">
        <div class="control-row">
          <button class="control-btn" id="slow-btn" onclick="window.setSpeed(0.5)">🐌 Slow</button>
          <button class="control-btn" id="normal-btn" onclick="window.setSpeed(1)">🚶 Normal</button>
          <button class="control-btn active" id="fast-btn" onclick="window.setSpeed(2)">🏃 Fast</button>
        </div>
        <div class="control-row">
          <button class="control-btn" onclick="window.restartAnimation()">🔄 Restart</button>
          <button class="control-btn" onclick="window.togglePause()" id="pauseBtnEl">▶️ Play</button>
        </div>
      </div>
      <div class="progress-bar" id="progressBarEl"></div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
        var currentSceneIdx = 0;
        var isPlaying = false;
        var animationProgress = 0;
        var threeScene, threeCamera, threeRenderer;
        var particles = [];
        var currentZoom = 1;
        var currentSpeed = 2; // Start with fast speed

        var scenes = ${JSON.stringify(configScenes)};
        var sceneDurations = ${JSON.stringify(configDurations)};
        var totalDuration = ${newTotalDuration};

        var explainedHighlightTermIds = [];
        var currentActiveTermId = null;

        var definitionHighlightMap = {
            'definition-highlight-branch': 'highlight-branch',
            'definition-highlight-properties': 'highlight-properties',
            'definition-highlight-composition': ['highlight-composition', 'highlight-structure'],
            'definition-highlight-physical': 'highlight-physical',
            'definition-highlight-chemical': 'highlight-chemical',
            'definition-highlight-laws': 'highlight-laws'
        };

        var contentSceneDetailsMap = {
            'branch-of-science-content': { mainDivId: 'science-tree-content', sectionTitleId: 'section-title-branch' },
            'property-1-content': { mainDivId: 'property-1', sectionTitleId: 'section-title-properties', subtitleId: 'property-subtitle-1' },
            'property-2-content': { mainDivId: 'property-2', sectionTitleId: 'section-title-properties', subtitleId: 'property-subtitle-2' },
            'property-3-content': { mainDivId: 'property-3', sectionTitleId: 'section-title-properties', subtitleId: 'property-subtitle-3' },
            'composition-1-content': { mainDivId: 'composition-1', sectionTitleId: 'section-title-composition', subtitleId: 'composition-subtitle-1' },
            'composition-2-content': { mainDivId: 'composition-2', sectionTitleId: 'section-title-composition', subtitleId: 'composition-subtitle-2' },
            'composition-3-content': { mainDivId: 'composition-3', sectionTitleId: 'section-title-composition', subtitleId: 'composition-subtitle-3' },
            'physical-changes-1-content': { mainDivId: 'physical-changes-1', sectionTitleId: 'section-title-physical', subtitleId: 'physical-subtitle-1' },
            'physical-changes-2-content': { mainDivId: 'physical-changes-2', sectionTitleId: 'section-title-physical', subtitleId: 'physical-subtitle-2' },
            'physical-changes-3-content': { mainDivId: 'physical-changes-3', sectionTitleId: 'section-title-physical', subtitleId: 'physical-subtitle-3' },
            'chemical-changes-1-content': { mainDivId: 'chemical-changes-1', sectionTitleId: 'section-title-chemical' },
            'chemical-changes-2-content': { mainDivId: 'chemical-changes-2', sectionTitleId: 'section-title-chemical' },
            'chemical-changes-3-content': { mainDivId: 'chemical-changes-3', sectionTitleId: 'section-title-chemical' },
            'law-1-content': { mainDivId: 'law-1', sectionTitleId: 'section-title-laws' },
            'law-2-content': { mainDivId: 'law-2', sectionTitleId: 'section-title-laws' },
            'law-3-content': { mainDivId: 'law-3', sectionTitleId: 'section-title-laws' },
            'law-4-content': { mainDivId: 'law-4', sectionTitleId: 'section-title-laws' }
        };

        function initThreeJS_internal() {
            if (threeScene) return;
            threeScene = new THREE.Scene();
            threeCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            threeRenderer = new THREE.WebGLRenderer({ alpha: true });
            threeRenderer.setSize(window.innerWidth, window.innerHeight);
            threeRenderer.setClearColor(0x000000, 0);
            var canvasContainer = document.getElementById('canvas-container');
            if (canvasContainer) canvasContainer.appendChild(threeRenderer.domElement);
            else { console.error("Canvas container not found!"); return; }
            createParticles_internal();
            threeCamera.position.z = 5;
            animate3D_internal();
        }

        function createParticles_internal() {
            var geometry = new THREE.SphereGeometry(0.015, 6, 6);
            var material = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.6, transparent: true });
            for (var i = 0; i < 30; i++) {
                var particle = new THREE.Mesh(geometry, material);
                particle.position.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
                particle.userData = {
                    velocity: new THREE.Vector3((Math.random() - 0.5) * 0.015, (Math.random() - 0.5) * 0.015, (Math.random() - 0.5) * 0.015),
                    originalPosition: particle.position.clone()
                };
                threeScene.add(particle); particles.push(particle);
            }
        }

        function animate3D_internal() {
            if (!threeScene) return;
            requestAnimationFrame(animate3D_internal);
            particles.forEach(function(p) {
                var sceneName = scenes[currentSceneIdx] || '';
                if (sceneName === 'opening') {
                    var time = Date.now() * 0.001 * currentSpeed;
                    var radius = 1.5 + Math.sin(time * 0.5 + p.userData.originalPosition.x) * 0.3;
                    p.position.x = Math.cos(time + p.userData.originalPosition.x) * radius;
                    p.position.y = Math.sin(time + p.userData.originalPosition.y) * radius;
                    p.position.z = Math.sin(time * 0.7 + p.userData.originalPosition.z) * radius * 0.2;
                } else {
                    var vel = p.userData.velocity.clone().multiplyScalar(currentSpeed);
                    p.position.add(vel);
                    if (Math.abs(p.position.x) > 4) p.userData.velocity.x *= -1;
                    if (Math.abs(p.position.y) > 4) p.userData.velocity.y *= -1;
                    if (Math.abs(p.position.z) > 4) p.userData.velocity.z *= -1;
                }
            });
            if(threeRenderer && threeScene && threeCamera) threeRenderer.render(threeScene, threeCamera);
        }

        function showElementVisually(elementId) {
            var el = document.getElementById(elementId);
            if(el) el.classList.add('visible');
        }

        function hideElementVisually(elementId) {
            var el = document.getElementById(elementId);
            if(el) el.classList.remove('visible');
        }

        function hideAllSceneContent() {
            var allContentIds = ['title', 'main-definition', 'section-title-branch', 'science-tree-content',
                'section-title-properties', 'property-subtitle-1', 'property-1', 'property-subtitle-2', 'property-2', 'property-subtitle-3', 'property-3',
                'section-title-composition', 'composition-subtitle-1', 'composition-1', 'composition-subtitle-2', 'composition-2', 'composition-subtitle-3', 'composition-3',
                'section-title-physical', 'physical-subtitle-1', 'physical-changes-1', 'physical-subtitle-2', 'physical-changes-2', 'physical-subtitle-3', 'physical-changes-3',
                'section-title-chemical', 'chemical-changes-1', 'chemical-changes-2', 'chemical-changes-3',
                'section-title-laws', 'law-1', 'law-2', 'law-3', 'law-4'
            ];
            allContentIds.forEach(hideElementVisually);
            var chemBranch = document.getElementById('chemistry-branch');
            if (chemBranch) chemBranch.classList.remove('active-highlight');
        }

        function updateDefinitionHighlights() {
            var allSpans = document.querySelectorAll('#main-definition .highlight-word');
            allSpans.forEach(function(span) {
                span.classList.remove('active', 'explained');
                if (explainedHighlightTermIds.includes(span.id)) {
                    span.classList.add('explained');
                }
            });

            if (currentActiveTermId) {
                var idsToActivate = Array.isArray(currentActiveTermId) ? currentActiveTermId : [currentActiveTermId];
                idsToActivate.forEach(function(id){
                    var activeElement = document.getElementById(id);
                    if (activeElement) {
                        activeElement.classList.remove('explained');
                        activeElement.classList.add('active');
                    }
                });
            }
        }

        function runScene(sceneIdx) {
            hideAllSceneContent();
            currentActiveTermId = null;

            var sceneName = scenes[sceneIdx];

            if (sceneName === 'opening') {
                showElementVisually('title');
            } else if (sceneName.startsWith('definition-highlight-') || sceneName === 'definition-show-initial' || sceneName === 'final-definition-summary') {
                showElementVisually('main-definition');

                if(sceneName === 'final-definition-summary'){
                    Object.keys(definitionHighlightMap).forEach(function(defSceneKey){
                        var termToExplain = definitionHighlightMap[defSceneKey];
                        var termsToAdd = Array.isArray(termToExplain) ? termToExplain : [termToExplain];
                        termsToAdd.forEach(function(tId){
                            if(tId && !explainedHighlightTermIds.includes(tId)) explainedHighlightTermIds.push(tId);
                        });
                    });
                } else if (definitionHighlightMap[sceneName]) {
                    currentActiveTermId = definitionHighlightMap[sceneName];
                }
                updateDefinitionHighlights();
            } else if (contentSceneDetailsMap[sceneName]) {
                var details = contentSceneDetailsMap[sceneName];
                showElementVisually(details.mainDivId);
                if(details.sectionTitleId) showElementVisually(details.sectionTitleId);
                if(details.subtitleId) showElementVisually(details.subtitleId);

                var prevSceneName = sceneIdx > 0 ? scenes[sceneIdx-1] : null;
                if (prevSceneName && definitionHighlightMap[prevSceneName]) {
                    var termsJustExplained = definitionHighlightMap[prevSceneName];
                    var termsArray = Array.isArray(termsJustExplained) ? termsJustExplained : [termsJustExplained];
                    termsArray.forEach(function(termId){
                        if (termId && !explainedHighlightTermIds.includes(termId)) {
                            explainedHighlightTermIds.push(termId);
                        }
                    });
                }

                if (sceneName === 'branch-of-science-content') {
                    var chemBranchCard = document.getElementById('chemistry-branch');
                    if (chemBranchCard) chemBranchCard.classList.add('active-highlight');
                }
            }
        }

        function updateProgress_internal() {
            if (!isPlaying) return;
            animationProgress += (1/60) * currentSpeed;
            var progressPercentage = (animationProgress / totalDuration) * 100;
            var progressBar = document.getElementById('progressBarEl');
            if(progressBar) progressBar.style.width = Math.min(progressPercentage, 100) + '%';

            var timeAccumulator = 0; var newSceneIdx = 0;
            for (var i = 0; i < sceneDurations.length; i++) {
                if (animationProgress < timeAccumulator + sceneDurations[i]) {
                    newSceneIdx = i; break;
                }
                timeAccumulator += sceneDurations[i];
                if (i === sceneDurations.length - 1 && animationProgress >= totalDuration) {
                    newSceneIdx = i;
                }
            }

            if (newSceneIdx !== currentSceneIdx) {
                currentSceneIdx = newSceneIdx;
                runScene(currentSceneIdx);
            }

            if (animationProgress >= totalDuration && isPlaying) {
                animationProgress = totalDuration;
                isPlaying = false;
                var pauseBtn = document.getElementById('pauseBtnEl');
                if(pauseBtn) pauseBtn.innerHTML = '🔄 Replay';
            }
        }

        window.restartAnimation = function() {
            animationProgress = 0;
            currentSceneIdx = 0;
            explainedHighlightTermIds = [];
            currentActiveTermId = null;
            isPlaying = true; // Auto-start after restart

            var pauseBtn = document.getElementById('pauseBtnEl');
            if(pauseBtn) pauseBtn.innerHTML = '⏸️ Pause';

            var progressBar = document.getElementById('progressBarEl');
            if(progressBar) progressBar.style.width = '0%';
            runScene(0);
        };

        window.togglePause = function() {
            if (animationProgress >= totalDuration) {
                // If at end, restart
                window.restartAnimation();
                return;
            }

            isPlaying = !isPlaying;
            var btn = document.getElementById('pauseBtnEl');
            if(btn) btn.innerHTML = isPlaying ? '⏸️ Pause' : '▶️ Play';
        };

        window.setSpeed = function(speed) {
            currentSpeed = speed;
            // Update button states
            document.querySelectorAll('.control-btn').forEach(btn => btn.classList.remove('active'));
            if (speed === 0.5) document.getElementById('slow-btn').classList.add('active');
            else if (speed === 1) document.getElementById('normal-btn').classList.add('active');
            else if (speed === 2) document.getElementById('fast-btn').classList.add('active');
        };

        window.handleControlUpdate = function(control, value) {
            if (control === 'speed') {
                currentSpeed = Math.max(0.1, value);
                window.setSpeed(currentSpeed);
            }
            if (control === 'playPause') {
                if (isPlaying !== value) window.togglePause();
            }
        };

        function onWindowResize_internal() {
            if (threeCamera && threeRenderer) {
                var animContainer = document.getElementById('animation-container');
                if (!animContainer) return;
                var newWidth = animContainer.clientWidth;
                var newHeight = animContainer.clientHeight;

                if (newWidth > 0 && newHeight > 0) {
                    threeCamera.aspect = newWidth / newHeight;
                    threeCamera.updateProjectionMatrix();
                }
                threeRenderer.setSize(animContainer.offsetWidth, animContainer.offsetHeight);
            }
        }

        window.addEventListener('load', function() {
            isPlaying = false; // Start paused

            var pauseBtn = document.getElementById('pauseBtnEl');
            if(pauseBtn) pauseBtn.innerHTML = '▶️ Play';

            initThreeJS_internal();
            runScene(0);
            setInterval(updateProgress_internal, 1000/60);
            window.addEventListener('resize', onWindowResize_internal);
            onWindowResize_internal();

            if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'animationReady', payload: { animationId: 'chemistryDefinitionInteractive' }}));
            }
        });

        document.addEventListener('keydown', function(event) {
            if (event.key === ' ' || event.code === 'Space') {
                event.preventDefault();
                window.togglePause();
            } else if (event.key === 'r' || event.key === 'R') {
                window.restartAnimation();
            } else if (event.key === '1') {
                window.setSpeed(0.5);
            } else if (event.key === '2') {
                window.setSpeed(1);
            } else if (event.key === '3') {
                window.setSpeed(2);
            }
        });

    </script>
  </body>
  </html>`
}
