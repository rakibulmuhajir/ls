// ============================================
// FIXED CONTENTSCREEN WITH PROPER COMPONENT STRUCTURE
// ============================================

import React, { useState, useMemo } from 'react';
// import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'; // Added StyleSheet
import { useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getSectionsWithElements } from '@/lib/api/getSectionsWithElements';
import { useFetch } from '@/hooks/useFetch';
import Loader from '@/components/Loader';
import BottomNavigationBar from '@/components/BottomNavigationBar';
import WordPopup from '@/components/WordPopup';
// Assuming createGreywolfShadow is exported from ThemeContext or designSystem
import { useTheme, useThemedStyles } from '@/lib/ThemeContext';
import { createShadow } from '@/lib/designSystem'; // Import shadow utility
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

// Clean section group component with "card" styling
const SectionGroup: React.FC<{
  groupKey: keyof typeof sectionGroups;
  sections: any[];
  onWordPress: (wordData: WordData) => void;
}> = ({ groupKey, sections, onWordPress }) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(true);

  const styles = useThemedStyles((theme) => ({
    groupContainer: { // This is our main "card"
      backgroundColor: theme.colors.surface, // Equivalent to rgba(255,255,255,0.75-0.85)
      borderRadius: theme.borderRadius.xl, // 16px
      padding: theme.spacing.xl, // 30px
      marginBottom: theme.spacing.xl, // 30px
      borderWidth: 1,
      borderColor: theme.colors.border, // Equivalent to rgba(255,255,255,0.5)
      ...createShadow(2), // Subtle shadow
    },
    groupHeader: {
      // This is like the "Card Title" section in HTML
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      marginBottom: theme.spacing.lg, // 20px margin like in HTML card-title
    } as const,
    // groupHeaderPressed: { // Can remove if activeOpacity is enough
    //   opacity: 0.9,
    // },
    groupTitle: {
      fontSize: theme.typography.fontSize.xl, // 22px (HTML was 1.4rem)
      fontWeight: theme.typography.fontWeight.semibold, // Match HTML card-title
      color: theme.colors.onSurface, // #2d3748
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    expandIcon: {
      // No specific style in HTML, ensure good contrast
      padding: theme.spacing.xs, // Add some padding to make it easier to press
    },
    groupContent: {
      // No direct padding here, SectionItems will handle their own
    },
  }));

  const group = sectionGroups[groupKey];

  if (sections.length === 0) return null;

  // Determine icon color for expand/collapse based on group
  let iconColor = theme.colors.onSurface; // Default
  if (groupKey === 'coreLearning') iconColor = theme.colors.primary;
  else if (groupKey === 'enhancedLearning') iconColor = theme.colors.secondary;
  else if (groupKey === 'supplementary') iconColor = theme.colors.accent; // Or theme.colors.warning

  return (
    <View style={styles.groupContainer}>
      <TouchableOpacity
        style={styles.groupHeader}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7} // Standard active opacity
        accessibilityRole="button"
        accessibilityLabel={`${group.title} section`}
        accessibilityHint={isExpanded ? 'Collapse section' : 'Expand section'}
        accessibilityState={{ expanded: isExpanded }}
      >
        {/* Icon similar to HTML card title icon */}
        <View style={{
            width: 32, height: 32,
            backgroundColor: theme.colors.background, // Match HTML icon background
            borderRadius: theme.borderRadius.md, // 8px
            alignItems: 'center', justifyContent: 'center',
            marginRight: theme.spacing.md // Gap
        }}>
            <Text style={{fontSize: 18, color: iconColor}}>{group.emoji}</Text>
        </View>
        <Text style={styles.groupTitle}>
          {group.title}
        </Text>
        <View style={styles.expandIcon}>
          <MaterialCommunityIcons
            name={isExpanded ? 'minus-circle-outline' : 'plus-circle-outline'} // More distinct icons
            size={28} // Slightly larger for better tap target
            color={iconColor}
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.groupContent}>
          {sections.map((section: any, index: number) => (
            <SectionItem
              key={section.section_pk}
              section={section}
              onWordPress={onWordPress}
              isLast={index === sections.length - 1}
              groupKey={groupKey} // Pass groupKey for potential styling
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
  groupKey: keyof typeof sectionGroups; // Receive groupKey
}> = ({ section, onWordPress, isLast, groupKey }) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded for core sections

  // Determine header background and icon color based on groupKey or section type
  // For now, let's use a subtle background for all section headers
  const sectionHeaderBackgroundColor = theme.colors.surfaceVariant; // rgba(255,255,255,0.6)
  const sectionHeaderIconColor = theme.colors.onSurfaceVariant;

  const styles = useThemedStyles((theme) => ({
    sectionContainer: {
      marginBottom: isLast ? 0 : theme.spacing.md, // Reduced margin between items
      backgroundColor: theme.colors.background, // Light background for the section content area
      borderRadius: theme.borderRadius.md, // Rounded corners for the item itself
      // Add a subtle border if it's not the last item, or always if preferred
      borderBottomWidth: isLast ? 0 : 1,
      borderBottomColor: theme.colors.outlineVariant,
      overflow: 'hidden' as const, // ensure child borderRadius is clipped
    } as const,
    sectionHeader: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingVertical: theme.spacing.md, // More padding
      paddingHorizontal: theme.spacing.md,
      backgroundColor: sectionHeaderBackgroundColor, // Subtle background from theme
      // borderRadius: theme.borderRadius.sm, // Removed as sectionContainer handles rounding
      // marginBottom: theme.spacing.sm, // Removed, content flows directly
    } as const,
    sectionTitle: {
      fontSize: theme.typography.fontSize.lg, // 18px
      fontWeight: theme.typography.fontWeight.medium, // Slightly less than group title
      color: theme.colors.onSurfaceVariant, // Text color for this background
      flex: 1,
    },
    sectionContent: {
      paddingHorizontal: theme.spacing.md, // Match header padding
      paddingVertical: theme.spacing.md, // Add vertical padding
    },
    // sectionDivider: { // Replaced by borderBottomWidth on sectionContainer
    //   height: 1,
    //   backgroundColor: theme.colors.outlineVariant,
    //   marginVertical: theme.spacing.md,
    //   marginHorizontal: theme.spacing.md,
    // },
  }));

  // Auto-expand core definition, explanation, examples if they are part of coreLearning
  React.useEffect(() => {
    if (groupKey === 'coreLearning') {
        const coreInitialExpand = ['CORE_DEFINITION', 'EXPLANATION', 'EXAMPLES', 'KEY_POINTS_&_SUMMARY'];
        if (coreInitialExpand.includes(section.section_type_xml)) {
            setIsExpanded(true);
        } else {
            setIsExpanded(false); // Collapse others in core learning by default
        }
    } else {
        setIsExpanded(false); // Collapse sections in other groups by default
    }
  }, [section.section_type_xml, groupKey]);


  return (
    <View style={styles.sectionContainer}>
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
          name={isExpanded ? 'chevron-up' : 'chevron-down'} // More standard expand/collapse icons
          size={24} // Standard size
          color={sectionHeaderIconColor}
        />
      </TouchableOpacity>

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
      {/* {!isLast && <View style={styles.sectionDivider} />} // Divider removed */}
    </View>
  );
};

