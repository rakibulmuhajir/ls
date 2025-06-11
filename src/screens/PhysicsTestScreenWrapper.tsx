import React, { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { AnimationProvider } from '@/data/animations/providers/AnimationProvider';
import PhysicsTestScreen from './PhysicsTestScreen';

const PhysicsTestScreenWrapper = () => {
  const { width, height } = useWindowDimensions();
  // Set the height for the animation canvas, leaving room for controls
  const canvasHeight = height - 300;

  // Define the initial physics parameters for this specific test
  const initialParams = useMemo(() => ({
    temperature: 0.5,
    density: 0.4,
    surfaceTension: 0.2,
    gravity: 0.5,
  }), []);

  return (
    // The provider wraps the screen and passes down all the physics logic
    <AnimationProvider
      width={width}
      height={canvasHeight}
      initialParams={initialParams}
    >
      <PhysicsTestScreen />
    </AnimationProvider>
  );
};

export default PhysicsTestScreenWrapper;
