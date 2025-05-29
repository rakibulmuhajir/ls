// src/data/animations/core/AnimationEngine.ts
export abstract class ChemistryAnimationEngine {
  protected container: HTMLElement;
  protected atoms: Map<string, HTMLElement> = new Map();
  protected bonds: Map<string, HTMLElement> = new Map();
  protected molecules: Map<string, HTMLElement> = new Map();
  protected animationState: 'idle' | 'playing' | 'complete' = 'idle';

  constructor(containerId: string) {
    this.container = document.getElementById(containerId)!;
  }

  // Create atom with standardized styling
  protected createAtom(
    element: string,
    x: number,
    y: number,
    id: string
  ): HTMLElement {
    const elementData = ChemicalElement.get(element);
    const atom = document.createElement('div');

    atom.className = 'atom';
    atom.id = id;
    atom.style.cssText = `
      position: absolute;
      width: ${elementData.size}px;
      height: ${elementData.size}px;
      left: ${x}px;
      top: ${y}px;
      background: radial-gradient(circle at 30% 30%,
        ${this.lightenColor(elementData.color)},
        ${elementData.color}
      );
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: ${this.getTextColor(elementData.color)};
      font-size: ${elementData.size * 0.4}px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 0 20px rgba(255,255,255,0.3);
    `;

    atom.textContent = element;
    atom.dataset.element = element;
    atom.dataset.x = x.toString();
    atom.dataset.y = y.toString();

    this.atoms.set(id, atom);
    this.container.appendChild(atom);

    // Add interactions
    this.addAtomInteractions(atom);

    return atom;
  }

  // Create bond between atoms
  protected createBond(
    atom1Id: string,
    atom2Id: string,
    type: 'single' | 'double' | 'triple' | 'ionic',
    id: string
  ): HTMLElement {
    const atom1 = this.atoms.get(atom1Id)!;
    const atom2 = this.atoms.get(atom2Id)!;

    const bond = document.createElement('div');
    bond.className = `bond bond-${type}`;
    bond.id = id;

    const styles: Record<string, string> = {
      single: 'height: 3px; background: #4ecdc4;',
      double: 'height: 6px; background: #4ecdc4; box-shadow: 0 3px 0 #4ecdc4;',
      triple: 'height: 9px; background: #4ecdc4; box-shadow: 0 3px 0 #4ecdc4, 0 6px 0 #4ecdc4;',
      ionic: 'height: 3px; background: repeating-linear-gradient(90deg, #4ecdc4 0, #4ecdc4 5px, transparent 5px, transparent 10px);'
    };

    bond.style.cssText = `
      position: absolute;
      ${styles[type]}
      transform-origin: left center;
      transition: all 0.5s ease;
    `;

    this.updateBondPosition(bond, atom1, atom2);
    this.bonds.set(id, bond);
    this.container.appendChild(bond);

    return bond;
  }

  // Update bond position based on atom positions
  protected updateBondPosition(
    bond: HTMLElement,
    atom1: HTMLElement,
    atom2: HTMLElement
  ): void {
    const rect1 = atom1.getBoundingClientRect();
    const rect2 = atom2.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();

    const x1 = rect1.left - containerRect.left + rect1.width / 2;
    const y1 = rect1.top - containerRect.top + rect1.height / 2;
    const x2 = rect2.left - containerRect.left + rect2.width / 2;
    const y2 = rect2.top - containerRect.top + rect2.height / 2;

    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

    bond.style.width = `${length}px`;
    bond.style.left = `${x1}px`;
    bond.style.top = `${y1}px`;
    bond.style.transform = `rotate(${angle}deg)`;
  }

  // Create complete molecule from template
  protected createMolecule(
    formula: string,
    x: number,
    y: number,
    id: string
  ): HTMLElement {
    const template = MoleculeTemplates.get(formula);
    const molecule = document.createElement('div');
    molecule.className = 'molecule';
    molecule.id = id;
    molecule.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
    `;

    // Create atoms within molecule
    template.atoms.forEach((atomData, index) => {
      const atomId = `${id}-atom-${index}`;
      const atom = this.createAtom(
        atomData.element,
        atomData.position.x,
        atomData.position.y,
        atomId
      );
      molecule.appendChild(atom);
    });

    // Create bonds
    template.bonds.forEach((bondData, index) => {
      const bondId = `${id}-bond-${index}`;
      const atom1Id = `${id}-atom-${bondData.from}`;
      const atom2Id = `${id}-atom-${bondData.to}`;

      setTimeout(() => {
        this.createBond(atom1Id, atom2Id, bondData.type, bondId);
      }, 100);
    });

    this.molecules.set(id, molecule);
    this.container.appendChild(molecule);

    return molecule;
  }

  // Animation utilities
  protected async animateMove(
    element: HTMLElement,
    x: number,
    y: number,
    duration: number = 1000
  ): Promise<void> {
    return new Promise(resolve => {
      element.style.transition = `all ${duration}ms ease-in-out`;
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;

      setTimeout(resolve, duration);
    });
  }

  protected async animateScale(
    element: HTMLElement,
    scale: number,
    duration: number = 500
  ): Promise<void> {
    return new Promise(resolve => {
      element.style.transition = `transform ${duration}ms ease-in-out`;
      element.style.transform = `scale(${scale})`;

      setTimeout(resolve, duration);
    });
  }

  protected async animateFade(
    element: HTMLElement,
    opacity: number,
    duration: number = 500
  ): Promise<void> {
    return new Promise(resolve => {
      element.style.transition = `opacity ${duration}ms ease-in-out`;
      element.style.opacity = opacity.toString();

      setTimeout(resolve, duration);
    });
  }

  // Helper methods
  private lightenColor(color: string): string {
    // Simple color lightening
    const num = parseInt(color.slice(1), 16);
    const amt = 40;
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return `#${(0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1)}`;
  }

  private getTextColor(bgColor: string): string {
    // Determine if text should be light or dark
    const color = bgColor.slice(1);
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 155 ? '#000000' : '#FFFFFF';
  }

  private addAtomInteractions(atom: HTMLElement): void {
    atom.addEventListener('click', () => this.showAtomProperties(atom));
    atom.addEventListener('mouseenter', () => {
      if (this.animationState !== 'playing') {
        atom.style.transform = 'scale(1.1)';
        atom.style.zIndex = '10';
      }
    });
    atom.addEventListener('mouseleave', () => {
      if (this.animationState !== 'playing') {
        atom.style.transform = 'scale(1)';
        atom.style.zIndex = '1';
      }
    });
  }

  protected abstract showAtomProperties(atom: HTMLElement): void;
  public abstract play(): Promise<void>;
  public abstract reset(): void;
}
