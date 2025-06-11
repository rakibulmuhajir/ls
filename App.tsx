// App.tsx
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import AppStack from '@/layouts/AppNavigator';
import { AppThemeProvider, useTheme } from '@/lib/ThemeContext';
import { SimpleAnimationProvider } from '@/data/animations/SimpleAnimationProvider';
import { UnifiedAnimationProvider } from '@/data/animations/UnifiedAnimationProvider';

// Component that handles StatusBar based on theme
const ThemedStatusBar: React.FC = () => {
  const { theme } = useTheme();

  // Determine status bar style based on theme
  const getStatusBarStyle = () => {
    switch (theme.mode) {
      case 'dark':
        return 'light';
      case 'sepia':
      case 'highContrast':
      case 'light':
      default:
        return 'dark';
    }
  };

  return (
    <StatusBar
      style={getStatusBarStyle()}
      backgroundColor={theme.colors.background}
    />
  );
};

// Root App component
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Providers should wrap the NavigationContainer */}
      <AppThemeProvider>
        <SimpleAnimationProvider>
          <UnifiedAnimationProvider>
          <NavigationContainer>
            <ThemedStatusBar />
            <AppStack />
          </NavigationContainer>
          </UnifiedAnimationProvider>
        </SimpleAnimationProvider>
      </AppThemeProvider>
    </GestureHandlerRootView>
  );
}
