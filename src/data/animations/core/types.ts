// src/data/animations/core/types.ts

// ===== PARTICLE TYPES =====
export interface Particle {
  id: string;
  x: number;
  y: number;
  z?: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  color: string;
  maxSpeed: number;
  vibrationIntensity: number;
  vibrationFrequency?: number;
  boundaryWidth: number;
  boundaryHeight: number;
  isFixed?: boolean;
  temperature?: number;
  state?: 'solid' | 'liquid' | 'gas';
  viscosity?: number;
  surfaceTension?: number;
  diffusionRate?: number;
  phaseTransitionTemp?: number;
  elementType: string; // e.g., 'H', 'O', 'Na'. Already in your SimParticle, let's make it standard.
  charge: number;      // For simulating ions and electrostatic forces.

  // Bonding & Reactions
  bonds?: { partnerId: string; type: 'covalent' | 'ionic' | 'hydrogen'; }[]; // An array of bonds

  // Data for more complex simulations
  data?: {
    [key: string]: any;
    moleculeId?: string; // To group atoms that are part of the same molecule
  }
}

// ===== BOND TYPES =====
export interface Bond {
  id: string;
  particle1: Particle;
  particle2: Particle;
  restLength: number;
  stability: number;
  stiffness?: number;
  color?: string;
  type?: 'single' | 'double' | 'triple' | 'hydrogen' | 'ionic';
}

// ===== LAB EQUIPMENT TYPES =====
export type LabBoundary = {
  id: string;
  type: 'container' | 'heater' | 'solid';
  shape: 'rectangle';
  x: number;
  y: number;
  width: number;
  height: number;
  restitution: number;
  friction: number;
} | {
  id: string;
  type: 'container' | 'heater' | 'solid';
  shape: 'circle';
  x: number;
  y: number;
  radius: number;
  restitution: number;
  friction: number;
};

export interface HeatSource {
  id: string;
  x: number;
  y: number;
  radius: number;
  intensity: number;
  temperature: number;
  isActive: boolean;
}

// ===== PHYSICS STATE =====
export interface PhysicsState {
  particles: ReadonlyArray<Particle>;
  bonds: ReadonlyArray<Bond>;
  boundaries?: ReadonlyArray<LabBoundary>;
  heatSources?: ReadonlyArray<HeatSource>;
  timestamp: number;
}

// ===== PERFORMANCE SETTINGS =====
export interface PerformanceSettings {
  level: 'low' | 'medium' | 'high';
  frameRate: number;
  maxParticles: number;
  physicsQuality: 'basic' | 'standard' | 'advanced';
  enableShadows?: boolean;
  enableParticleTrails: boolean;
  enableComplexCollisions: boolean;
}

// ===== ANIMATION CONFIG =====
export interface PhysicsConfig {
  width: number;
  height: number;
  gravity: { x: number; y: number };
  globalDamping: number;
  collisionRestitution: number;
  fluidDensity?: number;
  fluidViscosity?: number;
  temperature?: number;
  enableFluidDynamics?: boolean;
  enablePhaseTransitions?: boolean;
  forceFields?: Array<{
    type: 'magnetic' | 'electric' | 'gravitational';
    x: number;
    y: number;
    strength: number;
    radius: number;
  }>;
  centralForce?: {
    x: number;
    y: number;
    strength: number;
  };
}

export interface AnimationConfig {
  type: 'states' | 'molecule' | 'reaction' | 'lab' | 'custom';
  width: number;
  height: number;
  particleCount?: number;
  moleculeType?: string;
  stateType?: 'solid' | 'liquid' | 'gas';
  experimentType?: string;
  initialTemperature?: number;
  performanceMode?: 'low' | 'medium' | 'high';
  enablePhysics?: boolean;
  enableLabEquipment?: boolean;
  physicsConfig?: PhysicsConfig;
  reactionType?: 'acid-base' | 'precipitation' | 'redox' | 'combustion' | 'custom';
  reactants?: string[];
  products?: string[];
}

// ===== ANIMATION CONTEXT API =====
export interface AnimationContextAPI {
  physicsEngine: any; // Will be properly typed after engine is fixed
  performanceManager: any;
  sceneBuilder: any;
  getPhysicsState: () => PhysicsState;
  setTemperature: (temp: number) => void;
  getTemperatureAt: (x: number, y: number) => number;
  addParticle: (particleData: Omit<Particle, 'id'> & { id?: string }) => string;
  removeParticle: (particleId: string) => void;
  addBond: (bondData: { p1Id: string; p2Id: string; restLength?: number; type?: Bond['type']; id?: string }) => string | null;
  removeBond: (bondId: string) => void;
  addBoundary: (boundary: Omit<LabBoundary, 'id'>) => string;
  addHeatSource: (heatSource: Omit<HeatSource, 'id'>) => string;
  updateHeatSource: (id: string, updates: Partial<HeatSource>) => void;
  resetSimulation: (config?: AnimationConfig) => void;
  pauseAnimation: () => void;
  resumeAnimation: () => void;
  toggleAnimation: () => void;
  isRunning: boolean;
}

// ===== ALIASES FOR COMPATIBILITY =====
export type AnimationParticle = Particle;
export type AnimationBond = Bond;

import React from 'react';

// ===== SKIA RENDERING TYPES =====
export interface SkiaRenderElements {
  particles: React.JSX.Element[];
  bonds: React.JSX.Element[];
  effects: React.JSX.Element[];
  heatFields: React.JSX.Element[];
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
