// src/data/animations/lab/assets/heating/IceBath.tsx
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Rect, Circle, Path, Defs, ClipPath, LinearGradient, Stop } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withRepeat, withTiming, Easing } from 'react-native-reanimated';

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface IceBathProps {
  width?: number;
  height?: number;
}

export const IceBath: React.FC<IceBathProps> = ({ width = 200, height = 200 }) => {
  const y1 = useSharedValue(0);
  const y2 = useSharedValue(0);
  const y3 = useSharedValue(0);
  const rotate = useSharedValue(0);
  const drop1 = useSharedValue(0);
  const drop2 = useSharedValue(0);
  const drop3 = useSharedValue(0);

  useEffect(() => {
    // Ice cubes floating animation
    y1.value = withRepeat(withTiming(10, { duration: 3000, easing: Easing.inOut(Easing.ease) }), -1, true);
    y2.value = withRepeat(withTiming(10, { duration: 3500, easing: Easing.inOut(Easing.ease) }), -1, true);
    y3.value = withRepeat(withTiming(10, { duration: 4000, easing: Easing.inOut(Easing.ease) }), -1, true);

    rotate.value = withRepeat(withTiming(10, { duration: 10000, easing: Easing.linear }), -1, true);

    // Condensation drops
    drop1.value = withRepeat(withTiming(1, { duration: 5000 }), -1, false);
    drop2.value = withRepeat(withTiming(1, { duration: 7000 }), -1, false);
    drop3.value = withRepeat(withTiming(1, { duration: 6000 }), -1, false);
  }, []);

  const ice1Props = useAnimatedProps(() => ({ y: 80 + y1.value, rotation: rotate.value }));
  const ice2Props = useAnimatedProps(() => ({ y: 100 + y2.value, rotation: rotate.value }));
  const ice3Props = useAnimatedProps(() => ({ y: 70 + y3.value, rotation: rotate.value }));

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#a5d8ff" />
            <Stop offset="1" stopColor="#4da6ff" />
          </LinearGradient>
          <ClipPath id="bathClip">
            <Rect x="40" y="50" width="120" height="120" rx="5" />
          </ClipPath>
        </Defs>

        {/* Bath container */}
        <Rect x="40" y="50" width="120" height="120" rx="5" fill="#e0f7ff" stroke="#aaa" />

        {/* Water */}
        <Rect x="40" y="80" width="120" height="90" fill="url(#waterGradient)" clipPath="url(#bathClip)" />

        {/* Floating ice cubes */}
        <AnimatedRect x="60" width="20" height="20" rx="3" fill="#e6f7ff" stroke="#99d6ff" animatedProps={ice1Props} />
        <AnimatedRect x="100" width="20" height="20" rx="3" fill="#e6f7ff" stroke="#99d6ff" animatedProps={ice2Props} />
        <AnimatedRect x="140" width="20" height="20" rx="3" fill="#e6f7ff" stroke="#99d6ff" animatedProps={ice3Props} />

        {/* Condensation drops */}
        <AnimatedCircle cx="45" cy="60" r="3" fill="#aaa" opacity={drop1} />
        <AnimatedCircle cx="65" cy="55" r="2" fill="#aaa" opacity={drop2} />
        <AnimatedCircle cx="55" cy="65" r="3" fill="#aaa" opacity={drop3} />
      </Svg>
    </View>
  );
};
