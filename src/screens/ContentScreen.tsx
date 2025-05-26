import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  UIManager,
  LayoutAnimation,
  SafeAreaView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getSectionsWithElements } from '@/lib/api/getSectionsWithElements';
import { useFetch } from '@/hooks/useFetch';
import Loader from '@/components/Loader';
import BottomNavigationBar from '@/components/BottomNavigationBar';
import {
  brandColors,
  typography,
  spacing,
  layout,
  screenStyles,
  getSectionStyles,
  getContentBackground,
  enhancedComponentStyles,
  createShadow
} from '@/lib/designSystem';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// Helper for section styling using new design system
const getSectionStyleDetails = (sectionTitle: string) => {
  const normalizedTitle = sectionTitle.toUpperCase().replace(/\s+/g, '_');
  return getSectionStyles(normalizedTitle);
};

const getContentBg = (sectionTitle: string) => {
  const normalizedTitle = sectionTitle.toUpperCase().replace(/\s+/g, '_');
  return getContentBackground(normalizedTitle);
};

export default function ContentScreen() {
  const route = useRoute<any>();
  const { topicId, chapterId, bookId, topics } = route.params || {};

  const fetcher = React.useCallback(() => getSectionsWithElements(topicId), [topicId]);
  const { data: sections, loading, error } = useFetch(fetcher);

  const [expandedSections, setExpandedSections] = useState<number[]>([]);
  const [expandedAnswers, setExpandedAnswers] = useState<number[]>([]);

  // Expand first section when data loads
  React.useEffect(() => {
    if (sections && sections.length > 0) {
      setExpandedSections([sections[0].section_pk]);
    }
  }, [sections]);

  const toggleSection = (sectionPk: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSections((prev) =>
      prev.includes(sectionPk) ? prev.filter((id) => id !== sectionPk) : [...prev, sectionPk]
    );
  };

  const toggleAnswer = (elementPk: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedAnswers((prev) =>
      prev.includes(elementPk) ? prev.filter((id) => id !== elementPk) : [...prev, elementPk]
    );
  };

  if (loading) return <Loader loading={loading} />;

  if (error) {
    return (
      <View style={styles.centeredMessage}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!sections || sections.length === 0) {
    return (
      <View style={styles.centeredMessage}>
        <Text style={styles.emptyText}>No content found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {sections.map((section) => {
          const isExpanded = expandedSections.includes(section.section_pk);
          const sectionStyle = getSectionStyleDetails(section.title || 'DEFAULT');
          const contentBg = getContentBg(section.title || 'DEFAULT');

          return (
            <View key={section.section_pk} style={styles.sectionCard}>
              {/* Section Header */}
              <TouchableOpacity
                style={[
                  styles.sectionHeader,
                  { backgroundColor: sectionStyle.headerBgColor }
                ]}
                onPress={() => toggleSection(section.section_pk)}
                activeOpacity={0.8}
              >
                <Text style={styles.sectionEmoji}>{sectionStyle.iconEmoji}</Text>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <MaterialCommunityIcons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={typography.fontSize.xl}
                  color={sectionStyle.headerTextColor}
                />
              </TouchableOpacity>

              {/* Section Content */}
              {isExpanded && (
                <View style={[
                  styles.sectionContent,
                  { backgroundColor: contentBg }
                ]}>
                  {section.content_elements.map((ce: any) => {
                    const isAnswerType = ce.element_type === 'ANSWER' || ce.element_type === 'ANSWER_FRAMEWORK';
                    const isAnswerExpanded = expandedAnswers.includes(ce.element_pk);

                    return (
                      <View key={ce.element_pk} style={styles.contentElement}>
                        {/* Content Title */}
                        {ce.title_attribute && (
                          <Text style={styles.contentTitle}>
                            {ce.title_attribute}
                          </Text>
                        )}

                        {/* Text Content */}
                        {(!isAnswerType || isAnswerExpanded) && ce.text_content && (
                          <Text style={styles.contentText}>
                            {ce.text_content}
                          </Text>
                        )}

                        {/* List Items */}
                        {(!isAnswerType || isAnswerExpanded) && ce.list_items?.length > 0 && (
                          <View style={styles.listContainer}>
                            {ce.list_items.map((li: any) => (
                              <View key={li.list_item_pk} style={styles.listItem}>
                                <Text style={styles.listBullet}>•</Text>
                                <Text style={styles.listText}>
                                  {li.item_text}
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}

                        {/* Answer Toggle Button */}
                        {isAnswerType && (
                          <View style={styles.answerTogglePanel}>
                            <TouchableOpacity
                              style={[
                                styles.toggleButton,
                                {
                                  backgroundColor: isAnswerExpanded
                                    ? brandColors.error + '20'
                                    : brandColors.primary.lighter
                                }
                              ]}
                              onPress={() => toggleAnswer(ce.element_pk)}
                              activeOpacity={0.7}
                            >
                              <MaterialCommunityIcons
                                name={isAnswerExpanded ? 'eye-off-outline' : 'eye-outline'}
                                size={typography.fontSize.lg}
                                color={isAnswerExpanded ? brandColors.error : brandColors.primary.main}
                              />
                              <Text style={[
                                styles.toggleButtonText,
                                { color: isAnswerExpanded ? brandColors.error : brandColors.primary.main }
                              ]}>
                                {isAnswerExpanded ? 'Hide Answer' : 'Reveal Answer'}
                              </Text>
                              <MaterialCommunityIcons
                                name={isAnswerExpanded ? 'chevron-up' : 'chevron-down'}
                                size={typography.fontSize.lg}
                                color={isAnswerExpanded ? brandColors.error : brandColors.primary.main}
                              />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      {topicId && chapterId && bookId && topics ? (
        <BottomNavigationBar
          topicId={topicId}
          chapterId={chapterId}
          bookId={bookId}
          topics={topics}
        />
      ) : (
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>
            Navigation Debug: topicId={topicId}, chapterId={chapterId}, bookId={bookId}, topics={topics ? 'exists' : 'missing'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: brandColors.background,
  },

  container: {
    ...screenStyles.container,
    paddingBottom: spacing.xl,
  },

  centeredMessage: {
    ...screenStyles.centeredContainer,
  },

  errorText: {
    ...screenStyles.errorText,
  },

  emptyText: {
    ...screenStyles.emptyText,
  },

  // Section Card Styling
  sectionCard: {
    ...enhancedComponentStyles.sectionCard,
    marginBottom: spacing.md,
  },

  sectionHeader: {
    ...enhancedComponentStyles.sectionHeader,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 64,
  },

  sectionEmoji: {
    fontSize: typography.fontSize.xl,
    marginRight: spacing.sm,
  },

  sectionTitle: {
    ...enhancedComponentStyles.sectionTitle,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    flex: 1,
    marginLeft: spacing.sm,
    letterSpacing: 0.5,
  },

  sectionContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },

  // Content Element Styling
  contentElement: {
    marginBottom: spacing.md,
  },

  contentTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: brandColors.neutral.dark,
    marginBottom: spacing.sm,
    lineHeight: typography.lineHeight.normal * typography.fontSize.lg,
  },

  contentText: {
    ...enhancedComponentStyles.contentText,
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    color: brandColors.neutral.dark,
    marginBottom: spacing.sm,
  },

  // List Styling
  listContainer: {
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },

  listItem: {
    ...enhancedComponentStyles.listItem,
    marginBottom: spacing.sm,
  },

  listBullet: {
    ...enhancedComponentStyles.listBullet,
    fontSize: typography.fontSize.base,
    color: brandColors.neutral.main,
    marginRight: spacing.sm,
    marginTop: 2,
  },

  listText: {
    ...enhancedComponentStyles.listText,
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    color: brandColors.neutral.dark,
    flex: 1,
  },

  // Answer Toggle Styling
  answerTogglePanel: {
    marginTop: spacing.sm,
  },

  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: brandColors.neutral.lighter,
    ...createShadow(1),
  },

  toggleButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    marginHorizontal: spacing.sm,
  },

  // Debug Container
  debugContainer: {
    backgroundColor: brandColors.error + '20',
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: brandColors.error + '40',
  },

  debugText: {
    fontSize: typography.fontSize.xs,
    color: brandColors.error,
    textAlign: 'center',
    fontWeight: typography.fontWeight.medium,
  },
});
