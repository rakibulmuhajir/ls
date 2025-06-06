// src/data/animations/lab/assets/safety/FireExtinguisher.tsx
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Rect, Path, Circle, G } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withSequence, withTiming, withRepeat } from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

interface FireExtinguisherProps {
  width?: number;
  height?: number;
}

export const FireExtinguisher: React.FC<FireExtinguisherProps> = ({ width = 150, height = 250 }) => {
  const [active, setActive] = useState(false);
  const sprayOpacity = useSharedValue(0);
  const pressure = useSharedValue(100);

  const activateExtinguisher = () => {
    if (!active) {
      setActive(true);

      sprayOpacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withRepeat(
          withSequence(
            withTiming(0.8, { duration: 300 }),
            withTiming(1, { duration: 300 })
          ), 5, true
        ),
        withTiming(0, { duration: 500 })
      );

      pressure.value = withSequence(
        withTiming(0, { duration: 2000 }),
        withTiming(100, { duration: 1000 })
      );

      setTimeout(() => setActive(false), 4000);
    }
  };

  const sprayProps = useAnimatedProps(() => ({
    opacity: sprayOpacity.value
  }));

  const gaugeProps = useAnimatedProps(() => ({
    strokeDashoffset: 100 - pressure.value
  }));

  return (
    <Pressable onPress={activateExtinguisher}>
      <Svg width={width} height={height}>
        {/* Body */}
        <Rect x="50" y="50" width="50" height="150" rx="5" fill="#ff0000" />

        {/* Handle */}
        <Path d="M70 30 L70 50 L80 50 L80 30 Z" fill="#444" />
        <Circle cx="75" cy="40" r="10" fill="#444" />

        {/* Hose */}
        <Path
          d="M100 100 Q120 80, 140 100 Q160 120, 180 110"
          stroke="#333"
          strokeWidth="5"
          fill="none"
        />

        {/* Nozzle */}
        <Rect x="175" y="105" width="15" height="10" rx="3" fill="#555" />

        {/* Spray */}
        <AnimatedG animatedProps={sprayProps}>
          <Path
            d="M190 100 Q200 90, 210 100 Q220 110, 230 100"
            stroke="#ffcc00"
            strokeWidth="5"
            fill="none"
          />
          <Circle cx="220" cy="95" r="8" fill="#ff9900" opacity="0.7" />
          <Circle cx="240" cy="105" r="10" fill="#ff5500" opacity="0.6" />
        </AnimatedG>

        {/* Pressure gauge */}
        <Circle cx="100" cy="80" r="15" fill="#000" stroke="#fff" strokeWidth="2" />
        <AnimatedPath
          d="M100 65 L100 75"
          stroke="#0f0"
          strokeWidth="3"
          strokeDasharray="100"
          strokeDashoffset="100"
          animatedProps={gaugeProps}
          transform="rotate(-90 100 80)"
        />

        {/* Safety pin */}
        {!active && (
          <Path d="M65 40 L85 40" stroke="#ff0" strokeWidth="3" />
        )}
      </Svg>
    </Pressable>
  );
};
