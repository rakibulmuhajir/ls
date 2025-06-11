import type { Particle } from './types'; // Assuming you have a types.ts file

// Define the particle type for our simulation
export type SimParticle = Omit<Particle, 'id'> & {
  id: string;
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
  public params: PhysicsParams;

  private width: number;
  private height: number;
  private draggedParticleId: string | null = null;

  constructor(width: number, height: number, params: PhysicsParams) {
    this.width = width;
    this.height = height;
    this.params = params;
  }

  // ===== PUBLIC API METHODS (to be called from React) =====

  addParticles(count: number) {
    const newParticles: SimParticle[] = Array(count).fill(0).map((_, i) => ({
      id: `p-${Date.now()}-${i}`,
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
      radius: 12 + Math.random() * 6, color: `hsl(${200 + Math.random() * 40}, 90%, 60%)`,
      mass: 1, state: 'liquid' as const, isDragged: false,
      maxSpeed: 10, vibrationIntensity: 0.1, boundaryWidth: this.width, boundaryHeight: this.height,
    }));
    this.particles.push(...newParticles);
  }

  startDrag(id: string) {
      this.draggedParticleId = id;
      this.particles.forEach(p => {
          if (p.id === id) p.isDragged = true;
      });
  }

  updateDrag(id: string, x: number, y: number) {
      this.particles.forEach(p => {
          if (p.id === id) {
              p.x = Math.max(p.radius, Math.min(this.width - p.radius, x));
              p.y = Math.max(p.radius, Math.min(this.height - p.radius, y));
              p.vx = 0;
              p.vy = 0;
          }
      });
  }

  endDrag(id: string, vx: number, vy: number) {
      this.particles.forEach(p => {
          if (p.id === id) {
              p.isDragged = false;
              p.vx = vx;
              p.vy = vy;
          }
      });
      this.draggedParticleId = null;
  }


  // ===== CORE SIMULATION LOOP =====

  update() {
    // 1. Update positions based on physics
    this.particles = this.particles.map(p => {
      if (p.isDragged) return p;

      const newState = this.params.temperature > 0.8 ? 'gas' : this.params.temperature > 0.4 ? 'liquid' : 'solid';
      let { vx, vy } = p;
      let finalGravity = this.params.gravity * 0.2;

      if (newState === 'liquid') {
        const viscosityEffect = this.params.density * 0.1;
        vx *= (1 - viscosityEffect);
        vy *= (1 - viscosityEffect);
        finalGravity *= (1 + this.params.density);
      } else if (newState === 'gas') {
        vx += (Math.random() - 0.5) * this.params.temperature * 0.4;
        vy += (Math.random() - 0.5) * this.params.temperature * 0.4;
      }
      vy += finalGravity;

      const x = p.x + vx;
      const y = p.y + vy;

      const waterColor = 200 + this.params.density * 40;
      const lavaColor = 15 + this.params.density * 30;
      const baseHue = Math.max(0, lavaColor - waterColor);
      const newColor = `hsl(${baseHue}, ${90 - this.params.density * 20}%, ${60 - this.params.density * 15}%)`;

      return { ...p, x, y, vx, vy, state: newState, color: newColor };
    });

    // 2. Resolve all collisions
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

            if (distance < minDistance) {
                // Resolution logic... (as before)
                const overlap = (minDistance - distance) / distance;
                const offsetX = dx * overlap * 0.5;
                const offsetY = dy * overlap * 0.5;
                p1.x -= offsetX; p1.y -= offsetY;
                p2.x += offsetX; p2.y += offsetY;

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
  }
}
