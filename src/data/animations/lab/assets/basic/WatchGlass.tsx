// src/data/animations/lab/assets/basic/WatchGlass.tsx
import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface WatchGlassProps {
  width?: number;
  height?: number;
}

export const WatchGlass: React.FC<WatchGlassProps> = ({ width = 150, height = 100 }) => {
  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="glassReflection" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="white" stopOpacity="0.5"/>
            <Stop offset="1" stopColor="transparent"/>
          </LinearGradient>
        </Defs>

        <Path d="M20 40 Q75 5, 130 40 Q75 80, 20 40 Z"
              fill="#f8f8f8" stroke="#ddd" strokeWidth="1" />
        <Path d="M40 35 Q75 15, 110 35"
              fill="url(#glassReflection)" opacity="0.7" />
      </Svg>
    </View>
  );
};
