import React from 'react';
import { View, Text, Button } from 'react-native';
import { useAnimation } from '@/data/animations/UnifiedAnimationProvider';

const AnimationTestScreen = () => {
  const animationAPI = useAnimation();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Animation Context Test Screen</Text>
      <Button
        title="Check Animation Status"
        onPress={() => {
          console.log('Animation status:', {
            isRunning: animationAPI.isRunning,
            particles: animationAPI.getPhysicsState().particles.length
          });
        }}
      />
    </View>
  );
};

export default AnimationTestScreen;
