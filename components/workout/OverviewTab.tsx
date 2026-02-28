import React from 'react';
import { View, Text } from 'react-native';
import { Dumbbell, Weight, Target, CircleCheck as CheckCircle, Play, Calendar } from 'lucide-react-native';
import NeuButton from '@/components/core-components/NeuButton';
import { addOpacityToHex, darkenColor } from '@/src/utils';
import NeuPressable from '../core-components/NeuPressable';

interface OverviewTabProps {
  styles: any;
  theme: any;
  accentColor: string;
  workoutState: any;
  todaysSessions: any[];
  totalWorkouts: number;
  totalVolume: number;
  onStartWorkout: () => void;
  onBrowseExercises: () => void;
}

export default function OverviewTab({
  styles,
  theme,
  accentColor,
  workoutState,
  todaysSessions,
  totalWorkouts,
  totalVolume,
  onStartWorkout,
  onBrowseExercises,
}: OverviewTabProps) {
  return (
    <View style={styles.section}>
      {/* Stats Cards */}
      <NeuPressable
            borderRadius={20}
            backgroundColor="#fff"
            shadowColor={addOpacityToHex(accentColor, 0.1)}
            style={{width: '100%'}}
          >
      <View style={[styles.statsCard, { backgroundColor: theme.cardBackground, borderColor: accentColor }]}>
        <View style={styles.statsGrid}>
      
          <View style={styles.statItem}>
          <View style={{ backgroundColor: accentColor, padding: 10, borderRadius: 45 }}>
            <Dumbbell size={24} color={'white'} />
            </View>
            <Text style={[styles.statNumber, { color: theme.textPrimary }]}>{totalWorkouts}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Workouts</Text>
          </View>

          <View style={{ borderLeftWidth: 2, borderLeftColor: theme.border }}/>

        

          <View style={styles.statItem}>
          <View style={{ backgroundColor: accentColor, padding: 10, borderRadius: 45 }}>
            <Calendar size={24} color={'white'} />
            </View>
            <Text style={[styles.statNumber, { color: theme.textPrimary }]}>
              {todaysSessions.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Today Workouts</Text>
          </View>

          <View style={{ borderLeftWidth: 2, borderLeftColor: theme.border }}/>
          
          <View style={styles.statItem}>
          <View style={{ backgroundColor: accentColor, padding: 10, borderRadius: 45 }}>
            <Weight size={24} color={'white'} />
            </View>

            <Text style={[styles.statNumber, { color: theme.textPrimary }]}>
              {Math.round(totalVolume / 1000)}k
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Volume</Text>
          </View>
          
        </View>
        
      </View>
      </NeuPressable>

      {/* Quick Actions */}
      <View style={styles.section}>
        <NeuButton
          title="Start Workout"
          onPress={onStartWorkout}
          backgroundColor={accentColor}
          shadowColor={darkenColor(accentColor, 10)}
          leftIcon={<Play size={20} color="#fff" />}
          style={styles.primaryButton}
        />
        <View style={styles.quickRow}>
          <NeuButton
            title="Browse Exercises"
            onPress={onBrowseExercises}
            backgroundColor={theme.cardBackground}
            shadowColor={theme.border}
            textColor={accentColor}
            leftIcon={<Dumbbell size={18} color={accentColor} />}
            fullWidth={false}
            style={styles.secondaryButton}
          />
        </View>
      </View>

      {/* Recent Sessions */}
      {workoutState.sessions.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Recent Workouts</Text>
          {workoutState.sessions.slice(0, 5).map((session: any) => (
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
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
