// src/data/animations/lab/assets/basic/GraduatedCylinder.tsx

import React, { useState } from 'react';
import { PanResponder, View } from 'react-native';
import Svg, { Rect, Line, Path, Defs, LinearGradient, Stop, Text } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming
} from 'react-native-reanimated';

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedPath = Animated.createAnimatedComponent(Path);

interface GraduatedCylinderProps {
  width?: number;
  height?: number;
  maxVolume?: number; // in mL
  liquidColor?: string;
  onVolumeChange?: (volume: number) => void;
}

export const GraduatedCylinder: React.FC<GraduatedCylinderProps> = ({
  width = 120,
  height = 200,
  maxVolume = 100,
  liquidColor = '#2a9df4',
  onVolumeChange
}) => {
  const [volume, setVolume] = useState(50); // 0-maxVolume scale
  const liquidHeight = useSharedValue(height * 0.75 * 0.5); // Start at 50%

  const updateVolume = (newVolume: number) => {
    newVolume = Math.min(maxVolume, Math.max(0, newVolume));
    const heightPercent = newVolume / maxVolume;
    liquidHeight.value = withTiming(height * 0.75 * heightPercent, { duration: 500 });
    setVolume(newVolume);
    onVolumeChange?.(newVolume);
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gesture) => {
      updateVolume(volume + gesture.dy / -2);
    }
  });

  const liquidProps = useAnimatedProps(() => ({
    y: height * 0.9 - liquidHeight.value,
    height: liquidHeight.value
  }));

  const meniscusProps = useAnimatedProps(() => ({
    d: `M${width * 0.25 + 1} ${height * 0.9 - liquidHeight.value}
        C${width * 0.35} ${height * 0.9 - liquidHeight.value - 4},
        ${width * 0.65} ${height * 0.9 - liquidHeight.value - 4},
        ${width * 0.75 - 1} ${height * 0.9 - liquidHeight.value}`
  }));

  const cylinderWidth = width * 0.5;
  const cylinderX = width * 0.25;

  return (
    <View {...panResponder.panHandlers} style={{ width, height }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="liquidGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={liquidColor} stopOpacity="0.8" />
            <Stop offset="1" stopColor={liquidColor} stopOpacity="0.9" />
          </LinearGradient>

          <LinearGradient id="glassGradient" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#ffffff" stopOpacity="0.3" />
            <Stop offset="0.1" stopColor="#f0f0f0" stopOpacity="0.1" />
            <Stop offset="0.9" stopColor="#f0f0f0" stopOpacity="0.1" />
            <Stop offset="1" stopColor="#ffffff" stopOpacity="0.3" />
          </LinearGradient>
        </Defs>

        {/* Glass cylinder */}
        <Rect
          x={cylinderX}
          y={height * 0.15}
          width={cylinderWidth}
          height={height * 0.75}
          rx="5"
          fill="url(#glassGradient)"
          stroke="#aaa"
          strokeWidth="1"
        />

        {/* Spout */}
        <Path
          d={`M${cylinderX + cylinderWidth} ${height * 0.25}
              L${cylinderX + cylinderWidth + 15} ${height * 0.22}
              L${cylinderX + cylinderWidth + 15} ${height * 0.28}
              Z`}
          fill="#e0e0e0"
          stroke="#aaa"
        />

        {/* Measurement markings */}
        {Array.from({ length: 11 }, (_, i) => {
          const markY = height * 0.15 + (i * height * 0.75) / 10;
          const markValue = maxVolume - (i * maxVolume) / 10;
          const isMainMark = i % 2 === 0;

          return (
            <React.Fragment key={i}>
              <Line
                x1={cylinderX - (isMainMark ? 8 : 5)}
                y1={markY}
                x2={cylinderX + cylinderWidth + (isMainMark ? 8 : 5)}
                y2={markY}
                stroke="#555"
                strokeWidth={isMainMark ? 1.5 : 0.8}
              />
              {isMainMark && (
                <Text
                  x={cylinderX - 12}
                  y={markY + 3}
                  fontSize="8"
                  fill="#333"
                  textAnchor="end"
                >
                  {markValue}
                </Text>
              )}
            </React.Fragment>
          );
        })}

        {/* Liquid */}
        <AnimatedRect
          x={cylinderX + 1}
          width={cylinderWidth - 2}
          fill="url(#liquidGradient)"
          rx="4"
          animatedProps={liquidProps}
        />

        {/* Meniscus curve */}
        <AnimatedPath
          fill={liquidColor}
          opacity="0.9"
          animatedProps={meniscusProps}
        />

        {/* Volume label */}
        <Text
          x={width / 2}
          y={height * 0.05}
          fontSize="12"
          fill="#333"
          textAnchor="middle"
          fontWeight="bold"
        >
          {volume.toFixed(1)} mL
        </Text>

        {/* Base */}
        <Rect
          x={cylinderX - 5}
          y={height * 0.9}
          width={cylinderWidth + 10}
          height={height * 0.05}
          rx="3"
          fill="#666"
        />
      </Svg>
    </View>
  );
};
