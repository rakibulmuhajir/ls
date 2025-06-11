import type {
  Particle,
  Bond,
  PhysicsState,
  LabBoundary,
  HeatSource
} from './types';
import { RenderConfig } from './RenderConfig';
import { ColorSystem } from './Colors';
import { UniqueID } from '@/data/animations/utils/UniqueID';

interface PhysicsEngineConfig {
  width: number;
  height: number;
  performanceLevel?: 'low' | 'medium' | 'high';
}

export class UnifiedPhysicsEngine {
  private particles: Map<string, Particle> = new Map();
  private bonds: Map<string, Bond> = new Map();
  private boundaries: Map<string, LabBoundary> = new Map();
  private heatSources: Map<string, HeatSource> = new Map();

  private width: number;
  private height: number;
  private globalTemperature: number = 25;
  private performanceMode: 'low' | 'medium' | 'high' = 'low';
  private lastTimestamp: number = 0;

  constructor(config: PhysicsEngineConfig) {
    this.width = config.width;
    this.height = config.height;
    this.performanceMode = config.performanceLevel || 'low';
    this.lastTimestamp = performance.now();
  }

  reset(config: PhysicsEngineConfig): void {
    this.particles.clear();
    this.bonds.clear();
    this.boundaries.clear();
    this.heatSources.clear();
    this.globalTemperature = 25;
    this.width = config.width;
    this.height = config.height;
    this.performanceMode = config.performanceLevel || 'low';
    this.lastTimestamp = performance.now();
  }

  // Particle management
  addParticle(particleData: Omit<Particle, 'id'> & { id?: string }): string {
    const id = particleData.id || UniqueID.generate('p_');
    const particle: Particle = {
      ...particleData,
      id,
      vx: particleData.vx || 0,
      vy: particleData.vy || 0,
      maxSpeed: particleData.maxSpeed || 1,
      vibrationIntensity: particleData.vibrationIntensity || 0.1,
      vibrationFrequency: particleData.vibrationFrequency || 200 + Math.random() * 50,
      color: particleData.color || RenderConfig.Particle.DefaultColor,
      mass: particleData.mass || (particleData.radius || RenderConfig.Particle.DefaultRadius),
      boundaryWidth: this.width,
      boundaryHeight: this.height,
      temperature: this.globalTemperature
    };
    this.particles.set(id, particle);
    return id;
  }

  removeParticle(particleId: string): void {
    this.particles.delete(particleId);
    // Remove connected bonds
    const bondsToRemove: string[] = [];
    this.bonds.forEach(bond => {
      if (bond.particle1.id === particleId || bond.particle2.id === particleId) {
        bondsToRemove.push(bond.id);
      }
    });
    bondsToRemove.forEach(bondId => this.bonds.delete(bondId));
  }

  // Bond management
  addBond(bondData: {
    p1Id: string;
    p2Id: string;
    restLength?: number;
    type?: 'single' | 'double' | 'triple';
    id?: string;
  }): string | null {
    const p1 = this.particles.get(bondData.p1Id);
    const p2 = this.particles.get(bondData.p2Id);
    if (!p1 || !p2) return null;

    const id = bondData.id || UniqueID.generate('b_');
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const bond: Bond = {
      id,
      particle1: p1,
      particle2: p2,
      restLength: bondData.restLength || distance,
      stability: 1.0,
      stiffness: 0.5,
      type: bondData.type || 'single',
      color: ColorSystem.getBondColor(bondData.type)
    };
    this.bonds.set(id, bond);
    return id;
  }

  removeBond(bondId: string): void {
    this.bonds.delete(bondId);
  }

