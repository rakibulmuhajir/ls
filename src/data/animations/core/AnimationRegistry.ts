// src/data/animations/core/AnimationRegistry.ts - FIXED VERSION
import { AnimationConfig } from '../types';

export interface AnimationPlugin {
  id: string;
  name: string;
  version: string;
  register(registry: AnimationRegistry): void;
  unregister?(registry: AnimationRegistry): void;
}

export interface AnimationDefinition {
  id: string;
  name: string;
  description: string;
  templateId: string;
  config: any;
  features?: string[];
  safety?: any;
  category?: string;
  tags?: string[];
  previewImage?: string;
  duration?: number;
}

export class AnimationRegistry {
  private static instance: AnimationRegistry;
  private animations: Map<string, AnimationDefinition> = new Map();
  private plugins: Map<string, AnimationPlugin> = new Map();

  constructor() {
    // No template registry dependency for now
  }

  static getInstance(): AnimationRegistry {
    if (!AnimationRegistry.instance) {
      AnimationRegistry.instance = new AnimationRegistry();
    }
    return AnimationRegistry.instance;
  }

  /**
   * Register an animation definition
   */
  registerAnimation(definition: AnimationDefinition): void {
    if (this.animations.has(definition.id)) {
      console.warn(`Animation '${definition.id}' is being overridden`);
    }

    this.animations.set(definition.id, definition);
  }

  /**
   * Get animation configuration for React Native component
   */
  getAnimation(animationId: string): AnimationConfig {
    const definition = this.animations.get(animationId);
    if (!definition) {
      throw new Error(`Animation '${animationId}' not found. Available: ${Array.from(this.animations.keys()).join(', ')}`);
    }

    return this.buildAnimationConfig(definition);
  }

  /**
   * Get all available animations
   */
  getAvailableAnimations(): AnimationDefinition[] {
    return Array.from(this.animations.values());
  }

  /**
   * Get animations by category
   */
  getByCategory(category: string): AnimationDefinition[] {
    return Array.from(this.animations.values()).filter(
      animation => animation.category === category
    );
  }

  /**
   * Register a plugin
   */
  registerPlugin(plugin: AnimationPlugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin '${plugin.id}' is being overridden`);
    }

    this.plugins.set(plugin.id, plugin);
    plugin.register(this);
  }

  /**
   * Search animations
   */
  search(query: string): AnimationDefinition[] {
    const searchTerm = query.toLowerCase();
    return Array.from(this.animations.values()).filter(animation =>
      animation.name.toLowerCase().includes(searchTerm) ||
      animation.description.toLowerCase().includes(searchTerm) ||
      animation.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Build complete animation config - SIMPLIFIED VERSION
   */
  private buildAnimationConfig(definition: AnimationDefinition): AnimationConfig {
    return {
      // ✅ Use direct HTML if available, otherwise generate simple HTML
      html: definition.config.directHtml || this.generateSimpleHTML(definition),
      height: definition.config.height || 400,
      autoPlay: definition.config.autoPlay || false,
      loop: definition.config.loop || false,
      features: this.mapFeatures(definition.features || []),
      safety: definition.safety,
      template: {
        type: definition.templateId as any,
        config: definition.config
      }
    };
  }

  /**
   * Generate simple HTML for animations without direct HTML
   */
  private generateSimpleHTML(definition: AnimationDefinition): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <style>
        body {
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        .content {
            max-width: 500px;
        }
        h1 {
            font-size: 24px;
            margin-bottom: 20px;
            animation: fadeIn 2s ease-in;
        }
        p {
            font-size: 16px;
            line-height: 1.6;
            animation: slideUp 1.5s ease-out 0.5s both;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
</head>
<body>
    <div class="content">
        <h1>${definition.name}</h1>
        <p>${definition.description}</p>
    </div>

    ${this.getMessagingScript()}
</body>
</html>`;
  }

  /**
   * Map features to animation features
   */
  private mapFeatures(features: string[]): any {
    const featureMap: any = {};

    features.forEach(feature => {
      switch (feature) {
        case 'speed-control':
          featureMap.speed = true;
          break;
        case 'zoom-control':
          featureMap.zoom = true;
          break;
        case 'temperature-control':
          featureMap.temperature = true;
          break;
        // Add more as needed
      }
    });

    return featureMap;
  }

  /**
   * Get messaging script content
   */
  private getMessagingScript(): string {
    return `
    <script>
        // Basic messaging setup
        window.addEventListener('load', function() {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'ready',
                    timestamp: Date.now()
                }));
            }
        });

        // Basic control handler
        window.handleControlUpdate = function(control, value) {
            console.log('Control update:', control, value);
        };

        // Error handling
        window.addEventListener('error', function(event) {
            console.error('Animation error:', event.error);
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'error',
                    error: event.error?.message || 'Unknown error',
                    timestamp: Date.now()
                }));
            }
        });
    </script>
    `;
  }
}
