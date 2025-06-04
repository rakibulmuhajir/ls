// src/data/animations/core/AnimationControls.ts
import { AnimationStateManager, AnimationState } from './AnimationStateManager';

export interface ControlDefinition {
  key: string;
  type: 'slider' | 'toggle' | 'button' | 'select';
  label: string;
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: any }[];
  defaultValue: any;
  validator?: (value: any) => boolean;
  formatter?: (value: any) => string;
  description?: string;
  icon?: string;
}

export interface ControlGroup {
  id: string;
  name: string;
  controls: string[]; // Array of control keys
  collapsed?: boolean;
}

export class AnimationControls {
  private controls: Map<string, ControlDefinition> = new Map();
  private groups: Map<string, ControlGroup> = new Map();
  private stateManager: AnimationStateManager;
  private changeListeners: Set<(key: string, value: any) => void> = new Set();

  constructor(stateManager: AnimationStateManager) {
    this.stateManager = stateManager;
  }

  /**
   * Register a single control
   */
  registerControl(control: ControlDefinition): void {
    // Validate control definition
    this.validateControlDefinition(control);

    if (this.controls.has(control.key)) {
      console.warn(`Control '${control.key}' is being overridden`);
    }

    this.controls.set(control.key, control);

    // Set default value in state if not already set
    const currentState = this.stateManager.getState();
    if (!(control.key in currentState)) {
      this.stateManager.updateProperty(control.key as keyof AnimationState, control.defaultValue);
    }
  }

  /**
   * Register multiple controls
   */
  registerControls(controls: ControlDefinition[]): void {
    controls.forEach(control => this.registerControl(control));
  }

  /**
   * Register a control group
   */
  registerGroup(group: ControlGroup): void {
    // Validate that all controls in group exist
    group.controls.forEach(controlKey => {
      if (!this.controls.has(controlKey)) {
        console.warn(`Control '${controlKey}' in group '${group.id}' does not exist`);
      }
    });

    this.groups.set(group.id, group);
  }

  /**
   * Get all registered controls
   */
  getControls(): ControlDefinition[] {
    return Array.from(this.controls.values());
  }

  /**
   * Get a specific control
   */
  getControl(key: string): ControlDefinition | undefined {
    return this.controls.get(key);
  }

  /**
   * Get all control groups
   */
  getGroups(): ControlGroup[] {
    return Array.from(this.groups.values());
  }

  /**
   * Get controls for a specific group
   */
  getControlsForGroup(groupId: string): ControlDefinition[] {
    const group = this.groups.get(groupId);
    if (!group) return [];

    return group.controls
      .map(key => this.controls.get(key))
      .filter((control): control is ControlDefinition => control !== undefined);
  }

  /**
   * Update control value with validation
   */
  updateControl(key: string, value: any): boolean {
    const control = this.controls.get(key);
    if (!control) {
      console.warn(`Control '${key}' not found`);
      return false;
    }

    // Validate value
    if (!this.validateControlValue(control, value)) {
      console.warn(`Invalid value for control '${key}':`, value);
      return false;
    }

    // Update state
    this.stateManager.updateProperty(key as keyof AnimationState, value);

    // Notify listeners
    this.notifyChangeListeners(key, value);

    return true;
  }

  /**
   * Get current value for a control
   */
  getControlValue(key: string): any {
    const state = this.stateManager.getState();
    return state[key];
  }

  /**
   * Get formatted value for display
   */
  getFormattedValue(key: string): string {
    const control = this.controls.get(key);
    if (!control) return '';

    const value = this.getControlValue(key);
    return control.formatter ? control.formatter(value) : String(value);
  }

  /**
   * Reset all controls to default values
   */
  resetControls(): void {
    const updates: Partial<AnimationState> = {};

    this.controls.forEach(control => {
      updates[control.key as keyof AnimationState] = control.defaultValue;
    });

    this.stateManager.setState(updates);
  }

  /**
   * Reset specific control to default value
   */
  resetControl(key: string): boolean {
    const control = this.controls.get(key);
    if (!control) return false;

    return this.updateControl(key, control.defaultValue);
  }

