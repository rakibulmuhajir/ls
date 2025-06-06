// ===========================================
// 3. src/data/animations/lab/components/LabExperiment.tsx - SAFER VERSION
// ===========================================

import React, { useState } from 'react';
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
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Lab Error: {error}</Text>
          <Text style={styles.errorSubtext}>Please try reloading the app</Text>
        </View>
      </View>
    );
  }

  try {
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
            onInteraction={(action) => {
              console.log('Bunsen burner interaction:', action);
            }}
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
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
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
  errorContainer: {
    padding: 20,
    backgroundColor: '#fed7d7',
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#c53030',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#9c4221',
  },
});
