// src/data/animations/templates/DefinitionTemplate.ts
import { BaseAnimationTemplate } from '../core/BaseAnimationTemplate';

export class DefinitionTemplate extends BaseAnimationTemplate {
  private scene: any;
  private camera: any;
  private renderer: any;
  private particles: any[] = [];
  private animationId: number | null = null;
  private currentSceneIndex = 0;
  private isPlaying = false;
  private clock: any;

  constructor() {
    super(
      'definition',
      'Definition Animation',
      '1.0.0',
      ['three.js']
    );
  }

  protected async onInitialize(): Promise<void> {
    await this.waitForThreeJS();
    this.setupThreeJS();

    this.state = {
      currentScene: 'intro',
      progress: 0,
      speed: this.config.speed || 1,
      scenes: this.config.scenes || ['intro'],
      sceneDurations: this.config.sceneDurations || [3],
      totalDuration: this.config.totalDuration || 30,
      isPlaying: false,
      ...this.config.initialState
    };
  }

  protected async onRender(): Promise<void> {
    if (!this.container) return;

    this.container.appendChild(this.renderer.domElement);
    this.createBackgroundElements();
    this.initializeScenes();
    this.startAnimationLoop();

    this.sendMessage('ready');
  }

  protected async onPlay(): Promise<void> {
    this.isPlaying = true;
    this.state.isPlaying = true;
    this.runSceneSequence();
  }

  protected onPause(): void {
    this.isPlaying = false;
    this.state.isPlaying = false;
  }

  protected onReset(): void {
    this.currentSceneIndex = 0;
    this.state.progress = 0;
    this.state.currentScene = this.state.scenes[0];
    this.isPlaying = false;
    this.state.isPlaying = false;

    // Reset all UI elements
    this.resetAllScenes();
  }

  protected onControlUpdate(control: string, value: any): void {
    switch (control) {
      case 'speed':
        this.updateSpeed(value);
        break;
      case 'zoom':
        this.updateZoom(value);
        break;
      case 'playPause':
        if (value) {
          this.play();
        } else {
          this.pause();
        }
        break;
    }
  }

  private async waitForThreeJS(): Promise<void> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50;

