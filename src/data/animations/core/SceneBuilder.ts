// src/data/animations/core/SceneBuilder.ts

import { UnifiedPhysicsEngine } from './UnifiedPhysicsEngine';
import type { Particle, Bond, AnimationConfig } from './types';
import { ColorSystem } from './Colors';
import { UniqueID } from '@/data/animations/utils/UniqueID';
import { RenderConfig } from './RenderConfig';

export class SceneBuilder {
  private physics: UnifiedPhysicsEngine;

  constructor(physicsEngine: UnifiedPhysicsEngine) {
    this.physics = physicsEngine;
  }

  // ===== SCENE MANAGEMENT =====
  public clearScene(): void {
    this.physics.reset();
  }

  // ===== MOLECULAR STRUCTURES =====
  public createWaterMolecule(
    baseId: string,
    x: number,
    y: number,
    scale: number = 1,
    boundaryWidth?: number,
    boundaryHeight?: number
  ): { oxygenId: string; hydrogen1Id: string; hydrogen2Id: string } {

    // Create oxygen atom
    const oxygenId = this.physics.addParticle({
      id: `${baseId}_O`,
      x,
      y,
      radius: 12 * scale,
      mass: 16,
      color: ColorSystem.getElementColor('O'),
      boundaryWidth: boundaryWidth || 0,
      boundaryHeight: boundaryHeight || 0,
      data: { elementType: 'O' },
    });

    // Create hydrogen atoms
    const hydrogen1Id = this.physics.addParticle({
      id: `${baseId}_H1`,
      x: x - 20 * scale,
      y: y + 15 * scale,
      radius: 8 * scale,
      mass: 1,
      color: ColorSystem.getElementColor('H'),
      boundaryWidth: boundaryWidth || 0,
      boundaryHeight: boundaryHeight || 0,
      data: { elementType: 'H' },
    });

    const hydrogen2Id = this.physics.addParticle({
      id: `${baseId}_H2`,
      x: x + 20 * scale,
      y: y + 15 * scale,
      radius: 8 * scale,
      mass: 1,
      color: ColorSystem.getElementColor('H'),
      boundaryWidth: boundaryWidth || 0,
      boundaryHeight: boundaryHeight || 0,
      data: { elementType: 'H' },
    });

    // Create bonds
    this.physics.addBond({
      p1Id: oxygenId,
      p2Id: hydrogen1Id,
      type: 'single',
      restLength: 22 * scale,
      stiffness: 0.8
    });

    this.physics.addBond({
      p1Id: oxygenId,
      p2Id: hydrogen2Id,
      type: 'single',
      restLength: 22 * scale,
      stiffness: 0.8
    });

    return { oxygenId, hydrogen1Id, hydrogen2Id };
  }

  public createCO2Molecule(
    baseId: string,
    x: number,
    y: number,
    scale: number = 1,
    boundaryWidth?: number,
    boundaryHeight?: number
  ): { cId: string; o1Id: string; o2Id: string } {

    const cId = this.physics.addParticle({
      id: `${baseId}_C`,
      x,
      y,
      radius: 12 * scale,
      mass: 12,
      color: ColorSystem.getElementColor('C'),
      boundaryWidth: boundaryWidth || 0,
      boundaryHeight: boundaryHeight || 0,
      data: { elementType: 'C' },
    });

    const o1Id = this.physics.addParticle({
      id: `${baseId}_O1`,
      x: x - 25 * scale,
      y,
      radius: 11 * scale,
      mass: 16,
      color: ColorSystem.getElementColor('O'),
      boundaryWidth: boundaryWidth || 0,
      boundaryHeight: boundaryHeight || 0,
      data: { elementType: 'O' },
    });

    const o2Id = this.physics.addParticle({
      id: `${baseId}_O2`,
      x: x + 25 * scale,
      y,
      radius: 11 * scale,
      mass: 16,
      color: ColorSystem.getElementColor('O'),
      boundaryWidth: boundaryWidth || 0,
      boundaryHeight: boundaryHeight || 0,
      data: { elementType: 'O' },
    });

    // Double bonds
    this.physics.addBond({
      p1Id: cId,
      p2Id: o1Id,
      type: 'double',
      restLength: 25 * scale,
      stiffness: 0.9
    });

    this.physics.addBond({
      p1Id: cId,
      p2Id: o2Id,
      type: 'double',
      restLength: 25 * scale,
      stiffness: 0.9
    });

    return { cId, o1Id, o2Id };
  }

