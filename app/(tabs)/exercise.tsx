import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/src/store';
import {
  fetchExercises,
  fetchTemplates,
  fetchSessions,
  fetchExerciseEntries,
  fetchAnalytics,
  startWorkout,
  updateCurrentSession,
  endWorkout,
  createSession,
  createExerciseEntry,
  fetchRecommendedExercises,
  setSelectedExercise,
  setSelectedTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from '@/src/store/slices/workoutSlice';
import { RestTimer } from '@/components/RestTimer';
import {
  Play,
  Plus,
  X,
  Clock,
  Zap,
  Target,
  TrendingUp,
  CircleCheck as CheckCircle,
  Dumbbell,
  Timer,
  Weight,
  Trash2,
  Save,
  Info,
  Activity,
  Calendar,
  BarChart3,
  Search,
  Filter,
  Flame,
  Award,
  ChevronRight,
  Home,
  Edit,
  Edit2,
} from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { useCycleStore } from '@/hooks/useCycleStore';
import NeuButton from '@/components/core-components/NeuButton';
import { darkenColor } from '@/src/utils';
import {
  OverviewTab,
  ExercisesTab,
  TemplatesTab,
  SessionsTab,
  CardioTab,
  AnalyticsTab,
  ExerciseDetailsModal,
} from '@/components/workout';
import TemplateSelectionModal from '@/components/workout/TemplateSelectionModal';
import TemplateEditorModal from '@/components/workout/TemplateEditorModal';

type TabType = 'overview' | 'exercises' | 'templates' | 'sessions' | 'cardio' | 'analytics';

export default function ExerciseScreen() {
  const { cycle } = useCycleStore();
  const { theme, accentColor } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const workoutState = useSelector((state: RootState) => state.workout);

  const { width, height } = Dimensions.get('window');
  const dynamicStyles = useMemo(() => createStyles(theme, accentColor, width), [theme, accentColor, width]);

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [currentRestTime, setCurrentRestTime] = useState(90);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showActiveWorkout, setShowActiveWorkout] = useState(false);
  const [showCardioModal, setShowCardioModal] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load recommended exercises based on cycle phase
  useEffect(() => {
    if (cycle?.currentPhase?.name) {
      dispatch(fetchRecommendedExercises({ phase: cycle.currentPhase.name }));
    }
  }, [cycle?.currentPhase?.name]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        dispatch(fetchExercises({ limit: 50 })),
        dispatch(fetchTemplates({ includeSystem: true })),
        dispatch(fetchSessions({ limit: 20 })),
        dispatch(fetchExerciseEntries({ limit: 20 })),
        dispatch(fetchAnalytics({})),
      ]);
    } catch (error) {
      console.error('Error loading workout data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleStartWorkout = (template: any) => {
    dispatch(startWorkout(template));
    setShowTemplateModal(false);
    setShowActiveWorkout(true);
  };

  const handleEndWorkout = async () => {
    if (!workoutState.currentSession) return;

    Alert.alert(
      'End Workout',
      'Are you sure you want to end this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Workout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Calculate totals
              let totalVolume = 0;
              let totalSets = 0;
              let totalReps = 0;

              workoutState.currentSession?.exercises.forEach((exercise) => {
                exercise.sets.forEach((set) => {
                  if (set.completed && set.weight && set.reps) {
                    totalVolume += set.weight * set.reps;
                    totalSets += 1;
                    totalReps += set.reps;
                  }
                });
              });

              const startTime = workoutState.currentSession?.startTime
                ? new Date(workoutState.currentSession.startTime)
                : new Date();
              const durationMinutes = Math.floor((new Date().getTime() - startTime.getTime()) / 60000);

              await dispatch(
                createSession({
                  ...workoutState.currentSession,
                  endTime: new Date().toISOString(),
                  durationMinutes,
                  totalVolume,
                  totalSets,
                  totalReps,
                  completed: true,
                })
              ).unwrap();

              dispatch(endWorkout());
              setShowActiveWorkout(false);
              Alert.alert('Success', 'Workout completed and saved!');
              await loadInitialData();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to save workout');
            }
          },
        },
      ]
    );
  };

  const today = new Date().toISOString().split('T')[0];
  const todaysSessions = workoutState.sessions.filter((s) => s.date === today);
  const totalWorkouts = workoutState.sessions.length;
  const totalVolume = workoutState.sessions.reduce((sum, s) => sum + s.totalVolume, 0);

  const filteredExercises = workoutState.exercises.filter((ex) => {
    const matchesSearch = !searchQuery || ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || ex.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={[dynamicStyles.container, { backgroundColor: `${theme.mode === 'light' ? darkenColor(theme.background, 1) : theme.background}` }]}>
      {/* Header */}
      <LinearGradient colors={theme.headerGradient as [string, string]} style={dynamicStyles.header}>
        <View style={dynamicStyles.headerContent}>
          <View style={dynamicStyles.textContainer}>
            <Text style={[dynamicStyles.title, { color: theme.textPrimary }]}>Workout</Text>
            <Text style={[dynamicStyles.subtitle, { color: theme.textSecondary }]}>
              Track your fitness journey
            </Text>
          </View>
          <View style={dynamicStyles.headerImageContainer}>
          <LinearGradient
              colors={[`${accentColor}80`, accentColor]}
              style={{
                height: 120,
                width: 120,
                borderRadius: 100,
                position: 'absolute',
                bottom: 4,
                right: 0,
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

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[dynamicStyles.tabsContainer, { borderBottomColor: accentColor }]}
        contentContainerStyle={dynamicStyles.tabsContent}
      >
        {[
          { id: 'overview', label: 'Overview', icon: Home },
          { id: 'exercises', label: 'Exercises', icon: Dumbbell },
          { id: 'templates', label: 'Templates', icon: Target },
          { id: 'sessions', label: 'Sessions', icon: Calendar },
          { id: 'cardio', label: 'Cardio', icon: Activity },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                dynamicStyles.tab,
                {
                  backgroundColor: isActive ? accentColor : theme.cardBackground,
                  borderColor: isActive ? accentColor : theme.border,
                },
              ]}
              onPress={() => setActiveTab(tab.id as TabType)}
            >
              <Icon size={18} color={isActive ? '#fff' : theme.textSecondary} />
              <Text
                style={[
                  dynamicStyles.tabText,
                  { color: isActive ? '#fff' : theme.textSecondary },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Content */}
      <ScrollView
        style={dynamicStyles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'overview' && (
          <OverviewTab
            styles={dynamicStyles}
            theme={theme}
            accentColor={accentColor}
            workoutState={workoutState}
            todaysSessions={todaysSessions}
            totalWorkouts={totalWorkouts}
            totalVolume={totalVolume}
            onStartWorkout={() => setShowTemplateModal(true)}
            onBrowseExercises={() => setActiveTab('exercises')}
          />
        )}

        {activeTab === 'exercises' && (
          <ExercisesTab
            styles={dynamicStyles}
            theme={theme}
            accentColor={accentColor}
            exercises={filteredExercises}
            loading={workoutState.loadingExercises}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onExercisePress={(exercise) => {
              dispatch(setSelectedExercise(exercise));
              setShowExerciseModal(true);
            }}
          />
        )}

        {activeTab === 'templates' && (
          <TemplatesTab
            styles={dynamicStyles}
            theme={theme}
            accentColor={accentColor}
            templates={workoutState.templates}
            loading={workoutState.loadingTemplates}
            onTemplatePress={(template) => {
              dispatch(setSelectedTemplate(template));
              handleStartWorkout(template);
            }}
            onCreateTemplate={() => {
              setEditingTemplate(null);
              setShowTemplateEditor(true);
            }}
            onEditTemplate={(template) => {
              setEditingTemplate(template);
              setShowTemplateEditor(true);
            }}
            onDeleteTemplate={async (templateId) => {
              Alert.alert(
                'Delete Template',
                'Are you sure you want to delete this template?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await dispatch(deleteTemplate(templateId)).unwrap();
                        Alert.alert('Success', 'Template deleted successfully');
                        await dispatch(fetchTemplates({ includeSystem: true }));
                      } catch (error: any) {
                        Alert.alert('Error', error.message || 'Failed to delete template');
                      }
                    },
                  },
                ]
              );
            }}
          />
        )}

        {activeTab === 'sessions' && (
          <SessionsTab
            styles={dynamicStyles}
            theme={theme}
            accentColor={accentColor}
            sessions={workoutState.sessions}
            loading={workoutState.loadingSessions}
          />
        )}

        {activeTab === 'cardio' && (
          <CardioTab
            styles={dynamicStyles}
            theme={theme}
            accentColor={accentColor}
            entries={workoutState.exerciseEntries}
            loading={workoutState.loadingEntries}
            onAddEntry={() => setShowCardioModal(true)}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab
            styles={dynamicStyles}
            theme={theme}
            accentColor={accentColor}
            analytics={workoutState.analytics}
            loading={workoutState.loadingAnalytics}
          />
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Active Workout Button */}
      {workoutState.isWorkoutActive && (
        <TouchableOpacity
          style={[dynamicStyles.activeWorkoutButton, { backgroundColor: accentColor }]}
          onPress={() => setShowActiveWorkout(true)}
        >
          <View style={dynamicStyles.activeWorkoutContent}>
            <View style={dynamicStyles.activeWorkoutInfo}>
              <Text style={dynamicStyles.activeWorkoutTitle}>
                {workoutState.currentSession?.templateName || 'Active Workout'}
              </Text>
              <Text style={dynamicStyles.activeWorkoutSubtitle}>Tap to continue</Text>
            </View>
            <View style={[dynamicStyles.pulseIndicator, { backgroundColor: '#10b981' }]} />
          </View>
        </TouchableOpacity>
      )}

      {/* Active Workout Modal */}
      {showActiveWorkout && workoutState.currentSession && (
        <ActiveWorkoutModal
          styles={dynamicStyles}
          theme={theme}
          accentColor={accentColor}
          session={workoutState.currentSession}
          onClose={() => setShowActiveWorkout(false)}
          onEndWorkout={handleEndWorkout}
          onUpdateSession={(updates) => dispatch(updateCurrentSession(updates))}
          onShowRestTimer={(time) => {
            setCurrentRestTime(time);
            setShowRestTimer(true);
          }}
        />
      )}

      {/* Exercise Details Modal */}
      <ExerciseDetailsModal
        visible={showExerciseModal}
        exercise={workoutState.selectedExercise}
        theme={theme}
        accentColor={accentColor}
        onClose={() => {
          setShowExerciseModal(false);
          dispatch(setSelectedExercise(null));
        }}
      />

      {/* Template Selection Modal */}
      <TemplateSelectionModal
        visible={showTemplateModal}
        styles={dynamicStyles}
        theme={theme}
        accentColor={accentColor}
        templates={workoutState.templates}
        loading={workoutState.loadingTemplates}
        onSelect={(template) => handleStartWorkout(template)}
        onClose={() => setShowTemplateModal(false)}
        onCreateTemplate={() => {
          setEditingTemplate(null);
          setShowTemplateEditor(true);
        }}
      />

      {/* Cardio Entry Modal */}
      {showCardioModal && (
        <CardioEntryModal
          styles={dynamicStyles}
          theme={theme}
          accentColor={accentColor}
          exercises={workoutState.exercises.filter((e) => ['cardio', 'yoga', 'pilates'].includes(e.category))}
          onClose={() => setShowCardioModal(false)}
          onCreateEntry={async (entryData) => {
            try {
              await dispatch(createExerciseEntry(entryData)).unwrap();
              setShowCardioModal(false);
              Alert.alert('Success', 'Cardio activity logged!');
              await dispatch(fetchExerciseEntries({ limit: 20 }));
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to log activity');
            }
          }}
        />
      )}

      {/* Template Editor Modal */}
      <TemplateEditorModal
        visible={showTemplateEditor}
        styles={dynamicStyles}
        theme={theme}
        accentColor={accentColor}
        template={editingTemplate}
        exercises={workoutState.exercises}
        onClose={() => {
          setShowTemplateEditor(false);
          setEditingTemplate(null);
        }}
        onSave={async (templateData) => {
          try {
            if (editingTemplate) {
              await dispatch(updateTemplate({ id: editingTemplate.id, data: templateData })).unwrap();
              Alert.alert('Success', 'Template updated successfully!');
            } else {
              await dispatch(createTemplate(templateData)).unwrap();
              Alert.alert('Success', 'Template created successfully!');
            }
            setShowTemplateEditor(false);
            setEditingTemplate(null);
            await dispatch(fetchTemplates({ includeSystem: true }));
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to save template');
          }
        }}
      />

      {/* Rest Timer */}
      <RestTimer
        visible={showRestTimer}
        initialTime={currentRestTime}
        onClose={() => setShowRestTimer(false)}
        onComplete={() => {}}
      />
    </View>
  );
}

