// src/data/animations/lab/assets/specialized/Condenser.tsx
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Rect, Path, Defs, LinearGradient, Stop, Circle, Text } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, withRepeat } from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface CondenserProps {
  width?: number;
  height?: number;
}

export const Condenser: React.FC<CondenserProps> = ({ width = 200, height = 200 }) => {
  const [active, setActive] = useState(false);
  const waterFlow = useSharedValue(0);

  const toggleFlow = () => {
    setActive(!active);
    waterFlow.value = active ?
      withTiming(0, { duration: 500 }) :
      withRepeat(withTiming(1, { duration: 2000 }), -1, true);
  };

  const waterProps = useAnimatedProps(() => ({
    strokeDashoffset: waterFlow.value * 100
  }));

  return (
    <Pressable onPress={toggleFlow}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="glass" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#ffffff" stopOpacity="0.2"/>
            <Stop offset="1" stopColor="#f0f0f0" stopOpacity="0.1"/>
          </LinearGradient>
        </Defs>

        {/* Outer tube */}
        <Path
          d="M50 50 L150 50 L160 150 L40 150 Z"
          fill="url(#glass)"
          stroke="#aaa"
        />

        {/* Inner tube */}
        <Path
          d="M70 70 L130 70 L120 130 L80 130 Z"
          fill="none"
          stroke="#555"
          strokeWidth="2"
        />

        {/* Water inlet/outlet */}
        <Rect x="30" y="80" width="20" height="5" rx="2" fill="#555" />
        <Rect x="150" y="110" width="20" height="5" rx="2" fill="#555" />

        {/* Water flow animation */}
        <AnimatedPath
          d="M40 85 L60 85 L70 75 L130 75 L140 85 L160 85"
          stroke="#2a9df4"
          strokeWidth="3"
          strokeDasharray="10,5"
          fill="none"
          animatedProps={waterProps}
        />

        {/* Status indicator */}
        <Circle cx="180" cy="30" r="10" fill={active ? "#0f0" : "#f00"} />
        <Text x="180" y="50" textAnchor="middle" fill="black" fontSize="10">
          {active ? "ON" : "OFF"}
        </Text>
      </Svg>
    </Pressable>
  );
};