  public createNaClUnit(
    baseId: string,
    x: number,
    y: number,
    scale: number = 1,
    boundaryWidth?: number,
    boundaryHeight?: number
  ): { naId: string; clId: string } {

    const naId = this.physics.addParticle({
      id: `${baseId}_Na`,
      x,
      y,
      radius: 15 * scale,
      mass: 23,
      color: ColorSystem.getElementColor('Na'),
      boundaryWidth: boundaryWidth || 0,
      boundaryHeight: boundaryHeight || 0,
      data: { elementType: 'Na' },
    });

    const clId = this.physics.addParticle({
      id: `${baseId}_Cl`,
      x: x + 35 * scale,
      y,
      radius: 18 * scale,
      mass: 35.5,
      color: ColorSystem.getElementColor('Cl'),
      boundaryWidth: boundaryWidth || 0,
      boundaryHeight: boundaryHeight || 0,
      data: { elementType: 'Cl' },
    });

    // Ionic bond
    this.physics.addBond({
      p1Id: naId,
      p2Id: clId,
      type: 'ionic',
      restLength: 35 * scale,
      stability: 0.9,
      stiffness: 0.6
    });

    return { naId, clId };
  }

private buildCustomScene(config: AnimationConfig): void {
    // Custom scene - start with empty scene, user can add particles manually
    // This is for test scenarios and custom setups
    console.log('Custom scene initialized - add particles manually');
  }

  // ===== STATES OF MATTER =====
  public createStatesOfMatter(
    count: number,
    state: 'solid' | 'liquid' | 'gas',
    width: number,
    height: number,
    elementSymbol: string = 'Ar'
  ): string[] {
    const particleIds: string[] = [];
    const baseRadius = state === 'gas' ? 6 : (state === 'liquid' ? 8 : 10);
    const particleColor = ColorSystem.getElementColor(elementSymbol);

    for (let i = 0; i < count; i++) {
      const particleId = this.physics.addParticle({
        id: UniqueID.generate(`${state}_particle_`),
        x: Math.random() * (width - baseRadius * 2) + baseRadius,
        y: Math.random() * (height - baseRadius * 2) + baseRadius,
        radius: baseRadius + (Math.random() - 0.5) * 2,
        mass: baseRadius,
        color: particleColor,
        boundaryWidth: width,
        boundaryHeight: height,
        data: { elementType: elementSymbol, initialState: state },
      });

      particleIds.push(particleId);
    }

    // For solid state, arrange in lattice and add bonds
    if (state === 'solid' && count > 1) {
      this.arrangeSolidLattice(particleIds, width, height, baseRadius);
    }

    return particleIds;
  }

  private arrangeSolidLattice(particleIds: string[], width: number, height: number, baseRadius: number): void {
    const cols = Math.ceil(Math.sqrt(particleIds.length));
    const rows = Math.ceil(particleIds.length / cols);
    const spacingX = (width - 2 * baseRadius) / Math.max(1, cols - 1);
    const spacingY = (height - 2 * baseRadius) / Math.max(1, rows - 1);

    particleIds.forEach((id, i) => {
      const particle = this.physics.getParticles().find(p => p.id === id);
      if (!particle) return;

      const row = Math.floor(i / cols);
      const col = i % cols;

      particle.x = baseRadius + col * spacingX;
      particle.y = baseRadius + row * spacingY;
      particle.isFixed = false; // Solids vibrate but aren't fixed

      // Add bonds to neighbors
      if (col < cols - 1 && i + 1 < particleIds.length) {
        this.physics.addBond({
          p1Id: particleIds[i],
          p2Id: particleIds[i + 1],
          type: 'single',
          restLength: spacingX * 0.8,
          stiffness: 0.7
        });
      }

      if (row < rows - 1 && i + cols < particleIds.length) {
        this.physics.addBond({
          p1Id: particleIds[i],
          p2Id: particleIds[i + cols],
          type: 'single',
          restLength: spacingY * 0.8,
          stiffness: 0.7
        });
      }
    });
  }

  // ===== LAB EXPERIMENTS =====
  public createLabContainer(
    x: number,
    y: number,
    width: number,
    height: number,
    containerType: 'beaker' | 'flask' | 'test-tube' = 'beaker'
  ): string {
    return this.physics.addBoundary({
      type: 'container',
      shape: 'rectangle',
      x: x + 8,
      y: y + height * 0.3,
      width: width - 16,
      height: height * 0.6,
      restitution: 0.3,
      friction: 0.1,
    });
  }

  public createLabParticles(
    count: number,
    containerX: number,
    containerY: number,
    containerWidth: number,
    containerHeight: number,
    liquidType: 'water' | 'acid' | 'base' = 'water'
  ): string[] {
    const colors = {
      water: '#4A90E2',
      acid: '#FFE135',
      base: '#4ECDC4'
    };

    const particleIds: string[] = [];
    const color = colors[liquidType];

    for (let i = 0; i < count; i++) {
      const particleId = this.physics.addParticle({
        x: containerX + 15 + Math.random() * (containerWidth - 30),
        y: containerY + containerHeight * 0.4 + Math.random() * (containerHeight * 0.4),
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: 2 + Math.random() * 2,
        mass: 1,
        color,
        boundaryWidth: containerWidth,
        boundaryHeight: containerHeight,
        maxSpeed: 1,
        vibrationIntensity: 0.1,
        data: { liquidType, elementType: liquidType === 'water' ? 'H2O' : liquidType }
      });

      particleIds.push(particleId);
    }

    return particleIds;
  }

