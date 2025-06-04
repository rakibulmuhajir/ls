// src/data/animations/core/ChemicalElements.ts
export class ChemicalElement {
  static readonly ELEMENTS = {
    H: {
      name: 'Hydrogen',
      symbol: 'H',
      atomicNumber: 1,
      color: '#FFFFFF',
      size: 40,
      mass: 1.008,
      valence: 1,
      properties: [
        'Lightest element',
        'Highly flammable',
        'Colorless gas',
        'Forms H₂ molecules',
        'Explosive with oxygen'
      ]
    },
    O: {
      name: 'Oxygen',
      symbol: 'O',
      atomicNumber: 8,
      color: '#FF6B6B',
      size: 60,
      mass: 15.999,
      valence: 2,
      properties: [
        'Supports combustion',
        'Colorless gas',
        'Forms O₂ molecules',
        '21% of air',
        'Essential for life'
      ]
    },
    C: {
      name: 'Carbon',
      symbol: 'C',
      atomicNumber: 6,
      color: '#333333',
      size: 55,
      mass: 12.011,
      valence: 4,
      properties: [
        'Forms 4 bonds',
        'Basis of organic chemistry',
        'Multiple allotropes',
        'Black solid (graphite)',
        'Forms chains and rings'
      ]
    },
    N: {
      name: 'Nitrogen',
      symbol: 'N',
      atomicNumber: 7,
      color: '#0066CC',
      size: 52,
      mass: 14.007,
      valence: 3,
      properties: [
        'Inert gas',
        '78% of air',
        'Forms N₂ molecules',
        'Triple bond in N₂',
        'Essential for proteins'
      ]
    },
    Na: {
      name: 'Sodium',
      symbol: 'Na',
      atomicNumber: 11,
      color: '#FFD700',
      size: 65,
      mass: 22.990,
      valence: 1,
      properties: [
        'Soft metal',
        'Highly reactive',
        'Stored in oil',
        'Forms Na+ ions',
        'Explodes in water'
      ]
    },
    Cl: {
      name: 'Chlorine',
      symbol: 'Cl',
      atomicNumber: 17,
      color: '#00FF00',
      size: 62,
      mass: 35.453,
      valence: 1,
      properties: [
        'Toxic gas',
        'Green-yellow color',
        'Forms Cl₂ molecules',
        'Strong oxidizer',
        'Used in bleach'
      ]
    }
  };

  static get(symbol: string) {
    return this.ELEMENTS[symbol];
  }
}
