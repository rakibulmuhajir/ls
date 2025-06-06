// src/data/animations/lab/assets/safety/FumeHood.tsx
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Rect, Path, G, Defs, ClipPath, Circle } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming } from 'react-native-reanimated';

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedG = Animated.createAnimatedComponent(G);

interface FumeHoodProps {
  width?: number;
  height?: number;
}

export const FumeHood: React.FC<FumeHoodProps> = ({ width = 250, height = 250 }) => {
  const [open, setOpen] = useState(false);
  const doorPosition = useSharedValue(0);
  const vaporOpacity = useSharedValue(0);

  const toggleDoor = () => {
    setOpen(!open);
    doorPosition.value = withTiming(open ? 0 : -100, { duration: 1000 });
    vaporOpacity.value = withTiming(open ? 0 : 0.8, { duration: 2000 });
  };

  const doorProps = useAnimatedProps(() => ({
    transform: [{ translateX: doorPosition.value }]
  }));

  const vaporProps = useAnimatedProps(() => ({
    opacity: vaporOpacity.value
  }));

  return (
    <Pressable onPress={toggleDoor}>
      <Svg width={width} height={height}>
        <Defs>
          <ClipPath id="hoodClip">
            <Rect x="50" y="50" width="150" height="150" rx="5" />
          </ClipPath>
        </Defs>

        {/* Hood structure */}
        <Rect x="40" y="40" width="170" height="170" fill="#ddd" rx="5" />

        {/* Interior */}
        <Rect x="50" y="50" width="150" height="150" fill="#333" rx="5" />

        {/* Vapor effect */}
        <AnimatedG animatedProps={vaporProps} clipPath="url(#hoodClip)">
          <Path
            d="M60 100 Q80 80, 100 100 Q120 120, 140 100 Q160 80, 180 100"
            stroke="#a0a0ff"
            strokeWidth="3"
            fill="none"
          />
          <Path
            d="M70 130 Q90 110, 110 130 Q130 150, 150 130 Q170 110, 190 130"
            stroke="#a0a0ff"
            strokeWidth="3"
            fill="none"
          />
          <Circle cx="100" cy="120" r="10" fill="#a0a0ff55" />
          <Circle cx="150" cy="90" r="15" fill="#a0a0ff55" />
        </AnimatedG>

        {/* Sliding door */}
        <AnimatedRect
          x="150"
          y="50"
          width="100"
          height="150"
          fill="#a0a0a0"
          opacity="0.8"
          rx="5"
          animatedProps={doorProps}
        />

        {/* Door handle */}
        <Circle cx="160" cy="125" r="5" fill="#666" />

        {/* Status indicator */}
        <Circle cx="220" cy="30" r="10" fill={open ? "#f00" : "#0f0"} />
      </Svg>
    </Pressable>
  );
};
