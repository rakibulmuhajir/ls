// src/data/animations/core/ParticleFactory.ts
import { getMaterial, type MaterialProperties } from '../lab/assets/materials';
import type { Particle } from './types';
import { UniqueID } from '../utils/UniqueID';

export interface ParticleFactoryConfig {
  containerWidth: number;
  containerHeight: number;
  temperature: number; // The current environment temperature in Celsius
  state: 'solid' | 'liquid' | 'gas'; // The determined state for which to create particles
}

interface StateConfiguration {
  maxSpeed: number;
  vibrationIntensity: number;
  spacing: number;
}

/**
 * A utility class for creating particles with realistic properties and positioning
 * based on their state of matter. This class focuses purely on particle creation
 * and positioning - state determination should be handled by MaterialStateManager.
 */
export class ParticleFactory {
  /**
   * Creates an array of particles for a given material and state.
   * This is the primary method for generating new particle systems.
   *
   * @param materialId - The ID of the material from the materials library
   * @param count - Number of particles to create
   * @param config - Configuration including container dimensions, temperature, and target state
   * @returns Array of particles with realistic positioning and properties for the given state
   */
  static createParticles(
    materialId: string,
    count: number,
    config: ParticleFactoryConfig
  ): Particle[] {
    const material = getMaterial(materialId);
    if (!material) {
      console.warn(`Material "${materialId}" not found in library. Using default particles.`);
      return this.createDefaultParticles(count, config);
    }

    const particles: Particle[] = [];

    // Pre-calculate configurations to avoid recalculating for each particle
    const stateConfig = this.getStateConfiguration(config.state, config.temperature);
    const gridCols = Math.max(1, Math.round(Math.sqrt(count * (config.containerWidth / config.containerHeight))));

    for (let i = 0; i < count; i++) {
      // Pass pre-calculated configs to avoid redundant calculations
      const particle = this.createSingleParticle(
        material,
        config,
        stateConfig,
        i,
        count,
        gridCols
      );
      particles.push(particle);
    }
    return particles;
  }

  /**
   * Updates existing particles when transitioning between states (e.g., heating ice to water).
   * This method preserves particle identity while adjusting their properties for the new state.
   * Used for smooth educational transitions when students change temperature.
   *
   * @param existingParticles - Current particles in the simulation
   * @param newState - Target state after temperature change
   * @param temperature - New temperature in Celsius
   * @param containerWidth - Container width for repositioning if needed
   * @param containerHeight - Container height for repositioning if needed
   * @returns Updated particles with new state properties
   */
  static updateParticlesForNewState(
    existingParticles: Particle[],
    newState: 'solid' | 'liquid' | 'gas',
    temperature: number,
    containerWidth: number,
    containerHeight: number
  ): Particle[] {
    const stateConfig = this.getStateConfiguration(newState, temperature);

    return existingParticles.map((particle, index) => {
      // Calculate new velocity based on state and temperature
      let velocity = this.getVelocityForState(newState, temperature);

      // For dramatic state changes (solid to gas), we might want to reposition
      let newPosition = { x: particle.x, y: particle.y };

      // ENHANCED: Special effects for liquid to gas transition (boiling)
      if (particle.material?.state === 'liquid' && newState === 'gas') {
        // Give particles an initial "burst" of energy upon boiling
        velocity.vx += (Math.random() - 0.5) * 10; // Random horizontal burst
        velocity.vy -= Math.random() * 15; // Strong upward push for boiling effect

        // Add slight outward expansion from center
        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;
        const directionX = particle.x - centerX;
        const directionY = particle.y - centerY;
        const distance = Math.sqrt(directionX * directionX + directionY * directionY);

        if (distance > 0) {
          velocity.vx += (directionX / distance) * 8; // Expansion effect
          velocity.vy += (directionY / distance) * 8;
        }
      }

      // If transitioning to solid, gently move particles toward grid positions
      if (newState === 'solid') {
        const cols = Math.max(1, Math.round(Math.sqrt(existingParticles.length * (containerWidth / containerHeight))));
        const targetPosition = this.getPositionForState(
          { containerWidth, containerHeight, temperature, state: newState },
          index,
          existingParticles.length,
          cols,
          stateConfig.spacing
        );

        // Gradually move toward target position (not instant snap)
        newPosition.x = particle.x + (targetPosition.x - particle.x) * 0.1;
        newPosition.y = particle.y + (targetPosition.y - particle.y) * 0.1;
      }

      // If transitioning from solid to liquid/gas, add some randomness to break crystal structure
      if (particle.material?.state === 'solid' && newState !== 'solid') {
        newPosition.x += (Math.random() - 0.5) * 20;
        newPosition.y += (Math.random() - 0.5) * 20;

        // Keep within container bounds
        newPosition.x = Math.max(10, Math.min(containerWidth - 10, newPosition.x));
        newPosition.y = Math.max(10, Math.min(containerHeight - 10, newPosition.y));
      }

      return {
        ...particle,
        x: newPosition.x,
        y: newPosition.y,
        vx: velocity.vx,
        vy: velocity.vy,
        maxSpeed: stateConfig.maxSpeed,
        vibrationIntensity: stateConfig.vibrationIntensity,
        temperature: temperature,
        material: particle.material ? {
          ...particle.material,
          state: newState
        } : undefined
      };
    });
  }

