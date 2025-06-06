
import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useLabAnimation } from '../LabAnimationProvider';

interface LabCanvasProps {
  width: number;
  height: number;
  showTemperatureField?: boolean;
  children?: React.ReactNode;
}

export const LabCanvas: React.FC<LabCanvasProps> = ({
  width,
  height,
  showTemperatureField = false,
  children
}) => {
  const { particles, heatSources } = useLabAnimation();

  return (
    <View style={{ width, height, position: 'relative' }}>
      {/* Temperature Field Visualization (Optional) */}
      {showTemperatureField && (
        <View style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <Svg width={width} height={height} style={{ position: 'absolute' }}>
            {heatSources.map(heatSource => (
              heatSource.isActive && (
                <Circle
                  key={heatSource.id}
                  cx={heatSource.x}
                  cy={heatSource.y}
                  r={heatSource.radius}
                  fill="#ff6b6b"
                  opacity={0.1 + heatSource.intensity * 0.15}
                />
              )
            ))}
          </Svg>
        </View>
      )}

      {/* Particles Canvas */}
      <View style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        <Svg width={width} height={height}>
          <G>
            {particles.map(particle => (
              <Circle
                key={particle.id}
                cx={particle.x}
                cy={particle.y}
                r={particle.radius}
                fill={particle.color}
                opacity="0.8"
              />
            ))}
          </G>
        </Svg>
      </View>

      {/* Children (UI overlays) */}
      {children && (
        <View style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          {children}
        </View>
      )}
    </View>
  );
};
