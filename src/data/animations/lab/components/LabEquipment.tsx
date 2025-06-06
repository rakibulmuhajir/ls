// ===========================================
// 11. src/data/animations/lab/components/LabExperiment.tsx
// ===========================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LabCanvas } from './LabCanvas';
import { InteractiveEquipment } from './InteractiveEquipment';

interface LabHeatingExperimentProps {
  width?: number;
  height?: number;
  showControls?: boolean;
}

export const LabHeatingExperiment: React.FC<LabHeatingExperimentProps> = ({
  width = 350,
  height = 300,
  showControls = true
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chemistry Lab Experiment</Text>

      <LabCanvas width={width} height={height} showTemperatureField={true}>
        <InteractiveEquipment
          type="bunsenBurner"
          x={80}
          y={250}
          width={60}
          height={80}
        />

        <InteractiveEquipment
          type="beaker"
          x={60}
          y={120}
          width={100}
          height={140}
        />

        <InteractiveEquipment
          type="thermometer"
          x={180}
          y={140}
          width={25}
          height={120}
        />
      </LabCanvas>

      {showControls && (
        <Text style={styles.instructions}>
          Touch and hold the Bunsen burner to heat the water!
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 14,
    color: '#4a5568',
    textAlign: 'center',
    marginTop: 12,
  },
});