  /**
   * Get controls by type
   */
  getControlsByType(type: ControlDefinition['type']): ControlDefinition[] {
    return Array.from(this.controls.values()).filter(
      control => control.type === type
    );
  }

  /**
   * Check if control exists
   */
  hasControl(key: string): boolean {
    return this.controls.has(key);
  }

  /**
   * Remove a control
   */
  unregisterControl(key: string): boolean {
    return this.controls.delete(key);
  }

  /**
   * Add change listener
   */
  addChangeListener(listener: (key: string, value: any) => void): () => void {
    this.changeListeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.changeListeners.delete(listener);
    };
  }

  /**
   * Remove change listener
   */
  removeChangeListener(listener: (key: string, value: any) => void): void {
    this.changeListeners.delete(listener);
  }

  /**
   * Get control constraints (min/max/step for sliders)
   */
  getControlConstraints(key: string): { min?: number; max?: number; step?: number } | null {
    const control = this.controls.get(key);
    if (!control || control.type !== 'slider') return null;

    return {
      min: control.min,
      max: control.max,
      step: control.step
    };
  }

  /**
   * Get control options (for select controls)
   */
  getControlOptions(key: string): { label: string; value: any }[] | null {
    const control = this.controls.get(key);
    if (!control || control.type !== 'select') return null;

    return control.options || [];
  }

  /**
   * Validate control definition
   */
  private validateControlDefinition(control: ControlDefinition): void {
    if (!control.key) {
      throw new Error('Control must have a key');
    }

    if (!control.label) {
      throw new Error(`Control '${control.key}' must have a label`);
    }

    if (!['slider', 'toggle', 'button', 'select'].includes(control.type)) {
      throw new Error(`Control '${control.key}' has invalid type: ${control.type}`);
    }

    // Type-specific validation
    if (control.type === 'slider') {
      if (control.min === undefined || control.max === undefined) {
        throw new Error(`Slider control '${control.key}' must have min and max values`);
      }
      if (control.min >= control.max) {
        throw new Error(`Slider control '${control.key}' min must be less than max`);
      }
    }

    if (control.type === 'select') {
      if (!control.options || control.options.length === 0) {
        throw new Error(`Select control '${control.key}' must have options`);
      }
    }
  }

  /**
   * Validate control value
   */
  private validateControlValue(control: ControlDefinition, value: any): boolean {
    // Custom validator takes precedence
    if (control.validator) {
      return control.validator(value);
    }

    // Type-specific validation
    switch (control.type) {
      case 'slider':
        if (typeof value !== 'number') return false;
        if (control.min !== undefined && value < control.min) return false;
        if (control.max !== undefined && value > control.max) return false;
        return true;

      case 'toggle':
        return typeof value === 'boolean';

      case 'select':
        if (!control.options) return false;
        return control.options.some(option => option.value === value);

      case 'button':
        // Buttons don't have persistent values, always valid
        return true;

      default:
        return true;
    }
  }

  /**
   * Notify change listeners
   */
  private notifyChangeListeners(key: string, value: any): void {
    this.changeListeners.forEach(listener => {
      try {
        listener(key, value);
      } catch (error) {
        console.error('Error in control change listener:', error);
      }
    });
  }
}

