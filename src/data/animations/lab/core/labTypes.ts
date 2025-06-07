//src/data/animations/lab/core/labTypes.ts
export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  color: string;
  maxSpeed: number;
  vibrationIntensity: number;
  temperature: number;
  elementType?: string;
}

export type LabBoundary =
  | {
      id: string;
      type: 'container' | 'heater' | 'solid';
      shape: 'rectangle';
      x: number;
      y: number;
      width: number;
      height: number;
      restitution: number;
      friction: number;
    }
  | {
      id: string;
      type: 'container' | 'heater' | 'solid';
      shape: 'circle';
      x: number;
      y: number;
      radius: number;
      restitution: number;
      friction: number;
    };

export interface ParticleMaterial {
  thermalConductivity: number;
  specificHeat: number;
  density: number;
  state: 'solid' | 'liquid' | 'gas';
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  color: string;
  maxSpeed: number;
  vibrationIntensity: number;
  temperature: number;
  elementType?: string;
  material?: ParticleMaterial;
}

export interface HeatSource {
  id: string;
  x: number;
  y: number;
  radius: number;
  intensity: number;
  temperature: number;
  isActive: boolean;
}
