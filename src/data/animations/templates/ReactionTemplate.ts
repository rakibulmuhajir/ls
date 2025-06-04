// src/data/animations/templates/ReactionTemplate.ts
import { BaseAnimationTemplate } from '../core/BaseAnimationTemplate';
import { ChemicalElements } from '../core/ChemicalElements';
import { MoleculeTemplates } from '../core/MoleculeTemplates';

export class ReactionTemplate extends BaseAnimationTemplate {
  private scene: any;
  private camera: any;
  private renderer: any;
  private reactants: any[] = [];
  private products: any[] = [];
  private animationId: number | null = null;

  constructor() {
    super(
      'reaction',
      'Chemical Reaction Animation',
      '1.0.0',
      ['three.js']
    );
  }

  protected async onInitialize(): Promise<void> {
    // Wait for Three.js to be available
    await this.waitForThreeJS();

    // Initialize Three.js scene
    this.setupThreeJS();

    // Set initial state
    this.state = {
      temperature: this.config.temperature || 20,
      speed: this.config.speed || 1,
      progress: 0,
      isComplete: false,
      ...this.config.initialState
    };
  }

  protected async onRender(): Promise<void> {
    if (!this.container) return;

    // Add renderer to container
    this.container.appendChild(this.renderer.domElement);

    // Create reaction molecules
    this.createReactionMolecules();

    // Start animation loop
    this.startAnimationLoop();

    this.sendMessage('ready');
  }

  protected async onPlay(): Promise<void> {
    if (this.state.isComplete) {
      this.reset();
    }
    this.animateReaction();
  }

  protected onPause(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  protected onReset(): void {
    this.state.progress = 0;
    this.state.isComplete = false;

    // Reset molecule positions
    this.resetMoleculePositions();

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  protected onControlUpdate(control: string, value: any): void {
    switch (control) {
      case 'temperature':
        this.updateTemperature(value);
        break;
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

    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0a);

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.z = 15;

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    // Handle resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createReactionMolecules(): void {
    // Create reactants
    const reactantConfigs = this.config.reactants || [
      { formula: 'H2', count: 2, position: { x: -5, y: 0, z: 0 } },
      { formula: 'O2', count: 1, position: { x: -2, y: 0, z: 0 } }
    ];

    reactantConfigs.forEach((reactantConfig, index) => {
      for (let i = 0; i < reactantConfig.count; i++) {
        const molecule = this.createMolecule(
          reactantConfig.formula,
          reactantConfig.position.x + (i * 1.5),
          reactantConfig.position.y + (Math.random() - 0.5) * 2,
          reactantConfig.position.z + (Math.random() - 0.5) * 2
        );
        molecule.userData = {
          type: 'reactant',
          formula: reactantConfig.formula,
          originalPosition: molecule.position.clone()
        };
        this.reactants.push(molecule);
        this.scene.add(molecule);
      }
    });

    // Create products (initially hidden)
    const productConfigs = this.config.products || [
      { formula: 'H2O', count: 2, position: { x: 5, y: 0, z: 0 } }
    ];

    productConfigs.forEach((productConfig, index) => {
      for (let i = 0; i < productConfig.count; i++) {
        const molecule = this.createMolecule(
          productConfig.formula,
          productConfig.position.x + (i * 1.5),
          productConfig.position.y + (Math.random() - 0.5) * 2,
          productConfig.position.z + (Math.random() - 0.5) * 2
        );
        molecule.userData = {
          type: 'product',
          formula: productConfig.formula,
          targetPosition: molecule.position.clone()
        };
        molecule.visible = false; // Hide initially
        this.products.push(molecule);
        this.scene.add(molecule);
      }
    });
  }

  private createMolecule(formula: string, x: number, y: number, z: number): any {
    const group = new THREE.Group();

    // Get molecule template
    const template = MoleculeTemplates.get(formula);
    if (!template) {
      // Fallback: create simple sphere
      const geometry = new THREE.SphereGeometry(0.5, 16, 16);
      const material = new THREE.MeshPhongMaterial({ color: 0x4ecdc4 });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.castShadow = true;
      group.add(sphere);
    } else {
      // Create molecule from template
      template.atoms.forEach((atomData, atomIndex) => {
        const element = ChemicalElements.get(atomData.element);
        if (element) {
          const atomGeometry = new THREE.SphereGeometry(element.size / 100, 16, 16);
          const atomMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color(element.color),
            shininess: 80
          });
          const atom = new THREE.Mesh(atomGeometry, atomMaterial);

          atom.position.set(
            atomData.position.x / 100,
            atomData.position.y / 100,
            atomData.position.z || 0
          );
          atom.castShadow = true;
          group.add(atom);
        }
      });

      // Create bonds
      template.bonds.forEach((bondData) => {
        const bond = this.createBond(
          template.atoms[bondData.from],
          template.atoms[bondData.to],
          bondData.type
        );
        group.add(bond);
      });
    }

    group.position.set(x, y, z);
    return group;
  }