  /**
   * Creates a single particle with state-appropriate properties.
   * Optimized to use pre-calculated configurations for better performance.
   *
   * @param material - Material properties from the materials library
   * @param config - Factory configuration
   * @param stateConfig - Pre-calculated state-specific configuration
   * @param index - Particle index for positioning calculations
   * @param totalCount - Total number of particles for layout calculations
   * @param gridCols - Pre-calculated number of columns for solid state grid layout
   * @returns Single particle with all properties set
   */
  private static createSingleParticle(
    material: MaterialProperties,
    config: ParticleFactoryConfig,
    stateConfig: StateConfiguration,
    index: number,
    totalCount: number,
    gridCols: number
  ): Particle {
    const position = this.getPositionForState(config, index, totalCount, gridCols, stateConfig.spacing);
    const velocity = this.getVelocityForState(config.state, config.temperature);

    return {
      id: UniqueID.generate(`${material.id}_`),
      x: position.x,
      y: position.y,
      vx: velocity.vx,
      vy: velocity.vy,
      radius: this.getRadiusForMaterial(material),
      mass: this.getMassForMaterial(material),
      color: material.appearance.colorHex,
      maxSpeed: stateConfig.maxSpeed,
      vibrationIntensity: stateConfig.vibrationIntensity,
      temperature: config.temperature,
      elementType: material.id, // Use the material's ID
      charge: 0, // Default charge, can be enhanced later with material-specific charges
      // Material property for holding simulation-specific data
      material: {
        state: config.state,
        density: material.density || 1.0,
        thermalConductivity: 0.5, // Default value, can be added to materials.ts later
        specificHeat: 1.0, // Simplified for 9th grade
      }
    };
  }

