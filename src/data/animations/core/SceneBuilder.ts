// src/data/animations/core/SceneBuilder.ts

import { PhysicsEngine } from './Physics';
import type { Particle, Bond } from './types'; // Use 'type' import
import { ColorSystem } from './Colors';
import { UniqueID } from '@/utils/UniqueID'; // Adjust path as needed
import { RenderConfig } from './RenderConfig';

export class SceneBuilder {
  private physics: PhysicsEngine;

  constructor(physicsEngine: PhysicsEngine) {
    this.physics = physicsEngine;
  }

  // Method to clear existing scene elements before building a new one
  public clearScene(): void {
    // This assumes PhysicsEngine has a reset or clearAll method
    this.physics.reset(); // PhysicsEngine.reset() now clears particles and bonds
  }

  public createWaterMolecule(
    baseId: string, // e.g., "water1"
    x: number,
    y: number,
    scale: number = 1,
    boundaryWidth: number,
    boundaryHeight: number
  ): { oxygenId: string; hydrogen1Id: string; hydrogen2Id: string } {

    const oxygenData: Omit<Particle, 'vx' | 'vy' | 'maxSpeed' | 'vibrationIntensity' | 'color'> & Partial<Particle> = {
      id: `${baseId}_O`,
      x,
      y,
      radius: 12 * scale,
      mass: 16, // Approx atomic mass
      boundaryWidth,
      boundaryHeight,
      data: { elementType: 'O' }, // Store element type for other logic if needed
    };
    const oxygenId = this.physics.addParticle(oxygenData);
    // Manually set color after adding, or let PhysicsEngine handle initial color based on elementType if implemented
    const oxygenParticle = this.physics.particles.get(oxygenId);
    if (oxygenParticle) oxygenParticle.color = ColorSystem.getElementColor('O');


    const h1Data: Omit<Particle, 'vx' | 'vy' | 'maxSpeed' | 'vibrationIntensity' | 'color'> & Partial<Particle> = {
      id: `${baseId}_H1`,
      x: x - 20 * scale, // Approximate position
      y: y + 15 * scale,
      radius: 8 * scale,
      mass: 1,
      boundaryWidth,
      boundaryHeight,
      data: { elementType: 'H' },
    };
    const hydrogen1Id = this.physics.addParticle(h1Data);
    const h1Particle = this.physics.particles.get(hydrogen1Id);
    if (h1Particle) h1Particle.color = ColorSystem.getElementColor('H');


    const h2Data: Omit<Particle, 'vx' | 'vy' | 'maxSpeed' | 'vibrationIntensity' | 'color'> & Partial<Particle> = {
      id: `${baseId}_H2`,
      x: x + 20 * scale, // Approximate position
      y: y + 15 * scale,
      radius: 8 * scale,
      mass: 1,
      boundaryWidth,
      boundaryHeight,
      data: { elementType: 'H' },
    };
    const hydrogen2Id = this.physics.addParticle(h2Data);
    const h2Particle = this.physics.particles.get(hydrogen2Id);
    if (h2Particle) h2Particle.color = ColorSystem.getElementColor('H');


    // Add bonds using the IDs returned by addParticle
    this.physics.addBond({ p1Id: oxygenId, p2Id: hydrogen1Id, type: 'single', restLength: 22 * scale, stiffness: 0.8 });
    this.physics.addBond({ p1Id: oxygenId, p2Id: hydrogen2Id, type: 'single', restLength: 22 * scale, stiffness: 0.8 });

    return { oxygenId, hydrogen1Id, hydrogen2Id };
  }

