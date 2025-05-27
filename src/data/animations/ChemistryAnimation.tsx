// src/data/animations/ChemistryAnimation.tsx
import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { getAnimation } from './animationRegistry';
import { AnimationType } from './types';

interface ChemistryAnimationProps {
  type: AnimationType;
  height?: number;
  style?: any;
}

const ChemistryAnimation: React.FC<ChemistryAnimationProps> = ({
  type,
  height,
  style
}) => {
  const webViewRef = useRef<WebView>(null);
  const config = getAnimation(type);
  const finalHeight = height || config.height;

  // Handle animation control via postMessage
  const handleMessage = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'animationComplete' && config.loop) {
      webViewRef.current?.postMessage(JSON.stringify({ action: 'restart' }));
    }
  };

  return (
    <View style={[styles.container, { height: finalHeight }, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: config.html }}
        style={styles.webview}
        scrollEnabled={false}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default ChemistryAnimation;
