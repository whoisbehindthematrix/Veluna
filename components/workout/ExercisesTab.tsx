import React from 'react';
import { View, Text, ScrollView, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Search, Dumbbell } from 'lucide-react-native';
import ExerciseCard from './ExerciseCard';

interface ExercisesTabProps {
  styles: any;
  theme: any;
  accentColor: string;
  exercises: any[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  onExercisePress: (exercise: any) => void;
}

export default function ExercisesTab({
  styles,
  theme,
  accentColor,
  exercises,
  loading,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onExercisePress,
}: ExercisesTabProps) {
  const categories = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio', 'yoga'];

  return (
    <View style={styles.section}>
      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <Search size={20} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.textPrimary }]}
          placeholder="Search exercises..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryChip,
              {
                backgroundColor: selectedCategory === cat ? accentColor : theme.cardBackground,
                borderColor: selectedCategory === cat ? accentColor : theme.border,
              },
            ]}
            onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
          >
            <Text
              style={[
                styles.categoryChipText,
                { color: selectedCategory === cat ? '#fff' : theme.textPrimary },
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Exercises List */}
      {loading ? (
        <ActivityIndicator size="large" color={accentColor} style={styles.loader} />
      ) : exercises.length === 0 ? (
        <View style={styles.emptyExercisesContainer}>
          <Dumbbell size={48} color={theme.textSecondary} />
          <Text style={[styles.emptyExercisesText, { color: theme.textSecondary }]}>
            No exercises found
          </Text>
          <Text style={[styles.emptyExercisesSubtext, { color: theme.textSecondary }]}>
            Try adjusting your search or filters
          </Text>
        </View>
      ) : (
        exercises.map((exercise: any) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            styles={styles}
            theme={theme}
            accentColor={accentColor}
            onPress={() => onExercisePress(exercise)}
          />
        ))
      )}
    </View>
  );
}
