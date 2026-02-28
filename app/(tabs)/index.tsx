import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, Menu, GalleryHorizontalEnd, PanelRight, PanelRightClose, Sun, Moon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
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
import { CoverFlowCarousel, type CoverFlowCardItem } from '@/components/animeted/coverflow-card';
import SmokeLayer from '@/components/animeted/SmokeLayer';

export default function HomeScreen() {
  const { cycleState, dispatch } = useCycleRedux();
  const { theme, setThemeName } = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { accentColor, themeName } = useTheme();
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

  const coverFlowItems: CoverFlowCardItem[] = useMemo(
    () => [
      {
        id: '1',
        image:
          'https://img.freepik.com/free-photo/woman-being-upset-holding-period-calendar_23-2148381547.jpg?ga=GA1.1.1022337787.1763629627&semt=ais_hybrid&w=740&q=80',
        title: 'Track your cycle',
        subtitle: 'Stay on top of dates',


      },
      {
        id: '2',
        gradientColors: ['#ec4899', '#be185d'],
        icon: <Zap size={44} color="#fff" strokeWidth={2} />,
        title: 'Energy',
        subtitle: 'Peak days',
      },
      {
        id: '3',
        image:
          'https://img.freepik.com/premium-photo/calendar-with-date-april-date-may_1115474-165600.jpg?w=740&q=80',
        title: 'Plan ahead',
      },
      {
        id: '4',
        gradientColors: ['#8b5cf6', '#5b21b6'],
        title: 'Follicular phase',
        subtitle: 'Rising energy',
      },
      {
        id: '5',
        gradientColors: ['#06b6d4', '#0e7490'],
        icon: <Zap size={40} color="#fff" />,
        title: 'Focus time',
      },
      {
        id: '6',
        image:
          'https://img.freepik.com/free-photo/athletic-woman-practicing-sport-outdoor_23-2148196801.jpg?w=740&q=80',
        title: 'Move your body',
        subtitle: 'Any phase',
      },
    ],
    []
  );


  return (
    <>

      <LinearGradient
        colors={gradientColors}
        style={dynamicStyles.gradientContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {/* Header with Menu Button */}


        <ScrollView
          style={dynamicStyles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={dynamicStyles.headerContainer}>
            <TouchableOpacity
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              style={[dynamicStyles.menuButton,]}
              activeOpacity={0.7}
            >
              <PanelRightClose size={20} strokeWidth={2} color={theme.cardBackground} />
            </TouchableOpacity>
            <View style={dynamicStyles.logoContainer}>
              <Logo color={phaseColor} width={210} height={80} />
            </View>
            <TouchableOpacity
              onPress={() =>
                setThemeName(themeName === 'light' ? 'dark' : 'light')
                // { }
              }
              style={dynamicStyles.themeToggleButton}
              activeOpacity={0.7}
            >
              {themeName === 'light' ? (
                <Moon size={20} strokeWidth={2} color={theme.textPrimary} />
              ) : (
                <Sun size={20} strokeWidth={2} color={theme.textPrimary} />
              )}
            </TouchableOpacity>
          </View>
          {/* Logo */}

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
            {/* Option A: Keep the same engine, but use real cycle data (easiest)
            Goal: Same estimated curves, but driven by real period/cycle data instead of generateMockCycles().

            Option B: Add real lab/clinical hormone results
            Goal: Show actual hormone levels (from blood/saliva tests) when the user has them */}

            <HormoneChartScreen />
            <View style={{ height: 260, alignContent: 'center', justifyContent: 'center', backgroundColor: theme.background, }}>
              <CoverFlowCarousel items={coverFlowItems} />
            </View>
          </View>




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
  headerContainer: {
    paddingTop: 40,
    paddingHorizontal: 8,
    // paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuButton: {
    paddingTop: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    flex: 1,
  },
  themeToggleButton: {
    paddingTop: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
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
 
});
