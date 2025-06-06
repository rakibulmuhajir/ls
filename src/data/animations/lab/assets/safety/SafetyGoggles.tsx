// src/data/animations/lab/assets/safety/SafetyGoggles.tsx

import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, {
  Path,
  G,
  Defs,
  RadialGradient,
  Stop,
  LinearGradient,
  Ellipse
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

interface SafetyGogglesProps {
  width?: number;
  height?: number;
  lensColor?: string;
  isWorn?: boolean;
}

export const SafetyGoggles: React.FC<SafetyGogglesProps> = ({
  width = 200,
  height = 100,
  lensColor = '#a0d0ff',
  isWorn = false
}) => {
  const reflectionPos = useSharedValue(0);
  const blinkOpacity = useSharedValue(1);

  useEffect(() => {
    // Reflection animation
    reflectionPos.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.linear }),
      -1,
      true
    );

    // Occasional blink effect when worn
    if (isWorn) {
      blinkOpacity.value = withRepeat(
        withTiming(0.3, { duration: 150 }),
        -1,
        true
      );
    }
  }, [isWorn]);

  const leftReflectionProps = useAnimatedProps(() => ({
    transform: [{ translateX: reflectionPos.value * 30 - 15 }]
  }));

  const rightReflectionProps = useAnimatedProps(() => ({
    transform: [{ translateX: reflectionPos.value * 30 - 15 }]
  }));

  const lensOpacityProps = useAnimatedProps(() => ({
    opacity: isWorn ? blinkOpacity.value : 1
  }));

  const centerX = width / 2;
  const centerY = height / 2;
  const lensWidth = width * 0.25;
  const lensHeight = height * 0.6;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <RadialGradient id="goggleLens" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={lensColor} stopOpacity="0.7" />
            <Stop offset="70%" stopColor={lensColor} stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#5aa0e0" stopOpacity="0.9" />
          </RadialGradient>

          <LinearGradient id="goggleFrame" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#f0f0f0" />
            <Stop offset="50%" stopColor="#e0e0e0" />
            <Stop offset="100%" stopColor="#c0c0c0" />
          </LinearGradient>

          <LinearGradient id="reflection" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
          </LinearGradient>

          <RadialGradient id="strap" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#333333" />
            <Stop offset="100%" stopColor="#1a1a1a" />
          </RadialGradient>
        </Defs>

        {/* Elastic strap */}
        <Path
          d={`M${width * 0.1} ${centerY}
              Q${width * 0.05} ${centerY - 15}, ${width * 0.15} ${centerY - 10}
              Q${width * 0.25} ${centerY - 8}, ${width * 0.35} ${centerY - 5}`}
          stroke="url(#strap)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d={`M${width * 0.65} ${centerY - 5}
              Q${width * 0.75} ${centerY - 8}, ${width * 0.85} ${centerY - 10}
              Q${width * 0.95} ${centerY - 15}, ${width * 0.9} ${centerY}`}
          stroke="url(#strap)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />

        {/* Frame outer border */}
        <Path
          d={`M${centerX - lensWidth * 1.8} ${centerY - lensHeight * 0.7}
              Q${centerX - lensWidth * 1.5} ${centerY - lensHeight * 1.1},
              ${centerX - lensWidth * 0.8} ${centerY - lensHeight * 0.9}
              Q${centerX - lensWidth * 0.3} ${centerY - lensHeight * 0.8},
              ${centerX} ${centerY - lensHeight * 0.7}
              Q${centerX + lensWidth * 0.3} ${centerY - lensHeight * 0.8},
              ${centerX + lensWidth * 0.8} ${centerY - lensHeight * 0.9}
              Q${centerX + lensWidth * 1.5} ${centerY - lensHeight * 1.1},
              ${centerX + lensWidth * 1.8} ${centerY - lensHeight * 0.7}
              Q${centerX + lensWidth * 1.9} ${centerY + lensHeight * 0.8},
              ${centerX + lensWidth * 1.5} ${centerY + lensHeight * 1.2}
              Q${centerX} ${centerY + lensHeight * 1.4},
              ${centerX - lensWidth * 1.5} ${centerY + lensHeight * 1.2}
              Q${centerX - lensWidth * 1.9} ${centerY + lensHeight * 0.8},
              ${centerX - lensWidth * 1.8} ${centerY - lensHeight * 0.7} Z`}
          fill="url(#goggleFrame)"
          stroke="#999"
          strokeWidth="2"
        />

        {/* Left lens */}
        <AnimatedEllipse
          cx={centerX - lensWidth}
          cy={centerY}
          rx={lensWidth * 0.8}
          ry={lensHeight}
          fill="url(#goggleLens)"
          stroke="#666"
          strokeWidth="2"
          animatedProps={lensOpacityProps}
        />

        {/* Right lens */}
        <AnimatedEllipse
          cx={centerX + lensWidth}
          cy={centerY}
          rx={lensWidth * 0.8}
          ry={lensHeight}
          fill="url(#goggleLens)"
          stroke="#666"
          strokeWidth="2"
          animatedProps={lensOpacityProps}
        />

        {/* Bridge/nose piece */}
        <Path
          d={`M${centerX - lensWidth * 0.2} ${centerY}
              L${centerX - lensWidth * 0.1} ${centerY - 8}
              L${centerX + lensWidth * 0.1} ${centerY - 8}
              L${centerX + lensWidth * 0.2} ${centerY}
              L${centerX + lensWidth * 0.1} ${centerY + 8}
              L${centerX - lensWidth * 0.1} ${centerY + 8} Z`}
          fill="#ddd"
          stroke="#aaa"
          strokeWidth="1"
        />

        {/* Ventilation holes */}
        <G>
          {Array.from({ length: 4 }, (_, i) => (
            <React.Fragment key={i}>
              <circle
                cx={centerX - lensWidth - 10 + i * 5}
                cy={centerY + lensHeight + 15}
                r="2"
                fill="#999"
              />
              <circle
                cx={centerX + lensWidth - 10 + i * 5}
                cy={centerY + lensHeight + 15}
                r="2"
                fill="#999"
              />
            </React.Fragment>
          ))}
        </G>

        {/* Moving reflections */}
        <AnimatedPath
          d={`M${centerX - lensWidth - 8} ${centerY - 8}
              Q${centerX - lensWidth} ${centerY - 15},
              ${centerX - lensWidth + 8} ${centerY - 8}
              Q${centerX - lensWidth} ${centerY + 5},
              ${centerX - lensWidth - 8} ${centerY - 8} Z`}
          fill="url(#reflection)"
          animatedProps={leftReflectionProps}
        />

        <AnimatedPath
          d={`M${centerX + lensWidth - 8} ${centerY - 8}
              Q${centerX + lensWidth} ${centerY - 15},
              ${centerX + lensWidth + 8} ${centerY - 8}
              Q${centerX + lensWidth} ${centerY + 5},
              ${centerX + lensWidth - 8} ${centerY - 8} Z`}
          fill="url(#reflection)"
          animatedProps={rightReflectionProps}
        />

        {/* Adjustment straps */}
        <Ellipse
          cx={centerX - lensWidth * 1.6}
          cy={centerY}
          rx="4"
          ry="8"
          fill="#666"
        />
        <Ellipse
          cx={centerX + lensWidth * 1.6}
          cy={centerY}
          rx="4"
          ry="8"
          fill="#666"
        />

        {/* Safety certification mark */}
        <G>
          <circle cx={width - 15} cy={15} r="8" fill="#ffffff" stroke="#666" strokeWidth="1" />
          <text x={width - 15} y={18} textAnchor="middle" fontSize="8" fill="#333" fontWeight="bold">CE</text>
        </G>
      </Svg>
    </View>
  );
};
