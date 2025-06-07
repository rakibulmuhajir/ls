import type { AnimationConfig, Particle, Bond } from '../core/types';

export const ChemistryPresets = {
  // Common molecules
  water: (): AnimationConfig => ({
    type: 'molecule',
    width: 300,
    height: 300,
    particleCount: 3,
    moleculeType: 'H2O',
    initialTemperature: 25,
    performanceMode: 'medium'
  }),

  methane: (): AnimationConfig => ({
    type: 'molecule',
    width: 300,
    height: 300,
    particleCount: 5,
    moleculeType: 'CH4',
    initialTemperature: 25,
    performanceMode: 'medium'
  }),

  // Molecular structures
  createDiatomic: (element1: string, element2: string): AnimationConfig => ({
    type: 'molecule',
    width: 200,
    height: 200,
    particleCount: 2,
    moleculeType: `${element1}${element2}`,
    initialTemperature: 25,
    performanceMode: 'low'
  }),

  // States of matter
  solidState: (molecule: string): AnimationConfig => ({
    type: 'states',
    width: 400,
    height: 400,
    particleCount: 50,
    moleculeType: molecule,
    stateType: 'solid',
    initialTemperature: 10,
    performanceMode: 'high'
  }),

  liquidState: (molecule: string): AnimationConfig => ({
    type: 'states',
    width: 400,
    height: 400,
    particleCount: 50,
    moleculeType: molecule,
    stateType: 'liquid',
    initialTemperature: 25,
    performanceMode: 'high'
  }),

  gasState: (molecule: string): AnimationConfig => ({
    type: 'states',
    width: 400,
    height: 400,
    particleCount: 50,
    moleculeType: molecule,
    stateType: 'gas',
    initialTemperature: 100,
    performanceMode: 'high'
  }),

  // Helper functions for molecular setups
  getDefaultParticlesForMolecule(molecule: string): Omit<Particle, 'id'>[] {
    const commonProps = {
      vx: 0,
      vy: 0,
      maxSpeed: 5,
      vibrationIntensity: 0.1,
      boundaryWidth: 300,
      boundaryHeight: 300,
      isFixed: false,
      temperature: 25,
      data: {}
    };

    switch (molecule) {
      case 'H2O':
        return [
          {
            ...commonProps,
            x: 150, y: 150, radius: 10, mass: 16,
            color: '#3050F8', elementType: 'O'
          },
          {
            ...commonProps,
            x: 120, y: 180, radius: 6, mass: 1,
            color: '#FFFFFF', elementType: 'H'
          },
          {
            ...commonProps,
            x: 180, y: 180, radius: 6, mass: 1,
            color: '#FFFFFF', elementType: 'H'
          }
        ];
      case 'CH4':
        return [
          {
            ...commonProps,
            x: 150, y: 150, radius: 12, mass: 12,
            color: '#909090', elementType: 'C'
          },
          {
            ...commonProps,
            x: 120, y: 120, radius: 6, mass: 1,
            color: '#FFFFFF', elementType: 'H'
          },
          {
            ...commonProps,
            x: 180, y: 120, radius: 6, mass: 1,
            color: '#FFFFFF', elementType: 'H'
          },
          {
            ...commonProps,
            x: 120, y: 180, radius: 6, mass: 1,
            color: '#FFFFFF', elementType: 'H'
          },
          {
            ...commonProps,
            x: 180, y: 180, radius: 6, mass: 1,
            color: '#FFFFFF', elementType: 'H'
          }
        ];
      default:
        return [];
    }
  },

  getDefaultBondsForMolecule(molecule: string, particles: Particle[]): Bond[] {
    if (!particles || particles.length === 0) return [];

    switch (molecule) {
      case 'H2O':
        return [
          {
            id: `${molecule}-bond-0`,
            particle1: particles[0],
            particle2: particles[1],
            restLength: 30,
            stability: 1,
            type: 'single'
          },
          {
            id: `${molecule}-bond-1`,
            particle1: particles[0],
            particle2: particles[2],
            restLength: 30,
            stability: 1,
            type: 'single'
          }
        ];
      case 'CH4':
        return [
          {
            id: `${molecule}-bond-0`,
            particle1: particles[0],
            particle2: particles[1],
            restLength: 25,
            stability: 1,
            type: 'single'
          },
          {
            id: `${molecule}-bond-1`,
            particle1: particles[0],
            particle2: particles[2],
            restLength: 25,
            stability: 1,
            type: 'single'
          },
          {
            id: `${molecule}-bond-2`,
            particle1: particles[0],
            particle2: particles[3],
            restLength: 25,
            stability: 1,
            type: 'single'
          },
          {
            id: `${molecule}-bond-3`,
            particle1: particles[0],
            particle2: particles[4],
            restLength: 25,
            stability: 1,
            type: 'single'
          }
        ];
      default:
        return [];
    }
  }
};
