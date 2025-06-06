// src/data/animations/core/Physics.ts
import type { Particle, Bond, PhysicsState } from './types'; // Use 'type' import for interfaces
import { RenderConfig } from './RenderConfig';
import {UniqueID} from '@/utils/UniqueID'; // Assuming you have a unique ID generator

export class PhysicsEngine {
  private particles: Map<string, Particle> = new Map(); // Use Map for easier ID-based access/removal
  private bonds: Map<string, Bond> = new Map();     // Use Map for bonds too
  private _temperature: number = 25; // Ambient temperature (e.g., 0-100 scale)
  private performanceMode: 'low' | 'medium' | 'high' = 'low';
  private lastTimestamp: number = 0; // For consistent timing in vibration

  // Simulation boundary (assuming it's fixed for now, or passed in)
  public boundaryWidth: number = 300;
  public boundaryHeight: number = 300;


  constructor(performanceMode: 'low' | 'medium' | 'high' = 'low', width: number = 300, height: number = 300) {
    this.performanceMode = performanceMode;
    this.boundaryWidth = width;
    this.boundaryHeight = height;
    this.lastTimestamp = performance.now();
  }

  // --- Particle Management ---
  addParticle(particleData: Omit<Particle, 'vx' | 'vy' | 'maxSpeed' | 'vibrationIntensity' | 'color'> & Partial<Particle>): string {
    const id = particleData.id || UniqueID.generate();
    const newParticle: Particle = {
      vx: 0,
      vy: 0,
      maxSpeed: 1, // Default, will be updated by temperature
      vibrationIntensity: 0.1, // Default
      vibrationFrequency: 200 + Math.random() * 50, // Add some randomness to vibration
      color: RenderConfig.Particle.DefaultColor, // Default, updated by temp/type
      mass: particleData.radius || RenderConfig.Particle.DefaultRadius, // Simple mass = radius
      boundaryWidth: this.boundaryWidth, // Use engine's boundary
      boundaryHeight: this.boundaryHeight,
      ...particleData,
      id, // Ensure ID is set
      z: particleData.z || 0,
    };
    this.particles.set(id, newParticle);
    this.updateParticleBehavior(newParticle); // Apply initial temp effects
    return id;
  }

  removeParticle(particleId: string): void {
    this.particles.delete(particleId);
    // Also remove any bonds connected to this particle
    const bondsToRemove: string[] = [];
    this.bonds.forEach(bond => {
      if (bond.particle1.id === particleId || bond.particle2.id === particleId) {
        bondsToRemove.push(bond.id);
      }
    });
    bondsToRemove.forEach(bondId => this.bonds.delete(bondId));
  }

  // --- Bond Management ---
  addBond(bondData: {p1Id: string, p2Id: string, restLength?: number, type?: Bond['type'], stiffness?: number, stability?: number}): string | null {
    const p1 = this.particles.get(bondData.p1Id);
    const p2 = this.particles.get(bondData.p2Id);

    if (!p1 || !p2) {
      console.warn("Cannot create bond: one or both particles not found.", bondData.p1Id, bondData.p2Id);
      return null;
    }
    const id = UniqueID.generate(); // Generate unique ID for the bond
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    const newBond: Bond = {
      id,
      particle1: p1,
      particle2: p2,
      restLength: bondData.restLength ?? Math.sqrt(dx * dx + dy * dy),
      stability: bondData.stability ?? 1.0,
      stiffness: bondData.stiffness ?? 0.5, // Default stiffness
      type: bondData.type ?? 'single',
    };
    this.bonds.set(id, newBond);
    return id;
  }

  removeBond(bondId: string): void {
    this.bonds.delete(bondId);
  }

  // --- Simulation Control ---
  setTemperature(temp: number) { // Temp likely 0-100 scale
    this._temperature = Math.max(0, Math.min(100, temp)); // Clamp temperature
    this.particles.forEach(p => this.updateParticleBehavior(p));
    this.bonds.forEach(b => this.updateBondBehavior(b));
  }

  get temperature(): number {
    return this._temperature;
  }

  setPerformanceMode(mode: 'low' | 'medium' | 'high') {
    this.performanceMode = mode;
    // Potentially re-evaluate particle behaviors or other settings
  }

  reset(newWidth?: number, newHeight?: number) {
    this.particles.clear();
    this.bonds.clear();
    this._temperature = 25; // Reset to ambient
    if (newWidth) this.boundaryWidth = newWidth;
    if (newHeight) this.boundaryHeight = newHeight;
    this.lastTimestamp = performance.now();
  }

