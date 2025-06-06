
import React from 'react';
import Svg, {
  Path,
  G,
  Circle,
  Line,
  Rect,
  AnimateTransform,
  Animate
} from 'react-native-svg';
import { LabColors } from './colors';

interface BeakerProps {
  width: number;
  height: number;
  liquidLevel: number;
  bubbles?: boolean;
}

export const BeakerSVG: React.FC<BeakerProps> = ({ width, height, liquidLevel, bubbles = false }) => (
  <Svg width={width} height={height} viewBox="0 0 80 100">
    {/* Beaker body */}
    <Path
      d="M 15 85 L 15 25 L 65 25 L 65 85 Q 65 90 40 90 Q 15 90 15 85 Z"
      fill={LabColors.glass.clear}
      stroke={LabColors.glass.shadow}
      strokeWidth="2"
      opacity="0.8"
    />

    {/* Spout */}
    <Path
      d="M 65 25 L 75 20 L 75 30 L 65 35 Z"
      fill={LabColors.glass.clear}
      stroke={LabColors.glass.shadow}
      strokeWidth="1.5"
      opacity="0.8"
    />

    {/* Liquid */}
    {liquidLevel > 0 && (
      <Path
        d={`M 17 ${85 - liquidLevel * 60} L 17 83 Q 17 88 40 88 Q 63 88 63 83 L 63 ${85 - liquidLevel * 60} Q 40 ${87 - liquidLevel * 60} 17 ${85 - liquidLevel * 60} Z`}
        fill={LabColors.liquids.water}
        opacity="0.7"
      />
    )}

    {/* Bubbles */}
    {bubbles && liquidLevel > 0 && (
      <G>
        <Circle cx="25" cy="70" r="2" fill="rgba(255,255,255,0.6)">
          <AnimateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 2,-40"
            dur="2s"
            repeatCount="indefinite"
          />
          <Animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
        </Circle>
        <Circle cx="40" cy="75" r="1.5" fill="rgba(255,255,255,0.6)">
          <AnimateTransform
            attributeName="transform"
            type="translate"
            values="0,0; -1,-35"
            dur="1.8s"
            repeatCount="indefinite"
          />
          <Animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite" />
        </Circle>
        <Circle cx="55" cy="72" r="2.5" fill="rgba(255,255,255,0.6)">
          <AnimateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 1,-38"
            dur="2.2s"
            repeatCount="indefinite"
          />
          <Animate attributeName="opacity" values="0;1;0" dur="2.2s" repeatCount="indefinite" />
        </Circle>
      </G>
    )}

    {/* Volume markings */}
    <G stroke={LabColors.glass.shadow} strokeWidth="0.5" opacity="0.6">
      <Line x1="12" y1="45" x2="20" y2="45" />
      <Line x1="12" y1="60" x2="20" y2="60" />
      <Line x1="12" y1="75" x2="20" y2="75" />
    </G>

    {/* Glass highlight */}
    <Rect
      x="18"
      y="27"
      width="2"
      height="55"
      rx="1"
      fill={LabColors.glass.reflection}
      opacity="0.4"
    />
  </Svg>
);
