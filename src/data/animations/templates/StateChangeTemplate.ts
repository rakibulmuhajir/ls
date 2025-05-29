// src/data/animations/templates/StateChangeTemplate.ts
export class StateChangeAnimationTemplate extends ChemistryAnimationEngine {
  private particles: HTMLElement[] = [];
  private currentState: 'solid' | 'liquid' | 'gas';
  private substance: string;
  private particleCount: number = 50;

  constructor(
    containerId: string,
    substance: string,
    initialState: 'solid' | 'liquid' | 'gas' = 'solid'
  ) {
    super(containerId);
    this.substance = substance;
    this.currentState = initialState;
    this.createParticles();
    this.arrangeParticles(initialState);
  }

  private createParticles(): void {
    const element = this.substance; // Assuming single element for simplicity
    const elementData = ChemicalElement.get(element);

    for (let i = 0; i < this.particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'state-particle';
      particle.style.cssText = `
        position: absolute;
        width: 30px;
        height: 30px;
        background: radial-gradient(circle at 30% 30%,
          ${this.lightenColor(elementData.color)},
          ${elementData.color}
        );
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: ${this.getTextColor(elementData.color)};
        transition: all 0.5s ease;
      `;
      particle.textContent = element;

      this.particles.push(particle);
      this.container.appendChild(particle);
    }
  }

  private arrangeParticles(state: 'solid' | 'liquid' | 'gas'): void {
    const containerWidth = this.container.offsetWidth;
    const containerHeight = this.container.offsetHeight;

    this.particles.forEach((particle, index) => {
      let x: number, y: number;

      switch (state) {
        case 'solid':
          // Grid arrangement
          const cols = Math.ceil(Math.sqrt(this.particleCount));
          const row = Math.floor(index / cols);
          const col = index % cols;
          x = (containerWidth / cols) * col + 50;
          y = (containerHeight / cols) * row + 50;

          // Add small vibration
          this.addVibration(particle, 2);
          break;

        case 'liquid':
          // Loose arrangement with flow
          x = Math.random() * (containerWidth - 100) + 50;
          y = containerHeight - 100 - (Math.random() * 200);

          // Add flowing motion
          this.addFlowingMotion(particle);
          break;

        case 'gas':
          // Random positions
          x = Math.random() * (containerWidth - 50);
          y = Math.random() * (containerHeight - 50);

          // Add rapid random motion
          this.addRandomMotion(particle);
          break;
      }

      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
    });
  }

  private addVibration(particle: HTMLElement, amplitude: number): void {
    const baseX = parseFloat(particle.style.left);
    const baseY = parseFloat(particle.style.top);

    const animate = () => {
      if (this.currentState === 'solid') {
        const offsetX = (Math.random() - 0.5) * amplitude;
        const offsetY = (Math.random() - 0.5) * amplitude;
        particle.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  private addFlowingMotion(particle: HTMLElement): void {
    let angle = Math.random() * Math.PI * 2;

    const animate = () => {
      if (this.currentState === 'liquid') {
        angle += 0.02;
        const offsetX = Math.sin(angle) * 20;
        const offsetY = Math.cos(angle * 0.5) * 10;
        particle.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  private addRandomMotion(particle: HTMLElement): void {
    let velocityX = (Math.random() - 0.5) * 4;
    let velocityY = (Math.random() - 0.5) * 4;

    const animate = () => {
      if (this.currentState === 'gas') {
        let x = parseFloat(particle.style.left);
        let y = parseFloat(particle.style.top);

        x += velocityX;
        y += velocityY;

        // Bounce off walls
        // Bounce off walls
       if (x < 0 || x > this.container.offsetWidth - 30) {
         velocityX *= -1;
       }
       if (y < 0 || y > this.container.offsetHeight - 30) {
         velocityY *= -1;
       }

       particle.style.left = `${x}px`;
       particle.style.top = `${y}px`;

       requestAnimationFrame(animate);
     }
   };

   animate();
 }

 public async transitionTo(newState: 'solid' | 'liquid' | 'gas'): Promise<void> {
   this.animationState = 'playing';
   this.currentState = newState;

   // Show transition effects
   await this.showTransitionEffect(this.currentState, newState);

   // Rearrange particles
   this.arrangeParticles(newState);

   this.animationState = 'idle';
 }

 private async showTransitionEffect(
   fromState: 'solid' | 'liquid' | 'gas',
   toState: 'solid' | 'liquid' | 'gas'
 ): Promise<void> {
   const effectMap = {
     'solid-liquid': 'melting',
     'liquid-gas': 'boiling',
     'gas-liquid': 'condensation',
     'liquid-solid': 'freezing',
     'solid-gas': 'sublimation',
     'gas-solid': 'deposition'
   };

   const transitionKey = `${fromState}-${toState}`;
   const effect = effectMap[transitionKey];

   if (effect) {
     await this.displayTransitionLabel(effect);
   }
 }

 private async displayTransitionLabel(label: string): Promise<void> {
   const labelElement = document.createElement('div');
   labelElement.className = 'transition-label';
   labelElement.textContent = label.charAt(0).toUpperCase() + label.slice(1);
   labelElement.style.cssText = `
     position: absolute;
     top: 50%;
     left: 50%;
     transform: translate(-50%, -50%);
     background: rgba(0,0,0,0.8);
     color: white;
     padding: 20px 40px;
     border-radius: 10px;
     font-size: 24px;
     font-weight: bold;
     opacity: 0;
     transition: opacity 0.5s ease;
   `;

   this.container.appendChild(labelElement);

   // Animate in
   setTimeout(() => labelElement.style.opacity = '1', 100);

   // Hold
   await new Promise(resolve => setTimeout(resolve, 2000));

   // Animate out
   labelElement.style.opacity = '0';
   setTimeout(() => labelElement.remove(), 500);
 }

 public async play(): Promise<void> {
   // Cycle through states
   await this.transitionTo('liquid');
   await new Promise(resolve => setTimeout(resolve, 3000));
   await this.transitionTo('gas');
   await new Promise(resolve => setTimeout(resolve, 3000));
   await this.transitionTo('liquid');
   await new Promise(resolve => setTimeout(resolve, 3000));
   await this.transitionTo('solid');
 }

 public reset(): void {
   this.currentState = 'solid';
   this.arrangeParticles('solid');
 }

 protected showAtomProperties(atom: HTMLElement): void {
   // Not implemented for state changes
 }
}
