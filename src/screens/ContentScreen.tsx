import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { getSectionsWithElements } from '@/lib/api/getSectionsWithElements';
import { useFetch } from '@/hooks/useFetch';
import Loader from '@/components/Loader';
import BottomNavigationBar from '@/components/BottomNavigationBar';
import { ChemistryAnimation, AnimationType } from '@/data/animations';
import AnimationDebugTool from '@/data/animations/AnimationDebugTool';
import {
  brandColors,
  typography,
  spacing,
  screenStyles,
  getSectionStyles,
  getContentBackground,
  enhancedComponentStyles,
} from '@/lib/designSystem';

// Configuration for which memory techniques to display
const MEMORY_TECHNIQUES_CONFIG = {
  enabledTechniques: [
    'VISUAL_MNEMONICS',
    'ACRONYMS_ACROSTICS',
    'STORY_METHOD'
  ],
  maxTechniquesPerType: 3, // Limit number of items per technique type
  showEffectivenessRanking: true,
  showPracticeInstructions: false, // Can be toggled based on user preference
};

// Enhanced content element renderer
const ContentElement = ({ element }: { element: any }) => {
  const renderTextWithAnimations = (text: string) => {
    if (!text) return null;

    // Split text by animation placeholders - now supports both implemented and placeholder animations
    const parts = text.split(/(\[ANIMATION(?:_PLACEHOLDER)?:[^:]+:[^:]+\])/g);

    return parts.map((part, index) => {
      // Check if this part is an implemented animation
      const animationMatch = part.match(/\[ANIMATION:([^:]+):([^:]+)\]/);
      const placeholderMatch = part.match(/\[ANIMATION_PLACEHOLDER:([^:]+):([^:]+)\]/);

      if (animationMatch) {
        const [, animationType, height] = animationMatch;
        return (
          <ChemistryAnimation
            key={index}
            type={animationType as AnimationType}
            height={parseInt(height)}
          />
        );
      }
  //     if (animationMatch) {
  // const [, animationType, height] = animationMatch;
  // return (
  //   <AnimationDebugTool key={index} />
  // );
// }
      if (placeholderMatch) {
        const [, animationRef, height] = placeholderMatch;
        return (
          <View key={index} style={[styles.animationPlaceholder, { height: parseInt(height) }]}>
            <Text style={styles.placeholderText}>
              🎬 Animation: "{animationRef}"
            </Text>
            <Text style={styles.placeholderSubtext}>
              (Coming Soon)
            </Text>
          </View>
        );
      }

      // Regular text - process formatting
      return (
        <Text key={index} style={enhancedComponentStyles.contentText}>
          {formatText(part)}
        </Text>
      );
    });
  };

  const formatText = (text: string) => {
    // Handle bold, italic, and formulas
    return text
      .replace(/\*\*(.*?)\*\*/g, (match, content) => content) // Remove markdown for now
      .replace(/\*(.*?)\*/g, (match, content) => content)
      .replace(/\[([^:]+):([^\]]+)\]/g, (match, type, content) => {
        if (type === 'chemical') return content;
        return content;
      });
  };

  const renderListItems = () => {
    if (!element.list_items || element.list_items.length === 0) return null;

    return element.list_items
      .sort((a: any, b: any) => a.order_in_list - b.order_in_list)
      .map((item: any) => (
        <View key={item.list_item_pk} style={enhancedComponentStyles.listItem}>
          <Text style={enhancedComponentStyles.listBullet}>•</Text>
          <Text style={enhancedComponentStyles.listText}>
            {formatText(item.item_text)}
          </Text>
        </View>
      ));
  };

  const renderMemoryTechniques = () => {
    const { element_type, text_content, title_attribute } = element;

    // Check if this memory technique type is enabled
    const techniqueType = element_type.replace('_CONTAINER', '').replace('_ITEM', '');
    if (element_type.includes('_CONTAINER') &&
        !MEMORY_TECHNIQUES_CONFIG.enabledTechniques.includes(techniqueType)) {
      return null; // Skip disabled technique types
    }

    switch (element_type) {
      case 'VISUAL_MNEMONICS_CONTAINER':
        return (
          <View style={[styles.memoryContainer, styles.visualMnemonicContainer]}>
            <Text style={styles.memoryTitle}>🧠 Visual Mnemonics</Text>
          </View>
        );

      case 'VISUAL_MNEMONIC_ITEM':
        return (
          <View style={[styles.memoryItem, styles.visualMnemonicItem]}>
            {renderTextWithAnimations(text_content)}
          </View>
        );

      case 'ACRONYMS_ACROSTICS_CONTAINER':
        return (
          <View style={[styles.memoryContainer, styles.acronymContainer]}>
            <Text style={styles.memoryTitle}>🔤 Acronyms & Acrostics</Text>
          </View>
        );

      case 'ACRONYMS_ACROSTICS_ITEM':
        return (
          <View style={[styles.memoryItem, styles.acronymItem]}>
            {renderTextWithAnimations(text_content)}
          </View>
        );

      case 'STORY_METHOD_CONTAINER':
        return (
          <View style={[styles.memoryContainer, styles.storyContainer]}>
            <Text style={styles.memoryTitle}>📚 Story Method</Text>
          </View>
        );

      case 'STORY_METHOD_ITEM':
        return (
          <View style={[styles.memoryItem, styles.storyItem]}>
            <Text style={styles.storyTitle}>{title_attribute}</Text>
            {renderTextWithAnimations(text_content)}
          </View>
        );

      case 'KEYWORD_ASSOCIATIONS_CONTAINER':
        return MEMORY_TECHNIQUES_CONFIG.enabledTechniques.includes('KEYWORD_ASSOCIATIONS') ? (
          <View style={[styles.memoryContainer, styles.keywordContainer]}>
            <Text style={styles.memoryTitle}>🔑 Keyword Associations</Text>
          </View>
        ) : null;

      case 'KEYWORD_ASSOCIATIONS_ITEM':
        return MEMORY_TECHNIQUES_CONFIG.enabledTechniques.includes('KEYWORD_ASSOCIATIONS') ? (
          <View style={[styles.memoryItem, styles.keywordItem]}>
            {renderTextWithAnimations(text_content)}
          </View>
        ) : null;

      case 'MEMORY_PALACE_CONTAINER':
        return MEMORY_TECHNIQUES_CONFIG.enabledTechniques.includes('MEMORY_PALACE') ? (
          <View style={[styles.memoryContainer, styles.memoryPalaceContainer]}>
            <Text style={styles.memoryTitle}>🏰 Memory Palace</Text>
          </View>
        ) : null;

      case 'MEMORY_PALACE_ITEM':
        return MEMORY_TECHNIQUES_CONFIG.enabledTechniques.includes('MEMORY_PALACE') ? (
          <View style={[styles.memoryItem, styles.memoryPalaceItem]}>
            {renderTextWithAnimations(text_content)}
          </View>
        ) : null;

      case 'PRACTICE_INSTRUCTIONS_CONTAINER':
        return MEMORY_TECHNIQUES_CONFIG.showPracticeInstructions ? (
          <View style={[styles.memoryContainer, styles.practiceContainer]}>
            <Text style={styles.memoryTitle}>🎯 Practice Instructions</Text>
          </View>
        ) : null;

      case 'PRACTICE_INSTRUCTIONS_ITEM':
        return MEMORY_TECHNIQUES_CONFIG.showPracticeInstructions ? (
          <View style={[styles.memoryItem, styles.practiceItem]}>
            {renderTextWithAnimations(text_content)}
          </View>
        ) : null;

      case 'EFFECTIVENESS_RANKING_CONTAINER':
        return MEMORY_TECHNIQUES_CONFIG.showEffectivenessRanking ? (
          <View style={[styles.memoryContainer, styles.effectivenessContainer]}>
            <Text style={styles.memoryTitle}>📊 Effectiveness Ranking</Text>
          </View>
        ) : null;

      case 'EFFECTIVENESS_RANKING_ITEM':
        return MEMORY_TECHNIQUES_CONFIG.showEffectivenessRanking ? (
          <View style={[styles.memoryItem, styles.effectivenessItem]}>
            {renderTextWithAnimations(text_content)}
          </View>
        ) : null;

      default:
        return null;
    }
  };

  // Check if this is a memory technique element
  if (element.element_type.includes('MEMORY') ||
      element.element_type.includes('VISUAL_MNEMONIC') ||
      element.element_type.includes('ACRONYM') ||
      element.element_type.includes('STORY_METHOD') ||
      element.element_type.includes('KEYWORD') ||
      element.element_type.includes('PALACE') ||
      element.element_type.includes('PRACTICE') ||
      element.element_type.includes('EFFECTIVENESS')) {
    return renderMemoryTechniques();
  }

  // Handle regular content elements
  switch (element.element_type) {
    case 'PARAGRAPH':
      return (
        <View style={styles.paragraphContainer}>
          {renderTextWithAnimations(element.text_content)}
        </View>
      );

    case 'ANALOGY':
    case 'EXAMPLE':
    case 'CONNECTION_ITEM':
    case 'FUN_FACT':
    case 'INTERACTIVE_PROMPT':
      return (
        <View style={styles.specialContentContainer}>
          {element.title_attribute && (
            <Text style={styles.specialContentTitle}>{element.title_attribute}</Text>
          )}
          {renderTextWithAnimations(element.text_content)}
          {renderListItems()}
        </View>
      );

    case 'KEY_POINTS_CONTAINER':
      return (
        <View style={styles.keyPointsContainer}>
          <Text style={styles.keyPointsTitle}>Key Points</Text>
          {renderListItems()}
        </View>
      );

    case 'EXERCISE_HEADER':
      return (
        <View style={styles.exerciseHeader}>
          <Text style={styles.exerciseTitle}>{element.title_attribute}</Text>
        </View>
      );

    case 'QUESTION':
      return (
        <View style={styles.questionContainer}>
          <Text style={styles.questionLabel}>Question:</Text>
          {renderTextWithAnimations(element.text_content)}
          {renderListItems()}
        </View>
      );

    case 'ANSWER':
      return (
        <View style={styles.answerContainer}>
          <Text style={styles.answerLabel}>Answer:</Text>
          {renderTextWithAnimations(element.text_content)}
        </View>
      );

    case 'ANSWER_FRAMEWORK':
      return (
        <View style={styles.answerFrameworkContainer}>
          <Text style={styles.answerFrameworkLabel}>Answer Framework:</Text>
          {renderTextWithAnimations(element.text_content)}
        </View>
      );

    case 'LIST_UNORDERED_CONTAINER':
    case 'LIST_ORDERED_CONTAINER':
    case 'LIST_ALPHA_ORDERED_CONTAINER':
      return (
        <View style={styles.listContainer}>
          {element.title_attribute && (
            <Text style={styles.listTitle}>{element.title_attribute}</Text>
          )}
          {renderListItems()}
        </View>
      );

    default:
      return (
        <View style={styles.defaultContainer}>
          {element.title_attribute && (
            <Text style={styles.defaultTitle}>{element.title_attribute}</Text>
          )}
          {renderTextWithAnimations(element.text_content)}
          {renderListItems()}
        </View>
      );
  }
};

