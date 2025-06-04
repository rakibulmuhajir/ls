// src/data/animations/AnimationPlayer.tsx - GENERIC VERSION
import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Modal,
  StatusBar
} from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '@/lib/ThemeContext';

// Import animation system instead of registry directly
import { animationSystem } from './AnimationSystem';
import { AnimationMessenger, MessageHandler } from './core/AnimationMessenger';

interface AnimationPlayerProps {
  animationId: string;
  height?: number;
  style?: any;
  onError?: (error: string) => void;
  onReady?: () => void;
}

const AnimationPlayer: React.FC<AnimationPlayerProps> = ({
  animationId,
  height,
  style,
  onError,
  onReady
}) => {
  const { theme } = useTheme();
  const webViewRef = useRef<WebView>(null);
  const screenData = Dimensions.get('screen');

  // Fullscreen modal state
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);

  // Get animation configuration from animation system
  const registry = animationSystem.getRegistry();
  const messenger = AnimationMessenger.getInstance();

  const [config, setConfig] = useState(() => {
    try {
      const result = registry.getAnimation(animationId);
      return result;
    } catch (error) {
      console.error('Animation configuration error:', error);
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if this animation should be fullscreen (from registry config)
  const isFullscreenAnimation = config?.template?.config?.fullscreen === true;

  // Calculate height for regular animations
  const finalHeight = height || config?.height || 400;

  // Set up message handling
  useEffect(() => {
    const messageHandler: MessageHandler = {
      onReady: () => {
        setIsLoading(false);
        onReady?.();
      },
      onError: (errorMessage) => {
        setError(errorMessage);
        setIsLoading(false);
        onError?.(errorMessage);
      },
      onStateUpdate: (state) => {
        // Handle state updates if needed
      }
    };

    messenger.register(animationId, messageHandler);

    return () => {
      messenger.unregister(animationId);
    };
  }, [animationId, onError, onReady]);

  // Fullscreen handlers
  const enterFullscreen = useCallback(() => {
    if (isFullscreenAnimation) {
      setIsFullscreenMode(true);
      StatusBar.setHidden(true, 'fade');
    }
  }, [isFullscreenAnimation]);

  const exitFullscreen = useCallback(() => {
    setIsFullscreenMode(false);
    StatusBar.setHidden(false, 'fade');
  }, []);

  // Handle WebView messages
  const handleMessage = useCallback((event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      // Auto-exit fullscreen when animation completes
      if (message.type === 'animationComplete') {
        setTimeout(() => {
          exitFullscreen();
        }, 2000);
      }

      messenger.handleMessage(animationId, event.nativeEvent.data);
    } catch (error) {
      console.error('Message handling error:', error);
      setError(`Message handling error: ${error}`);
    }
  }, [animationId, exitFullscreen]);

  const styles = useThemedStyles((theme) => ({
    // Regular container
    container: {
      width: '100%',
      height: finalHeight,
      marginVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.xl,
      overflow: 'hidden',
      backgroundColor: theme.colors.surfaceVariant,
    },

    // Preview container for fullscreen animations
    previewContainer: {
      width: '100%',
      height: finalHeight,
      borderRadius: theme.borderRadius.xl,
      overflow: 'hidden',
      position: 'relative',
    },

    previewImage: {
      width: '100%',
      height: '100%',
      backgroundColor: '#667eea', // Fallback gradient color
    },

    previewOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
    },

    playButton: {
      backgroundColor: 'rgba(255,255,255,0.9)',
      borderRadius: 50,
      width: 80,
      height: 80,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },

    playButtonText: {
      color: theme.colors.onSurface,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.bold,
      textAlign: 'center',
      marginTop: theme.spacing.xs,
    },

    previewTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: 'white',
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },

    previewSubtitle: {
      fontSize: theme.typography.fontSize.md,
      color: 'rgba(255,255,255,0.9)',
      textAlign: 'center',
      paddingHorizontal: theme.spacing.lg,
    },

    // Fullscreen modal styles
    fullscreenModal: {
      flex: 1,
      backgroundColor: 'black',
    },

    fullscreenWebView: {
      flex: 1,
      backgroundColor: 'black',
    },

    fullscreenCloseButton: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 50 : 30,
      right: 20,
      zIndex: 9999,
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },

    // Regular WebView
    webview: {
      flex: 1,
      backgroundColor: 'transparent',
    },

    // Error and loading states
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
    },

    loadingText: {
      marginTop: theme.spacing.md,
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.onSurface,
    },

    errorContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.lg,
      flex: 1,
    },

    errorText: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.error,
      marginTop: theme.spacing.md,
      textAlign: 'center',
    },

    errorMessage: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.onSurfaceVariant,
      marginTop: theme.spacing.sm,
      textAlign: 'center',
    },

    retryButton: {
      marginTop: theme.spacing.lg,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
    },

    retryButtonText: {
      color: theme.colors.onPrimary,
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.medium,
    },
  }));

  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer, style]}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={48}
          color={theme.colors.error}
        />
        <Text style={styles.errorText}>Animation Error</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setIsLoading(true);
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Config not found
  if (!config) {
    return (
      <View style={[styles.container, styles.errorContainer, style]}>
        <MaterialCommunityIcons
          name="animation-outline"
          size={48}
          color={theme.colors.onSurfaceVariant}
        />
        <Text style={styles.errorText}>Animation Not Found</Text>
        <Text style={styles.errorMessage}>Animation "{animationId}" is not available</Text>
      </View>
    );
  }

  // FULLSCREEN ANIMATION PREVIEW
  if (isFullscreenAnimation && !isFullscreenMode) {
    return (
      <TouchableOpacity
        style={[styles.previewContainer, style]}
        onPress={enterFullscreen}
        activeOpacity={0.9}
      >
        <View style={styles.previewImage}>
          <View style={{
            flex: 1,
            backgroundColor: '#667eea',
          }} />
        </View>

        <View style={styles.previewOverlay}>
          <TouchableOpacity style={styles.playButton} onPress={enterFullscreen}>
            <MaterialCommunityIcons
              name="play"
              size={40}
              color={theme.colors.primary}
            />
          </TouchableOpacity>

          <Text style={styles.previewTitle}>{config.name || 'Animation'}</Text>
          <Text style={styles.previewSubtitle}>
            Tap to experience the complete interactive animation
          </Text>
          <Text style={styles.playButtonText}>▶️ PLAY FULLSCREEN</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // FULLSCREEN MODAL
  if (isFullscreenAnimation && isFullscreenMode) {
    return (
      <Modal
        visible={isFullscreenMode}
        presentationStyle="fullScreen"
        animationType="fade"
        statusBarHidden={true}
        onRequestClose={exitFullscreen}
      >
        <View style={styles.fullscreenModal}>
          <TouchableOpacity
            style={styles.fullscreenCloseButton}
            onPress={exitFullscreen}
          >
            <MaterialCommunityIcons
              name="close"
              size={24}
              color="white"
            />
          </TouchableOpacity>

          {isLoading && (
            <View style={[styles.loadingContainer, { backgroundColor: 'black' }]}>
              <MaterialCommunityIcons
                name="loading"
                size={48}
                color="white"
              />
              <Text style={[styles.loadingText, { color: 'white' }]}>
                Loading Animation...
              </Text>
            </View>
          )}

          <WebView
            ref={webViewRef}
            source={{ html: config.html }}
            style={styles.fullscreenWebView}
            scrollEnabled={false}
            onMessage={handleMessage}
            onError={(error) => {
              console.error('Fullscreen WebView Error:', error);
              setError(`WebView Error: ${JSON.stringify(error)}`);
            }}
            onLoadEnd={() => setIsLoading(false)}
            onLoadStart={() => setIsLoading(true)}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            cacheEnabled={false}
            allowsInlineMediaPlayback={true}
            mixedContentMode="compatibility"
            originWhitelist={['*']}
          />
        </View>
      </Modal>
    );
  }

  // REGULAR ANIMATION
  return (
    <View style={[styles.container, style]}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons
            name="loading"
            size={48}
            color={theme.colors.primary}
          />
          <Text style={styles.loadingText}>Loading Animation...</Text>
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ html: config.html }}
        style={styles.webview}
        scrollEnabled={false}
        onMessage={handleMessage}
        onError={(error) => setError(`WebView Error: ${JSON.stringify(error)}`)}
        onLoadEnd={() => setIsLoading(false)}
        onLoadStart={() => setIsLoading(true)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        cacheEnabled={false}
        allowsInlineMediaPlayback={true}
        mixedContentMode="compatibility"
        originWhitelist={['*']}
      />
    </View>
  );
};

export default AnimationPlayer;