// ... (parseMoleculeConfig remains the same)

// Enhanced content element renderer with clean styling
const ContentElement: React.FC<{
  element: any;
  onWordPress: (wordData: WordData) => void;
}> = ({ element, onWordPress }) => {
  const { theme } = useTheme();

  const styles = useThemedStyles((theme) => ({
    paragraphContainer: {
      marginBottom: theme.spacing.md, // 16px
    },
    contentText: {
      fontSize: theme.typography.fontSize.base, // 16px
      lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.base, // 1.6
      color: theme.colors.onSurfaceVariant, // #4a5568 (textTertiary) or onSurface if contrast is an issue
      marginBottom: theme.spacing.sm,
    },
    dictionaryWord: {
      color: theme.colors.primary,
      fontWeight: theme.typography.fontWeight.medium,
      backgroundColor: theme.colors.primaryContainer,
      paddingHorizontal: theme.spacing.xs, // 4px
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm, // 4px
    },
    listItem: {
      flexDirection: 'row' as const,
      alignItems: 'flex-start' as const,
      marginBottom: theme.spacing.sm,
      paddingLeft: theme.spacing.sm,
    } as const,
    listBullet: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.primary, // Interactive color for bullet
      marginRight: theme.spacing.sm,
      lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.base, // Align with text
      fontWeight: theme.typography.fontWeight.bold,
    },
    listText: {
      fontSize: theme.typography.fontSize.base,
      lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.base,
      color: theme.colors.onSurfaceVariant, // #4a5568
      flex: 1,
    },
    specialContentContainer: { // For Analogy, Example etc.
      backgroundColor: theme.colors.surfaceVariant, // rgba(255,255,255,0.6) in HTML
      borderRadius: theme.borderRadius.lg, // 12px from HTML
      padding: theme.spacing.lg, // 20px (HTML used 20px)
      marginBottom: theme.spacing.md,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary, // Blue accent like in HTML state-description
    },
    specialContentTitle: {
      fontSize: theme.typography.fontSize.lg, // 18px
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.onSurface, // #2d3748
      marginBottom: theme.spacing.sm,
    },
    memoryContainer: { // Similar to special content
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md, // Consistent margin
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.accent, // Use accent color for memory techniques
    },
    memoryTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      marginBottom: theme.spacing.sm,
      color: theme.colors.onSurface,
    },
    memoryItem: {
      backgroundColor: theme.colors.surface, // A slightly more opaque background
      borderRadius: theme.borderRadius.md, // More rounding
      padding: theme.spacing.md, // More padding
      marginBottom: theme.spacing.sm, // Consistent margin
      ...createShadow(1), // Very subtle shadow for items
    },
    // ... (inlineAnimationContainer, animationPlaceholder, placeholderText remain the same for now)
    inlineAnimationContainer: {
        alignItems: 'center',
        marginVertical: theme.spacing.md,
        backgroundColor: theme.colors.coreLearning, // Or some other subtle tint
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.sm,
      },
      animationPlaceholder: {
        backgroundColor: theme.colors.outline,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        alignItems: 'center' as const,
        marginVertical: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.outlineVariant,
        borderStyle: 'dashed' as const,
      } as const,
      placeholderText: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.onSurfaceVariant, // Muted text
        fontStyle: 'italic' as const,
      } as const,
  }));

  // ... (decodeHtmlEntities, parseWordTags, formatText, renderTextWithAnimations, renderListItems, renderMemoryTechniques remain the same logistically)
  // Helper functions
  // Helper functions
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

  const formatText = (text: string) => {
    const decodedText = decodeHtmlEntities(text);
    // Retain bold/italic markers for potential future styling, but render them plainly for now
    // Or, you can implement <Text style={{fontWeight: 'bold'}}> for **text**
    return decodedText
      .replace(/\*\*(.*?)\*\*/g, (match, content) => content) // For now, render as normal
      .replace(/\*(.*?)\*/g, (match, content) => content)     // For now, render as normal
      .replace(/\[([^:]+):([^\]]+)\]/g, (match, type, content) => {
        if (type === 'chemical') return content; // Could style chemicals differently
        return content;
      });
  };

  const renderTextWithAnimations = (text: string) => {
    if (!text) return null;
    const animationParts = text.split(/(\[(?:MOLECULE|PHYSICS|REACTION|TEXT):[^\]]+\])/g);

    return animationParts.map((part, animIndex) => {
      const animationMatch = part.match(/\[([^:]+):([^\]]+)\]/);
       if (animationMatch) {
        // This is a placeholder for actual animation rendering
        // For now, just show a placeholder block
        const [_, animType, animValue] = animationMatch;
        return (
          <View key={`anim-${animIndex}`} style={styles.animationPlaceholder}>
            <Text style={styles.placeholderText}>Animation: [{animType}:{animValue}]</Text>
          </View>
        );
      }

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
                  onPress={() => onWordPress(textPart.wordData as WordData)}
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
          <View style={[styles.memoryContainer, { borderLeftColor: theme.colors.interactive.medium }]}>
            <Text style={styles.memoryTitle}>🧠 Visual Mnemonics</Text>
            {/* Children will be VISUAL_MNEMONIC_ITEM, handled by the default case below */}
          </View>
        );
      case 'VISUAL_MNEMONIC_ITEM':
      case 'ACRONYM_ITEM': // Assuming similar structure
      case 'STORY_METHOD_ITEM': // Assuming similar structure
        return (
          <View style={styles.memoryItem}>
            {renderTextWithAnimations(text_content)}
          </View>
        );
      default:
        return null;
    }
  };

  if (element.element_type.includes('MEMORY') ||
      element.element_type.includes('VISUAL_MNEMONIC') ||
      element.element_type.includes('ACRONYM') ||
      element.element_type.includes('STORY_METHOD')) {
    // If it's a container, its children (items) will be rendered within its block by the map in SectionItem
    // If it's an item, it's rendered directly.
    // The current logic might render containers and then items separately.
    // For better structure, containers should implicitly render their items or items should be nested.
    // For now, this keeps existing logic.
    return renderMemoryTechniques();
  }

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
        <View style={styles.paragraphContainer}> {/* Using paragraphContainer for margin */}
          {element.title_attribute && (
            <Text style={styles.specialContentTitle}>{element.title_attribute}</Text> // Use special title for list titles
          )}
          {renderListItems()}
        </View>
      );
    default: // Fallback for any other element type
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