  // --- Behavior Updates ---
  private updateParticleBehavior(particle: Particle) {
    const intensity = this._temperature / 100; // Normalized temperature (0 to 1)

    // Adjust movement parameters based on temperature
    // More energy means higher potential speed
    particle.maxSpeed = 0.2 + intensity * (this.performanceMode === 'low' ? 1.5 : 2.5);
    // Vibration intensity increases with temperature, especially for "solids" (low temp)
    particle.vibrationIntensity = (0.05 + intensity * 0.5) * (1 - intensity) * particle.radius * 0.1;


    // Adjust color based on temperature (simplified from friend's suggestion)
    // This could use ColorSystem.getColorFromNormalizedTemperature if a Skia-like color lib is available
    if (this._temperature < 33) particle.color = RenderConfig.TemperatureColors.Cool;
    else if (this._temperature < 66) particle.color = RenderConfig.TemperatureColors.Medium;
    else particle.color = RenderConfig.TemperatureColors.Hot;

    // If particle has an element type, that color might override temperature color
    // This logic would be in SceneBuilder or Particle component when setting initial color
  }

  private updateBondBehavior(bond: Bond) {
    const intensity = this._temperature / 100;
    bond.stability = Math.max(RenderConfig.Bond.MinVisibleStability, 1 - intensity * 0.9); // Bonds weaken significantly at high temps
  }


  // --- Main Simulation Update ---
  update(deltaTimeMs: number, currentTimeMs: number) {
    if (deltaTimeMs <= 0) return;
    const timeStep = Math.min(deltaTimeMs / 1000, 0.033); // Cap timestep to avoid instability (e.g., max 30fps equivalent physics step)
    this.lastTimestamp = currentTimeMs;

    // Create mutable copies for this update cycle if direct mutation is complex
    // Or iterate and update directly if careful
    const currentParticles = Array.from(this.particles.values());
    const currentBonds = Array.from(this.bonds.values());

    for (const particle of currentParticles) {
      if (particle.isFixed) continue;
      this.applyTemperatureEffects(particle, timeStep, currentTimeMs);
    }

    // Apply bond constraints (multiple iterations for stability if needed, esp. in medium/high)
    const iterations = this.performanceMode === 'low' ? 1 : 2;
    for (let i = 0; i < iterations; i++) {
        for (const bond of currentBonds) {
            this.applyBondConstraint(bond, timeStep);
        }
    }

    for (const particle of currentParticles) {
        if (particle.isFixed) continue;
        this.applyFriction(particle); // Apply some damping/friction
        this.updatePosition(particle, timeStep);
        this.applyBoundaryConstraints(particle);
    }

    if (this.performanceMode !== 'low') {
      this.detectCollisions(currentParticles);
    }
  }

  // --- Physics Sub-Steps ---
  private applyTemperatureEffects(particle: Particle, timeStep: number, currentTimeMs: number) {
    const tempFactor = this._temperature / 50; // Normalized intensity for movement

    // Random brownian-like motion based on temperature
    // Adjust strength based on performance mode
    const randomForceScale = this.performanceMode === 'high' ? 0.5 : 0.2;
    particle.vx += (Math.random() - 0.5) * tempFactor * randomForceScale * particle.mass * timeStep;
    particle.vy += (Math.random() - 0.5) * tempFactor * randomForceScale * particle.mass * timeStep;

    // Apply vibration for "solids" (low temperature state)
    // Using currentTimeMs for more consistent vibration phase across calls
    if (this._temperature < 35 && particle.vibrationIntensity > 0) { // Arbitrary "solid" threshold
      const angle = (currentTimeMs / (particle.vibrationFrequency ?? 200)) * Math.PI * 2;
      particle.x += Math.sin(angle) * particle.vibrationIntensity * timeStep * 50; // scale vibration with timestep
      particle.y += Math.cos(angle) * particle.vibrationIntensity * timeStep * 50;
    }
  }

  private applyFriction(particle: Particle) {
    const friction = 0.98; // Simulate some energy loss / damping
    particle.vx *= friction;
    particle.vy *= friction;
  }

  private updatePosition(particle: Particle, timeStep: number) {
     // Limit speed
     const speed = Math.sqrt(particle.vx ** 2 + particle.vy ** 2);
     if (speed > particle.maxSpeed && particle.maxSpeed > 0) {
       particle.vx = (particle.vx / speed) * particle.maxSpeed;
       particle.vy = (particle.vy / speed) * particle.maxSpeed;
     }
     // Update position
     particle.x += particle.vx * timeStep * 50; // Multiplier to make movement more visible
     particle.y += particle.vy * timeStep * 50;
  }


