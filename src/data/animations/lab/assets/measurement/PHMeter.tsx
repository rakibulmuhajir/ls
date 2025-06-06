// src/data/animations/lab/assets/measurement/PHMeter.tsx

import React, { useState } from 'react';
import { View, PanResponder } from 'react-native';
import Svg, {
  Rect,
  Path,
  Circle,
  Text,
  Defs,
  LinearGradient,
  Stop,
  G
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  interpolateColor
} from 'react-native-reanimated';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface PHMeterProps {
  width?: number;
  height?: number;
  onPHChange?: (pH: number) => void;
}

const pHColors = [
  '#8B0000', // 0: dark red (very acidic)
  '#DC143C', // 1: red
  '#FF4500', // 2: orange red
  '#FF6347', // 3: tomato
  '#FFA500', // 4: orange
  '#FFD700', // 5: gold
  '#FFFF00', // 6: yellow
  '#ADFF2F', // 7: green yellow (neutral)
  '#32CD32', // 8: lime green
  '#00FF00', // 9: green
  '#00CED1', // 10: dark turquoise
  '#0000FF', // 11: blue
  '#4169E1', // 12: royal blue
  '#8A2BE2', // 13: blue violet
  '#4B0082', // 14: indigo (very basic)
];

const pHLabels = [
  'Battery Acid', 'Lemon Juice', 'Vinegar', 'Orange Juice', 'Tomato',
  'Coffee', 'Milk', 'Pure Water', 'Baking Soda', 'Soap',
  'Ammonia', 'Household Bleach', 'Lime Water', 'Lye', 'Liquid Drain Cleaner'
];