// Main ContentScreen component
export default function ContentScreen() {
  const route = useRoute<any>();
  const { topicId, chapterId, bookId, topics } = route.params;
  const { theme } = useTheme();

  const [wordPopupVisible, setWordPopupVisible] = useState(false);
  const [selectedWordData, setSelectedWordData] = useState<WordData | null>(null);

  const fetcher = React.useCallback(() => getSectionsWithElements(topicId), [topicId]);
  const { data: sections, loading, error, refetch } = useFetch(fetcher);

  const currentTopic = topics?.find((t: any) => t.topic_pk === topicId);

  const groupedSections = useMemo(() => {
    if (!sections) return {};
    const groups: Record<string, any[]> = { coreLearning: [], enhancedLearning: [], supplementary: [] };
    sections.forEach((section: any) => {
      const groupKey = getSectionGroup(section.section_type_xml);
      if (groupKey && groups[groupKey]) {
        groups[groupKey].push(section);
      } else {
        groups.supplementary.push(section); // Default to supplementary
      }
    });
    // Ensure groups always exist for Object.entries
    if (!groups.coreLearning) groups.coreLearning = [];
    if (!groups.enhancedLearning) groups.enhancedLearning = [];
    if (!groups.supplementary) groups.supplementary = [];
    return groups;
  }, [sections]);

  const styles = useThemedStyles((theme) => ({
    // If using LinearGradient for the whole screen background
    gradientContainer: {
        flex: 1,
    },
    container: {
      flex: 1,
      // backgroundColor: theme.colors.background, // Applied by gradient or ScrollView
    },
    scrollView: {
      flex: 1,
      // backgroundColor: theme.colors.background, // Fallback if no gradient
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.md, // Overall horizontal padding for the scroll content
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xl, // Space for bottom nav
    },
    topicTitle: { // Equivalent to H1
      fontSize: theme.typography.fontSize['2xl'], // 35px (HTML was 2.2rem)
      fontWeight: theme.typography.fontWeight.semibold, // HTML was 600
      color: theme.colors.onBackground, // #1a202c
      textAlign: 'center' as const,
      marginBottom: theme.spacing.xl, // HTML used 8px for h1, then 30px to card. Let's use more here.
      paddingHorizontal: theme.spacing.md, // Ensure it doesn't touch edges
    } as const,
    // Error/Loading state styling if needed
    centeredMessage: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      padding: theme.spacing.xl,
    } as const,
    errorMessage: {
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.error,
      textAlign: 'center' as const,
      marginBottom: theme.spacing.md,
    } as const,
  }));

  const handleWordPress = (wordData: WordData) => {
    setSelectedWordData(wordData);
    setWordPopupVisible(true);
  };

  const handleWordPopupClose = () => {
    setWordPopupVisible(false);
    setSelectedWordData(null);
  };

  const ScreenWrapper: React.FC<{children: React.ReactNode}> = ({children}) => {
    if (theme.colors.backgroundGradient) {
        return (
            <View style={[styles.gradientContainer, {backgroundColor: theme.colors.background}]}>
                {children}
            </View>
        );
    }
    return <View style={[styles.container, { backgroundColor: theme.colors.background }]}>{children}</View>;
  };


  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Loader loading={loading} error={null} onRetry={refetch} />
        {/* Pass null for error prop if handling error message separately */}

        {error && !loading && (
            <View style={styles.centeredMessage}>
                <Text style={styles.errorMessage}>Error loading content: {String(error?.message || error)}</Text>
                <TouchableOpacity onPress={refetch}>
                    <Text style={{color: theme.colors.primary, fontSize: theme.typography.fontSize.lg}}>Try Again</Text>
                </TouchableOpacity>
            </View>
        )}

        {!loading && !error && sections && (
          <>
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <Text style={styles.topicTitle}>{currentTopic?.title || 'Content'}</Text>

              {Object.entries(groupedSections).map(([groupKey, groupSections]) => {
                if (groupSections.length === 0) return null; // Don't render empty groups
                return (
                    <SectionGroup
                    key={groupKey}
                    groupKey={groupKey as keyof typeof sectionGroups}
                    sections={groupSections}
                    onWordPress={handleWordPress}
                    />
                );
              })}
            </ScrollView>

            <BottomNavigationBar
              topicId={topicId}
              chapterId={chapterId}
              bookId={bookId}
              topics={topics}
            />
          </>
        )}

        <WordPopup
          visible={wordPopupVisible}
          onClose={handleWordPopupClose}
          wordData={selectedWordData}
          bookId={bookId}
        />
      </View>
    </ScreenWrapper>
  );
}
