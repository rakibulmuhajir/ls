// src/data/animations/core/UnifiedPhysicsEngine.ts

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

  constructor(width: number, height: number, performanceMode: 'low' | 'medium' | 'high' = 'low') {
    this.width = width;
    this.height = height;
    this.performanceMode = performanceMode;
    this.lastTimestamp = performance.now();
  }

  // ===== PARTICLE MANAGEMENT =====
  addParticle(particleData: Omit<Particle, 'id'> & { id?: string }): string {
    const id = particleData.id || UniqueID.generate('p_');

    // Create base particle with defaults
    const particleDefaults = {
      vx: 0,
      vy: 0,
      maxSpeed: 1,
      vibrationIntensity: 0.1,
      vibrationFrequency: 200 + Math.random() * 50,
      color: RenderConfig.Particle.DefaultColor,
      mass: particleData.radius || RenderConfig.Particle.DefaultRadius,
      boundaryWidth: this.width,
      boundaryHeight: this.height,
      temperature: this.globalTemperature
    };

    // Merge with provided data
    const particle: Particle = {
      ...particleDefaults,
      ...particleData,
      id,
    };

    this.particles.set(id, particle);
    this.updateParticleBehavior(particle);
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

  // ===== BOND MANAGEMENT =====
  addBond(bondData: {
    p1Id: string;
    p2Id: string;
    restLength?: number;
    type?: Bond['type'];
    stiffness?: number;
    stability?: number;
    id?: string;
  }): string | null {
    const p1 = this.particles.get(bondData.p1Id);
    const p2 = this.particles.get(bondData.p2Id);

    if (!p1 || !p2) {
      console.warn("Cannot create bond: particles not found.", bondData.p1Id, bondData.p2Id);
      return null;
    }

    const id = bondData.id || UniqueID.generate('b_');
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    const bond: Bond = {
      id,
      particle1: p1,
      particle2: p2,
      restLength: bondData.restLength ?? Math.sqrt(dx * dx + dy * dy),
      stability: bondData.stability ?? 1.0,
      stiffness: bondData.stiffness ?? 0.5,
      type: bondData.type ?? 'single',
      color: ColorSystem.getBondColor(bondData.type),
    };

    this.bonds.set(id, bond);
    return id;
  }

  removeBond(bondId: string): void {
    this.bonds.delete(bondId);
  }

  // ===== LAB EQUIPMENT MANAGEMENT =====
  addBoundary(boundary: Omit<LabBoundary, 'id'>): string {
    const id = UniqueID.generate('boundary_');

    // Handle circle boundary
    if (boundary.shape === 'circle') {
      const circleBoundary = boundary as Omit<Extract<LabBoundary, { shape: 'circle' }>, 'id'>;
      const validatedBoundary: Extract<LabBoundary, { shape: 'circle' }> = {
        ...circleBoundary,
        id,
        radius: circleBoundary.radius || 30,
        type: circleBoundary.type || 'container',
        x: circleBoundary.x,
        y: circleBoundary.y,
        restitution: circleBoundary.restitution || 0.8,
        friction: circleBoundary.friction || 0.1
      };
      this.boundaries.set(id, validatedBoundary);
      return id;
    }

    // Handle rectangle boundary
    const rectBoundary = boundary as Omit<Extract<LabBoundary, { shape: 'rectangle' }>, 'id'>;
    const validatedBoundary: Extract<LabBoundary, { shape: 'rectangle' }> = {
      ...rectBoundary,
      id,
      width: rectBoundary.width || 100,
      height: rectBoundary.height || 100,
      type: rectBoundary.type || 'container',
      x: rectBoundary.x,
      y: rectBoundary.y,
      restitution: rectBoundary.restitution || 0.8,
      friction: rectBoundary.friction || 0.1
    };
    this.boundaries.set(id, validatedBoundary);
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

  // ===== SIMULATION CONTROL =====
  setTemperature(temp: number): void {
    this.globalTemperature = Math.max(0, Math.min(100, temp));
    this.particles.forEach(p => this.updateParticleBehavior(p));
    this.bonds.forEach(b => this.updateBondBehavior(b));
  }

  get temperature(): number {
    return this.globalTemperature;
  }

  setPerformanceMode(mode: 'low' | 'medium' | 'high'): void {
    this.performanceMode = mode;
  }

  reset(newWidth?: number, newHeight?: number): void {
    this.particles.clear();
    this.bonds.clear();
    this.boundaries.clear();
    this.heatSources.clear();
    this.globalTemperature = 25;
    if (newWidth) this.width = newWidth;
    if (newHeight) this.height = newHeight;
    this.lastTimestamp = performance.now();
  }

  // ===== PHYSICS UPDATE =====
  update(deltaTimeMs: number, currentTimeMs: number): void {
    if (deltaTimeMs <= 0) return;

    const timeStep = Math.min(deltaTimeMs / 1000, 0.033);
    this.lastTimestamp = currentTimeMs;

    // Apply lab heat effects first
    this.applyLabHeatEffects();

    // Update particles
    const particles = Array.from(this.particles.values());

    for (const particle of particles) {
      if (particle.isFixed) continue;
      this.applyTemperatureEffects(particle, timeStep, currentTimeMs);
    }

    // Apply bond constraints
    const iterations = this.performanceMode === 'low' ? 1 : 2;
    for (let i = 0; i < iterations; i++) {
      this.bonds.forEach(bond => this.applyBondConstraint(bond, timeStep));
    }

    // Update positions and apply constraints
    for (const particle of particles) {
      if (particle.isFixed) continue;
      this.applyFriction(particle);
      this.updatePosition(particle, timeStep);
      this.applyBoundaryConstraints(particle);
      this.applyLabBoundaryConstraints(particle);
    }

    // Collision detection for better performance modes
    if (this.performanceMode !== 'low') {
      this.detectCollisions(particles);
    }
  }

  // ===== PHYSICS HELPERS =====
  private updateParticleBehavior(particle: Particle): void {
    const intensity = this.globalTemperature / 100;

    particle.maxSpeed = 0.2 + intensity * (this.performanceMode === 'low' ? 1.5 : 2.5);
    particle.vibrationIntensity = (0.05 + intensity * 0.5) * (1 - intensity) * particle.radius * 0.1;

    // Update color based on temperature
    if (this.globalTemperature < 33) particle.color = RenderConfig.TemperatureColors.Cool;
    else if (this.globalTemperature < 66) particle.color = RenderConfig.TemperatureColors.Medium;
    else particle.color = RenderConfig.TemperatureColors.Hot;

    // Apply element color if available
    if (particle.data?.elementType) {
      particle.color = ColorSystem.getElementColor(particle.data.elementType);
    }
  }

  private updateBondBehavior(bond: Bond): void {
    const intensity = this.globalTemperature / 100;
    bond.stability = Math.max(RenderConfig.Bond.MinVisibleStability, 1 - intensity * 0.9);
  }

  private applyLabHeatEffects(): void {
    this.particles.forEach(particle => {
      let maxTemp = this.globalTemperature;

      // Check heat sources (lab equipment)
      this.heatSources.forEach(heatSource => {
        if (!heatSource.isActive) return;

        const dx = particle.x - heatSource.x;
        const dy = particle.y - heatSource.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < heatSource.radius) {
          const heatFactor = Math.max(0, 1 - distance / heatSource.radius);
          const heatContribution = heatSource.temperature * heatSource.intensity * heatFactor;
          maxTemp = Math.max(maxTemp, this.globalTemperature + heatContribution);
        }
      });

      // Gradually adjust particle temperature
      const tempDiff = maxTemp - (particle.temperature || this.globalTemperature);
      particle.temperature = (particle.temperature || this.globalTemperature) + tempDiff * 0.02;

      // Update particle appearance based on temperature
      this.updateParticleFromTemperature(particle);
    });
  }

  private updateParticleFromTemperature(particle: Particle): void {
    const temp = particle.temperature || this.globalTemperature;

    // Don't override element colors, just intensity
    if (!particle.data?.elementType) {
      if (temp < 40) particle.color = RenderConfig.TemperatureColors.Cool;
      else if (temp < 70) particle.color = RenderConfig.TemperatureColors.Medium;
      else particle.color = RenderConfig.TemperatureColors.Hot;
    }

    // Speed increases with temperature
    const tempFactor = (temp - 25) / 75;
    particle.maxSpeed = 0.5 + Math.max(0, tempFactor) * 2.0;
  }

  private applyTemperatureEffects(particle: Particle, timeStep: number, currentTimeMs: number): void {
    const temp = particle.temperature || this.globalTemperature;
    const tempFactor = temp / 50;

    // Random brownian motion
    const randomForceScale = this.performanceMode === 'high' ? 0.5 : 0.2;
    particle.vx += (Math.random() - 0.5) * tempFactor * randomForceScale * (particle.mass || 1) * timeStep;
    particle.vy += (Math.random() - 0.5) * tempFactor * randomForceScale * (particle.mass || 1) * timeStep;

    // Vibration for low temperature (solid-like behavior)
    if (temp < 35 && particle.vibrationIntensity > 0) {
      const angle = (currentTimeMs / (particle.vibrationFrequency || 200)) * Math.PI * 2;
      particle.x += Math.sin(angle) * particle.vibrationIntensity * timeStep * 50;
      particle.y += Math.cos(angle) * particle.vibrationIntensity * timeStep * 50;
    }
  }

  private applyFriction(particle: Particle): void {
    // const friction = 0.995;
    // particle.vx *= friction;
    // particle.vy *= friction;
  }

// In UnifiedPhysicsEngine.ts, line ~254
private updatePosition(particle: Particle, timeStep: number): void {
  const speed = Math.sqrt(particle.vx ** 2 + particle.vy ** 2);
  if (speed > particle.maxSpeed && particle.maxSpeed > 0) {
    particle.vx = (particle.vx / speed) * particle.maxSpeed;
    particle.vy = (particle.vy / speed) * particle.maxSpeed;
  }

  particle.x += particle.vx * timeStep * 100; // Change from 50 to 100
  particle.y += particle.vy * timeStep * 100; // Change from 50 to 100
}

  private applyBondConstraint(bond: Bond, timeStep: number): void {
    const p1 = bond.particle1;
    const p2 = bond.particle2;
    if (p1.isFixed && p2.isFixed) return;

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const diffRatio = (bond.restLength - distance) / distance;

    const p1Share = p1.isFixed ? 0 : (p2.isFixed ? 1 : 0.5);
    const p2Share = p2.isFixed ? 0 : (p1.isFixed ? 1 : 0.5);

    const springForce = diffRatio * (bond.stiffness || 0.5) * bond.stability;
    const moveX = dx * springForce;
    const moveY = dy * springForce;

    if (!p1.isFixed) {
      p1.vx -= moveX * p1Share * timeStep;
      p1.vy -= moveY * p1Share * timeStep;
    }
    if (!p2.isFixed) {
      p2.vx += moveX * p2Share * timeStep;
      p2.vy += moveY * p2Share * timeStep;
    }
  }

  private applyBoundaryConstraints(particle: Particle): void {
    const restitution = 0.5;

    if (particle.x < particle.radius) {
      particle.x = particle.radius;
      particle.vx *= -restitution;
    } else if (particle.x > this.width - particle.radius) {
      particle.x = this.width - particle.radius;
      particle.vx *= -restitution;
    }

    if (particle.y < particle.radius) {
      particle.y = particle.radius;
      particle.vy *= -restitution;
    } else if (particle.y > this.height - particle.radius) {
      particle.y = this.height - particle.radius;
      particle.vy *= -restitution;
    }
  }

  private applyLabBoundaryConstraints(particle: Particle): void {
    this.boundaries.forEach(boundary => {
      const collision = this.checkBoundaryCollision(particle, boundary);
      if (collision.hasCollision && collision.normal) {
        // Move particle out
        particle.x -= collision.normal.x * collision.penetration;
        particle.y -= collision.normal.y * collision.penetration;

        // Reflect velocity
        const dot = particle.vx * collision.normal.x + particle.vy * collision.normal.y;
        particle.vx -= 2 * dot * collision.normal.x * boundary.restitution;
        particle.vy -= 2 * dot * collision.normal.y * boundary.restitution;

        // Apply friction
        particle.vx *= (1 - boundary.friction);
        particle.vy *= (1 - boundary.friction);
      }
    });
  }

  private checkBoundaryCollision(particle: Particle, boundary: LabBoundary): {
    hasCollision: boolean;
    normal?: { x: number; y: number };
    penetration: number;
  } {
    if (boundary.shape === 'circle') {
      const dx = particle.x - boundary.x;
      const dy = particle.y - boundary.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = particle.radius + boundary.radius;

      if (distance < minDistance) {
        const normal = {
          x: dx / distance,
          y: dy / distance
        };
        return {
          hasCollision: true,
          normal,
          penetration: minDistance - distance
        };
      }
    } else if (boundary.shape === 'rectangle' && boundary.width && boundary.height) {
      const left = boundary.x;
      const right = boundary.x + boundary.width;
      const top = boundary.y;
      const bottom = boundary.y + boundary.height;

      if (particle.x + particle.radius > left &&
          particle.x - particle.radius < right &&
          particle.y + particle.radius > top &&
          particle.y - particle.radius < bottom) {

        const distLeft = particle.x - left;
        const distRight = right - particle.x;
        const distTop = particle.y - top;
        const distBottom = bottom - particle.y;

        const minDist = Math.min(distLeft, distRight, distTop, distBottom);
        let normal: { x: number; y: number };

        if (minDist === distLeft) normal = { x: -1, y: 0 };
        else if (minDist === distRight) normal = { x: 1, y: 0 };
        else if (minDist === distTop) normal = { x: 0, y: -1 };
        else normal = { x: 0, y: 1 };

        return {
          hasCollision: true,
          normal,
          penetration: particle.radius - minDist
        };
      }
    }

    return { hasCollision: false, penetration: 0 };
  }

  private detectCollisions(particles: Particle[]): void {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        if (p1.isFixed && p2.isFixed) continue;

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = p1.radius + p2.radius;

        if (distance < minDistance && distance > 0) {
          // Resolve overlap
          const overlap = (minDistance - distance) / distance;
          const offsetX = dx * overlap * 0.5;
          const offsetY = dy * overlap * 0.5;

          if (!p1.isFixed) {
            p1.x -= offsetX;
            p1.y -= offsetY;
          }
          if (!p2.isFixed) {
            p2.x += offsetX;
            p2.y += offsetY;
          }

          // Elastic collision response
          const angle = Math.atan2(dy, dx);
          const sin = Math.sin(angle);
          const cos = Math.cos(angle);

          const v1 = { x: p1.vx * cos + p1.vy * sin, y: p1.vy * cos - p1.vx * sin };
          const v2 = { x: p2.vx * cos + p2.vy * sin, y: p2.vy * cos - p2.vx * sin };

          const v1xFinal = p2.isFixed ? -v1.x : v2.x;
          const v2xFinal = p1.isFixed ? -v2.x : v1.x;

          const p1vx = v1xFinal * cos - v1.y * sin;
          const p1vy = v1.y * cos + v1xFinal * sin;
          const p2vx = v2xFinal * cos - v2.y * sin;
          const p2vy = v2.y * cos + v2xFinal * sin;

          const restitution = 0.8;

          if (!p1.isFixed) {
            p1.vx = p1vx * restitution;
            p1.vy = p1vy * restitution;
          }
          if (!p2.isFixed) {
            p2.vx = p2vx * restitution;
            p2.vy = p2vy * restitution;
          }
        }
      }
    }
  }

  // ===== GETTERS =====
  getState(currentTimeMs: number): PhysicsState {
    return {
      particles: Object.freeze(Array.from(this.particles.values()).map(p => ({ ...p }))),
      bonds: Object.freeze(Array.from(this.bonds.values()).map(b => ({ ...b }))),
      timestamp: currentTimeMs,
    };
  }

  getParticles(): Particle[] {
    return Array.from(this.particles.values());
  }

  getBonds(): Bond[] {
    return Array.from(this.bonds.values());
  }

  getBoundaries(): LabBoundary[] {
    return Array.from(this.boundaries.values());
  }

  getHeatSources(): HeatSource[] {
    return Array.from(this.heatSources.values());
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
