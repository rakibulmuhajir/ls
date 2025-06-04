// ADD these new interfaces alongside existing ones
export interface AnimationPlugin { /* from new system */ }
export interface AnimationDefinition { /* from new system */ }
export interface TemplateConfig { /* from new system */ }

// KEEP existing AnimationType for backward compatibility
export type AnimationType =
  | 'hydrogen-oxygen-water'
  | 'states-of-matter'
  | 'chemistry-definition'
  | 'chemistry-definition-interactive';

// UPDATE AnimationConfig to include new fields
export interface AnimationConfig {
  html: string;
  height: number;
  autoPlay: boolean;
  loop: boolean;
  features?: AnimationFeatures;
  safety?: SafetyConstraints;
  template?: {
    type: AnimationTemplateType;
    config: any;
  };
  // ADD new fields
  category?: string;
  tags?: string[];
  metadata?: any;
}
