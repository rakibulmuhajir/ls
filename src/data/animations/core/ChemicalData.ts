export interface ChemicalProperties {
  name: string;
  boilingPoint: number; // in Celsius
  color: string; // The standard color of the liquid
  heatedColor?: string; // Optional color when hot but not boiling
  density: number; // Relative density for physics
}

export const chemicalData: Record<string, ChemicalProperties> = {
  H2O: {
    name: 'Water',
    boilingPoint: 100,
    color: 'rgba(173, 216, 230, 0.7)', // light blue
    density: 0.4,
  },
  C2H5OH: {
    name: 'Ethanol',
    boilingPoint: 78,
    color: 'rgba(200, 230, 200, 0.7)', // light green
    density: 0.3,
  },
  CuSO4: {
      name: 'Copper (II) Sulfate',
      boilingPoint: 150, // Decomposes, but for simulation we'll use this
      color: 'rgba(0, 100, 255, 0.6)', // Bright blue
      heatedColor: 'rgba(0, 80, 200, 0.6)',
      density: 0.8,
  }
};