// Tab components are now imported from @/components/workout

// Active Workout Modal Component
function ActiveWorkoutModal({ styles, theme, accentColor, session, onClose, onEndWorkout, onUpdateSession, onShowRestTimer }: any) {
  const [editingSet, setEditingSet] = useState<{ exerciseId: string; setId: string } | null>(null);
  const [editWeight, setEditWeight] = useState('');
  const [editReps, setEditReps] = useState('');

  const startEditingSet = (exerciseId: string, setId: string) => {
    const exercise = session.exercises.find((ex: any) => ex.id === exerciseId);
    const set = exercise?.sets.find((s: any) => s.id === setId);
    if (set) {
      setEditingSet({ exerciseId, setId });
      setEditWeight(set.weight.toString());
      setEditReps(set.reps.toString());
    }
  };

  const saveSetEdit = () => {
    if (editingSet) {
      const exercise = session.exercises.find((ex: any) => ex.id === editingSet.exerciseId);
      const updatedSets = exercise.sets.map((s: any) =>
        s.id === editingSet.setId
          ? { ...s, weight: parseFloat(editWeight) || 0, reps: parseInt(editReps) || 0 }
          : s
      );
      const updatedExercises = session.exercises.map((ex: any) =>
        ex.id === editingSet.exerciseId ? { ...ex, sets: updatedSets } : ex
      );
      onUpdateSession({ exercises: updatedExercises });
      setEditingSet(null);
    }
  };

  const toggleSetComplete = (exerciseId: string, setId: string) => {
    const exercise = session.exercises.find((ex: any) => ex.id === exerciseId);
    const updatedSets = exercise.sets.map((s: any) =>
      s.id === setId ? { ...s, completed: !s.completed } : s
    );
    const updatedExercises = session.exercises.map((ex: any) =>
      ex.id === exerciseId ? { ...ex, sets: updatedSets } : ex
    );
    onUpdateSession({ exercises: updatedExercises });

    // Show rest timer if set completed
    if (!exercise.sets.find((s: any) => s.id === setId)?.completed) {
      onShowRestTimer(exercise.restTimer || 90);
    }
  };

  return (
    <Modal visible={true} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.workoutContainer, { backgroundColor: theme.background }]}>
        <View style={[styles.workoutHeader, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={theme.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.workoutTitle, { color: theme.textPrimary }]}>
            {session.templateName || 'Active Workout'}
          </Text>
          <TouchableOpacity onPress={onEndWorkout} style={[styles.endWorkoutButton, { backgroundColor: '#ef4444' }]}>
            <Text style={styles.endWorkoutText}>Finish</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.workoutContent}>
          {session.exercises.map((exercise: any, exerciseIndex: number) => {
            const exerciseKey = exercise.id || `exercise-${exerciseIndex}`;
            const safeSets = Array.isArray(exercise.sets) ? exercise.sets : [];
            
            return (
              <View
                key={exerciseKey}
                style={[styles.exerciseContainer, { backgroundColor: theme.cardBackground, borderColor: accentColor }]}
              >
                <Text style={[styles.exerciseName, { color: theme.textPrimary }]}>
                  {exercise.exerciseName || exercise.exercise?.name || 'Unknown Exercise'}
                </Text>

                <View style={[styles.setsHeader, { borderBottomColor: theme.border }]}>
                  <Text style={[styles.setHeaderText, { color: theme.textSecondary }]}>Set</Text>
                  <Text style={[styles.setHeaderText, { color: theme.textSecondary }]}>Weight</Text>
                  <Text style={[styles.setHeaderText, { color: theme.textSecondary }]}>Reps</Text>
                  <Text style={[styles.setHeaderText, { color: theme.textSecondary }]}>✓</Text>
                </View>

                {safeSets.length === 0 ? (
                  <View style={styles.emptySetsContainer}>
                    <Text style={[styles.emptySetsText, { color: theme.textSecondary }]}>
                      No sets configured
                    </Text>
                  </View>
                ) : (
                  safeSets.map((set: any, index: number) => {
                    const setKey = set.id || `set-${exerciseKey}-${index}`;
                    return (
                      <View key={setKey} style={styles.setRow}>
                        <Text style={[styles.setNumber, { color: theme.textPrimary }]}>{index + 1}</Text>

                        {editingSet?.exerciseId === exercise.id && editingSet?.setId === set.id ? (
                          <>
                            <TextInput
                              style={[styles.setInput, { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.background }]}
                              value={editWeight}
                              onChangeText={setEditWeight}
                              keyboardType="numeric"
                            />
                            <TextInput
                              style={[styles.setInput, { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.background }]}
                              value={editReps}
                              onChangeText={setEditReps}
                              keyboardType="numeric"
                            />
                            <View style={styles.setEditActions}>
                              <TouchableOpacity onPress={saveSetEdit}>
                                <Save size={16} color="#10b981" />
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => setEditingSet(null)}>
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
                              <Text style={[styles.setValue, { color: theme.textPrimary }]}>{set.weight || 0}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.setValueContainer}
                              onPress={() => startEditingSet(exercise.id, set.id)}
                            >
                              <Text style={[styles.setValue, { color: theme.textPrimary }]}>{set.reps || 0}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.checkButton,
                                {
                                  backgroundColor: set.completed ? accentColor : theme.cardBackground,
                                  borderColor: set.completed ? accentColor : theme.border,
                                },
                              ]}
                              onPress={() => toggleSetComplete(exercise.id, set.id)}
                            >
                              {set.completed && <CheckCircle size={20} color="#fff" />}
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    );
                  })
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

// Helper function to ensure sets are always arrays
const ensureSetsArray = (exercises: any[]): any[] => {
  return exercises.map((ex: any) => ({
    ...ex,
    sets: Array.isArray(ex.sets) && ex.sets.length > 0 ? ex.sets : [],
  }));
};


// Cardio Entry Modal Component
function CardioEntryModal({ styles, theme, accentColor, exercises, onClose, onCreateEntry }: any) {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!selectedExerciseId) {
      Alert.alert('Error', 'Please select an exercise');
      return;
    }

    onCreateEntry({
      exerciseId: selectedExerciseId,
      date: new Date().toISOString().split('T')[0],
      durationMinutes: durationMinutes ? parseInt(durationMinutes) : null,
      caloriesBurned: caloriesBurned ? parseInt(caloriesBurned) : null,
      distanceKm: distanceKm ? parseFloat(distanceKm) : null,
      notes: notes || null,
    });
  };

  return (
    <Modal visible={true} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Log Cardio Activity</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }}>
            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, { color: theme.textPrimary }]}>Exercise</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.exerciseSelector}>
                {exercises && exercises.length > 0 ? (
                  exercises.map((exercise: any) => (
                    <TouchableOpacity
                      key={exercise.id}
                      style={[
                        styles.exerciseOption,
                        {
                          backgroundColor: selectedExerciseId === exercise.id ? accentColor : theme.background,
                          borderColor: selectedExerciseId === exercise.id ? accentColor : theme.border,
                        },
                      ]}
                      onPress={() => setSelectedExerciseId(exercise.id)}
                    >
                      <Text
                        style={[
                          styles.exerciseOptionText,
                          { color: selectedExerciseId === exercise.id ? '#fff' : theme.textPrimary },
                        ]}
                      >
                        {exercise.name}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No exercises available</Text>
                )}
              </ScrollView>
            </View>

            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, { color: theme.textPrimary }]}>Duration (minutes)</Text>
              <TextInput
                style={[styles.modalInput, { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.background }]}
                value={durationMinutes}
                onChangeText={setDurationMinutes}
                keyboardType="numeric"
                placeholder="30"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, { color: theme.textPrimary }]}>Calories Burned</Text>
              <TextInput
                style={[styles.modalInput, { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.background }]}
                value={caloriesBurned}
                onChangeText={setCaloriesBurned}
                keyboardType="numeric"
                placeholder="Optional"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, { color: theme.textPrimary }]}>Distance (km)</Text>
              <TextInput
                style={[styles.modalInput, { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.background }]}
                value={distanceKm}
                onChangeText={setDistanceKm}
                keyboardType="numeric"
                placeholder="Optional"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, { color: theme.textPrimary }]}>Notes</Text>
              <TextInput
                style={[styles.modalTextArea, { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.background }]}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                placeholder="Optional notes..."
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: accentColor, borderColor: accentColor }]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Log Activity</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// Template Editor Modal is now imported from @/components/workout
// Template Selection Modal is now imported from @/components/workout

