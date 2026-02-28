import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { ChevronRight, Dumbbell, Target } from 'lucide-react-native';

interface ExerciseCardProps {
  exercise: any;
  styles: any;
  theme: any;
  accentColor: string;
  onPress: () => void;
}

export default function ExerciseCard({ exercise, styles, theme, accentColor, onPress }: ExerciseCardProps) {
  return (
    <TouchableOpacity
      key={exercise.id}
      style={[styles.exerciseCard, { backgroundColor: theme.cardBackground, borderColor: accentColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.exerciseCardContent}>
        {/* Exercise Image */}
        <View style={[styles.exerciseImageContainer, { backgroundColor: `${accentColor}20` }]}>
          {exercise.imageUrl ? (
            <Image
              source={{ uri: exercise.imageUrl }}
              style={styles.exerciseImage}
              resizeMode="cover"
              defaultSource={require('../../assets/images/ex.png')}
            />
          ) : (
            <View style={[styles.exerciseImagePlaceholder, { backgroundColor: `${accentColor}30` }]}>
              <Dumbbell size={32} color={accentColor} />
            </View>
          )}
          {/* Category Badge */}
          <View style={[styles.categoryBadge, { backgroundColor: accentColor }]}>
            <Text style={styles.categoryBadgeText}>
              {exercise.category?.charAt(0).toUpperCase() + exercise.category?.slice(1) || 'Exercise'}
            </Text>
          </View>
        </View>

        {/* Exercise Info */}
        <View style={styles.exerciseCardInfo}>
          <Text style={[styles.exerciseCardName, { color: theme.textPrimary }]} numberOfLines={2}>
            {exercise.name}
          </Text>
          {exercise.description && (
            <Text style={[styles.exerciseCardDescription, { color: theme.textSecondary }]} numberOfLines={2}>
              {exercise.description}
            </Text>
          )}
          
          {/* Exercise Meta */}
          <View style={styles.exerciseMeta}>
            {exercise.difficulty && (
              <View style={[styles.difficultyBadge, { backgroundColor: `${accentColor}20` }]}>
                <Text style={[styles.difficultyText, { color: accentColor }]}>
                  {exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
                </Text>
              </View>
            )}
            {exercise.primaryMuscles && exercise.primaryMuscles.length > 0 && (
              <View style={styles.muscleTags}>
                <Target size={12} color={theme.textSecondary} />
                <Text style={[styles.muscleText, { color: theme.textSecondary }]} numberOfLines={1}>
                  {exercise.primaryMuscles.slice(0, 2).join(', ')}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Arrow Icon */}
        <View style={[styles.exerciseArrowContainer, { backgroundColor: `${accentColor}15` }]}>
          <ChevronRight size={20} color={accentColor} />
        </View>
      </View>
    </TouchableOpacity>
  );
}
