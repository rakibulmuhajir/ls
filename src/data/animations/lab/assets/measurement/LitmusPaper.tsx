// src/data/animations/lab/assets/measurement/LitmusPaper.tsx
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Rect, Path, Text } from 'react-native-svg';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface LitmusPaperProps {
  width?: number;
  height?: number;
}

export const LitmusPaper: React.FC<LitmusPaperProps> = ({ width = 150, height = 200 }) => {
  const [isAcid, setIsAcid] = useState(false);
  const color = useSharedValue('#0000ff'); // blue for base

  const testSolution = () => {
    setIsAcid(prev => {
      const newIsAcid = !prev;
      color.value = withTiming(newIsAcid ? '#ff0000' : '#0000ff', { duration: 1000 });
      return newIsAcid;
    });
  };

  const paperProps = useSharedValue(() => ({ fill: color.value }));

  return (
    <Pressable onPress={testSolution}>
      <Svg width={width} height={height}>
        {/* Beaker */}
        <Path d="M50 50 L100 50 L110 150 L40 150 Z" fill="#aaccff55" stroke="#555" />

        {/* Liquid */}
        <Path d="M50 100 L100 100 L110 150 L40 150 Z"
              fill={isAcid ? "#ff000055" : "#0000ff55"} />

        {/* Litmus paper */}
        <Rect x="70" y="40" width="10" height="80" fill="#f0f0f0" rx="2" />

        {/* Tested part (bottom of paper) */}
        <AnimatedRect
          x="70"
          y="100"
          width="10"
          height="20"
          rx="2"
          animatedProps={paperProps}
        />

        {/* Label */}
        <Text x="75" y="25" textAnchor="middle" fontSize="12" fill="#333">
          {isAcid ? "ACID" : "BASE"}
        </Text>
        <Text x="75" y={height - 10} textAnchor="middle" fontSize="10" fill="#666">
          Tap to test
        </Text>
      </Svg>
    </Pressable>
  );
};
