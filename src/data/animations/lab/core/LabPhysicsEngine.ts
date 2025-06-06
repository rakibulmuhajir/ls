// ===========================================
// 2. src/data/animations/lab/core/LabPhysicsEngine.ts
// ===========================================

import type { Particle, LabBoundary, HeatSource } from './labTypes';

const LabColors = {
  temperature: {
    cold: '#4A90E2',
    warm: '#F6AD55',
    hot: '#F56565'
  }
};

export class LabPhysicsEngine {
  private particles: Map<string, Particle> = new Map();
  private boundaries: Map<string, LabBoundary> = new Map();
  private heatSources: Map<string, HeatSource> = new Map();
  private width: number;
  private height: number;
  private globalTemperature: number = 25;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  // Particle Management
  addParticle(data: Omit<Particle, 'id'> & { id?: string }): string {
    const id = data.id || `particle_${Date.now()}_${Math.random()}`;
    const particle: Particle = {
      ...data,
      id,
      temperature: data.temperature || this.globalTemperature
    };
    this.particles.set(id, particle);
    return id;
  }

  removeParticle(id: string): void {
    this.particles.delete(id);
  }

  // Lab Equipment Management
  addBoundary(boundary: Omit<LabBoundary, 'id'>): string {
    const id = `boundary_${Date.now()}_${Math.random()}`;
    this.boundaries.set(id, { ...boundary, id });
    return id;
  }

  addHeatSource(heatSource: Omit<HeatSource, 'id'>): string {
    const id = `heat_${Date.now()}_${Math.random()}`;
    this.heatSources.set(id, { ...heatSource, id });
    return id;
  }

  updateHeatSource(id: string, updates: Partial<HeatSource>): void {
    const heatSource = this.heatSources.get(id);
    if (heatSource) {
      Object.assign(heatSource, updates);
    }
  }

  // Physics Update
  update(deltaTime: number): void {
    this.applyHeatEffects();
    this.updateParticles(deltaTime);
    this.applyBoundaryConstraints();
  }

  private applyHeatEffects(): void {
    this.particles.forEach(particle => {
      let maxTemp = this.globalTemperature;

      // Check heat sources
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
      const tempDiff = maxTemp - particle.temperature;
      particle.temperature += tempDiff * 0.02; // Gradual heating/cooling

      // Update particle properties based on temperature
      this.updateParticleFromTemperature(particle);
    });
  }

  private updateParticleFromTemperature(particle: Particle): void {
    const tempFactor = (particle.temperature - 25) / 75; // 0-1 scale

    // Color changes with temperature
    if (particle.temperature < 40) {
      particle.color = LabColors.temperature.cold;
    } else if (particle.temperature < 70) {
      particle.color = LabColors.temperature.warm;
    } else {
      particle.color = LabColors.temperature.hot;
    }

    // Speed increases with temperature
    particle.maxSpeed = 0.5 + tempFactor * 2.0;

    // Add thermal motion
    const thermalForce = Math.max(0, tempFactor) * 0.3;
    particle.vx += (Math.random() - 0.5) * thermalForce;
    particle.vy += (Math.random() - 0.5) * thermalForce;
  }

  private updateParticles(deltaTime: number): void {
    this.particles.forEach(particle => {
      // Apply friction
      particle.vx *= 0.99;
      particle.vy *= 0.99;

      // Limit speed
      const speed = Math.sqrt(particle.vx ** 2 + particle.vy ** 2);
      if (speed > particle.maxSpeed) {
        particle.vx = (particle.vx / speed) * particle.maxSpeed;
        particle.vy = (particle.vy / speed) * particle.maxSpeed;
      }

      // Update position
      particle.x += particle.vx * deltaTime * 20;
      particle.y += particle.vy * deltaTime * 20;

      // Boundary walls
      if (particle.x - particle.radius < 0) {
        particle.x = particle.radius;
        particle.vx *= -0.8;
      }
      if (particle.x + particle.radius > this.width) {
        particle.x = this.width - particle.radius;
        particle.vx *= -0.8;
      }
      if (particle.y - particle.radius < 0) {
        particle.y = particle.radius;
        particle.vy *= -0.8;
      }
      if (particle.y + particle.radius > this.height) {
        particle.y = this.height - particle.radius;
        particle.vy *= -0.8;
      }
    });
  }

  private applyBoundaryConstraints(): void {
    this.particles.forEach(particle => {
      this.boundaries.forEach(boundary => {
        const collision = this.checkCollision(particle, boundary);
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
    });
  }

  private checkCollision(particle: Particle, boundary: LabBoundary): {
    hasCollision: boolean;
    normal?: { x: number; y: number };
    penetration: number;
  } {
    if (boundary.shape === 'rectangle' && boundary.width && boundary.height) {
      const left = boundary.x;
      const right = boundary.x + boundary.width;
      const top = boundary.y;
      const bottom = boundary.y + boundary.height;

      // Check if inside container
      if (particle.x + particle.radius > left &&
          particle.x - particle.radius < right &&
          particle.y + particle.radius > top &&
          particle.y - particle.radius < bottom) {

        // Find closest wall
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

  // Getters
  getParticles(): Particle[] {
    return Array.from(this.particles.values());
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

  reset(): void {
    this.particles.clear();
    this.boundaries.clear();
    this.heatSources.clear();
  }
}
