import React from 'react';
import Svg, {
  Rect,
  Circle,
  G,
  Line
} from 'react-native-svg';
import { LabColors } from './colors';

interface ThermometerProps {
  width: number;
  height: number;
  temperature: number;
}

export const ThermometerSVG: React.FC<ThermometerProps> = ({ width, height, temperature }) => {
  const mercuryLevel = Math.max(0, Math.min(1, (temperature - 0) / 100));

  return (
    <Svg width={width} height={height} viewBox="0 0 20 120">
      {/* Thermometer body */}
      <Rect
        x="6"
        y="15"
        width="8"
        height="85"
        rx="4"
        fill={LabColors.glass.clear}
        stroke={LabColors.glass.shadow}
        strokeWidth="1"
      />

      {/* Bulb */}
      <Circle
        cx="10"
        cy="105"
        r="7"
        fill={LabColors.glass.clear}
        stroke={LabColors.glass.shadow}
        strokeWidth="1"
      />

      {/* Mercury */}
      <Rect
        x="7"
        y={100 - mercuryLevel * 80}
        width="6"
        height={mercuryLevel * 80}
        rx="3"
        fill={temperature > 50 ? '#FF4444' : '#FF6666'}
      />

      {/* Mercury bulb */}
      <Circle
        cx="10"
        cy="105"
        r="5"
        fill={temperature > 50 ? '#FF4444' : '#FF6666'}
      />

      {/* Scale markings */}
      <G stroke={LabColors.glass.shadow} strokeWidth="0.3">
        <Line x1="15" y1="30" x2="18" y2="30" />
        <Line x1="15" y1="60" x2="18" y2="60" />
        <Line x1="15" y1="90" x2="18" y2="90" />
      </G>
    </Svg>
  );
};
