// src/data/animations/lab/LabSceneBuilder.ts - UPDATED WITH ALL EQUIPMENT

import React from 'react';
import { View } from 'react-native';

// Import all lab equipment
import {
  // Basic Equipment
  GraduatedCylinder,
  Pipette,
  Funnel,
  StirringRod,
  WatchGlass,
  PetriDish,

  // Heating & Temperature
  HotPlate,
  ThermometerStand,
  HeatingMantle,
  IceBath,

  // Measurement & Analysis
  BalanceScale,
  PHMeter,
  LitmusPaper,
  MeasuringSpoons,

  // Safety Equipment
  SafetyGoggles,
  SafetyGloves,
  FumeHood,
  FireExtinguisher,
  EmergencyShower,

  // Specialized Equipment
  Microscope,
  MortarAndPestle,
  Tongs,
  RingStand,
  Condenser,

  // Enhanced Equipment
  BunsenBurnerFromRepassets,
  BeakerFromRepassets,
  FlaskEnhanced,
  TestTubeRackEnhanced,
} from './assets';

// Import safety person
import { SafetyPerson } from './assets/safety/SafetyPerson';

export type EquipmentType =
  // Basic
  | 'graduated-cylinder' | 'pipette' | 'funnel' | 'stirring-rod' | 'watch-glass' | 'petri-dish'
  // Heating
  | 'hot-plate' | 'thermometer-stand' | 'heating-mantle' | 'ice-bath'
  // Measurement
  | 'balance-scale' | 'ph-meter' | 'litmus-paper' | 'measuring-spoons'
  // Safety
  | 'safety-goggles' | 'safety-gloves' | 'fume-hood' | 'fire-extinguisher' | 'emergency-shower' | 'safety-person'
  // Specialized
  | 'microscope' | 'mortar-pestle' | 'tongs' | 'ring-stand' | 'condenser'
  // Enhanced
  | 'bunsen-burner' | 'beaker' | 'flask' | 'test-tube-rack';

export interface EquipmentPosition {
  x: number;
  y: number;
  scale?: number;
  rotation?: number;
}

export interface LabEquipment {
  type: EquipmentType;
  id: string;
  position: EquipmentPosition;
  props?: Record<string, any>;
  interactions?: {
    draggable?: boolean;
    rotatable?: boolean;
    scalable?: boolean;
  };
}

export interface LabScene {
  id: string;
  name: string;
  description: string;
  equipment: LabEquipment[];
  background?: string;
  safetyLevel: 'low' | 'medium' | 'high' | 'critical';
  requiredSafetyEquipment?: Array<'goggles' | 'gloves' | 'labCoat' | 'faceShield'>;
  instructions?: string[];
}

export interface ExperimentScenario {
  id: string;
  title: string;
  scenes: LabScene[];
  learningObjectives: string[];
  estimatedTime: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export class LabSceneBuilder {
  private scenes: Map<string, LabScene> = new Map();
  private equipment: Map<string, LabEquipment> = new Map();

  // Equipment registry with component mapping
  private equipmentRegistry = {
    // Basic Equipment
    'graduated-cylinder': GraduatedCylinder,
    'pipette': Pipette,
    'funnel': Funnel,
    'stirring-rod': StirringRod,
    'watch-glass': WatchGlass,
    'petri-dish': PetriDish,

    // Heating & Temperature
    'hot-plate': HotPlate,
    'thermometer-stand': ThermometerStand,
    'heating-mantle': HeatingMantle,
    'ice-bath': IceBath,

    // Measurement & Analysis
    'balance-scale': BalanceScale,
    'ph-meter': PHMeter,
    'litmus-paper': LitmusPaper,
    'measuring-spoons': MeasuringSpoons,

    // Safety Equipment
    'safety-goggles': SafetyGoggles,
    'safety-gloves': SafetyGloves,
    'fume-hood': FumeHood,
    'fire-extinguisher': FireExtinguisher,
    'emergency-shower': EmergencyShower,
    'safety-person': SafetyPerson,

    // Specialized Equipment
    'microscope': Microscope,
    'mortar-pestle': MortarAndPestle,
    'tongs': Tongs,
    'ring-stand': RingStand,
    'condenser': Condenser,

    // Enhanced Equipment
    'bunsen-burner': BunsenBurnerFromRepassets,
    'beaker': BeakerFromRepassets,
    'flask': FlaskEnhanced,
    'test-tube-rack': TestTubeRackEnhanced,
  };

  /**
   * Create a new lab scene
   */
  createScene(config: Omit<LabScene, 'equipment'> & { equipment?: LabEquipment[] }): LabScene {
    const scene: LabScene = {
      equipment: [],
      ...config,
    };

    this.scenes.set(scene.id, scene);
    return scene;
  }

  /**
   * Add equipment to a scene
   */
  addEquipment(sceneId: string, equipment: Omit<LabEquipment, 'id'>): LabEquipment {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      throw new Error(`Scene ${sceneId} not found`);
    }

    const equipmentItem: LabEquipment = {
      id: `${equipment.type}-${Date.now()}`,
      ...equipment,
    };

    scene.equipment.push(equipmentItem);
    this.equipment.set(equipmentItem.id, equipmentItem);

    return equipmentItem;
  }

