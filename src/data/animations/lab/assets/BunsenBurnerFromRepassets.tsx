// src/data/animations/lab/assets/enhanced/BunsenBurnerFromRepassets.tsx

import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, {
  Rect,
  Circle,
  Path,
  Defs,
  LinearGradient,
  Stop,
  G
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface BunsenBurnerFromRepassetsProps {
  size?: number;
  isActive?: boolean;
  intensity?: number; // 0-100
  flameColor?: string;
}

export const BunsenBurnerFromRepassets: React.FC<BunsenBurnerFromRepassetsProps> = ({
  size = 100,
  isActive = false,
  intensity = 50,
  flameColor = '#FF5722'
}) => {
  // Animation values
  const flameScale = useSharedValue(1);
  const flameRotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const glowScale = useSharedValue(1);

  const flameHeight = size * (0.2 + (intensity / 100) * 0.4);

  useEffect(() => {
    if (isActive) {
      // Flickering flame animation
      flameScale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 150, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.05, { duration: 150, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      // Flame rotation for natural movement
      flameRotation.value = withRepeat(
        withSequence(
          withTiming(-1, { duration: 300, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      // Glow effect
      glowOpacity.value = withTiming(0.3 + (intensity / 100) * 0.3, { duration: 300 });
      glowScale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(1.1, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      // Reset animations
      flameScale.value = withTiming(1, { duration: 300 });
      flameRotation.value = withTiming(0, { duration: 300 });
      glowOpacity.value = withTiming(0, { duration: 300 });
      glowScale.value = withTiming(1, { duration: 300 });
    }
  }, [isActive, intensity]);

  // Animated flame properties
  const animatedFlameProps = useAnimatedProps(() => ({
    transform: [
      { scale: flameScale.value },
      { rotate: `${flameRotation.value}deg` }
    ],
    opacity: isActive ? 0.8 : 0
  }));

  // Animated glow properties
  const animatedGlowProps = useAnimatedProps(() => ({
    opacity: glowOpacity.value,
    r: (size * 0.2 + (intensity / 100) * size * 0.1) * glowScale.value
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="burnerGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#424242" stopOpacity="0.8" />
            <Stop offset="1" stopColor="#757575" stopOpacity="0.8" />
          </LinearGradient>

          <LinearGradient id="flameGradient" x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0" stopColor="#1E88E5" />
            <Stop offset="0.3" stopColor={flameColor} />
            <Stop offset="0.7" stopColor="#FFD700" />
            <Stop offset="1" stopColor="#FF6B35" />
          </LinearGradient>
        </Defs>

        {/* Flame glow effect */}
        {isActive && (
          <AnimatedCircle
            cx={size * 0.5}
            cy={size * 0.6}
            fill={flameColor}
            animatedProps={animatedGlowProps}
          />
        )}

        {/* Burner base */}
        <G opacity={0.8}>
          <Rect
            x={size * 0.25}
            y={size * 0.7}
            width={size * 0.5}
            height={size * 0.05}
            fill="#424242"
            rx={size * 0.01}
          />
          <Rect
            x={size * 0.3}
            y={size * 0.65}
            width={size * 0.4}
            height={size * 0.05}
            fill="#616161"
            rx={size * 0.01}
          />
          <Circle
            cx={size * 0.5}
            cy={size * 0.6}
            r={size * 0.15}
            fill="url(#burnerGradient)"
          />
        </G>

        {/* Main flame */}
        {isActive && (
          <AnimatedPath
            d={`
              M ${size * 0.3} ${size * 0.7}
              C ${size * 0.25} ${size * 0.7 - flameHeight},
                ${size * 0.4} ${size * 0.7 - flameHeight},
                ${size * 0.5} ${size * 0.7 - flameHeight}
              C ${size * 0.6} ${size * 0.7 - flameHeight},
                ${size * 0.75} ${size * 0.7 - flameHeight},
                ${size * 0.7} ${size * 0.7}
              Z
            `}
            fill="url(#flameGradient)"
            animatedProps={animatedFlameProps}
          />
        )}

        {/* Burner details */}
        <Circle
          cx={size * 0.5}
          cy={size * 0.6}
          r={size * 0.1}
          fill="#9E9E9E"
        />
        <Circle
          cx={size * 0.5}
          cy={size * 0.6}
          r={size * 0.05}
          fill="#BDBDBD"
        />

        {/* Gas control valve */}
        <Rect
          x={size * 0.45}
          y={size * 0.75}
          width={size * 0.1}
          height={size * 0.02}
          fill="#757575"
          rx={size * 0.01}
        />
      </Svg>
    </View>
  );
};
