import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { phaseRecommendations, PhaseData } from '@/data/recommendations';
import { useCycle } from '@/contexts/CycleContext';
import { Chrome as Home } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function TipsScreen() {
  const { state } = useCycle();
  
  const phases = Object.entries(phaseRecommendations);
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#fdf2f8', '#f8fafc']}
        style={styles.header}
      >
        <View style={styles.homeIconContainer}>
          <TouchableOpacity 
            style={styles.backToHomeButton}
            onPress={() => router.push('/')}
          >
            <Home size={20} color="#ec4899" />
            <Text style={styles.backToHomeText}>Home</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Phase Guide</Text>
          <Text style={styles.subtitle}>Complete recommendations for every phase</Text>
        </View>
      </LinearGradient>

      {/* All Phases */}
      {phases.map(([phaseKey, phaseData]: [string, PhaseData]) => {
        const isCurrentPhase = phaseKey === state.currentPhase;
        
        return (
          <View key={phaseKey} style={[
            styles.phaseContainer,
            isCurrentPhase && styles.currentPhaseContainer2
          ]}>
            {/* Phase Header */}
            <View style={[styles.phaseHeader, { backgroundColor: phaseData.color }]}>
              <Text style={styles.phaseName}>{phaseData.name}</Text>
              <Text style={styles.phaseDescription}>{phaseData.description}</Text>
              {isCurrentPhase && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>Current Phase</Text>
                </View>
              )}
            </View>

            {/* Food Recommendations */}
            <View style={styles.recommendationSection}>
              <View style={styles.recommendationHeader}>
                <Text style={styles.recommendationEmoji}>{phaseData.foods.icon}</Text>
                <Text style={styles.recommendationTitle}>{phaseData.foods.title}</Text>
              </View>
              <Text style={styles.recommendationSubtitle}>{phaseData.foods.description}</Text>
              <View style={styles.itemsGrid}>
                {phaseData.foods.items.map((item, index) => (
                  <View key={index} style={styles.itemCard}>
                    <Text style={styles.itemText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Exercise Recommendations */}
            <View style={styles.recommendationSection}>
              <View style={styles.recommendationHeader}>
                <Text style={styles.recommendationEmoji}>{phaseData.exercises.icon}</Text>
                <Text style={styles.recommendationTitle}>{phaseData.exercises.title}</Text>
              </View>
              <Text style={styles.recommendationSubtitle}>{phaseData.exercises.description}</Text>
              <View style={styles.itemsGrid}>
                {phaseData.exercises.items.map((item, index) => (
                  <View key={index} style={styles.itemCard}>
                    <Text style={styles.itemText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Phase Tips */}
            <View style={styles.tipsSection}>
              <Text style={styles.tipsTitle}>💡 Phase Tips</Text>
              <View style={styles.tipsList}>
                {phaseData.tips.map((tip, index) => (
                  <Text key={index} style={styles.tipText}>• {tip}</Text>
                ))}
              </View>
            </View>
          </View>
        );
      })}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefefe',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  homeIconContainer: {
    marginBottom: 16,
  },
  headerContent: {
    flex: 1,
  },
  backToHomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  backToHomeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ec4899',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  currentPhaseContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  currentPhaseLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  currentPhaseBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  currentPhaseText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  phaseContainer: {
    marginHorizontal: 20,
    marginBottom: 32,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  currentPhaseContainer2: {
    borderWidth: 2,
    borderColor: '#ec4899',
  },
  phaseHeader: {
    padding: 20,
    position: 'relative',
  },
  phaseName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 6,
  },
  phaseDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  currentBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ec4899',
  },
  recommendationSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
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
  recommendationSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  itemsGrid: {
    gap: 8,
  },
  itemCard: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#d1d5db',
  },
  itemText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  tipsSection: {
    padding: 20,
    backgroundColor: '#fffbeb',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 12,
  },
  tipsList: {
    gap: 6,
  },
  tipText: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 20,
  },
});