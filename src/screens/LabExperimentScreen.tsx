import React from 'react';
import { View, Text, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { LabAnimationProvider, LabHeatingExperiment } from '@/data/animations/lab';
import { useThemedStyles, useTheme } from '@/lib/ThemeContext';
import { Theme } from '@/lib/designSystem';

// ✅ DEFAULT EXPORT to match your navigation pattern
const LabExperimentScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>🧪 Chemistry Lab</Text>
          <Text style={styles.subtitle}>Interactive Molecular Heating Experiment</Text>
        </View>

        <LabAnimationProvider width={350} height={300}>
          <View style={styles.labContainer}>
            <LabHeatingExperiment
              width={350}
              height={300}
              showControls={true}
            />
          </View>
        </LabAnimationProvider>

        <View style={styles.learningSection}>
          <Text style={styles.sectionTitle}>What You'll Learn</Text>
          <View style={styles.learningPoints}>
            <Text style={styles.learningPoint}>• How molecular motion changes with temperature</Text>
            <Text style={styles.learningPoint}>• The relationship between heat and particle energy</Text>
            <Text style={styles.learningPoint}>• Real lab equipment and their functions</Text>
            <Text style={styles.learningPoint}>• Observable signs of heating (color changes, bubbling)</Text>
          </View>
        </View>

        <View style={styles.instructionsSection}>
          <Text style={styles.sectionTitle}>How to Use</Text>
          <View style={styles.instructions}>
            <Text style={styles.instruction}>1. Touch and hold the Bunsen burner to activate heating</Text>
            <Text style={styles.instruction}>2. Watch the thermometer show rising temperature</Text>
            <Text style={styles.instruction}>3. Observe particles changing color and moving faster</Text>
            <Text style={styles.instruction}>4. Look for bubbles when water gets very hot (80°C+)</Text>
            <Text style={styles.instruction}>5. Release the burner to see gradual cooling</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  labContainer: {
    margin: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  learningSection: {
    margin: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.md,
  },
  instructionsSection: {
    margin: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.xs,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.sm,
  },
  learningPoints: {
    gap: theme.spacing.xs,
  },
  learningPoint: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  instructions: {
    gap: theme.spacing.xs,
  },
  instruction: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.onSurface,
    lineHeight: 20,
  },
});

// ✅ DEFAULT EXPORT (matches your other screens)
export default LabExperimentScreen;
