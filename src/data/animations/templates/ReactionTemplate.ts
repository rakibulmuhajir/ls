// src/data/animations/templates/ReactionTemplate.ts
export interface ReactionConfig {
  reactants: Array<{
    formula: string;
    count: number;
    position: { x: number; y: number };
  }>;
  products: Array<{
    formula: string;
    count: number;
    position: { x: number; y: number };
  }>;
  activationEnergy?: number;
  reactionType: 'combustion' | 'synthesis' | 'decomposition' | 'displacement';
  effects?: Array<'flame' | 'explosion' | 'bubble' | 'spark'>;
}

export class ReactionAnimationTemplate extends ChemistryAnimationEngine {
  private config: ReactionConfig;
  private equationDisplay: HTMLElement;
  private infoPanel: HTMLElement;

  constructor(containerId: string, config: ReactionConfig) {
    super(containerId);
    this.config = config;
    this.setupUI();
    this.createInitialState();
  }

  private setupUI(): void {
    // Create equation display
    this.equationDisplay = document.createElement('div');
    this.equationDisplay.className = 'equation-display';
    this.equationDisplay.style.cssText = `
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.8);
      padding: 15px 25px;
      border-radius: 10px;
      color: white;
      font-size: 20px;
      font-family: 'Courier New', monospace;
    `;

    // Build equation string
    const reactantStrings = this.config.reactants.map(r =>
      r.count > 1 ? `${r.count}${r.formula}` : r.formula
    );
    const productStrings = this.config.products.map(p =>
      p.count > 1 ? `${p.count}${p.formula}` : p.formula
    );

    this.equationDisplay.innerHTML = `
      <span class="reactants">${reactantStrings.join(' + ')}</span>
      <span class="arrow"> → </span>
      <span class="products">${productStrings.join(' + ')}</span>
    `;

    this.container.appendChild(this.equationDisplay);

    // Create info panel
    this.infoPanel = document.createElement('div');
    this.infoPanel.className = 'info-panel';
    this.infoPanel.style.cssText = `
      position: absolute;
      top: 80px;
      right: 20px;
      background: rgba(0,0,0,0.8);
      padding: 20px;
      border-radius: 10px;
      color: white;
      max-width: 250px;
    `;
    this.container.appendChild(this.infoPanel);
  }

  private createInitialState(): void {
    // Create reactant molecules
    this.config.reactants.forEach((reactant, index) => {
      for (let i = 0; i < reactant.count; i++) {
        const id = `reactant-${index}-${i}`;
        const offsetX = i * 100;
        const offsetY = index * 100;

        this.createMolecule(
          reactant.formula,
          reactant.position.x + offsetX,
          reactant.position.y + offsetY,
          id
        );
      }
    });
  }

  public async play(): Promise<void> {
    this.animationState = 'playing';

    // Show activation energy requirement
    if (this.config.activationEnergy) {
      await this.showActivationEnergy();
    }

    // Move reactants to center
    await this.moveReactantsToCenter();

    // Show reaction effects
    if (this.config.effects) {
      await this.showReactionEffects();
    }

    // Transform to products
    await this.transformToProducts();

    this.animationState = 'complete';
  }

  private async showActivationEnergy(): Promise<void> {
    const button = document.createElement('button');
    button.className = 'activation-button';
    button.textContent = '🔥 Provide Activation Energy';
    button.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%);
      border: none;
      color: white;
      padding: 15px 30px;
      border-radius: 30px;
      font-size: 18px;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(255,107,107,0.3);
    `;

    this.container.appendChild(button);

    return new Promise(resolve => {
      button.addEventListener('click', () => {
        button.remove();
        resolve();
      });
    });
  }

  private async moveReactantsToCenter(): Promise<void> {
    const centerX = this.container.offsetWidth / 2;
    const centerY = this.container.offsetHeight / 2;

    const movePromises: Promise<void>[] = [];

    this.molecules.forEach((molecule) => {
      movePromises.push(
        this.animateMove(molecule, centerX - 50, centerY - 50, 1500)
      );
    });

    await Promise.all(movePromises);
  }

  private async showReactionEffects(): Promise<void> {
    for (const effect of this.config.effects!) {
      switch (effect) {
        case 'explosion':
          await this.showExplosion();
          break;
        case 'flame':
          await this.showFlame();
          break;
        case 'spark':
          await this.showSpark();
          break;
        case 'bubble':
          await this.showBubbles();
          break;
      }
    }
  }

  private async showExplosion(): Promise<void> {
    const explosion = document.createElement('div');
    explosion.className = 'explosion-effect';
    explosion.style.cssText = `
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 0;
      height: 0;
      background: radial-gradient(circle,
        rgba(255,255,0,0.8) 0%,
        rgba(255,140,0,0.6) 40%,
        transparent 70%
      );
      border-radius: 50%;
      opacity: 0;
    `;

    this.container.appendChild(explosion);

    // Animate explosion
    await this.animateScale(explosion, 5, 600);
    await this.animateFade(explosion, 0, 400);

    explosion.remove();
  }

  private async transformToProducts(): Promise<void> {
    // Fade out reactants
    const fadePromises: Promise<void>[] = [];
    this.molecules.forEach(molecule => {
      fadePromises.push(this.animateFade(molecule, 0, 500));
    });
    await Promise.all(fadePromises);

    // Remove reactant molecules
    this.molecules.forEach(molecule => molecule.remove());
    this.molecules.clear();

    // Create product molecules
    this.config.products.forEach((product, index) => {
      for (let i = 0; i < product.count; i++) {
        const id = `product-${index}-${i}`;
        const offsetX = i * 120;
        const offsetY = index * 100;

        const molecule = this.createMolecule(
          product.formula,
          product.position.x + offsetX,
          product.position.y + offsetY,
          id
        );

        // Start invisible
        molecule.style.opacity = '0';
        molecule.style.transform = 'scale(0)';

        // Animate in
        setTimeout(() => {
          this.animateScale(molecule, 1, 500);
          this.animateFade(molecule, 1, 500);
        }, i * 200);
      }
    });
  }

  public reset(): void {
    // Clear all elements
    this.atoms.forEach(atom => atom.remove());
    this.bonds.forEach(bond => bond.remove());
    this.molecules.forEach(molecule => molecule.remove());

    this.atoms.clear();
    this.bonds.clear();
    this.molecules.clear();

    // Reset state
    this.animationState = 'idle';

    // Recreate initial state
    this.createInitialState();
  }

  protected showAtomProperties(atom: HTMLElement): void {
    const element = atom.dataset.element!;
    const elementData = ChemicalElement.get(element);

    this.infoPanel.innerHTML = `
      <h3>${elementData.name}</h3>
      ${elementData.properties.map(prop => `<p>• ${prop}</p>`).join('')}
    `;
  }

  // Additional effect methods
  private async showFlame(): Promise<void> {
    // Implementation for flame effect
  }

  private async showSpark(): Promise<void> {
    // Implementation for spark effect
  }

  private async showBubbles(): Promise<void> {
    // Implementation for bubble effect
  }
}
