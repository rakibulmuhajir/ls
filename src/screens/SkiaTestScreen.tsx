import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Canvas, Circle, Group, vec } from '@shopify/react-native-skia';
import {
  useSharedValue,
  useDerivedValue,
  withSpring,
  withRepeat,
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const SkiaTestScreen = () => {
  const canvasSize = 400;
  const [activeTest, setActiveTest] = useState<'bouncing'|'rotating'|'interactive'>('bouncing');
  const interactivePos = useSharedValue(vec(canvasSize/2, canvasSize/2));

  // Bouncing Ball Component
  const BouncingBall = ({ width, height }: {width: number, height: number}) => {
    const radius = 20;
    const x = useSharedValue(width/2);
    const y = useSharedValue(height/2);
    const dx = useSharedValue(3);
    const dy = useSharedValue(4);

    useEffect(() => {
      const update = () => {
        // Update position
        x.value += dx.value;
        y.value += dy.value;

        // Handle wall collisions with position correction
        if (x.value <= radius) {
          dx.value = Math.abs(dx.value);
          x.value = radius + 1;
        } else if (x.value >= width - radius) {
          dx.value = -Math.abs(dx.value);
          x.value = width - radius - 1;
        }

        if (y.value <= radius) {
          dy.value = Math.abs(dy.value);
          y.value = radius + 1;
        } else if (y.value >= height - radius) {
          dy.value = -Math.abs(dy.value);
          y.value = height - radius - 1;
        }

        requestAnimationFrame(update);
      };
      const frame = requestAnimationFrame(update);
      return () => cancelAnimationFrame(frame);
    }, [width, height]);

    return <Circle cx={useDerivedValue(() => x.value)}
                  cy={useDerivedValue(() => y.value)}
                  r={radius} color="blue" />;
  };

  // Rotating Circles Component
  const RotatingCircles = ({ width, height }: {width: number, height: number}) => {
    const rotation = useSharedValue(0);
    const scale = useSharedValue(1);

    useEffect(() => {
      rotation.value = withRepeat(
        withTiming(360, { duration: 2000 }),
        -1,
        false
      );
      scale.value = withRepeat(
        withTiming(1.5, { duration: 1000 }),
        -1,
        true
      );
    }, []);

    return (
      <Group
        origin={vec(width/2, height/2)}
        transform={useDerivedValue(() => [
          { rotate: rotation.value * (Math.PI/180) },
          { scale: scale.value }
        ])}
      >
        <Circle cx={width/2 - 50} cy={height/2} r={30} color="green" />
        <Circle cx={width/2 + 50} cy={height/2} r={30} color="purple" />
      </Group>
    );
  };

  // Interactive Ball Component
  const InteractiveBall = () => {
    return (
      <Circle
        cx={useDerivedValue(() => interactivePos.value.x)}
        cy={useDerivedValue(() => interactivePos.value.y)}
        r={40}
        color="orange"
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, activeTest === 'bouncing' && styles.activeButton]}
          onPress={() => setActiveTest('bouncing')}
        >
          <Text style={styles.buttonText}>Bouncing Ball</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, activeTest === 'rotating' && styles.activeButton]}
          onPress={() => setActiveTest('rotating')}
        >
          <Text style={styles.buttonText}>Rotating Circles</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, activeTest === 'interactive' && styles.activeButton]}
          onPress={() => setActiveTest('interactive')}
        >
          <Text style={styles.buttonText}>Interactive</Text>
        </TouchableOpacity>
      </View>

      <GestureDetector gesture={Gesture.Pan()
        .onChange((e) => {
          interactivePos.value = vec(e.x, e.y);
        })}
      >
        <Canvas style={styles.canvas}>
          {activeTest === 'bouncing' && <BouncingBall width={canvasSize} height={canvasSize} />}
          {activeTest === 'rotating' && <RotatingCircles width={canvasSize} height={canvasSize} />}
          {activeTest === 'interactive' && <InteractiveBall />}
        </Canvas>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: '#f0f0f0',
    alignItems: 'center'
  },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 10,
  },
  canvas: {
    width: 400,
    height: 400,
    borderWidth: 1,
    borderColor: '#ccc',
    alignSelf: 'center'
  },
  button: {
    padding: 10,
    margin: 5,
    backgroundColor: '#ddd',
    borderRadius: 5
  },
  activeButton: {
    backgroundColor: '#007bff'
  },
  buttonText: {
    color: '#333'
  }
});

export default SkiaTestScreen;
