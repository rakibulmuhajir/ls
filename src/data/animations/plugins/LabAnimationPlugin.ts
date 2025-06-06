// src/data/animations/plugins/LabAnimationPlugin.ts

import { AnimationPlugin, AnimationRegistry } from '../core/AnimationRegistry';
import { labSceneBuilder, EquipmentType } from '../lab/LabSceneBuilder';

export class LabAnimationPlugin implements AnimationPlugin {
  id = 'lab-equipment-core';
  name = 'Lab Equipment Animations';
  version = '1.0.0';

  register(registry: AnimationRegistry): void {
    console.log('🧪 Registering Lab Equipment Animations...');

    // Register predefined experiment scenarios
    this.registerExperimentScenarios(registry);

    // Register individual equipment demonstrations
    this.registerEquipmentDemos(registry);

    // Register safety training modules
    this.registerSafetyTraining(registry);

    // Register interactive lab builder
    this.registerLabBuilder(registry);
  }

  /**
   * Register complete experiment scenarios
   */
  private registerExperimentScenarios(registry: AnimationRegistry): void {
    const scenarios = labSceneBuilder.createExperimentScenarios();

    scenarios.forEach(scenario => {
      registry.registerAnimation({
        id: `lab-experiment-${scenario.id}`,
        name: scenario.title,
        description: `${scenario.difficulty} level experiment: ${scenario.learningObjectives.join(', ')}`,
        templateId: 'direct-html',
        category: 'laboratory',
        tags: ['lab', 'experiment', scenario.difficulty, ...scenario.learningObjectives],
        config: {
          height: 600,
          autoPlay: false,
          loop: false,
          fullscreen: true,
          directHtml: this.generateScenarioHTML(scenario),
          estimatedTime: scenario.estimatedTime,
          difficulty: scenario.difficulty,
          learningObjectives: scenario.learningObjectives
        }
      });
    });
  }

  /**
   * Register individual equipment demonstrations
   */
  private registerEquipmentDemos(registry: AnimationRegistry): void {
    const equipmentCategories = labSceneBuilder.getEquipmentByCategory();

    Object.entries(equipmentCategories).forEach(([category, equipment]) => {
      equipment.forEach(equipmentType => {
        const info = labSceneBuilder.getEquipmentInfo(equipmentType);

        registry.registerAnimation({
          id: `lab-equipment-${equipmentType}`,
          name: `${info.name} Demo`,
          description: `Interactive demonstration of ${info.name}: ${info.description}`,
          templateId: 'direct-html',
          category: 'lab-equipment',
          tags: ['lab', 'equipment', category, info.difficulty],
          config: {
            height: 400,
            autoPlay: false,
            loop: false,
            directHtml: this.generateEquipmentDemoHTML(equipmentType, info),
            difficulty: info.difficulty
          }
        });
      });
    });
  }

  /**
   * Register safety training modules
   */
  private registerSafetyTraining(registry: AnimationRegistry): void {
    const safetyLevels = ['basic', 'acid', 'heat', 'biological'];

    safetyLevels.forEach(level => {
      registry.registerAnimation({
        id: `lab-safety-${level}`,
        name: `Safety Training: ${level.toUpperCase()}`,
        description: `Interactive safety equipment training for ${level} experiments`,
        templateId: 'direct-html',
        category: 'safety-training',
        tags: ['lab', 'safety', level, 'interactive'],
        config: {
          height: 500,
          autoPlay: false,
          loop: false,
          directHtml: this.generateSafetyTrainingHTML(level),
          experimentType: level
        }
      });
    });
  }

  /**
   * Register interactive lab builder
   */
  private registerLabBuilder(registry: AnimationRegistry): void {
    registry.registerAnimation({
      id: 'lab-builder-interactive',
      name: 'Interactive Lab Builder',
      description: 'Build and customize your own laboratory setup with drag-and-drop equipment',
      templateId: 'direct-html',
      category: 'interactive-tools',
      tags: ['lab', 'builder', 'interactive', 'drag-drop'],
      config: {
        height: 700,
        autoPlay: false,
        loop: false,
        fullscreen: true,
        directHtml: this.generateLabBuilderHTML()
      }
    });
  }