  private applyBondConstraint(bond: Bond, timeStep: number) {
    // Verlet integration style for bond constraints can be more stable
    const p1 = bond.particle1;
    const p2 = bond.particle2;
    if (p1.isFixed && p2.isFixed) return;

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const distance = Math.max(1, Math.sqrt(dx * dx + dy * dy)); // Prevent division by zero
    const diffRatio = (bond.restLength - distance) / distance;

    // Displace each particle proportionally to its "freedom" (inverse of mass, or 0.5 if masses are equal)
    // For simplicity, using 0.5, or you could use 1/mass if mass is defined
    const p1Share = p1.isFixed ? 0 : (p2.isFixed ? 1 : 0.5);
    const p2Share = p2.isFixed ? 0 : (p1.isFixed ? 1 : 0.5);


    const springForce = diffRatio * (bond.stiffness ?? 0.5) * bond.stability;

    const moveX = dx * springForce;
    const moveY = dy * springForce;

    if (!p1.isFixed) {
        p1.vx -= moveX * p1Share * timeStep ;
        p1.vy -= moveY * p1Share * timeStep ;
    }
    if (!p2.isFixed) {
        p2.vx += moveX * p2Share * timeStep ;
        p2.vy += moveY * p2Share * timeStep ;
    }
  }

  private applyBoundaryConstraints(particle: Particle) {
    const restitution = 0.5; // How much velocity is kept after collision with boundary

    if (particle.x < particle.radius) {
      particle.x = particle.radius;
      particle.vx *= -restitution;
    } else if (particle.x > this.boundaryWidth - particle.radius) {
      particle.x = this.boundaryWidth - particle.radius;
      particle.vx *= -restitution;
    }

    if (particle.y < particle.radius) {
      particle.y = particle.radius;
      particle.vy *= -restitution;
    } else if (particle.y > this.boundaryHeight - particle.radius) {
      particle.y = this.boundaryHeight - particle.radius;
      particle.vy *= -restitution;
    }
  }

  private detectCollisions(particles: Particle[]) {
    // Simple O(n^2) collision detection - consider optimizations for many particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        if (p1.isFixed && p2.isFixed) continue;

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = p1.radius + p2.radius;

        if (distance < minDistance && distance > 0) { // Check distance > 0 to avoid self-collision issues
          // Resolve overlap
          const overlap = (minDistance - distance) / distance;
          const offsetX = dx * overlap * 0.5;
          const offsetY = dy * overlap * 0.5;

          if(!p1.isFixed) {
            p1.x -= offsetX;
            p1.y -= offsetY;
          }
          if(!p2.isFixed) {
            p2.x += offsetX;
            p2.y += offsetY;
          }

          // Simple elastic collision response (simplified)
          // For more accurate collisions, conserve momentum and kinetic energy
          const angle = Math.atan2(dy, dx);
          const sin = Math.sin(angle);
          const cos = Math.cos(angle);

          // Rotate velocities to collision axis
          const v1 = { x: p1.vx * cos + p1.vy * sin, y: p1.vy * cos - p1.vx * sin };
          const v2 = { x: p2.vx * cos + p2.vy * sin, y: p2.vy * cos - p2.vx * sin };

          // Swap velocities along collision axis (for equal mass)
          // More complex if masses differ: (v1Final = (v1*(m1-m2) + 2*m2*v2) / (m1+m2))
          const v1xFinal = p2.isFixed ? -v1.x : v2.x; // If p2 is fixed, p1 bounces off
          const v2xFinal = p1.isFixed ? -v2.x : v1.x; // If p1 is fixed, p2 bounces off

          // Rotate back
          const p1vx = v1xFinal * cos - v1.y * sin;
          const p1vy = v1.y * cos + v1xFinal * sin;
          const p2vx = v2xFinal * cos - v2.y * sin;
          const p2vy = v2.y * cos + v2xFinal * sin;

          const restitution = 0.8; // Bounciness

          if(!p1.isFixed) {
            p1.vx = p1vx * restitution;
            p1.vy = p1vy * restitution;
          }
          if(!p2.isFixed) {
            p2.vx = p2vx * restitution;
            p2.vy = p2vy * restitution;
          }
        }
      }
    }
  }

  // --- Get State ---
  getState(currentTimeMs: number): PhysicsState {
    return {
      particles: Object.freeze(Array.from(this.particles.values()).map(p => ({ ...p }))), // Deep clone for safety
      bonds: Object.freeze(Array.from(this.bonds.values()).map(b => ({ ...b }))),       // Deep clone
      timestamp: currentTimeMs,
    };
  }
}
