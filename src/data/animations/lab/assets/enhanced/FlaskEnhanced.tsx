// src/data/animations/lab/assets/enhanced/FlaskEnhanced.tsx

import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, {
  Path,
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
  Easing,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface FlaskEnhancedProps {
  size?: number;
  liquidLevel?: number; // 0-100
  liquidColor?: string;
  isHeating?: boolean;
  hasBubbles?: boolean;
  temperature?: number;
}

export const FlaskEnhanced: React.FC<FlaskEnhancedProps> = ({
  size = 120,
  liquidLevel = 40,
  liquidColor = '#81C784',
  isHeating = false,
  hasBubbles = false,
  temperature = 25
}) => {
  // Animation values
  const glowOpacity = useSharedValue(0);
  const glowScale = useSharedValue(1);

  // Bubble animations
  const bubble1Y = useSharedValue(0);
  const bubble2Y = useSharedValue(0);
  const bubble3Y = useSharedValue(0);
  const bubble4Y = useSharedValue(0);

  const bubble1Opacity = useSharedValue(0);
  const bubble2Opacity = useSharedValue(0);
  const bubble3Opacity = useSharedValue(0);
  const bubble4Opacity = useSharedValue(0);

  const level = size * 0.85 - (liquidLevel / 100) * size * 0.55;

  // Get liquid color based on heating/temperature
  const getActiveLiquidColor = () => {
    if (isHeating) {
      if (temperature > 80) return '#FFB74D'; // Hot orange
      if (temperature > 60) return '#FFA726'; // Warm orange
      return '#FF8A65'; // Light orange
    }
    return liquidColor;
  };

  const activeLiquidColor = getActiveLiquidColor();

  useEffect(() => {
    if (isHeating) {
      // Heating glow effect
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.4, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      glowScale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(1.1, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      glowOpacity.value = withTiming(0, { duration: 500 });
      glowScale.value = withTiming(1, { duration: 500 });
    }
  }, [isHeating]);

  useEffect(() => {
    if (hasBubbles) {
      // Float bubble animations with random movement
      bubble1Y.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(-40, { duration: 1500, easing: Easing.out(Easing.ease) })
        ),
        -1,
        false
      );
      bubble1Opacity.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(0.7, { duration: 200 }),
          withTiming(0.7, { duration: 1100 }),
          withTiming(0, { duration: 200 })
        ),
        -1,
        false
      );

      // Staggered bubble timings
      setTimeout(() => {
        bubble2Y.value = withRepeat(
          withSequence(
            withTiming(0, { duration: 0 }),
            withTiming(-35, { duration: 1300, easing: Easing.out(Easing.ease) })
          ),
          -1,
          false
        );
        bubble2Opacity.value = withRepeat(
          withSequence(
            withTiming(0, { duration: 0 }),
            withTiming(0.7, { duration: 200 }),
            withTiming(0.7, { duration: 900 }),
            withTiming(0, { duration: 200 })
          ),
          -1,
          false
        );
      }, 300);

      setTimeout(() => {
        bubble3Y.value = withRepeat(
          withSequence(
            withTiming(0, { duration: 0 }),
            withTiming(-42, { duration: 1800, easing: Easing.out(Easing.ease) })
          ),
          -1,
          false
        );
        bubble3Opacity.value = withRepeat(
          withSequence(
            withTiming(0, { duration: 0 }),
            withTiming(0.7, { duration: 200 }),
            withTiming(0.7, { duration: 1400 }),
            withTiming(0, { duration: 200 })
          ),
          -1,
          false
        );
      }, 600);

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
            withTiming(0.7, { duration: 200 }),
            withTiming(0.7, { duration: 1200 }),
            withTiming(0, { duration: 200 })
          ),
          -1,
          false
        );
      }, 900);
    } else {
      // Stop bubble animations
      bubble1Y.value = withTiming(0, { duration: 300 });
      bubble2Y.value = withTiming(0, { duration: 300 });
      bubble3Y.value = withTiming(0, { duration: 300 });
      bubble4Y.value = withTiming(0, { duration: 300 });

      bubble1Opacity.value = withTiming(0, { duration: 300 });
      bubble2Opacity.value = withTiming(0, { duration: 300 });
      bubble3Opacity.value = withTiming(0, { duration: 300 });
      bubble4Opacity.value = withTiming(0, { duration: 300 });
    }
  }, [hasBubbles]);

  // Animated properties
  const glowProps = useAnimatedProps(() => ({
    opacity: glowOpacity.value,
    r: (size * 0.25 + size * 0.1) * glowScale.value
  }));

  const bubble1Props = useAnimatedProps(() => ({
    cy: size * (0.7 - (liquidLevel / 100) * 0.55) + bubble1Y.value,
    opacity: bubble1Opacity.value
  }));

  const bubble2Props = useAnimatedProps(() => ({
    cy: size * (0.7 - (liquidLevel / 100) * 0.55) + bubble2Y.value,
    opacity: bubble2Opacity.value
  }));

  const bubble3Props = useAnimatedProps(() => ({
    cy: size * (0.7 - (liquidLevel / 100) * 0.55) + bubble3Y.value,
    opacity: bubble3Opacity.value
  }));

  const bubble4Props = useAnimatedProps(() => ({
    cy: size * (0.7 - (liquidLevel / 100) * 0.55) + bubble4Y.value,
    opacity: bubble4Opacity.value
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="flaskGlass" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#F5F5F5" stopOpacity="0.9" />
            <Stop offset="1" stopColor="#E0E0E0" stopOpacity="0.9" />
          </LinearGradient>

          <LinearGradient id="flaskLiquid" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={activeLiquidColor} stopOpacity="0.8" />
            <Stop offset="1" stopColor={activeLiquidColor} stopOpacity="0.5" />
          </LinearGradient>

          <LinearGradient id="flaskNeck" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#E0E0E0" stopOpacity="0.8" />
            <Stop offset="1" stopColor="#BDBDBD" stopOpacity="0.8" />
          </LinearGradient>
        </Defs>

        {/* Heating glow effect */}
        {isHeating && (
          <AnimatedCircle
            cx={size * 0.5}
            cy={size * 0.85}
            fill="#FF9800"
            animatedProps={glowProps}
          />
        )}

        {/* Flask body */}
        <Path
          d={`
            M ${size * 0.5} ${size * 0.85}
            C ${size * 0.7} ${size * 0.85},
              ${size * 0.85} ${size * 0.3},
              ${size * 0.8} ${size * 0.2}
            C ${size * 0.75} ${size * 0.1},
              ${size * 0.65} 0,
              ${size * 0.5} 0
            C ${size * 0.35} 0,
              ${size * 0.25} ${size * 0.1},
              ${size * 0.2} ${size * 0.2}
            C ${size * 0.15} ${size * 0.3},
              ${size * 0.3} ${size * 0.85},
              ${size * 0.5} ${size * 0.85}
            Z
          `}
          fill="url(#flaskGlass)"
          stroke="#757575"
          strokeWidth="1"
        />

        {/* Liquid */}
        <Path
          d={`
            M ${size * 0.5} ${size * 0.85}
            C ${size * 0.7} ${size * 0.85},
              ${size * 0.85} ${level + size * 0.1},
              ${size * 0.8} ${level}
            C ${size * 0.75} ${level - size * 0.05},
              ${size * 0.65} ${level - size * 0.1},
              ${size * 0.5} ${level - size * 0.1}
            C ${size * 0.35} ${level - size * 0.1},
              ${size * 0.25} ${level - size * 0.05},
              ${size * 0.2} ${level}
            C ${size * 0.15} ${level + size * 0.1},
              ${size * 0.3} ${size * 0.85},
              ${size * 0.5} ${size * 0.85}
            Z
          `}
          fill="url(#flaskLiquid)"
        />

        {/* Flask neck */}
        <Path
          d={`
            M ${size * 0.4} ${size * 0.05}
            L ${size * 0.4} ${size * 0.2}
            C ${size * 0.4} ${size * 0.25}, ${size * 0.6} ${size * 0.25}, ${size * 0.6} ${size * 0.2}
            L ${size * 0.6} ${size * 0.05}
            C ${size * 0.6} 0, ${size * 0.4} 0, ${size * 0.4} ${size * 0.05}
            Z
          `}
          fill="url(#flaskNeck)"
          stroke="#757575"
          strokeWidth="1"
        />

        {/* Measurement markings */}
        <G stroke="#78909C" strokeWidth="0.5">
          {[20, 40, 60, 80].map(markLevel => (
            <Path
              key={markLevel}
              d={`
                M ${size * 0.35} ${size * 0.85 - (markLevel / 100) * size * 0.55}
                C ${size * 0.4} ${size * 0.84 - (markLevel / 100) * size * 0.55},
                  ${size * 0.6} ${size * 0.84 - (markLevel / 100) * size * 0.55},
                  ${size * 0.65} ${size * 0.85 - (markLevel / 100) * size * 0.55}
              `}
              fill="none"
              stroke="#78909C"
              strokeWidth="0.5"
            />
          ))}
        </G>

        {/* Bubbles */}
        {hasBubbles && (
          <G>
            <AnimatedCircle
              cx={size * (0.45 + Math.random() * 0.1)}
              r={size * 0.015}
              fill="#FFFFFF"
              animatedProps={bubble1Props}
            />
            <AnimatedCircle
              cx={size * (0.45 + Math.random() * 0.1)}
              r={size * 0.018}
              fill="#FFFFFF"
              animatedProps={bubble2Props}
            />
            <AnimatedCircle
              cx={size * (0.45 + Math.random() * 0.1)}
              r={size * 0.012}
              fill="#FFFFFF"
              animatedProps={bubble3Props}
            />
            <AnimatedCircle
              cx={size * (0.45 + Math.random() * 0.1)}
              r={size * 0.016}
              fill="#FFFFFF"
              animatedProps={bubble4Props}
            />
          </G>
        )}

        {/* Glass reflection */}
        <Path
          d={`
            M ${size * 0.22} ${size * 0.25}
            C ${size * 0.25} ${size * 0.15}, ${size * 0.3} ${size * 0.1}, ${size * 0.35} ${size * 0.15}
            L ${size * 0.32} ${size * 0.75}
            C ${size * 0.28} ${size * 0.7}, ${size * 0.24} ${size * 0.5}, ${size * 0.22} ${size * 0.25}
            Z
          `}
          fill="#FFFFFF"
          opacity={0.3}
        />
      </Svg>
    </View>
  );
};