  /**
   * Render a lab scene
   */
  renderScene(sceneId: string, containerWidth: number, containerHeight: number): React.ReactElement {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      throw new Error(`Scene ${sceneId} not found`);
    }

    return React.createElement(View, {
      style: {
        width: containerWidth,
        height: containerHeight,
        position: 'relative',
        backgroundColor: scene.background || '#f0f8ff',
      }
    }, scene.equipment.map(equipment => this.renderEquipment(equipment, containerWidth, containerHeight)));
  }

  /**
   * Render individual equipment
   */
  private renderEquipment(equipment: LabEquipment, containerWidth: number, containerHeight: number): React.ReactElement {
    const Component = this.equipmentRegistry[equipment.type];
    if (!Component) {
      throw new Error(`Equipment type ${equipment.type} not found in registry`);
    }

    const style = {
      position: 'absolute' as const,
      left: equipment.position.x,
      top: equipment.position.y,
      transform: [
        ...(equipment.position.scale ? [{ scale: equipment.position.scale }] : []),
        ...(equipment.position.rotation ? [{ rotate: `${equipment.position.rotation}deg` }] : []),
      ],
    };

    return React.createElement(View, {
      key: equipment.id,
      style,
    }, React.createElement(Component, {
      ...equipment.props,
      onInteraction: (type: string, data: any) => this.handleEquipmentInteraction(equipment.id, type, data),
    }));
  }

  /**
   * Handle equipment interactions
   */
  private handleEquipmentInteraction(equipmentId: string, interactionType: string, data: any): void {
    const equipment = this.equipment.get(equipmentId);
    if (!equipment) return;

    // Dispatch interaction events
    console.log(`Equipment ${equipmentId} interaction:`, interactionType, data);

    // You can add specific interaction logic here
    // For example, safety checks, measurement logging, etc.
  }

  /**
   * Create predefined experiment scenarios
   */
  createExperimentScenarios(): ExperimentScenario[] {
    return [
      this.createBasicChemistryExperiment(),
      this.createpHTestingExperiment(),
      this.createSafetyTrainingScenario(),
      this.createMicroscopyExperiment(),
      this.createHeatTransferExperiment(),
    ];
  }

  /**
   * Basic Chemistry Experiment
   */
  private createBasicChemistryExperiment(): ExperimentScenario {
    const setupScene = this.createScene({
      id: 'basic-chem-setup',
      name: 'Basic Chemistry Setup',
      description: 'Set up basic chemistry equipment',
      safetyLevel: 'medium',
      requiredSafetyEquipment: ['goggles', 'labCoat', 'gloves'],
    });

    // Add equipment to the scene
    this.addEquipment(setupScene.id, {
      type: 'safety-person',
      position: { x: 50, y: 50 },
      props: {
        requiredEquipment: ['goggles', 'labCoat', 'gloves'],
        experimentType: 'basic'
      }
    });

    this.addEquipment(setupScene.id, {
      type: 'beaker',
      position: { x: 200, y: 150 },
      props: { size: 200, liquidLevel: 0.5, liquidColor: '#4FC3F7' }
    });

    this.addEquipment(setupScene.id, {
      type: 'bunsen-burner',
      position: { x: 180, y: 250 },
      props: { size: 100 }
    });

    this.addEquipment(setupScene.id, {
      type: 'graduated-cylinder',
      position: { x: 350, y: 100 },
      props: { maxVolume: 100 }
    });

    this.addEquipment(setupScene.id, {
      type: 'stirring-rod',
      position: { x: 300, y: 200 },
    });

    return {
      id: 'basic-chemistry',
      title: 'Basic Chemistry Experiment',
      scenes: [setupScene],
      learningObjectives: [
        'Identify basic lab equipment',
        'Practice safety procedures',
        'Understand measurement tools'
      ],
      estimatedTime: 15,
      difficulty: 'beginner'
    };
  }

  /**
   * pH Testing Experiment
   */
  private createpHTestingExperiment(): ExperimentScenario {
    const scene = this.createScene({
      id: 'ph-testing',
      name: 'pH Testing Lab',
      description: 'Learn to measure pH using different methods',
      safetyLevel: 'medium',
      requiredSafetyEquipment: ['goggles', 'gloves'],
    });

    this.addEquipment(scene.id, {
      type: 'safety-person',
      position: { x: 150, y: 50 },
      props: {
        requiredEquipment: ['goggles', 'labCoat', 'gloves', 'faceShield'],
        experimentType: 'acid'
      }
    });

    this.addEquipment(scene.id, {
      type: 'fume-hood',
      position: { x: 50, y: 200 },
    });

    this.addEquipment(scene.id, {
      type: 'fire-extinguisher',
      position: { x: 300, y: 180 },
    });

    this.addEquipment(scene.id, {
      type: 'emergency-shower',
      position: { x: 350, y: 50 },
    });

    return {
      id: 'safety-training',
      title: 'Laboratory Safety Training',
      scenes: [scene],
      learningObjectives: [
        'Identify safety equipment',
        'Practice emergency procedures',
        'Understand hazard levels'
      ],
      estimatedTime: 25,
      difficulty: 'beginner'
    };
  }

  /**
   * Microscopy Experiment
   */
  private createMicroscopyExperiment(): ExperimentScenario {
    const scene = this.createScene({
      id: 'microscopy',
      name: 'Microscopy Lab',
      description: 'Learn to use microscope for sample analysis',
      safetyLevel: 'low',
      requiredSafetyEquipment: ['gloves'],
    });

    this.addEquipment(scene.id, {
      type: 'microscope',
      position: { x: 150, y: 100 },
      props: {
        magnification: 400,
        onFocusChange: (focus: number) => console.log('Focus:', focus)
      }
    });

    this.addEquipment(scene.id, {
      type: 'petri-dish',
      position: { x: 50, y: 200 },
    });

    this.addEquipment(scene.id, {
      type: 'pipette',
      position: { x: 300, y: 150 },
      props: { capacity: 5 }
    });

    return {
      id: 'microscopy',
      title: 'Microscopy and Sample Analysis',
      scenes: [scene],
      learningObjectives: [
        'Use microscope correctly',
        'Prepare samples',
        'Understand magnification'
      ],
      estimatedTime: 30,
      difficulty: 'intermediate'
    };
  }

  /**
   * Heat Transfer Experiment
   */
  private createHeatTransferExperiment(): ExperimentScenario {
    const scene = this.createScene({
      id: 'heat-transfer',
      name: 'Heat Transfer Lab',
      description: 'Study heat transfer using various heating methods',
      safetyLevel: 'high',
      requiredSafetyEquipment: ['goggles', 'labCoat', 'gloves'],
    });

    this.addEquipment(scene.id, {
      type: 'hot-plate',
      position: { x: 100, y: 150 },
      props: {
        maxTemperature: 300,
        onTemperatureChange: (temp: number) => console.log('Temperature:', temp)
      }
    });

    this.addEquipment(scene.id, {
      type: 'heating-mantle',
      position: { x: 250, y: 150 },
    });

    this.addEquipment(scene.id, {
      type: 'thermometer-stand',
      position: { x: 175, y: 100 },
      props: { temperature: 25 }
    });

    this.addEquipment(scene.id, {
      type: 'ice-bath',
      position: { x: 350, y: 120 },
    });

    this.addEquipment(scene.id, {
      type: 'beaker',
      position: { x: 120, y: 100 },
      props: {
        size: 150,
        liquidLevel: 0.7,
        liquidColor: '#4FC3F7',
        temperature: 25
      }
    });

    return {
      id: 'heat-transfer',
      title: 'Heat Transfer Methods',
      scenes: [scene],
      learningObjectives: [
        'Compare heating methods',
        'Measure temperature changes',
        'Understand thermal dynamics'
      ],
      estimatedTime: 35,
      difficulty: 'advanced'
    };
  }

  /**
   * Get equipment by category
   */
  getEquipmentByCategory(): Record<string, EquipmentType[]> {
    return {
      basic: [
        'graduated-cylinder', 'pipette', 'funnel',
        'stirring-rod', 'watch-glass', 'petri-dish'
      ],
      heating: [
        'hot-plate', 'thermometer-stand', 'heating-mantle', 'ice-bath'
      ],
      measurement: [
        'balance-scale', 'ph-meter', 'litmus-paper', 'measuring-spoons'
      ],
      safety: [
        'safety-goggles', 'safety-gloves', 'fume-hood',
        'fire-extinguisher', 'emergency-shower', 'safety-person'
      ],
      specialized: [
        'microscope', 'mortar-pestle', 'tongs', 'ring-stand', 'condenser'
      ],
      enhanced: [
        'bunsen-burner', 'beaker', 'flask', 'test-tube-rack'
      ]
    };
  }

  /**
   * Get equipment info
   */
  getEquipmentInfo(type: EquipmentType): any {
    const infoMap = {
      'graduated-cylinder': {
        name: 'Graduated Cylinder',
        description: 'Precise volume measurement',
        difficulty: 'beginner',
        category: 'basic'
      },
      'ph-meter': {
        name: 'pH Meter',
        description: 'Digital pH measurement',
        difficulty: 'intermediate',
        category: 'measurement'
      },
      'safety-person': {
        name: 'Safety Training',
        description: 'Interactive safety equipment training',
        difficulty: 'beginner',
        category: 'safety'
      },
      'microscope': {
        name: 'Microscope',
        description: 'Sample magnification and analysis',
        difficulty: 'advanced',
        category: 'specialized'
      },
      // Add more as needed...
    };

    return infoMap[type] || {
      name: type,
      description: 'Lab equipment',
      difficulty: 'beginner',
      category: 'basic'
    };
  }

  /**
   * Get all scenes
   */
  getAllScenes(): LabScene[] {
    return Array.from(this.scenes.values());
  }

  /**
   * Get scene by ID
   */
  getScene(sceneId: string): LabScene | undefined {
    return this.scenes.get(sceneId);
  }

  /**
   * Remove equipment from scene
   */
  removeEquipment(sceneId: string, equipmentId: string): boolean {
    const scene = this.scenes.get(sceneId);
    if (!scene) return false;

    const index = scene.equipment.findIndex(eq => eq.id === equipmentId);
    if (index === -1) return false;

    scene.equipment.splice(index, 1);
    this.equipment.delete(equipmentId);
    return true;
  }

  /**
   * Update equipment position
   */
  updateEquipmentPosition(equipmentId: string, position: Partial<EquipmentPosition>): boolean {
    const equipment = this.equipment.get(equipmentId);
    if (!equipment) return false;

    equipment.position = { ...equipment.position, ...position };
    return true;
  }

  /**
   * Clone scene
   */
  cloneScene(sceneId: string, newSceneId: string): LabScene | null {
    const originalScene = this.scenes.get(sceneId);
    if (!originalScene) return null;

    const clonedScene: LabScene = {
      ...originalScene,
      id: newSceneId,
      name: `${originalScene.name} (Copy)`,
      equipment: originalScene.equipment.map(eq => ({
        ...eq,
        id: `${eq.type}-${Date.now()}-${Math.random()}`
      }))
    };

    this.scenes.set(newSceneId, clonedScene);

    // Register cloned equipment
    clonedScene.equipment.forEach(eq => {
      this.equipment.set(eq.id, eq);
    });

    return clonedScene;
  }
}

