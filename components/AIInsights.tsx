import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { aiService } from '@/services/aiService';
import { Brain, TrendingUp, Target, Lightbulb } from 'lucide-react-native';
import { useCycleStore } from '@/hooks/useCycleStore';
import { useTheme } from '@/src/context/ThemeContext';

interface AIInsightsProps {
  visible: boolean;
  onClose: () => void;
}

export function AIInsights({ visible, onClose }: AIInsightsProps) {
  const { cycle } = useCycleStore();
  const { theme, accentColor } = useTheme();
  
  const dynamicStyles = useMemo(() => createStyles(theme, accentColor), [theme, accentColor]);

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
    <View style={[dynamicStyles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[dynamicStyles.header, { 
        borderBottomColor: theme.border,
        backgroundColor: theme.cardBackground,
      }]}>
        <View style={dynamicStyles.headerLeft}>
          <Brain size={24} color={accentColor} />
          <Text style={[dynamicStyles.title, { color: theme.textPrimary }]}>AI Insights</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={dynamicStyles.closeButton}>
          <Text style={[dynamicStyles.closeButtonText, { color: theme.textSecondary }]}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={[dynamicStyles.content, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={dynamicStyles.loadingContainer}>
            <Text style={[dynamicStyles.loadingText, { color: theme.textSecondary }]}>Analyzing your data...</Text>
          </View>
        ) : (
          <>
            {/* Nutrition Score */}
            {insights && (
              <View style={[dynamicStyles.scoreCard, { 
                backgroundColor: `${accentColor}15`,
                borderLeftColor: accentColor,
              }]}>
                <View style={dynamicStyles.scoreHeader}>
                  <Target size={20} color={accentColor} />
                  <Text style={[dynamicStyles.scoreTitle, { color: theme.textPrimary }]}>Nutrition Score</Text>
                </View>
                <View style={dynamicStyles.scoreDisplay}>
                  <Text style={[dynamicStyles.scoreNumber, { color: accentColor }]}>{insights.nutritionScore ?? 0}</Text>
                  <Text style={[dynamicStyles.scoreOutOf, { color: theme.textSecondary }]}>/100</Text>
                </View>
                <View style={[dynamicStyles.scoreBar, { backgroundColor: `${accentColor}30` }]}>
                  <View
                    style={[
                      dynamicStyles.scoreProgress,
                      { 
                        backgroundColor: accentColor,
                        width: `${Math.min(insights.nutritionScore || 0, 100)}%` 
                      },
                    ]}
                  />
                </View>
              </View>
            )}

            {/* Personal Insights */}
            {insights?.insights?.length ? (
              <View style={[dynamicStyles.insightsCard, { 
                backgroundColor: `${accentColor}15`,
                borderLeftColor: accentColor,
              }]}>
                <View style={dynamicStyles.cardHeader}>
                  <TrendingUp size={20} color={accentColor} />
                  <Text style={[dynamicStyles.cardTitle, { color: theme.textPrimary }]}>Your Patterns</Text>
                </View>
                {insights.insights.map((item, i) => (
                  <Text key={i} style={[dynamicStyles.insightText, { color: theme.textSecondary }]}>
                    • {item}
                  </Text>
                ))}
              </View>
            ) : null}

            {/* AI Suggestions */}
            {insights?.suggestions?.length ? (
              <View style={[dynamicStyles.suggestionsCard, { 
                backgroundColor: `${accentColor}15`,
                borderLeftColor: accentColor,
              }]}>
                <View style={dynamicStyles.cardHeader}>
                  <Lightbulb size={20} color={accentColor} />
                  <Text style={[dynamicStyles.cardTitle, { color: theme.textPrimary }]}>Smart Suggestions</Text>
                </View>
                {insights.suggestions.map((item, i) => (
                  <Text key={i} style={[dynamicStyles.suggestionText, { color: theme.textSecondary }]}>
                    💡 {item}
                  </Text>
                ))}
              </View>
            ) : null}

            {/* Phase Recommendations */}
            {recommendations && (
              <View style={[dynamicStyles.recommendationsCard, { 
                backgroundColor: `${accentColor}15`,
                borderLeftColor: accentColor,
              }]}>
                <View style={dynamicStyles.cardHeader}>
                  <Brain size={20} color={accentColor} />
                  <Text style={[dynamicStyles.cardTitle, { color: theme.textPrimary }]}>
                    {recommendations.phase || cycle.currentPhase.name} Phase Guidance
                  </Text>
                </View>

                {recommendations.macroBalance && (
                  <View style={dynamicStyles.macroBalance}>
                    <Text style={[dynamicStyles.macroTitle, { color: theme.textPrimary }]}>Optimal Macro Balance:</Text>
                    <View style={[dynamicStyles.macroGrid, { backgroundColor: theme.cardBackground }]}>
                      <View style={dynamicStyles.macroItem}>
                        <Text style={[dynamicStyles.macroValue, { color: accentColor }]}>
                          {recommendations.macroBalance.protein ?? 0}%
                        </Text>
                        <Text style={[dynamicStyles.macroLabel, { color: theme.textSecondary }]}>Protein</Text>
                      </View>
                      <View style={dynamicStyles.macroItem}>
                        <Text style={[dynamicStyles.macroValue, { color: accentColor }]}>
                          {recommendations.macroBalance.carbs ?? 0}%
                        </Text>
                        <Text style={[dynamicStyles.macroLabel, { color: theme.textSecondary }]}>Carbs</Text>
                      </View>
                      <View style={dynamicStyles.macroItem}>
                        <Text style={[dynamicStyles.macroValue, { color: accentColor }]}>
                          {recommendations.macroBalance.fat ?? 0}%
                        </Text>
                        <Text style={[dynamicStyles.macroLabel, { color: theme.textSecondary }]}>Fat</Text>
                      </View>
                    </View>
                  </View>
                )}

                {recommendations.recommendations?.length ? (
                  recommendations.recommendations.map((rec, i) => (
                    <Text key={i} style={[dynamicStyles.recommendationText, { color: theme.textSecondary }]}>
                      🎯 {rec}
                    </Text>
                  ))
                ) : (
                  <Text style={[dynamicStyles.recommendationText, { color: theme.textSecondary }]}>
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

// ============================================================================
// DYNAMIC STYLES (Theme-aware)
// ============================================================================

const createStyles = (theme: any, accentColor: string) => StyleSheet.create({
  container: { 
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8 
  },
  title: { 
    fontSize: 20, 
    fontWeight: '700',
  },
  closeButton: { 
    padding: 8 
  },
  closeButtonText: { 
    fontSize: 18,
  },
  content: { 
    flex: 1, 
    padding: 20 
  },
  loadingContainer: { 
    alignItems: 'center', 
    paddingVertical: 40 
  },
  loadingText: { 
    fontSize: 16,
  },

  scoreCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  scoreHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    marginBottom: 12 
  },
  scoreTitle: { 
    fontSize: 16, 
    fontWeight: '600',
  },
  scoreDisplay: { 
    flexDirection: 'row', 
    alignItems: 'baseline', 
    marginBottom: 12 
  },
  scoreNumber: { 
    fontSize: 36, 
    fontWeight: '700',
  },
  scoreOutOf: { 
    fontSize: 16, 
    marginLeft: 4 
  },
  scoreBar: { 
    height: 8, 
    borderRadius: 4 
  },
  scoreProgress: { 
    height: '100%', 
    borderRadius: 4 
  },

  insightsCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  cardHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    marginBottom: 12 
  },
  cardTitle: { 
    fontSize: 16, 
    fontWeight: '600',
  },
  insightText: { 
    fontSize: 14, 
    lineHeight: 20, 
    marginBottom: 8 
  },

  suggestionsCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  suggestionText: { 
    fontSize: 14, 
    lineHeight: 20, 
    marginBottom: 8 
  },

  recommendationsCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  macroBalance: { 
    marginBottom: 16 
  },
  macroTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  macroItem: { 
    alignItems: 'center' 
  },
  macroValue: { 
    fontSize: 16, 
    fontWeight: '700',
  },
  macroLabel: { 
    fontSize: 12, 
    marginTop: 2 
  },
  recommendationText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
});