      const checkThreeJS = () => {
        if (typeof THREE !== 'undefined') {
          resolve();
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkThreeJS, 100);
        } else {
          reject(new Error('Three.js failed to load'));
        }
      };

      checkThreeJS();
    });
  }

  private setupThreeJS(): void {
    if (!this.container) return;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 3, 12);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x000000, 0); // Transparent for HTML overlay

    // Clock
    this.clock = new THREE.Clock();

    // Lighting
    this.setupLighting();

    // Handle resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private setupLighting(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Main directional light
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 10, 7);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    this.scene.add(mainLight);

    // Accent point light
    const pointLight = new THREE.PointLight(0x4ECDC4, 0.7, 30);
    pointLight.position.set(-5, 5, 5);
    this.scene.add(pointLight);
  }

  private createBackgroundElements(): void {
    // Create floating background particles
    const particleCount = 50;
    const geometry = new THREE.SphereGeometry(0.05, 8, 8);

    for (let i = 0; i < particleCount; i++) {
      const material = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.6 ? 0x4ECDC4 : (Math.random() > 0.3 ? 0x64B5F6 : 0xffffff),
        transparent: true,
        opacity: Math.random() * 0.4 + 0.2
      });

      const particle = new THREE.Mesh(geometry, material);
      particle.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 30 - 10
      );

      particle.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.005,
          (Math.random() - 0.5) * 0.005,
          (Math.random() - 0.5) * 0.005
        ),
        originalPosition: particle.position.clone()
      };

      this.scene.add(particle);
      this.particles.push(particle);
    }
  }

  private initializeScenes(): void {
    // This method sets up any 3D elements that need to be controlled by the scene sequence
    // For definition animations, most content is HTML-based, but we can add 3D accents

    // Hide all HTML elements initially
    this.hideAllSceneContent();

    // Show the first scene
    if (this.state.scenes.length > 0) {
      this.showScene(this.state.scenes[0]);
    }
  }

  private runSceneSequence(): void {
    if (!this.isPlaying) return;

    const totalScenes = this.state.scenes.length;
    const sceneDurations = this.state.sceneDurations;

    let timeAccumulator = 0;
    let currentSceneTime = 0;

    const updateProgress = () => {
      if (!this.isPlaying) return;

      currentSceneTime += (1/60) * this.state.speed; // Assume 60fps
      this.state.progress = (timeAccumulator + currentSceneTime) / this.state.totalDuration;

      // Check if current scene is complete
      if (currentSceneTime >= sceneDurations[this.currentSceneIndex]) {
        // Move to next scene
        timeAccumulator += sceneDurations[this.currentSceneIndex];
        currentSceneTime = 0;
        this.currentSceneIndex++;

        if (this.currentSceneIndex < totalScenes) {
          this.state.currentScene = this.state.scenes[this.currentSceneIndex];
          this.showScene(this.state.currentScene);
          this.sendMessage('stateUpdate', { state: this.state });
        } else {
          // Animation complete
          this.isPlaying = false;
          this.state.isPlaying = false;
          this.sendMessage('animationComplete');
          return;
        }
      }

      // Continue the sequence
      requestAnimationFrame(updateProgress);
    };

    updateProgress();
  }

  private showScene(sceneName: string): void {
    // Hide all content first
    this.hideAllSceneContent();

    // Show specific scene content
    // This works with the HTML elements defined in the animation HTML

    // For scene-based animations like chemistry definition,
    // we need to call JavaScript functions in the WebView
    this.sendSceneCommand('showScene', sceneName);
  }

  private hideAllSceneContent(): void {
    this.sendSceneCommand('hideAllScenes');
  }

  private resetAllScenes(): void {
    this.sendSceneCommand('resetScenes');
  }

  private sendSceneCommand(command: string, data?: any): void {
    // Send commands to the HTML/JavaScript side of the animation
    if (typeof window !== 'undefined' && (window as any).handleSceneCommand) {
      (window as any).handleSceneCommand(command, data);
    }
  }

  private updateSpeed(speed: number): void {
    this.state.speed = speed;
  }

  private updateZoom(zoom: number): void {
    this.camera.position.z = 12 / zoom;
  }

  private startAnimationLoop(): void {
    const animate = () => {
      const delta = this.clock.getDelta();

      // Animate background particles
      this.particles.forEach(particle => {
        const velocity = particle.userData.velocity;
        particle.position.add(velocity.clone().multiplyScalar(this.state.speed * 20));

        // Boundary checking
        if (Math.abs(particle.position.x) > 15) particle.position.x = -particle.position.x;
        if (Math.abs(particle.position.y) > 10) particle.position.y = -particle.position.y;
        if (Math.abs(particle.position.z) > 15) particle.position.z = -particle.position.z;
      });

      // Gentle scene rotation for visual interest
      if (this.state.rotation3D) {
        this.scene.rotation.y += 0.001 * this.state.speed;
      }

      // Render
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }

      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  private onWindowResize(): void {
    if (!this.container) return;

    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }
}

// DefinitionTemplate implementation only - Factory is in separate file

// Helper function to integrate with existing chemistry definition
export const createChemistryDefinitionWithTemplate = () => {
  // This function bridges your existing chemistryDefinitionInteractive
  // with the new template system

  return {
    templateId: 'definition',
    config: {
      height: 600,
      autoPlay: false,
      scenes: [
        'opening',
        'definition-show-initial',
        'definition-highlight-branch',
        'branch-of-science-content',
        'definition-highlight-properties',
        'property-1-content',
        'property-2-content',
        'property-3-content',
        'definition-highlight-composition',
        'composition-1-content',
        'composition-2-content',
        'composition-3-content',
        'definition-highlight-physical',
        'physical-changes-1-content',
        'physical-changes-2-content',
        'physical-changes-3-content',
        'definition-highlight-chemical',
        'chemical-changes-1-content',
        'chemical-changes-2-content',
        'chemical-changes-3-content',
        'definition-highlight-laws',
        'law-1-content',
        'law-2-content',
        'law-3-content',
        'law-4-content',
        'final-definition-summary'
      ],
      sceneDurations: [2, 2.5, 2.5, 4, 2.5, 2, 2, 2, 2.5, 2.5, 2.5, 2.5, 2.5, 3, 3, 3, 2.5, 4, 4, 4, 2.5, 2, 2, 2, 2, 3.5],
      totalDuration: 65.5,
      initialState: {
        speed: 2,
        isPlaying: false
      }
    }
  };
};
