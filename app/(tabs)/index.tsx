import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCycle } from '@/contexts/CycleContext';
import { phaseRecommendations } from '@/data/recommendations';
import { Calendar, Droplets, Heart, Zap, Apple, Dumbbell, FileText, TrendingUp, Activity } from 'lucide-react-native';
import { useRouter } from 'expo-router';

// Hormone curve data for a typical 28-day cycle
const curveData = [
  // Days 1-5: Menstrual phase
  { estrogen: 20, progesterone: 10, lh: 15, fsh: 25 },
  { estrogen: 25, progesterone: 12, lh: 18, fsh: 30 },
  { estrogen: 30, progesterone: 15, lh: 20, fsh: 35 },
  { estrogen: 35, progesterone: 18, lh: 22, fsh: 40 },
  { estrogen: 40, progesterone: 20, lh: 25, fsh: 45 },
  // Days 6-13: Follicular phase
  { estrogen: 45, progesterone: 22, lh: 28, fsh: 50 },
  { estrogen: 50, progesterone: 25, lh: 30, fsh: 55 },
  { estrogen: 55, progesterone: 28, lh: 35, fsh: 60 },
  { estrogen: 60, progesterone: 30, lh: 40, fsh: 65 },
  { estrogen: 65, progesterone: 32, lh: 45, fsh: 70 },
  { estrogen: 70, progesterone: 35, lh: 50, fsh: 75 },
  { estrogen: 75, progesterone: 38, lh: 60, fsh: 80 },
  { estrogen: 80, progesterone: 40, lh: 70, fsh: 85 },
  // Days 14-16: Ovulatory phase
  { estrogen: 85, progesterone: 45, lh: 90, fsh: 90 },
  { estrogen: 90, progesterone: 50, lh: 95, fsh: 85 },
  { estrogen: 85, progesterone: 55, lh: 80, fsh: 80 },
  // Days 17-28: Luteal phase
  { estrogen: 80, progesterone: 60, lh: 70, fsh: 75 },
  { estrogen: 75, progesterone: 65, lh: 60, fsh: 70 },
  { estrogen: 70, progesterone: 70, lh: 50, fsh: 65 },
  { estrogen: 65, progesterone: 75, lh: 45, fsh: 60 },
  { estrogen: 60, progesterone: 80, lh: 40, fsh: 55 },
  { estrogen: 55, progesterone: 85, lh: 35, fsh: 50 },
  { estrogen: 50, progesterone: 80, lh: 30, fsh: 45 },
  { estrogen: 45, progesterone: 75, lh: 25, fsh: 40 },
  { estrogen: 40, progesterone: 70, lh: 22, fsh: 35 },
  { estrogen: 35, progesterone: 60, lh: 20, fsh: 30 },
  { estrogen: 30, progesterone: 50, lh: 18, fsh: 25 },
  { estrogen: 25, progesterone: 30, lh: 15, fsh: 20 },
];

