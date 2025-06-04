// src/data/animations/AnimationSystem.ts - INITIALIZATION FILE
import { AnimationRegistry } from './core/AnimationRegistry';
import { ChemistryPlugin } from './plugins/ChemistryPlugin';

export class AnimationSystem {
  private static instance: AnimationSystem;
  private registry: AnimationRegistry;
  private initialized = false;

  constructor() {
    this.registry = AnimationRegistry.getInstance();
  }

  static getInstance(): AnimationSystem {
    if (!AnimationSystem.instance) {
      AnimationSystem.instance = new AnimationSystem();
    }
    return AnimationSystem.instance;
  }

  /**
   * Initialize the animation system with all plugins
   */
  initialize(): void {
    if (this.initialized) {
      console.log('Animation system already initialized');
      return;
    }

    console.log('🎬 Initializing Animation System...');

    try {
      // Register all plugins
      const chemistryPlugin = new ChemistryPlugin();
      this.registry.registerPlugin(chemistryPlugin);

      // Add more plugins here as you create them:
      // const physicsPlugin = new PhysicsPlugin();
      // this.registry.registerPlugin(physicsPlugin);

      this.initialized = true;

      // Log available animations
      const available = this.registry.getAvailableAnimations();
      console.log(`✅ Animation system initialized with ${available.length} animations:`);
      available.forEach(anim => {
        console.log(`  - ${anim.id}: ${anim.name}`);
      });

    } catch (error) {
      console.error('❌ Failed to initialize animation system:', error);
      throw error;
    }
  }

  /**
   * Get the registry instance
   */
  getRegistry(): AnimationRegistry {
    if (!this.initialized) {
      this.initialize();
    }
    return this.registry;
  }

  /**
   * Check if an animation exists
   */
  hasAnimation(animationId: string): boolean {
    if (!this.initialized) {
      this.initialize();
    }

    try {
      this.registry.getAnimation(animationId);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all available animation IDs
   */
  getAvailableAnimationIds(): string[] {
    if (!this.initialized) {
      this.initialize();
    }

    return this.registry.getAvailableAnimations().map(anim => anim.id);
  }
}

// Export singleton instance
export const animationSystem = AnimationSystem.getInstance();
