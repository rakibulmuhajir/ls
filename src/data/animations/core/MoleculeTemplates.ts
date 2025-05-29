// src/data/animations/core/MoleculeTemplates.ts
export interface MoleculeStructure {
  atoms: Array<{
    element: string;
    position: { x: number; y: number; z?: number };
    id?: string;
  }>;
  bonds: Array<{
    from: number;
    to: number;
    type: 'single' | 'double' | 'triple' | 'ionic';
    angle?: number;
  }>;
  properties?: string[];
  state?: 'solid' | 'liquid' | 'gas' | 'aqueous';
}

export class MoleculeTemplates {
  static readonly MOLECULES: Record<string, MoleculeStructure> = {
    'H2': {
      atoms: [
        { element: 'H', position: { x: -20, y: 0 } },
        { element: 'H', position: { x: 20, y: 0 } }
      ],
      bonds: [{ from: 0, to: 1, type: 'single' }],
      state: 'gas'
    },
    'O2': {
      atoms: [
        { element: 'O', position: { x: -30, y: 0 } },
        { element: 'O', position: { x: 30, y: 0 } }
      ],
      bonds: [{ from: 0, to: 1, type: 'double' }],
      state: 'gas'
    },
    'H2O': {
      atoms: [
        { element: 'O', position: { x: 0, y: 0 } },
        { element: 'H', position: { x: -30, y: 25 }, id: 'H1' },
        { element: 'H', position: { x: 30, y: 25 }, id: 'H2' }
      ],
      bonds: [
        { from: 0, to: 1, type: 'single', angle: 104.5 },
        { from: 0, to: 2, type: 'single', angle: 104.5 }
      ],
      properties: [
        'Universal solvent',
        'Bent shape (104.5°)',
        'Polar molecule',
        'High surface tension',
        'Expands when frozen'
      ],
      state: 'liquid'
    },
    'NaCl': {
      atoms: [
        { element: 'Na', position: { x: -40, y: 0 } },
        { element: 'Cl', position: { x: 40, y: 0 } }
      ],
      bonds: [{ from: 0, to: 1, type: 'ionic' }],
      properties: [
        'Table salt',
        'Ionic compound',
        'Crystal lattice',
        'Soluble in water',
        'High melting point'
      ],
      state: 'solid'
    },
    'CO2': {
      atoms: [
        { element: 'C', position: { x: 0, y: 0 } },
        { element: 'O', position: { x: -50, y: 0 } },
        { element: 'O', position: { x: 50, y: 0 } }
      ],
      bonds: [
        { from: 0, to: 1, type: 'double' },
        { from: 0, to: 2, type: 'double' }
      ],
      properties: [
        'Linear molecule',
        'Greenhouse gas',
        'Dry ice when solid',
        'Acidic in water',
        'Fire extinguisher'
      ],
      state: 'gas'
    }
  };

  static get(formula: string): MoleculeStructure {
    return this.MOLECULES[formula];
  }
}
