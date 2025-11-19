import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
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

export default function HomeScreen() {
  const { cycleState, dispatch } = useCycleRedux();
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];
  const [modalVisible, setModalVisible] = useState(false);

  const currentPhaseData =
    phaseRecommendations[
      (cycleState.currentPhase.name as unknown) as keyof typeof phaseRecommendations
    ] || phaseRecommendations['menstrual'];

    // console.log(cycleState.currentPhase, "<<<<<<<")

  const phaseColor = currentPhaseData.color;

  const logSymptoms = () => {
    const existingEntry = cycleState.entries.find(entry => entry.date === today);
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
      dispatch(addEntry(newEntry));
      Alert.alert('Success', 'Symptoms logged for today!');
    }
  };

  const getDaysUntilNextPeriod = () => {
    if (!cycleState.predictions.nextPeriod) return undefined;
    const nextPeriod = new Date(cycleState.predictions?.nextPeriod?.likely || '');
    const today = new Date();
    const diff = Math.ceil((nextPeriod.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: phaseColor + '20' }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Logo color={phaseColor} width={250} height={80} />
        </View>
        <WeekPhaseStrip firstDay={0} />

        {/* Current Phase Card - Now Clickable */}
        <View style={styles.topMargin}>
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
        <QuickActions onLogSymptoms={logSymptoms} />

        {/* Hormone Chart */}
        <View style={{ marginTop: 12 }}>
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  topMargin: { marginTop: 0 },
  section: { marginHorizontal: 20, marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Bold',
    color: '#1f29375b',
    marginBottom: 12,
  },
  recommendationsBlock: {
    backgroundColor: '#f3e8ff',
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  recommendationItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  recommendationEmoji: { fontSize: 24 },
  recommendationContent: { flex: 1 },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  recommendationText: { fontSize: 14, color: '#4b5563', lineHeight: 20 },
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
  tipsContent: { flex: 1, gap: 8 },
  tipText: { fontSize: 14, color: '#92400e', lineHeight: 20 },
});
