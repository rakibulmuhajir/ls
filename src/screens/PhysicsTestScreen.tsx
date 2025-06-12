import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';

import { useAnimation } from '@/data/animations/providers/AnimationProvider';
import {
  BeakerFromRepassets,
  HydrogenMoleculeSVG,
  OxygenMoleculeSVG,
  SodiumCrystalSVG,
  BunsenBurnerFromRepassets
} from '@/data/animations/lab/assets';

const PhysicsTestScreen = () => {
  const animation = useAnimation();
  const [temperature, setTemperature] = useState(20);

  const [forceUpdate, setForceUpdate] = useState(0);
  const [evaporationRate, setEvaporationRate] = useState(0);
  const prevTemperature = useRef(temperature);

  useEffect(() => {
    if (prevTemperature.current !== temperature) {
      animation.setParams({ temperature });
      prevTemperature.current = temperature;
      setForceUpdate(prev => prev + 1); // Force re-render

      // Calculate evaporation rate based on temperature
      const boilingPoint = animation.substance?.boilingPoint ?? 100;
      if (temperature >= boilingPoint) {
        const overBoiling = temperature - boilingPoint;
        setEvaporationRate(Math.min(1, overBoiling / 10)); // 0-1 range
      } else {
        setEvaporationRate(0);
      }
    }
  }, [temperature, animation]);

  // Force re-render when substance changes
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [animation.substanceKey]);

  const liquidColor = temperature >= (animation.substance?.boilingPoint ?? 100)
    ? (animation.substance?.heatedColor || animation.substance?.color)
    : animation.substance?.color;

  return (
    <ScrollView contentContainerStyle={styles.galleryContainer}>
      <Text style={styles.galleryTitle}>
        Component Test: {animation.substance?.name}
      </Text>

      <View style={styles.assetWrapper}>
        <View style={styles.assetView}>
          {animation.substanceKey === 'H2O' && (
            <BeakerFromRepassets
              size={250}
              isBoiling={temperature >= (animation.substance?.boilingPoint ?? 100)}
              hasBubbles={temperature >= (animation.substance?.boilingPoint ?? 100)}
              liquidColor={liquidColor}
              liquidLevel={50}
              boilingPoint={animation.substance?.boilingPoint}
              evaporationRate={evaporationRate}
              temperature={temperature}
            />
          )}
          {animation.substanceKey === 'H' && (
            <HydrogenMoleculeSVG
              size={250}
              state={temperature < -259 ? 'solid' : temperature < -252 ? 'liquid' : 'gas'}
              temperature={temperature}
            />
          )}
          {animation.substanceKey === 'O' && (
            <OxygenMoleculeSVG
              size={250}
              state={temperature < -218 ? 'solid' : temperature < -182 ? 'liquid' : 'gas'}
              temperature={temperature}
            />
          )}
          {animation.substanceKey === 'Na' && (
            <SodiumCrystalSVG
              size={250}
              state={temperature < 97.8 ? 'solid' : temperature < 883 ? 'liquid' : 'gas'}
              temperature={temperature}
            />
          )}
          <BunsenBurnerFromRepassets
            size={150}
            intensity={temperature / 200}
            isActive={temperature > 30}
          />
        </View>
      </View>

      <View style={styles.componentControls}>
        <Text style={styles.label}>Environment Temperature: {temperature.toFixed(0)}°C</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={200}
          value={temperature}
          onValueChange={setTemperature}
        />
        <Text style={styles.label}>Boiling Point: {animation.substance?.boilingPoint}°C</Text>

        <View style={styles.buttonContainer}>
          <Button title="Water" onPress={() => animation.setSubstance('H2O')} />
          <Button title="Hydrogen" onPress={() => animation.setSubstance('H')} />
          <Button title="Oxygen" onPress={() => animation.setSubstance('O')} />
          <Button title="Sodium" onPress={() => animation.setSubstance('Na')} />
          <Button title="CuSO₄" onPress={() => animation.setSubstance('CuSO4')} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  galleryContainer: { padding: 20, alignItems: 'center' },
  galleryTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  assetWrapper: {
    marginBottom: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    elevation: 2,
    width: '90%'
  },
  assetView: {
    height: 220,
    width: 220,
    alignItems: 'center',
    justifyContent: 'center'
  },
  componentControls: {
    width: '90%',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    marginBottom: 20
  },
  label: { fontSize: 14, color: '#555', marginTop: 4 },
  slider: { width: '100%', height: 30 },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10
  },
});

export default PhysicsTestScreen;
