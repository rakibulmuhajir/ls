// src/data/animations/lab/assets/specialized/RingStand.tsx
import React, { useState } from 'react';
import { PanResponder, View } from 'react-native';
import Svg, { Rect, Circle, Text, G } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming } from 'react-native-reanimated';

const AnimatedG = Animated.createAnimatedComponent(G);

interface RingStandProps {
  width?: number;
  height?: number;
}

export const RingStand: React.FC<RingStandProps> = ({ width = 200, height = 250 }) => {
  const [height_pos, setHeight] = useState(50);
  const clampPosition = useSharedValue(100);

  const updateHeight = (newHeight: number) => {
    newHeight = Math.min(150, Math.max(50, newHeight));
    clampPosition.value = withTiming(newHeight, { duration: 300 });
    setHeight(newHeight);
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gesture) => {
      updateHeight(height_pos + gesture.dy / -2);
    }
  });

  const clampProps = useAnimatedProps(() => ({
    transform: [{ translateY: clampPosition.value }]
  }));

  return (
    <View {...panResponder.panHandlers}>
      <Svg width={width} height={height}>
        {/* Base */}
        <Rect x="50" y="220" width="100" height="20" rx="5" fill="#555" />

        {/* Rod */}
        <Rect x="95" y="50" width="10" height="170" fill="#777" />

        {/* Clamp */}
        <AnimatedG animatedProps={clampProps}>
          <Rect x="80" y="0" width="40" height="15" fill="#888" rx="3" />
          <Rect x="85" y="15" width="30" height="10" fill="#666" />
          <Circle cx="100" cy="5" r="5" fill="#aaa" />
        </AnimatedG>

        {/* Ring */}
        <Circle cx="100" cy={height_pos + 50} r="30" fill="none" stroke="#666" strokeWidth="5" />

        {/* Height indicator */}
        <Text x="150" y={height_pos + 50} fill="black" fontSize="12">
          {height_pos}mm
        </Text>
      </Svg>
    </View>
  );
};
