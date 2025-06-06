// src/data/animations/lab/assets/measurement/BalanceScale.tsx

import React, { useState } from 'react';
import { View, PanResponder } from 'react-native';
import Svg, {
  Rect,
  Circle,
  Line,
  Path,
  G,
  Text,
  Defs,
  LinearGradient,
  Stop
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withSpring
} from 'react-native-reanimated';

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedPath = Animated.createAnimatedComponent(Path);

interface BalanceScaleProps {
  width?: number;
  height?: number;
  onMassChange?: (leftMass: number, rightMass: number) => void;
  maxMass?: number;
}

export const BalanceScale: React.FC<BalanceScaleProps> = ({
  width = 300,
  height = 250,
  onMassChange,
  maxMass = 100
}) => {
  const [leftMass, setLeftMass] = useState(0);
  const [rightMass, setRightMass] = useState(0);
  const [dragMode, setDragMode] = useState<'left' | 'right' | null>(null);

  const beamRotation = useSharedValue(0);
  const leftPanY = useSharedValue(0);
  const rightPanY = useSharedValue(0);

  const updateBalance = (left: number, right: number) => {
    const diff = right - left;
    // 1 degree per gram difference, max ±25 degrees
    const rotation = Math.max(-25, Math.min(25, diff * 0.5));

    beamRotation.value = withSpring(rotation, {
      damping: 8,
      stiffness: 100,
    });

    // Pan positions
    const panOffset = rotation * 0.8;
    leftPanY.value = withSpring(-panOffset);
    rightPanY.value = withSpring(panOffset);

    onMassChange?.(left, right);
  };

  const updateMass = (side: 'left' | 'right', change: number) => {
    if (side === 'left') {
      const newMass = Math.max(0, Math.min(maxMass, leftMass + change));
      setLeftMass(newMass);
      updateBalance(newMass, rightMass);
    } else {
      const newMass = Math.max(0, Math.min(maxMass, rightMass + change));
      setRightMass(newMass);
      updateBalance(leftMass, newMass);
    }
  };

  const leftPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => setDragMode('left'),
    onPanResponderMove: (evt, gesture) => {
      updateMass('left', gesture.dy / -10);
    },
    onPanResponderRelease: () => setDragMode(null),
  });

  const rightPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => setDragMode('right'),
    onPanResponderMove: (evt, gesture) => {
      updateMass('right', gesture.dy / -10);
    },
    onPanResponderRelease: () => setDragMode(null),
  });

  const beamProps = useAnimatedProps(() => ({
    transform: [
      {
        rotate: `${beamRotation.value}deg`,
      }
    ],
    transformOrigin: `${width / 2} ${height * 0.4}`
  }));

  const leftPanProps = useAnimatedProps(() => ({
    transform: [{ translateY: leftPanY.value }]
  }));

  const rightPanProps = useAnimatedProps(() => ({
    transform: [{ translateY: rightPanY.value }]
  }));

  const centerX = width / 2;
  const beamY = height * 0.4;
  const panDistance = width * 0.3;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="metalGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#e0e0e0" />
            <Stop offset="0.5" stopColor="#c0c0c0" />
            <Stop offset="1" stopColor="#a0a0a0" />
          </LinearGradient>

          <LinearGradient id="panGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#f0f0f0" />
            <Stop offset="1" stopColor="#d0d0d0" />
          </LinearGradient>
        </Defs>

        {/* Stand base */}
        <Rect
          x={centerX - 40}
          y={height * 0.8}
          width="80"
          height="15"
          rx="7"
          fill="url(#metalGradient)"
        />

        {/* Stand post */}
        <Rect
          x={centerX - 5}
          y={beamY}
          width="10"
          height={height * 0.4}
          fill="url(#metalGradient)"
        />

        {/* Fulcrum */}
        <Circle
          cx={centerX}
          cy={beamY}
          r="12"
          fill="url(#metalGradient)"
          stroke="#888"
          strokeWidth="1"
        />

        {/* Balance beam */}
        <AnimatedG animatedProps={beamProps}>
          <Line
            x1={centerX - panDistance}
            y1={beamY}
            x2={centerX + panDistance}
            y2={beamY}
            stroke="#777"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Balance point indicator */}
          <Circle
            cx={centerX}
            cy={beamY - 3}
            r="3"
            fill="#ff0000"
          />
        </AnimatedG>

        {/* Left pan */}
        <AnimatedG animatedProps={leftPanProps}>
          <G {...leftPanResponder.panHandlers}>
            {/* Pan chains */}
            <Line
              x1={centerX - panDistance}
              y1={beamY}
              x2={centerX - panDistance}
              y2={beamY + 50}
              stroke="#666"
              strokeWidth="2"
            />

            {/* Pan */}
            <Path
              d={`M${centerX - panDistance - 25} ${beamY + 50}
                  L${centerX - panDistance + 25} ${beamY + 50}
                  L${centerX - panDistance + 22} ${beamY + 60}
                  L${centerX - panDistance - 22} ${beamY + 60} Z`}
              fill="url(#panGradient)"
              stroke="#aaa"
              strokeWidth="1"
            />

            {/* Mass visualization */}
            {leftMass > 0 && (
              <Rect
                x={centerX - panDistance - 10}
                y={beamY + 40}
                width="20"
                height={Math.min(20, leftMass / 5)}
                fill="#8B4513"
                rx="2"
              />
            )}
          </G>
        </AnimatedG>

        {/* Right pan */}
        <AnimatedG animatedProps={rightPanProps}>
          <G {...rightPanResponder.panHandlers}>
            {/* Pan chains */}
            <Line
              x1={centerX + panDistance}
              y1={beamY}
              x2={centerX + panDistance}
              y2={beamY + 50}
              stroke="#666"
              strokeWidth="2"
            />

            {/* Pan */}
            <Path
              d={`M${centerX + panDistance - 25} ${beamY + 50}
                  L${centerX + panDistance + 25} ${beamY + 50}
                  L${centerX + panDistance + 22} ${beamY + 60}
                  L${centerX + panDistance - 22} ${beamY + 60} Z`}
              fill="url(#panGradient)"
              stroke="#aaa"
              strokeWidth="1"
            />

            {/* Mass visualization */}
            {rightMass > 0 && (
              <Rect
                x={centerX + panDistance - 10}
                y={beamY + 40}
                width="20"
                height={Math.min(20, rightMass / 5)}
                fill="#8B4513"
                rx="2"
              />
            )}
          </G>
        </AnimatedG>

        {/* Mass readings */}
        <Text
          x={centerX - panDistance}
          y={beamY + 90}
          textAnchor="middle"
          fill="#333"
          fontSize="12"
          fontWeight="bold"
        >
          {leftMass.toFixed(1)}g
        </Text>

        <Text
          x={centerX + panDistance}
          y={beamY + 90}
          textAnchor="middle"
          fill="#333"
          fontSize="12"
          fontWeight="bold"
        >
          {rightMass.toFixed(1)}g
        </Text>

        {/* Balance status */}
        <Text
          x={centerX}
          y={height * 0.15}
          textAnchor="middle"
          fill="#333"
          fontSize="14"
          fontWeight="bold"
        >
          {Math.abs(leftMass - rightMass) < 0.1 ? "BALANCED" :
           leftMass > rightMass ? "LEFT HEAVY" : "RIGHT HEAVY"}
        </Text>

        {/* Drag indicators */}
        {dragMode === 'left' && (
          <Circle
            cx={centerX - panDistance}
            cy={beamY + 55}
            r="30"
            fill="none"
            stroke="#0080ff"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        )}

        {dragMode === 'right' && (
          <Circle
            cx={centerX + panDistance}
            cy={beamY + 55}
            r="30"
            fill="none"
            stroke="#0080ff"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        )}

        {/* Instructions */}
        <Text
          x={width / 2}
          y={height - 10}
          textAnchor="middle"
          fill="#666"
          fontSize="10"
        >
          Drag pans up/down to add mass
        </Text>
      </Svg>
    </View>
  );
};
