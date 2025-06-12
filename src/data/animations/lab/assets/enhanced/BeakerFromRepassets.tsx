// src/data/animations/lab/assets/enhanced/BeakerFromRepassets.tsx

import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, {
  Path,
  Rect,
  Defs,
  LinearGradient,
  Stop,
  G,
  Circle
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  withSequence,
  interpolateColor,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

interface BeakerFromRepassetsProps {
  size?: number;
  liquidLevel?: number; // 0-100
  liquidColor?: string;
  hasBubbles?: boolean;
  temperature?: number; // 0-100
  isBoiling?: boolean;  // Component now just receives a boolean
}

export const BeakerFromRepassets: React.FC<BeakerFromRepassetsProps> = ({
  size = 120,
  liquidLevel = 30,
  liquidColor = 'rgba(173, 216, 230, 0.7)', // Default color
  isBoiling = false,
  hasBubbles = false,
  temperature = 20
}) => {
  // Animation values for bubbles
  const bubble1Y = useSharedValue(0);
  const bubble2Y = useSharedValue(0);
  const bubble3Y = useSharedValue(0);
  const bubble4Y = useSharedValue(0);
  const bubble5Y = useSharedValue(0);

  const bubble1Opacity = useSharedValue(0);
  const bubble2Opacity = useSharedValue(0);
  const bubble3Opacity = useSharedValue(0);
  const bubble4Opacity = useSharedValue(0);
  const bubble5Opacity = useSharedValue(0);

  const level = size * 0.9 - (liquidLevel / 100) * size * 0.6;

  useEffect(() => {
    cancelAnimation(bubbleY);
    cancelAnimation(bubbleOpacity);

    if (isBoiling) {
      const duration = 2500; // A fixed duration is fine, or could be a prop
      bubbleY.value = withRepeat(withTiming(-size * 0.6, { duration, easing: Easing.in(Easing.ease) }), -1, false);
      bubbleOpacity.value = withRepeat(withSequence(
          withTiming(0.7, { duration: duration * 0.1 }),
          withTiming(0.7, { duration: duration * 0.8 }),
          withTiming(0, { duration: duration * 0.1 })
      ), -1, false);
    } else {
      bubbleY.value = 0;
      bubbleOpacity.value = 0;
    }
  }, [isBoiling, size, bubbleY, bubbleOpacity]);

  // Get liquid color based on temperature
  const getLiquidColor = () => {
    if (liquidColor) return liquidColor;

    if (temperature < 30) return '#64B5F6'; // Cool blue
    if (temperature < 60) return '#4DB6AC'; // Medium teal
    if (temperature < 80) return '#FFB74D'; // Warm orange
    return '#E57373'; // Hot red
  };

  const liquidFill = getLiquidColor();

  // Bubble animations
  useEffect(() => {
    if (hasBubbles) {
      // Bubble 1
      bubble1Y.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(-30, { duration: 2000, easing: Easing.out(Easing.ease) })
        ),
        -1,
        false
      );
      bubble1Opacity.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(0.7, { duration: 300 }),
          withTiming(0.7, { duration: 1400 }),
          withTiming(0, { duration: 300 })
        ),
        -1,
        false
      );

      // Bubble 2 (offset timing)
      setTimeout(() => {
        bubble2Y.value = withRepeat(
          withSequence(
            withTiming(0, { duration: 0 }),
            withTiming(-35, { duration: 1800, easing: Easing.out(Easing.ease) })
          ),
          -1,
          false
        );
        bubble2Opacity.value = withRepeat(
          withSequence(
            withTiming(0, { duration: 0 }),
            withTiming(0.7, { duration: 300 }),
            withTiming(0.7, { duration: 1200 }),
            withTiming(0, { duration: 300 })
          ),
          -1,
          false
        );
      }, 400);

      // Bubble 3
      setTimeout(() => {
        bubble3Y.value = withRepeat(
          withSequence(
            withTiming(0, { duration: 0 }),
            withTiming(-32, { duration: 2200, easing: Easing.out(Easing.ease) })
          ),
          -1,
          false
        );
        bubble3Opacity.value = withRepeat(
          withSequence(
            withTiming(0, { duration: 0 }),
            withTiming(0.7, { duration: 300 }),
            withTiming(0.7, { duration: 1600 }),
            withTiming(0, { duration: 300 })
          ),
          -1,
          false
        );
      }, 800);

      // Bubble 4
      setTimeout(() => {
        bubble4Y.value = withRepeat(
          withSequence(
            withTiming(0, { duration: 0 }),
            withTiming(-38, { duration: 1600, easing: Easing.out(Easing.ease) })
          ),
          -1,
          false
        );
        bubble4Opacity.value = withRepeat(
          withSequence(
            withTiming(0, { duration: 0 }),
            withTiming(0.7, { duration: 300 }),
            withTiming(0.7, { duration: 1000 }),
            withTiming(0, { duration: 300 })
          ),
          -1,
          false
        );
      }, 1200);

      // Bubble 5
      setTimeout(() => {
        bubble5Y.value = withRepeat(
          withSequence(
            withTiming(0, { duration: 0 }),
            withTiming(-28, { duration: 2400, easing: Easing.out(Easing.ease) })
          ),
          -1,
          false
        );
        bubble5Opacity.value = withRepeat(
          withSequence(
            withTiming(0, { duration: 0 }),
            withTiming(0.7, { duration: 300 }),
            withTiming(0.7, { duration: 1800 }),
            withTiming(0, { duration: 300 })
          ),
          -1,
          false
        );
      }, 1600);
    } else {
      // Stop all bubble animations
      bubble1Y.value = withTiming(0, { duration: 300 });
      bubble2Y.value = withTiming(0, { duration: 300 });
      bubble3Y.value = withTiming(0, { duration: 300 });
      bubble4Y.value = withTiming(0, { duration: 300 });
      bubble5Y.value = withTiming(0, { duration: 300 });

      bubble1Opacity.value = withTiming(0, { duration: 300 });
      bubble2Opacity.value = withTiming(0, { duration: 300 });
      bubble3Opacity.value = withTiming(0, { duration: 300 });
      bubble4Opacity.value = withTiming(0, { duration: 300 });
      bubble5Opacity.value = withTiming(0, { duration: 300 });
    }
  }, [hasBubbles]);

  // Animated bubble props
  const bubble1Props = useAnimatedProps(() => ({
    cy: size * (0.8 - (liquidLevel / 100) * 0.6) + bubble1Y.value,
    opacity: bubble1Opacity.value
  }));

  const bubble2Props = useAnimatedProps(() => ({
    cy: size * (0.8 - (liquidLevel / 100) * 0.6) + bubble2Y.value,
    opacity: bubble2Opacity.value
  }));

  const bubble3Props = useAnimatedProps(() => ({
    cy: size * (0.8 - (liquidLevel / 100) * 0.6) + bubble3Y.value,
    opacity: bubble3Opacity.value
  }));

  const bubble4Props = useAnimatedProps(() => ({
    cy: size * (0.8 - (liquidLevel / 100) * 0.6) + bubble4Y.value,
    opacity: bubble4Opacity.value
  }));

  const bubble5Props = useAnimatedProps(() => ({
    cy: size * (0.8 - (liquidLevel / 100) * 0.6) + bubble5Y.value,
    opacity: bubble5Opacity.value
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="glassGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#E0E0E0" stopOpacity="0.8" />
            <Stop offset="1" stopColor="#BDBDBD" stopOpacity="0.8" />
          </LinearGradient>

          <LinearGradient id="liquidGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={liquidFill} stopOpacity="0.9" />
            <Stop offset="1" stopColor={liquidFill} stopOpacity="0.6" />
          </LinearGradient>
        </Defs>

        {/* Beaker outline */}
        <Path
          d={`
            M ${size * 0.3} ${size * 0.9}
            L ${size * 0.25} ${size * 0.1}
            C ${size * 0.25} ${size * 0.05}, ${size * 0.3} 0, ${size * 0.35} 0
            L ${size * 0.65} 0
            C ${size * 0.7} 0, ${size * 0.75} ${size * 0.05}, ${size * 0.75} ${size * 0.1}
            L ${size * 0.7} ${size * 0.9}
            Z
          `}
          fill="url(#glassGradient)"
          stroke="#757575"
          strokeWidth="1"
        />

        {/* Liquid */}
        <Path
          d={`
            M ${size * 0.3} ${size * 0.9}
            L ${size * 0.3} ${level}
            C ${size * 0.3} ${level - size * 0.05},
              ${size * 0.7} ${level - size * 0.05},
              ${size * 0.7} ${level}
            L ${size * 0.7} ${size * 0.9}
            Z
          `}
          fill="url(#liquidGradient)"
        />

        {/* Measurement markings */}
        <G stroke="#78909C" strokeWidth="0.5">
          {[10, 30, 50, 70, 90].map(markLevel => (
            <Rect
              key={markLevel}
              x={size * 0.28}
              y={size * 0.9 - (markLevel / 100) * size * 0.6}
              width={size * 0.44}
              height="0.5"
            />
          ))}
        </G>

        {/* Bubbles */}
        {hasBubbles && (
          <G>
            <AnimatedCircle
              cx={size * 0.4}
              r={size * 0.015}
              fill="#FFFFFF"
              animatedProps={bubble1Props}
            />
            <AnimatedCircle
              cx={size * 0.45}
              r={size * 0.018}
              fill="#FFFFFF"
              animatedProps={bubble2Props}
            />
            <AnimatedCircle
              cx={size * 0.5}
              r={size * 0.012}
              fill="#FFFFFF"
              animatedProps={bubble3Props}
            />
            <AnimatedCircle
              cx={size * 0.55}
              r={size * 0.02}
              fill="#FFFFFF"
              animatedProps={bubble4Props}
            />
            <AnimatedCircle
              cx={size * 0.6}
              r={size * 0.014}
              fill="#FFFFFF"
              animatedProps={bubble5Props}
            />
          </G>
        )}

        {/* Beaker base */}
        <Rect
          x={size * 0.25}
          y={size * 0.9}
          width={size * 0.5}
          height={size * 0.03}
          fill="#616161"
          rx={size * 0.01}
        />

        {/* Glass highlight */}
        <Rect
          x={size * 0.32}
          y={size * 0.02}
          width={size * 0.03}
          height={size * 0.85}
          fill="#FFFFFF"
          opacity={0.3}
          rx={size * 0.01}
        />
      </Svg>
    </View>
  );
};
