// src/data/animations/core/types.ts

// ... (Particle, Bond, PhysicsState, AnimationConfig, PerformanceSettings interfaces remain the same) ...
export interface Particle { id: string; x: number; y: number; z?: number; vx: number; vy: number; radius: number; mass?: number; color: string; maxSpeed: number; vibrationIntensity: number; vibrationFrequency?: number; boundaryWidth: number; boundaryHeight: number; isFixed?: boolean; data?: Record<string, any>; }
export interface Bond { id: string; particle1: Particle; particle2: Particle; restLength: number; stability: number; stiffness?: number; color?: string; type?: 'single' | 'double' | 'triple' | 'hydrogen' | 'ionic'; }
export interface PhysicsState { particles: ReadonlyArray<Particle>; bonds: ReadonlyArray<Bond>; timestamp: number; }
export interface AnimationConfig { type: 'states' | 'molecule' | 'reaction' | 'custom'; width: number; height: number; particleCount?: number; moleculeType?: string; stateType?: 'solid' | 'liquid' | 'gas'; initialTemperature?: number; performanceMode?: 'low' | 'medium' | 'high'; }
export interface PerformanceSettings { level: 'low' | 'medium' | 'high'; frameRate: number; maxParticles: number; physicsQuality: 'basic' | 'standard' | 'advanced'; enableShadows?: boolean; enableParticleTrails: boolean; enableComplexCollisions: boolean; }

// Forward declare for context API
export class PhysicsEngine {}
export class PerformanceManager {}
export class SceneBuilder {} // Add SceneBuilder forward declaration

// Animation context
export interface AnimationContextAPI {
  physicsEngine: PhysicsEngine;
  performanceManager: PerformanceManager;
  sceneBuilder: SceneBuilder; // CHANGE: Add sceneBuilder instance to the API
  getPhysicsState: () => PhysicsState;
  setTemperature: (temp: number) => void;
  addParticle: (particleData: Omit<Particle, 'vx' | 'vy' | 'maxSpeed' | 'vibrationIntensity' | 'color'> & Partial<Particle>) => string;
  addBond: (bondData: { p1Id: string, p2Id: string, restLength?: number, type?: Bond['type'] }) => string | null;
  removeParticle: (particleId: string) => void;
  removeBond: (bondId: string) => void;
  resetSimulation: (config?: AnimationConfig) => void;
}

// ===== SKIA RENDERING TYPES =====
export interface SkiaRenderElements {
  particles: JSX.Element[];
  bonds: JSX.Element[];
  effects: JSX.Element[];
  heatFields: JSX.Element[];
}

// ===== EQUIPMENT INTERACTION TYPES =====
export interface EquipmentInteraction {
  type: 'heating' | 'stirring' | 'pouring' | 'measuring';
  targetId: string;
  value: number;
  duration?: number;
}

export interface LabExperimentState {
  isRunning: boolean;
  currentStep: number;
  totalSteps: number;
  measurements: Record<string, number>;
  observations: string[];
}

// ===== ANIMATION ALIASES FOR COMPATIBILITY =====
export type AnimationParticle = Particle;
export type AnimationBond = Bond;
