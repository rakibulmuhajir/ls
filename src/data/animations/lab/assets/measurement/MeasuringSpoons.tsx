// src/data/animations/lab/assets/measurement/MeasuringSpoons.tsx
import React, { useState } from 'react';
import { PanResponder, View } from 'react-native';
import Svg, { Path, G, Defs, LinearGradient, Stop, Rect, Text, Line } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming } from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface MeasuringSpoonsProps {
  width?: number;
  height?: number;
  maxCapacity?: number;
}

export const MeasuringSpoons: React.FC<MeasuringSpoonsProps> = ({
  width = 200,
  height = 200,
  maxCapacity = 15
}) => {
  const [fillLevel, setFillLevel] = useState(0); // 0-100%
  const liquidHeight = useSharedValue(0);

  const updateFill = (level: number) => {
    level = Math.min(100, Math.max(0, level));
    liquidHeight.value = withTiming(level, { duration: 500 });
    setFillLevel(level);
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gesture) => {
      updateFill(fillLevel + gesture.dy / -2);
    }
  });

  const liquidProps = useAnimatedProps(() => {
    const height = 80 * (liquidHeight.value / 100);
    return {
      d: `M100 150 L80 ${150 - height} L120 ${150 - height} Z`
    };
  });

  return (
    <View {...panResponder.panHandlers}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="liquid" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#2a9df4" stopOpacity="0.8"/>
            <Stop offset="1" stopColor="#1167b1" stopOpacity="0.9"/>
          </LinearGradient>
        </Defs>

        {/* Spoon outline */}
        <Path
          d="M100 150 L60 100 C70 70, 130 70, 140 100 L100 150 Z"
          fill="#e0e0e0"
          stroke="#aaa"
        />

        {/* Liquid fill */}
        <AnimatedPath animatedProps={liquidProps} fill="url(#liquid)" />

        {/* Handle */}
        <Rect x="98" y="50" width="4" height="100" fill="#ccc" rx="2" />

        {/* Measurement markers */}
        <Line x1="85" y1="110" x2="115" y2="110" stroke="#555" strokeWidth="1" />
        <Text x="75" y="110" fill="#333" fontSize="10">5g</Text>

        <Line x1="85" y1="130" x2="115" y2="130" stroke="#555" strokeWidth="1" />
        <Text x="75" y="130" fill="#333" fontSize="10">10g</Text>

        <Line x1="85" y1="150" x2="115" y2="150" stroke="#555" strokeWidth="1" />
        <Text x="75" y="150" fill="#333" fontSize="10">15g</Text>

        {/* Current measurement */}
        <Text x="100" y="30" textAnchor="middle" fontSize="12" fill="#333" fontWeight="bold">
          {((fillLevel / 100) * maxCapacity).toFixed(1)}g
        </Text>

        {/* Instructions */}
        <Text x="100" y={height - 10} textAnchor="middle" fontSize="8" fill="#666">
          Drag vertically to fill
        </Text>
      </Svg>
    </View>
  );
};