// Filter memory technique elements based on configuration
const filterMemoryTechniqueElements = (elements: any[]) => {
  const filteredElements: any[] = [];
  const techniqueItemCounts: { [key: string]: number } = {};

  elements.forEach(element => {
    const elementType = element.element_type;

    // Always include container elements if technique is enabled
    if (elementType.includes('_CONTAINER')) {
      const techniqueType = elementType.replace('_CONTAINER', '');
      if (MEMORY_TECHNIQUES_CONFIG.enabledTechniques.includes(techniqueType) ||
          elementType === 'PRACTICE_INSTRUCTIONS_CONTAINER' && MEMORY_TECHNIQUES_CONFIG.showPracticeInstructions ||
          elementType === 'EFFECTIVENESS_RANKING_CONTAINER' && MEMORY_TECHNIQUES_CONFIG.showEffectivenessRanking) {
        filteredElements.push(element);
        techniqueItemCounts[techniqueType] = 0;
      }
      return;
    }

    // Filter item elements based on limits
    if (elementType.includes('_ITEM')) {
      const techniqueType = elementType.replace('_ITEM', '');

      // Check if technique is enabled
      if (!MEMORY_TECHNIQUES_CONFIG.enabledTechniques.includes(techniqueType) &&
          !(elementType === 'PRACTICE_INSTRUCTIONS_ITEM' && MEMORY_TECHNIQUES_CONFIG.showPracticeInstructions) &&
          !(elementType === 'EFFECTIVENESS_RANKING_ITEM' && MEMORY_TECHNIQUES_CONFIG.showEffectivenessRanking)) {
        return;
      }

      // Check item limit
      if (techniqueItemCounts[techniqueType] < MEMORY_TECHNIQUES_CONFIG.maxTechniquesPerType) {
        filteredElements.push(element);
        techniqueItemCounts[techniqueType]++;
      }
      return;
    }

    // Include non-memory technique elements
    filteredElements.push(element);
  });

  return filteredElements;
};

