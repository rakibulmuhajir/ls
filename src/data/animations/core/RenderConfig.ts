// src/data/animations/core/RenderConfig.ts

export const RenderConfig = {
  Bond: {
    DefaultColor: '#4a5568', // Default color for single bonds
    StrokeWidthMultiplier: 1.5, // Multiplied by bond.stability
    MinVisibleStability: 0.1,
  },
  Particle: {
    DefaultRadius: 10,
    DefaultColor: '#94a3b8', // Slate 400/500
  },
  Trail: {
    OpacityHex: '80', // Appended to color string for 50% opacity
    LengthMultiplier: 3, // Multiplied by velocity vector for trail length
    StrokeWidth: 1,
    MinSpeedThreshold: 0.5, // Only show trails for particles faster than this
  },
  TemperatureColors: { // Aligned with your theme's interactive colors
    Cool: '#4299e1',    // theme.colors.interactive.cold
    Medium: '#48bb78',  // theme.colors.interactive.medium
    Warm: '#f6ad55',    // A warm orange
    Hot: '#f56565',     // theme.colors.interactive.hot
  }
};
