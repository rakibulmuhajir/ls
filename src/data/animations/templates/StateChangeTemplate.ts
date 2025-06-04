// src/data/animations/templates/StateChangeTemplate.ts
import { BaseAnimationTemplate } from '../core/BaseAnimationTemplate';

export class StateChangeTemplate extends BaseAnimationTemplate {
  private scene: any;
  private camera: any;
  private renderer: any;
  private particles: any[] = [];
  private animationId: number | null = null;
  private clock: any;

  constructor() {
    super(
      'state-change',
      'State Change Animation',
      '1.0.0',
      ['three.js']
    );
  }

  protected async onInitialize(): Promise<void> {
    await this.waitForThreeJS();
    this.setupThreeJS();

    this.state = {
      temperature: this.config.temperature || 20,
      currentState: this.config.initialState || 'solid',
      particleCount: this.config.particleCount || 50,
      speed: this.config.speed || 1,
      substance: this.config.substance || 'H2O',
      ...this.config.initialState
    };
  }

  protected async onRender(): Promise<void> {
    if (!this.container) return;

    this.container.appendChild(this.renderer.domElement);
    this.createParticles();
    this.arrangeParticles(this.state.currentState);
    this.startAnimationLoop();

    this.sendMessage('ready');
  }

  protected async onPlay(): Promise<void> {
    this.isPlaying = true;
    this.animateParticles();
  }

  protected onPause(): void {
    this.isPlaying = false;
  }

  protected onReset(): void {
    this.state.temperature = 20;
    this.state.currentState = 'solid';
    this.arrangeParticles('solid');
  }

