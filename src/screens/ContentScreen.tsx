// ============================================
// UPDATED CONTENT SCREEN WITH CLEAN BORDERLESS DESIGN
// ============================================

import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getSectionsWithElements } from '@/lib/api/getSectionsWithElements';
import { useFetch } from '@/hooks/useFetch';
import Loader from '@/components/Loader';
import BottomNavigationBar from '@/components/BottomNavigationBar';
import WordPopup from '@/components/WordPopup';
import AnimationPlayer from '@/data/animations/AnimationPlayer';
import { useTheme, useThemedStyles } from '@/lib/ThemeContext';
import { getSectionGroup, sectionGroups } from '@/lib/designSystem';

// Memory techniques configuration (unchanged)
const MEMORY_TECHNIQUES_CONFIG = {
  enabledTechniques: [
    'VISUAL_MNEMONICS',
    'ACRONYMS_ACROSTICS',
    'STORY_METHOD'
  ],
  maxTechniquesPerType: 3,
  showEffectivenessRanking: true,
  showPracticeInstructions: false,
};

// Word data interface (unchanged)
interface WordData {
  word: string;
  shortMeaning: string;
  urduMeaning: string;
  termType: string;
}

// Clean section group component without borders
const SectionGroup: React.FC<{
  groupKey: keyof typeof sectionGroups;
  sections: any[];
  onWordPress: (wordData: WordData) => void;
}> = ({ groupKey, sections, onWordPress }) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(true);

  const styles = useThemedStyles((theme) => ({
    groupContainer: {
      marginBottom: theme.spacing.xl,
    },
    groupHeader: {
      backgroundColor: theme.colors[groupKey as keyof typeof theme.colors] || theme.colors.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.sm,
    },
    groupHeaderPressed: {
      opacity: 0.9,
    },
    groupTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.onPrimary,
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    expandIcon: {
      marginLeft: theme.spacing.sm,
    },
    groupContent: {
      paddingLeft: theme.spacing.sm,
    },
    sectionContainer: {
      marginBottom: theme.spacing.lg,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.sm,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.onSurface,
      flex: 1,
    },
    sectionContent: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
    },
    sectionDivider: {
      height: 1,
      backgroundColor: theme.colors.outlineVariant,
      marginVertical: theme.spacing.md,
      marginHorizontal: theme.spacing.md,
    },
  }));

  const group = sectionGroups[groupKey];

  if (sections.length === 0) return null;

  return (
    <View style={styles.groupContainer}>
      {/* Group Header */}
      <TouchableOpacity
        style={styles.groupHeader}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={`${group.title} section`}
        accessibilityHint={isExpanded ? 'Collapse section' : 'Expand section'}
        accessibilityState={{ expanded: isExpanded }}
      >
        <Text style={styles.groupTitle}>
          {group.emoji} {group.title}
        </Text>
        <View style={styles.expandIcon}>
          <MaterialCommunityIcons
            name={isExpanded ? 'minus' : 'plus'}
            size={24}
            color={theme.colors.onPrimary}
          />
        </View>
      </TouchableOpacity>

      {/* Group Content */}
      {isExpanded && (
        <View style={styles.groupContent}>
          {sections.map((section: any, index: number) => (
            <SectionItem
              key={section.section_pk}
              section={section}
              onWordPress={onWordPress}
              isLast={index === sections.length - 1}
            />
          ))}
        </View>
      )}
    </View>
  );
};

// Individual section component with expand/collapse
const SectionItem: React.FC<{
  section: any;
  onWordPress: (wordData: WordData) => void;
  isLast: boolean;
}> = ({ section, onWordPress, isLast }) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(true);

  const styles = useThemedStyles((theme) => ({
    sectionContainer: {
      marginBottom: isLast ? 0 : theme.spacing.lg,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.sm,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.onSurface,
      flex: 1,
    },
    sectionContent: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
    },
    sectionDivider: {
      height: 1,
      backgroundColor: theme.colors.outlineVariant,
      marginVertical: theme.spacing.md,
      marginHorizontal: theme.spacing.md,
    },
  }));

  return (
    <View style={styles.sectionContainer}>
      {/* Section Header with +/- */}
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`${section.title} section`}
        accessibilityHint={isExpanded ? 'Collapse section' : 'Expand section'}
        accessibilityState={{ expanded: isExpanded }}
      >
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <MaterialCommunityIcons
          name={isExpanded ? 'minus' : 'plus'}
          size={20}
          color={theme.colors.onSurface}
        />
      </TouchableOpacity>

      {/* Section Content */}
      {isExpanded && (
        <View style={styles.sectionContent}>
          {section.content_elements
            ?.sort((a: any, b: any) => a.order_in_section - b.order_in_section)
            .map((element: any) => (
              <ContentElement
                key={element.element_pk}
                element={element}
                onWordPress={onWordPress}
              />
            ))}
        </View>
      )}

      {/* Subtle divider between sections (except last) */}
      {!isLast && <View style={styles.sectionDivider} />}
    </View>
  );
};

