// src/data/animations/core/AnimationStateManager.ts
export interface AnimationState {
  // Control states
  temperature: number;
  zoom: number;
  speed: number;
  isPlaying: boolean;
  showBefore: boolean;
  rotation3D: boolean;
  particleCount: number;
  pressure: number;
  concentration: number;

  // Animation-specific state
  currentScene?: string;
  progress: number;

  // Safety state
  safetyStatus: {
    isSafe: boolean;
    warnings: string[];
    requiredEquipment: string[];
  };

  // Custom properties
  [key: string]: any;
}

export interface StateChangeListener {
  (newState: AnimationState, previousState: AnimationState): void;
}

export class AnimationStateManager {
  private state: AnimationState;
  private listeners: Set<StateChangeListener> = new Set();
  private history: AnimationState[] = [];
  private maxHistorySize = 50;

  constructor(initialState: Partial<AnimationState> = {}) {
    this.state = this.getDefaultState(initialState);
    this.addToHistory(this.state);
  }

  /**
   * Get current state
   */
  getState(): AnimationState {
    return { ...this.state };
  }

  /**
   * Update state
   */
    setState(updates: Partial<AnimationState>): void {
    const previousState = { ...this.state };

    // ✅ Validate critical control values before applying
    const validatedUpdates = this.validateUpdates(updates);

    this.state = { ...this.state, ...validatedUpdates };

    this.addToHistory(this.state);
    this.notifyListeners(this.state, previousState);
  }

   private validateUpdates(updates: Partial<AnimationState>): Partial<AnimationState> {
    const validated = { ...updates };

    // Speed validation (min: 0.1, max: 3)
    if ('speed' in validated && validated.speed !== undefined) {
      if (validated.speed < 0.1) {
        console.warn(`Speed value ${validated.speed} too low, setting to minimum 0.1`);
        validated.speed = 0.1;
      } else if (validated.speed > 3) {
        console.warn(`Speed value ${validated.speed} too high, setting to maximum 3`);
        validated.speed = 3;
      }
    }

    // Zoom validation (min: 0.5, max: 3)
    if ('zoom' in validated && validated.zoom !== undefined) {
      if (validated.zoom < 0.5) {
        console.warn(`Zoom value ${validated.zoom} too low, setting to minimum 0.5`);
        validated.zoom = 0.5;
      } else if (validated.zoom > 3) {
        console.warn(`Zoom value ${validated.zoom} too high, setting to maximum 3`);
        validated.zoom = 3;
      }
    }

    // Temperature validation (min: -100, max: 200)
    if ('temperature' in validated && validated.temperature !== undefined) {
      if (validated.temperature < -100) {
        validated.temperature = -100;
      } else if (validated.temperature > 200) {
        validated.temperature = 200;
      }
    }

    // Particle count validation (min: 10, max: 200)
    if ('particleCount' in validated && validated.particleCount !== undefined) {
      if (validated.particleCount < 10) {
        validated.particleCount = 10;
      } else if (validated.particleCount > 200) {
        validated.particleCount = 200;
      }
    }

    return validated;
  }


  /**
   * Update a specific property
   */
  updateProperty<K extends keyof AnimationState>(
    key: K,
    value: AnimationState[K]
  ): void {
    this.setState({ [key]: value } as Partial<AnimationState>);
  }

  /**
   * Reset to default state
   */
  reset(keepCustomProperties = false): void {
    const customProps = keepCustomProperties
      ? this.extractCustomProperties(this.state)
      : {};

    this.setState(this.getDefaultState(customProps));
  }

