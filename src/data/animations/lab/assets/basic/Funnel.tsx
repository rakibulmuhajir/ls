// src/data/animations/lab/assets/basic/Funnel.tsx
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming } from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface FunnelProps {
  width?: number;
  height?: number;
  liquidColor?: string;
}

export const Funnel: React.FC<FunnelProps> = ({ width = 140, height = 180, liquidColor = '#2a9df4' }) => {
  const [pouring, setPouring] = useState(false);
  const pourOpacity = useSharedValue(0);

  const togglePour = () => {
    setPouring(!pouring);
    pourOpacity.value = withTiming(pouring ? 0 : 0.8, { duration: 500 });
  };

  const pourProps = useAnimatedProps(() => ({ opacity: pourOpacity.value }));

  return (
    <Pressable onPress={togglePour}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="funnelGradient" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#ffffff" stopOpacity="0.3" />
            <Stop offset="1" stopColor="#f0f0f0" stopOpacity="0.1" />
          </LinearGradient>
        </Defs>

        <Path d={`M20 20 L120 20 L80 100 L80 160 L60 180 L40 160 L40 100 Z`}
              fill="url(#funnelGradient)" stroke="#ccc" strokeWidth="2" />

        {pouring && (
          <AnimatedPath
            d={`M50 120 Q60 140, 70 120 Q80 150, 90 140 Q100 160, 110 150 L110 180 L50 180 Z`}
            fill={liquidColor}
            animatedProps={pourProps}
          />
        )}
      </Svg>
    </Pressable>
  );
};
