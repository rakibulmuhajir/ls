// src/data/animations/lab/assets/heating/HotPlate.tsx

import React, { useState, useEffect } from 'react';
import { PanResponder, View } from 'react-native';
import Svg, {
  Rect,
  Circle,
  Path,
  Defs,
  RadialGradient,
  Stop,
  Text,
  G
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withRepeat,
  withSequence,
  interpolateColor,
  Easing
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

interface HotPlateProps {
  width?: number;
  height?: number;
  onTemperatureChange?: (temperature: number) => void;
  maxTemperature?: number;
}

export const HotPlate: React.FC<HotPlateProps> = ({
  width = 200,
  height = 200,
  onTemperatureChange,
  maxTemperature = 500
}) => {
  const [temperature, setTemperature] = useState(25); // Room temperature start
  const plateHeat = useSharedValue(0); // 0-1 scale
  const heatWaveOpacity = useSharedValue(0);
  const glowIntensity = useSharedValue(0);

  const updateTemperature = (newTemp: number) => {
    newTemp = Math.min(maxTemperature, Math.max(25, newTemp));
    const heatLevel = (newTemp - 25) / (maxTemperature - 25);

    plateHeat.value = withTiming(heatLevel, { duration: 1000 });
    heatWaveOpacity.value = withTiming(heatLevel > 0.3 ? heatLevel : 0, { duration: 500 });
    glowIntensity.value = withTiming(heatLevel, { duration: 800 });

    setTemperature(newTemp);
    onTemperatureChange?.(newTemp);
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gesture) => {
      updateTemperature(temperature + gesture.dy / -2);
    }
  });

  useEffect(() => {
    if (temperature > 100) {
      // Add heat wave animation for high temperatures
      heatWaveOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.8, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [temperature]);

  const plateProps = useAnimatedProps(() => ({
    fill: interpolateColor(
      plateHeat.value,
      [0, 0.3, 0.6, 1],
      ['#cccccc', '#ff9900', '#ff6600', '#ff3300']
    )
  }));

  const glowProps = useAnimatedProps(() => ({
    opacity: glowIntensity.value * 0.5
  }));

  const heatWaveProps = useAnimatedProps(() => ({
    opacity: heatWaveOpacity.value
  }));

  const plateRadius = Math.min(width, height) * 0.3;
  const centerX = width / 2;
  const centerY = height * 0.45;

  return (
    <View {...panResponder.panHandlers} style={{ width, height }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <RadialGradient id="plateGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <Stop offset="70%" stopColor="#ff5500" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#ff5500" stopOpacity="0" />
          </RadialGradient>

          <RadialGradient id="plateGradient" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#f0f0f0" />
            <Stop offset="100%" stopColor="#cccccc" />
          </RadialGradient>
        </Defs>

        {/* Base unit */}
        <Rect
          x={width * 0.1}
          y={height * 0.7}
          width={width * 0.8}
          height={height * 0.25}
          rx="8"
          fill="#666"
        />

        {/* Heating plate glow effect */}
        <AnimatedCircle
          cx={centerX}
          cy={centerY}
          r={plateRadius + 20}
          fill="url(#plateGlow)"
          animatedProps={glowProps}
        />

        {/* Main heating plate */}
        <AnimatedCircle
          cx={centerX}
          cy={centerY}
          r={plateRadius}
          stroke="#444"
          strokeWidth="2"
          animatedProps={plateProps}
        />

        {/* Heating coils */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={plateRadius * 0.7}
          fill="none"
          stroke="#333"
          strokeWidth="2"
          strokeDasharray="10,5"
        />
        <Circle
          cx={centerX}
          cy={centerY}
          r={plateRadius * 0.4}
          fill="none"
          stroke="#333"
          strokeWidth="2"
          strokeDasharray="8,4"
        />

        {/* Heat waves when hot */}
        <AnimatedG animatedProps={heatWaveProps}>
          <Path
            d={`M${centerX - 40} ${centerY - 30}
                Q${centerX - 20} ${centerY - 40}, ${centerX} ${centerY - 30}
                Q${centerX + 20} ${centerY - 20}, ${centerX + 40} ${centerY - 30}`}
            stroke="#ffaa00"
            strokeWidth="2"
            fill="none"
            opacity="0.8"
          />
          <Path
            d={`M${centerX - 50} ${centerY - 50}
                Q${centerX - 25} ${centerY - 60}, ${centerX} ${centerY - 50}
                Q${centerX + 25} ${centerY - 40}, ${centerX + 50} ${centerY - 50}`}
            stroke="#ff7700"
            strokeWidth="2"
            fill="none"
            opacity="0.6"
          />
          <Path
            d={`M${centerX - 30} ${centerY - 70}
                Q${centerX - 15} ${centerY - 80}, ${centerX} ${centerY - 70}
                Q${centerX + 15} ${centerY - 60}, ${centerX + 30} ${centerY - 70}`}
            stroke="#ff5500"
            strokeWidth="2"
            fill="none"
            opacity="0.7"
          />
        </AnimatedG>

        {/* Temperature control panel */}
        <Rect
          x={width * 0.15}
          y={height * 0.78}
          width={width * 0.7}
          height={height * 0.08}
          rx="4"
          fill="#333"
        />

        {/* Temperature indicator bar */}
        <Rect
          x={width * 0.17}
          y={height * 0.8}
          width={(width * 0.66) * ((temperature - 25) / (maxTemperature - 25))}
          height={height * 0.04}
          rx="2"
          fill={temperature > 300 ? "#ff3300" : temperature > 150 ? "#ff6600" : "#ff9900"}
        />

        {/* Digital display */}
        <Rect
          x={width * 0.35}
          y={height * 0.15}
          width={width * 0.3}
          height={height * 0.12}
          rx="3"
          fill="#000"
          stroke="#555"
        />

        {/* Temperature reading */}
        <Text
          x={centerX}
          y={height * 0.23}
          fontSize="14"
          fill="#0f0"
          textAnchor="middle"
          fontFamily="monospace"
        >
          {Math.round(temperature)}°C
        </Text>

        {/* Control knob */}
        <Circle
          cx={width * 0.85}
          cy={height * 0.82}
          r="12"
          fill="#555"
          stroke="#777"
          strokeWidth="2"
        />
        <Circle
          cx={width * 0.85}
          cy={height * 0.82}
          r="8"
          fill="#777"
        />
        <Rect
          x={width * 0.85 - 1}
          y={height * 0.82 - 10}
          width="2"
          height="8"
          fill="#bbb"
        />

        {/* ON/OFF indicator */}
        <Circle
          cx={width * 0.15}
          cy={height * 0.82}
          r="6"
          fill={temperature > 25 ? "#0f0" : "#f00"}
        />
        <Text
          x={width * 0.15}
          y={height * 0.95}
          fontSize="8"
          fill="#333"
          textAnchor="middle"
        >
          {temperature > 25 ? "ON" : "OFF"}
        </Text>
      </Svg>
    </View>
  );
};
