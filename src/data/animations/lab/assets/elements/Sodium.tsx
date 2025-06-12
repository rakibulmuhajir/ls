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

interface SodiumProps {
  size: number;
  state: 'solid' | 'liquid' | 'gas';
  temperature: number;
}

export const SodiumCrystalSVG: React.FC<SodiumProps> = ({
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

  const animatedProps = useAnimatedProps<{cx: string, cy: string}>(() => {
    const pos = 50 + vibration.value * 2;
    return {
      cx: pos.toString(),
      cy: pos.toString()
    };
  });

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Sodium Crystal Structure */}
      <G animatedProps={animatedOpacity}>
        <AnimatedCircle
          cx={50}
          cy={50}
          r={25}
          fill="#FFA000"
          animatedProps={animatedProps}
        />
        {/* Crystal structure lines */}
        <Line
          x1={50}
          y1={25}
          x2={50}
          y2={75}
          stroke="#FFD600"
          strokeWidth={2}
        />
        <Line
          x1={25}
          y1={50}
          x2={75}
          y2={50}
          stroke="#FFD600"
          strokeWidth={2}
        />
        <Line
          x1={35}
          y1={35}
          x2={65}
          y2={65}
          stroke="#FFD600"
          strokeWidth={2}
        />
        <Line
          x1={65}
          y1={35}
          x2={35}
          y2={65}
          stroke="#FFD600"
          strokeWidth={2}
        />
      </G>
    </Svg>
  );
};
