// src/data/animations/lab/components/InteractiveEquipment.tsx - UPDATED

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BunsenBurnerEnhanced, BeakerEnhanced, FlaskEnhanced } from '../assets/enhanced';
import { ThermometerSVG } from '../assets'; // Keep existing until replaced
import { useLabAnimation } from '../LabAnimationProvider';

interface InteractiveEquipmentProps {
  type: 'bunsenBurner' | 'beaker' | 'thermometer' | 'flask';
  x: number;
  y: number;
  width: number;
  height: number;
  // Remove onInteraction - no more direct touch heating
  autoHeat?: boolean; // For demo purposes
  heatCycle?: number; // Automatic heating cycle in seconds
  liquidLevel?: number; // For beaker/flask
  liquidColor?: string; // For beaker/flask
}

export const InteractiveEquipment: React.FC<InteractiveEquipmentProps> = ({
  type,
  x,
  y,
  width,
  height,
  autoHeat = false,
  heatCycle = 10,
  liquidLevel = 60,
  liquidColor
}) => {
  const labAnimation = useLabAnimation();
  const [heatSourceId, setHeatSourceId] = useState<string | null>(null);
  const [localTemp, setLocalTemp] = useState(25);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isHeating, setIsHeating] = useState(false);
  const [heatIntensity, setHeatIntensity] = useState(0);

  // Safely initialize equipment
  useEffect(() => {
    try {
      if (!labAnimation || isInitialized) return;

      if (type === 'bunsenBurner') {
        // Create heat source that will be controlled by physics, not touch
        const id = labAnimation.addHeatSource({
          x: x + width / 2,
          y: y - 10,
          radius: 60,
          intensity: 0,
          temperature: 0,
          isActive: false
        });
        setHeatSourceId(id);
      } else if (type === 'beaker') {
        // Create container boundary
        labAnimation.addBoundary({
          type: 'container',
          shape: 'rectangle',
          x: x + 8,
          y: y + height * 0.3,
          width: width - 16,
          height: height * 0.6,
          restitution: 0.3,
          friction: 0.1
        });

        // Add water particles
        for (let i = 0; i < 15; i++) {
          labAnimation.addParticle({
            x: x + 15 + Math.random() * (width - 30),
            y: y + height * 0.4 + Math.random() * (height * 0.4),
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: 2 + Math.random() * 2,
            mass: 1,
            color: '#4A90E2',
            maxSpeed: 1,
            vibrationIntensity: 0.1,
            temperature: 25,
            elementType: 'H2O'
          });
        }
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize equipment:', error);
    }
  }, [type, x, y, width, height, labAnimation, isInitialized]);

  // Auto-heating cycle for demonstration
  useEffect(() => {
    if (!autoHeat || type !== 'bunsenBurner' || !heatSourceId || !labAnimation) return;

    const interval = setInterval(() => {
      setIsHeating(prev => {
        const newHeating = !prev;

        try {
          if (newHeating) {
            // Start heating cycle
            labAnimation.updateHeatSource(heatSourceId, {
              intensity: 0.8,
              temperature: 75,
              isActive: true
            });
            setHeatIntensity(80);
          } else {
            // Stop heating cycle
            labAnimation.updateHeatSource(heatSourceId, {
              intensity: 0,
              temperature: 0,
              isActive: false
            });
            setHeatIntensity(0);
          }
        } catch (error) {
          console.error('Failed to update heat source:', error);
        }

        return newHeating;
      });
    }, heatCycle * 1000);

    return () => clearInterval(interval);
  }, [autoHeat, heatCycle, type, heatSourceId, labAnimation]);

  // Update local temperature for thermometer
  useEffect(() => {
    if (type === 'thermometer' && labAnimation && isInitialized) {
      const interval = setInterval(() => {
        try {
          const temp = labAnimation.getTemperatureAt(x + width / 2, y + height / 2);
          setLocalTemp(temp);
        } catch (error) {
          console.error('Failed to get temperature:', error);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [type, x, y, width, height, labAnimation, isInitialized]);

  // Render equipment based on type
  const renderEquipment = () => {
    try {
      switch (type) {
        case 'bunsenBurner':
          return (
            <BunsenBurnerEnhanced
              width={width}
              height={height}
              isActive={isHeating}
              intensity={heatIntensity}
              temperature={localTemp}
            />
          );

        case 'beaker':
          return (
            <BeakerEnhanced
              size={Math.min(width, height)}
              liquidLevel={liquidLevel}
              liquidColor={liquidColor}
              hasBubbles={localTemp > 80}
              temperature={localTemp}
            />
          );

        case 'flask':
          return (
            <FlaskEnhanced
              size={Math.min(width, height)}
              liquidLevel={liquidLevel}
              liquidColor={liquidColor || '#81C784'}
              isHeating={isHeating}
              hasBubbles={localTemp > 70}
              temperature={localTemp}
            />
          );

        case 'thermometer':
          return (
            <ThermometerSVG
              width={width}
              height={height}
              temperature={localTemp}
            />
          );

        default:
          return (
            <View style={{
              width,
              height,
              backgroundColor: '#ddd',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text style={{ fontSize: 12, color: '#666' }}>{type}</Text>
            </View>
          );
      }
    } catch (error) {
      console.error('Failed to render equipment:', error);
      return (
        <View style={{
          width,
          height,
          backgroundColor: '#f00',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Text style={{ fontSize: 10, color: '#fff' }}>Error</Text>
        </View>
      );
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'bunsenBurner':
        return `Bunsen Burner ${isHeating ? '(Heating)' : '(Off)'}`;
      case 'beaker':
        return `Beaker (${Math.round(localTemp)}°C)`;
      case 'flask':
        return `Flask (${Math.round(localTemp)}°C)`;
      case 'thermometer':
        return `${Math.round(localTemp)}°C`;
      default:
        return '';
    }
  };

  // Don't render until initialized
  if (!isInitialized && type === 'bunsenBurner') {
    return (
      <View style={[styles.container, { left: x, top: y, width, height }]}>
        <View style={{
          width,
          height,
          backgroundColor: '#ddd',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Text style={{ fontSize: 10, color: '#666' }}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          left: x,
          top: y,
          width,
          height,
        },
        isHeating && styles.activeContainer
      ]}
    >
      {renderEquipment()}

      <View style={styles.label}>
        <Text style={styles.labelText}>{getLabel()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  activeContainer: {
    // Visual feedback for active state
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  label: {
    position: 'absolute',
    bottom: -25,
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  labelText: {
    fontSize: 10,
    color: '#4a5568',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
