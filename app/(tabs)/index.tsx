import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import HormoneChartScreen from '../../src/screens/HormoneChartScreen';
import { phaseRecommendations } from '@/data/phaseRecommendation';
import PhaseCard from '@/components/core-components/PhaseCard';
import QuickActions from '@/components/QuickActions';
import { useCycleRedux } from '@/hooks/useCycleRedux';
import { addEntry } from '@/src/store/slices/cycleSlice';
import WeekPhaseStrip from '@/components/WeekPhaseStrip';
import Logo from '@/assets/images/logo';
import PhaseDetailModal from '@/components/PhaseDetailModal';
import QuickAction from '@/components/QuickAction';
import { useTheme } from '@/src/context/ThemeContext';

export default function HomeScreen() {
  const { cycleState, dispatch } = useCycleRedux();
  const { theme } = useTheme();
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];
  const [modalVisible, setModalVisible] = useState(false);
  
  const dynamicStyles = useMemo(() => createStyles(theme), [theme]);

  const currentPhaseData =
    phaseRecommendations[
      (cycleState.currentPhase.name as unknown) as keyof typeof phaseRecommendations
    ] || phaseRecommendations['menstrual'];

  const phaseColor = currentPhaseData.color;

  // Helper function to add opacity to hex color
  const addOpacityToHex = (hex: string, opacity: number) => {
    const hexWithoutHash = hex.replace('#', '');
    const r = parseInt(hexWithoutHash.substring(0, 2), 16);
    const g = parseInt(hexWithoutHash.substring(2, 4), 16);
    const b = parseInt(hexWithoutHash.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Create gradient colors blending phase color with theme background
  const gradientColors: [string, string, string] = useMemo(() => [
    addOpacityToHex(phaseColor, 0.80), // Start with phase color at 15% opacity
    addOpacityToHex(phaseColor, 0.40), // Transition to 8% opacity
    theme.background, // End with theme background
  ] as [string, string, string], [phaseColor, theme.background]);


  const getDaysUntilNextPeriod = () => {
    if (!cycleState.predictions.nextPeriod) return undefined;
    const nextPeriod = new Date(cycleState.predictions?.nextPeriod?.likely || '');
    const today = new Date();
    const diff = Math.ceil((nextPeriod.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <>
      <LinearGradient
        colors={gradientColors}
        style={dynamicStyles.gradientContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <ScrollView
          style={dynamicStyles.container}
          showsVerticalScrollIndicator={false}
        >
        {/* Logo */}
        <View style={dynamicStyles.logoContainer}>
          <Logo color={phaseColor} width={210} height={80} />
        </View>
        <WeekPhaseStrip firstDay={0} />

        {/* Current Phase Card - Now Clickable */}
        <View style={dynamicStyles.topMargin}>
          <PhaseCard
            phaseName={currentPhaseData.name}
            emoji={currentPhaseData.foods.icon}
            cycleDay={cycleState.cycleDay}
            daysUntilNextPeriod={getDaysUntilNextPeriod()}
            image={currentPhaseData.image}
            phaseColor={currentPhaseData.color}
            onPress={() => setModalVisible(true)}
          />
        </View>

        {/* Quick Actions */}
        <QuickAction />

        {/* Hormone Chart */}
        <View style={dynamicStyles.hormoneChartContainer}>
          <HormoneChartScreen />
        </View>

        {/* Today's Recommendations */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Recommendations</Text>
          <View style={styles.recommendationsBlock}>
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationEmoji}>{currentPhaseData.foods.icon}</Text>
              <View style={styles.recommendationContent}>
                <Text style={styles.recommendationTitle}>{currentPhaseData.foods.title}</Text>
                <Text style={styles.recommendationText}>
                  {currentPhaseData.foods.items[0]}
                </Text>
              </View>
            </View>

            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationEmoji}>{currentPhaseData.exercises.icon}</Text>
              <View style={styles.recommendationContent}>
                <Text style={styles.recommendationTitle}>
                  {currentPhaseData.exercises.title}
                </Text>
                <Text style={styles.recommendationText}>
                  {currentPhaseData.exercises.items[0]}
                </Text>
              </View>
            </View>
          </View>
        </View> */}

        {/* Today's Tips */}
        {/* <View style={[styles.section, { marginBottom: 100 }]}>
          <Text style={styles.sectionTitle}>Phase Tips</Text>
          <View style={styles.tipsCard}>
            <Zap size={20} color="#eab308" />
            <View style={styles.tipsContent}>
              {currentPhaseData.tips.slice(0, 2).map((tip, index) => (
                <Text key={index} style={styles.tipText}>
                  💡 {tip}
                </Text>
              ))}
            </View>
          </View>
        </View> */}
        </ScrollView>
      </LinearGradient>

      {/* Phase Detail Modal */}
      <PhaseDetailModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        phaseData={currentPhaseData}
        phaseColor={phaseColor}
      />
    </>
  );
}

// ============================================================================
// DYNAMIC STYLES (Theme-aware)
// ============================================================================

const createStyles = (theme: any) => StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: { 
    flex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  topMargin: { 
    marginTop: 0 
  },
  hormoneChartContainer: {
    marginTop: 12,
  },
  section: { 
    marginHorizontal: 20, 
    marginBottom: 24 
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Bold',
    marginBottom: 12,
  },
  recommendationsBlock: {
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  recommendationItem: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    gap: 12 
  },
  recommendationEmoji: { 
    fontSize: 24 
  },
  recommendationContent: { 
    flex: 1 
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  recommendationText: { 
    fontSize: 14, 
    lineHeight: 20 
  },
  tipsCard: {
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderLeftWidth: 4,
  },
  tipsContent: { 
    flex: 1, 
    gap: 8 
  },
  tipText: { 
    fontSize: 14, 
    lineHeight: 20 
  },
});
