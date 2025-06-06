// src/data/animations/lab/assets/specialized/Microscope.tsx

import React, { useState } from 'react';
import { PanResponder, View } from 'react-native';
import Svg, {
  Rect,
  Circle,
  Path,
  G,
  Text,
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  ClipPath
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  interpolate,
  withSpring
} from 'react-native-reanimated';

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface MicroscopeProps {
  width?: number;
  height?: number;
  onFocusChange?: (focus: number) => void;
  magnification?: number;
}

export const Microscope: React.FC<MicroscopeProps> = ({
  width = 250,
  height = 300,
  onFocusChange,
  magnification = 400
}) => {
  const [focus, setFocus] = useState(50);
  const [selectedObjective, setSelectedObjective] = useState(1); // 0: 4x, 1: 10x, 2: 40x, 3: 100x

  const focusPosition = useSharedValue(50);
  const objectiveRotation = useSharedValue(0);
  const sampleOpacity = useSharedValue(0.8);
  const sampleScale = useSharedValue(1);

  const objectives = [
    { mag: '4x', color: '#ff0000' },
    { mag: '10x', color: '#00ff00' },
    { mag: '40x', color: '#0000ff' },
    { mag: '100x', color: '#ffff00' }
  ];

  const updateFocus = (newFocus: number) => {
    newFocus = Math.min(100, Math.max(0, newFocus));
    focusPosition.value = withTiming(newFocus, { duration: 300 });

    // Calculate clarity and scale based on focus
    const clarity = 1 - Math.abs(50 - newFocus) / 50;
    sampleOpacity.value = withTiming(0.4 + clarity * 0.6, { duration: 300 });
    sampleScale.value = withTiming(0.8 + clarity * 0.4, { duration: 300 });

    setFocus(newFocus);
    onFocusChange?.(newFocus);
  };

  const rotateObjective = () => {
    const nextObjective = (selectedObjective + 1) % 4;
    setSelectedObjective(nextObjective);
    objectiveRotation.value = withSpring(nextObjective * 90, {
      damping: 10,
      stiffness: 100,
    });
  };

  const focusPanResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gesture) => {
      updateFocus(focus + gesture.dy / -2);
    }
  });

  const focusKnobProps = useAnimatedProps(() => ({
    transform: [{ rotate: `${focusPosition.value * 3.6}deg` }]
  }));

  const objectiveProps = useAnimatedProps(() => ({
    transform: [{ rotate: `${objectiveRotation.value}deg` }]
  }));

  const sampleProps = useAnimatedProps(() => ({
    opacity: sampleOpacity.value,
    transform: [{ scale: sampleScale.value }]
  }));

  const baseWidth = width * 0.7;
  const centerX = width / 2;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="metalGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#e8e8e8" />
            <Stop offset="0.5" stopColor="#d0d0d0" />
            <Stop offset="1" stopColor="#b0b0b0" />
          </LinearGradient>

          <RadialGradient id="lensGradient" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#ffffff" stopOpacity="0.8" />
            <Stop offset="70" stopColor="#e0e0e0" stopOpacity="0.6" />
            <Stop offset="100" stopColor="#000000" stopOpacity="0.3" />
          </RadialGradient>

          <LinearGradient id="armGradient" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#c0c0c0" />
            <Stop offset="0.5" stopColor="#a0a0a0" />
            <Stop offset="1" stopColor="#808080" />
          </LinearGradient>

          <ClipPath id="stageClip">
            <Rect x={centerX - 30} y={height * 0.55} width="60" height="30" />
          </ClipPath>
        </Defs>

        {/* Base */}
        <Path
          d={`M${centerX - baseWidth/2} ${height * 0.9}
              L${centerX + baseWidth/2} ${height * 0.9}
              L${centerX + baseWidth/2 - 10} ${height * 0.95}
              L${centerX - baseWidth/2 + 10} ${height * 0.95} Z`}
          fill="url(#metalGradient)"
          stroke="#999"
          strokeWidth="1"
        />

        {/* Pillar */}
        <Rect
          x={centerX - 8}
          y={height * 0.25}
          width="16"
          height={height * 0.65}
          fill="url(#metalGradient)"
          stroke="#999"
        />

        {/* Arm */}
        <Path
          d={`M${centerX} ${height * 0.25}
              Q${centerX + 20} ${height * 0.22}, ${centerX + 40} ${height * 0.25}
              L${centerX + 40} ${height * 0.45}
              Q${centerX + 35} ${height * 0.47}, ${centerX + 30} ${height * 0.45}
              L${centerX + 30} ${height * 0.27}
              L${centerX} ${height * 0.3} Z`}
          fill="url(#armGradient)"
          stroke="#777"
          strokeWidth="1"
        />

        {/* Stage */}
        <Rect
          x={centerX - 40}
          y={height * 0.55}
          width="80"
          height="8"
          fill="url(#metalGradient)"
          stroke="#999"
          rx="2"
        />

        {/* Stage clips */}
        <Rect x={centerX - 35} y={height * 0.52} width="8" height="15" fill="#666" rx="2" />
        <Rect x={centerX + 27} y={height * 0.52} width="8" height="15" fill="#666" rx="2" />

        {/* Slide */}
        <Rect
          x={centerX - 25}
          y={height * 0.51}
          width="50"
          height="3"
          fill="#f0f0f0"
          stroke="#ccc"
          rx="1"
        />

        {/* Sample on slide */}
        <AnimatedG animatedProps={sampleProps} clipPath="url(#stageClip)">
          <Circle cx={centerX - 5} cy={height * 0.525} r="3" fill="#ff6b6b" opacity="0.7" />
          <Circle cx={centerX + 5} cy={height * 0.525} r="2" fill="#4ecdc4" opacity="0.7" />
          <Circle cx={centerX} cy={height * 0.535} r="2.5" fill="#45b7d1" opacity="0.7" />
          <Circle cx={centerX - 8} cy={height * 0.535} r="1.5" fill="#96ceb4" opacity="0.7" />
          <Circle cx={centerX + 8} cy={height * 0.518} r="1.8" fill="#feca57" opacity="0.7" />
        </AnimatedG>

        {/* Objective turret */}
        <AnimatedG
          animatedProps={objectiveProps}
          style={{ transformOrigin: `${centerX + 30}px ${height * 0.47}px` }}
        >
          <Circle
            cx={centerX + 30}
            cy={height * 0.47}
            r="25"
            fill="url(#metalGradient)"
            stroke="#777"
            strokeWidth="2"
          />

          {/* Objective lenses */}
          {objectives.map((obj, index) => {
            const angle = (index * 90) * (Math.PI / 180);
            const objX = centerX + 30 + 18 * Math.cos(angle);
            const objY = height * 0.47 + 18 * Math.sin(angle);

            return (
              <G key={index}>
                <Circle
                  cx={objX}
                  cy={objY}
                  r="8"
                  fill={obj.color}
                  stroke="#333"
                  strokeWidth="1"
                />
                <Text
                  x={objX}
                  y={objY + 2}
                  fontSize="6"
                  fill="white"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {obj.mag}
                </Text>
              </G>
            );
          })}
        </AnimatedG>

        {/* Current objective lens (active) */}
        <Circle
          cx={centerX + 30}
          cy={height * 0.47 + 18}
          r="12"
          fill={objectives[selectedObjective].color}
          stroke="#333"
          strokeWidth="2"
        />
        <Circle
          cx={centerX + 30}
          cy={height * 0.47 + 18}
          r="8"
          fill="url(#lensGradient)"
        />

        {/* Eyepiece */}
        <Rect
          x={centerX - 12}
          y={height * 0.1}
          width="24"
          height="40"
          fill="url(#metalGradient)"
          stroke="#777"
          rx="3"
        />
        <Circle
          cx={centerX}
          cy={height * 0.08}
          r="12"
          fill="#333"
          stroke="#555"
          strokeWidth="2"
        />
        <Circle
          cx={centerX}
          cy={height * 0.08}
          r="8"
          fill="#000"
        />

        {/* Focus knobs */}
        <G {...focusPanResponder.panHandlers}>
          <AnimatedCircle
            cx={centerX - 25}
            cy={height * 0.65}
            r="12"
            fill="url(#metalGradient)"
            stroke="#777"
            strokeWidth="2"
            animatedProps={focusKnobProps}
          />
          <AnimatedCircle
            cx={centerX - 25}
            cy={height * 0.65}
            r="8"
            fill="#999"
            animatedProps={focusKnobProps}
          />
          <AnimatedG animatedProps={focusKnobProps}>
            <Rect
              x={centerX - 26}
              y={height * 0.65 - 8}
              width="2"
              height="6"
              fill="#ddd"
            />
          </AnimatedG>
        </G>

        {/* Fine focus knob */}
        <Circle
          cx={centerX - 40}
          cy={height * 0.65}
          r="8"
          fill="url(#metalGradient)"
          stroke="#777"
          strokeWidth="1"
        />

        {/* Illumination control */}
        <Circle
          cx={centerX + 50}
          cy={height * 0.7}
          r="10"
          fill="#ffdd44"
          stroke="#cc9900"
          strokeWidth="2"
        />
        <Text
          x={centerX + 50}
          y={height * 0.73}
          fontSize="8"
          fill="#333"
          textAnchor="middle"
        >
          ☀
        </Text>

        {/* Info display */}
        <Rect
          x={width * 0.02}
          y={height * 0.02}
          width={width * 0.35}
          height={height * 0.2}
          fill="#000"
          stroke="#555"
          rx="3"
        />

        <Text x={width * 0.04} y={height * 0.06} fontSize="10" fill="#0f0" fontFamily="monospace">
          Magnification: {objectives[selectedObjective].mag}
        </Text>
        <Text x={width * 0.04} y={height * 0.09} fontSize="10" fill="#0f0" fontFamily="monospace">
          Focus: {focus.toFixed(1)}%
        </Text>
        <Text x={width * 0.04} y={height * 0.12} fontSize="10" fill="#0f0" fontFamily="monospace">
          Clarity: {((1 - Math.abs(50 - focus) / 50) * 100).toFixed(0)}%
        </Text>

        {/* Instructions */}
        <Text
          x={centerX}
          y={height - 5}
          fontSize="10"
          fill="#666"
          textAnchor="middle"
        >
          Drag focus knob | Tap objective turret
        </Text>

        {/* Objective turret click area */}
        <Circle
          cx={centerX + 30}
          cy={height * 0.47}
          r="25"
          fill="transparent"
          onPress={rotateObjective}
        />
      </Svg>
    </View>
  );
};