// Default control definitions for common animation features
export const DefaultControls: ControlDefinition[] = [
  {
    key: 'temperature',
    type: 'slider',
    label: 'Temperature',
    min: -100,
    max: 200,
    step: 1,
    defaultValue: 20,
    formatter: (value) => `${value}°C`,
    description: 'Controls the temperature of the simulation',
    icon: 'thermometer'
  },
  {
    key: 'zoom',
    type: 'slider',
    label: 'Zoom',
    min: 0.5,
    max: 3,
    step: 0.1,
    defaultValue: 1,
    formatter: (value) => `${value.toFixed(1)}x`,
    description: 'Zoom in or out of the animation',
    icon: 'magnify'
  },
  {
    key: 'speed',
    type: 'slider',
    label: 'Speed',
    min: 0.1,
    max: 3,
    step: 0.1,
    defaultValue: 1,
    formatter: (value) => `${value.toFixed(1)}x`,
    description: 'Controls animation playback speed',
    icon: 'speedometer'
  },
  {
    key: 'particleCount',
    type: 'slider',
    label: 'Particles',
    min: 10,
    max: 200,
    step: 10,
    defaultValue: 50,
    formatter: (value) => String(value),
    description: 'Number of particles to display',
    icon: 'circle-multiple'
  },
  {
    key: 'pressure',
    type: 'slider',
    label: 'Pressure',
    min: 0.1,
    max: 5,
    step: 0.1,
    defaultValue: 1,
    formatter: (value) => `${value.toFixed(1)} atm`,
    description: 'Controls pressure in the system',
    icon: 'gauge'
  },
  {
    key: 'concentration',
    type: 'slider',
    label: 'Concentration',
    min: 0,
    max: 2,
    step: 0.1,
    defaultValue: 0.5,
    formatter: (value) => `${value.toFixed(1)}M`,
    description: 'Solution concentration',
    icon: 'flask'
  },
  {
    key: 'isPlaying',
    type: 'toggle',
    label: 'Playing',
    defaultValue: false,
    description: 'Play or pause the animation',
    icon: 'play-pause'
  },
  {
    key: 'showBefore',
    type: 'toggle',
    label: 'Show Before',
    defaultValue: true,
    description: 'Show before state in before/after comparisons',
    icon: 'eye'
  },
  {
    key: 'rotation3D',
    type: 'toggle',
    label: '3D Rotation',
    defaultValue: true,
    description: 'Enable automatic 3D rotation',
    icon: 'rotate-3d-variant'
  }
];

// Predefined control groups for common scenarios
export const DefaultControlGroups: ControlGroup[] = [
  {
    id: 'playback',
    name: 'Playback Controls',
    controls: ['isPlaying', 'speed'],
    collapsed: false
  },
  {
    id: 'environment',
    name: 'Environment',
    controls: ['temperature', 'pressure'],
    collapsed: false
  },
  {
    id: 'display',
    name: 'Display Options',
    controls: ['zoom', 'rotation3D', 'particleCount'],
    collapsed: true
  },
  {
    id: 'advanced',
    name: 'Advanced',
    controls: ['concentration', 'showBefore'],
    collapsed: true
  }
];

// Utility function to create controls based on animation features
export function createControlsForFeatures(features: Record<string, boolean>): ControlDefinition[] {
  const controls: ControlDefinition[] = [];

  // Always include basic playback controls
  controls.push(DefaultControls.find(c => c.key === 'isPlaying')!);
  controls.push(DefaultControls.find(c => c.key === 'speed')!);

  // Add controls based on features
  Object.entries(features).forEach(([feature, enabled]) => {
    if (!enabled) return;

    const controlMap: Record<string, string> = {
      'temperature': 'temperature',
      'zoom': 'zoom',
      'beforeAfter': 'showBefore',
      'rotation3D': 'rotation3D',
      'particleCount': 'particleCount',
      'pressure': 'pressure',
      'concentration': 'concentration'
    };

    const controlKey = controlMap[feature];
    if (controlKey) {
      const control = DefaultControls.find(c => c.key === controlKey);
      if (control && !controls.find(c => c.key === controlKey)) {
        controls.push(control);
      }
    }
  });

  return controls;
}

// Utility function to create control groups for an animation
export function createControlGroupsForAnimation(controls: ControlDefinition[]): ControlGroup[] {
  const groups: ControlGroup[] = [];
  const controlKeys = controls.map(c => c.key);

  // Create groups only if they have relevant controls
  DefaultControlGroups.forEach(defaultGroup => {
    const relevantControls = defaultGroup.controls.filter(key =>
      controlKeys.includes(key)
    );

    if (relevantControls.length > 0) {
      groups.push({
        ...defaultGroup,
        controls: relevantControls
      });
    }
  });

  return groups;
}
