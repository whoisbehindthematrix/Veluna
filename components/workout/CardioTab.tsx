import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Plus } from 'lucide-react-native';
import NeuButton from '@/components/core-components/NeuButton';
import { darkenColor } from '@/src/utils';

interface CardioTabProps {
  styles: any;
  theme: any;
  accentColor: string;
  entries: any[];
  loading: boolean;
  onAddEntry: () => void;
}

export default function CardioTab({
  styles,
  theme,
  accentColor,
  entries,
  loading,
  onAddEntry,
}: CardioTabProps) {
  return (
    <View style={styles.section}>
      <NeuButton
        title="Log Cardio Activity"
        onPress={onAddEntry}
        backgroundColor={accentColor}
        shadowColor={darkenColor(accentColor, 10)}
        leftIcon={<Plus size={20} color="#fff" />}
        style={styles.primaryButton}
      />

      {loading ? (
        <ActivityIndicator size="large" color={accentColor} style={styles.loader} />
      ) : entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No cardio entries yet</Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            Log your first cardio activity to get started
          </Text>
        </View>
      ) : (
        entries.map((entry: any) => (
          <View
            key={entry.id}
            style={[styles.entryCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
          >
            <Text style={[styles.entryName, { color: theme.textPrimary }]}>{entry.exerciseName}</Text>
            <View style={styles.entryStats}>
              <Text style={[styles.entryStat, { color: theme.textSecondary }]}>
                {entry.durationMinutes || 0} min
              </Text>
              {entry.caloriesBurned && (
                <Text style={[styles.entryStat, { color: theme.textSecondary }]}>
                  🔥 {entry.caloriesBurned} cal
                </Text>
              )}
              {entry.distanceKm  && (
                <Text style={[styles.entryStat, { color: theme.textSecondary }]}>
                  📍 {entry.distanceKm.toFixed(2)} km
                </Text>
              )}
            </View>
            <Text style={[styles.entryDate, { color: theme.textSecondary }]}>
              {new Date(entry.date).toLocaleDateString()}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}