  public createNaClUnit(
    baseId: string,
    x: number,
    y: number,
    scale: number = 1,
    boundaryWidth: number,
    boundaryHeight: number
  ): { naId: string, clId: string } {
    const naData: Omit<Particle, 'vx' | 'vy' | 'maxSpeed' | 'vibrationIntensity' | 'color'> & Partial<Particle> = {
      id: `${baseId}_Na`, x, y, radius: 15 * scale, mass: 23, boundaryWidth, boundaryHeight, data: { elementType: 'Na' }
    };
    const naId = this.physics.addParticle(naData);
    const naParticle = this.physics.particles.get(naId);
    if (naParticle) naParticle.color = ColorSystem.getElementColor('Na');

    const clData: Omit<Particle, 'vx' | 'vy' | 'maxSpeed' | 'vibrationIntensity' | 'color'> & Partial<Particle> = {
      id: `${baseId}_Cl`, x: x + 35 * scale, y, radius: 18 * scale, mass: 35.5, boundaryWidth, boundaryHeight, data: { elementType: 'Cl' }
    };
    const clId = this.physics.addParticle(clData);
    const clParticle = this.physics.particles.get(clId);
    if (clParticle) clParticle.color = ColorSystem.getElementColor('Cl');

    // Ionic bonds are primarily electrostatic attraction, represented here as a fairly stable bond
    this.physics.addBond({ p1Id: naId, p2Id: clId, type: 'ionic', restLength: 35 * scale, stability: 0.9, stiffness: 0.6 });
    return { naId, clId };
  }

  public createCO2Molecule(
    baseId: string,
    x: number,
    y: number,
    scale: number = 1,
    boundaryWidth: number,
    boundaryHeight: number
  ): { cId: string, o1Id: string, o2Id: string} {
    const carbonData: Omit<Particle, 'vx' | 'vy' | 'maxSpeed' | 'vibrationIntensity' | 'color'> & Partial<Particle> = {
      id: `${baseId}_C`, x, y, radius: 12 * scale, mass: 12, boundaryWidth, boundaryHeight, data: { elementType: 'C' }
    };
    const cId = this.physics.addParticle(carbonData);
    const cParticle = this.physics.particles.get(cId);
    if (cParticle) cParticle.color = ColorSystem.getElementColor('C');

    const oxygen1Data: Omit<Particle, 'vx' | 'vy' | 'maxSpeed' | 'vibrationIntensity' | 'color'> & Partial<Particle> = {
      id: `${baseId}_O1`, x: x - 25 * scale, y, radius: 11 * scale, mass: 16, boundaryWidth, boundaryHeight, data: { elementType: 'O' }
    };
    const o1Id = this.physics.addParticle(oxygen1Data);
    const o1Particle = this.physics.particles.get(o1Id);
    if (o1Particle) o1Particle.color = ColorSystem.getElementColor('O');

    const oxygen2Data: Omit<Particle, 'vx' | 'vy' | 'maxSpeed' | 'vibrationIntensity' | 'color'> & Partial<Particle> = {
      id: `${baseId}_O2`, x: x + 25 * scale, y, radius: 11 * scale, mass: 16, boundaryWidth, boundaryHeight, data: { elementType: 'O' }
    };
    const o2Id = this.physics.addParticle(oxygen2Data);
    const o2Particle = this.physics.particles.get(o2Id);
    if (o2Particle) o2Particle.color = ColorSystem.getElementColor('O');

    // CO2 has double bonds
    this.physics.addBond({ p1Id: cId, p2Id: o1Id, type: 'double', restLength: 25 * scale, stiffness: 0.9 });
    this.physics.addBond({ p1Id: cId, p2Id: o2Id, type: 'double', restLength: 25 * scale, stiffness: 0.9 });
    return { cId, o1Id, o2Id };
  }

