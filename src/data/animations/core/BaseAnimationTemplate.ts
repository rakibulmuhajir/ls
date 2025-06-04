// src/data/animations/core/BaseAnimationTemplate.ts
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
