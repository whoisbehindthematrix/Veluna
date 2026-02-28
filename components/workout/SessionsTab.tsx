import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { CircleCheck as CheckCircle } from 'lucide-react-native';

interface SessionsTabProps {
  styles: any;
  theme: any;
  accentColor: string;
  sessions: any[];
  loading: boolean;
}

export default function SessionsTab({ styles, theme, accentColor, sessions, loading }: SessionsTabProps) {
  return (
    <View style={styles.section}>
      {loading ? (
        <ActivityIndicator size="large" color={accentColor} style={styles.loader} />
      ) : sessions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No workout sessions yet</Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            Start a workout to see your sessions here
          </Text>
        </View>
      ) : (
        sessions.map((session: any) => (
          <View
            key={session.id}
            style={[styles.sessionCard, { backgroundColor: theme.cardBackground, borderLeftColor: accentColor }]}
          >
            <View style={styles.sessionHeader}>
              <CheckCircle size={20} color={accentColor} />
              <Text style={[styles.sessionName, { color: theme.textPrimary }]}>
                {session.templateName || 'Custom Workout'}
              </Text>
              <Text style={[styles.sessionDate, { color: theme.textSecondary }]}>
                {new Date(session.date).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.sessionStats}>
              <Text style={[styles.sessionStat, { color: accentColor }]}>
                {session.durationMinutes || 0} min
              </Text>
              <Text style={[styles.sessionStat, { color: accentColor }]}>
                {Math.round(session.totalVolume)} lbs
              </Text>
              <Text style={[styles.sessionStat, { color: accentColor }]}>
                {session.totalSets} sets
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
}
