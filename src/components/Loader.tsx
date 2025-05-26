import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Lottie from 'lottie-react';
import loadingAnimation from '../../assets/animations/loading.json';


interface LoaderProps {
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const Loader: React.FC<LoaderProps> = ({ loading, error, onRetry }) => {
  if (!loading && !error) return null;

  return (
    <View style={styles.container}>
      {loading && (
     <Lottie
     animationData={loadingAnimation}
     loop
     style={styles.lottie}
   />
      )}
      {error && (
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
  );
};

export default Loader;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 10,
  },
  lottie: {
    width: 150,
    height: 150,
  },
  errorBox: {
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#7C3AED',
    borderRadius: 10,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
