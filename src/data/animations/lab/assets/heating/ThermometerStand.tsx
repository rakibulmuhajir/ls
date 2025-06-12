// src/data/animations/lab/assets/heating/ThermometerStand.tsx
import React, { useState } from 'react';
import { G } from 'react-native-svg';
import { View } from 'react-native';
import Svg, { Rect, Path, Circle, Defs, LinearGradient, Stop, Text } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, withSequence, withRepeat } from 'react-native-reanimated';

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedG = Animated.createAnimatedComponent(G);

interface ThermometerStandProps {
  width?: number;
  height?: number;
  temperature?: number;
}

export const ThermometerStand: React.FC<ThermometerStandProps> = ({
  width = 150,
  height = 250,
  temperature = 25
}) => {
  const mercuryHeight = useSharedValue(50);
  const shake = useSharedValue(0);

  const updateTemp = (newTemp: number) => {
    newTemp = Math.min(100, Math.max(-10, newTemp));
    mercuryHeight.value = withTiming(20 + (newTemp/100)*80, { duration: 1000 });

    shake.value = withSequence(
      withTiming(5, { duration: 100 }),
      withRepeat(withTiming(-5, { duration: 100 }), 3, true),
      withTiming(0, { duration: 100 })
    );
  };

  const mercuryProps = useAnimatedProps(() => ({
    y: height * 0.8 - mercuryHeight.value,
    height: mercuryHeight.value
  }));

  const shakeProps = useAnimatedProps(() => ({
    transform: [{ translateX: shake.value }]
  }));

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="mercuryGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#ff3300" />
            <Stop offset="1" stopColor="#cc0000" />
          </LinearGradient>
        </Defs>

        {/* Stand base */}
        <Rect x="60" y={height * 0.9} width="30" height="10" fill="#555" rx="2" />

        {/* Stand rod */}
        <Rect x="70" y={height * 0.4} width="10" height={height * 0.5} fill="#777" />

        {/* Clamp */}
        <Rect x="60" y={height * 0.36} width="30" height="15" fill="#999" rx="3" />

        {/* Thermometer */}
        <AnimatedG animatedProps={shakeProps}>
          <Rect x="68" y={height * 0.2} width="14" height={height * 0.6} rx="7"
                fill="#e0e0e0" stroke="#999" />
          <Circle cx="75" cy={height * 0.8} r="8" fill="#e0e0e0" stroke="#999" />

          {/* Mercury */}
          <AnimatedRect
            x="70"
            width="10"
            rx="5"
            fill="url(#mercuryGradient)"
            animatedProps={mercuryProps}
          />
        </AnimatedG>

        {/* Temperature scale */}
        {Array.from({ length: 6 }, (_, i) => (
          <Text key={i} x="90" y={height * 0.25 + i * height * 0.1} fontSize="8" fill="#333">
            {100 - i * 20}°
          </Text>
        ))}
      </Svg>
    </View>
  );
};