  /**
   * Add state change listener
   */
  addListener(listener: StateChangeListener): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Remove state change listener
   */
  removeListener(listener: StateChangeListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Get state history
   */
  getHistory(): AnimationState[] {
    return [...this.history];
  }

  /**
   * Undo last state change
   */
  undo(): boolean {
    if (this.history.length <= 1) return false;

    this.history.pop(); // Remove current state
    const previousState = this.history[this.history.length - 1];

    if (previousState) {
      const current = { ...this.state };
      this.state = { ...previousState };
      this.notifyListeners(this.state, current);
      return true;
    }

    return false;
  }

  /**
   * Check if state is safe based on constraints
   */
  validateSafety(constraints?: any): void {
    const warnings: string[] = [];
    let isSafe = true;

    if (constraints) {
      // Temperature validation
      if (constraints.maxTemperature && this.state.temperature > constraints.maxTemperature) {
        isSafe = false;
        warnings.push(`Temperature exceeds safe limit (${constraints.maxTemperature}°C)`);
      }

      // Pressure validation
      if (constraints.maxPressure && this.state.pressure > constraints.maxPressure) {
        isSafe = false;
        warnings.push(`Pressure exceeds safe limit (${constraints.maxPressure} atm)`);
      }

      // Concentration validation
      if (constraints.maxConcentration && this.state.concentration > constraints.maxConcentration) {
        isSafe = false;
        warnings.push(`Concentration exceeds safe limit (${constraints.maxConcentration}M)`);
      }
    }

    this.updateProperty('safetyStatus', {
      isSafe,
      warnings,
      requiredEquipment: constraints?.requiredEquipment || []
    });
  }

  /**
   * Serialize state to JSON
   */
  serialize(): string {
    return JSON.stringify(this.state);
  }

  /**
   * Deserialize state from JSON
   */
  deserialize(json: string): void {
    try {
      const deserializedState = JSON.parse(json);
      this.setState(deserializedState);
    } catch (error) {
      console.error('Failed to deserialize state:', error);
    }
  }

  /**
   * Private methods
   */
 private getDefaultState(overrides: Partial<AnimationState> = {}): AnimationState {
    const baseDefaults = {
      temperature: 20,
      zoom: 1,
      speed: 1,
      isPlaying: false,
      showBefore: true,
      rotation3D: true,
      particleCount: 50,
      pressure: 1,
      concentration: 0.5,
      progress: 0,
      safetyStatus: {
        isSafe: true,
        warnings: [],
        requiredEquipment: []
      }
    };

    // Merge overrides and validate
    const merged = { ...baseDefaults, ...overrides };
    return this.validateUpdates(merged) as AnimationState;
  }

  private addToHistory(state: AnimationState): void {
    this.history.push({ ...state });

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  private notifyListeners(newState: AnimationState, previousState: AnimationState): void {
    this.listeners.forEach(listener => {
      try {
        listener(newState, previousState);
      } catch (error) {
        console.error('Error in state change listener:', error);
      }
    });
  }

  private extractCustomProperties(state: AnimationState): Record<string, any> {
    const defaultKeys = new Set([
      'temperature', 'zoom', 'speed', 'isPlaying', 'showBefore',
      'rotation3D', 'particleCount', 'pressure', 'concentration',
      'progress', 'safetyStatus', 'currentScene'
    ]);

    const customProps: Record<string, any> = {};
    Object.keys(state).forEach(key => {
      if (!defaultKeys.has(key)) {
        customProps[key] = state[key];
      }
    });

    return customProps;
  }
}

// src/data/animations/core/AnimationControls.ts
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
}

export class AnimationControls {
  private controls: Map<string, ControlDefinition> = new Map();
  private stateManager: AnimationStateManager;

  constructor(stateManager: AnimationStateManager) {
    this.stateManager = stateManager;
  }

  /**
   * Register a control
   */
  registerControl(control: ControlDefinition): void {
    this.controls.set(control.key, control);
  }

  /**
   * Register multiple controls
   */
  registerControls(controls: ControlDefinition[]): void {
    controls.forEach(control => this.registerControl(control));
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
   * Update control value with validation
   */
  updateControl(key: string, value: any): boolean {
    const control = this.controls.get(key);
    if (!control) {
      console.warn(`Control '${key}' not found`);
      return false;
    }

    // Validate value
    if (control.validator && !control.validator(value)) {
      console.warn(`Invalid value for control '${key}':`, value);
      return false;
    }

    // Update state
    this.stateManager.updateProperty(key as keyof AnimationState, value);
    return true;
  }

  /**
   * Get formatted value for display
   */
  getFormattedValue(key: string): string {
    const control = this.controls.get(key);
    if (!control) return '';

    const value = this.stateManager.getState()[key];
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
   * Get controls by type
   */
  getControlsByType(type: ControlDefinition['type']): ControlDefinition[] {
    return Array.from(this.controls.values()).filter(
      control => control.type === type
    );
  }
}

// Default control definitions
export const DefaultControls: ControlDefinition[] = [
  {
    key: 'temperature',
    type: 'slider',
    label: 'Temperature',
    min: -100,
    max: 200,
    step: 1,
    defaultValue: 20,
    formatter: (value) => `${value}°C`
  },
  {
    key: 'zoom',
    type: 'slider',
    label: 'Zoom',
    min: 0.5,
    max: 3,
    step: 0.1,
    defaultValue: 1,
    formatter: (value) => `${value}x`
  },
  {
    key: 'speed',
    type: 'slider',
    label: 'Speed',
    min: 0.1,
    max: 3,
    step: 0.1,
    defaultValue: 1,
    formatter: (value) => `${value}x`
  },
  {
    key: 'particleCount',
    type: 'slider',
    label: 'Particles',
    min: 10,
    max: 200,
    step: 10,
    defaultValue: 50,
    formatter: (value) => String(value)
  },
  {
    key: 'isPlaying',
    type: 'toggle',
    label: 'Playing',
    defaultValue: false
  },
  {
    key: 'showBefore',
    type: 'toggle',
    label: 'Show Before',
    defaultValue: true
  },
  {
    key: 'rotation3D',
    type: 'toggle',
    label: '3D Rotation',
    defaultValue: true
  }
];
