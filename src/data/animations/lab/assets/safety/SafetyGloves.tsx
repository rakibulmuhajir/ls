// src/data/animations/lab/assets/safety/SafetyGloves.tsx
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming } from 'react-native-reanimated';

const AnimatedG = Animated.createAnimatedComponent(G);

interface SafetyGlovesProps {
  width?: number;
  height?: number;
}

export const SafetyGloves: React.FC<SafetyGlovesProps> = ({ width = 200, height = 200 }) => {
  const [gloved, setGloved] = useState(false);
  const handPosition = useSharedValue(100);

  const toggleGloves = () => {
    setGloved(!gloved);
    handPosition.value = withTiming(gloved ? 100 : 0, { duration: 500 });
  };

  const handProps = useAnimatedProps(() => ({
    transform: [{ translateY: handPosition.value }]
  }));

  return (
    <Pressable onPress={toggleGloves}>
      <Svg width={width} height={height}>
        {/* Left glove */}
        <Path
          d="M50 50 Q40 80, 50 110 Q70 130, 90 120 Q100 90, 80 70 Q70 50, 50 50 Z"
          fill={gloved ? "#00aaff" : "#f0f0f0"}
          stroke="#666"
        />

        {/* Right glove */}
        <Path
          d="M150 50 Q160 80, 150 110 Q130 130, 110 120 Q100 90, 120 70 Q130 50, 150 50 Z"
          fill={gloved ? "#00aaff" : "#f0f0f0"}
          stroke="#666"
        />

        {/* Hands (animated insertion) */}
        <AnimatedG animatedProps={handProps}>
          {/* Left hand */}
          <Path
            d="M70 80 Q65 100, 70 120 Q85 140, 95 130 Q100 110, 90 95 Q80 85, 70 80 Z"
            fill="#ffcc99"
          />

          {/* Right hand */}
          <Path
            d="M130 80 Q135 100, 130 120 Q115 140, 105 130 Q100 110, 110 95 Q120 85, 130 80 Z"
            fill="#ffcc99"
          />
        </AnimatedG>
      </Svg>
    </Pressable>
  );
};