export default function HomeScreen() {
  const { state, dispatch } = useCycle();
  const router = useRouter();
  const currentPhaseData = phaseRecommendations[state.currentPhase];

  const today = new Date().toISOString().split('T')[0];
  
  const logPeriod = () => {
    const newEntry = {
      date: today,
      isPeriod: true,
      symptoms: {
        mood: 3,
        cramps: 2,
        energy: 2,
      },
    };
    dispatch({ type: 'ADD_ENTRY', payload: newEntry });
    Alert.alert('Success', 'Period logged for today!');
  };

  const logSymptoms = () => {
    // For now, we'll add a basic symptom entry
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
    if (!state.nextPeriodDate) return null;
    const nextPeriod = new Date(state.nextPeriodDate);
    const today = new Date();
    const diff = Math.ceil((nextPeriod.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Calculate hormonal insights based on cycle day and phase
  const getHormonalInsights = () => {
    const cycleDay = state.cycleDay;
    const phase = state.currentPhase;
    
    let estrogen = 0;
    let progesterone = 0;
    let pregnancyChance = 0;
    let ovulationStatus = 'Low';
    
    switch (phase) {
      case 'menstrual':
        estrogen = 20 + (cycleDay * 5);
        progesterone = 10;
        pregnancyChance = 5;
        ovulationStatus = 'Low';
        break;
      case 'follicular':
        estrogen = 30 + (cycleDay * 8);
        progesterone = 15;
        pregnancyChance = 15;
        ovulationStatus = 'Rising';
        break;
      case 'ovulatory':
        estrogen = 85;
        progesterone = 25;
        pregnancyChance = 85;
        ovulationStatus = 'High';
        break;
      case 'luteal':
        estrogen = 60 - (cycleDay * 2);
        progesterone = 80 - (cycleDay * 3);
        pregnancyChance = 25;
        ovulationStatus = 'Declining';
        break;
    }
    
    return {
      estrogen: Math.min(Math.max(estrogen, 10), 100),
      progesterone: Math.min(Math.max(progesterone, 5), 100),
      pregnancyChance: Math.min(Math.max(pregnancyChance, 5), 100),
      ovulationStatus
    };
  };

  const insights = getHormonalInsights();
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Current Phase Card */}
      <View style={[styles.phaseCard3D, styles.topMargin]}>
        <Text style={styles.phaseEmoji}>🐧</Text>
        <View style={styles.phaseContent}>
          <Text style={styles.phaseTitle3D}>{currentPhaseData.name}</Text>
          <Text style={styles.cycleDay3D}>Day {state.cycleDay}</Text>
          
          {getDaysUntilNextPeriod() && (
            <View style={styles.nextPeriodContainer3D}>
              <Droplets size={14} color="#fecaca" />
              <Text style={styles.nextPeriodText3D}>
                Next period in {getDaysUntilNextPeriod()} days
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.actionButton3D]} onPress={() => router.push('/food')}>
            <Apple size={24} color="#f97316" />
            <Text style={styles.actionText}>Food</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.actionButton3D]} onPress={() => router.push('/exercise')}>
            <Dumbbell size={24} color="#8b5cf6" />
            <Text style={styles.actionText}>Exercise</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.actionButton3D]} onPress={logPeriod}>
            <Droplets size={24} color="#ec4899" />
            <Text style={styles.actionText}>Log Period</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.actionButton3D]} onPress={logSymptoms}>
            <FileText size={24} color="#10b981" />
            <Text style={styles.actionText}>Notes</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hormonal Insights Graph */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Hormones Levels</Text>
        <View style={styles.insightsCard}>
          <LinearGradient
            colors={['#f8fafc', '#f1f5f9']}
            style={styles.insightsGradient}
          >
            {/* Description */}
            <Text style={styles.hormonalDescription}>
              {state.currentPhase === 'menstrual' && 'During menstruation, hormone levels are at their lowest. You may experience fatigue and mood changes.'}
              {state.currentPhase === 'follicular' && 'Rising estrogen levels boost your energy and mood. This is a great time for new activities.'}
              {state.currentPhase === 'ovulatory' && 'Peak hormone levels give you maximum energy and confidence. You may feel more social and active.'}
              {state.currentPhase === 'luteal' && 'With rising progesterone, you may have a calmer mood and improved sleep. Compared with the fertile window, you may feel fatigued due to the drop in estrogen.'}
            </Text>
            
            {/* Curved Graph */}
            <View style={styles.curvedGraphContainer}>
              <View style={styles.curvedGraph}>
                {/* Background curves */}
                <View style={styles.curvesContainer}>
                  {/* Estrogen curve (pink) */}
                  <View style={styles.estrogencurve}>
                    {curveData.map((point, index) => {
                      const x = (index / (curveData.length - 1)) * 100;
                      const y = 100 - point.estrogen;
                      return (
                        <View
                          key={`estrogen-${index}`}
                          style={[
                            styles.curvePoint,
                            styles.estrogenPoint,
                            {
                              left: `${x}%`,
                              top: `${y}%`,
                            },
                            index === state.cycleDay - 1 && styles.currentDayPoint,
                          ]}
                        />
                      );
                    })}
                  </View>
                  
                  {/* Progesterone curve (purple) */}
                  <View style={styles.progesteroneCurve}>
                    {curveData.map((point, index) => {
                      const x = (index / (curveData.length - 1)) * 100;
                      const y = 100 - point.progesterone;
                      return (
                        <View
                          key={`progesterone-${index}`}
                          style={[
                            styles.curvePoint,
                            styles.progesteronePoint,
                            {
                              left: `${x}%`,
                              top: `${y}%`,
                            },
                            index === state.cycleDay - 1 && styles.currentDayPoint,
                          ]}
                        />
                      );
                    })}
                  </View>
                  
                  {/* LH curve (green) */}
                  <View style={styles.lhCurve}>
                    {curveData.map((point, index) => {
                      const x = (index / (curveData.length - 1)) * 100;
                      const y = 100 - point.lh;
                      return (
                        <View
                          key={`lh-${index}`}
                          style={[
                            styles.curvePoint,
                            styles.lhPoint,
                            {
                              left: `${x}%`,
                              top: `${y}%`,
                            },
                            index === state.cycleDay - 1 && styles.currentDayPoint,
                          ]}
                        />
                      );
                    })}
                  </View>
                  
                  {/* FSH curve (teal) */}
                  <View style={styles.fshCurve}>
                    {curveData.map((point, index) => {
                      const x = (index / (curveData.length - 1)) * 100;
                      const y = 100 - point.fsh;
                      return (
                        <View
                          key={`fsh-${index}`}
                          style={[
                            styles.curvePoint,
                            styles.fshPoint,
                            {
                              left: `${x}%`,
                              top: `${y}%`,
                            },
                            index === state.cycleDay - 1 && styles.currentDayPoint,
                          ]}
                        />
                      );
                    })}
                  </View>
                </View>
                
                {/* Current day indicator */}
                <View style={styles.currentDayIndicator}>
                  <View style={[
                    styles.currentDayLine,
                    { left: `${((state.cycleDay - 1) / (curveData.length - 1)) * 100}%` }
                  ]} />
                  <View style={[
                    styles.currentDayMarker,
                    { left: `${((state.cycleDay - 1) / (curveData.length - 1)) * 100}%` }
                  ]}>
                    <Text style={styles.currentDayText}>{state.cycleDay}</Text>
                  </View>
                </View>
                
                {/* Phase indicators */}
                <View style={styles.phaseIndicators}>
                  <View style={[styles.phaseIndicator, styles.menstrualPhase]}>
                    <Text style={styles.phaseIcon}>🩸</Text>
                  </View>
                  <View style={[styles.phaseIndicator, styles.ovulationPhase]}>
                    <Text style={styles.phaseIcon}>☀️</Text>
                  </View>
                </View>
              </View>
            </View>
            
            {/* Legend */}
            <View style={styles.hormoneLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#ec4899' }]} />
                <Text style={styles.legendText}>Estrogen</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#a855f7' }]} />
                <Text style={styles.legendText}>Progesterone</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
                <Text style={styles.legendText}>LH</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#06b6d4' }]} />
                <Text style={styles.legendText}>FSH</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#374151' }]} />
                <Text style={styles.legendText}>All</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
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

      {/* Today's Recommendations */}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefefe',
  },
  topMargin: {
    marginTop: 60,
  },
  phaseCard3D: {
    alignSelf: 'stretch',
    marginHorizontal: 20,
    backgroundColor: '#fff',
    marginTop: 20,
    marginBottom: 20,
    padding: 12,
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    transform: [{ translateY: -2 }],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    gap: 16,
  },
  phaseEmoji: {
    fontSize: 28,
  },
  phaseContent: {
    flex: 1,
  },
  phaseTitle3D: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  cycleDay3D: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  nextPeriodContainer3D: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  nextPeriodText3D: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fecaca',
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  phaseTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  cycleDay: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  phaseDescription: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
    lineHeight: 20,
  },
  nextPeriodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nextPeriodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ec4899',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  actionButton3D: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    transform: [{ translateY: -2 }],
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  recommendationCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  recommendationEmoji: {
    fontSize: 24,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  itemsList: {
    gap: 4,
  },
  listItem: {
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
  insightsCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  insightsGradient: {
    padding: 20,
  },
  hormonalDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  curvedGraphContainer: {
    height: 200,
    marginBottom: 20,
  },
  curvedGraph: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  curvesContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 40,
  },
  estrogencurve: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  progesteroneCurve: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  lhCurve: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fshCurve: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  curvePoint: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    transform: [{ translateX: -1.5 }, { translateY: -1.5 }],
  },
  estrogenPoint: {
    backgroundColor: '#ec4899',
    opacity: 0.8,
  },
  progesteronePoint: {
    backgroundColor: '#a855f7',
    opacity: 0.8,
  },
  lhPoint: {
    backgroundColor: '#10b981',
    opacity: 0.8,
  },
  fshPoint: {
    backgroundColor: '#06b6d4',
    opacity: 0.8,
  },
  currentDayIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  currentDayLine: {
    position: 'absolute',
    top: 20,
    bottom: 40,
    width: 2,
    backgroundColor: '#1f2937',
    transform: [{ translateX: -1 }],
  },
  currentDayMarker: {
    position: 'absolute',
    bottom: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: -16 }],
  },
  currentDayText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  phaseIndicators: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  phaseIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menstrualPhase: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  ovulationPhase: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
  },
  phaseIcon: {
    fontSize: 12,
  },
  hormoneLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  graphContainer: {
    marginBottom: 20,
  },
  graphArea: {
    height: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  yAxisLabels: {
    position: 'absolute',
    left: 0,
    top: 16,
    bottom: 32,
    justifyContent: 'space-between',
    width: 30,
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  axisLabel: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
  graphLines: {
    flex: 1,
    marginLeft: 40,
    marginRight: 10,
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  hormoneCurves: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  currentDayPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    transform: [{ translateX: -3 }, { translateY: 3 }],
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  estrogenLegend: {
    backgroundColor: '#ec4899',
  },
  progesteroneLegend: {
    backgroundColor: '#8b5cf6',
  },
  currentDayLegend: {
    backgroundColor: '#f59e0b',
  },
});