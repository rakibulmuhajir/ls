import type { Particle, Bond, LabBoundary, HeatSource } from './types';
import { UniqueID } from '../utils/UniqueID'; // Assuming a utility for unique IDs

// Define the particle type for our simulation, including chemical properties
export type SimParticle = Particle & {
  elementType: string;
  charge: number;
  state: 'solid' | 'liquid' | 'gas';
  isDragged?: boolean;
};

// Simulation parameters that can be changed by the user
export interface PhysicsParams {
  temperature: number;
  density: number;
  surfaceTension: number;
  gravity: number;
}

export class PhysicsEngine {
  public particles: SimParticle[] = [];
  public bonds: Bond[] = [];
  public boundaries: LabBoundary[] = [];
  public heatSources: HeatSource[] = [];

  public params: PhysicsParams;

  private width: number;
  private height: number;

  constructor(width: number, height: number, params: PhysicsParams) {
    this.width = width;
    this.height = height;
    this.params = params;
  }

  // ===== PUBLIC API METHODS =====

  addParticle(particleData: Omit<SimParticle, 'id' | 'state'>): string {
    const id = UniqueID.generate('p_');
    const particle: SimParticle = {
      ...particleData,
      id,
      state: 'liquid', // Default state
    };
    this.particles.push(particle);
    return id;
  }

  addBond(p1Id: string, p2Id: string, type: Bond['type'], restLength: number, stiffness: number): string | null {
    const p1 = this.particles.find(p => p.id === p1Id);
    const p2 = this.particles.find(p => p.id === p2Id);

    if (!p1 || !p2) return null;

    const id = UniqueID.generate('b_');
    const newBond: Bond = { id, particle1: p1, particle2: p2, type, restLength, stiffness, stability: 1.0, color: '#FFF' };
    this.bonds.push(newBond);
    return id;
  }

  addBoundary(boundaryData: Omit<LabBoundary, 'id'>): string {
    const id = UniqueID.generate('boundary_');
    this.boundaries.push({ ...boundaryData, id });
    return id;
  }

  addHeatSource(sourceData: Omit<HeatSource, 'id'>): string {
    const id = UniqueID.generate('heat_');
    this.heatSources.push({ ...sourceData, id, isActive: true });
    return id;
  }

  startDrag(id: string) {
    this.particles.find(p => p.id === id)!.isDragged = true;
  }

  updateDrag(id: string, x: number, y: number) {
    const p = this.particles.find(p => p.id === id);
    if (p) {
      p.x = Math.max(p.radius, Math.min(this.width - p.radius, x));
      p.y = Math.max(p.radius, Math.min(this.height - p.radius, y));
      p.vx = 0;
      p.vy = 0;
    }
  }

  endDrag(id: string, vx: number, vy: number) {
    const p = this.particles.find(p => p.id === id);
    if (p) {
      p.isDragged = false;
      p.vx = vx;
      p.vy = vy;
    }
  }


  // ===== CORE SIMULATION LOOP =====

  update() {
    // Step 1: Update positions based on velocity and forces
    this.particles = this.particles.map(p => {
        if (p.isDragged) return { ...p, isDragged: false }; // Reset for next frame

        const newState = this.params.temperature > 80 ? 'gas' : this.params.temperature > 30 ? 'liquid' : 'solid';
        let { vx, vy } = p;
        let finalGravity = this.params.gravity * 0.2;

        if (newState === 'liquid') {
            const viscosityEffect = this.params.density * 0.1;
            vx *= (1 - viscosityEffect);
            vy *= (1 - viscosityEffect);
            finalGravity *= (1 + this.params.density);
        }
        vy += finalGravity;

        const x = p.x + vx;
        const y = p.y + vy;

        return { ...p, x, y, vx, vy, state: newState };
    });

    // Step 2: Resolve all collisions and constraints
    for (let i = 0; i < this.particles.length; i++) {
        const p1 = this.particles[i];

        // Wall collisions
        if (p1.x <= p1.radius) { p1.x = p1.radius; p1.vx *= -0.7; }
        if (p1.x >= this.width - p1.radius) { p1.x = this.width - p1.radius; p1.vx *= -0.7; }
        if (p1.y <= p1.radius) { p1.y = p1.radius; p1.vy *= -0.7; }
        if (p1.y >= this.height - p1.radius) { p1.y = this.height - p1.radius; p1.vy *= -0.7; }

        // Particle-particle collisions
        for (let j = i + 1; j < this.particles.length; j++) {
            const p2 = this.particles[j];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = p1.radius + p2.radius;

            if (distance > 0 && distance < minDistance) {
                // Resolve overlap
                const overlap = (minDistance - distance) / distance;
                const offsetX = dx * overlap * 0.5;
                const offsetY = dy * overlap * 0.5;
                p1.x -= offsetX; p1.y -= offsetY;
                p2.x += offsetX; p2.y += offsetY;

                // Elastic collision
                const angle = Math.atan2(dy, dx);
                const sin = Math.sin(angle);
                const cos = Math.cos(angle);
                const v1 = { x: p1.vx * cos + p1.vy * sin, y: p1.vy * cos - p1.vx * sin };
                const v2 = { x: p2.vx * cos + p2.vy * sin, y: p2.vy * cos - p2.vx * sin };
                [v1.x, v2.x] = [v2.x, v1.x];
                p1.vx = (v1.x * cos - v1.y * sin) * 0.98;
                p1.vy = (v1.y * cos + v1.x * sin) * 0.98;
                p2.vx = (v2.x * cos - v2.y * sin) * 0.98;
                p2.vy = (v2.y * cos + v2.x * sin) * 0.98;
            }
        }
    }

    // Step 3: Apply bond forces
    for (const bond of this.bonds) {
        const p1 = this.particles.find(p => p.id === bond.particle1.id);
        const p2 = this.particles.find(p => p.id === bond.particle2.id);

        if (!p1 || !p2) continue;

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        const diff = (distance - bond.restLength) / distance;
        const force = diff * (bond.stiffness || 0.5);

        const forceX = force * dx;
        const forceY = force * dy;

        if (!p1.isDragged) { p1.vx += forceX * 0.5; p1.vy += forceY * 0.5; }
        if (!p2.isDragged) { p2.vx -= forceX * 0.5; p2.vy -= forceY * 0.5; }
    }
  }
}
