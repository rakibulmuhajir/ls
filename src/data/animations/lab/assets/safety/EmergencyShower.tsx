// src/data/animations/lab/assets/safety/EmergencyShower.tsx
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Rect, Circle, Path, G, Text } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, withRepeat, withSequence } from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

interface EmergencyShowerProps {
  width?: number;
  height?: number;
}

export const EmergencyShower: React.FC<EmergencyShowerProps> = ({ width = 200, height = 300 }) => {
  const [active, setActive] = useState(false);
  const waterFlow = useSharedValue(0);

  const activateShower = () => {
    setActive(true);
    waterFlow.value = withSequence(
      withTiming(1, { duration: 500 }),
      withRepeat(withTiming(0.5, { duration: 1000 }), -1, true)
    );

    setTimeout(() => {
      setActive(false);
      waterFlow.value = withTiming(0, { duration: 500 });
    }, 5000);
  };

  const showerProps = useAnimatedProps(() => ({
    opacity: waterFlow.value
  }));

  const eyewashProps = useAnimatedProps(() => ({
    opacity: waterFlow.value * 0.8
  }));

  return (
    <Pressable onPress={activateShower}>
      <Svg width={width} height={height}>
        {/* Shower head */}
        <Circle cx="100" cy="50" r="20" fill="#333" />
        <Circle cx="100" cy="50" r="15" fill="#555" />

        {/* Shower arm */}
        <Rect x="98" y="50" width="4" height="100" fill="#444" />

        {/* Shower water */}
        <AnimatedG animatedProps={showerProps}>
          <Path
            d="M80 70 Q90 120, 100 150 Q110 120, 120 70"
            stroke="#2a9df4"
            strokeWidth="15"
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M70 90 Q85 140, 100 170 Q115 140, 130 90"
            stroke="#2a9df4"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
          />
        </AnimatedG>

        {/* Eyewash nozzles */}
        <Rect x="85" y="180" width="30" height="20" rx="5" fill="#555" />
        <Circle cx="90" cy="190" r="3" fill="#333" />
        <Circle cx="110" cy="190" r="3" fill="#333" />

        {/* Eyewash streams */}
        <AnimatedG animatedProps={eyewashProps}>
          <Path d="M90 190 Q90 230, 85 250" stroke="#2a9df4" strokeWidth="3" />
          <Path d="M110 190 Q110 230, 115 250" stroke="#2a9df4" strokeWidth="3" />
        </AnimatedG>

        {/* Activation handle */}
        <Path d="M120 200 L150 180 L150 220 Z" fill={active ? "#ff0000" : "#00ff00"} />
        <Text x="160" y="200" fill="black" fontSize="12">PULL</Text>

        {/* Drain */}
        <Rect x="70" y="270" width="60" height="5" rx="2" fill="#666" />
        <Path d="M70 270 L50 290 L130 290 L110 270 Z" fill="#aaa" />
      </Svg>
    </Pressable>
  );
};
