import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useWorkout } from '@/contexts/WorkoutContext';
import { workoutTemplates, WorkoutTemplate, WorkoutSet } from '@/data/strongWorkouts';
import { RestTimer } from '@/components/RestTimer';
import { Play, Plus, X, Clock, Zap, Target, TrendingUp, CircleCheck as CheckCircle, Chrome as Home, Dumbbell, Timer, Weight, RotateCcw, Trash2, CreditCard as Edit3, Save, Info } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { exerciseLibrary, exerciseById } from '@/data/exerciseLibrary';
import { useTheme } from '@/src/context/ThemeContext';
import { useCycleStore } from '@/hooks/useCycleStore';

export default function ExerciseScreen() {
  const { cycle } = useCycleStore();
  const { theme, accentColor } = useTheme();
  const { state: workoutState, dispatch } = useWorkout();
  const router = useRouter();
  
  const { width, height } = Dimensions.get('window');
  const dynamicStyles = useMemo(() => createStyles(theme, accentColor, width, height), [theme, accentColor, width, height]);

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showActiveWorkout, setShowActiveWorkout] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [currentRestTime, setCurrentRestTime] = useState(90);
  const [editingSet, setEditingSet] = useState<{ exerciseId: string, setId: string } | null>(null);
  const [editWeight, setEditWeight] = useState('');
  const [editReps, setEditReps] = useState('');
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const todaysWorkouts = workoutState.sessions.filter(session => session.date === today);
  const totalWorkouts = workoutState.sessions.length;
  const totalVolume = workoutState.sessions.reduce((sum, session) => sum + session.totalVolume, 0);

  const startWorkout = (template: WorkoutTemplate) => {
    dispatch({ type: 'START_WORKOUT', payload: template });
    setShowTemplateModal(false);
    setShowActiveWorkout(true);
  };

  const endWorkout = () => {
    Alert.alert(
      'End Workout',
      'Are you sure you want to end this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Workout',
          style: 'destructive',
          onPress: () => {
            dispatch({ type: 'END_WORKOUT' });
            setShowActiveWorkout(false);
            Alert.alert('Success', 'Workout completed and saved!');
          },
        },
      ]
    );
  };

  const completeSet = (exerciseId: string, setId: string) => {
    dispatch({ type: 'COMPLETE_SET', payload: { exerciseId, setId } });

    // Find the exercise and its rest timer
    const exercise = workoutState.currentSession?.exercises.find(ex => ex.id === exerciseId);
    if (exercise) {
      setCurrentRestTime(exercise.restTimer);
      setShowRestTimer(true);
    }
  };

  const updateSet = (exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => {
    dispatch({ type: 'UPDATE_SET', payload: { exerciseId, setId, updates } });
  };

  const addSet = (exerciseId: string) => {
    const exercise = workoutState.currentSession?.exercises.find(ex => ex.id === exerciseId);
    if (exercise && exercise.sets.length > 0) {
      const lastSet = exercise.sets[exercise.sets.length - 1];
      const newSet: WorkoutSet = {
        id: `set-${Date.now()}`,
        weight: lastSet.weight,
        reps: lastSet.reps,
        completed: false,
      };
      dispatch({ type: 'ADD_SET', payload: { exerciseId, set: newSet } });
    }
  };

  const removeSet = (exerciseId: string, setId: string) => {
    dispatch({ type: 'REMOVE_SET', payload: { exerciseId, setId } });
  };

  const startEditingSet = (exerciseId: string, setId: string) => {
    const exercise = workoutState.currentSession?.exercises.find(ex => ex.id === exerciseId);
    const set = exercise?.sets.find(s => s.id === setId);
    if (set) {
      setEditingSet({ exerciseId, setId });
      setEditWeight(set.weight.toString());
      setEditReps(set.reps.toString());
    }
  };

  const saveSetEdit = () => {
    if (editingSet) {
      updateSet(editingSet.exerciseId, editingSet.setId, {
        weight: parseFloat(editWeight) || 0,
        reps: parseInt(editReps) || 0,
      });
      setEditingSet(null);
      setEditWeight('');
      setEditReps('');
    }
  };

  const cancelSetEdit = () => {
    setEditingSet(null);
    setEditWeight('');
    setEditReps('');
  };

  const openExerciseDetails = (exerciseId: string) => {
    setSelectedExerciseId(exerciseId);
    // Ensure library modal doesn't cover the details modal
    setShowLibrary(false);
    setShowExerciseModal(true);
  };

  const groupedByCategory = exerciseLibrary.reduce<Record<string, typeof exerciseLibrary>>((acc, ex) => {
    if (!acc[ex.category]) acc[ex.category] = [] as any;
    (acc[ex.category] as any).push(ex);
    return acc;
  }, {} as any);

  // Helper function to get difficulty badge style
  const getDifficultyBadgeStyle = (difficulty: string) => {
    const difficultyKey = `difficulty${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}` as 'difficultyBeginner' | 'difficultyIntermediate' | 'difficultyAdvanced';
    return dynamicStyles[difficultyKey] || dynamicStyles.difficultyBadge;
  };

  return (
    <ScrollView style={[dynamicStyles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={theme.headerGradient as [string, string]}
        style={dynamicStyles.header}
      >
        <View style={dynamicStyles.headerContent}>
          <View style={dynamicStyles.textContainer}>
            <Text style={[dynamicStyles.title, { color: theme.textPrimary }]}>Fitness Exercise</Text>
            <Text style={[dynamicStyles.subtitle, { color: theme.textSecondary }]}>Track your workouts and progress</Text>
          </View>
          <View style={dynamicStyles.imageContainer}>
            <LinearGradient 
              colors={[`${accentColor}80`, accentColor]} 
              style={{ 
                backgroundColor: `${accentColor}20`, 
                height: 120, 
                width: 120, 
                borderRadius: 100, 
                position: 'absolute', 
                bottom: 12, 
                right: 20, 
              }}
            />
            <Image
              source={require('../../assets/images/ex.png')}
              style={dynamicStyles.headerImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </LinearGradient>

      {/* Workout Stats */}
      <View style={[dynamicStyles.summaryCard, { 
        backgroundColor: theme.cardBackground,
        shadowColor: accentColor,
      }]}>
        <View style={dynamicStyles.summaryHeader}>
          <TrendingUp size={24} color={accentColor} />
          <Text style={[dynamicStyles.summaryTitle, { color: theme.textPrimary }]}>Your Progress</Text>
        </View>

        <View style={dynamicStyles.statsGrid}>
          <View style={dynamicStyles.statItem}>
            <Dumbbell size={20} color={accentColor} />
            <Text style={[dynamicStyles.statNumber, { color: theme.textPrimary }]}>{totalWorkouts}</Text>
            <Text style={[dynamicStyles.statLabel, { color: theme.textSecondary }]}>Total Workouts</Text>
          </View>
          <View style={dynamicStyles.statItem}>
            <Weight size={20} color={accentColor} />
            <Text style={[dynamicStyles.statNumber, { color: theme.textPrimary }]}>{Math.round(totalVolume / 1000)}k</Text>
            <Text style={[dynamicStyles.statLabel, { color: theme.textSecondary }]}>Total Volume</Text>
          </View>
          <View style={dynamicStyles.statItem}>
            <Target size={20} color={accentColor} />
            <Text style={[dynamicStyles.statNumber, { color: theme.textPrimary }]}>{todaysWorkouts.length}</Text>
            <Text style={[dynamicStyles.statLabel, { color: theme.textSecondary }]}>Today</Text>
          </View>
        </View>
      </View>

      {/* Active Workout Button */}
      {workoutState.isWorkoutActive && (
        <View style={dynamicStyles.section}>
          <TouchableOpacity
            style={[dynamicStyles.activeWorkoutButton, { 
              backgroundColor: accentColor,
              shadowColor: accentColor,
            }]}
            onPress={() => setShowActiveWorkout(true)}
          >
            <View style={dynamicStyles.activeWorkoutContent}>
              <View style={dynamicStyles.activeWorkoutInfo}>
                <Text style={dynamicStyles.activeWorkoutTitle}>
                  {workoutState.currentSession?.templateName}
                </Text>
                <Text style={[dynamicStyles.activeWorkoutSubtitle, { color: theme.textSecondary }]}>Workout in progress</Text>
              </View>
              <View style={[dynamicStyles.pulseIndicator, { backgroundColor: '#10b981' }]} />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Start */}
      <View style={dynamicStyles.section}>
        <Text style={[dynamicStyles.sectionTitle, { color: theme.textPrimary }]}>Quick Start</Text>
        <TouchableOpacity
          style={[dynamicStyles.startWorkoutButton, { backgroundColor: accentColor }]}
          onPress={() => setShowTemplateModal(true)}
        >
          <Play size={24} color="#fff" />
          <Text style={dynamicStyles.startWorkoutText}>Start Workout</Text>
        </TouchableOpacity>

        <View style={dynamicStyles.quickRow}>
          <TouchableOpacity 
            style={[dynamicStyles.secondaryButton, { 
              borderColor: theme.border,
              backgroundColor: theme.primarySoft,
            }]} 
            onPress={() => setShowLibrary(true)}
          >
            <Dumbbell size={20} color={accentColor} />
            <Text style={[dynamicStyles.secondaryButtonText, { color: accentColor }]}>Browse Exercises</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Workout Templates */}
      <View style={dynamicStyles.section}>
        <Text style={[dynamicStyles.sectionTitle, { color: theme.textPrimary }]}>Workout Templates</Text>
        {workoutTemplates.map((template) => (
          <TouchableOpacity
            key={template.id}
            style={[dynamicStyles.templateCard, { 
              backgroundColor: theme.cardBackground,
              shadowColor: accentColor,
            }]}
            onPress={() => startWorkout(template)}
          >
            <View style={dynamicStyles.templateHeader}>
              <Text style={[dynamicStyles.templateName, { color: theme.textPrimary }]}>{template.name}</Text>
              <View style={[dynamicStyles.difficultyBadge, getDifficultyBadgeStyle(template.difficulty)]}>
                <Text style={dynamicStyles.difficultyText}>{template.difficulty}</Text>
              </View>
            </View>
            <Text style={[dynamicStyles.templateDescription, { color: theme.textSecondary }]}>{template.description}</Text>
            <View style={dynamicStyles.templateStats}>
              <Text style={[dynamicStyles.templateStat, { color: theme.textSecondary }]}>⏱️ {template.estimatedDuration} min</Text>
              <Text style={[dynamicStyles.templateStat, { color: theme.textSecondary }]}>💪 {template.exercises.length} exercises</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Workouts */}
      {workoutState.sessions.length > 0 && (
        <View style={dynamicStyles.section}>
          <Text style={[dynamicStyles.sectionTitle, { color: theme.textPrimary }]}>Recent Workouts</Text>
          {workoutState.sessions.slice(-5).reverse().map((session) => (
            <View key={session.id} style={[dynamicStyles.sessionCard, { 
              backgroundColor: theme.primarySoft,
              borderLeftColor: '#10b981',
            }]}>
              <View style={dynamicStyles.sessionHeader}>
                <CheckCircle size={20} color="#10b981" />
                <Text style={[dynamicStyles.sessionName, { color: theme.textPrimary }]}>{session.templateName}</Text>
                <Text style={[dynamicStyles.sessionDate, { color: theme.textSecondary }]}>{new Date(session.date).toLocaleDateString()}</Text>
              </View>
              <View style={dynamicStyles.sessionStats}>
                <Text style={[dynamicStyles.sessionStat, { color: '#059669' }]}>{session.duration} min</Text>
                <Text style={[dynamicStyles.sessionStat, { color: '#059669' }]}>{Math.round(session.totalVolume)} lbs total</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Template Selection Modal */}
      <Modal
        visible={showTemplateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTemplateModal(false)}
      >
        <View style={dynamicStyles.modalOverlay}>
          <View style={[dynamicStyles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={[dynamicStyles.modalTitle, { color: theme.textPrimary }]}>Choose Workout</Text>
              <TouchableOpacity onPress={() => setShowTemplateModal(false)}>
                <X size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={dynamicStyles.templateList}>
              {workoutTemplates.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={[dynamicStyles.modalTemplateCard, { backgroundColor: theme.primarySoft }]}
                  onPress={() => startWorkout(template)}
                >
                  <Text style={[dynamicStyles.modalTemplateName, { color: theme.textPrimary }]}>{template.name}</Text>
                  <Text style={[dynamicStyles.modalTemplateDescription, { color: theme.textSecondary }]}>{template.description}</Text>
                  <View style={dynamicStyles.modalTemplateStats}>
                    <Text style={[dynamicStyles.modalTemplateStat, { color: theme.textSecondary }]}>⏱️ {template.estimatedDuration} min</Text>
                    <Text style={[dynamicStyles.modalTemplateStat, { color: theme.textSecondary }]}>💪 {template.exercises.length} exercises</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Active Workout Modal */}
      <Modal
        visible={showActiveWorkout}
        animationType="slide"
        onRequestClose={() => setShowActiveWorkout(false)}
      >
        <View style={[dynamicStyles.workoutContainer, { backgroundColor: theme.background }]}>
          <View style={[dynamicStyles.workoutHeader, { 
            backgroundColor: theme.cardBackground,
            borderBottomColor: theme.border,
          }]}>
            <TouchableOpacity onPress={() => setShowActiveWorkout(false)}>
              <X size={24} color={theme.textSecondary} />
            </TouchableOpacity>
            <Text style={[dynamicStyles.workoutTitle, { color: theme.textPrimary }]}>
              {workoutState.currentSession?.templateName}
            </Text>
            <TouchableOpacity onPress={endWorkout} style={dynamicStyles.endWorkoutButton}>
              <Text style={dynamicStyles.endWorkoutText}>Finish</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={dynamicStyles.workoutContent}>
            {workoutState.currentSession?.exercises.map((exercise, exerciseIndex) => (
              <View key={exercise.id} style={[dynamicStyles.exerciseContainer, { 
                backgroundColor: theme.cardBackground,
                shadowColor: accentColor,
              }]}>
                <View style={dynamicStyles.exerciseHeader}>
                  <TouchableOpacity onPress={() => openExerciseDetails(exercise.exerciseId)} style={{ flex: 1 }}>
                    <Text style={[dynamicStyles.exerciseName, { color: theme.textPrimary }]}>{exercise.exercise.name}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => openExerciseDetails(exercise.exerciseId)} 
                    style={[dynamicStyles.infoButton, { backgroundColor: theme.primarySoft }]}
                  >
                    <Info size={18} color={theme.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => addSet(exercise.id)}
                    style={[dynamicStyles.addSetButton, { backgroundColor: `${accentColor}20` }]}
                  >
                    <Plus size={16} color={accentColor} />
                  </TouchableOpacity>
                </View>

                <View style={dynamicStyles.setsContainer}>
                  <View style={[dynamicStyles.setsHeader, { borderBottomColor: theme.border }]}>
                    <Text style={[dynamicStyles.setHeaderText, { color: theme.textSecondary }]}>Set</Text>
                    <Text style={[dynamicStyles.setHeaderText, { color: theme.textSecondary }]}>Weight</Text>
                    <Text style={[dynamicStyles.setHeaderText, { color: theme.textSecondary }]}>Reps</Text>
                    <Text style={[dynamicStyles.setHeaderText, { color: theme.textSecondary }]}>✓</Text>
                  </View>

                  {exercise.sets.map((set, setIndex) => (
                    <View key={set.id} style={dynamicStyles.setRow}>
                      <Text style={[dynamicStyles.setNumber, { color: theme.textPrimary }]}>{setIndex + 1}</Text>

                      {editingSet?.exerciseId === exercise.id && editingSet?.setId === set.id ? (
                        <>
                          <TextInput
                            style={[dynamicStyles.setInput, { 
                              borderColor: theme.border, 
                              color: theme.textPrimary,
                              backgroundColor: theme.cardBackground,
                            }]}
                            value={editWeight}
                            onChangeText={setEditWeight}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor={theme.textSecondary}
                          />
                          <TextInput
                            style={[dynamicStyles.setInput, { 
                              borderColor: theme.border, 
                              color: theme.textPrimary,
                              backgroundColor: theme.cardBackground,
                            }]}
                            value={editReps}
                            onChangeText={setEditReps}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor={theme.textSecondary}
                          />
                          <View style={dynamicStyles.setEditActions}>
                            <TouchableOpacity onPress={saveSetEdit} style={dynamicStyles.saveButton}>
                              <Save size={16} color="#10b981" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={cancelSetEdit} style={dynamicStyles.cancelButton}>
                              <X size={16} color="#ef4444" />
                            </TouchableOpacity>
                          </View>
                        </>
                      ) : (
                        <>
                          <TouchableOpacity
                            style={dynamicStyles.setValueContainer}
                            onPress={() => startEditingSet(exercise.id, set.id)}
                          >
                            <Text style={[dynamicStyles.setValue, { color: theme.textPrimary }]}>{set.weight}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={dynamicStyles.setValueContainer}
                            onPress={() => startEditingSet(exercise.id, set.id)}
                          >
                            <Text style={[dynamicStyles.setValue, { color: theme.textPrimary }]}>{set.reps}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              dynamicStyles.checkButton,
                              { 
                                backgroundColor: theme.primarySoft,
                                borderColor: theme.border,
                              },
                              set.completed && { backgroundColor: '#10b981', borderColor: '#10b981' }
                            ]}
                            onPress={() => completeSet(exercise.id, set.id)}
                          >
                            {set.completed && <CheckCircle size={20} color="#fff" />}
                          </TouchableOpacity>
                        </>
                      )}

                      {exercise.sets.length > 1 && (
                        <TouchableOpacity
                          onPress={() => removeSet(exercise.id, set.id)}
                          style={dynamicStyles.removeSetButton}
                        >
                          <Trash2 size={14} color="#ef4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>

                <View style={[dynamicStyles.exerciseNotes, { borderTopColor: theme.border }]}>
                  <Text style={[dynamicStyles.restTimerText, { color: theme.textSecondary }]}>
                    Rest: {Math.floor(exercise.restTimer / 60)}:{(exercise.restTimer % 60).toString().padStart(2, '0')}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Rest Timer */}
      <RestTimer
        visible={showRestTimer}
        initialTime={currentRestTime}
        onClose={() => setShowRestTimer(false)}
        onComplete={() => {
          // Timer completed - could add notification here
        }}
      />

      {/* Exercise Details Modal */}
      <Modal
        visible={showExerciseModal}
        animationType="slide"
        onRequestClose={() => setShowExerciseModal(false)}
      >
        <View style={[dynamicStyles.mediaModalContainer, { backgroundColor: theme.background }]}>
          <View style={[dynamicStyles.mediaModalHeader, { 
            backgroundColor: theme.cardBackground,
            borderBottomColor: theme.border,
          }]}>
            <TouchableOpacity onPress={() => setShowExerciseModal(false)}>
              <X size={24} color={theme.textSecondary} />
            </TouchableOpacity>
            <Text style={[dynamicStyles.mediaTitle, { color: theme.textPrimary }]}>
              {selectedExerciseId && exerciseById[selectedExerciseId]?.name}
            </Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView style={dynamicStyles.mediaContent}>
            {selectedExerciseId && exerciseById[selectedExerciseId]?.mediaUrl ? (
              <View style={dynamicStyles.mediaPlayerWrapper}>
                <WebView
                  source={{ uri: exerciseById[selectedExerciseId]!.mediaUrl! }}
                  style={dynamicStyles.mediaPlayer}
                  allowsInlineMediaPlayback
                  mediaPlaybackRequiresUserAction={false}
                />
              </View>
            ) : null}

            <View style={dynamicStyles.mediaSection}>
              <Text style={[dynamicStyles.mediaSectionTitle, { color: theme.textPrimary }]}>How to</Text>
              <Text style={[dynamicStyles.mediaDescription, { color: theme.textSecondary }]}>
                {selectedExerciseId && exerciseById[selectedExerciseId]?.instructions.join('\n')}
              </Text>
            </View>

            <View style={dynamicStyles.mediaSectionRow}>
              <View style={{ flex: 1 }}>
                <Text style={[dynamicStyles.mediaSectionTitle, { color: theme.textPrimary }]}>Primary</Text>
                <Text style={[dynamicStyles.mediaChips, { color: theme.textSecondary }]}>
                  {selectedExerciseId && exerciseById[selectedExerciseId]?.primaryMuscles.join(', ')}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[dynamicStyles.mediaSectionTitle, { color: theme.textPrimary }]}>Secondary</Text>
                <Text style={[dynamicStyles.mediaChips, { color: theme.textSecondary }]}>
                  {selectedExerciseId && exerciseById[selectedExerciseId]?.secondaryMuscles.join(', ')}
                </Text>
              </View>
            </View>

            <View style={dynamicStyles.mediaSection}>
              <Text style={[dynamicStyles.mediaSectionTitle, { color: theme.textPrimary }]}>Coaching Cues</Text>
              {(selectedExerciseId && exerciseById[selectedExerciseId]?.cues 
                ? exerciseById[selectedExerciseId]!.cues.map((cue: string, idx: number) => (
                    <Text key={idx} style={[dynamicStyles.mediaCue, { color: theme.textSecondary }]}>• {cue}</Text>
                  ))
                : null)}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* All Exercises Library */}
      <Modal
        visible={showLibrary}
        animationType="slide"
        onRequestClose={() => setShowLibrary(false)}
      >
        <View style={[dynamicStyles.libraryContainer, { backgroundColor: theme.background }]}>
          <View style={[dynamicStyles.mediaModalHeader, { 
            backgroundColor: theme.cardBackground,
            borderBottomColor: theme.border,
          }]}>
            <TouchableOpacity onPress={() => setShowLibrary(false)}>
              <X size={24} color={theme.textSecondary} />
            </TouchableOpacity>
            <Text style={[dynamicStyles.mediaTitle, { color: theme.textPrimary }]}>Exercise Library</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView>
            {Object.entries(groupedByCategory).map(([category, list]) => (
              <View key={category} style={dynamicStyles.librarySection}>
                <Text style={[dynamicStyles.librarySectionTitle, { color: theme.textPrimary }]}>{category.toUpperCase()}</Text>
                {list.map((ex) => (
                  <TouchableOpacity 
                    key={ex.id} 
                    style={[dynamicStyles.libraryItem, { borderBottomColor: theme.border }]} 
                    onPress={() => openExerciseDetails(ex.id)}
                  >
                    <View style={[dynamicStyles.libraryThumb, { backgroundColor: theme.primarySoft }]}>
                      {/* Lightweight placeholder instead of autoplay video */}
                      <Text style={[dynamicStyles.libraryThumbText, { color: theme.textSecondary }]}>{ex.name.split(' ').map(w => w[0]).join('').slice(0, 3)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[dynamicStyles.libraryItemName, { color: theme.textPrimary }]}>{ex.name}</Text>
                      <Text style={[dynamicStyles.libraryItemSub, { color: theme.textSecondary }]} numberOfLines={1}>
                        {ex.primaryMuscles.join(', ')}
                      </Text>
                    </View>
                    <Info size={18} color={theme.textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>
            ))}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

// ============================================================================
// DYNAMIC STYLES (Theme-aware)
// ============================================================================

const createStyles = (theme: any, accentColor: string, width: number, height: number) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 10,
  },
  title: {
    fontSize: width * 0.07,
    marginBottom: 4,
    fontFamily: 'Bold',
  },
  subtitle: {
    fontSize: width * 0.035,
    fontWeight: '500',
    lineHeight: width * 0.05,
  },
  imageContainer: {
    width: width * 0.45,
    height: height * 0.18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  summaryCard: {
    margin: 20,
    padding: 20,
    borderRadius: 20,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  activeWorkoutButton: {
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  activeWorkoutContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeWorkoutInfo: {
    flex: 1,
  },
  activeWorkoutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  activeWorkoutSubtitle: {
    fontSize: 14,
  },
  pulseIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  startWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  startWorkoutText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  quickRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  templateCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyBeginner: {
    backgroundColor: '#dcfce7',
  },
  difficultyIntermediate: {
    backgroundColor: '#fef3c7',
  },
  difficultyAdvanced: {
    backgroundColor: '#fecaca',
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
  },
  templateDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  templateStats: {
    flexDirection: 'row',
    gap: 16,
  },
  templateStat: {
    fontSize: 12,
  },
  sessionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  sessionDate: {
    fontSize: 12,
  },
  sessionStats: {
    flexDirection: 'row',
    gap: 16,
  },
  sessionStat: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    margin: 20,
    borderRadius: 20,
    padding: 24,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  templateList: {
    maxHeight: 400,
  },
  modalTemplateCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  modalTemplateName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalTemplateDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  modalTemplateStats: {
    flexDirection: 'row',
    gap: 16,
  },
  modalTemplateStat: {
    fontSize: 12,
  },
  workoutContainer: {
    flex: 1,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  endWorkoutButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  endWorkoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  workoutContent: {
    flex: 1,
    padding: 20,
  },
  exerciseContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  infoButton: {
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  addSetButton: {
    padding: 8,
    borderRadius: 8,
  },
  setsContainer: {
    marginBottom: 12,
  },
  setsHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  setHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    minHeight: 48,
  },
  setNumber: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  setValueContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  setValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  setInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 4,
  },
  setEditActions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  saveButton: {
    padding: 4,
  },
  cancelButton: {
    padding: 4,
  },
  checkButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
  },
  removeSetButton: {
    padding: 8,
    marginLeft: 8,
  },
  exerciseNotes: {
    paddingTop: 8,
    borderTopWidth: 1,
  },
  restTimerText: {
    fontSize: 12,
    textAlign: 'center',
  },
  mediaModalContainer: {
    flex: 1,
  },
  mediaModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  mediaTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  mediaContent: {
    flex: 1,
  },
  mediaPlayerWrapper: {
    height: 220,
    backgroundColor: '#000',
  },
  mediaPlayer: {
    flex: 1,
  },
  mediaSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  mediaSectionRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  mediaSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  mediaDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  mediaChips: {
    fontSize: 13,
  },
  mediaCue: {
    fontSize: 14,
    marginBottom: 4,
  },
  libraryContainer: {
    flex: 1,
  },
  librarySection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  librarySectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  libraryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  libraryThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  libraryThumbText: {
    fontSize: 12,
    fontWeight: '800',
  },
  libraryItemName: {
    fontSize: 16,
    fontWeight: '700',
  },
  libraryItemSub: {
    fontSize: 12,
  },
});
