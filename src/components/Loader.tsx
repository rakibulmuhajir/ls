// src/components/Loader.tsx

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Theme } from '@/lib/designSystem'; // Adjust path
import { useThemedStyles } from '@/lib/ThemeContext'; // Adjust path

interface LoaderProps {
  loading: boolean;
  error?: string | null; // Simpler error type from your example
  onRetry?: () => void;
  overlay?: boolean; // To control overlay vs inline
}

const Loader: React.FC<LoaderProps> = ({ loading, error, onRetry, overlay = true }) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      const animateDot = (dot: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          ])
        );
      };

      const animation1 = animateDot(dot1, 0);
      const animation2 = animateDot(dot2, 150); // Slightly adjust delay for smoother look
      const animation3 = animateDot(dot3, 300);

      animation1.start();
      animation2.start();
      animation3.start();

      return () => {
        animation1.stop();
        animation2.stop();
        animation3.stop();
      };
    }
  }, [loading, dot1, dot2, dot3]);


  const styles = useThemedStyles((theme: Theme) => {
    const dotStyleForTheme = (animatedValue: Animated.Value) => ({
        opacity: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.4, 1], // Adjusted opacity range
        }),
        transform: [
          {
            scale: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1.2], // Adjusted scale range
            }),
          },
        ],
      });

    return {
      container: {
        ...(overlay ? StyleSheet.absoluteFillObject : { flex: 1, justifyContent: 'center', alignItems: 'center' }),
        backgroundColor: overlay ? (theme.isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)') : 'transparent',
        zIndex: overlay ? 1000 : undefined, // zIndex only for overlay
        alignItems: 'center', // Ensure content is centered even if not overlay
        justifyContent: 'center', // Ensure content is centered
      },
      contentWrapper: { // Wrapper for loading or error content
        padding: theme.spacing.lg,
        backgroundColor: overlay || error ? theme.colors.surface : 'transparent', // Card-like for overlay or error
        borderRadius: overlay || error ? theme.borderRadius.lg : 0,
        alignItems: 'center',
        minWidth: 200, // Give some width to the content box
        ...( (overlay || error) ? theme.shadows.md : {}), // Shadow for the box
      },
      loadingContainer: {
        alignItems: 'center',
      },
      dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.lg, // Increased margin
      },
      dot: {
        width: 10, // Slightly smaller dots
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.colors.primary, // Use theme primary color for dots
        marginHorizontal: theme.spacing.xs, // Use theme spacing
      },
      loadingText: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.onSurface, // Text on surface (if card BG) or onBackground
        fontWeight: theme.typography.fontWeight.medium,
      },
      errorBox: { // Combined with contentWrapper
        alignItems: 'center',
      },
      errorText: {
        fontSize: theme.typography.fontSize.lg,
        color: theme.colors.error,
        textAlign: 'center',
        marginBottom: theme.spacing.md,
        fontWeight: theme.typography.fontWeight.medium,
      },
      retryButton: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm + 2,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.md,
        ...theme.shadows.xs,
      },
      retryText: {
        color: theme.colors.onPrimary,
        fontWeight: theme.typography.fontWeight.semibold,
        fontSize: theme.typography.fontSize.base,
      },
      // Expose dotStyleForTheme to be used in render
      dotStyleForTheme,
    };
  });


  if (!loading && !error) return null;

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        {loading && (
          <View style={styles.loadingContainer}>
            <View style={styles.dotsContainer}>
              <Animated.View style={[styles.dot, styles.dotStyleForTheme(dot1)]} />
              <Animated.View style={[styles.dot, styles.dotStyleForTheme(dot2)]} />
              <Animated.View style={[styles.dot, styles.dotStyleForTheme(dot3)]} />
            </View>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}
        {error && !loading && ( // Show error only if not loading
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            {onRetry && (
              <Pressable onPress={onRetry} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default Loader;