// Main section renderer
const SectionCard = ({ section }: { section: any }) => {
  const normalizedTitle = section.section_type_xml?.replace(/[^A-Z_]/g, '') || 'DEFAULT';
  const sectionStyles = getSectionStyles(normalizedTitle);
  const contentBgColor = getContentBackground(normalizedTitle);

  // Special styling for memory techniques section
  const isMemorySection = section.section_type_xml === 'MEMORY_TECHNIQUES';

  // Filter elements for memory techniques section
  const elementsToRender = isMemorySection
    ? filterMemoryTechniqueElements(section.content_elements || [])
    : section.content_elements || [];

  // Don't render empty memory sections
  if (isMemorySection && elementsToRender.length === 0) {
    return null;
  }

  return (
    <View style={[
      enhancedComponentStyles.sectionCard,
      isMemorySection && styles.memorySectionCard
    ]}>
      {/* Section Header */}
      <View style={[
        enhancedComponentStyles.sectionHeader,
        { backgroundColor: isMemorySection ? '#6366f1' : sectionStyles.headerBgColor }
      ]}>
        <Text style={styles.sectionEmoji}>
          {isMemorySection ? '🧠' : sectionStyles.iconEmoji}
        </Text>
        <Text style={[
          enhancedComponentStyles.sectionTitle,
          { color: sectionStyles.headerTextColor }
        ]}>
          {section.title}
        </Text>
      </View>

      {/* Section Content */}
      <View style={[
        enhancedComponentStyles.sectionContent,
        { backgroundColor: isMemorySection ? '#f8fafc' : contentBgColor }
      ]}>
        {elementsToRender
          .sort((a: any, b: any) => a.order_in_section - b.order_in_section)
          .map((element: any) => (
            <ContentElement key={element.element_pk} element={element} />
          ))}
      </View>
    </View>
  );
};