  private createBond(atom1: any, atom2: any, type: string): any {
    const start = new THREE.Vector3(
      atom1.position.x / 100,
      atom1.position.y / 100,
      atom1.position.z / 100 || 0
    );
    const end = new THREE.Vector3(
      atom2.position.x / 100,
      atom2.position.y / 100,
      atom2.position.z / 100 || 0
    );

    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();

    const geometry = new THREE.CylinderGeometry(0.02, 0.02, length, 8);
    const material = new THREE.MeshPhongMaterial({ color: 0x4ecdc4 });
    const bond = new THREE.Mesh(geometry, material);

    // Position and rotate bond
    bond.position.copy(start).add(direction.multiplyScalar(0.5));
    bond.lookAt(end);
    bond.rotateX(Math.PI / 2);

    return bond;
  }

  private animateReaction(): Promise<void> {
    return new Promise((resolve) => {
      const duration = 3000 / this.state.speed; // 3 seconds base duration
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Update progress
        this.state.progress = progress;
        this.sendMessage('stateUpdate', { state: this.state });

        if (progress < 0.5) {
          // First half: Move reactants toward center
          this.reactants.forEach((molecule, index) => {
            const original = molecule.userData.originalPosition;
            const target = new THREE.Vector3(0, 0, 0);
            molecule.position.lerpVectors(original, target, progress * 2);

            // Add some rotation for visual effect
            molecule.rotation.y += 0.02 * this.state.speed;
          });
        } else {
          // Second half: Show products and move them to final positions
          const secondHalfProgress = (progress - 0.5) * 2;

          // Hide reactants
          this.reactants.forEach(molecule => {
            molecule.visible = 1 - secondHalfProgress > 0.5;
          });

          // Show and animate products
          this.products.forEach((molecule, index) => {
            molecule.visible = true;
            const startPos = new THREE.Vector3(0, 0, 0);
            const targetPos = molecule.userData.targetPosition;
            molecule.position.lerpVectors(startPos, targetPos, secondHalfProgress);

            // Add rotation
            molecule.rotation.y += 0.02 * this.state.speed;
          });
        }

        if (progress < 1) {
          this.animationId = requestAnimationFrame(animate);
        } else {
          this.state.isComplete = true;
          this.sendMessage('animationComplete');
          resolve();
        }
      };

      animate();
    });
  }

  private resetMoleculePositions(): void {
    // Reset reactants
    this.reactants.forEach(molecule => {
      molecule.position.copy(molecule.userData.originalPosition);
      molecule.visible = true;
      molecule.rotation.set(0, 0, 0);
    });

    // Reset products
    this.products.forEach(molecule => {
      molecule.visible = false;
      molecule.rotation.set(0, 0, 0);
    });
  }

  private updateTemperature(temp: number): void {
    this.state.temperature = temp;

    // Update molecule colors based on temperature
    const temperatureColor = this.getTemperatureColor(temp);

    [...this.reactants, ...this.products].forEach(molecule => {
      molecule.children.forEach((child: any) => {
        if (child.material) {
          child.material.emissive = new THREE.Color(temperatureColor);
          child.material.emissiveIntensity = Math.min(Math.abs(temp) / 100, 0.3);
        }
      });
    });
  }

  private updateSpeed(speed: number): void {
    this.state.speed = speed;
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

  private startAnimationLoop(): void {
    const renderLoop = () => {
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
      this.animationId = requestAnimationFrame(renderLoop);
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

// ReactionTemplate implementation only - Factory is in separate file