export const PHMeter: React.FC<PHMeterProps> = ({
  width = 200,
  height = 300,
  onPHChange
}) => {
  const [pH, setPH] = useState(7);
  const [isCalibrating, setIsCalibrating] = useState(false);

  const stripColor = useSharedValue(pHColors[7]);
  const probeDepth = useSharedValue(0);

  const updatePH = (newPH: number) => {
    newPH = Math.min(14, Math.max(0, newPH));
    const colorIndex = Math.round(newPH);
    stripColor.value = withTiming(pHColors[colorIndex], { duration: 500 });
    setPH(newPH);
    onPHChange?.(newPH);
  };

  const calibrate = () => {
    setIsCalibrating(true);
    // Simulate calibration sequence
    setTimeout(() => {
      updatePH(7); // Reset to neutral
      setIsCalibrating(false);
    }, 2000);
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gesture) => {
      updatePH(pH + gesture.dx / 30);
      // Simulate probe movement
      probeDepth.value = withTiming(Math.max(0, Math.min(20, gesture.dy / 5)));
    },
    onPanResponderRelease: () => {
      probeDepth.value = withTiming(0, { duration: 300 });
    }
  });

  const stripProps = useAnimatedProps(() => ({
    fill: stripColor.value
  }));

  const probeProps = useAnimatedProps(() => ({
    transform: [{ translateY: probeDepth.value }]
  }));

  const getAcidityLevel = (pH: number) => {
    if (pH < 3) return 'Very Acidic';
    if (pH < 6) return 'Acidic';
    if (pH < 8) return 'Neutral';
    if (pH < 11) return 'Basic';
    return 'Very Basic';
  };

  const centerX = width / 2;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="meterBody" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#f0f0f0" />
            <Stop offset="0.1" stopColor="#e8e8e8" />
            <Stop offset="0.9" stopColor="#d0d0d0" />
            <Stop offset="1" stopColor="#c0c0c0" />
          </LinearGradient>

          <LinearGradient id="display" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#001100" />
            <Stop offset="1" stopColor="#002200" />
          </LinearGradient>

          <LinearGradient id="probe" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#c0c0c0" />
            <Stop offset="0.8" stopColor="#888888" />
            <Stop offset="1" stopColor="#666666" />
          </LinearGradient>
        </Defs>

        {/* Meter body */}
        <Rect
          x={centerX - 40}
          y={height * 0.05}
          width="80"
          height={height * 0.6}
          rx="8"
          fill="url(#meterBody)"
          stroke="#999"
          strokeWidth="2"
        />

        {/* Brand/Model label */}
        <Rect
          x={centerX - 35}
          y={height * 0.08}
          width="70"
          height="15"
          fill="#333"
        />
        <Text
          x={centerX}
          y={height * 0.092}
          fontSize="8"
          fill="white"
          textAnchor="middle"
          fontWeight="bold"
        >
          pH METER PRO
        </Text>

        {/* Digital display */}
        <Rect
          x={centerX - 30}
          y={height * 0.12}
          width="60"
          height="30"
          rx="3"
          fill="url(#display)"
          stroke="#555"
        />

        {/* pH value display */}
        <Text
          x={centerX}
          y={height * 0.145}
          fontSize="16"
          fill="#00ff00"
          textAnchor="middle"
          fontFamily="monospace"
          fontWeight="bold"
        >
          {pH.toFixed(2)}
        </Text>

        {/* Units */}
        <Text
          x={centerX + 20}
          y={height * 0.135}
          fontSize="8"
          fill="#00aa00"
          textAnchor="middle"
        >
          pH
        </Text>

        {/* Temperature display */}
        <Text
          x={centerX}
          y={height * 0.158}
          fontSize="8"
          fill="#ffaa00"
          textAnchor="middle"
          fontFamily="monospace"
        >
          25.0°C
        </Text>

        {/* pH strip indicator */}
        <Rect
          x={centerX - 25}
          y={height * 0.2}
          width="50"
          height="80"
          rx="3"
          fill="#444"
          stroke="#666"
        />

        {/* Actual pH strip */}
        <AnimatedRect
          x={centerX - 22}
          y={height * 0.205}
          width="44"
          height="70"
          rx="2"
          animatedProps={stripProps}
        />

        {/* pH scale markings */}
        <G>
          {Array.from({ length: 15 }, (_, i) => (
            <G key={i}>
              <Text
                x={centerX - 35}
                y={height * 0.205 + (i * 4.67) + 3}
                fontSize="6"
                fill="#333"
                textAnchor="end"
              >
                {14 - i}
              </Text>
              <Rect
                x={centerX - 28}
                y={height * 0.205 + (i * 4.67)}
                width="6"
                height="1"
                fill="#333"
              />
            </G>
          ))}
        </G>

        {/* pH level indicator */}
        <Text
          x={centerX}
          y={height * 0.32}
          fontSize="10"
          fill="#333"
          textAnchor="middle"
          fontWeight="bold"
        >
          {getAcidityLevel(pH)}
        </Text>

        {/* Sample type indicator */}
        <Text
          x={centerX}
          y={height * 0.35}
          fontSize="8"
          fill="#666"
          textAnchor="middle"
        >
          {pHLabels[Math.round(pH)]}
        </Text>

        {/* Control buttons */}
        <G>
          {/* Calibrate button */}
          <Rect
            x={centerX - 35}
            y={height * 0.4}
            width="25"
            height="15"
            rx="2"
            fill={isCalibrating ? "#ff6600" : "#4CAF50"}
            stroke="#333"
            onPress={calibrate}
          />
          <Text
            x={centerX - 22.5}
            y={height * 0.41}
            fontSize="6"
            fill="white"
            textAnchor="middle"
          >
            CAL
          </Text>

          {/* Mode button */}
          <Rect
            x={centerX + 10}
            y={height * 0.4}
            width="25"
            height="15"
            rx="2"
            fill="#2196F3"
            stroke="#333"
          />
          <Text
            x={centerX + 22.5}
            y={height * 0.41}
            fontSize="6"
            fill="white"
            textAnchor="middle"
          >
            MODE
          </Text>
        </G>

        {/* Probe cable */}
        <Path
          d={`M${centerX} ${height * 0.65}
              Q${centerX + 15} ${height * 0.7}, ${centerX + 10} ${height * 0.8}
              Q${centerX + 5} ${height * 0.85}, ${centerX} ${height * 0.9}`}
          stroke="#333"
          strokeWidth="3"
          fill="none"
        />

        {/* Probe */}
        <Animated.G animatedProps={probeProps} {...panResponder.panHandlers}>
          <Rect
            x={centerX - 3}
            y={height * 0.9}
            width="6"
            height="40"
            fill="url(#probe)"
            stroke="#555"
            rx="3"
          />

          {/* Probe tip */}
          <Path
            d={`M${centerX - 3} ${height * 0.93}
                L${centerX + 3} ${height * 0.93}
                L${centerX + 1} ${height * 0.95}
                L${centerX - 1} ${height * 0.95} Z`}
            fill="#444"
          />

          {/* Glass bulb */}
          <Circle
            cx={centerX}
            cy={height * 0.92}
            r="4"
            fill="#e0f0ff"
            stroke="#99ccff"
            strokeWidth="0.5"
          />
        </Animated.G>

        {/* Status indicators */}
        <Circle
          cx={centerX + 25}
          cy={height * 0.1}
          r="3"
          fill={isCalibrating ? "#ff6600" : "#00ff00"}
        />
        <Text
          x={centerX + 32}
          y={height * 0.105}
          fontSize="6"
          fill="#333"
        >
          {isCalibrating ? "CAL" : "RDY"}
        </Text>

        {/* Instructions */}
        <Text
          x={centerX}
          y={height - 5}
          fontSize="8"
          fill="#666"
          textAnchor="middle"
        >
          Drag horizontally to change pH
        </Text>
      </Svg>
    </View>
  );
};