// Main ContentScreen component
export default function ContentScreen() {
  const route = useRoute<any>();
  const { topicId, chapterId, bookId, topics } = route.params;

  const fetcher = React.useCallback(() => getSectionsWithElements(topicId), [topicId]);
  const { data: sections, loading, error, refetch } = useFetch(fetcher);

  const currentTopic = topics?.find((t: any) => t.topic_pk === topicId);

  return (
    <View style={styles.container}>
      <Loader loading={loading} error={error} onRetry={refetch} />

      {!loading && sections && (
        <>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Topic Header */}
            <Text style={styles.topicTitle}>{currentTopic?.title}</Text>

            {/* Sections */}
            {sections
              .sort((a: any, b: any) => a.order_in_topic - b.order_in_topic)
              .map((section: any) => (
                <SectionCard key={section.section_pk} section={section} />
              ))}
          </ScrollView>

          <BottomNavigationBar
            topicId={topicId}
            chapterId={chapterId}
            bookId={bookId}
            topics={topics}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: brandColors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  topicTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: brandColors.neutral.dark,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  sectionEmoji: {
    fontSize: 20,
    marginRight: spacing.sm,
  },

  // Animation Placeholder Styles
  animationPlaceholder: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginVertical: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: '#6b7280',
    marginBottom: spacing.xs,
  },
  placeholderSubtext: {
    fontSize: typography.fontSize.sm,
    color: '#9ca3af',
    fontStyle: 'italic',
  },

  // Memory Techniques Styles
  memorySectionCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  memoryContainer: {
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
  },
  memoryTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  memoryItem: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  // Specific Memory Technique Styles
  visualMnemonicContainer: {
    backgroundColor: '#faf5ff',
    borderLeftColor: '#8b5cf6',
  },
  visualMnemonicItem: {
    borderLeftWidth: 2,
    borderLeftColor: '#8b5cf6',
  },
  acronymContainer: {
    backgroundColor: '#f0f9ff',
    borderLeftColor: '#0ea5e9',
  },
  acronymItem: {
    borderLeftWidth: 2,
    borderLeftColor: '#0ea5e9',
  },
  storyContainer: {
    backgroundColor: '#fefce8',
    borderLeftColor: '#eab308',
  },
  storyItem: {
    borderLeftWidth: 2,
    borderLeftColor: '#eab308',
  },
  storyTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: '#92400e',
    marginBottom: spacing.xs,
  },
  keywordContainer: {
    backgroundColor: '#f0fdf4',
    borderLeftColor: '#10b981',
  },
  keywordItem: {
    borderLeftWidth: 2,
    borderLeftColor: '#10b981',
  },
  memoryPalaceContainer: {
    backgroundColor: '#fef7ff',
    borderLeftColor: '#a855f7',
  },
  memoryPalaceItem: {
    borderLeftWidth: 2,
    borderLeftColor: '#a855f7',
  },
  practiceContainer: {
    backgroundColor: '#f0f9ff',
    borderLeftColor: '#0284c7',
  },
  practiceItem: {
    borderLeftWidth: 2,
    borderLeftColor: '#0284c7',
  },
  effectivenessContainer: {
    backgroundColor: '#fef2f2',
    borderLeftColor: '#ef4444',
  },
  effectivenessItem: {
    borderLeftWidth: 2,
    borderLeftColor: '#ef4444',
  },

  // Content Element Styles
  paragraphContainer: {
    marginBottom: spacing.md,
  },
  specialContentContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: brandColors.accent.main,
  },
  specialContentTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: brandColors.accent.dark,
    marginBottom: spacing.sm,
  },
  keyPointsContainer: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  keyPointsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: '#92400e',
    marginBottom: spacing.sm,
  },
  exerciseHeader: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  exerciseTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: '#991b1b',
  },
  questionContainer: {
    backgroundColor: '#ecfdf5',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  questionLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: '#065f46',
    marginBottom: spacing.xs,
  },
  answerContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  answerLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: '#0c4a6e',
    marginBottom: spacing.xs,
  },
  answerFrameworkContainer: {
    backgroundColor: '#fdf4ff',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  answerFrameworkLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: '#7c2d12',
    marginBottom: spacing.xs,
  },
  listContainer: {
    marginBottom: spacing.md,
  },
  listTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: brandColors.neutral.dark,
    marginBottom: spacing.sm,
  },
  defaultContainer: {
    marginBottom: spacing.md,
  },
  defaultTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: brandColors.neutral.dark,
    marginBottom: spacing.sm,
  },
});
