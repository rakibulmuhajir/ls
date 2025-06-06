// src/data/animations/core/Performance.ts
import type { PhysicsEngine, PerformanceSettings } from './types'; // Ensure correct import path

export class PerformanceManager {
  private currentSettings: PerformanceSettings;

  constructor(initialLevel: 'low' | 'medium' | 'high' = 'low') {
    // Initial detection is a placeholder - in a real app, this would be more sophisticated
    // or could be set based on user preference or device capabilities.
    this.currentSettings = this.getSettingsForLevel(initialLevel);
    this.detectDevicePerformance(); // Simulate detection on init
  }

  private getSettingsForLevel(level: 'low' | 'medium' | 'high'): PerformanceSettings {
    switch (level) {
      case 'high':
        return {
          level: 'high',
          frameRate: 60,
          maxParticles: 200, // Example
          physicsQuality: 'advanced',
          enableParticleTrails: true,
          enableComplexCollisions: true,
        };
      case 'medium':
        return {
          level: 'medium',
          frameRate: 45,
          maxParticles: 100,
          physicsQuality: 'standard',
          enableParticleTrails: false,
          enableComplexCollisions: true,
        };
      case 'low':
      default:
        return {
          level: 'low',
          frameRate: 30,
          maxParticles: 50,
          physicsQuality: 'basic',
          enableParticleTrails: false,
          enableComplexCollisions: false,
        };
    }
  }

  // Simulate device performance detection
  private detectDevicePerformance() {
    // Placeholder: In a real app, use libraries like react-native-device-info
    // to get device RAM, CPU cores, etc., and make an educated guess.
    // For now, we'll default to 'low' or allow it to be set externally.
    // Example:
    // const deviceInfo = getDeviceInfo();
    // if (deviceInfo.totalMemory > 4 * 1024 * 1024 * 1024 && deviceInfo.cpuCores > 4) {
    //   this.setPerformanceLevel('medium');
    // }
    console.log("PerformanceManager: Defaulting to initial or 'low' performance settings. Implement actual device detection.");
    // The constructor already sets initialLevel. This method could refine it.
  }

  getPerformanceSettings(): Readonly<PerformanceSettings> {
    return Object.freeze({ ...this.currentSettings }); // Return a copy
  }

  setPerformanceLevel(level: 'low' | 'medium' | 'high') {
    console.log(`PerformanceManager: Setting performance level to ${level}`);
    this.currentSettings = this.getSettingsForLevel(level);
    // Notify subscribers or engine if settings change dynamically during an animation
  }

  // These methods are more conceptual for now; actual optimization logic lives in PhysicsEngine/Renderer
  // based on the settings provided by this manager.
  // This manager's role is to DETERMINE the settings.
  shouldEnableComplexCollisions(): boolean {
    return this.currentSettings.enableComplexCollisions;
  }

  shouldEnableParticleTrails(): boolean {
    return this.currentSettings.enableParticleTrails;
  }

  getTargetFrameRate(): number {
    return this.currentSettings.frameRate;
  }
}
