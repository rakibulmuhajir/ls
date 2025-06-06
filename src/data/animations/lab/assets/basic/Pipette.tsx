// src/data/animations/lab/assets/basic/Pipette.tsx

import React, { useState, useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Svg, {
  Path,
  Rect,
  Circle,
  Defs,
  LinearGradient,
  Stop,
  G
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withSequence,
  withDelay,
  Easing
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface PipetteProps {
  width?: number;
  height?: number;
  liquidColor?: string;
  capacity?: number; // in mL
  onDispense?: (amount: number) => void;
}

export const Pipette: React.FC<PipetteProps> = ({
  width = 60,
  height = 180,
  liquidColor = '#2a9df4',
  capacity = 10,
  onDispense
}) => {
  const [isDispensing, setIsDispensing] = useState(false);
  const [liquidLevel, setLiquidLevel] = useState(0.7); // 0-1 scale

  const bulbScale = useSharedValue(1);
  const liquidHeight = useSharedValue(height * 0.4);
  const dropOpacity = useSharedValue(0);
  const dropY = useSharedValue(0);

  const startDispensing = () => {
    if (liquidLevel <= 0) return;

    setIsDispensing(true);

    // Squeeze bulb animation
    bulbScale.value = withSequence(
      withTiming(0.8, { duration: 200 }),
      withTiming(1, { duration: 300 })
    );

    // Liquid level decreases
    const newLevel = Math.max(0, liquidLevel - 0.2);
    setLiquidLevel(newLevel);
    liquidHeight.value = withTiming(height * 0.4 * newLevel, { duration: 500 });

    // Drop animation
    dropOpacity.value = withSequence(
      withDelay(200, withTiming(1, { duration: 100 })),
      withTiming(1, { duration: 800 }),
      withTiming(0, { duration: 200 })
    );

    dropY.value = withSequence(
      withTiming(0, { duration: 200 }),
      withTiming(30, {
        duration: 1000,
        easing: Easing.out(Easing.quad)
      }),
      withTiming(0, { duration: 0 })
    );

    onDispense?.(capacity * 0.2);

    setTimeout(() => setIsDispensing(false), 1200);
  };

  const refill = () => {
    setLiquidLevel(0.8);
    liquidHeight.value = withTiming(height * 0.4 * 0.8, { duration: 800 });
  };

  const bulbProps = useAnimatedProps(() => ({
    transform: [{ scale: bulbScale.value }]
  }));

  const liquidProps = useAnimatedProps(() => ({
    y: height * 0.85 - liquidHeight.value,
    height: liquidHeight.value
  }));

  const dropProps = useAnimatedProps(() => ({
    opacity: dropOpacity.value,
    transform: [{ translateY: dropY.value }]
  }));

  const centerX = width / 2;
  const bulbRadius = width * 0.35;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="bulbGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#f8f8f8" />
            <Stop offset="0.3" stopColor="#e8f8ff" />
            <Stop offset="1" stopColor="#d4f1f9" />
          </LinearGradient>

          <LinearGradient id="tubeGradient" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#ffffff" stopOpacity="0.3" />
            <Stop offset="0.5" stopColor="#e0f7ff" stopOpacity="0.1" />
            <Stop offset="1" stopColor="#ffffff" stopOpacity="0.3" />
          </LinearGradient>

          <LinearGradient id="liquidGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={liquidColor} stopOpacity="0.8" />
            <Stop offset="1" stopColor={liquidColor} stopOpacity="0.9" />
          </LinearGradient>
        </Defs>

        {/* Rubber bulb */}
        <Pressable onPress={startDispensing}>
          <AnimatedPath
            d={`M${centerX} ${bulbRadius + 5}
                C${centerX - bulbRadius} ${bulbRadius + 5},
                ${centerX - bulbRadius} ${bulbRadius * 2 + 15},
                ${centerX} ${bulbRadius * 2 + 20}
                C${centerX + bulbRadius} ${bulbRadius * 2 + 15},
                ${centerX + bulbRadius} ${bulbRadius + 5},
                ${centerX} ${bulbRadius + 5} Z`}
            fill={isDispensing ? "#d0e8f0" : "url(#bulbGradient)"}
            stroke="#b0d0e0"
            strokeWidth="1"
            animatedProps={bulbProps}
          />
        </Pressable>

        {/* Bulb texture lines */}
        <G>
          {Array.from({ length: 4 }, (_, i) => (
            <Path
              key={i}
              d={`M${centerX - bulbRadius + 5 + i * 8} ${bulbRadius + 10}
                  Q${centerX} ${bulbRadius + 5},
                  ${centerX + bulbRadius - 5 - i * 8} ${bulbRadius + 10}`}
              stroke="#c0d8e8"
              strokeWidth="0.5"
              fill="none"
            />
          ))}
        </G>

        {/* Glass tube */}
        <Rect
          x={centerX - 3}
          y={bulbRadius * 2 + 20}
          width="6"
          height={height - bulbRadius * 2 - 30}
          fill="url(#tubeGradient)"
          stroke="#c0e8ff"
          strokeWidth="1"
          rx="3"
        />

        {/* Liquid in tube */}
        <AnimatedRect
          x={centerX - 2.5}
          width="5"
          fill="url(#liquidGradient)"
          rx="2.5"
          animatedProps={liquidProps}
        />

        {/* Volume markings */}
        {Array.from({ length: 6 }, (_, i) => {
          const markY = bulbRadius * 2 + 30 + (i * (height - bulbRadius * 2 - 40)) / 5;
          const volume = capacity - (i * capacity) / 5;

          return (
            <G key={i}>
              <Rect
                x={centerX + 3}
                y={markY}
                width="4"
                height="1"
                fill="#666"
              />
              {i % 2 === 0 && (
                <text
                  x={centerX + 10}
                  y={markY + 2}
                  fontSize="6"
                  fill="#666"
                >
                  {volume.toFixed(1)}
                </text>
              )}
            </G>
          );
        })}

        {/* Tip */}
        <Path
          d={`M${centerX - 3} ${height - 10}
              L${centerX + 3} ${height - 10}
              L${centerX + 1} ${height - 2}
              L${centerX - 1} ${height - 2} Z`}
          fill="#e0f0ff"
          stroke="#c0e8ff"
        />

        {/* Dispensing drop */}
        <AnimatedPath
          d={`M${centerX} ${height - 2}
              Q${centerX + 3} ${height + 2}, ${centerX + 2} ${height + 8}
              Q${centerX} ${height + 12}, ${centerX - 2} ${height + 8}
              Q${centerX - 3} ${height + 2}, ${centerX} ${height - 2} Z`}
          fill={liquidColor}
          animatedProps={dropProps}
        />

        {/* Volume display */}
        <Rect
          x={5}
          y={10}
          width={width - 10}
          height="20"
          fill="#000"
          stroke="#333"
          rx="3"
        />

        <text
          x={centerX}
          y={22}
          fontSize="8"
          fill="#0f0"
          textAnchor="middle"
          fontFamily="monospace"
        >
          {(liquidLevel * capacity).toFixed(1)}mL
        </text>

        {/* Refill button (long press area) */}
        <Pressable onLongPress={refill}>
          <Circle
            cx={width - 12}
            cy={height - 25}
            r="8"
            fill="#4CAF50"
            stroke="#2E7D32"
            strokeWidth="1"
          />
          <text
            x={width - 12}
            y={height - 22}
            fontSize="6"
            fill="white"
            textAnchor="middle"
          >
            ↻
          </text>
        </Pressable>

        {/* Instructions */}
        <text
          x={centerX}
          y={height - 5}
          fontSize="6"
          fill="#666"
          textAnchor="middle"
        >
          Tap to dispense | Hold ↻ to refill
        </text>
      </Svg>
    </View>
  );
};
