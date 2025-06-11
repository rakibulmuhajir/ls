// src/data/animations/lab/assets/enhanced/TestTubeRackEnhanced.tsx

import React from 'react';
import { View } from 'react-native';
import Svg, {
  Rect,
  Path,
  Defs,
  LinearGradient,
  Stop,
  G
} from 'react-native-svg';

interface TubeContent {
  level: number; // 0-100
  color: string;
  label?: string;
}

interface TestTubeRackEnhancedProps {
  size?: number;
  tubeCount?: number;
  tubeContents?: TubeContent[];
  rackColor?: string;
}

export const TestTubeRackEnhanced: React.FC<TestTubeRackEnhancedProps> = ({
  size = 200,
  tubeCount = 3,
  tubeContents = [
    { level: 60, color: '#4FC3F7', label: 'H₂O' },
    { level: 40, color: '#81C784', label: 'NaCl' },
    { level: 80, color: '#FFF176', label: 'HCl' }
  ],
  rackColor = '#8D6E63'
}) => {
  const tubeWidth = size * 0.15;
  const tubeSpacing = size * 0.2;
  const rackHeight = size * 0.05;

  // Ensure we have content for all tubes
  const normalizedContents = Array.from({ length: tubeCount }, (_, index) =>
    tubeContents[index] || { level: 50, color: '#BDBDBD', label: 'Empty' }
  );

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          {/* Wood grain gradient for rack */}
          <LinearGradient id="rackGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#A1887F" />
            <Stop offset="0.3" stopColor="#8D6E63" />
            <Stop offset="0.7" stopColor="#6D4C41" />
            <Stop offset="1" stopColor="#5D4037" />
          </LinearGradient>

          {/* Glass gradient for tubes */}
          <LinearGradient id="glassGradient" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#F5F5F5" stopOpacity="0.9" />
            <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.7" />
            <Stop offset="1" stopColor="#E0E0E0" stopOpacity="0.9" />
          </LinearGradient>

          {/* Individual liquid gradients for each tube */}
          {normalizedContents.map((content, index) => (
            <LinearGradient
              key={`liquid-${index}`}
              id={`liquidGradient${index}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <Stop offset="0" stopColor={content.color} stopOpacity="0.9" />
              <Stop offset="1" stopColor={content.color} stopOpacity="0.6" />
            </LinearGradient>
          ))}
        </Defs>

        {/* Rack base */}
        <Rect
          x={size * 0.1}
          y={size * 0.8}
          width={size * 0.8}
          height={rackHeight}
          fill="url(#rackGradient)"
          rx={size * 0.01}
        />

        {/* Rack left side */}
        <Rect
          x={size * 0.1}
          y={size * 0.3}
          width={size * 0.05}
          height={size * 0.5}
          fill="url(#rackGradient)"
        />

        {/* Rack right side */}
        <Rect
          x={size * 0.85}
          y={size * 0.3}
          width={size * 0.05}
          height={size * 0.5}
          fill="url(#rackGradient)"
        />

        {/* Rack top with tube holes */}
        <Path
          d={`
            M ${size * 0.15} ${size * 0.3}
            L ${size * 0.85} ${size * 0.3}
            L ${size * 0.8} ${size * 0.35}
            L ${size * 0.2} ${size * 0.35}
            Z
          `}
          fill="url(#rackGradient)"
        />

        {/* Test tubes */}
        <G>
          {normalizedContents.map((content, index) => {
            const tubeX = size * 0.2 + index * tubeSpacing;
            const tubeBottomY = size * 0.85;
            const tubeTopY = size * 0.2;
            const tubeHeight = tubeBottomY - tubeTopY;
            const liquidHeight = (tubeHeight * content.level) / 100;

            return (
              <G key={index}>
                {/* Tube outline */}
                <Path
                  d={`
                    M ${tubeX} ${tubeBottomY}
                    L ${tubeX} ${tubeTopY + size * 0.02}
                    C ${tubeX} ${tubeTopY},
                      ${tubeX + tubeWidth} ${tubeTopY},
                      ${tubeX + tubeWidth} ${tubeTopY + size * 0.02}
                    L ${tubeX + tubeWidth} ${tubeBottomY}
                    C ${tubeX + tubeWidth} ${tubeBottomY + size * 0.02},
                      ${tubeX} ${tubeBottomY + size * 0.02},
                      ${tubeX} ${tubeBottomY}
                    Z
                  `}
                  fill="url(#glassGradient)"
                  stroke="#9E9E9E"
                  strokeWidth="1"
                />

                {/* Tube liquid */}
                {content.level > 0 && (
                  <Rect
                    x={tubeX + 1}
                    y={tubeBottomY - liquidHeight}
                    width={tubeWidth - 2}
                    height={liquidHeight}
                    fill={`url(#liquidGradient${index})`}
                    rx={1}
                  />
                )}

                {/* Tube top rim */}
                <Rect
                  x={tubeX - size * 0.01}
                  y={size * 0.15}
                  width={tubeWidth + size * 0.02}
                  height={size * 0.05}
                  fill="#E0E0E0"
                  rx={size * 0.01}
                />

                {/* Glass reflection highlight */}
                <Rect
                  x={tubeX + tubeWidth * 0.1}
                  y={tubeTopY + size * 0.03}
                  width={tubeWidth * 0.1}
                  height={tubeHeight - size * 0.04}
                  fill="#FFFFFF"
                  opacity={0.4}
                  rx={size * 0.005}
                />

                {/* Measurement marks on tube */}
                <G stroke="#B0BEC5" strokeWidth="0.3" opacity={0.7}>
                  {[25, 50, 75].map(mark => (
                    <Rect
                      key={mark}
                      x={tubeX + tubeWidth * 0.8}
                      y={tubeBottomY - (tubeHeight * mark) / 100}
                      width={tubeWidth * 0.15}
                      height="0.5"
                    />
                  ))}
                </G>
              </G>
            );
          })}
        </G>

        {/* Rack wood grain details */}
        <G stroke="#6D4C41" strokeWidth="0.5" opacity={0.6}>
          {/* Horizontal grain lines */}
          <Path d={`M ${size * 0.12} ${size * 0.82} L ${size * 0.88} ${size * 0.82}`} />
          <Path d={`M ${size * 0.12} ${size * 0.32} L ${size * 0.88} ${size * 0.32}`} />

          {/* Vertical grain lines */}
          <Path d={`M ${size * 0.125} ${size * 0.32} L ${size * 0.125} ${size * 0.8}`} />
          <Path d={`M ${size * 0.875} ${size * 0.32} L ${size * 0.875} ${size * 0.8}`} />
        </G>

        {/* Rack support details */}
        <G>
          {/* Corner brackets */}
          <Rect
            x={size * 0.14}
            y={size * 0.28}
            width={size * 0.03}
            height={size * 0.04}
            fill="#5D4037"
            rx={size * 0.005}
          />
          <Rect
            x={size * 0.83}
            y={size * 0.28}
            width={size * 0.03}
            height={size * 0.04}
            fill="#5D4037"
            rx={size * 0.005}
          />
        </G>
      </Svg>
    </View>
  );
};