// Export singleton instance
export const labSceneBuilder = new LabSceneBuilder();.id, {
      type: 'ph-meter',
      position: { x: 100, y: 100 },
      props: { onPHChange: (pH: number) => console.log('pH:', pH) }
    });

    this.addEquipment(scene.id, {
      type: 'litmus-paper',
      position: { x: 300, y: 100 },
    });

    this.addEquipment(scene.id, {
      type: 'beaker',
      position: { x: 200, y: 200 },
      props: { liquidColor: '#ff6b6b' }
    });

    return {
      id: 'ph-testing',
      title: 'pH Testing Methods',
      scenes: [scene],
      learningObjectives: [
        'Understand pH scale',
        'Use pH meter correctly',
        'Compare different pH indicators'
      ],
      estimatedTime: 20,
      difficulty: 'intermediate'
    };
  }

  /**
   * Safety Training Scenario
   */
  private createSafetyTrainingScenario(): ExperimentScenario {
    const scene = this.createScene({
      id: 'safety-training',
      name: 'Lab Safety Training',
      description: 'Learn proper safety equipment usage',
      safetyLevel: 'critical',
      requiredSafetyEquipment: ['goggles', 'labCoat', 'gloves', 'faceShield'],
    });

    this.addEquipment(scene.id, {
      type: 'safety-goggles',
      position: { x: 100, y: 100 },
    });

    this.addEquipment(scene.id, {
      type: 'safety-gloves',
      position: { x: 300, y: 100 },
    });

    this.addEquipment(scene.id, {
      type: 'lab-coat',
      position: { x: 200, y: 200 },
    });

    this.addEquipment(scene.id, {
      type: 'face-shield',
      position: { x: 400, y: 200 },
    });

    return {
      id: 'safety-training',
      title: 'Lab Safety Training',
      scenes: [scene],
      learningObjectives: [
        'Identify safety equipment',
        'Demonstrate proper usage',
        'Respond to safety incidents'
      ],
      estimatedTime: 30,
      difficulty: 'beginner'
    };
  }
