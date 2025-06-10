import { View, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import BreatheAnimation from '@/components/BreatheAnimation';

export default function BreatheScreen() {
  return (
    <View style={styles.container}>
      <BreatheAnimation />
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
});
