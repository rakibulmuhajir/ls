// ============================================
// UPDATED CONTENT SCREEN WITH THEME INTEGRATION
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
import { ChemistryAnimation, AnimationType } from '@/data/animations';
import { useTheme, useThemedStyles } from '@/lib/ThemeContext';
import { getSectionGroup, sectionGroups, createShadow } from '@/lib/designSystem';

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

// Section group component with theme support
const SectionGroup: React.FC<{
  groupKey: keyof typeof sectionGroups;
  sections: any[];
  onWordPress: (wordData: WordData) => void;
}> = ({ groupKey, sections, onWordPress }) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(true);

  const styles = useThemedStyles((theme) => ({
    groupContainer: {
      marginBottom: theme.spacing.lg,
      borderRadius: theme.borderRadius.xl,
      backgroundColor: theme.colors.surface,
      overflow: 'hidden',
      ...createShadow(3),
    },
    groupHeader: {
      backgroundColor: theme.colors[groupKey as keyof typeof theme.colors] || theme.colors.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    groupHeaderPressed: {
      opacity: 0.8,
    },
    groupTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.onPrimary,
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    groupContent: {
      backgroundColor: theme.colors[groupKey as keyof typeof theme.colors] || theme.colors.surfaceVariant,
    },
    sectionCard: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      ...createShadow(2),
    },
    sectionHeader: {
      backgroundColor: theme.colors.surfaceVariant,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.onSurface,
    },
    sectionContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
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
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`${group.title} section`}
        accessibilityHint={isExpanded ? 'Collapse section' : 'Expand section'}
        accessibilityState={{ expanded: isExpanded }}
      >
        <Text style={styles.groupTitle}>
          {group.emoji} {group.title}
        </Text>
        <MaterialCommunityIcons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={theme.colors.onPrimary}
        />
      </TouchableOpacity>

      {/* Group Content */}
      {isExpanded && (
        <View style={styles.groupContent}>
          {sections.map((section: any) => (
            <View key={section.section_pk} style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
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
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

// Enhanced content element renderer with theme support
const ContentElement: React.FC<{
  element: any;
  onWordPress: (wordData: WordData) => void;
}> = ({ element, onWordPress }) => {
  const { theme } = useTheme();

  const styles = useThemedStyles((theme) => ({
    // Content element styles with theme support
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
      paddingHorizontal: 3,
      paddingVertical: 1,
      borderRadius: 3,
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
    },
    listBullet: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.onSurfaceVariant,
      marginRight: theme.spacing.sm,
      marginTop: 2,
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
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.accent,
    },
    specialContentTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.sm,
    },
    // Memory technique styles with theme support
    memoryContainer: {
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderLeftWidth: 3,
      backgroundColor: theme.colors.surfaceVariant,
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
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
    },
    // Animation placeholder
    animationPlaceholder: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.md,
      marginVertical: theme.spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.outline,
      borderStyle: 'dashed',
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

  // Helper functions (mostly unchanged but using themed styles)
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

  const renderTextWithAnimations = (text: string) => {
    if (!text) return null;

    const animationParts = text.split(/(\[ANIMATION(?:_PLACEHOLDER)?:[^:]+:[^:]+\])/g);

    return animationParts.map((part, animIndex) => {
      const animationMatch = part.match(/\[ANIMATION:([^:]+):([^:]+)\]/);
      const placeholderMatch = part.match(/\[ANIMATION_PLACEHOLDER:([^:]+):([^:]+)\]/);

      if (animationMatch) {
        const [, animationType, height] = animationMatch;
        return (
          <ChemistryAnimation
            key={`anim-${animIndex}`}
            type={animationType as AnimationType}
            height={parseInt(height)}
          />
        );
      }

      if (placeholderMatch) {
        const [, animationRef, height] = placeholderMatch;
        return (
          <View key={`placeholder-${animIndex}`} style={[styles.animationPlaceholder, { height: parseInt(height) }]}>
            <Text style={styles.placeholderText}>
              🎬 Animation: "{animationRef}"
            </Text>
            <Text style={styles.placeholderSubtext}>
              (Coming Soon)
            </Text>
          </View>
        );
      }

      const textParts = parseWordTags(part);

      return (
        <Text key={`text-container-${animIndex}`} style={styles.contentText}>
          {textParts.map((textPart) => {
            if (textPart.type === 'word') {
              return (
                <TouchableOpacity
                  key={textPart.key}
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
              <Text key={textPart.key}>
                {formatText(textPart.content)}
              </Text>
            );
          })}
        </Text>
      );
    });
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

  // Memory technique rendering (with theme support)
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

      // ... other memory technique cases (similar pattern)

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

// Main ContentScreen component with theme integration
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

            {/* Grouped Sections */}
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
