import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useCycle } from '@/contexts/CycleContext';
import { aiService } from '@/services/aiService';
import { Brain, TrendingUp, Target, Lightbulb } from 'lucide-react-native';

interface AIInsightsProps {
  visible: boolean;
  onClose: () => void;
}

export function AIInsights({ visible, onClose }: AIInsightsProps) {
  const { state } = useCycle();
  const [insights, setInsights] = useState<{
    insights: string[];
    suggestions: string[];
    nutritionScore: number;
  } | null>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && !insights) {
      loadAIInsights();
    }
  }, [visible]);

  const loadAIInsights = async () => {
    setLoading(true);
    try {
      // Get eating pattern analysis
      const patternAnalysis = await aiService.analyzeEatingPatterns(state.foodEntries);
      setInsights(patternAnalysis);

      // Get phase-based recommendations
      const today = new Date().toISOString().split('T')[0];
      const todaysFoodEntries = state.foodEntries.filter(entry => entry.date === today);
      const currentIntake = todaysFoodEntries.reduce(
        (sum, entry) => ({
          calories: sum.calories + entry.calories,
          protein: sum.protein + entry.protein,
          carbs: sum.carbs + entry.carbs,
          fat: sum.fat + entry.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      const phaseRecommendations = await aiService.getPhaseBasedRecommendations(
        state.currentPhase,
        currentIntake,
        {
          age: state.profile.age,
          activityLevel: state.profile.activityLevel,
          goals: state.profile.wellnessGoals,
        }
      );
      setRecommendations(phaseRecommendations);
    } catch (error) {
      console.error('Failed to load AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Brain size={24} color="#8b5cf6" />
          <Text style={styles.title}>AI Insights</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Analyzing your data...</Text>
          </View>
        ) : (
          <>
            {/* Nutrition Score */}
            {insights && (
              <View style={styles.scoreCard}>
                <View style={styles.scoreHeader}>
                  <Target size={20} color="#10b981" />
                  <Text style={styles.scoreTitle}>Nutrition Score</Text>
                </View>
                <View style={styles.scoreDisplay}>
                  <Text style={styles.scoreNumber}>{insights.nutritionScore}</Text>
                  <Text style={styles.scoreOutOf}>/100</Text>
                </View>
                <View style={styles.scoreBar}>
                  <View 
                    style={[
                      styles.scoreProgress, 
                      { width: `${insights.nutritionScore}%` }
                    ]} 
                  />
                </View>
              </View>
            )}

            {/* Personal Insights */}
            {insights && (
              <View style={styles.insightsCard}>
                <View style={styles.cardHeader}>
                  <TrendingUp size={20} color="#3b82f6" />
                  <Text style={styles.cardTitle}>Your Patterns</Text>
                </View>
                {insights.insights.map((insight, index) => (
                  <View key={index} style={styles.insightItem}>
                    <Text style={styles.insightText}>• {insight}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* AI Suggestions */}
            {insights && (
              <View style={styles.suggestionsCard}>
                <View style={styles.cardHeader}>
                  <Lightbulb size={20} color="#f59e0b" />
                  <Text style={styles.cardTitle}>Smart Suggestions</Text>
                </View>
                {insights.suggestions.map((suggestion, index) => (
                  <View key={index} style={styles.suggestionItem}>
                    <Text style={styles.suggestionText}>💡 {suggestion}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Phase Recommendations */}
            {recommendations && (
              <View style={styles.recommendationsCard}>
                <View style={styles.cardHeader}>
                  <Brain size={20} color="#ec4899" />
                  <Text style={styles.cardTitle}>
                    {recommendations.phase} Phase Guidance
                  </Text>
                </View>
                <View style={styles.macroBalance}>
                  <Text style={styles.macroTitle}>Optimal Macro Balance:</Text>
                  <View style={styles.macroGrid}>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroValue}>{recommendations.macroBalance.protein}%</Text>
                      <Text style={styles.macroLabel}>Protein</Text>
                    </View>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroValue}>{recommendations.macroBalance.carbs}%</Text>
                      <Text style={styles.macroLabel}>Carbs</Text>
                    </View>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroValue}>{recommendations.macroBalance.fat}%</Text>
                      <Text style={styles.macroLabel}>Fat</Text>
                    </View>
                  </View>
                </View>
                {recommendations.recommendations.map((rec: string, index: number) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Text style={styles.recommendationText}>🎯 {rec}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6b7280',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  scoreCard: {
    backgroundColor: '#f0fdf4',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: '#10b981',
  },
  scoreOutOf: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 4,
  },
  scoreBar: {
    height: 8,
    backgroundColor: '#dcfce7',
    borderRadius: 4,
  },
  scoreProgress: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  insightsCard: {
    backgroundColor: '#eff6ff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  insightItem: {
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  suggestionsCard: {
    backgroundColor: '#fffbeb',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  suggestionItem: {
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  recommendationsCard: {
    backgroundColor: '#fdf2f8',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ec4899',
  },
  macroBalance: {
    marginBottom: 16,
  },
  macroTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 12,
    borderRadius: 8,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ec4899',
  },
  macroLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  recommendationItem: {
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#be185d',
    lineHeight: 20,
  },
});