  /**
   * Generate HTML for experiment scenarios
   */
  private generateScenarioHTML(scenario: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            color: #333;
        }
        .lab-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .experiment-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #4CAF50;
            padding-bottom: 20px;
        }
        .experiment-title {
            font-size: 2.5rem;
            color: #2E7D32;
            margin-bottom: 10px;
        }
        .experiment-meta {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 15px;
        }
        .meta-item {
            background: #E8F5E8;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9rem;
            color: #2E7D32;
            font-weight: 600;
        }
        .objectives-section {
            margin: 30px 0;
            background: #F3E5F5;
            padding: 20px;
            border-radius: 10px;
        }
        .objectives-title {
            font-size: 1.3rem;
            color: #7B1FA2;
            margin-bottom: 15px;
            font-weight: bold;
        }
        .objectives-list {
            list-style: none;
            padding: 0;
        }
        .objectives-list li {
            padding: 8px 0;
            border-bottom: 1px solid #E1BEE7;
            position: relative;
            padding-left: 25px;
        }
        .objectives-list li:before {
            content: "🎯";
            position: absolute;
            left: 0;
        }
        .scene-viewer {
            border: 2px solid #ddd;
            border-radius: 10px;
            height: 400px;
            background: #fafafa;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 20px 0;
            position: relative;
            overflow: hidden;
        }
        .start-button {
            background: linear-gradient(45deg, #4CAF50, #45a049);
            color: white;
            border: none;
            padding: 15px 30px;
            font-size: 1.2rem;
            border-radius: 25px;
            cursor: pointer;
            transition: transform 0.2s;
            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
        }
        .start-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
        }
        .equipment-preview {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        .equipment-item {
            background: #fff;
            border: 2px solid #E0E0E0;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            transition: all 0.3s ease;
        }
        .equipment-item:hover {
            border-color: #4CAF50;
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .equipment-name {
            font-weight: 600;
            color: #333;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="lab-container">
        <div class="experiment-header">
            <h1 class="experiment-title">${scenario.title}</h1>
            <div class="experiment-meta">
                <span class="meta-item">⏱️ ${scenario.estimatedTime} minutes</span>
                <span class="meta-item">📊 ${scenario.difficulty}</span>
                <span class="meta-item">🔬 ${scenario.scenes.length} scenes</span>
            </div>
        </div>

        <div class="objectives-section">
            <h3 class="objectives-title">Learning Objectives</h3>
            <ul class="objectives-list">
                ${scenario.learningObjectives.map((obj: string) => `<li>${obj}</li>`).join('')}
            </ul>
        </div>

        <div class="scene-viewer">
            <button class="start-button" onclick="startExperiment()">
                🚀 Start Experiment
            </button>
        </div>

        <div class="equipment-preview">
            ${scenario.scenes[0]?.equipment.map((eq: any) => `
                <div class="equipment-item">
                    <div style="font-size: 2rem;">${this.getEquipmentEmoji(eq.type)}</div>
                    <div class="equipment-name">${this.getEquipmentDisplayName(eq.type)}</div>
                </div>
            `).join('') || ''}
        </div>
    </div>

    <script>
        function startExperiment() {
            alert('🧪 Experiment started! Follow the on-screen instructions.');
            // Here you would implement the actual experiment flow
        }

        window.addEventListener('load', function() {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'ready',
                    experimentId: '${scenario.id}'
                }));
            }
        });
    </script>
