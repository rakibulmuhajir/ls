// ============================================
// UPDATED APP.TSX WITH THEME PROVIDER
// ============================================

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from '@/layouts/AppNavigator';
import { AppThemeProvider, useTheme } from '@/lib/ThemeContext';
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
  return (
    <AppThemeProvider>
        <AppContent />
    </AppThemeProvider>
  );
}
