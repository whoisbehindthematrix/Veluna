import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { aiService } from '@/services/aiService';
import { Brain, TrendingUp, Target, Lightbulb } from 'lucide-react-native';
import { useCycleStore } from '@/hooks/useCycleStore';

interface AIInsightsProps {
  visible: boolean;
  onClose: () => void;
}

export function AIInsights({ visible, onClose }: AIInsightsProps) {
  const { cycle } = useCycleStore();

  const [insights, setInsights] = useState<{
    insights: string[];
    suggestions: string[];
    nutritionScore: number;
  } | null>(null);

  const [recommendations, setRecommendations] = useState<{
    phase?: string;
    macroBalance?: { protein: number; carbs: number; fat: number };
    recommendations?: string[];
  } | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && !insights && !loading) {
      loadAIInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const loadAIInsights = async () => {
    try {
      setLoading(true);

      // ✅ Step 1: Analyze eating patterns
      const patternAnalysis =
        (await aiService.analyzeEatingPatterns(cycle.foodEntries)) || {
          insights: [],
          suggestions: [],
          nutritionScore: 0,
        };
      setInsights(patternAnalysis);

      // ✅ Step 2: Build today's nutrition summary
      const today = new Date().toISOString().split('T')[0];
      const todaysFoodEntries = cycle.foodEntries?.filter((e) => e.date === today) || [];

      const currentIntake = todaysFoodEntries.reduce(
        (sum, entry) => ({
          calories: sum.calories + (entry.calories || 0),
          protein: sum.protein + (entry.protein || 0),
          carbs: sum.carbs + (entry.carbs || 0),
          fat: sum.fat + (entry.fat || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      // ✅ Step 3: Fetch AI phase-based recommendations
      const profile = cycle.profile || {};
      const phaseRecommendations =
        (await aiService.getPhaseBasedRecommendations(
          cycle.currentPhase,
          currentIntake,
          {
            age: profile.age || 25,
            activityLevel: profile.activityLevel || 'moderate',
            goals: profile.wellnessGoals || [],
          }
        )) || {};

      setRecommendations(phaseRecommendations);
    } catch (error) {
      console.error('⚠️ Failed to load AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Brain size={24} color="#8b5cf6" />
          <Text style={styles.title}>AI Insights</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
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
                  <Text style={styles.scoreNumber}>{insights.nutritionScore ?? 0}</Text>
                  <Text style={styles.scoreOutOf}>/100</Text>
                </View>
                <View style={styles.scoreBar}>
                  <View
                    style={[
                      styles.scoreProgress,
                      { width: `${Math.min(insights.nutritionScore || 0, 100)}%` },
                    ]}
                  />
                </View>
              </View>
            )}

            {/* Personal Insights */}
            {insights?.insights?.length ? (
              <View style={styles.insightsCard}>
                <View style={styles.cardHeader}>
                  <TrendingUp size={20} color="#3b82f6" />
                  <Text style={styles.cardTitle}>Your Patterns</Text>
                </View>
                {insights.insights.map((item, i) => (
                  <Text key={i} style={styles.insightText}>
                    • {item}
                  </Text>
                ))}
              </View>
            ) : null}

            {/* AI Suggestions */}
            {insights?.suggestions?.length ? (
              <View style={styles.suggestionsCard}>
                <View style={styles.cardHeader}>
                  <Lightbulb size={20} color="#f59e0b" />
                  <Text style={styles.cardTitle}>Smart Suggestions</Text>
                </View>
                {insights.suggestions.map((item, i) => (
                  <Text key={i} style={styles.suggestionText}>
                    💡 {item}
                  </Text>
                ))}
              </View>
            ) : null}

            {/* Phase Recommendations */}
            {recommendations && (
              <View style={styles.recommendationsCard}>
                <View style={styles.cardHeader}>
                  <Brain size={20} color="#ec4899" />
                  <Text style={styles.cardTitle}>
                    {recommendations.phase || cycle.currentPhase.name} Phase Guidance
                  </Text>
                </View>

                {recommendations.macroBalance && (
                  <View style={styles.macroBalance}>
                    <Text style={styles.macroTitle}>Optimal Macro Balance:</Text>
                    <View style={styles.macroGrid}>
                      <View style={styles.macroItem}>
                        <Text style={styles.macroValue}>
                          {recommendations.macroBalance.protein ?? 0}%
                        </Text>
                        <Text style={styles.macroLabel}>Protein</Text>
                      </View>
                      <View style={styles.macroItem}>
                        <Text style={styles.macroValue}>
                          {recommendations.macroBalance.carbs ?? 0}%
                        </Text>
                        <Text style={styles.macroLabel}>Carbs</Text>
                      </View>
                      <View style={styles.macroItem}>
                        <Text style={styles.macroValue}>
                          {recommendations.macroBalance.fat ?? 0}%
                        </Text>
                        <Text style={styles.macroLabel}>Fat</Text>
                      </View>
                    </View>
                  </View>
                )}

                {recommendations.recommendations?.length ? (
                  recommendations.recommendations.map((rec, i) => (
                    <Text key={i} style={styles.recommendationText}>
                      🎯 {rec}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.recommendationText}>
                    No personalized guidance available right now.
                  </Text>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 20, fontWeight: '700', color: '#1f2937' },
  closeButton: { padding: 8 },
  closeButtonText: { fontSize: 18, color: '#6b7280' },
  content: { flex: 1, padding: 20 },
  loadingContainer: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { fontSize: 16, color: '#6b7280' },

  scoreCard: {
    backgroundColor: '#f0fdf4',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  scoreHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  scoreTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  scoreDisplay: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
  scoreNumber: { fontSize: 36, fontWeight: '700', color: '#10b981' },
  scoreOutOf: { fontSize: 16, color: '#6b7280', marginLeft: 4 },
  scoreBar: { height: 8, backgroundColor: '#dcfce7', borderRadius: 4 },
  scoreProgress: { height: '100%', backgroundColor: '#10b981', borderRadius: 4 },

  insightsCard: {
    backgroundColor: '#eff6ff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  insightText: { fontSize: 14, color: '#1e40af', lineHeight: 20, marginBottom: 8 },

  suggestionsCard: {
    backgroundColor: '#fffbeb',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  suggestionText: { fontSize: 14, color: '#92400e', lineHeight: 20, marginBottom: 8 },

  recommendationsCard: {
    backgroundColor: '#fdf2f8',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ec4899',
  },
  macroBalance: { marginBottom: 16 },
  macroTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.5)',
    padding: 12,
    borderRadius: 8,
  },
  macroItem: { alignItems: 'center' },
  macroValue: { fontSize: 16, fontWeight: '700', color: '#ec4899' },
  macroLabel: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  recommendationText: {
    fontSize: 14,
    color: '#be185d',
    lineHeight: 20,
    marginBottom: 8,
  },
});