</body>
</html>`;
  }

  /**
   * Generate HTML for equipment demonstrations
   */
  private generateEquipmentDemoHTML(equipmentType: EquipmentType, info: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            color: white;
            text-align: center;
        }
        .demo-container {
            max-width: 400px;
            margin: 0 auto;
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            padding: 30px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        }
        .equipment-title {
            font-size: 2rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .equipment-description {
            font-size: 1.1rem;
            margin-bottom: 30px;
            opacity: 0.9;
        }
        .equipment-display {
            height: 250px;
            background: rgba(255,255,255,0.05);
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 20px 0;
            border: 2px dashed rgba(255,255,255,0.3);
        }
        .equipment-icon {
            font-size: 4rem;
            opacity: 0.8;
        }
        .interaction-hint {
            background: rgba(255,255,255,0.2);
            padding: 15px;
            border-radius: 10px;
            margin-top: 20px;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="demo-container">
        <h1 class="equipment-title">${info.name}</h1>
        <p class="equipment-description">${info.description}</p>

        <div class="equipment-display">
            <div class="equipment-icon">${this.getEquipmentEmoji(equipmentType)}</div>
        </div>

        <div class="interaction-hint">
            💡 Tap and interact with the equipment above to see how it works!
        </div>
    </div>

    <script>
        window.addEventListener('load', function() {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'ready',
                    equipmentType: '${equipmentType}'
                }));
            }
        });
    </script>
</body>
</html>`;
  }

  /**
   * Generate HTML for safety training
   */
  private generateSafetyTrainingHTML(level: string): string {
    const requirements = {
      basic: ['goggles', 'labCoat', 'gloves'],
      acid: ['goggles', 'labCoat', 'gloves', 'faceShield'],
      heat: ['goggles', 'labCoat', 'gloves'],
      biological: ['labCoat', 'gloves']
    };

    return `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            color: #333;
        }
        .safety-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.1);
        }
        .safety-header {
            text-align: center;
            margin-bottom: 30px;
        }
        .safety-title {
            font-size: 2.5rem;
            color: #D32F2F;
            margin-bottom: 10px;
        }
        .safety-level {
            background: linear-gradient(45deg, #F44336, #E57373);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            display: inline-block;
            font-weight: bold;
            text-transform: uppercase;
        }
        .requirements-list {
            background: #FFF3E0;
            border-left: 5px solid #FF9800;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 10px 10px 0;
        }
        .requirements-title {
            font-size: 1.3rem;
            color: #E65100;
            margin-bottom: 15px;
            font-weight: bold;
        }
        .requirement-item {
            display: flex;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #FFE0B2;
        }
        .requirement-item:last-child {
            border-bottom: none;
        }
        .requirement-icon {
            font-size: 1.5rem;
            margin-right: 15px;
        }
        .interactive-person {
            height: 300px;
            background: #f5f5f5;
            border: 2px solid #ddd;
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 20px 0;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .interactive-person:hover {
            border-color: #4CAF50;
            background: #E8F5E8;
        }
    </style>
</head>
<body>
    <div class="safety-container">
        <div class="safety-header">
            <h1 class="safety-title">⚠️ Safety Training</h1>
            <div class="safety-level">${level} Level</div>
        </div>

        <div class="requirements-list">
            <h3 class="requirements-title">Required Safety Equipment:</h3>
            ${(requirements[level as keyof typeof requirements] || []).map(req => `
                <div class="requirement-item">
                    <span class="requirement-icon">${this.getSafetyEquipmentEmoji(req)}</span>
                    <span>${this.getSafetyEquipmentName(req)}</span>
                </div>
            `).join('')}
        </div>

        <div class="interactive-person" onclick="startSafetyTraining()">
            <div style="text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 10px;">👨‍🔬</div>
                <div style="font-size: 1.2rem; color: #666;">Click to practice safety procedures</div>
            </div>
        </div>
    </div>

    <script>
        function startSafetyTraining() {
            alert('🛡️ Safety training started! Practice putting on the required equipment.');
        }

        window.addEventListener('load', function() {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'ready',
                    safetyLevel: '${level}'
                }));
            }
        });
    </script>
</body>
</html>`;
  }

  /**
   * Generate HTML for lab builder
   */
  private generateLabBuilderHTML(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            color: white;
            height: 100vh;
            overflow: hidden;
        }
        .builder-container {
            display: flex;
            height: 100vh;
        }
        .equipment-palette {
            width: 250px;
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-right: 1px solid rgba(255,255,255,0.2);
            padding: 20px;
            overflow-y: auto;
        }
        .palette-title {
            font-size: 1.3rem;
            font-weight: bold;
            margin-bottom: 20px;
            text-align: center;
        }
        .equipment-category {
            margin-bottom: 20px;
        }
        .category-title {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 10px;
            color: #FFD700;
        }
        .equipment-item {
            background: rgba(255,255,255,0.2);
            border-radius: 8px;
            padding: 10px;
            margin-bottom: 8px;
            cursor: grab;
            transition: all 0.2s;
            text-align: center;
        }
        .equipment-item:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-2px);
        }
        .lab-workspace {
            flex: 1;
            background: rgba(255,255,255,0.05);
            position: relative;
            overflow: hidden;
        }
        .workspace-header {
            background: rgba(0,0,0,0.2);
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .workspace-title {
            font-size: 1.5rem;
            font-weight: bold;
        }
        .controls {
            display: flex;
            gap: 10px;
        }
        .control-btn {
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            padding: 8px 16px;
            border-radius: 5px;
            cursor: pointer;