// Enhanced content element renderer with clean styling
const ContentElement: React.FC<{
  element: any;
  onWordPress: (wordData: WordData) => void;
}> = ({ element, onWordPress }) => {
  const { theme } = useTheme();

  const styles = useThemedStyles((theme) => ({
    // Clean content element styles
    paragraphContainer: {
      marginBottom: theme.spacing.md,
    },
    contentText: {
      fontSize: theme.typography.fontSize.base,
      lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.sm,
    },
    dictionaryWord: {
      color: theme.colors.primary,
      fontWeight: theme.typography.fontWeight.medium,
      backgroundColor: theme.colors.primaryContainer,
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
      paddingLeft: theme.spacing.sm,
    },
    listBullet: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.primary,
      marginRight: theme.spacing.sm,
      marginTop: 2,
      fontWeight: theme.typography.fontWeight.bold,
    },
    listText: {
      fontSize: theme.typography.fontSize.base,
      lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
      color: theme.colors.onSurface,
      flex: 1,
    },
    specialContentContainer: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.accent,
    },
    specialContentTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.sm,
    },
    // Clean memory technique styles
    memoryContainer: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderLeftWidth: 4,
    },
    memoryTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      marginBottom: theme.spacing.sm,
      color: theme.colors.onSurface,
    },
    memoryItem: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    // Clean animation placeholder
    animationPlaceholder: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.md,
      marginVertical: theme.spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.outline,
      borderStyle: 'dashed',
      paddingVertical: theme.spacing.lg,
    },
    placeholderText: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.onSurfaceVariant,
      marginBottom: theme.spacing.xs,
    },
    placeholderSubtext: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.onSurfaceVariant,
      fontStyle: 'italic',
    },
  }));

  // Helper functions (mostly unchanged but using cleaner styles)
  const decodeHtmlEntities = (text: string) => {
    if (!text) return text;
    return text
      .replace(/&amp;/g, '&')
      .replace(/&#x27;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#x2F;/g, '/')
      .replace(/&#x60;/g, '`')
      .replace(/&#x3D;/g, '=');
  };

  const parseWordTags = (text: string) => {
    if (!text) return [{ type: 'text', content: text }];

    const parts = text.split(/(<dict_word[^>]*>.*?<\/dict_word>)/g);

    return parts.map((part, index) => {
      const dictWordMatch = part.match(/<dict_word([^>]*)>(.*?)<\/dict_word>/);

      if (dictWordMatch) {
        const [, attributes, wordText] = dictWordMatch;

        const wordMatch = attributes.match(/data-word="([^"]*)"/);
        const termTypeMatch = attributes.match(/data-term-type="([^"]*)"/);
        const urduMatch = attributes.match(/data-urdu="([^"]*)"/);
        const shortMeaningMatch = attributes.match(/data-short-meaning="([^"]*)"/);

        return {
          type: 'word',
          content: wordText,
          wordData: {
            word: wordMatch ? wordMatch[1] : wordText,
            termType: termTypeMatch ? termTypeMatch[1] : 'concept',
            urduMeaning: urduMatch ? urduMatch[1] : '',
            shortMeaning: shortMeaningMatch ? shortMeaningMatch[1] : ''
          },
          key: `word-${index}`
        };
      }

      return {
        type: 'text',
        content: part,
        key: `text-${index}`
      };
    }).filter(part => part.content);
  };

// Fix for ContentScreen.tsx - Replace the renderTextWithAnimations function

// Update your ContentScreen.tsx renderTextWithAnimations function

