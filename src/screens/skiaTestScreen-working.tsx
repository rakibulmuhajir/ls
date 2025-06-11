import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  vec
} from '@shopify/react-native-skia';
import {
  useSharedValue,
  useDerivedValue,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const canvasSize = 400;

type TestComponentProps = {
  width: number;
  height: number;
};

const BouncingBall = ({ width, height }: TestComponentProps) => {
  const x = useSharedValue(width / 2);
  const y = useSharedValue(height / 2);
  const dx = useSharedValue(3);
  const dy = useSharedValue(2);
  const radius = 20;

  useEffect(() => {
    let animationFrameId: number;

    const update = () => {
      'worklet';
      x.value += dx.value;
      y.value += dy.value;

      if (x.value < radius || x.value > width - radius) {
        dx.value *= -1;
      }
      if (y.value < radius || y.value > height - radius) {
        dy.value *= -1;
      }

      animationFrameId = requestAnimationFrame(() => runOnJS(update)());
    };

    animationFrameId = requestAnimationFrame(() => runOnJS(update)());
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const cx = useDerivedValue(() => x.value);
  const cy = useDerivedValue(() => y.value);

  return <Circle cx={cx} cy={cy} r={radius} color="blue" />;
};

const RotatingCircles = ({ width, height }: TestComponentProps) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    let animationFrameId: number;

    const update = () => {
      'worklet';
      rotation.value = (rotation.value + 1) % 360;
      scale.value = 1 + 0.5 * Math.sin(Date.now() / 500);
      animationFrameId = requestAnimationFrame(() => runOnJS(update)());
    };

    animationFrameId = requestAnimationFrame(() => runOnJS(update)());
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const transform = useDerivedValue(() => [
    { rotate: rotation.value * (Math.PI / 180) },
    { scale: scale.value }
  ]);

  return (
    <Group origin={vec(width / 2, height / 2)} transform={transform}>
      <Circle cx={width / 2 - 50} cy={height / 2} r={30} color="green" />
      <Circle cx={width / 2 + 50} cy={height / 2} r={30} color="purple" />
    </Group>
  );
};

const InteractiveBall = ({ pos }: { pos: any }) => {
  const animatedX = useDerivedValue(() => pos.value.x);
  const animatedY = useDerivedValue(() => pos.value.y);

  return <Circle cx={animatedX} cy={animatedY} r={40} color="orange" />;
};

const SkiaTestScreen = () => {
  const [activeTest, setActiveTest] = useState<'bouncing' | 'rotating' | 'interactive'>('bouncing');
  const pos = useSharedValue(vec(canvasSize / 2, canvasSize / 2));

  const gesture = Gesture.Pan().onChange((e) => {
    pos.value = vec(e.x, e.y);
  });

  const renderTest = () => {
    switch (activeTest) {
      case 'bouncing':
        return <BouncingBall width={canvasSize} height={canvasSize} />;
      case 'rotating':
        return <RotatingCircles width={canvasSize} height={canvasSize} />;
      case 'interactive':
        return <InteractiveBall pos={pos} />;
      default:
        return null;
    }
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

      <GestureDetector gesture={gesture}>
        <Canvas style={styles.canvas}>
          {renderTest()}
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
    width: canvasSize,
    height: canvasSize,
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
