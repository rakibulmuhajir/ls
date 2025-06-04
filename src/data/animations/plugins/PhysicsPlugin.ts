// src/data/animations/plugins/PhysicsPlugin.ts
import { AnimationPlugin, AnimationRegistry } from '../core/AnimationRegistry';

export class PhysicsPlugin implements AnimationPlugin {
  id = 'physics-core';
  name = 'Physics Core Animations';
  version = '1.0.0';

  register(registry: AnimationRegistry): void {
    // Register physics-related animations
    registry.registerAnimation({
      id: 'wave-motion',
      name: 'Wave Motion',
      description: 'Visualization of wave properties and behaviors',
      templateId: 'wave',
      category: 'physics',
      tags: ['waves', 'motion', 'physics'],
      config: {
        height: 400,
        autoPlay: true,
        loop: true,
        waveType: 'sine',
        frequency: 1,
        amplitude: 1,
        speed: 1
      }
    });

    registry.registerAnimation({
      id: 'electromagnetic-spectrum',
      name: 'Electromagnetic Spectrum',
      description: 'Interactive electromagnetic spectrum visualization',
      templateId: 'spectrum',
      category: 'physics',
      tags: ['electromagnetic', 'spectrum', 'light'],
      config: {
        height: 300,
        autoPlay: false,
        loop: false,
        range: 'visible',
        speed: 1
      }
    });

    registry.registerAnimation({
      id: 'atomic-structure',
      name: 'Atomic Structure',
      description: 'Visualization of atomic structure with electrons, protons, and neutrons',
      templateId: 'reaction',
      category: 'atomic-physics',
      tags: ['atom', 'structure', 'electrons', 'nucleus'],
      config: {
        height: 450,
        autoPlay: true,
        loop: true,
        element: 'H',
        showElectronOrbits: true,
        showNucleus: true,
        speed: 1
      }
    });

    registry.registerAnimation({
      id: 'molecular-motion',
      name: 'Molecular Motion',
      description: 'Brownian motion and molecular kinetics',
      templateId: 'state-change',
      category: 'thermodynamics',
      tags: ['molecules', 'motion', 'kinetic-theory'],
      config: {
        height: 400,
        autoPlay: true,
        loop: true,
        substance: 'gas',
        temperature: 20,
        particleCount: 100,
        speed: 1
      }
    });
  }

  unregister(registry: AnimationRegistry): void {
    // Clean up physics animations if needed
    const physicsAnimationIds = [
      'wave-motion',
      'electromagnetic-spectrum',
      'atomic-structure',
      'molecular-motion'
    ];

    physicsAnimationIds.forEach(id => {
      console.log(`Unregistering physics animation: ${id}`);
    });
  }
}
