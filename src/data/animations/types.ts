// src/data/animations/types.ts
export type AnimationTemplateType = 'reaction' | 'state-change' | 'dissolution' | 'bonding' | 'equilibrium' | 'definition';

export type AnimationType =
  | 'hydrogen-oxygen-water'
  | 'states-of-matter'
  | 'phase-changes'
  | 'carbon-allotropes'
  | 'solutions-colloids'
  | 'temperature-solubility'
  | 'chemistry-definition';
export interface AnimationConfig {
  html: string;
  height: number;
  autoPlay: boolean;
  loop: boolean;
  backgroundColor?: string;
  features?: AnimationFeatures;
  safety?: SafetyConstraints;
   template?: {
    type: AnimationTemplateType;
    config: any;
  };
}

export interface AnimationFeatures {
  temperature?: boolean;      // Enable temperature slider
  zoom?: boolean;             // Enable zoom controls
  speed?: boolean;            // Enable speed controls
  beforeAfter?: boolean;      // Enable before/after toggle
  rotation3D?: boolean;       // Enable 3D rotation
  particleCount?: boolean;    // Enable particle count control
  pressure?: boolean;         // Enable pressure control
  concentration?: boolean;    // Enable concentration slider
}

// src/data/animations/types.ts - ADD these new types
export interface AnimationEngine {
  play(): Promise<void>;
  pause(): void;
  reset(): void;
  setSpeed(speed: number): void;
  setTemperature?(temp: number): void;
}

export interface ChemicalEntity {
  element: string;
  position: { x: number; y: number; z?: number };
  state?: 'solid' | 'liquid' | 'gas' | 'aqueous';
}

export interface ReactionConfig {
  reactants: ChemicalEntity[];
  products: ChemicalEntity[];
  conditions?: {
    temperature?: number;
    pressure?: number;
    catalyst?: string;
  };
}

// Add to existing types
export interface SafetyConstraints {
  maxTemperature?: number;
  maxPressure?: number;
  maxConcentration?: number;
  minDistance?: number;
  requiredEquipment?: string[];
  hazardousReactions?: string[];
}

export interface SafetyStatus {
  isSafe: boolean;
  warnings: string[];
  requiredEquipment: string[];
}