  protected onControlUpdate(control: string, value: any): void {
    switch (control) {
      case 'temperature':
        this.updateTemperature(value);
        break;
      case 'speed':
        this.updateSpeed(value);
        break;
      case 'particleCount':
        this.updateParticleCount(value);
        break;
      case 'zoom':
        this.updateZoom(value);
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
    this.scene.background = new THREE.Color(0x0a0a0a);
    this.scene.fog = new THREE.Fog(0x0a0a0a, 15, 60);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.z = 15;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Clock for timing
    this.clock = new THREE.Clock();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    // Point light for temperature effects
    const pointLight = new THREE.PointLight(0x4ECDC4, 0.7, 30);
    pointLight.position.set(-5, 5, 5);
    this.scene.add(pointLight);

    // Handle resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createParticles(): void {
    // Clear existing particles
    this.particles.forEach(particle => {
      this.scene.remove(particle);
    });
    this.particles = [];

    const particleGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const particleCount = this.state.particleCount;

    for (let i = 0; i < particleCount; i++) {
      const material = new THREE.MeshPhongMaterial({
        color: this.getSubstanceColor(this.state.substance),
        emissive: 0x2980b9,
        emissiveIntensity: 0.2,
        shininess: 80
      });

      const particle = new THREE.Mesh(particleGeometry, material);

      // Store base position for arrangement
      particle.userData = {
        basePosition: new THREE.Vector3(
          (i % 10 - 5) * 1.5,
          (Math.floor(i / 10) % 10 - 5) * 1.5,
          (Math.floor(i / 100) - 1) * 1.5
        ),
        velocity: new THREE.Vector3(0, 0, 0),
        index: i
      };

      particle.position.copy(particle.userData.basePosition);
      particle.castShadow = true;
      particle.receiveShadow = true;

      this.scene.add(particle);
      this.particles.push(particle);
    }
  }

  private arrangeParticles(state: string): void {
    this.state.currentState = state;

    this.particles.forEach((particle, i) => {
      const basePos = particle.userData.basePosition;

      switch (state) {
        case 'solid':
          // Tight, ordered arrangement
          particle.position.copy(basePos);
          particle.userData.velocity.set(0, 0, 0);
          break;

        case 'liquid':
          // Looser arrangement, some movement
          particle.position.set(
            basePos.x + (Math.random() - 0.5) * 2,
            basePos.y + (Math.random() - 0.5) * 2,
            basePos.z + (Math.random() - 0.5) * 1
          );
          particle.userData.velocity.set(
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.01
          );
          break;

        case 'gas':
          // Random distribution, high movement
          particle.position.set(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 10
          );
          particle.userData.velocity.set(
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.05
          );
          break;
      }
    });

    // Update particle colors based on state
    this.updateParticleColors();
  }

  private animateParticles(): void {
    const animate = () => {
      if (!this.isPlaying) return;

      const delta = this.clock.getDelta();
      const time = this.clock.getElapsedTime();

      this.particles.forEach((particle, i) => {
        if (!particle.visible) return;

        const basePos = particle.userData.basePosition;
        const velocity = particle.userData.velocity;

        switch (this.state.currentState) {
          case 'solid':
            // Small vibrations in place
            particle.position.x = basePos.x + Math.sin(time * 3 + i) * 0.1;
            particle.position.y = basePos.y + Math.cos(time * 3 + i) * 0.1;
            particle.position.z = basePos.z + Math.sin(time * 2 + i) * 0.05;
            break;

          case 'liquid':
            // Flowing motion with some cohesion
            const flowSpeed = this.state.temperature / 100;
            particle.position.x += Math.sin(time + i) * flowSpeed * 0.02;
            particle.position.y += Math.cos(time + i) * flowSpeed * 0.02;
            particle.position.z += Math.sin(time * 0.5 + i) * flowSpeed * 0.01;

            // Keep particles somewhat together
            if (Math.abs(particle.position.x) > 10) particle.position.x *= 0.9;
            if (Math.abs(particle.position.y) > 10) particle.position.y *= 0.9;
            if (Math.abs(particle.position.z) > 5) particle.position.z *= 0.9;
            break;

          case 'gas':
            // Free movement with boundaries
            const gasSpeed = this.getParticleSpeed(this.state.temperature) * this.state.speed;
            particle.position.add(velocity.clone().multiplyScalar(gasSpeed * 50));

            // Boundary bouncing
            if (Math.abs(particle.position.x) > 15) {
              velocity.x *= -0.8;
              particle.position.x = Math.sign(particle.position.x) * 15;
            }
            if (Math.abs(particle.position.y) > 15) {
              velocity.y *= -0.8;
              particle.position.y = Math.sign(particle.position.y) * 15;
            }
            if (Math.abs(particle.position.z) > 10) {
              velocity.z *= -0.8;
              particle.position.z = Math.sign(particle.position.z) * 10;
            }

            // Add some randomness
            velocity.add(new THREE.Vector3(
              (Math.random() - 0.5) * 0.001,
              (Math.random() - 0.5) * 0.001,
              (Math.random() - 0.5) * 0.0005
            ));
            break;
        }

        // Gentle rotation for visual appeal
        particle.rotation.x += 0.005 * this.state.speed;
        particle.rotation.y += 0.003 * this.state.speed;
      });

      // Update scene rotation if enabled
      if (this.state.rotation3D) {
        this.scene.rotation.y += 0.002 * this.state.speed;
      }

      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  private updateTemperature(temp: number): void {
    this.state.temperature = temp;

    // Determine state based on temperature
    let newState = 'solid';
    if (temp > 0) newState = 'liquid';
    if (temp > 100) newState = 'gas';

    // Transition to new state if different
    if (newState !== this.state.currentState) {
      this.transitionToState(newState);
    }

    // Update particle colors and properties
    this.updateParticleColors();
    this.updateParticleProperties();
  }

  private transitionToState(newState: string): void {
    // Animate transition between states
    const oldState = this.state.currentState;
    this.state.currentState = newState;

    // Gradually transition particles
    this.particles.forEach((particle, i) => {
      setTimeout(() => {
        this.transitionParticle(particle, oldState, newState);
      }, i * 10); // Stagger the transitions
    });

    this.sendMessage('stateUpdate', {
      state: this.state,
      transition: { from: oldState, to: newState }
    });
  }

  private transitionParticle(particle: any, fromState: string, toState: string): void {
    // Smooth transition logic for individual particles
    const duration = 1000; // 1 second transition
    const startTime = Date.now();
    const startPosition = particle.position.clone();
    const startVelocity = particle.userData.velocity.clone();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI); // Ease in-out

      if (progress < 1) {
        // Continue transitioning
        requestAnimationFrame(animate);
      } else {
        // Transition complete, arrange for final state
        this.arrangeParticleForState(particle, toState);
      }
    };

    animate();
  }

  private arrangeParticleForState(particle: any, state: string): void {
    const basePos = particle.userData.basePosition;
    const i = particle.userData.index;

    switch (state) {
      case 'solid':
        particle.position.copy(basePos);
        particle.userData.velocity.set(0, 0, 0);
        break;
      case 'liquid':
        particle.position.set(
          basePos.x + (Math.random() - 0.5) * 2,
          basePos.y + (Math.random() - 0.5) * 2,
          basePos.z + (Math.random() - 0.5) * 1
        );
        break;
      case 'gas':
        particle.position.set(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 10
        );
        particle.userData.velocity.set(
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.05
        );
        break;
    }
  }

  private updateParticleColors(): void {
    const temperatureColor = this.getTemperatureColor(this.state.temperature);
    const emissiveIntensity = Math.min(Math.abs(this.state.temperature) / 200, 0.5);

    this.particles.forEach(particle => {
      if (particle.material) {
        particle.material.color.setHex(temperatureColor);
        particle.material.emissive.setHex(this.getSubstanceColor(this.state.substance));
        particle.material.emissiveIntensity = emissiveIntensity;
      }
    });
  }

  private updateParticleProperties(): void {
    // Update particle behavior based on temperature
    const speed = this.getParticleSpeed(this.state.temperature);

    this.particles.forEach(particle => {
      // Scale particles slightly based on temperature (thermal expansion)
      const scale = 1 + (this.state.temperature / 1000);
      particle.scale.setScalar(Math.max(0.5, Math.min(1.5, scale)));
    });
  }

  private updateSpeed(speed: number): void {
    this.state.speed = speed;
  }

  private updateParticleCount(count: number): void {
    this.state.particleCount = count;

    // Show/hide particles based on count
    this.particles.forEach((particle, i) => {
      particle.visible = i < count;
    });
  }

  private updateZoom(zoom: number): void {
    this.camera.position.z = 15 / zoom;
  }

  private getTemperatureColor(temp: number): number {
    if (temp < 0) return 0x87CEEB; // Ice blue
    if (temp < 50) return 0x4169E1; // Royal blue
    if (temp < 100) return 0xFF8C00; // Dark orange
    return 0xFF4500; // Orange red
  }

  private getSubstanceColor(substance: string): number {
    const colors: Record<string, number> = {
      'H2O': 0x4FC3F7,
      'CO2': 0xFFFFFF,
      'N2': 0x0066CC,
      'O2': 0xFF6B6B,
      'default': 0x4ECDC4
    };
    return colors[substance] || colors.default;
  }

  private getParticleSpeed(temp: number): number {
    // More realistic kinetic energy relationship
    return 0.001 + (temp + 100) / 10000;
  }

  private startAnimationLoop(): void {
    const renderLoop = () => {
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
      requestAnimationFrame(renderLoop);
    };
    renderLoop();
  }

  private onWindowResize(): void {
    if (!this.container) return;

    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }
}
