import React from 'react';
import Svg, {
  Rect,
  Circle,
  Path,
  Defs,
  RadialGradient,
  Stop,
  AnimateTransform,
  G
} from 'react-native-svg';
import { LabColors } from './colors';

interface BunsenBurnerProps {
  width: number;
  height: number;
  isActive: boolean;
}

export const BunsenBurnerSVG: React.FC<BunsenBurnerProps> = ({ width, height, isActive }) => (
  <Svg width={width} height={height} viewBox="0 0 60 80">
    {/* Base */}
    <Rect x="20" y="70" width="20" height="8" rx="2" fill={LabColors.metal.primary} />

    {/* Main tube */}
    <Rect
      x="26"
      y="20"
      width="8"
      height="50"
      rx="4"
      fill={LabColors.metal.primary}
      stroke={LabColors.metal.secondary}
      strokeWidth="1"
    />

    {/* Gas control */}
    <Rect x="24" y="45" width="12" height="6" rx="3" fill={LabColors.metal.secondary} />

    {/* Air holes */}
    <Circle cx="27" cy="48" r="0.8" fill={LabColors.metal.shadow} />
    <Circle cx="33" cy="48" r="0.8" fill={LabColors.metal.shadow} />

    {/* Burner head */}
    <Rect x="24" y="18" width="12" height="8" rx="2" fill={LabColors.metal.secondary} />

    {/* Gas outlet */}
    <Circle cx="30" cy="20" r="2" fill={LabColors.metal.shadow} />

    {/* Flame */}
    {isActive && (
      <G>
        <Defs>
          <RadialGradient id="flameGradient" cx="50%" cy="80%" r="60%">
            <Stop offset="0%" stopColor={LabColors.flame.blue} />
            <Stop offset="50%" stopColor={LabColors.flame.orange} />
            <Stop offset="100%" stopColor={LabColors.flame.red} />
          </RadialGradient>
        </Defs>
        <Path
          d="M 30 20 Q 25 15 27 8 Q 29 5 30 3 Q 31 5 33 8 Q 35 15 30 20 Z"
          fill="url(#flameGradient)"
          opacity="0.9"
        >
          <AnimateTransform
            attributeName="transform"
            type="scale"
            values="1,1;1.1,1.2;1,1"
            dur="0.5s"
            repeatCount="indefinite"
          />
        </Path>
      </G>
    )}
  </Svg>
);
