/**
 * Comprehensive materials library for chemistry lab simulator
 * Contains elements, compounds, and mixtures with physical/chemical properties
 * Includes reaction definitions with balanced equations
 */

// ==================== INTERFACES ====================
export interface MaterialProperties {
  // Identification & Basic Information
  id: string;
  name: string;
  chemicalFormula: string;
  type: 'element' | 'ionicCompound' | 'covalentCompound' | 'mixture';
  category: string;
  appearance: {
    description: string;
    texture?: string;
    colorHex: string;
  };

  // Physical Properties
  stateAtSTP: 'solid' | 'liquid' | 'gas';
  molarMass: number;
  density?: number; // g/cm³
  meltingPoint?: number; // K
  boilingPoint?: number; // K
  solubilityInWater: 'soluble' | 'slightly_soluble' | 'insoluble';
  electricalConductivity?: {
    solid?: boolean;
    liquid?: boolean;
    aqueous?: boolean;
  };

  // Chemical Properties & Reactivity
  reactivity: {
    water: 'none' | 'slow' | 'vigorous';
    acid: 'none' | 'slow' | 'vigorous';
    oxygen: 'none' | 'slow' | 'vigorous';
  };
  reactionWithWater?: 'none' | 'slow' | 'vigorous';
  acidBaseProperties?: {
    strength?: 'strong' | 'weak';
    pH?: number;
  };

  // Safety Information
  hazardSymbols: string[];
  safetyPrecautions: string[];
}

export interface ReactionDefinition {
  id: string;
  equation: string;
  type: 'neutralization' | 'combustion' | 'precipitation' | 'redox' | 'displacement' | 'decomposition';
  conditions?: string;
  observations: string[];
  safetyNotes?: string;
}

// ==================== MATERIAL DATABASE ====================
export const materialLibrary: Record<string, MaterialProperties> = {
  // ===== ELEMENTS =====
  H: {
    id: "H",
    name: "Hydrogen",
    chemicalFormula: "H₂",
    type: "element",
    category: "Reactive Non-Metal",
    appearance: {
      description: "Colorless gas",
      colorHex: "#FFFFFF"
    },
    stateAtSTP: "gas",
    molarMass: 1.008,
    density: 0.00008988,
    meltingPoint: 14.01,
    boilingPoint: 20.28,
    solubilityInWater: "slightly_soluble",
    reactivity: {
      water: "slow",
      acid: "vigorous",
      oxygen: "vigorous"
    },
    hazardSymbols: ["flammable"],
    safetyPrecautions: ["Keep away from open flames", "Use in well-ventilated area"]
  },

  O: {
    id: "O",
    name: "Oxygen",
    chemicalFormula: "O₂",
    type: "element",
    category: "Reactive Non-Metal",
    appearance: {
      description: "Colorless gas",
      colorHex: "#ADD8E6"
    },
    stateAtSTP: "gas",
    molarMass: 16.00,
    density: 0.001429,
    meltingPoint: 54.36,
    boilingPoint: 90.20,
    solubilityInWater: "slightly_soluble",
    reactivity: {
      water: "none",
      acid: "none",
      oxygen: "none" // Doesn't react with itself
    },
    hazardSymbols: ["oxidizer"],
    safetyPrecautions: ["Avoid contact with flammable materials"]
  },

  Na: {
    id: "Na",
    name: "Sodium",
    chemicalFormula: "Na",
    type: "element",
    category: "Alkali Metal",
    appearance: {
      description: "Silvery-white metal",
      texture: "soft, waxy",
      colorHex: "#D3D3D3"
    },
    stateAtSTP: "solid",
    molarMass: 22.99,
    density: 0.968,
    meltingPoint: 370.87,
    boilingPoint: 1156,
    solubilityInWater: "insoluble", // Reacts rather than dissolves
    reactionWithWater: "vigorous",
    reactivity: {
      water: "vigorous",
      acid: "vigorous",
      oxygen: "vigorous"
    },
    hazardSymbols: ["flammable", "corrosive"],
    safetyPrecautions: ["Handle under oil", "Avoid contact with water"]
  },

  // ===== IONIC COMPOUNDS =====
  NaCl: {
    id: "NaCl",
    name: "Sodium Chloride",
    chemicalFormula: "NaCl",
    type: "ionicCompound",
    category: "Salt",
    appearance: {
      description: "White crystalline solid",
      texture: "granular",
      colorHex: "#FFFFFF"
    },
    stateAtSTP: "solid",
    molarMass: 58.44,
    density: 2.16,
    meltingPoint: 1074,
    boilingPoint: 1686,
    solubilityInWater: "soluble",
    electricalConductivity: {
      solid: false,
      aqueous: true
    },
    reactivity: {
      water: "none",
      acid: "none",
      oxygen: "none"
    },
    hazardSymbols: [],
    safetyPrecautions: ["Handle as normal laboratory chemical"]
  },

  // ===== COVALENT COMPOUNDS =====
  H2O: {
    id: "H2O",
    name: "Water",
    chemicalFormula: "H₂O",
    type: "covalentCompound",
    category: "Solvent",
    appearance: {
      description: "Colorless liquid",
      colorHex: "#4A90E2"
    },
    stateAtSTP: "liquid",
    molarMass: 18.02,
    density: 1.00,
    meltingPoint: 273.15,
    boilingPoint: 373.15,
    solubilityInWater: "soluble", // Miscible
    reactivity: {
      water: "none",
      acid: "none",
      oxygen: "none"
    },
    hazardSymbols: [],
    safetyPrecautions: ["Standard laboratory handling"]
  }
  // ... Additional materials would continue here
};

// ==================== REACTION DATABASE ====================
export const reactions: ReactionDefinition[] = [
  {
    id: "zn_h2so4",
    equation: "Zn + H₂SO₄ → ZnSO₄ + H₂",
    type: "displacement",
    conditions: "aqueous, room temperature",
    observations: ["Gas evolution (H₂)", "Zinc dissolves"],
    safetyNotes: "Hydrogen gas is flammable"
  },
  {
    id: "na_cl2",
    equation: "2Na + Cl₂ → 2NaCl",
    type: "redox",
    conditions: "heat",
    observations: ["Vigorous reaction", "White solid forms"],
    safetyNotes: "Highly exothermic - use small quantities"
  },
  {
    id: "h2_o2",
    equation: "2H₂ + O₂ → 2H₂O",
    type: "combustion",
    conditions: "spark or flame",
    observations: ["Explosive reaction", "Water vapor forms"],
    safetyNotes: "Extremely dangerous - demo only with proper precautions"
  }
  // ... Additional reactions would continue here
];

// Helper function to get material by ID
export function getMaterial(id: string): MaterialProperties | undefined {
  return materialLibrary[id];
}

// Helper function to find reactions involving a material
export function getReactionsForMaterial(materialId: string): ReactionDefinition[] {
  return reactions.filter(reaction =>
    reaction.equation.includes(materialId) ||
    reaction.equation.includes(materialLibrary[materialId]?.name)
  );
}
