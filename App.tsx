// ============================================
// UPDATED APP.TSX WITH THEME PROVIDER
// ============================================

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from '@/layouts/AppNavigator';
import { ThemeProvider, useTheme } from '@/lib/ThemeContext';
import { animationSystem } from '@/data/animations/AnimationSystem';
import { useEffect } from 'react';
// ============================================

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
// Main App component with theme integration
const AppContent: React.FC = () => {
  return (
    <>
      <ThemedStatusBar />
      <AppNavigator />
    </>
  );
};

// Root App component
export default function App() {
  useEffect(() => {
    // Initialize animation system on app start
    try {
      animationSystem.initialize();
      console.log('🎬 Animation system ready!');
    } catch (error) {
      console.error('❌ Failed to initialize animation system:', error);
    }
  }, []);
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
