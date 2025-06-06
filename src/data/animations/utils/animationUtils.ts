// src/utils/animationUtils.ts

/**
 * Parses a hex color string (#RRGGBB or #RGB) into an RGBA object.
 * @param hex The hex color string.
 * @returns An object with r, g, b, a properties (0-255 for RGB, 0-1 for a).
 */
function hexToRgba(hex: string): { r: number; g: number; b: number; a: number } {
  let c: any = hex.substring(1).split('');
  if (c.length === 3) {
    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  }
  c = '0x' + c.join('');
  return {
    r: (c >> 16) & 255,
    g: (c >> 8) & 255,
    b: c & 255,
    a: 1, // Default alpha
  };
}

/**
 * Linearly interpolates between two colors.
 * @param color1 The starting color in hex format.
 * @param color2 The ending color in hex format.
 * @param t The interpolation factor (0.0 to 1.0).
 * @returns The interpolated color as an 'rgb(r, g, b)' string.
 */
export function lerpColor(color1: string, color2: string, t: number): string {
  const c1 = hexToRgba(color1);
  const c2 = hexToRgba(color2);

  const r = Math.round(c1.r * (1 - t) + c2.r * t);
  const g = Math.round(c1.g * (1 - t) + c2.g * t);
  const b = Math.round(c1.b * (1 - t) + c2.b * t);

  return `rgb(${r}, ${g}, ${b})`;
}