  // Lab equipment management
  addBoundary(boundary: Omit<LabBoundary, 'id'>): string {
    const id = UniqueID.generate('boundary_');

    if (boundary.shape === 'circle') {
      const circleBoundary = boundary as Omit<Extract<LabBoundary, { shape: 'circle' }>, 'id'>;
      this.boundaries.set(id, {
        ...circleBoundary,
        id,
        radius: circleBoundary.radius || 30,
        restitution: circleBoundary.restitution || 0.8,
        friction: circleBoundary.friction || 0.1
      });
    } else {
      const rectBoundary = boundary as Omit<Extract<LabBoundary, { shape: 'rectangle' }>, 'id'>;
      this.boundaries.set(id, {
        ...rectBoundary,
        id,
        width: rectBoundary.width || 100,
        height: rectBoundary.height || 100,
        restitution: rectBoundary.restitution || 0.8,
        friction: rectBoundary.friction || 0.1
      });
    }
    return id;
  }

  addHeatSource(heatSource: Omit<HeatSource, 'id'>): string {
    const id = UniqueID.generate('heat_');
    this.heatSources.set(id, { ...heatSource, id });
    return id;
  }

  updateHeatSource(id: string, updates: Partial<HeatSource>): void {
    const heatSource = this.heatSources.get(id);
    if (heatSource) {
      Object.assign(heatSource, updates);
    }
  }

  // Simulation control
  setTemperature(temp: number): void {
    this.globalTemperature = Math.max(0, Math.min(100, temp));
  }

  setPerformanceMode(mode: 'low' | 'medium' | 'high'): void {
    this.performanceMode = mode;
  }

  update(deltaTimeMs: number, currentTimeMs: number): void {
    if (deltaTimeMs <= 0) return;
    const timeStep = Math.min(deltaTimeMs / 1000, 0.033);
    this.lastTimestamp = currentTimeMs;

    // Update particle positions and velocities
    this.particles.forEach(particle => {
      // Apply basic motion
      particle.x += particle.vx * timeStep;
      particle.y += particle.vy * timeStep;

      // Boundary collision
      if (particle.x < particle.radius) {
        particle.x = particle.radius;
        particle.vx *= -0.8; // Bounce with some energy loss
      }
      if (particle.x > particle.boundaryWidth - particle.radius) {
        particle.x = particle.boundaryWidth - particle.radius;
        particle.vx *= -0.8;
      }
      if (particle.y < particle.radius) {
        particle.y = particle.radius;
        particle.vy *= -0.8;
      }
      if (particle.y > particle.boundaryHeight - particle.radius) {
        particle.y = particle.boundaryHeight - particle.radius;
        particle.vy *= -0.8;
      }

      // Apply random vibration if enabled
      if (particle.vibrationIntensity && particle.vibrationIntensity > 0 && particle.vibrationFrequency) {
        const vibration = particle.vibrationIntensity *
          Math.sin(currentTimeMs / particle.vibrationFrequency);
        particle.x += vibration * (Math.random() - 0.5);
        particle.y += vibration * (Math.random() - 0.5);
      }

      // Limit speed
      const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
      if (speed > particle.maxSpeed) {
        particle.vx = (particle.vx / speed) * particle.maxSpeed;
        particle.vy = (particle.vy / speed) * particle.maxSpeed;
      }
    });
  }

  getState(currentTimeMs: number): PhysicsState {
    return {
      particles: Array.from(this.particles.values()),
      bonds: Array.from(this.bonds.values()),
      boundaries: Array.from(this.boundaries.values()),
      heatSources: Array.from(this.heatSources.values()),
      timestamp: currentTimeMs
    };
  }

  getTemperatureAt(x: number, y: number): number {
    let maxTemp = this.globalTemperature;
    this.heatSources.forEach(heatSource => {
      if (!heatSource.isActive) return;
      const distance = Math.sqrt((x - heatSource.x) ** 2 + (y - heatSource.y) ** 2);
      if (distance < heatSource.radius) {
        const factor = 1 - distance / heatSource.radius;
        maxTemp = Math.max(maxTemp, this.globalTemperature + heatSource.temperature * factor);
      }
    });
    return maxTemp;
  }
}
