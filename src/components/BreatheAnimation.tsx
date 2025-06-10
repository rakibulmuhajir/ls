import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const colors = ['#61bea2', '#529ca0'];
const circleSize = width / 4;

const BreatheAnimation = () => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: 3000,
        easing: Easing.inOut(Easing.ease)
      }),
      -1,
      true
    );
    return () => cancelAnimation(progress);
  }, []);

  const animatedCircles = Array(6).fill(0).map((_, index) => {
    const angle = (index * (2 * Math.PI)) / 6;
    const animatedStyle = useAnimatedStyle(() => {
      const distance = progress.value * (width / 4);
      const x = distance * Math.cos(angle);
      const y = distance * Math.sin(angle);
      const scale = 0.3 + progress.value * 0.7;

      return {
        transform: [
          { translateX: x },
          { translateY: y },
          { scale }
        ],
        opacity: 0.8
      };
    });

    return (
      <Animated.View
        key={index}
        style={[
          styles.circle,
          { backgroundColor: colors[index % 2] },
          animatedStyle
        ]}
      />
    );
  });

  return (
    <View style={styles.container}>
      {animatedCircles}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  circle: {
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
    position: 'absolute'
  }
});

export default BreatheAnimation;