  public createStatesOfMatter(
    count: number,
    state: 'solid' | 'liquid' | 'gas',
    width: number, // This is the boundary width for the particles
    height: number, // This is the boundary height for the particles
    elementSymbol: string = 'Ar' // Default to Argon for generic particles
  ): string[] { // Returns array of particle IDs
    const particleIds: string[] = [];
    const baseRadius = state === 'gas' ? 6 : (state === 'liquid' ? 8 : 10);
    const particleColor = ColorSystem.getElementColor(elementSymbol); // Get color once

    for (let i = 0; i < count; i++) {
      const particleId = UniqueID.generate(`particle_${state}_${i}_`);
      const particleData: Omit<Particle, 'vx' | 'vy' | 'maxSpeed' | 'vibrationIntensity' | 'color'> & Partial<Particle> = {
        id: particleId,
        x: Math.random() * (width - baseRadius * 2) + baseRadius,   // Ensure within bounds
        y: Math.random() * (height - baseRadius * 2) + baseRadius, // Ensure within bounds
        radius: baseRadius + (Math.random() - 0.5) * 2, // Slight size variation
        mass: baseRadius, // Simple mass
        boundaryWidth: width,  // Pass the boundary to each particle
        boundaryHeight: height,
        data: { elementType: elementSymbol, initialState: state },
        // PhysicsEngine will set initial color based on temperature,
        // but we can set a base color here.
        // color: ColorSystem.getStateColor(state) // This will be overridden by temp in PhysicsEngine
      };
      const addedId = this.physics.addParticle(particleData);
      const p = this.physics.particles.get(addedId);
      if(p) p.color = particleColor; // Set the base element color
      particleIds.push(addedId);
    }

    // For 'solid' state, you might want to arrange particles in a lattice and add bonds
    if (state === 'solid' && count > 1) {
      // Simple grid arrangement for solids for demonstration
      const cols = Math.ceil(Math.sqrt(count));
      const rows = Math.ceil(count / cols);
      const spacingX = (width - 2 * baseRadius) / Math.max(1, cols -1);
      const spacingY = (height - 2 * baseRadius) / Math.max(1, rows-1);

      for(let i=0; i < particleIds.length; i++) {
        const p = this.physics.particles.get(particleIds[i]);
        if(!p) continue;

        const r = Math.floor(i / cols);
        const c = i % cols;

        p.x = baseRadius + c * spacingX;
        p.y = baseRadius + r * spacingY;
        p.isFixed = false; // Solids vibrate but aren't entirely fixed unless specified

        // Add bonds to neighbors in a simple solid structure
        // (This is a basic example, real crystal structures are more complex)
        // Bond with particle to the right
        if (c < cols - 1 && i + 1 < particleIds.length) {
          this.physics.addBond({ p1Id: particleIds[i], p2Id: particleIds[i+1], type: 'single', restLength: spacingX * 0.8, stiffness: 0.7 });
        }
        // Bond with particle below
        if (r < rows - 1 && i + cols < particleIds.length) {
          this.physics.addBond({ p1Id: particleIds[i], p2Id: particleIds[i+cols], type: 'single', restLength: spacingY * 0.8, stiffness: 0.7 });
        }
      }
    }
    return particleIds;
  }

  // Example: Build a scene from a configuration object
  public buildFromConfig(config: AnimationConfig): void {
    this.clearScene(); // Start fresh
    this.physics.boundaryWidth = config.width;
    this.physics.boundaryHeight = config.height;

    if (config.initialTemperature !== undefined) {
        this.physics.setTemperature(config.initialTemperature);
    }
    if(config.performanceMode) {
        // Note: PerformanceManager should be the one calling setPerformanceMode on PhysicsEngine
        // this.physics.setPerformanceMode(config.performanceMode);
    }


    switch (config.type) {
      case 'molecule':
        const moleculeId = UniqueID.generate('mol_');
        if (config.moleculeType === 'water') {
          this.createWaterMolecule(moleculeId, config.width / 2, config.height / 2, 1, config.width, config.height);
        } else if (config.moleculeType === 'co2') {
          this.createCO2Molecule(moleculeId, config.width / 2, config.height / 2, 1, config.width, config.height);
        } else if (config.moleculeType === 'nacl') {
            this.createNaClUnit(moleculeId, config.width / 2, config.height / 2, 1, config.width, config.height);
        }
        // Add more molecule types
        break;
      case 'states':
        if (config.stateType && config.particleCount) {
          this.createStatesOfMatter(config.particleCount, config.stateType, config.width, config.height);
        }
        break;
      // Add 'reaction' or 'custom' cases
    }
  }
}