// Styles
const createStyles = (theme: any, accentColor: string, width: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingTop: 60,
      paddingHorizontal: 24,
      paddingBottom: 30,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontSize: width * 0.07,
      fontFamily: 'Bold',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: width * 0.035,
      fontWeight: '500',
    },
    headerImageContainer: {
      width: width * 0.3,
      height: width * 0.3,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerImage: {
      width: '100%',
      height: '100%',
    },
    tabsContainer: {
      maxHeight: 60,
      borderBottomWidth: 2,
     
    },
    tabsContent: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 8,
    },
    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
      borderWidth: 2,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '700',
    },
    content: {
      flex: 1,
    },
    section: {
      padding: 20,
    },
    statsCard: {
      padding: 20,
      borderRadius: 16,
      width: '100%',
     
    },
    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      // marginHorizontal: 10,
    },
    statItem: {
      alignItems: 'center',
    
    },
    statNumber: {
      fontSize: 24,
      fontWeight: '700',
      marginTop: 8,
    },
    statLabel: {
      fontSize: 12,
      marginTop: 4,
      maxWidth: 60,
      textAlign: 'center',
    },
    primaryButton: {
      marginBottom: 18,
    },
    secondaryButton: {
      flex: 1,
    },
    quickRow: {
      flexDirection: 'row',
      gap: 12,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: '700',
      marginBottom: 16,
    },
    sessionCard: {
      padding: 16,
      borderRadius: 12,
      borderLeftWidth: 4,
      marginBottom: 12,
    },
    sessionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
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
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      borderRadius: 12,
      borderWidth: 2,
      marginBottom: 16,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
    },
    categoryContainer: {
      marginBottom: 16,
    },
    categoryChip: {
      paddingHorizontal: 16,
      paddingVertical: 4,
      borderRadius: 20,
      borderWidth: 2,
      marginRight: 8,
    },
    categoryChipText: {
      fontSize: 12,
      fontFamily: 'Bold',
      textTransform: 'uppercase',
    },
    exerciseCard: {
      borderRadius: 20,
      borderWidth: 2,
      marginBottom: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    exerciseCardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      gap: 16,
    },
    exerciseImageContainer: {
      width: 100,
      height: 100,
      borderRadius: 16,
      overflow: 'hidden',
      position: 'relative',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    exerciseImage: {
      width: '100%',
      height: '100%',
    },
    exerciseImagePlaceholder: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    categoryBadge: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingVertical: 4,
      paddingHorizontal: 8,
      alignItems: 'center',
    },
    categoryBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#fff',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    exerciseCardInfo: {
      flex: 1,
      justifyContent: 'space-between',
      gap: 8,
    },
    exerciseCardName: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 4,
      lineHeight: 24,
    },
    exerciseCardDescription: {
      fontSize: 13,
      lineHeight: 18,
      marginBottom: 8,
    },
    exerciseMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },
    difficultyBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    difficultyText: {
      fontSize: 11,
      fontWeight: '600',
    },
    muscleTags: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      flex: 1,
    },
    muscleText: {
      fontSize: 11,
      fontWeight: '500',
    },
    exerciseArrowContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyExercisesContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    emptyExercisesText: {
      fontSize: 18,
      fontWeight: '700',
      marginTop: 16,
      marginBottom: 8,
    },
    emptyExercisesSubtext: {
      fontSize: 14,
      textAlign: 'center',
    },
    templatesGrid: {
      flexDirection: 'column',
      gap: 16,
    },
    templateCard: {
      width: '100%',
      borderRadius: 20,
      borderWidth: 2,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    templateCardMainContent: {
      flexDirection: 'row',
      padding: 20,
      gap: 16,
    },
    templateName: {
      fontSize: 18,
      fontFamily: 'Bold',
      fontWeight: '700',
      lineHeight: 24,
      letterSpacing: -0.3,
      flex: 1,
    },
    templateDescription: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 12,
      marginTop: 4,
      fontWeight: '400',
    },
    templateStats: {
      flexDirection: 'row',
      gap: 20,
      marginTop: 4,
    },
    templateStat: {
      fontSize: 12,
      fontWeight: '500',
    },
    entryCard: {
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      marginBottom: 12,
    },
    entryName: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 8,
    },
    entryStats: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 8,
    },
    entryStat: {
      fontSize: 14,
    },
    entryDate: {
      fontSize: 12,
    },
    analyticsCard: {
      padding: 20,
      borderRadius: 12,
      borderWidth: 2,
      marginBottom: 16,
    },
    analyticsTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 16,
    },
    analyticsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    analyticsItem: {
      alignItems: 'center',
    },
    analyticsValue: {
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 4,
    },
    analyticsLabel: {
      fontSize: 12,
    },
    loader: {
      marginVertical: 40,
    },
    emptyText: {
      textAlign: 'center',
      fontSize: 20,
      fontFamily: 'Bold',
      fontWeight: '700',
      letterSpacing: -0.3,
    },
    activeWorkoutButton: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 20,
      padding: 20,
      borderRadius: 16,
      borderWidth: 3,
      borderColor: '#000',
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
      color: '#fff',
    },
    pulseIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
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
      borderBottomWidth: 2,
    },
    workoutTitle: {
      fontSize: 20,
      fontWeight: '700',
      flex: 1,
      textAlign: 'center',
    },
    endWorkoutButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#000',
    },
    endWorkoutText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#fff',
    },
    workoutContent: {
      flex: 1,
      padding: 20,
    },
    exerciseContainer: {
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      marginBottom: 20,
    },
    exerciseName: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 16,
    },
    setsHeader: {
      flexDirection: 'row',
      paddingVertical: 8,
      borderBottomWidth: 2,
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
      borderWidth: 2,
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
    checkButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 2,
    },
    modalOverlay: {
      flex: 1,
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      margin: 20,
      borderRadius: 20,
      padding: 24,
      maxHeight: '100%',
      width: '90%',
      borderWidth: 3,
      borderColor: '#000',
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
    modalContainer: {
      flex: 1,
    },
    modalSection: {
      marginBottom: 20,
    },
    modalSectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 8,
    },
    modalText: {
      fontSize: 14,
      lineHeight: 20,
    },
    templateList: {
      maxHeight: 400,
    },
    modalTemplateCard: {
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
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
    exerciseSelector: {
      marginBottom: 16,
    },
    exerciseOption: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 2,
      marginRight: 8,
    },
    exerciseOptionText: {
      fontSize: 14,
      fontWeight: '600',
    },
    modalInput: {
      borderWidth: 2,
      borderRadius: 12,
      padding: 12,
      fontSize: 16,
      marginTop: 8,
    },
    modalTextArea: {
      borderWidth: 2,
      borderRadius: 12,
      padding: 12,
      fontSize: 16,
      marginTop: 8,
      minHeight: 80,
      textAlignVertical: 'top',
    },
    submitButton: {
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      alignItems: 'center',
      marginTop: 20,
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#fff',
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 80,
      paddingHorizontal: 32,
    },
    emptyIconContainer: {
      width: 96,
      height: 96,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },
    emptySubtext: {
      textAlign: 'center',
      fontSize: 15,
      lineHeight: 22,
      marginTop: 12,
      fontWeight: '400',
      maxWidth: 280,
    },
    templateCardContent: {
      flex: 1,
      justifyContent: 'space-between',
    },
    templateCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
      gap: 12,
    },
    templateIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    systemBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      gap: 4,
    },
    systemBadgeText: {
      fontSize: 10,
      fontFamily: 'Bold',
      fontWeight: '700',
      color: '#fff',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    templateStatItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    templateStatText: {
      fontSize: 14,
      fontWeight: '600',
      fontFamily: 'Medium',
    },
    templateActions: {
      flexDirection: 'row',
      gap: 10,
      paddingTop: 16,
      paddingHorizontal: 20,
      paddingBottom: 20,
      borderTopWidth: 2,
    },
    templateActionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 2,
      gap: 6,
    },
    templateActionText: {
      fontSize: 13,
      fontFamily: 'SemiBold',
      fontWeight: '600',
    },
    loaderContainer: {
      paddingVertical: 80,
      alignItems: 'center',
      justifyContent: 'center',
    },
    templateEditorContainer: {
      margin: 20,
      borderRadius: 20,
      maxHeight: '90%',
      width: '90%',
      borderWidth: 3,
      borderColor: '#000',
    },
    templateEditorHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 2,
    },
    templateEditorTitle: {
      fontSize: 22,
      fontWeight: '700',
    },
    templateEditorContent: {
      flex: 1,
      padding: 20,
    },
    templateEditorSection: {
      marginBottom: 20,
    },
    templateEditorSectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    templateEditorLabel: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 8,
    },
    templateEditorInput: {
      borderWidth: 2,
      borderRadius: 12,
      padding: 12,
      fontSize: 16,
    },
    templateEditorTextArea: {
      borderWidth: 2,
      borderRadius: 12,
      padding: 12,
      fontSize: 16,
      minHeight: 80,
      textAlignVertical: 'top',
    },
    templateEditorRow: {
      flexDirection: 'row',
      gap: 12,
    },
    difficultySelector: {
      flexDirection: 'row',
      gap: 8,
    },
    difficultyOption: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 2,
      alignItems: 'center',
    },
    difficultyOptionText: {
      fontSize: 14,
      fontWeight: '600',
    },
    addExerciseButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      gap: 6,
    },
    addExerciseButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#fff',
    },
    templateExerciseCard: {
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      marginBottom: 12,
    },
    templateExerciseHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    templateExerciseInfo: {
      flex: 1,
    },
    templateExerciseName: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 4,
    },
    templateExerciseCategory: {
      fontSize: 12,
    },
    removeExerciseButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    setsContainer: {
      marginTop: 8,
    },
    removeSetButton: {
      width: 40,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addSetButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 2,
      marginTop: 8,
      gap: 6,
    },
    addSetButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    templateEditorFooter: {
      flexDirection: 'row',
      padding: 20,
      borderTopWidth: 2,
      gap: 12,
    },
    templateEditorCancelButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 2,
      alignItems: 'center',
    },
    templateEditorCancelText: {
      fontSize: 16,
      fontWeight: '700',
    },
    templateEditorSaveButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 12,
      gap: 8,
    },
    templateEditorSaveText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#fff',
    },
    exercisePickerContainer: {
      margin: 40,
      borderRadius: 20,
      maxHeight: '80%',
      width: '85%',
      borderWidth: 3,
      borderColor: '#000',
    },
    exercisePickerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 2,
    },
    exercisePickerTitle: {
      fontSize: 20,
      fontWeight: '700',
    },
    exercisePickerList: {
      flex: 1,
      padding: 12,
    },
    exercisePickerItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      marginBottom: 8,
    },
    exercisePickerItemInfo: {
      flex: 1,
    },
    exercisePickerItemName: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    exercisePickerItemCategory: {
      fontSize: 12,
    },
    emptySetsContainer: {
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptySetsText: {
      fontSize: 14,
      textAlign: 'center',
      fontStyle: 'italic',
    },
  });
