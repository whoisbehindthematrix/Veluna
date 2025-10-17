import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCycle } from '@/contexts/CycleContext';
import { useWorkout } from '@/contexts/WorkoutContext';
import { workoutTemplates, WorkoutTemplate, WorkoutSet } from '@/data/strongWorkouts';
import { RestTimer } from '@/components/RestTimer';
import { Play, Plus, X, Clock, Zap, Target, TrendingUp, CircleCheck as CheckCircle, Chrome as Home, Dumbbell, Timer, Weight, RotateCcw, Trash2, CreditCard as Edit3, Save, Info } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { exerciseLibrary, exerciseById } from '@/data/exerciseLibrary';
import { styles } from '@/styles/screens/ExerciseScreen.styles';

export default function ExerciseScreen() {
  const { state: cycleState } = useCycle();
  const { state: workoutState, dispatch } = useWorkout();
  const router = useRouter();

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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#3b82f6', '#f8fafc']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Fitness Exercise</Text>
            <Text style={styles.subtitle}>Track your workouts and progress</Text>
          </View>
          <View style={styles.imageContainer}>
            <LinearGradient colors={['#7fa8e9ff', '#3b82f6']} style={{ backgroundColor: '#fef3c7', height: 120, width: 120, borderRadius: 100, position: 'absolute', bottom: 12, right: 20, }}></LinearGradient>
            <Image
              source={require('../../assets/images/ex.png')}
              style={styles.headerImage}
              resizeMode="contain"
            />

          </View>
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
                      <Text style={styles.libraryThumbText}>{ex.name.split(' ').map(w => w[0]).join('').slice(0, 3)}</Text>
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
