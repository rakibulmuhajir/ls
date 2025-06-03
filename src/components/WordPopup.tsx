import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { getWordDetails } from '@/lib/api/getWordDetails';
import { useTheme, useThemedStyles } from '@/lib/ThemeContext';
import { createShadow } from '@/lib/designSystem';

interface WordData {
  word: string;
  shortMeaning: string;
  urduMeaning: string;
  termType: string;
}

interface WordDetailsData {
  word_text: string;
  meaning: string;
  explanation: string;
  urdu_meaning: string;
  term_type: string;
  properties: any;
}

interface WordPopupProps {
  visible: boolean;
  onClose: () => void;
  wordData: WordData | null;
  bookId?: number;
}

export default function WordPopup({ visible, onClose, wordData, bookId = 1 }: WordPopupProps) {
  const { theme } = useTheme();
  const [detailsData, setDetailsData] = useState<WordDetailsData | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const handleDetailsClick = async () => {
    if (!wordData?.word || detailsData) return;

    setLoadingDetails(true);
    setDetailsError(null);

    try {
      const details = await getWordDetails(wordData.word, bookId);
      setDetailsData(details);
      setShowDetails(true);
    } catch (error) {
      console.error('Error fetching word details:', error);
      setDetailsError('Could not load detailed information');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleClose = () => {
    setDetailsData(null);
    setShowDetails(false);
    setDetailsError(null);
    onClose();
  };

  const getTermTypeEmoji = (termType: string) => {
    const type = termType.toLowerCase();
    if (type.includes('element')) return '⚛️';
    if (type.includes('compound')) return '🧪';
    if (type.includes('concept')) return '💡';
    if (type.includes('process')) return '⚡';
    if (type.includes('reaction')) return '🔄';
    return '📖';
  };

  const getTermTypeColor = (termType: string) => {
    const type = termType.toLowerCase();
    if (type.includes('element')) return theme.colors.primary;
    if (type.includes('compound')) return theme.colors.secondary;
    if (type.includes('concept')) return theme.colors.accent;
    if (type.includes('process')) return theme.colors.error;
    if (type.includes('reaction')) return theme.colors.success;
    return theme.colors.onSurfaceVariant;
  };

  // Function to format property keys to user-friendly text
  const formatPropertyKey = (key: string) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Function to format property values
  const formatPropertyValue = (value: any) => {
    if (value === null || value === undefined) {
      return 'Not specified';
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (typeof value === 'object') {
      // If it's an array, join with commas
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      // If it's an object, format it nicely
      return JSON.stringify(value, null, 2);
    }

    return String(value);
  };

  const styles = useThemedStyles((theme) => ({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    popup: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      maxWidth: 400,
      width: '100%',
      maxHeight: '80%',
      ...createShadow(10),
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.surfaceVariant,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
    },
    wordHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    wordEmoji: {
      fontSize: 24,
      marginRight: theme.spacing.sm,
    },
    wordTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.onSurface,
      flex: 1,
    },
    closeButton: {
      padding: theme.spacing.sm,
      marginLeft: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
    },
    closeButtonText: {
      fontSize: 18,
      color: theme.colors.onSurfaceVariant,
      fontWeight: 'bold',
    },
    content: {
      padding: theme.spacing.lg,
    },
    termTypeBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.md,
    },
    termTypeText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      textTransform: 'capitalize',
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.sm,
    },
    meaningText: {
      fontSize: theme.typography.fontSize.base,
      lineHeight: 24,
      color: theme.colors.onSurfaceVariant,
    },
    urduText: {
      textAlign: 'right',
      fontFamily: 'System', // You might want to use a specific Urdu font
    },
    detailsButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      alignItems: 'center',
      marginTop: theme.spacing.sm,
      ...createShadow(2),
    },
    detailsButtonText: {
      color: theme.colors.onPrimary,
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.semibold,
    },
    errorContainer: {
      backgroundColor: theme.colors.error + '15',
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginTop: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.error + '30',
    },
    errorText: {
      color: theme.colors.error,
      fontSize: theme.typography.fontSize.sm,
      textAlign: 'center',
    },
    detailsContainer: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginTop: theme.spacing.sm,
    },
    detailsTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.md,
    },
    detailSection: {
      marginBottom: theme.spacing.md,
    },
    detailSectionTitle: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    detailText: {
      fontSize: theme.typography.fontSize.base,
      lineHeight: 22,
      color: theme.colors.onSurfaceVariant,
    },
    propertiesContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
    },
    propertyItem: {
      flexDirection: 'row',
      marginBottom: theme.spacing.xs,
      flexWrap: 'wrap',
    },
    propertyKey: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.onSurface,
      marginRight: theme.spacing.xs,
      minWidth: 80,
    },
    propertyValue: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.onSurfaceVariant,
      flex: 1,
    },
  }));

  if (!wordData) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.popup}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.wordHeader}>
              <Text style={styles.wordEmoji}>
                {getTermTypeEmoji(wordData.termType)}
              </Text>
              <Text style={styles.wordTitle}>{wordData.word}</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Term Type Badge */}
            <View style={[
              styles.termTypeBadge,
              { backgroundColor: `${getTermTypeColor(wordData.termType)}20` }
            ]}>
              <Text style={[
                styles.termTypeText,
                { color: getTermTypeColor(wordData.termType) }
              ]}>
                {wordData.termType}
              </Text>
            </View>

            {/* English Meaning */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📚 Meaning</Text>
              <Text style={styles.meaningText}>{wordData.shortMeaning}</Text>
            </View>

            {/* Urdu Meaning */}
            {wordData.urduMeaning && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🇵🇰 اردو معنی</Text>
                <Text style={[styles.meaningText, styles.urduText]}>{wordData.urduMeaning}</Text>
              </View>
            )}

            {/* Details Section */}
            {!showDetails && (
              <TouchableOpacity
                style={styles.detailsButton}
                onPress={handleDetailsClick}
                disabled={loadingDetails}
              >
                {loadingDetails ? (
                  <ActivityIndicator color={theme.colors.onPrimary} size="small" />
                ) : (
                  <Text style={styles.detailsButtonText}>📖 View Detailed Information</Text>
                )}
              </TouchableOpacity>
            )}

            {/* Error Message */}
            {detailsError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{detailsError}</Text>
              </View>
            )}

            {/* Detailed Information */}
            {showDetails && detailsData && (
              <View style={styles.detailsContainer}>
                <Text style={styles.detailsTitle}>📋 Detailed Information</Text>

                {detailsData.explanation && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Explanation:</Text>
                    <Text style={styles.detailText}>{detailsData.explanation}</Text>
                  </View>
                )}

                {detailsData.properties && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Properties:</Text>
                    <View style={styles.propertiesContainer}>
                      {Object.entries(detailsData.properties).map(([key, value]) => (
                        <View key={key} style={styles.propertyItem}>
                          <Text style={styles.propertyKey}>{formatPropertyKey(key)}:</Text>
                          <Text style={styles.propertyValue}>
                            {formatPropertyValue(value)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
