// src/data/animations/lab/assets/basic/PetriDish.tsx
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming } from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface PetriDishProps {
  width?: number;
  height?: number;
}

export const PetriDish: React.FC<PetriDishProps> = ({ width = 150, height = 150 }) => {
  const [growing, setGrowing] = useState(false);
  const crystalSize = useSharedValue(5);

  const growCrystals = () => {
    crystalSize.value = withTiming(20, { duration: 2000 });
    setGrowing(true);
  };

  const crystalProps = useAnimatedProps(() => ({ r: crystalSize.value }));

  return (
    <Pressable onPress={growCrystals}>
      <Svg width={width} height={height}>
        <Circle cx="75" cy="75" r="60" fill="#f0f0f0" stroke="#ccc" />

        {growing && (
          <G>
            <AnimatedCircle cx="60" cy="60" fill="#a5d8ff" animatedProps={crystalProps} />
            <AnimatedCircle cx="90" cy="70" fill="#a5d8ff" animatedProps={crystalProps} />
            <AnimatedCircle cx="70" cy="90" fill="#a5d8ff" animatedProps={crystalProps} />
          </G>
        )}

        <Circle cx="75" cy="75" r="55" fill="none" stroke="#aaa" strokeDasharray="5,5" />
      </Svg>
    </Pressable>
  );
};
