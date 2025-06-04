// src/data/animations/index.ts - Updated initialization
import { AnimationRegistry } from './core/AnimationRegistry';
import { TemplateRegistry } from './core/TemplateRegistry';

// Import template factories
import { ReactionTemplateFactory } from './templates/ReactionTemplateFactory';
import { StateChangeTemplateFactory } from './templates/StateChangeTemplateFactory';
import { DefinitionTemplateFactory } from './templates/DefinitionTemplateFactory';

// Import plugins
import { ChemistryPlugin } from './plugins/ChemistryPlugin';
// animationRegistry.registerPlugin(new PhysicsPlugin()); // TODO: Create missing templates

// Import legacy support
import { AnimationType, AnimationConfig } from './types';

class AnimationSystem {
  private static instance: AnimationSystem;
  private isInitialized = false;

  static getInstance(): AnimationSystem {
    if (!AnimationSystem.instance) {
      AnimationSystem.instance = new AnimationSystem();
    }
    return AnimationSystem.instance;
  }

  /**
   * Initialize the animation system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('Initializing Animation System...');

      const templateRegistry = TemplateRegistry.getInstance();
      const animationRegistry = AnimationRegistry.getInstance();

      // Register template factories
      console.log('Registering templates...');
      templateRegistry.register(new ReactionTemplateFactory());
      templateRegistry.register(new StateChangeTemplateFactory());
      templateRegistry.register(new DefinitionTemplateFactory());

      // Register plugins
      console.log('Registering plugins...');
      animationRegistry.registerPlugin(new ChemistryPlugin());
      //animationRegistry.registerPlugin(new PhysicsPlugin());

      // Register any custom animations
      await this.registerCustomAnimations(animationRegistry);

      this.isInitialized = true;
      console.log('Animation System initialized successfully');

    } catch (error) {
      console.error('Failed to initialize Animation System:', error);
      throw error;
    }
  }

  /**
   * Get animation (with backward compatibility)
   */
  getAnimation(animationId: string): AnimationConfig {
    if (!this.isInitialized) {
      console.warn('Animation system not initialized, attempting auto-initialization...');
      // Synchronous fallback for backward compatibility
      this.initializeSync();
    }

    const registry = AnimationRegistry.getInstance();
    return registry.getAnimation(animationId);
  }

  /**
   * Get all available animations
   */
  getAvailableAnimations() {
    const registry = AnimationRegistry.getInstance();
    return registry.getAvailableAnimations();
  }

  /**
   * Search animations
   */
  searchAnimations(query: string) {
    const registry = AnimationRegistry.getInstance();
    return registry.search(query);
  }

  /**
   * Get animations by category
   */
  getAnimationsByCategory(category: string) {
    const registry = AnimationRegistry.getInstance();
    return registry.getByCategory(category);
  }

  /**
   * Register custom animations
   */
  private async registerCustomAnimations(registry: AnimationRegistry): Promise<void> {
    // Register any app-specific animations here
    // This could be loaded from a configuration file or API

    // Example: Register animations from configuration
    const customAnimations = await this.loadCustomAnimationConfigs();
    customAnimations.forEach(animation => {
      try {
        registry.registerAnimation(animation);
      } catch (error) {
        console.warn(`Failed to register animation ${animation.id}:`, error);
      }
    });
  }

  /**
   * Load custom animation configurations
   */
  private async loadCustomAnimationConfigs(): Promise<any[]> {
    // This could load from:
    // - Local JSON files
    // - Remote API
    // - Database
    // - User preferences

    return [
      // Example custom animation
      {
        id: 'custom-molecule-builder',
        name: 'Molecule Builder',
        description: 'Interactive molecule building tool',
        templateId: 'interactive',
        category: 'tools',
        tags: ['interactive', 'molecules', 'builder'],
        config: {
          height: 500,
          autoPlay: false,
          tools: ['atom-picker', 'bond-tool', 'delete-tool']
        }
      }
    ];
  }

  /**
   * Synchronous initialization (for backward compatibility)
   */
  private initializeSync(): void {
    const templateRegistry = TemplateRegistry.getInstance();
    const animationRegistry = AnimationRegistry.getInstance();

    // Basic template registration
    templateRegistry.register(new ReactionTemplateFactory());
    templateRegistry.register(new StateChangeTemplateFactory());
    templateRegistry.register(new DefinitionTemplateFactory());

    // Basic plugin registration
    animationRegistry.registerPlugin(new ChemistryPlugin());

    this.isInitialized = true;
  }
}

// Create the animation system instance
const animationSystem = AnimationSystem.getInstance();

// Initialize the system (async)
animationSystem.initialize().catch(error => {
  console.error('Animation system initialization failed:', error);
});

// Backward-compatible exports
export const getAnimation = (type: AnimationType): AnimationConfig => {
  return animationSystem.getAnimation(type);
};

// New API exports
export const getAvailableAnimations = () => {
  return animationSystem.getAvailableAnimations();
};

export const searchAnimations = (query: string) => {
  return animationSystem.searchAnimations(query);
};

export const getAnimationsByCategory = (category: string) => {
  return animationSystem.getAnimationsByCategory(category);
};

// Component exports
export { default as ChemistryAnimation } from './AnimationPlayer';
export type { AnimationType } from './types';

// Core system exports (for advanced usage)
export { AnimationRegistry } from './core/AnimationRegistry';
export { TemplateRegistry } from './core/TemplateRegistry';
export { AnimationMessenger } from './core/AnimationMessenger';
export { AnimationStateManager } from './core/AnimationStateManager';

// Migration helper
export const migrateToNewAnimationSystem = () => {
  console.log('Migration guide:');
  console.log('1. Replace getAnimation() calls with specific animation IDs');
  console.log('2. Update AnimationType imports to use specific animation IDs');
  console.log('3. Consider using the new search and category functions');

  // Return mapping for old animation types to new IDs
  return {
    'hydrogen-oxygen-water': 'hydrogen-oxygen-water',
    'states-of-matter': 'states-of-matter',
    'chemistry-definition': 'chemistry-definition',
    'chemistry-definition-interactive': 'chemistry-definition-interactive'
  };
};

// Usage example in your app:
/*
import { getAnimation, getAvailableAnimations, ChemistryAnimation } from '@/data/animations';

// In your component
const MyComponent = () => {
  // Get specific animation
  const config = getAnimation('chemistry-definition');

  // Get all available animations
  const animations = getAvailableAnimations();

  return (
    <ChemistryAnimation
      animationId="chemistry-definition"
      height={600}
      onReady={() => console.log('Animation ready')}
      onError={(error) => console.error('Animation error:', error)}
    />
  );
};
*/
