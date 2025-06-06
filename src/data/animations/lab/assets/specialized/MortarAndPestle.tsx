// src/data/animations/lab/assets/specialized/MortarAndPestle.tsx
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Path, G, Text } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withRepeat, withTiming, Easing } from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

interface MortarAndPestleProps {
  width?: number;
  height?: number;
}

export const MortarAndPestle: React.FC<MortarAndPestleProps> = ({ width = 200, height = 200 }) => {
  const [grinding, setGrinding] = useState(false);
  const rotation = useSharedValue(0);
  const particleY = useSharedValue(0);

  const startGrinding = () => {
    setGrinding(true);
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
      -1, false
    );
    particleY.value = withRepeat(withTiming(10, { duration: 500 }), -1, true);

    setTimeout(() => {
      setGrinding(false);
      rotation.value = withTiming(0);
      particleY.value = 0;
    }, 3000);
  };

  const pestleProps = useAnimatedProps(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
    transformOrigin: '100 50'
  }));

  const particleProps = useAnimatedProps(() => ({
    transform: [{ translateY: particleY.value }]
  }));

  return (
    <Pressable onPress={startGrinding}>
      <Svg width={width} height={height}>
        {/* Mortar */}
        <Path
          d="M50 100 Q100 150, 150 100 L150 180 L50 180 Z"
          fill="#a0a0a0"
          stroke="#666"
        />

        {/* Pestle */}
        <AnimatedG animatedProps={pestleProps}>
          <Path
            d="M90 30 L110 30 L105 180 L95 180 Z"
            fill="#888"
            stroke="#555"
          />
          <Circle cx="100" cy="30" r="10" fill="#777" />
        </AnimatedG>

        {/* Particles */}
        {grinding && (
          <AnimatedG animatedProps={particleProps}>
            <Circle cx="80" cy="120" r="3" fill="#fff" opacity="0.7" />
            <Circle cx="120" cy="130" r="2" fill="#fff" opacity="0.5" />
            <Circle cx="100" cy="125" r="4" fill="#fff" opacity="0.9" />
          </AnimatedG>
        )}

        {/* Ground material */}
        <Path
          d="M60 150 Q100 130, 140 150 L140 170 L60 170 Z"
          fill="#d4a76a"
          opacity="0.7"
        />

        {/* Status text */}
        <Text x="100" y="30" textAnchor="middle" fill="black">
          {grinding ? "Grinding..." : "Press to Grind"}
        </Text>
      </Svg>
    </Pressable>
  );
};
