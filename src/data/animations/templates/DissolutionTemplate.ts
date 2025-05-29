// src/data/animations/templates/DissolutionTemplate.ts
export class DissolutionAnimationTemplate extends ChemistryAnimationEngine {
  private soluteType: string;
  private solventType: string;
  private saturationPoint: number;
  private currentAmount: number = 0;
  private soluteParticles: HTMLElement[] = [];
  private solventMolecules: HTMLElement[] = [];
  private dissolvedParticles: HTMLElement[] = [];

  constructor(
    containerId: string,
    soluteType: string = 'NaCl',
    solventType: string = 'H2O',
    saturationPoint: number = 36 // g per 100g water
  ) {
    super(containerId);
    this.soluteType = soluteType;
    this.solventType = solventType;
    this.saturationPoint = saturationPoint;
    this.setupContainer();
    this.createSolvent();
  }

  private setupContainer(): void {
    // Create beaker visual
    const beaker = document.createElement('div');
    beaker.className = 'beaker';
    beaker.style.cssText = `
      position: absolute;
      bottom: 50px;
      left: 50%;
      transform: translateX(-50%);
      width: 300px;
      height: 400px;
      border: 3px solid rgba(255,255,255,0.3);
      border-bottom: 5px solid rgba(255,255,255,0.4);
      border-radius: 0 0 20px 20px;
      background: linear-gradient(
        180deg,
        transparent 0%,
        rgba(66, 165, 245, 0.1) 30%,
        rgba(66, 165, 245, 0.2) 100%
      );
    `;
    this.container.appendChild(beaker);

    // Create measurement marks
    for (let i = 1; i <= 4; i++) {
      const mark = document.createElement('div');
      mark.style.cssText = `
        position: absolute;
        left: -20px;
        bottom: ${i * 80}px;
        width: 10px;
        height: 2px;
        background: rgba(255,255,255,0.5);
      `;
      beaker.appendChild(mark);

      const label = document.createElement('div');
      label.textContent = `${i * 25}mL`;
      label.style.cssText = `
        position: absolute;
        left: -60px;
        bottom: ${i * 80 - 10}px;
        color: rgba(255,255,255,0.7);
        font-size: 12px;
      `;
      beaker.appendChild(label);
    }

    // Saturation indicator
    const saturationIndicator = document.createElement('div');
    saturationIndicator.className = 'saturation-indicator';
    saturationIndicator.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(0,0,0,0.8);
      padding: 15px;
      border-radius: 10px;
      color: white;
    `;
    saturationIndicator.innerHTML = `
      <h4>Saturation Level</h4>
      <div class="saturation-bar" style="
        width: 200px;
        height: 20px;
        background: rgba(255,255,255,0.2);
        border-radius: 10px;
        overflow: hidden;
        margin-top: 10px;
      ">
        <div class="saturation-fill" id="saturation-fill" style="
          width: 0%;
          height: 100%;
          background: linear-gradient(90deg, #4CAF50, #FFC107, #F44336);
          transition: width 0.5s ease;
        "></div>
      </div>
      <p id="saturation-text" style="margin-top: 10px; font-size: 14px;">
        0g / ${this.saturationPoint}g
      </p>
    `;
    this.container.appendChild(saturationIndicator);
  }

  private createSolvent(): void {
    // Create water molecules
    const beakerBounds = {
      left: this.container.offsetWidth / 2 - 150,
      right: this.container.offsetWidth / 2 + 150,
      top: this.container.offsetHeight - 350,
      bottom: this.container.offsetHeight - 50
    };

    for (let i = 0; i < 30; i++) {
      const water = this.createWaterMolecule(
        Math.random() * (beakerBounds.right - beakerBounds.left) + beakerBounds.left,
        Math.random() * (beakerBounds.bottom - beakerBounds.top) + beakerBounds.top
      );
      this.solventMolecules.push(water);
      this.addWaterMotion(water, beakerBounds);
    }
  }

  private createWaterMolecule(x: number, y: number): HTMLElement {
    const water = document.createElement('div');
    water.className = 'water-molecule';
    water.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 40px;
      height: 35px;
      opacity: 0.7;
    `;

    water.innerHTML = `
      <svg viewBox="0 0 40 35" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="15" r="8" fill="#FF6B6B" opacity="0.8"/>
        <circle cx="12" cy="25" r="5" fill="#FFFFFF" opacity="0.8"/>
        <circle cx="28" cy="25" r="5" fill="#FFFFFF" opacity="0.8"/>
        <line x1="20" y1="15" x2="12" y2="25" stroke="#4ECDC4" stroke-width="2" opacity="0.6"/>
        <line x1="20" y1="15" x2="28" y2="25" stroke="#4ECDC4" stroke-width="2" opacity="0.6"/>
      </svg>
    `;

    this.container.appendChild(water);
    return water;
  }

  private addWaterMotion(water: HTMLElement, bounds: any): void {
    let angle = Math.random() * Math.PI * 2;
    let speed = 0.5 + Math.random() * 0.5;

    const animate = () => {
      angle += 0.02;
      const x = parseFloat(water.style.left) + Math.cos(angle) * speed;
      const y = parseFloat(water.style.top) + Math.sin(angle) * speed * 0.5;

      // Keep within bounds
      if (x < bounds.left || x > bounds.right - 40) speed *= -1;
      if (y < bounds.top || y > bounds.bottom - 35) speed *= -1;

      water.style.left = `${x}px`;
      water.style.top = `${y}px`;

      requestAnimationFrame(animate);
    };

    animate();
  }

  public async addSolute(amount: number = 5): Promise<void> {
    if (this.currentAmount >= this.saturationPoint) {
      await this.showSaturationMessage();
      return;
    }

    const actualAmount = Math.min(amount, this.saturationPoint - this.currentAmount);
    this.currentAmount += actualAmount;

    // Update saturation indicator
    this.updateSaturationIndicator();

    // Create solute crystal
    const crystal = this.createSoluteCrystal();
    await this.dropCrystal(crystal);

    // Dissolve or settle based on saturation
    if (this.currentAmount <= this.saturationPoint) {
      await this.dissolveCrystal(crystal);
    } else {
      await this.settleCrystal(crystal);
    }
  }

  private createSoluteCrystal(): HTMLElement {
    const crystal = document.createElement('div');
    crystal.className = 'solute-crystal';

    if (this.soluteType === 'NaCl') {
      // Salt crystal - cubic structure
      crystal.style.cssText = `
        position: absolute;
        left: ${this.container.offsetWidth / 2 - 20}px;
        top: 50px;
        width: 40px;
        height: 40px;
        background: linear-gradient(45deg, #FFFFFF 25%, #E0E0E0 50%, #FFFFFF 75%);
        border: 1px solid #CCCCCC;
        transform: rotate(45deg);
      `;
    } else if (this.soluteType === 'sugar') {
      // Sugar crystal - more irregular
      crystal.style.cssText = `
        position: absolute;
        left: ${this.container.offsetWidth / 2 - 20}px;
        top: 50px;
        width: 35px;
        height: 35px;
        background: radial-gradient(circle at 30% 30%, #FFFFFF, #F5F5DC);
        border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
      `;
    }

    this.container.appendChild(crystal);
    return crystal;
  }

  private async dropCrystal(crystal: HTMLElement): Promise<void> {
    const targetY = this.container.offsetHeight - 250;
    await this.animateMove(crystal, parseFloat(crystal.style.left), targetY, 1000);
  }

  private async dissolveCrystal(crystal: HTMLElement): Promise<void> {
    // Create ion/molecule particles
    const particles = this.soluteType === 'NaCl' ?
      await this.createIons(crystal) :
      await this.createMolecules(crystal);

    // Fade out crystal
    await this.animateFade(crystal, 0, 500);
    crystal.remove();

    // Disperse particles
    await this.disperseParticles(particles);
  }

  private async createIons(crystal: HTMLElement): Promise<HTMLElement[]> {
    const ions: HTMLElement[] = [];
    const x = parseFloat(crystal.style.left);
    const y = parseFloat(crystal.style.top);

    // Create Na+ and Cl- ions
    for (let i = 0; i < 4; i++) {
      const isNa = i % 2 === 0;
      const ion = document.createElement('div');
      ion.className = isNa ? 'na-ion' : 'cl-ion';
      ion.style.cssText = `
        position: absolute;
        left: ${x + 20}px;
        top: ${y + 20}px;
        width: ${isNa ? 25 : 30}px;
        height: ${isNa ? 25 : 30}px;
        border-radius: 50%;
        background: ${isNa ? '#FFD700' : '#00FF00'};
        color: ${isNa ? '#000' : '#FFF'};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        opacity: 0;
        transform: scale(0);
      `;
      ion.textContent = isNa ? 'Na+' : 'Cl-';

      this.container.appendChild(ion);
      ions.push(ion);
      this.dissolvedParticles.push(ion);

      // Animate appearance
      setTimeout(() => {
        ion.style.transition = 'all 0.5s ease';
        ion.style.opacity = '1';
        ion.style.transform = 'scale(1)';
      }, i * 100);
    }

    return ions;
  }

  private async disperseParticles(particles: HTMLElement[]): Promise<void> {
    const beakerBounds = {
      left: this.container.offsetWidth / 2 - 130,
      right: this.container.offsetWidth / 2 + 130,
      top: this.container.offsetHeight - 350,
      bottom: this.container.offsetHeight - 80
    };

    particles.forEach((particle, index) => {
      setTimeout(() => {
        const targetX = Math.random() * (beakerBounds.right - beakerBounds.left) + beakerBounds.left;
        const targetY = Math.random() * (beakerBounds.bottom - beakerBounds.top) + beakerBounds.top;

        this.animateMove(particle, targetX, targetY, 1500);

        // Add floating motion
        this.addParticleMotion(particle, beakerBounds);
      }, index * 200);
    });
  }

  private addParticleMotion(particle: HTMLElement, bounds: any): void {
    let angle = Math.random() * Math.PI * 2;

    const animate = () => {
      angle += 0.03;
      const baseX = parseFloat(particle.dataset.targetX || particle.style.left);
      const baseY = parseFloat(particle.dataset.targetY || particle.style.top);

      const offsetX = Math.sin(angle) * 15;
      const offsetY = Math.cos(angle * 1.5) * 10;

      particle.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(1)`;

      requestAnimationFrame(animate);
    };

    setTimeout(animate, 2000);
  }

  private async settleCrystal(crystal: HTMLElement): Promise<void> {
    // Crystal settles at bottom as undissolved
    const bottomY = this.container.offsetHeight - 60;
    await this.animateMove(
      crystal,
      parseFloat(crystal.style.left) + (Math.random() - 0.5) * 50,
      bottomY,
      1000
    );

    this.soluteParticles.push(crystal);
  }

  private updateSaturationIndicator(): void {
    const percentage = (this.currentAmount / this.saturationPoint) * 100;
    const fill = document.getElementById('saturation-fill');
    const text = document.getElementById('saturation-text');

    if (fill) fill.style.width = `${Math.min(percentage, 100)}%`;
    if (text) text.textContent = `${this.currentAmount}g / ${this.saturationPoint}g`;
  }

  private async showSaturationMessage(): Promise<void> {
    const message = document.createElement('div');
    message.className = 'saturation-message';
    message.textContent = 'Solution is saturated! No more solute can dissolve.';
    message.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(244, 67, 54, 0.9);
      color: white;
      padding: 20px 30px;
      border-radius: 10px;
      font-size: 18px;
      opacity: 0;
      transition: opacity 0.5s ease;
    `;

    this.container.appendChild(message);

    setTimeout(() => message.style.opacity = '1', 100);
    setTimeout(() => {
      message.style.opacity = '0';
      setTimeout(() => message.remove(), 500);
    }, 3000);
  }

  public async play(): Promise<void> {
    // Demonstrate dissolution process
    for (let i = 0; i < 8; i++) {
      await this.addSolute(5);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  public reset(): void {
    // Clear all particles
    this.dissolvedParticles.forEach(p => p.remove());
    this.soluteParticles.forEach(p => p.remove());
    this.dissolvedParticles = [];
    this.soluteParticles = [];
    this.currentAmount = 0;
    this.updateSaturationIndicator();
  }

  protected showAtomProperties(atom: HTMLElement): void {
    // Show properties of clicked particle
  }
}
