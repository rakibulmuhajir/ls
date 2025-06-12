// src/data/animations/lab/assets/heating/HeatingMantle.tsx
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Path, Defs, RadialGradient, Stop, G, Circle, Text, Rect } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, withRepeat, withSequence } from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

interface HeatingMantleProps {
  width?: number;
  height?: number;
}

export const HeatingMantle: React.FC<HeatingMantleProps> = ({ width = 180, height = 200 }) => {
  const [isOn, setIsOn] = useState(false);
  const glowIntensity = useSharedValue(0);
  const pulse = useSharedValue(0);

  const toggleMantle = () => {
    setIsOn(prev => {
      if (!prev) {
        glowIntensity.value = withTiming(1, { duration: 1000 });
        pulse.value = withRepeat(
          withSequence(
            withTiming(0.8, { duration: 1500 }),
            withTiming(1, { duration: 1500 })
          ), -1, true
        );
      } else {
        glowIntensity.value = withTiming(0, { duration: 500 });
        pulse.value = 0;
      }
      return !prev;
    });
  };

  const mantleProps = useAnimatedProps(() => ({
    fill: isOn ? '#ff6600' : '#555555'
  }));

  const glowProps = useAnimatedProps(() => ({
    opacity: pulse.value * glowIntensity.value
  }));

  return (
    <Pressable onPress={toggleMantle}>
      <Svg width={width} height={height}>
        <Defs>
          <RadialGradient id="mantleGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#ffaa00" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#ff5500" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Flask outline (optional) */}
        <Path d="M90 40 Q100 30, 110 40 Q115 100, 110 160 Q100 180, 90 180 Q80 180, 70 160 Q65 100, 70 40 Q80 30, 90 40 Z"
              fill="#aaccff55" />

        {/* Heating mantle */}
        <AnimatedPath
          d="M85 50 Q95 40, 105 50 Q110 90, 105 150 Q95 170, 85 170 Q75 170, 65 150 Q60 90, 65 50 Q75 40, 85 50 Z"
          stroke="#333" strokeWidth="2"
          animatedProps={mantleProps}
        />

        {/* Glow effect */}
        {isOn && (
          <AnimatedG animatedProps={glowProps}>
            <Circle cx="90" cy="100" r="50" fill="url(#mantleGlow)" />
          </AnimatedG>
        )}

        {/* Controls */}
        <Rect x="120" y="170" width="30" height="20" rx="5" fill="#333" />
        <Circle cx="135" cy="180" r="6" fill={isOn ? "#0f0" : "#f00"} />
        <Text x="155" y="185" fontSize="8" fill="#333">{isOn ? "ON" : "OFF"}</Text>
      </Svg>
    </Pressable>
  );
};
