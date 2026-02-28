import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface AnalyticsTabProps {
  styles: any;
  theme: any;
  accentColor: string;
  analytics: any;
  loading: boolean;
}

export default function AnalyticsTab({
  styles,
  theme,
  accentColor,
  analytics,
  loading,
}: AnalyticsTabProps) {
  if (loading) {
    return <ActivityIndicator size="large" color={accentColor} style={styles.loader} />;
  }

  if (!analytics) {
    return (
      <View style={styles.section}>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No analytics data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={[styles.analyticsCard, { backgroundColor: theme.cardBackground, borderColor: accentColor }]}>
        <Text style={[styles.analyticsTitle, { color: theme.textPrimary }]}>Strength Training</Text>
        <View style={styles.analyticsGrid}>
          <View style={styles.analyticsItem}>
            <Text style={[styles.analyticsValue, { color: accentColor }]}>
              {analytics.strengthTraining.totalWorkouts}
            </Text>
            <Text style={[styles.analyticsLabel, { color: theme.textSecondary }]}>Workouts</Text>
          </View>
          <View style={styles.analyticsItem}>
            <Text style={[styles.analyticsValue, { color: accentColor }]}>
              {Math.round(analytics.strengthTraining.totalVolume)}
            </Text>
            <Text style={[styles.analyticsLabel, { color: theme.textSecondary }]}>Total Volume</Text>
          </View>
          <View style={styles.analyticsItem}>
            <Text style={[styles.analyticsValue, { color: accentColor }]}>
              {analytics.strengthTraining.workoutsPerWeek.toFixed(1)}
            </Text>
            <Text style={[styles.analyticsLabel, { color: theme.textSecondary }]}>Per Week</Text>
          </View>
        </View>
      </View>

      <View style={[styles.analyticsCard, { backgroundColor: theme.cardBackground, borderColor: accentColor }]}>
        <Text style={[styles.analyticsTitle, { color: theme.textPrimary }]}>Cardio</Text>
        <View style={styles.analyticsGrid}>
          <View style={styles.analyticsItem}>
            <Text style={[styles.analyticsValue, { color: accentColor }]}>
              {analytics.cardio.totalSessions}
            </Text>
            <Text style={[styles.analyticsLabel, { color: theme.textSecondary }]}>Sessions</Text>
          </View>
          <View style={styles.analyticsItem}>
            <Text style={[styles.analyticsValue, { color: accentColor }]}>
              {analytics.cardio.totalCaloriesBurned}
            </Text>
            <Text style={[styles.analyticsLabel, { color: theme.textSecondary }]}>Calories</Text>
          </View>
          <View style={styles.analyticsItem}>
            <Text style={[styles.analyticsValue, { color: accentColor }]}>
              {analytics.cardio.totalDistanceKm.toFixed(1)}
            </Text>
            <Text style={[styles.analyticsLabel, { color: theme.textSecondary }]}>Distance (km)</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