  /**
   * Calculates realistic 2D positioning based on molecular state.
   * Implements educational physics concepts for 9th grade understanding:
   * - Solids: Organized crystalline structure with slight vibration
   * - Liquids: Clustered toward bottom with dynamic liquid level based on particle count
   * - Gases: Distributed throughout entire container space
   *
   * @param config - Factory configuration with container dimensions
   * @param index - Particle index for grid calculations
   * @param totalCount - Total particles for layout calculations (affects liquid level)
   * @param cols - Number of columns for solid grid layout
   * @param spacing - Distance between particles for current state
   * @returns x,y coordinates for particle placement
   */
  private static getPositionForState(
    config: ParticleFactoryConfig,
    index: number,
    totalCount: number,
    cols: number,
    spacing: number
  ): { x: number, y: number } {
    const { containerWidth: width, containerHeight: height, state } = config;
    const margin = spacing * 1.5; // Keep particles away from container edges

    switch (state) {
      case 'solid': {
        // Create centered crystalline grid structure with slight natural variation
        const rows = Math.ceil(totalCount / cols);
        const gridWidth = (cols - 1) * spacing;
        const gridHeight = (rows - 1) * spacing;
        const startX = (width - gridWidth) / 2;
        const startY = (height - gridHeight) / 2;

        return {
          x: startX + (index % cols) * spacing + (Math.random() - 0.5) * 3, // Small jitter for realism
          y: startY + Math.floor(index / cols) * spacing + (Math.random() - 0.5) * 3,
        };
      }
      case 'liquid': {
        // ENHANCED: Dynamic liquid level based on particle count
        // More particles = higher liquid level (more realistic)
        const baseHeight = 0.3; // Minimum liquid height (30% of container)
        const maxHeight = 0.8;  // Maximum liquid height (80% of container)
        const particleDensityFactor = Math.min(totalCount / 50, 1); // Normalize to 50 particles max
        const liquidHeight = baseHeight + (maxHeight - baseHeight) * particleDensityFactor;
        const liquidSurfaceHeight = height * (1 - liquidHeight);

        return {
          x: margin + Math.random() * (width - 2 * margin),
          y: liquidSurfaceHeight + Math.random() * (height - liquidSurfaceHeight - margin),
        };
      }
      case 'gas': {
        // Particles distribute evenly throughout entire container volume
        return {
          x: margin + Math.random() * (width - 2 * margin),
          y: margin + Math.random() * (height - 2 * margin),
        };
      }
    }
  }

  /**
   * Calculates initial velocity based on temperature and state.
   * Models kinetic molecular theory for educational purposes:
   * - Higher temperature = faster particle movement
   * - Solids: Mainly vibration in place
   * - Liquids: Moderate movement with realistic directional bias
   * - Gases: High-speed movement in all directions
   *
   * @param state - Current state of matter
   * @param temperature - Temperature in Celsius
   * @returns Initial velocity components (vx, vy)
   */
  private static getVelocityForState(state: 'solid' | 'liquid' | 'gas', temperature: number): { vx: number, vy: number } {
    const tempFactor = Math.max(0.1, temperature / 100); // Normalize temperature effect

    switch (state) {
      case 'solid':
        // Very limited movement - particles vibrate around fixed positions
        return {
          vx: (Math.random() - 0.5) * 0.3 * tempFactor,
          vy: (Math.random() - 0.5) * 0.3 * tempFactor
        };
      case 'liquid':
        // Moderate movement with realistic directional preference
        // Liquids tend to have more horizontal flow than vertical agitation
        return {
          vx: (Math.random() - 0.5) * 2 * tempFactor,     // Full horizontal movement
          vy: (Math.random() - 0.5) * 1.5 * tempFactor    // Slightly less vertical movement (realistic!)
        };
      case 'gas':
        // High movement in all directions - particles fill entire container
        return {
          vx: (Math.random() - 0.5) * 5 * tempFactor,
          vy: (Math.random() - 0.5) * 5 * tempFactor
        };
    }
  }

  /**
   * Utility function to determine a material's state at a given temperature.
   * NOTE: This method is provided for convenience, but the primary responsibility
   * for state determination should belong to the MaterialStateManager class.
   * This ensures proper separation of concerns in the architecture.
   *
   * @param materialId - Material identifier from materials library
   * @param temperatureCelsius - Current temperature in Celsius
   * @returns Predicted state of matter at given temperature
   */
  static determineState(materialId: string, temperatureCelsius: number): 'solid' | 'liquid' | 'gas' {
    const material = getMaterial(materialId);
    if (!material) return 'liquid'; // Default state for unknown materials

    const tempKelvin = temperatureCelsius + 273.15; // Convert to Kelvin for comparison

    // Use material's phase transition temperatures
    if (material.meltingPoint && tempKelvin < material.meltingPoint) return 'solid';
    if (material.boilingPoint && tempKelvin >= material.boilingPoint) return 'gas';
    return 'liquid'; // Default to liquid state between melting and boiling points
  }

