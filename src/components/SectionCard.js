import React from 'react';
import { View, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { getSectionStyles } from '@/styles/designSystem';

type SectionCardProps = {
  title: string;
  children: React.ReactNode;
  style?: any;
};

const SectionCard: React.FC<SectionCardProps> = ({ title, children, style }) => {
  const normalizedKey = title.toUpperCase().replace(/\s+/g, '_');
  const sectionStyles = getSectionStyles(normalizedKey);

  return (
    <Animated.View className="mb-4 rounded-2xl shadow-md overflow-hidden" style={style}>
      <LinearGradient
        colors={sectionStyles.cardBgGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-row items-center px-4 py-6"
      >
        <Text className="text-[24px]">{sectionStyles.iconEmoji}</Text>
        <Text
          className="text-[20px] font-bold ml-2"
          style={{ color: sectionStyles.headerTextColor }}
        >
          {title}
        </Text>
      </LinearGradient>

      <View className="bg-white/95 px-6 py-6">
        {children}
      </View>
    </Animated.View>
  );
};

export default SectionCard;
