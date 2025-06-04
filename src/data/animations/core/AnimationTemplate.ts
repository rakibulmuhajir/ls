// src/data/animations/core/AnimationTemplate.ts
export interface AnimationTemplate {
  id: string;
  name: string;
  version: string;
  dependencies?: string[];

  // Template lifecycle
  initialize(config: any): Promise<void>;
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

export abstract class BaseAnimationTemplate implements AnimationTemplate {
  public readonly id: string;
  public readonly name: string;
  public readonly version: string;
  public readonly dependencies: string[];

  protected container: HTMLElement | null = null;
  protected config: TemplateConfig;
  protected state: any = {};
  protected isInitialized = false;
  protected isPlaying = false;

  constructor(
    id: string,
    name: string,
    version: string = '1.0.0',
    dependencies: string[] = []
  ) {
    this.id = id;
    this.name = name;
    this.version = version;
    this.dependencies = dependencies;
  }

  async initialize(config: TemplateConfig): Promise<void> {
    this.config = config;
    this.container = document.getElementById(config.containerId);

    if (!this.container) {
      throw new Error(`Container with id '${config.containerId}' not found`);
    }

    // Load dependencies
    await this.loadDependencies();

    // Initialize template-specific setup
    await this.onInitialize();

    this.isInitialized = true;
  }

  async render(container: HTMLElement): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Template must be initialized before rendering');
    }

    this.container = container;
    await this.onRender();
  }

  async play(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Template must be initialized before playing');
    }

    this.isPlaying = true;
    await this.onPlay();
  }

  pause(): void {
    this.isPlaying = false;
    this.onPause();
  }

  reset(): void {
    this.isPlaying = false;
    this.state = { ...this.config.initialState };
    this.onReset();
  }

  destroy(): void {
    this.pause();
    this.onDestroy();
    this.container = null;
    this.isInitialized = false;
  }

  handleControl(control: string, value: any): void {
    if (!this.isInitialized) return;

    this.onControlUpdate(control, value);
  }

  getState(): any {
    return { ...this.state };
  }

  setState(newState: any): void {
    this.state = { ...this.state, ...newState };
    this.onStateChange(this.state);
  }

  // Protected methods for subclasses to override
  protected async onInitialize(): Promise<void> {}
  protected async onRender(): Promise<void> {}
  protected async onPlay(): Promise<void> {}
  protected onPause(): void {}
  protected onReset(): void {}
  protected onDestroy(): void {}
  protected onControlUpdate(control: string, value: any): void {}
  protected onStateChange(state: any): void {}

  // Utility methods
  protected async loadDependencies(): Promise<void> {
    const promises = this.dependencies.map(dep => this.loadDependency(dep));
    await Promise.all(promises);
  }

  protected async loadDependency(dependency: string): Promise<void> {
    // Override in subclasses for specific dependency loading
    console.log(`Loading dependency: ${dependency}`);
  }

  protected sendMessage(type: string, data: any = {}): void {
    if (window.sendMessageToReactNative) {
      window.sendMessageToReactNative(type, {
        templateId: this.id,
        ...data
      });
    }
  }
}

// src/data/animations/core/TemplateRegistry.ts
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

// src/data/animations/templates/ReactionTemplate.ts
export class ReactionTemplate extends BaseAnimationTemplate {
  private scene: any;
  private camera: any;
  private renderer: any;
  private molecules: any[] = [];

  constructor() {
    super(
      'reaction',
      'Chemical Reaction Animation',
      '1.0.0',
      ['three.js']
    );
  }

  protected async onInitialize(): Promise<void> {
    // Initialize Three.js scene
    this.setupThreeJS();
  }

  protected async onRender(): Promise<void> {
    if (!this.container) return;

    // Add renderer to container
    this.container.appendChild(this.renderer.domElement);

    // Create reaction molecules
    this.createMolecules();
  }

  protected async onPlay(): Promise<void> {
    this.animateReaction();
  }

  protected onControlUpdate(control: string, value: any): void {
    switch (control) {
      case 'temperature':
        this.updateTemperature(value);
        break;
      case 'speed':
        this.updateSpeed(value);
        break;
      // Add more controls
    }
  }

  private setupThreeJS(): void {
    // Three.js setup code
    // ... implementation
  }

  private createMolecules(): void {
    // Create molecular structures
    // ... implementation
  }

  private animateReaction(): void {
    // Animation logic
    // ... implementation
  }

  private updateTemperature(temp: number): void {
    // Update temperature effects
    // ... implementation
  }

  private updateSpeed(speed: number): void {
    // Update animation speed
    // ... implementation
  }
}

// Factory for ReactionTemplate
export class ReactionTemplateFactory implements TemplateFactory {
  create(config: TemplateConfig): AnimationTemplate {
    return new ReactionTemplate();
  }

  getMetadata(): TemplateMetadata {
    return {
      id: 'reaction',
      name: 'Chemical Reaction Animation',
      description: 'Interactive chemical reaction visualization with molecular dynamics',
      version: '1.0.0',
      author: 'Chemistry App Team',
      tags: ['chemistry', 'reaction', '3d'],
      features: ['temperature-control', 'speed-control', 'molecular-visualization'],
      dependencies: ['three.js'],
      minVersion: '1.0.0'
    };
  }
}
