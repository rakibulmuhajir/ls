// src/data/animations/lab/assets/types.ts

// Base interface for all lab equipment
export interface BaseEquipmentProps {
  width?: number;
  height?: number;
}

// Basic Equipment Props
export interface GraduatedCylinderProps extends BaseEquipmentProps {
  maxVolume?: number; // in mL
  liquidColor?: string;
  onVolumeChange?: (volume: number) => void;
}

export interface PipetteProps extends BaseEquipmentProps {
  liquidColor?: string;
  capacity?: number; // in mL
  onDispense?: (amount: number) => void;
}

export interface FunnelProps extends BaseEquipmentProps {
  liquidColor?: string;
}

export interface StirringRodProps extends BaseEquipmentProps {}

export interface WatchGlassProps extends BaseEquipmentProps {}

export interface PetriDishProps extends BaseEquipmentProps {}

// Heating & Temperature Equipment Props
export interface HotPlateProps extends BaseEquipmentProps {
  onTemperatureChange?: (temperature: number) => void;
  maxTemperature?: number;
}

export interface ThermometerStandProps extends BaseEquipmentProps {
  temperature?: number;
}

export interface HeatingMantleProps extends BaseEquipmentProps {}

export interface IceBathProps extends BaseEquipmentProps {}

// Measurement & Analysis Equipment Props
export interface BalanceScaleProps extends BaseEquipmentProps {
  onMassChange?: (leftMass: number, rightMass: number) => void;
  maxMass?: number;
}

export interface PHMeterProps extends BaseEquipmentProps {
  onPHChange?: (pH: number) => void;
}

export interface LitmusPaperProps extends BaseEquipmentProps {}

export interface MeasuringSpoonsProps extends BaseEquipmentProps {
  maxCapacity?: number;
}

// Safety Equipment Props
export interface SafetyGogglesProps extends BaseEquipmentProps {
  lensColor?: string;
  isWorn?: boolean;
}

export interface SafetyGlovesProps extends BaseEquipmentProps {}

export interface FumeHoodProps extends BaseEquipmentProps {}

export interface FireExtinguisherProps extends BaseEquipmentProps {}

export interface EmergencyShowerProps extends BaseEquipmentProps {}

// Specialized Equipment Props
export interface MicroscopeProps extends BaseEquipmentProps {
  onFocusChange?: (focus: number) => void;
  magnification?: number;
}

export interface MortarAndPestleProps extends BaseEquipmentProps {}

export interface TongsProps extends BaseEquipmentProps {}

export interface RingStandProps extends BaseEquipmentProps {}

export interface CondenserProps extends BaseEquipmentProps {}

// Enhanced Equipment Props (existing)
export interface BunsenBurnerFromRepassetsProps extends BaseEquipmentProps {
  size?: number;
  isActive?: boolean;
  intensity?: number;
  flameColor?: string;
}

export interface BeakerFromRepassetsProps extends BaseEquipmentProps {
  size?: number;
  liquidLevel?: number;
  liquidColor?: string;
  hasBubbles?: boolean;
  temperature?: number;
}

export interface FlaskEnhancedProps extends BaseEquipmentProps {
  size?: number;
  liquidLevel?: number;
  liquidColor?: string;
  isHeating?: boolean;
  hasBubbles?: boolean;
  temperature?: number;
}

export interface TestTubeRackEnhancedProps extends BaseEquipmentProps {
  size?: number;
  tubeCount?: number;
  tubeContents?: TubeContent[];
  rackColor?: string;
}

export interface TubeContent {
  level: number; // 0-100
  color: string;
  label?: string;
}

// Equipment categories for organization
export type EquipmentCategory =
  | 'basic'
  | 'heating'
  | 'measurement'
  | 'safety'
  | 'specialized'
  | 'enhanced';

export interface EquipmentInfo {
  name: string;
  category: EquipmentCategory;
  description: string;
  component: React.ComponentType<any>;
  icon?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
}

// Common animation states
export interface AnimationState {
  isActive: boolean;
  progress: number; // 0-1
  intensity?: number; // 0-1
}

// Common measurement units
export type VolumeUnit = 'mL' | 'L' | 'µL';
export type MassUnit = 'g' | 'kg' | 'mg';
export type TemperatureUnit = '°C' | '°F' | 'K';
export type LengthUnit = 'mm' | 'cm' | 'm';

// Equipment interaction types
export type InteractionType =
  | 'press'
  | 'longPress'
  | 'panHorizontal'
  | 'panVertical'
  | 'rotation'
  | 'pinch';

export interface InteractionConfig {
  type: InteractionType;
  sensitivity?: number;
  bounds?: {
    min: number;
    max: number;
  };
  hapticFeedback?: boolean;
}

// Lab safety levels
export type SafetyLevel = 'low' | 'medium' | 'high' | 'critical';

export interface SafetyInfo {
  level: SafetyLevel;
  warnings: string[];
  requiredEquipment: string[];
  procedures: string[];
}
