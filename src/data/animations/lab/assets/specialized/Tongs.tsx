// src/data/animations/lab/assets/specialized/Tongs.tsx
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Path, Circle, Text } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming } from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface TongsProps {
  width?: number;
  height?: number;
}

export const Tongs: React.FC<TongsProps> = ({ width = 200, height = 150 }) => {
  const [gripping, setGripping] = useState(false);
  const gripRotation = useSharedValue(0);

  const toggleGrip = () => {
    setGripping(!gripping);
    gripRotation.value = withTiming(gripping ? 0 : 15, { duration: 300 });
  };

  const leftArmProps = useAnimatedProps(() => ({
    transform: [{ rotate: `${-gripRotation.value}deg` }],
    transformOrigin: '100 50'
  }));

  const rightArmProps = useAnimatedProps(() => ({
    transform: [{ rotate: `${gripRotation.value}deg` }],
    transformOrigin: '100 50'
  }));

  return (
    <Pressable onPress={toggleGrip}>
      <Svg width={width} height={height}>
        {/* Handle */}
        <Path d="M90 30 L110 30 L110 50 L90 50 Z" fill="#666" />

        {/* Arms */}
        <AnimatedPath
          d="M90 50 L70 100 L80 110 L100 60 Z"
          fill="#888"
          stroke="#555"
          animatedProps={leftArmProps}
        />
        <AnimatedPath
          d="M110 50 L130 100 L120 110 L100 60 Z"
          fill="#888"
          stroke="#555"
          animatedProps={rightArmProps}
        />

        {/* Gripping object */}
        {gripping && (
          <Circle cx="100" cy="120" r="10" fill="#ff0000" />
        )}

        {/* Status text */}
        <Text x="100" y="30" textAnchor="middle" fill="black">
          {gripping ? "Gripping" : "Open"}
        </Text>
      </Svg>
    </Pressable>
  );
};
