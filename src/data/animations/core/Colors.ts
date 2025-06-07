// src/data/animations/core/Colors.ts
import { RenderConfig } from './RenderConfig';
import type { Bond } from './types';
import { lerpColor } from '@/data/animations/utils/animationUtils';

// ... (elementColors object remains the same) ...
const elementColors: Record<string, string> = { H: '#FFFFFF', He: '#DBFFD4', Li: '#CC80FF', Be: '#C2FF00', B: '#FFB5B5', C: '#909090', N: '#3050F8', O: '#FF0D0D', F: '#90E050', Ne: '#B3E3F5', Na: '#AB5CF2', Mg: '#8AFF00', Al: '#BFA6A6', Si: '#F0C8A0', P: '#FF8000', S: '#FFFF30', Cl: '#1FF01F', Ar: '#80D1F5', K: '#8F40D4', Ca: '#3DFF00', DEFAULT: '#CCCCCC' };


export class ColorSystem {
  static getElementColor(elementSymbol: string): string {
    return elementColors[elementSymbol.toUpperCase()] || elementColors.DEFAULT;
  }

  // ... (getStateColor and getBondColor remain the same) ...
  static getStateColor(state: 'solid' | 'liquid' | 'gas', temperature?: number): string {
    if (state === 'solid') return RenderConfig.TemperatureColors.Cool;
    if (state === 'liquid') return RenderConfig.TemperatureColors.Medium;
    if (state === 'gas') {
      if (temperature === undefined) return RenderConfig.TemperatureColors.Warm;
      return temperature > 75 ? RenderConfig.TemperatureColors.Hot :
             temperature > 50 ? RenderConfig.TemperatureColors.Warm :
             RenderConfig.TemperatureColors.Medium;
    }
    return elementColors.DEFAULT;
  }

  static getBondColor(type?: Bond['type']): string {
    switch (type) {
      case 'double': return '#2d3748';
      case 'triple': return '#1a202c';
      case 'hydrogen': return RenderConfig.TemperatureColors.Cool + '80';
      case 'ionic': return RenderConfig.Bond.DefaultColor + '50';
      case 'single':
      default:
        return RenderConfig.Bond.DefaultColor;
    }
  }

  static getTemperatureGradientColors(): string[] {
    return [
      RenderConfig.TemperatureColors.Cool,
      RenderConfig.TemperatureColors.Medium,
      RenderConfig.TemperatureColors.Warm,
      RenderConfig.TemperatureColors.Hot,
    ];
  }

  // CHANGE: Use the new lerpColor utility instead of depending on Skia
  static getColorFromNormalizedTemperature(value: number): string {
    const gradient = ColorSystem.getTemperatureGradientColors();
    if (value <= 0) return gradient[0];
    if (value >= 1) return gradient[gradient.length - 1];

    const scaledValue = value * (gradient.length - 1);
    const index = Math.floor(scaledValue);
    const t = scaledValue - index; // Interpolation factor

    const color1 = gradient[index];
    const color2 = gradient[index + 1];

    return lerpColor(color1, color2, t);
  }

  static getReactionIndicatorColor(type: 'exothermic' | 'endothermic'): string {
    return type === 'exothermic' ? RenderConfig.TemperatureColors.Hot : RenderConfig.TemperatureColors.Cool;
  }
}