const renderTextWithAnimations = (text: string) => {
  if (!text) return null;

  const animationParts = text.split(/(\[ANIMATION(?:_PLACEHOLDER)?:[^:]+:[^:]+\])/g);

  return animationParts.map((part, animIndex) => {
    const animationMatch = part.match(/\[ANIMATION:([^:]+):([^:]+)\]/);
    const placeholderMatch = part.match(/\[ANIMATION_PLACEHOLDER:([^:]+):([^:]+)\]/);

    if (animationMatch) {
      const [, animationType, height] = animationMatch;

      return (
        <AnimationPlayer  // ✅ Changed from ChemistryAnimation
          key={`animation-${animationType}-${animIndex}`}
          animationId={animationType}
          height={parseInt(height)}
          onError={(error) => console.error('Animation error:', error)}
        />
      );
    }

    if (placeholderMatch) {
      const [, animationRef, height] = placeholderMatch;
      return (
        <View key={`placeholder-${animationRef}-${animIndex}`} style={[styles.animationPlaceholder, { height: parseInt(height) }]}>
          <Text style={styles.placeholderText}>
            🎬 Animation: "{animationRef}"
          </Text>
          <Text style={styles.placeholderSubtext}>
            (Coming Soon)
          </Text>
        </View>
      );
    }

    // Handle text parts
    if (!part.trim()) return null;

    const textParts = parseWordTags(part);

    return (
      <Text key={`text-block-${animIndex}`} style={styles.contentText}>
        {textParts.map((textPart, textPartIndex) => {
          const uniqueKey = `${textPart.type}-${animIndex}-${textPartIndex}`;

          if (textPart.type === 'word') {
            return (
              <TouchableOpacity
                key={uniqueKey}
                onPress={() => onWordPress(textPart.wordData)}
                activeOpacity={0.7}
              >
                <Text style={styles.dictionaryWord}>
                  {formatText(textPart.content)}
                </Text>
              </TouchableOpacity>
            );
          }

          return (
            <Text key={uniqueKey}>
              {formatText(textPart.content)}
            </Text>
          );
        })}
      </Text>
    );
  }).filter(Boolean);
};

  const formatText = (text: string) => {
    const decodedText = decodeHtmlEntities(text);
    return decodedText
      .replace(/\*\*(.*?)\*\*/g, (match, content) => content)
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
        <View key={item.list_item_pk} style={styles.listItem}>
          <Text style={styles.listBullet}>•</Text>
          <View style={{ flex: 1 }}>
            {renderTextWithAnimations(item.item_text)}
          </View>
        </View>
      ));
  };

  // Clean memory technique rendering
  const renderMemoryTechniques = () => {
    const { element_type, text_content, title_attribute } = element;

    const techniqueType = element_type.replace('_CONTAINER', '').replace('_ITEM', '');
    if (element_type.includes('_CONTAINER') &&
        !MEMORY_TECHNIQUES_CONFIG.enabledTechniques.includes(techniqueType)) {
      return null;
    }

    switch (element_type) {
      case 'VISUAL_MNEMONICS_CONTAINER':
        return (
          <View style={[styles.memoryContainer, { borderLeftColor: theme.colors.accent }]}>
            <Text style={styles.memoryTitle}>🧠 Visual Mnemonics</Text>
          </View>
        );

      case 'VISUAL_MNEMONIC_ITEM':
        return (
          <View style={styles.memoryItem}>
            {renderTextWithAnimations(text_content)}
          </View>
        );

      default:
        return null;
    }
  };

  // Check if this is a memory technique element
  if (element.element_type.includes('MEMORY') ||
      element.element_type.includes('VISUAL_MNEMONIC') ||
      element.element_type.includes('ACRONYM') ||
      element.element_type.includes('STORY_METHOD')) {
    return renderMemoryTechniques();
  }

  // Handle regular content elements with clean styling
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

    case 'LIST_UNORDERED_CONTAINER':
    case 'LIST_ORDERED_CONTAINER':
    case 'LIST_ALPHA_ORDERED_CONTAINER':
      return (
        <View style={styles.paragraphContainer}>
          {element.title_attribute && (
            <Text style={styles.specialContentTitle}>{element.title_attribute}</Text>
          )}
          {renderListItems()}
        </View>
      );

    default:
      return (
        <View style={styles.paragraphContainer}>
          {element.title_attribute && (
            <Text style={styles.specialContentTitle}>{element.title_attribute}</Text>
          )}
          {renderTextWithAnimations(element.text_content)}
          {renderListItems()}
        </View>
      );
  }
};

// Main ContentScreen component with clean theme integration
export default function ContentScreen() {
  const route = useRoute<any>();
  const { topicId, chapterId, bookId, topics } = route.params;
  const { theme } = useTheme();

  // Word popup state
  const [wordPopupVisible, setWordPopupVisible] = useState(false);
  const [selectedWordData, setSelectedWordData] = useState<WordData | null>(null);

  const fetcher = React.useCallback(() => getSectionsWithElements(topicId), [topicId]);
  const { data: sections, loading, error, refetch } = useFetch(fetcher);

  const currentTopic = topics?.find((t: any) => t.topic_pk === topicId);

  // Group sections by section groups
  const groupedSections = useMemo(() => {
    if (!sections) return {};

    const groups: Record<string, any[]> = {
      coreLearning: [],
      enhancedLearning: [],
      supplementary: [],
    };

    sections.forEach((section: any) => {
      const groupKey = getSectionGroup(section.section_type_xml);
      if (groupKey && groups[groupKey]) {
        groups[groupKey].push(section);
      } else {
        // Default to supplementary for unknown sections
        groups.supplementary.push(section);
      }
    });

    return groups;
  }, [sections]);

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
    },
    topicTitle: {
      fontSize: theme.typography.fontSize['3xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.onBackground,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
      lineHeight: theme.typography.lineHeight.tight * theme.typography.fontSize['3xl'],
      paddingHorizontal: theme.spacing.md,
    },
  }));

  const handleWordPress = (wordData: WordData) => {
    setSelectedWordData(wordData);
    setWordPopupVisible(true);
  };

  const handleWordPopupClose = () => {
    setWordPopupVisible(false);
    setSelectedWordData(null);
  };

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

            {/* Grouped Sections - Clean Layout */}
            {Object.entries(groupedSections).map(([groupKey, groupSections]) => (
              <SectionGroup
                key={groupKey}
                groupKey={groupKey as keyof typeof sectionGroups}
                sections={groupSections}
                onWordPress={handleWordPress}
              />
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

      {/* Word Popup */}
      <WordPopup
        visible={wordPopupVisible}
        onClose={handleWordPopupClose}
        wordData={selectedWordData}
        bookId={bookId}
      />
    </View>
  );
}