  /**
   * Gets configuration parameters for each state of matter.
   * These values are tuned for educational visualization and realistic behavior.
   *
   * @param state - Target state of matter
   * @param temperature - Current temperature for dynamic adjustments
   * @returns Configuration object with speed, vibration, and spacing parameters
   */
  private static getStateConfiguration(state: 'solid' | 'liquid' | 'gas', temperature: number): StateConfiguration {
    const tempFactor = Math.max(0.1, temperature / 100); // Temperature scaling factor

    switch (state) {
      case 'solid':
        return {
          maxSpeed: 1 * tempFactor,           // Limited speed for vibration
          vibrationIntensity: 0.3 * tempFactor, // Low vibration intensity
          spacing: 15                         // Tight spacing for crystal structure
        };
      case 'liquid':
        return {
          maxSpeed: 3 * tempFactor,           // Moderate speed for flowing
          vibrationIntensity: 0.6 * tempFactor, // Medium vibration
          spacing: 20                         // Moderate spacing for liquid flow
        };
      case 'gas':
        return {
          maxSpeed: 8 * tempFactor,           // High speed for rapid movement
          vibrationIntensity: 1.0 * tempFactor, // High vibration intensity
          spacing: 30                         // Wide spacing for gas expansion
        };
    }
  }

  /**
   * Calculates appropriate visual radius for a material based on its properties.
   * Simplified model suitable for 9th grade chemistry visualization.
   *
   * @param material - Material properties from materials library
   * @returns Radius in pixels for particle visualization
   */
  private static getRadiusForMaterial(material: MaterialProperties): number {
    const baseRadius = 4; // Base radius for visualization

    // Slightly adjust size based on material type for educational clarity
    switch (material.type) {
      case 'element':
        return baseRadius;
      case 'ionicCompound':
      case 'covalentCompound':
        return baseRadius * 1.2; // Slightly larger for compounds
      case 'mixture':
        return baseRadius * 0.9; // Slightly smaller for mixture particles
      default:
        return baseRadius;
    }
  }

  /**
   * Calculates appropriate mass for a material based on its molar mass.
   * Scaled appropriately for physics simulation stability.
   *
   * @param material - Material properties from materials library
   * @returns Mass value for physics calculations
   */
  private static getMassForMaterial(material: MaterialProperties): number {
    // Use molar mass as basis but scale down for simulation stability
    return Math.max(0.5, material.molarMass / 20);
  }

  /**
   * Creates basic default particles when material data is unavailable.
   * Fallback method to ensure simulation continues even with missing data.
   *
   * @param count - Number of particles to create
   * @param config - Factory configuration
   * @returns Array of default particles with basic properties
   */
  private static createDefaultParticles(count: number, config: ParticleFactoryConfig): Particle[] {
    console.warn('Creating default particles due to missing material data');
    const particles: Particle[] = [];
    const stateConfig = this.getStateConfiguration(config.state, config.temperature);

    for (let i = 0; i < count; i++) {
      const velocity = this.getVelocityForState(config.state, config.temperature);

      particles.push({
        id: UniqueID.generate('default_'),
        x: Math.random() * config.containerWidth,
        y: Math.random() * config.containerHeight,
        vx: velocity.vx,
        vy: velocity.vy,
        radius: 4,
        mass: 1,
        color: '#4FC3F7', // Default blue color
        maxSpeed: stateConfig.maxSpeed,
        vibrationIntensity: stateConfig.vibrationIntensity,
        temperature: config.temperature,
        elementType: 'unknown',
        charge: 0,
        material: {
          state: config.state,
          density: 1.0,
          thermalConductivity: 0.5,
          specificHeat: 1.0,
        }
      });
    }

    return particles;
  }
}
