// src/data/animations/types.ts
export type AnimationType =
  | 'hydrogen-oxygen-water'
  | 'states-of-matter'
  | 'phase-changes'
  | 'carbon-allotropes'
  | 'solutions-colloids'
  | 'temperature-solubility';

export interface AnimationConfig {
  html: string;
  height: number;
  autoPlay: boolean;
  loop: boolean;
  backgroundColor?: string;
}
