import React from 'react';
import Svg, { Circle, G, Line } from 'react-native-svg';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedProps,
  withRepeat,
  Easing
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface HydrogenProps {
  size: number;
  state: 'solid' | 'liquid' | 'gas';
  temperature: number;
}

export const HydrogenMoleculeSVG: React.FC<HydrogenProps> = ({
  size,
  state,
  temperature
}) => {
  const vibration = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Animate based on state and temperature
  React.useEffect(() => {
    const intensity = Math.min(1, temperature / 100);
    vibration.value = withRepeat(
      withTiming(intensity, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease)
      }),
      -1,
      true
    );
    opacity.value = withTiming(state === 'gas' ? 0.8 : 1, {
      duration: 500
    });
  }, [state, temperature]);

  const animatedOpacity = useAnimatedProps(() => ({
    opacity: opacity.value
  }));

  const animatedProps1 = useAnimatedProps<{cx: string, cy: string}>(() => {
    const pos = 50 + vibration.value * 2;
    return {
      cx: pos.toString(),
      cy: pos.toString()
    };
  });

  const animatedProps2 = useAnimatedProps<{cx: string, cy: string}>(() => {
    const pos = 50 - vibration.value * 2;
    return {
      cx: pos.toString(),
      cy: pos.toString()
    };
  });

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* H2 Molecule */}
      <G animatedProps={animatedOpacity}>
        <AnimatedCircle
          cx={50}
          cy={50}
          r={15}
          fill="#FF6B6B"
          animatedProps={animatedProps1}
        />
        <AnimatedCircle
          cx={50}
          cy={50}
          r={15}
          fill="#FF6B6B"
          animatedProps={animatedProps2}
        />
        <Line
          x1={50}
          y1={50}
          x2={50}
          y2={50}
          stroke="#FF6B6B"
          strokeWidth={3}
        />
      </G>
    </Svg>
  );
};
