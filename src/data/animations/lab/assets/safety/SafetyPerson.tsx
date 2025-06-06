// src/data/animations/lab/assets/safety/SafetyPerson.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { G, Path, Circle, Rect, Defs, ClipPath } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedPath = Animated.createAnimatedComponent(Path);

interface SafetyPersonProps {
  width?: number;
  height?: number;
  onSafetyStatusChange?: (isFullyProtected: boolean) => void;
  requiredEquipment?: Array<'goggles' | 'gloves' | 'labCoat' | 'faceShield'>;
  experimentType?: 'basic' | 'acid' | 'heat' | 'biological';
}

interface EquipmentState {
  goggles: boolean;
  gloves: boolean;
  labCoat: boolean;
  faceShield: boolean;
}

export const SafetyPerson: React.FC<SafetyPersonProps> = ({
  width = 300,
  height = 400,
  onSafetyStatusChange,
  requiredEquipment = ['goggles', 'labCoat', 'gloves'],
  experimentType = 'basic'
}) => {
  const [equipment, setEquipment] = useState<EquipmentState>({
    goggles: false,
    gloves: false,
    labCoat: false,
    faceShield: false
  });

  // Animation values
  const gogglesScale = useSharedValue(0);
  const glovesLeftPos = useSharedValue(-20);
  const glovesRightPos = useSharedValue(-20);
  const labCoatOpacity = useSharedValue(0);
  const faceShieldPos = useSharedValue(-30);

  // Equipment presets for different experiment types
  const experimentRequirements = {
    basic: ['goggles', 'labCoat', 'gloves'],
    acid: ['goggles', 'labCoat', 'gloves', 'faceShield'],
    heat: ['goggles', 'labCoat', 'gloves'],
    biological: ['labCoat', 'gloves']
  };

  const toggleEquipment = (item: keyof EquipmentState) => {
    const newValue = !equipment[item];
    setEquipment(prev => ({...prev, [item]: newValue}));

    // Animate based on equipment type
    switch(item) {
      case 'goggles':
        gogglesScale.value = withTiming(newValue ? 1 : 0, {
          duration: 500,
          easing: Easing.elastic(1)
        });
        break;
      case 'gloves':
        glovesLeftPos.value = withSpring(newValue ? 0 : -20);
        glovesRightPos.value = withSpring(newValue ? 0 : -20);
        break;
      case 'labCoat':
        labCoatOpacity.value = withTiming(newValue ? 1 : 0, {duration: 300});
        break;
      case 'faceShield':
        faceShieldPos.value = withSpring(newValue ? 0 : -30);
        break;
    }
  };

  const setExperimentPreset = (type: keyof typeof experimentRequirements) => {
    const required = experimentRequirements[type];

    // Reset all equipment first
    Object.keys(equipment).forEach(item => {
      if (equipment[item as keyof EquipmentState]) {
        toggleEquipment(item as keyof EquipmentState);
      }
    });

    // Activate required items with delay for visual effect
    required.forEach((item, index) => {
      setTimeout(() => {
        if (!equipment[item as keyof EquipmentState]) {
          toggleEquipment(item as keyof EquipmentState);
        }
      }, index * 300);
    });
  };

  const checkSafety = (): boolean => {
    return requiredEquipment.every(item => equipment[item]);
  };

  useEffect(() => {
    const isFullyProtected = checkSafety();
    onSafetyStatusChange?.(isFullyProtected);
  }, [equipment, requiredEquipment]);

  // Animated props
  const gogglesProps = useAnimatedProps(() => ({
    transform: [{ scale: gogglesScale.value }]
  }));

  const leftGloveProps = useAnimatedProps(() => ({
    transform: [{ translateX: glovesLeftPos.value }]
  }));

  const rightGloveProps = useAnimatedProps(() => ({
    transform: [{ translateX: glovesRightPos.value }]
  }));

  const labCoatProps = useAnimatedProps(() => ({
    opacity: labCoatOpacity.value
  }));

  const faceShieldProps = useAnimatedProps(() => ({
    transform: [{ translateY: faceShieldPos.value }]
  }));

  const centerX = width / 2;
  const centerY = height / 2;

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Scientist Figure */}
      <Svg width={width} height={height}>
        <Defs>
          <ClipPath id="personClip">
            <Rect x={centerX - 60} y={centerY - 100} width="120" height="200" />
          </ClipPath>
        </Defs>

        {/* Head */}
        <Circle cx={centerX} cy={centerY - 50} r="30" fill="#FFDBAC" />

        {/* Eyes (hidden when goggles are on) */}
        {!equipment.goggles && (
          <>
            <Path d={`M${centerX - 15} ${centerY - 60} Q${centerX - 5} ${centerY - 65} M${centerX + 5} ${centerY - 60}`}
                  fill="none" stroke="#000" strokeWidth="2" />
            <Path d={`M${centerX + 5} ${centerY - 60} Q${centerX + 15} ${centerY - 65} M${centerX + 25} ${centerY - 60}`}
                  fill="none" stroke="#000" strokeWidth="2" />
          </>
        )}

        {/* Safety Goggles */}
        <AnimatedG animatedProps={gogglesProps}>
          <Path
            d={`M${centerX - 25} ${centerY - 60} Q${centerX} ${centerY - 75} Q${centerX + 25} ${centerY - 60}
                Q${centerX + 20} ${centerY - 40} Q${centerX} ${centerY - 35} Q${centerX - 20} ${centerY - 40} Z`}
            fill="#A0D0FF"
            opacity="0.7"
            stroke="#555"
          />
          <Path d={`M${centerX} ${centerY - 50} L${centerX} ${centerY - 45}`} stroke="#555" strokeWidth="2" />
        </AnimatedG>

        {/* Face Shield */}
        <AnimatedG animatedProps={faceShieldProps}>
          <Path
            d={`M${centerX - 35} ${centerY - 80} Q${centerX} ${centerY - 90} Q${centerX + 35} ${centerY - 80}
                Q${centerX + 40} ${centerY - 20} Q${centerX} ${centerY - 10} Q${centerX - 40} ${centerY - 20} Z`}
            fill="#FFFFFF"
            opacity="0.4"
            stroke="#CCC"
          />
        </AnimatedG>

        {/* Body */}
        <Path d={`M${centerX - 20} ${centerY - 20} L${centerX + 20} ${centerY - 20}
                  L${centerX + 15} ${centerY + 80} L${centerX - 15} ${centerY + 80} Z`}
              fill="#4A7CFF" />

        {/* Lab Coat */}
        <AnimatedPath
          animatedProps={labCoatProps}
          d={`M${centerX - 25} ${centerY - 20} L${centerX + 25} ${centerY - 20}
              L${centerX + 20} ${centerY + 80} L${centerX - 20} ${centerY + 80} Z`}
          fill="white"
          stroke="#EEE"
          strokeWidth="2"
        />

        {/* Arms */}
        <Path d={`M${centerX + 20} ${centerY - 10} L${centerX + 50} ${centerY - 20}
                  L${centerX + 45} ${centerY + 10} L${centerX + 20} ${centerY + 20} Z`}
              fill="#FFDBAC" />
        <Path d={`M${centerX - 20} ${centerY - 10} L${centerX - 50} ${centerY - 20}
                  L${centerX - 45} ${centerY + 10} L${centerX - 20} ${centerY + 20} Z`}
              fill="#FFDBAC" />

        {/* Left Glove */}
        <AnimatedG animatedProps={leftGloveProps}>
          <Path
            d={`M${centerX - 60} ${centerY - 30} L${centerX - 40} ${centerY - 20}
                L${centerX - 45} ${centerY + 10} L${centerX - 65} ${centerY} Z`}
            fill={equipment.gloves ? "#00AAFF" : "#FFDBAC"}
          />
        </AnimatedG>

        {/* Right Glove */}
        <AnimatedG animatedProps={rightGloveProps}>
          <Path
            d={`M${centerX + 60} ${centerY - 30} L${centerX + 40} ${centerY - 20}
                L${centerX + 45} ${centerY + 10} L${centerX + 65} ${centerY} Z`}
            fill={equipment.gloves ? "#00AAFF" : "#FFDBAC"}
          />
        </AnimatedG>

        {/* Legs */}
        <Rect x={centerX - 15} y={centerY + 80} width="30" height="60" fill="#333" />
        <Rect x={centerX - 20} y={centerY + 135} width="40" height="15" rx="7" fill="#444" />
      </Svg>

      {/* Equipment Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, equipment.goggles && styles.activeButton]}
            onPress={() => toggleEquipment('goggles')}
          >
            <Text style={styles.buttonText}>🥽 Goggles</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, equipment.gloves && styles.activeButton]}
            onPress={() => toggleEquipment('gloves')}
          >
            <Text style={styles.buttonText}>🧤 Gloves</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, equipment.labCoat && styles.activeButton]}
            onPress={() => toggleEquipment('labCoat')}
          >
            <Text style={styles.buttonText}>🥼 Lab Coat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, equipment.faceShield && styles.activeButton]}
            onPress={() => toggleEquipment('faceShield')}
          >
            <Text style={styles.buttonText}>🛡️ Face Shield</Text>
          </TouchableOpacity>
        </View>

        {/* Experiment Presets */}
        <View style={styles.presetContainer}>
          <Text style={styles.presetTitle}>Quick Setup:</Text>
          <View style={styles.presetButtons}>
            {Object.keys(experimentRequirements).map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.presetButton, experimentType === type && styles.activePreset]}
                onPress={() => setExperimentPreset(type as keyof typeof experimentRequirements)}
              >
                <Text style={styles.presetText}>{type.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Safety Status */}
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, { color: checkSafety() ? '#4CAF50' : '#F44336' }]}>
            {checkSafety() ? "✅ Fully Protected" : "⚠️ Missing Safety Gear"}
          </Text>

          {!checkSafety() && (
            <Text style={styles.missingText}>
              Missing: {requiredEquipment.filter(item => !equipment[item]).join(', ')}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 10,
  },
  button: {
    padding: 10,
    backgroundColor: '#EEE',
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#A0FFA0',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  presetContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  presetTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  presetButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  presetButton: {
    padding: 8,
    backgroundColor: '#DDD',
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  activePreset: {
    backgroundColor: '#FFB74D',
  },
  presetText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  missingText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default SafetyPerson;
