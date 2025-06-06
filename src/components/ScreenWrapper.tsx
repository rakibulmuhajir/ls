// src/components/ScreenWrapper.tsx

import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@/lib/designSystem'; // Adjust path as needed
import { useTheme, useThemedStyles } from '@/lib/ThemeContext'; // Adjust path as needed

const ScreenWrapper: React.FC<{ children: React.ReactNode; style?: object }> = ({ children, style }) => {
  const { theme } = useTheme(); // Get theme from context

  // Define styles directly here or pass them if they need more complex logic from the calling screen
  const wrapperStyles = useThemedStyles((currentTheme: Theme) => ({
    gradientContainer: {
      flex: 1,
    },
    baseContainer: { // This style is applied to the inner View of LinearGradient and the fallback View
      flex: 1,
    },
  }));

  const combinedStyle = [wrapperStyles.baseContainer, style]; // Allow overriding or extending styles

  // Condition to apply gradient (e.g., only for greywolf or non-dark themes)
  const applyGradient = theme.colors.backgroundGradient && (theme.mode === 'greywolf' || !theme.isDark);

  if (applyGradient) {
    return (
      <LinearGradient
        colors={[theme.colors.backgroundGradient.start, theme.colors.backgroundGradient.end]}
        style={wrapperStyles.gradientContainer}
      >
        <View style={combinedStyle}>{children}</View>
      </LinearGradient>
    );
  }

  return (
    <View style={[combinedStyle, { backgroundColor: theme.colors.background }]}>
      {children}
    </View>
  );
};

export default ScreenWrapper;
