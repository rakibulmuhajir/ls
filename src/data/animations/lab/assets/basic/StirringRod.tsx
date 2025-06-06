// src/data/animations/lab/assets/basic/StirringRod.tsx
import React from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

interface StirringRodProps {
  width?: number;
  height?: number;
}

export const StirringRod: React.FC<StirringRodProps> = ({ width = 10, height = 200 }) => {
  const rotation = useSharedValue(0);

  const animateStirring = () => {
    rotation.value = withRepeat(withTiming(360, { duration: 1000 }), -1, false);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }]
  }));

  return (
    <Pressable onPress={animateStirring}>
      <Animated.View style={[animatedStyle, { height }]}>
        <Svg width={width} height={height}>
          <Rect width={width} height={height} rx="5" fill="#d3d3d3" />
        </Svg>
      </Animated.View>
    </Pressable>
  );
};
