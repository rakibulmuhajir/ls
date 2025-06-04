// src/data/animations/core/TemplateRegistry.ts
export interface AnimationTemplate {
  id: string;
  name: string;
  version: string;
  dependencies?: string[];

  // Template lifecycle
  initialize(config: TemplateConfig): Promise<void>;
  render(container: HTMLElement): Promise<void>;
  play(): Promise<void>;
  pause(): void;
  reset(): void;
  destroy(): void;

  // Control handling
  handleControl(control: string, value: any): void;

  // State management
  getState(): any;
  setState(state: any): void;
}

export interface TemplateConfig {
  containerId: string;
  initialState?: any;
  features?: string[];
  safety?: any;
  [key: string]: any;
}

export interface TemplateFactory {
  create(config: TemplateConfig): AnimationTemplate;
  getMetadata(): TemplateMetadata;
}

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  tags: string[];
  features: string[];
  dependencies: string[];
  minVersion?: string;
}

export class TemplateRegistry {
  private static instance: TemplateRegistry;
  private factories: Map<string, TemplateFactory> = new Map();
  private metadata: Map<string, TemplateMetadata> = new Map();

  static getInstance(): TemplateRegistry {
    if (!TemplateRegistry.instance) {
      TemplateRegistry.instance = new TemplateRegistry();
    }
    return TemplateRegistry.instance;
  }

  /**
   * Register a template factory
   */
  register(factory: TemplateFactory): void {
    const metadata = factory.getMetadata();

    if (this.factories.has(metadata.id)) {
      console.warn(`Template '${metadata.id}' is being overridden`);
    }

    this.factories.set(metadata.id, factory);
    this.metadata.set(metadata.id, metadata);
  }

  /**
   * Create a template instance
   */
  create(templateId: string, config: TemplateConfig): AnimationTemplate {
    const factory = this.factories.get(templateId);

    if (!factory) {
      throw new Error(`Template '${templateId}' not found. Available templates: ${Array.from(this.factories.keys()).join(', ')}`);
    }

    return factory.create(config);
  }

  /**
   * Get template metadata
   */
  getMetadata(templateId: string): TemplateMetadata | undefined {
    return this.metadata.get(templateId);
  }

  /**
   * Get all available templates
   */
  getAvailableTemplates(): TemplateMetadata[] {
    return Array.from(this.metadata.values());
  }

  /**
   * Check if template exists
   */
  has(templateId: string): boolean {
    return this.factories.has(templateId);
  }

  /**
   * Unregister a template
   */
  unregister(templateId: string): boolean {
    const hasFactory = this.factories.delete(templateId);
    const hasMetadata = this.metadata.delete(templateId);
    return hasFactory && hasMetadata;
  }

  /**
   * Get templates by tag
   */
  getByTag(tag: string): TemplateMetadata[] {
    return Array.from(this.metadata.values()).filter(
      metadata => metadata.tags.includes(tag)
    );
  }

  /**
   * Get templates by feature
   */
  getByFeature(feature: string): TemplateMetadata[] {
    return Array.from(this.metadata.values()).filter(
      metadata => metadata.features.includes(feature)
    );
  }
}
