import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Image, Modal } from 'react-native';
import { useCycle } from '@/contexts/CycleContext';
import { Apple, ChevronRight, Dumbbell, FileText, Flame, Zap } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import HeaderStatusBar from '@/components/HeaderStatusBar';
import HormoneChart from '@/components/HormoneChart';
import OnboardingFlow from '../../src/screens/OnboardingFlow';
import HormoneChartScreen from '../../src/screens/HormoneChartScreen';
import { phaseRecommendations } from '@/data/phaseRecommendation';
import PhaseCard from '@/components/core-components/PhaseCard';
import AppButton from '@/components/core-components/Button';
import AppText from '@/components/core-components/AppText';

export default function HomeScreen() {
  const { state, dispatch } = useCycle();
  const router = useRouter();
  const currentPhaseData = phaseRecommendations[state.currentPhase] || phaseRecommendations['menstrual'];
  const today = new Date().toISOString().split('T')[0];
  const [showOnboarding, setShowOnboarding] = useState(false);

  const logSymptoms = () => {
    const existingEntry = state.entries.find(entry => entry.date === today);
    if (existingEntry) {
      Alert.alert('Symptoms', 'Symptoms already logged for today. Use calendar to edit.');
    } else {
      const newEntry = {
        date: today,
        isPeriod: false,
        symptoms: {
          mood: 3,
          cramps: 1,
          energy: 3,
        },
      };
      dispatch({ type: 'ADD_ENTRY', payload: newEntry });
      Alert.alert('Success', 'Symptoms logged for today!');
    }
  };

  const getDaysUntilNextPeriod = () => {
    if (!state.nextPeriodDate) return undefined;
    const nextPeriod = new Date(state.nextPeriodDate);
    const today = new Date();
    const diff = Math.ceil((nextPeriod.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <>
      <HeaderStatusBar />
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 34 }}>
          <Flame size={28} color="black" />
          <AppText variant="bold" style={{ fontSize: 24, marginLeft: 0, color: 'black' }}>
            KitFitx
          </AppText>
        </View>

        {/* Current Phase Card */}
        <View style={styles.topMargin}>
          <PhaseCard
            phaseName={currentPhaseData.name}
            emoji={currentPhaseData.foods.icon}
            cycleDay={state.cycleDay}
            daysUntilNextPeriod={getDaysUntilNextPeriod()}
            image={currentPhaseData.image}
            phaseColor={currentPhaseData.color}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.actionsContainer}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <ChevronRight size={25} strokeWidth={3} color="#61606076" />
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, paddingTop: 14 }}
            >
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButton3D, { backgroundColor: '#ee4445' }]}
                onPress={() => router.push('/food')}
              >
                <Text style={styles.actionText}>Food</Text>
                <Text style={{ color: '#ffffff9d', }}>Tracking</Text>
                <AppButton title="Go" variant="secondary" size="xs" style={{ marginTop: 8, backgroundColor: '#ffffff33', borderColor: '#ffffff55', alignSelf: 'flex-start', alignContent: 'flex-start' }} iconPosition='right' icon={<ChevronRight size={16} color="#ffffff" strokeWidth={3} />} />

                <Image source={require('../../assets/images/food.png')} style={{ width: 80, height: 100, position: 'absolute', bottom: 6, right: -2 }} resizeMode='contain' />

              </TouchableOpacity>


              <TouchableOpacity
                style={[styles.actionButton, styles.actionButton3D, { backgroundColor: '#8b5cf6' }]}
                onPress={() => router.push('/exercise')}
              >
                <Text style={styles.actionText}>Exercise</Text>
                <Text style={{ color: '#ffffff9d', }}>Tracking</Text>
                <AppButton title="Go" variant="secondary" size="xs" style={{ marginTop: 8, backgroundColor: '#ffffff33', borderColor: '#ffffff55', alignSelf: 'flex-start', alignContent: 'flex-start' }} iconPosition='right' icon={<ChevronRight size={16} color="#ffffff" strokeWidth={3} />} />

                <Image source={require('../../assets/images/dumbbel.png')} style={{ width: 80, height: 100, position: 'absolute', bottom: 8, right: -2 }} resizeMode='contain' />

              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.actionButton3D, { backgroundColor: '#eab308' }]}
                onPress={() => setShowOnboarding(true)}
              >
                <Text style={styles.actionText}>Onboarding</Text>
                <Text style={{ color: '#ffffff9d', }}>profile</Text>
                <AppButton title="Go" variant="secondary" size="xs" style={{ marginTop: 8, backgroundColor: '#ffffff33', borderColor: '#ffffff55', alignSelf: 'flex-start', alignContent: 'flex-start' }} iconPosition='right' icon={<ChevronRight size={16} color="#ffffff" strokeWidth={3} />} />
                <Image source={require('../../assets/images/oval.png')} style={{ width: 80, height: 100, position: 'absolute', bottom: 6, right: -2 }} resizeMode='contain' />
              </TouchableOpacity>

            </View>
            <View
              style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, paddingTop: 0 }}
            >

              <TouchableOpacity
                style={[styles.actionButton, styles.actionButton3D, { backgroundColor: '#e42a50' }]}
                onPress={() => router.push('/exercise')}
              >
                <Text style={styles.actionText}>Logs</Text>
                <Text style={{ color: '#ffffff9d', }}>Periods</Text>
                <AppButton title="Go" variant="secondary" size="xs" style={{ marginTop: 8, backgroundColor: '#ffffff33', borderColor: '#ffffff55', alignSelf: 'flex-start', alignContent: 'flex-start' }} iconPosition='right' icon={<ChevronRight size={16} color="#ffffff" strokeWidth={3} />} />

                <Image source={require('../../assets/images/menstal.png')} style={{ width: 80, height: 100, position: 'absolute', bottom: 6, right: 0 }} resizeMode='contain' />

              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.actionButton3D, { backgroundColor: '#10b981' }]}
                onPress={logSymptoms}
              >
                <Text style={styles.actionText}>Note</Text>
                <Text style={{ color: '#ffffff9d', }}>take note</Text>
                <AppButton title="Go" variant="secondary" size="xs" style={{ marginTop: 8, backgroundColor: '#ffffff33', borderColor: '#ffffff55', alignSelf: 'flex-start', alignContent: 'flex-start' }} iconPosition='right' icon={<ChevronRight size={16} color="#ffffff" strokeWidth={3} />} />
                <Image source={require('../../assets/images/note.png')} style={{ width: 80, height: 100, position: 'absolute', bottom: 8, right: 2 }} resizeMode='contain' />
              </TouchableOpacity>


            </View>
          </View>
        </View>

        {/* Hormonal Insights Graph */}
        <HormoneChart cycleDay={state.cycleDay} currentPhase={state.currentPhase} />
        <View style={{ marginTop: 12 }}>
          <HormoneChartScreen />
        </View>

        {/* Today's Recommendations */} 
        <View style={styles.section}>
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
                <Text style={styles.recommendationTitle}>{currentPhaseData.exercises.title}</Text>
                <Text style={styles.recommendationText}>
                  {currentPhaseData.exercises.items[0]}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Today's Tips */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <Text style={styles.sectionTitle}>Phase Tips</Text>
          <View style={styles.tipsCard}>
            <Zap size={20} color="#eab308" />
            <View style={styles.tipsContent}>
              {currentPhaseData.tips.slice(0, 2).map((tip, index) => (
                <Text key={index} style={styles.tipText}>💡 {tip}</Text>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
      <Modal visible={showOnboarding} animationType="slide" onRequestClose={() => setShowOnboarding(false)}>
        <OnboardingFlow onDone={() => setShowOnboarding(false)} />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefefe',
  },
  topMargin: {
    marginTop: 10,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    // fontWeight: '700',
    fontFamily: 'Bold',
    color: '#1f29375b',
    marginBottom: 0,
  },
  actionsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  actionButton: {
    flex: 2,
    backgroundColor: '#fff',
    padding: 16,
    width: 160,
    borderRadius: 16,
    alignItems: 'flex-start',
  },
  actionButton3D: {
    // elevation: 8,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.15,
    // shadowRadius: 8,
    // transform: [{ translateY: -2 }],
  },
  actionText: {
    marginTop: 8,
    fontSize: 20,
    fontFamily: 'Bold',
    color: 'white',
    textAlign: 'left',
  },
  recommendationsBlock: {
    backgroundColor: '#f3e8ff',
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  recommendationEmoji: {
    fontSize: 24,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  tipsCard: {
    backgroundColor: '#fffbeb',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  tipsContent: {
    flex: 1,
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
});
