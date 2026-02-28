import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Animated,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { X, Plus, Save, Search, Dumbbell, Target, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { darkenColor } from '@/src/utils';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TemplateEditorModalProps {
  visible: boolean;
  styles: any;
  theme: any;
  accentColor: string;
  template: any;
  exercises: any[];
  onClose: () => void;
  onSave: (templateData: any) => void;
}

export default function TemplateEditorModal({
  visible,
  styles,
  theme,
  accentColor,
  template,
  exercises,
  onClose,
  onSave,
}: TemplateEditorModalProps) {
  // Initialize template exercises with proper sets array
  const initializeTemplateExercises = (templateData: any) => {
    if (!templateData?.exercises || !Array.isArray(templateData.exercises)) {
      return [];
    }
    return templateData.exercises.map((ex: any) => ({
      ...ex,
      id: ex.id || `temp-${Date.now()}-${Math.random()}`,
      sets: Array.isArray(ex.sets) && ex.sets.length > 0
        ? ex.sets.map((set: any, index: number) => ({
            ...set,
            id: set.id || `set-${ex.id || index}-${index}`,
            weight: typeof set.weight === 'number' ? set.weight : 0,
            reps: typeof set.reps === 'number' ? set.reps : 10,
            completed: set.completed || false,
          }))
        : [
            {
              id: `set-${ex.id || Date.now()}-1`,
              weight: 0,
              reps: 10,
              completed: false,
            },
          ],
    }));
  };

  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [category, setCategory] = useState(template?.category || '');
  const [difficulty, setDifficulty] = useState(template?.difficulty || 'beginner');
  const [estimatedDuration, setEstimatedDuration] = useState(
    template?.estimatedDurationMinutes?.toString() || ''
  );
  const [templateExercises, setTemplateExercises] = useState<any[]>(() =>
    initializeTemplateExercises(template)
  );
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [searchExerciseQuery, setSearchExerciseQuery] = useState('');

  // Animation refs
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const pickerSlideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const pickerBackdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset form when opening
      if (template) {
        setName(template.name || '');
        setDescription(template.description || '');
        setCategory(template.category || '');
        setDifficulty(template.difficulty || 'beginner');
        setEstimatedDuration(template.estimatedDurationMinutes?.toString() || '');
        setTemplateExercises(initializeTemplateExercises(template));
      } else {
        setName('');
        setDescription('');
        setCategory('');
        setDifficulty('beginner');
        setEstimatedDuration('');
        setTemplateExercises([]);
      }

      // Animate in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, template]);

  useEffect(() => {
    if (showExercisePicker) {
      Animated.parallel([
        Animated.timing(pickerSlideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(pickerBackdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(pickerSlideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(pickerBackdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showExercisePicker]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const filteredExercises = exercises.filter((ex: any) => {
    const matchesSearch =
      !searchExerciseQuery || ex.name.toLowerCase().includes(searchExerciseQuery.toLowerCase());
    return matchesSearch && !templateExercises.find((te: any) => te.exerciseId === ex.id);
  });

  const handleAddExercise = (exercise: any) => {
    const newExercise = {
      id: `temp-${Date.now()}-${Math.random()}`,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      category: exercise.category,
      sets: [
        {
          id: `set-${Date.now()}-1`,
          weight: 0,
          reps: 10,
          completed: false,
        },
      ],
      restTimer: 90,
      exercise: exercise,
    };
    setTemplateExercises([...templateExercises, newExercise]);
    setShowExercisePicker(false);
    setSearchExerciseQuery('');
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setTemplateExercises(templateExercises.filter((ex: any) => ex.id !== exerciseId));
  };

  const handleAddSet = (exerciseId: string) => {
    setTemplateExercises(
      templateExercises.map((ex: any) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: [
                ...ex.sets,
                {
                  id: `set-${Date.now()}-${ex.sets.length + 1}`,
                  weight: ex.sets[ex.sets.length - 1]?.weight || 0,
                  reps: ex.sets[ex.sets.length - 1]?.reps || 10,
                  completed: false,
                },
              ],
            }
          : ex
      )
    );
  };

  const handleRemoveSet = (exerciseId: string, setId: string) => {
    setTemplateExercises(
      templateExercises.map((ex: any) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.filter((s: any) => s.id !== setId),
            }
          : ex
      )
    );
  };

  const handleUpdateSet = (exerciseId: string, setId: string, field: string, value: any) => {
    setTemplateExercises(
      templateExercises.map((ex: any) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((s: any) => (s.id === setId ? { ...s, [field]: value } : s)),
            }
          : ex
      )
    );
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a template name');
      return;
    }
    if (templateExercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    // Validate that all exercises have at least one set
    const exercisesWithNoSets = templateExercises.filter(
      (ex: any) => !Array.isArray(ex.sets) || ex.sets.length === 0
    );
    if (exercisesWithNoSets.length > 0) {
      Alert.alert('Error', 'All exercises must have at least one set configured');
      return;
    }

    const templateData = {
      name: name.trim(),
      description: description.trim() || null,
      category: category.trim() || null,
      difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced',
      estimatedDurationMinutes: estimatedDuration ? parseInt(estimatedDuration, 10) : null,
      exercises: templateExercises.map((ex: any) => ({
        exerciseId: ex.exerciseId || ex.exercise?.id,
        sets: (Array.isArray(ex.sets) ? ex.sets : []).map((set: any) => ({
          weight: typeof set.weight === 'number' ? set.weight : 0,
          reps: typeof set.reps === 'number' ? set.reps : 10,
          restSeconds: ex.restTimer || 90,
        })),
        restTimer: ex.restTimer || 90,
      })),
    };

    handleClose();
    setTimeout(() => onSave(templateData), 250);
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={handleClose}
        statusBarTranslucent
      >
        <View style={modalStyles.container}>
          {/* Backdrop */}
          <Animated.View
            style={[
              modalStyles.backdrop,
              {
                opacity: backdropOpacity,
              },
            ]}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={handleClose}
            />
          </Animated.View>

          {/* Bottom Sheet */}
          <Animated.View
            style={[
              modalStyles.bottomSheet,
              {
                backgroundColor: theme.background,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Handle Bar */}
            <View style={modalStyles.handleContainer}>
              <View style={[modalStyles.handleBar, { backgroundColor: theme.border }]} />
            </View>

            {/* Header */}
            <View style={[modalStyles.header, { borderBottomColor: theme.border }]}>
              <View style={modalStyles.headerContent}>
                <View style={modalStyles.headerIconContainer}>
                  <LinearGradient
                    colors={[accentColor, darkenColor(accentColor, 10)]}
                    style={modalStyles.headerIconGradient}
                  >
                    <Target size={24} color="#fff" />
                  </LinearGradient>
                </View>
                <View style={modalStyles.headerTextContainer}>
                  <Text style={[modalStyles.headerTitle, { color: theme.textPrimary }]}>
                    {template ? 'Edit Template' : 'Create Template'}
                  </Text>
                  <Text style={[modalStyles.headerSubtitle, { color: theme.textSecondary }]}>
                    {template ? 'Update your workout template' : 'Build your custom workout template'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                style={[modalStyles.closeButton, { backgroundColor: `${accentColor}15` }]}
              >
                <X size={20} color={accentColor} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
              style={modalStyles.content}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={modalStyles.contentContainer}
            >
              {/* Basic Info Section */}
              <View style={modalStyles.section}>
                <Text style={[modalStyles.sectionTitle, { color: theme.textPrimary }]}>Basic Information</Text>

                <View style={modalStyles.inputGroup}>
                  <Text style={[modalStyles.label, { color: theme.textPrimary }]}>
                    Template Name <Text style={{ color: '#ef4444' }}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      modalStyles.input,
                      {
                        borderColor: theme.border,
                        color: theme.textPrimary,
                        backgroundColor: theme.cardBackground,
                      },
                    ]}
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g., Full Body Workout"
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>

                <View style={modalStyles.inputGroup}>
                  <Text style={[modalStyles.label, { color: theme.textPrimary }]}>Description</Text>
                  <TextInput
                    style={[
                      modalStyles.textArea,
                      {
                        borderColor: theme.border,
                        color: theme.textPrimary,
                        backgroundColor: theme.cardBackground,
                      },
                    ]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Optional description..."
                    placeholderTextColor={theme.textSecondary}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={modalStyles.row}>
                  <View style={[modalStyles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={[modalStyles.label, { color: theme.textPrimary }]}>Category</Text>
                    <TextInput
                      style={[
                        modalStyles.input,
                        {
                          borderColor: theme.border,
                          color: theme.textPrimary,
                          backgroundColor: theme.cardBackground,
                        },
                      ]}
                      value={category}
                      onChangeText={setCategory}
                      placeholder="e.g., Full Body"
                      placeholderTextColor={theme.textSecondary}
                    />
                  </View>

                  <View style={[modalStyles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={[modalStyles.label, { color: theme.textPrimary }]}>Difficulty</Text>
                    <View style={modalStyles.difficultySelector}>
                      {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                        <TouchableOpacity
                          key={level}
                          style={[
                            modalStyles.difficultyOption,
                            {
                              backgroundColor: difficulty === level ? accentColor : theme.cardBackground,
                              borderColor: difficulty === level ? accentColor : theme.border,
                            },
                          ]}
                          onPress={() => setDifficulty(level)}
                        >
                          <Text
                            style={[
                              modalStyles.difficultyOptionText,
                              { color: difficulty === level ? '#fff' : theme.textPrimary },
                            ]}
                          >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={modalStyles.inputGroup}>
                  <Text style={[modalStyles.label, { color: theme.textPrimary }]}>
                    Estimated Duration (minutes)
                  </Text>
                  <TextInput
                    style={[
                      modalStyles.input,
                      {
                        borderColor: theme.border,
                        color: theme.textPrimary,
                        backgroundColor: theme.cardBackground,
                      },
                    ]}
                    value={estimatedDuration}
                    onChangeText={setEstimatedDuration}
                    placeholder="60"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Exercises Section */}
              <View style={modalStyles.section}>
                <View style={modalStyles.sectionHeader}>
                  <Text style={[modalStyles.sectionTitle, { color: theme.textPrimary }]}>
                    Exercises <Text style={{ color: '#ef4444' }}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={[modalStyles.addButton, { backgroundColor: accentColor }]}
                    onPress={() => setShowExercisePicker(true)}
                  >
                    <Plus size={18} color="#fff" />
                    <Text style={modalStyles.addButtonText}>Add Exercise</Text>
                  </TouchableOpacity>
                </View>

                {templateExercises.length === 0 ? (
                  <View style={modalStyles.emptyContainer}>
                    <View style={[modalStyles.emptyIconContainer, { backgroundColor: `${accentColor}20` }]}>
                      <Dumbbell size={32} color={accentColor} />
                    </View>
                    <Text style={[modalStyles.emptyText, { color: theme.textSecondary }]}>
                      No exercises added yet
                    </Text>
                    <Text style={[modalStyles.emptySubtext, { color: theme.textSecondary }]}>
                      Tap "Add Exercise" to get started
                    </Text>
                  </View>
                ) : (
                  <View style={modalStyles.exercisesList}>
                    {templateExercises.map((ex: any) => (
                      <View
                        key={ex.id}
                        style={[
                          modalStyles.exerciseCard,
                          {
                            backgroundColor: theme.cardBackground,
                            borderColor: accentColor,
                            shadowColor: accentColor,
                          },
                        ]}
                      >
                        <View style={modalStyles.exerciseCardHeader}>
                          <View style={modalStyles.exerciseCardInfo}>
                            <View style={[modalStyles.exerciseIcon, { backgroundColor: `${accentColor}20` }]}>
                              <Dumbbell size={18} color={accentColor} />
                            </View>
                            <View style={modalStyles.exerciseTextContainer}>
                              <Text style={[modalStyles.exerciseName, { color: theme.textPrimary }]}>
                                {ex.exerciseName}
                              </Text>
                              <Text style={[modalStyles.exerciseCategory, { color: theme.textSecondary }]}>
                                {ex.category}
                              </Text>
                            </View>
                          </View>
                          <TouchableOpacity
                            onPress={() => handleRemoveExercise(ex.id)}
                            style={[modalStyles.removeButton, { backgroundColor: '#ef4444' }]}
                          >
                            <X size={16} color="#fff" />
                          </TouchableOpacity>
                        </View>

                        {/* Sets */}
                        <View style={modalStyles.setsContainer}>
                          <View style={[modalStyles.setsHeader, { borderBottomColor: theme.border }]}>
                            <Text style={[modalStyles.setHeaderText, { color: theme.textSecondary }]}>Set</Text>
                            <Text style={[modalStyles.setHeaderText, { color: theme.textSecondary }]}>Weight</Text>
                            <Text style={[modalStyles.setHeaderText, { color: theme.textSecondary }]}>Reps</Text>
                            <View style={{ width: 40 }} />
                          </View>

                          {Array.isArray(ex.sets) && ex.sets.length > 0 ? (
                            ex.sets.map((set: any, index: number) => {
                              const setKey = set.id || `set-${ex.id}-${index}`;
                              return (
                                <View key={setKey} style={modalStyles.setRow}>
                                  <View style={[modalStyles.setNumberContainer, { backgroundColor: `${accentColor}15` }]}>
                                    <Text style={[modalStyles.setNumber, { color: accentColor }]}>{index + 1}</Text>
                                  </View>
                                  <TextInput
                                    style={[
                                      modalStyles.setInput,
                                      {
                                        borderColor: theme.border,
                                        color: theme.textPrimary,
                                        backgroundColor: theme.background,
                                      },
                                    ]}
                                    value={String(set.weight ?? 0)}
                                    onChangeText={(value) =>
                                      handleUpdateSet(ex.id, set.id, 'weight', parseFloat(value) || 0)
                                    }
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor={theme.textSecondary}
                                  />
                                  <TextInput
                                    style={[
                                      modalStyles.setInput,
                                      {
                                        borderColor: theme.border,
                                        color: theme.textPrimary,
                                        backgroundColor: theme.background,
                                      },
                                    ]}
                                    value={String(set.reps ?? 10)}
                                    onChangeText={(value) =>
                                      handleUpdateSet(ex.id, set.id, 'reps', parseInt(value) || 0)
                                    }
                                    keyboardType="numeric"
                                    placeholder="10"
                                    placeholderTextColor={theme.textSecondary}
                                  />
                                  {ex.sets.length > 1 && (
                                    <TouchableOpacity
                                      onPress={() => handleRemoveSet(ex.id, set.id)}
                                      style={modalStyles.removeSetButton}
                                    >
                                      <X size={14} color="#ef4444" />
                                    </TouchableOpacity>
                                  )}
                                </View>
                              );
                            })
                          ) : (
                            <View style={modalStyles.emptySetsContainer}>
                              <Text style={[modalStyles.emptySetsText, { color: theme.textSecondary }]}>
                                No sets configured
                              </Text>
                            </View>
                          )}

                          <TouchableOpacity
                            style={[modalStyles.addSetButton, { borderColor: accentColor }]}
                            onPress={() => handleAddSet(ex.id)}
                          >
                            <Plus size={14} color={accentColor} />
                            <Text style={[modalStyles.addSetButtonText, { color: accentColor }]}>Add Set</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Footer Actions */}
            <View style={[modalStyles.footer, { borderTopColor: theme.border, backgroundColor: theme.background }]}>
              <TouchableOpacity
                style={[modalStyles.cancelButton, { borderColor: theme.border }]}
                onPress={handleClose}
              >
                <Text style={[modalStyles.cancelButtonText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyles.saveButton, { backgroundColor: accentColor }]}
                onPress={handleSave}
              >
                <Save size={18} color="#fff" />
                <Text style={modalStyles.saveButtonText}>Save Template</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Exercise Picker Modal */}
      <Modal
        visible={showExercisePicker}
        transparent
        animationType="none"
        onRequestClose={() => setShowExercisePicker(false)}
        statusBarTranslucent
      >
        <View style={modalStyles.container}>
          <Animated.View
            style={[
              modalStyles.backdrop,
              {
                opacity: pickerBackdropOpacity,
              },
            ]}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setShowExercisePicker(false)}
            />
          </Animated.View>

          <Animated.View
            style={[
              modalStyles.pickerBottomSheet,
              {
                backgroundColor: theme.background,
                transform: [{ translateY: pickerSlideAnim }],
              },
            ]}
          >
            <View style={modalStyles.handleContainer}>
              <View style={[modalStyles.handleBar, { backgroundColor: theme.border }]} />
            </View>

            <View style={[modalStyles.pickerHeader, { borderBottomColor: theme.border }]}>
              <Text style={[modalStyles.pickerTitle, { color: theme.textPrimary }]}>Select Exercise</Text>
              <TouchableOpacity
                onPress={() => setShowExercisePicker(false)}
                style={[modalStyles.closeButton, { backgroundColor: `${accentColor}15` }]}
              >
                <X size={20} color={accentColor} />
              </TouchableOpacity>
            </View>

            <View style={[modalStyles.searchContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <Search size={20} color={theme.textSecondary} />
              <TextInput
                style={[modalStyles.searchInput, { color: theme.textPrimary }]}
                placeholder="Search exercises..."
                placeholderTextColor={theme.textSecondary}
                value={searchExerciseQuery}
                onChangeText={setSearchExerciseQuery}
              />
            </View>

            <ScrollView style={modalStyles.pickerContent} showsVerticalScrollIndicator={false}>
              {filteredExercises.length === 0 ? (
                <View style={modalStyles.emptyContainer}>
                  <Text style={[modalStyles.emptyText, { color: theme.textSecondary }]}>No exercises found</Text>
                </View>
              ) : (
                filteredExercises.map((exercise: any) => (
                  <TouchableOpacity
                    key={exercise.id}
                    style={[
                      modalStyles.exercisePickerItem,
                      {
                        backgroundColor: theme.cardBackground,
                        borderColor: theme.border,
                      },
                    ]}
                    onPress={() => handleAddExercise(exercise)}
                    activeOpacity={0.7}
                  >
                    <View style={[modalStyles.pickerItemIcon, { backgroundColor: `${accentColor}20` }]}>
                      <Dumbbell size={20} color={accentColor} />
                    </View>
                    <View style={modalStyles.pickerItemInfo}>
                      <Text style={[modalStyles.pickerItemName, { color: theme.textPrimary }]}>
                        {exercise.name}
                      </Text>
                      <Text style={[modalStyles.pickerItemCategory, { color: theme.textSecondary }]}>
                        {exercise.category}
                      </Text>
                    </View>
                    <View style={[modalStyles.pickerItemAdd, { backgroundColor: `${accentColor}15` }]}>
                      <Plus size={18} color={accentColor} />
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.95,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 3,
    borderColor: '#000',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  headerIconContainer: {
    marginRight: 12,
  },
  headerIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  row: {
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
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  difficultyOptionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 13,
    textAlign: 'center',
  },
  exercisesList: {
    gap: 16,
  },
  exerciseCard: {
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  exerciseCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  exerciseTextContainer: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  exerciseCategory: {
    fontSize: 12,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  setsHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 2,
    marginBottom: 12,
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
    paddingVertical: 10,
    gap: 8,
  },
  setNumberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumber: {
    fontSize: 14,
    fontWeight: '700',
  },
  setInput: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    textAlign: 'center',
  },
  removeSetButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    marginTop: 8,
    gap: 6,
  },
  addSetButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptySetsContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptySetsText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 2,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  // Exercise Picker Styles
  pickerBottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.7,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 3,
    borderColor: '#000',
    borderBottomWidth: 0,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 2,
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    margin: 20,
    marginBottom: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  pickerContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  exercisePickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    marginBottom: 12,
    gap: 12,
  },
  pickerItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerItemInfo: {
    flex: 1,
  },
  pickerItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  pickerItemCategory: {
    fontSize: 12,
  },
  pickerItemAdd: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