  public createHeatingSource(
    x: number,
    y: number,
    radius: number = 60,
    temperature: number = 75
  ): string {
    return this.physics.addHeatSource({
      x,
      y,
      radius,
      intensity: 0,
      temperature,
      isActive: false
    });
  }

  // ===== SCENE BUILDING FROM CONFIG =====
  public buildFromConfig(config: AnimationConfig): void {
    this.clearScene();

    try {
      switch (config.type) {
        case 'molecule':
          this.buildMolecularScene(config);
          break;
        case 'states':
          this.buildStatesScene(config);
          break;
        case 'lab':
          this.buildLabScene(config);
          break;
        case 'reaction':
          this.buildReactionScene(config);
          break;
        case 'custom':
          this.buildCustomScene(config);
          break;
        default:
          console.warn(`Unknown animation type: ${config.type}`);
      }

      // Apply global settings
      if (config.initialTemperature !== undefined) {
        this.physics.setTemperature(config.initialTemperature);
      }

      if (config.performanceMode) {
        this.physics.setPerformanceMode(config.performanceMode);
      }
    } catch (error) {
      console.error('Failed to build scene from config:', error);
    }
  }

  private buildMolecularScene(config: AnimationConfig): void {
    const { width, height, moleculeType } = config;
    const centerX = width / 2;
    const centerY = height / 2;

    switch (moleculeType) {
      case 'water':
        this.createWaterMolecule('water_main', centerX, centerY, 1, width, height);
        break;
      case 'co2':
        this.createCO2Molecule('co2_main', centerX, centerY, 1, width, height);
        break;
      case 'nacl':
        this.createNaClUnit('nacl_main', centerX, centerY, 1, width, height);
        break;
      default:
        // Create a generic molecule
        this.createWaterMolecule('generic_mol', centerX, centerY, 1, width, height);
    }
  }

  private buildStatesScene(config: AnimationConfig): void {
    const { width, height, stateType, particleCount = 30 } = config;

    if (stateType) {
      this.createStatesOfMatter(particleCount, stateType, width, height);
    }
  }

  private buildLabScene(config: AnimationConfig): void {
    const { width, height, experimentType } = config;

    switch (experimentType) {
      case 'heating':
        this.buildHeatingExperiment(width, height);
        break;
      case 'mixing':
        this.buildMixingExperiment(width, height);
        break;
      case 'titration':
        this.buildTitrationExperiment(width, height);
        break;
      default:
        this.buildBasicLabSetup(width, height);
    }
  }

  private buildReactionScene(config: AnimationConfig): void {
    const { width, height } = config;

    // Example: H2 + Cl2 -> 2HCl reaction
    const h2Id = this.createH2Molecule('h2_1', width * 0.3, height * 0.5, width, height);
    const cl2Id = this.createCl2Molecule('cl2_1', width * 0.7, height * 0.5, width, height);

    // Set initial velocities for collision
    const h2Particles = this.physics.getParticles().filter(p => p.id.startsWith('h2_1'));
    const cl2Particles = this.physics.getParticles().filter(p => p.id.startsWith('cl2_1'));

    h2Particles.forEach(p => p.vx = 0.5);
    cl2Particles.forEach(p => p.vx = -0.5);
  }

  // ===== LAB EXPERIMENT BUILDERS =====
  private buildHeatingExperiment(width: number, height: number): void {
    // Create beaker container
    this.createLabContainer(width * 0.3, height * 0.3, width * 0.4, height * 0.5, 'beaker');

    // Add water particles
    this.createLabParticles(
      20,
      width * 0.3,
      height * 0.3,
      width * 0.4,
      height * 0.5,
      'water'
    );

    // Add heat source (Bunsen burner position)
    this.createHeatingSource(width * 0.5, height * 0.85, 60, 80);
  }

  private buildMixingExperiment(width: number, height: number): void {
    // Create container
    this.createLabContainer(width * 0.25, height * 0.2, width * 0.5, height * 0.6, 'beaker');

    // Add different liquid types
    this.createLabParticles(15, width * 0.25, height * 0.2, width * 0.25, height * 0.6, 'water');
    this.createLabParticles(15, width * 0.5, height * 0.2, width * 0.25, height * 0.6, 'acid');
  }

