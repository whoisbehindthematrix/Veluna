import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCycle } from '@/contexts/CycleContext';
import { useWorkout } from '@/contexts/WorkoutContext';
import { workoutTemplates, WorkoutTemplate, WorkoutSet } from '@/data/strongWorkouts';
import { RestTimer } from '@/components/RestTimer';
import { Play, Plus, X, Clock, Zap, Target, TrendingUp, CircleCheck as CheckCircle, Chrome as Home, Dumbbell, Timer, Weight, RotateCcw, Trash2, CreditCard as Edit3, Save, Info } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { exerciseLibrary, exerciseById } from '@/data/exerciseLibrary';

export default function ExerciseScreen() {
  const { state: cycleState } = useCycle();
  const { state: workoutState, dispatch } = useWorkout();
  const router = useRouter();
  
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showActiveWorkout, setShowActiveWorkout] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [currentRestTime, setCurrentRestTime] = useState(90);
  const [editingSet, setEditingSet] = useState<{exerciseId: string, setId: string} | null>(null);
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#f0f9ff', '#f8fafc']}
        style={styles.header}
      >
        <View style={styles.homeIconContainer}>
          <TouchableOpacity onPress={() => router.push('/')}>
            <Home size={20} color="#3b82f6" />
          </TouchableOpacity>
          <Text style={styles.backToHomeText}>Home</Text>
        </View>
        <View style={styles.headerContent}>
        </View>
      </LinearGradient>

      {/* Workout Stats */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <TrendingUp size={24} color="#3b82f6" />
          <Text style={styles.summaryTitle}>Your Progress</Text>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Dumbbell size={20} color="#8b5cf6" />
            <Text style={styles.statNumber}>{totalWorkouts}</Text>
            <Text style={styles.statLabel}>Total Workouts</Text>
          </View>
          <View style={styles.statItem}>
            <Weight size={20} color="#f59e0b" />
            <Text style={styles.statNumber}>{Math.round(totalVolume / 1000)}k</Text>
            <Text style={styles.statLabel}>Total Volume</Text>
          </View>
          <View style={styles.statItem}>
            <Target size={20} color="#10b981" />
            <Text style={styles.statNumber}>{todaysWorkouts.length}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
        </View>
      </View>

      {/* Active Workout Button */}
      {workoutState.isWorkoutActive && (
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.activeWorkoutButton}
            onPress={() => setShowActiveWorkout(true)}
          >
            <View style={styles.activeWorkoutContent}>
              <View style={styles.activeWorkoutInfo}>
                <Text style={styles.activeWorkoutTitle}>
                  {workoutState.currentSession?.templateName}
                </Text>
                <Text style={styles.activeWorkoutSubtitle}>Workout in progress</Text>
              </View>
              <View style={styles.pulseIndicator} />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Start */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Start</Text>
        <TouchableOpacity
          style={styles.startWorkoutButton}
          onPress={() => setShowTemplateModal(true)}
        >
          <Play size={24} color="#fff" />
          <Text style={styles.startWorkoutText}>Start Workout</Text>
        </TouchableOpacity>

        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowLibrary(true)}>
            <Dumbbell size={20} color="#3b82f6" />
            <Text style={styles.secondaryButtonText}>Browse Exercises</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Workout Templates */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Workout Templates</Text>
        {workoutTemplates.map((template) => (
          <TouchableOpacity
            key={template.id}
            style={styles.templateCard}
            onPress={() => startWorkout(template)}
          >
            <View style={styles.templateHeader}>
              <Text style={styles.templateName}>{template.name}</Text>
              <View style={[styles.difficultyBadge, styles[`difficulty${template.difficulty.charAt(0).toUpperCase() + template.difficulty.slice(1)}`]]}>
                <Text style={styles.difficultyText}>{template.difficulty}</Text>
              </View>
            </View>
            <Text style={styles.templateDescription}>{template.description}</Text>
            <View style={styles.templateStats}>
              <Text style={styles.templateStat}>⏱️ {template.estimatedDuration} min</Text>
              <Text style={styles.templateStat}>💪 {template.exercises.length} exercises</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Workouts */}
      {workoutState.sessions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          {workoutState.sessions.slice(-5).reverse().map((session) => (
            <View key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <CheckCircle size={20} color="#10b981" />
                <Text style={styles.sessionName}>{session.templateName}</Text>
                <Text style={styles.sessionDate}>{new Date(session.date).toLocaleDateString()}</Text>
              </View>
              <View style={styles.sessionStats}>
                <Text style={styles.sessionStat}>{session.duration} min</Text>
                <Text style={styles.sessionStat}>{Math.round(session.totalVolume)} lbs total</Text>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Workout</Text>
              <TouchableOpacity onPress={() => setShowTemplateModal(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.templateList}>
              {workoutTemplates.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={styles.modalTemplateCard}
                  onPress={() => startWorkout(template)}
                >
                  <Text style={styles.modalTemplateName}>{template.name}</Text>
                  <Text style={styles.modalTemplateDescription}>{template.description}</Text>
                  <View style={styles.modalTemplateStats}>
                    <Text style={styles.modalTemplateStat}>⏱️ {template.estimatedDuration} min</Text>
                    <Text style={styles.modalTemplateStat}>💪 {template.exercises.length} exercises</Text>
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
        <View style={styles.workoutContainer}>
          <View style={styles.workoutHeader}>
            <TouchableOpacity onPress={() => setShowActiveWorkout(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
            <Text style={styles.workoutTitle}>
              {workoutState.currentSession?.templateName}
            </Text>
            <TouchableOpacity onPress={endWorkout} style={styles.endWorkoutButton}>
              <Text style={styles.endWorkoutText}>Finish</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.workoutContent}>
            {workoutState.currentSession?.exercises.map((exercise, exerciseIndex) => (
              <View key={exercise.id} style={styles.exerciseContainer}>
                <View style={styles.exerciseHeader}>
                  <TouchableOpacity onPress={() => openExerciseDetails(exercise.exerciseId)} style={{ flex: 1 }}>
                    <Text style={styles.exerciseName}>{exercise.exercise.name}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => openExerciseDetails(exercise.exerciseId)} style={styles.infoButton}>
                    <Info size={18} color="#6b7280" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => addSet(exercise.id)}
                    style={styles.addSetButton}
                  >
                    <Plus size={16} color="#3b82f6" />
                  </TouchableOpacity>
                </View>

                <View style={styles.setsContainer}>
                  <View style={styles.setsHeader}>
                    <Text style={styles.setHeaderText}>Set</Text>
                    <Text style={styles.setHeaderText}>Weight</Text>
                    <Text style={styles.setHeaderText}>Reps</Text>
                    <Text style={styles.setHeaderText}>✓</Text>
                  </View>

                  {exercise.sets.map((set, setIndex) => (
                    <View key={set.id} style={styles.setRow}>
                      <Text style={styles.setNumber}>{setIndex + 1}</Text>
                      
                      {editingSet?.exerciseId === exercise.id && editingSet?.setId === set.id ? (
                        <>
                          <TextInput
                            style={styles.setInput}
                            value={editWeight}
                            onChangeText={setEditWeight}
                            keyboardType="numeric"
                            placeholder="0"
                          />
                          <TextInput
                            style={styles.setInput}
                            value={editReps}
                            onChangeText={setEditReps}
                            keyboardType="numeric"
                            placeholder="0"
                          />
                          <View style={styles.setEditActions}>
                            <TouchableOpacity onPress={saveSetEdit} style={styles.saveButton}>
                              <Save size={16} color="#10b981" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={cancelSetEdit} style={styles.cancelButton}>
                              <X size={16} color="#ef4444" />
                            </TouchableOpacity>
                          </View>
                        </>
                      ) : (
                        <>
                          <TouchableOpacity
                            style={styles.setValueContainer}
                            onPress={() => startEditingSet(exercise.id, set.id)}
                          >
                            <Text style={styles.setValue}>{set.weight}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.setValueContainer}
                            onPress={() => startEditingSet(exercise.id, set.id)}
                          >
                            <Text style={styles.setValue}>{set.reps}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.checkButton,
                              set.completed && styles.checkButtonCompleted
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
                          style={styles.removeSetButton}
                        >
                          <Trash2 size={14} color="#ef4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>

                <View style={styles.exerciseNotes}>
                  <Text style={styles.restTimerText}>
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
        <View style={styles.mediaModalContainer}>
          <View style={styles.mediaModalHeader}>
            <TouchableOpacity onPress={() => setShowExerciseModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
            <Text style={styles.mediaTitle}>
              {selectedExerciseId && exerciseById[selectedExerciseId]?.name}
            </Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView style={styles.mediaContent}>
            {selectedExerciseId && exerciseById[selectedExerciseId]?.mediaUrl ? (
              <View style={styles.mediaPlayerWrapper}>
                <WebView
                  source={{ uri: exerciseById[selectedExerciseId]!.mediaUrl! }}
                  style={styles.mediaPlayer}
                  allowsInlineMediaPlayback
                  mediaPlaybackRequiresUserAction={false}
                />
              </View>
            ) : null}

            <View style={styles.mediaSection}>
              <Text style={styles.mediaSectionTitle}>How to</Text>
              <Text style={styles.mediaDescription}>
                {selectedExerciseId && exerciseById[selectedExerciseId]?.instructions.join('\n')}
              </Text>
            </View>

            <View style={styles.mediaSectionRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.mediaSectionTitle}>Primary</Text>
                <Text style={styles.mediaChips}>
                  {selectedExerciseId && exerciseById[selectedExerciseId]?.primaryMuscles.join(', ')}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.mediaSectionTitle}>Secondary</Text>
                <Text style={styles.mediaChips}>
                  {selectedExerciseId && exerciseById[selectedExerciseId]?.secondaryMuscles.join(', ')}
                </Text>
              </View>
            </View>

            <View style={styles.mediaSection}>
              <Text style={styles.mediaSectionTitle}>Coaching Cues</Text>
              {(selectedExerciseId && (exerciseById[selectedExerciseId]?.cues || []))?.map((cue, idx) => (
                <Text key={idx} style={styles.mediaCue}>• {cue}</Text>
              ))}
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
        <View style={styles.libraryContainer}>
          <View style={styles.mediaModalHeader}>
            <TouchableOpacity onPress={() => setShowLibrary(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
            <Text style={styles.mediaTitle}>Exercise Library</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView>
            {Object.entries(groupedByCategory).map(([category, list]) => (
              <View key={category} style={styles.librarySection}>
                <Text style={styles.librarySectionTitle}>{category.toUpperCase()}</Text>
                {list.map((ex) => (
                  <TouchableOpacity key={ex.id} style={styles.libraryItem} onPress={() => openExerciseDetails(ex.id)}>
                    <View style={styles.libraryThumb}>
                      {/* Lightweight placeholder instead of autoplay video */}
                      <Text style={styles.libraryThumbText}>{ex.name.split(' ').map(w => w[0]).join('').slice(0,3)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.libraryItemName}>{ex.name}</Text>
                      <Text style={styles.libraryItemSub} numberOfLines={1}>
                        {ex.primaryMuscles.join(', ')}
                      </Text>
                    </View>
                    <Info size={18} color="#6b7280" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefefe',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  homeIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    marginBottom: 16,
  },
  headerContent: {
    flex: 1,
  },
  backToHomeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  infoButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  summaryCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
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
    color: '#1f2937',
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
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  activeWorkoutButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#3b82f6',
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
    color: '#bfdbfe',
  },
  pulseIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
  },
  startWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
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
    borderColor: '#dbeafe',
    backgroundColor: '#eff6ff',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3b82f6',
  },
  templateCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
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
    color: '#1f2937',
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
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  templateStats: {
    flexDirection: 'row',
    gap: 16,
  },
  templateStat: {
    fontSize: 12,
    color: '#4b5563',
  },
  sessionCard: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
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
    color: '#1f2937',
    flex: 1,
  },
  sessionDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  sessionStats: {
    flexDirection: 'row',
    gap: 16,
  },
  sessionStat: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
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
    color: '#1f2937',
  },
  templateList: {
    maxHeight: 400,
  },
  modalTemplateCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    marginBottom: 12,
  },
  modalTemplateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  modalTemplateDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  modalTemplateStats: {
    flexDirection: 'row',
    gap: 16,
  },
  modalTemplateStat: {
    fontSize: 12,
    color: '#4b5563',
  },
  workoutContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
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
    color: '#1f2937',
    flex: 1,
  },
  addSetButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f9ff',
  },
  setsContainer: {
    marginBottom: 12,
  },
  setsHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 8,
  },
  setHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
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
    color: '#4b5563',
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
    color: '#1f2937',
  },
  setInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
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
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#d1d5db',
  },
  checkButtonCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  removeSetButton: {
    padding: 8,
    marginLeft: 8,
  },
  exerciseNotes: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  restTimerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  mediaModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mediaModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  mediaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
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
    color: '#374151',
    marginBottom: 6,
  },
  mediaDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  mediaChips: {
    fontSize: 13,
    color: '#6b7280',
  },
  mediaCue: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  libraryContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  librarySection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  librarySectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  libraryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  libraryThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  libraryThumbText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6b7280',
  },
  libraryItemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  libraryItemSub: {
    fontSize: 12,
    color: '#6b7280',
  },
});