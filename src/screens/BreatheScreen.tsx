import { View, StyleSheet, Text } from 'react-native';
import Constants from 'expo-constants';
import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import Breathe from '../components/BreatheAnimation';

export default function BreatheScreen() {
  return (
    <View style={styles.container}>
      <WithSkiaWeb
        getComponent={() => import('../components/BreatheAnimation')}
        fallback={<Text style={styles.loadingText}>Loading Skia Animation...</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
});