  private buildTitrationExperiment(width: number, height: number): void {
    // Main beaker
    this.createLabContainer(width * 0.3, height * 0.4, width * 0.4, height * 0.4, 'beaker');
    this.createLabParticles(25, width * 0.3, height * 0.4, width * 0.4, height * 0.4, 'acid');

    // Burette simulation (particles fall from top)
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.physics.addParticle({
          x: width * 0.5 + (Math.random() - 0.5) * 10,
          y: height * 0.1,
          vx: 0,
          vy: 1,
          radius: 2,
          mass: 1,
          color: '#4ECDC4', // Base color
          boundaryWidth: width,
          boundaryHeight: height,
          data: { liquidType: 'base' }
        });
      }, i * 1000);
    }
  }

  private buildBasicLabSetup(width: number, height: number): void {
    // Simple setup with container and particles
    this.createLabContainer(width * 0.3, height * 0.3, width * 0.4, height * 0.5);
    this.createLabParticles(15, width * 0.3, width * 0.3, width * 0.4, height * 0.5);
  }

  // ===== HELPER MOLECULE CREATORS =====
  private createH2Molecule(
    baseId: string,
    x: number,
    y: number,
    boundaryWidth: number,
    boundaryHeight: number
  ): { h1Id: string; h2Id: string } {
    const h1Id = this.physics.addParticle({
      id: `${baseId}_H1`,
      x: x - 10,
      y,
      radius: 8,
      mass: 1,
      color: ColorSystem.getElementColor('H'),
      boundaryWidth,
      boundaryHeight,
      data: { elementType: 'H' }
    });

    const h2Id = this.physics.addParticle({
      id: `${baseId}_H2`,
      x: x + 10,
      y,
      radius: 8,
      mass: 1,
      color: ColorSystem.getElementColor('H'),
      boundaryWidth,
      boundaryHeight,
      data: { elementType: 'H' }
    });

    this.physics.addBond({
      p1Id: h1Id,
      p2Id: h2Id,
      type: 'single',
      restLength: 20,
      stiffness: 0.8
    });

    return { h1Id, h2Id };
  }

  private createCl2Molecule(
    baseId: string,
    x: number,
    y: number,
    boundaryWidth: number,
    boundaryHeight: number
  ): { cl1Id: string; cl2Id: string } {
    const cl1Id = this.physics.addParticle({
      id: `${baseId}_Cl1`,
      x: x - 15,
      y,
      radius: 12,
      mass: 35.5,
      color: ColorSystem.getElementColor('Cl'),
      boundaryWidth,
      boundaryHeight,
      data: { elementType: 'Cl' }
    });

    const cl2Id = this.physics.addParticle({
      id: `${baseId}_Cl2`,
      x: x + 15,
      y,
      radius: 12,
      mass: 35.5,
      color: ColorSystem.getElementColor('Cl'),
      boundaryWidth,
      boundaryHeight,
      data: { elementType: 'Cl' }
    });

    this.physics.addBond({
      p1Id: cl1Id,
      p2Id: cl2Id,
      type: 'single',
      restLength: 30,
      stiffness: 0.8
    });

    return { cl1Id, cl2Id };
  }

  // ===== UTILITY METHODS =====
  public createCustomMolecule(
    atoms: Array<{ element: string; x: number; y: number; radius?: number }>,
    bonds: Array<{ atom1Index: number; atom2Index: number; type?: Bond['type'] }>,
    baseId: string = 'custom',
    boundaryWidth: number,
    boundaryHeight: number
  ): string[] {
    const atomIds: string[] = [];

    // Create atoms
    atoms.forEach((atom, index) => {
      const atomId = this.physics.addParticle({
        id: `${baseId}_${atom.element}_${index}`,
        x: atom.x,
        y: atom.y,
        radius: atom.radius || 10,
        mass: atom.radius || 10,
        color: ColorSystem.getElementColor(atom.element),
        boundaryWidth,
        boundaryHeight,
        data: { elementType: atom.element }
      });
      atomIds.push(atomId);
    });

    // Create bonds
    bonds.forEach(bond => {
      if (bond.atom1Index < atomIds.length && bond.atom2Index < atomIds.length) {
        this.physics.addBond({
          p1Id: atomIds[bond.atom1Index],
          p2Id: atomIds[bond.atom2Index],
          type: bond.type || 'single',
          stiffness: 0.7
        });
      }
    });

    return atomIds;
  }

  public getSceneStats(): {
    particleCount: number;
    bondCount: number;
    heatSourceCount: number;
    boundaryCount: number;
  } {
    return {
      particleCount: this.physics.getParticles().length,
      bondCount: this.physics.getBonds().length,
      heatSourceCount: this.physics.getHeatSources().length,
      boundaryCount: this.physics.getBoundaries().length,
    };
  }
}
