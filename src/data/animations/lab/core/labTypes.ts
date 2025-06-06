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

export interface LabBoundary {
  id: string;
  type: 'container' | 'heater' | 'solid';
  shape: 'rectangle' | 'circle';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  restitution: number;
  friction: number;
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
