/**
 * Onboarding Questions Settings Page
 * 
 * View and edit survey questions (Optional)
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/src/store';
import {
  updateField,
  saveOnboardingQuestions,
  loadOnboardingQuestions,
  type OnboardingData,
} from '@/src/store/slices/onboardingSlice';
import { ChevronLeft, Edit, Check, X, Save, RefreshCcw } from 'lucide-react-native';
import AppText from '@/components/core-components/AppText';
import { useTheme } from '@/src/context/ThemeContext';
import QuestionSection from '@/components/onboarding/QuestionSection';
import {
  REPRODUCTIVE_STAGES,
  HEALTH_GOALS,
  BIRTH_CONTROL_OPTIONS,
  MEDICAL_DIAGNOSES,
  PHYSICAL_SYMPTOMS,
  PMS_MOODS,
  STRESS_LEVELS,
  FOOD_STRUGGLES,
  DIETARY_LIFESTYLES,
} from '@/data/onboardingQuestions';

// Questions Sections
const QUESTIONS_SECTIONS = [
  {
    title: 'Reproductive Health',
    description: 'Information about your reproductive stage and goals',
    questions: [
      { id: 1, field: 'reproductiveStage', label: 'Reproductive Stage', type: 'single', options: REPRODUCTIVE_STAGES },
      { id: 2, field: 'healthGoal', label: 'Primary Health Goal', type: 'single', options: HEALTH_GOALS },
      { id: 3, field: 'birthControl', label: 'Birth Control', type: 'multi', options: BIRTH_CONTROL_OPTIONS },
    ],
  },
  {
    title: 'Hormonal & Physical Symptoms',
    description: 'Medical conditions and physical symptoms',
    questions: [
      { id: 4, field: 'medicalDiagnoses', label: 'Medical Diagnoses', type: 'multi', options: MEDICAL_DIAGNOSES },
      { id: 5, field: 'physicalSymptoms', label: 'Physical Symptoms (Top 3)', type: 'multi', options: PHYSICAL_SYMPTOMS, maxSelections: 3 },
    ],
  },
  {
    title: 'Mood & Mindset',
    description: 'Mental and emotional well-being',
    questions: [
      { id: 6, field: 'pmsMood', label: 'PMS Mood Changes', type: 'single', options: PMS_MOODS },
      { id: 7, field: 'stressLevel', label: 'Daily Stress Level', type: 'single', options: STRESS_LEVELS },
    ],
  },
  {
    title: 'Nutrition & Weight',
    description: 'Dietary preferences and food relationships',
    questions: [
      { id: 8, field: 'foodStruggles', label: 'Food Struggles', type: 'multi', options: FOOD_STRUGGLES },
      { id: 9, field: 'dietaryLifestyle', label: 'Dietary Lifestyle', type: 'single', options: DIETARY_LIFESTYLES },
    ],
  },
];

// Get question title
const getQuestionTitle = (field: string): string => {
  const titles: Record<string, string> = {
    reproductiveStage: 'What best describes your current reproductive stage?',
    healthGoal: 'What is your primary health goal right now?',
    birthControl: 'Are you currently using birth control?',
    medicalDiagnoses: 'Have you been medically diagnosed with any of the following?',
    physicalSymptoms: 'Which physical symptoms bother you the most?',
    pmsMood: 'How does your mood change before your period (PMS)?',
    stressLevel: 'How would you rate your current daily stress level?',
    foodStruggles: 'What is your biggest struggle regarding food?',
    dietaryLifestyle: 'Do you follow a specific dietary lifestyle?',
  };
  return titles[field] || field;
};

// Format answer for display
const formatAnswer = (field: string, value: any, options?: any[]): string => {
  if (!value && value !== 0) return 'Not answered';
  
  if (Array.isArray(value)) {
    if (value.length === 0) return 'Not answered';
    if (!options) return value.join(', ');
    return value
      .map(v => options.find(opt => opt.value === v)?.label || v)
      .join(', ');
  }
  
  if (options) {
    const option = options.find(opt => opt.value === value);
    return option?.label || String(value);
  }
  
  return String(value);
};

export default function OnboardingQuestionsSettingsScreen() {
  const router = useRouter();
  const { theme, accentColor } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { data } = useSelector((state: RootState) => state.onboarding);
  
  const [editingField, setEditingField] = useState<string | null>(null);
  const [localData, setLocalData] = useState<OnboardingData>(data);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  
  const dynamicStyles = useMemo(() => createStyles(theme, accentColor), [theme, accentColor]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Sync local data with Redux
  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      await dispatch(loadOnboardingQuestions()).unwrap();
    } catch (error: any) {
      console.error('Failed to load questions data:', error);
      Alert.alert('Error', 'Failed to load data. Using cached data.');
    } finally {
      setLoadingData(false);
    }
  };

  const handleEdit = useCallback((field: string) => {
    setEditingField(field);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingField(null);
    setLocalData(data);
  }, [data]);

  const handleSaveField = useCallback((field: keyof OnboardingData, value: any) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
    dispatch(updateField({ field, value }));
    setEditingField(null);
  }, [dispatch]);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const payload = {
        reproductiveStage: localData.reproductiveStage,
        healthGoal: localData.healthGoal,
        birthControl: localData.birthControl,
        medicalDiagnoses: localData.medicalDiagnoses,
        physicalSymptoms: localData.physicalSymptoms,
        pmsMood: localData.pmsMood,
        stressLevel: localData.stressLevel,
        foodStruggles: localData.foodStruggles,
        dietaryLifestyle: localData.dietaryLifestyle,
      };
      
      await dispatch(saveOnboardingQuestions(payload)).unwrap();
      Alert.alert('Success', 'Your survey questions have been saved successfully!');
    } catch (error: any) {
      console.error('Failed to save questions:', error);
      Alert.alert('Error', error?.response?.data?.message || error.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Questions',
      'Are you sure you want to skip the survey questions? You can complete them later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          style: 'default',
          onPress: () => {
            Alert.alert('Questions Skipped', 'You can complete the survey questions anytime from settings.');
            router.back();
          },
        },
      ]
    );
  };

  const renderQuestionCard = (section: typeof QUESTIONS_SECTIONS[0], question: typeof QUESTIONS_SECTIONS[0]['questions'][0]) => {
    const field = question.field as keyof OnboardingData;
    const currentValue = localData[field];
    const isEditing = editingField === field;
    const questionTitle = getQuestionTitle(question.field);

    return (
      <View key={question.id} style={[dynamicStyles.questionCard, { 
        backgroundColor: theme.cardBackground, 
        borderColor: theme.border,
        shadowColor: accentColor,
      }]}>
        <View style={dynamicStyles.questionHeader}>
          <View style={dynamicStyles.questionInfo}>
            <AppText style={[dynamicStyles.questionLabel, { color: accentColor }]}>
              {question.label}
            </AppText>
            <AppText style={[dynamicStyles.questionTitle, { color: theme.textPrimary }]}>
              {questionTitle}
            </AppText>
          </View>
          {!isEditing && (
            <TouchableOpacity
              style={[dynamicStyles.editButton, { backgroundColor: `${accentColor}20` }]}
              onPress={() => handleEdit(question.field)}
            >
              <Edit size={18} color={accentColor} />
            </TouchableOpacity>
          )}
        </View>

        {!isEditing ? (
          <View style={[dynamicStyles.answerContainer, { 
            backgroundColor: theme.primarySoft, 
            borderColor: theme.border 
          }]}>
            <AppText style={[dynamicStyles.answerText, { color: theme.textPrimary }]}>
              {formatAnswer(question.field, currentValue, question.options)}
            </AppText>
          </View>
        ) : (
          <View style={dynamicStyles.editContainer}>
            <QuestionSection
              title={questionTitle}
              options={question.options || []}
              selectedValues={
                question.type === 'multi'
                  ? (Array.isArray(currentValue) ? (currentValue as string[]) : [])
                  : currentValue ? [String(currentValue)] : []
              }
              onSelect={(value: string) => {
                if (question.type === 'multi') {
                  const currentArray = Array.isArray(currentValue) ? (currentValue as string[]) : [];
                  const newArray = currentArray.includes(value)
                    ? currentArray.filter((v: string) => v !== value)
                    : question.maxSelections && currentArray.length >= question.maxSelections
                    ? currentArray
                    : [...currentArray, value];
                  handleSaveField(field, newArray);
                } else {
                  handleSaveField(field, value);
                  setEditingField(null);
                }
              }}
              multiSelect={question.type === 'multi'}
              maxSelections={question.maxSelections}
            />
            <View style={dynamicStyles.editActions}>
              {question.type === 'multi' && (
                <TouchableOpacity
                  style={[dynamicStyles.doneButton, { backgroundColor: accentColor }]}
                  onPress={() => setEditingField(null)}
                >
                  <Check size={18} color="#fff" />
                  <AppText style={dynamicStyles.doneButtonText}>Done</AppText>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={dynamicStyles.cancelButton}
                onPress={handleCancelEdit}
              >
                <X size={18} color="#ef4444" />
                <AppText style={dynamicStyles.cancelButtonText}>Cancel</AppText>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  if (loadingData) {
    return (
      <View style={[dynamicStyles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={accentColor} />
        <AppText style={[dynamicStyles.loadingText, { color: theme.textSecondary }]}>
          Loading your information...
        </AppText>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[dynamicStyles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView style={dynamicStyles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={theme.headerGradient as [string, string]} style={dynamicStyles.header}>
          <View style={dynamicStyles.headerTopRow}>
            <TouchableOpacity
              style={[dynamicStyles.backButton, { backgroundColor: `${accentColor}20` }]}
              onPress={() => router.back()}
            >
              <ChevronLeft size={24} color={accentColor} />
            </TouchableOpacity>
            <View style={dynamicStyles.headerTitleContainer}>
              <AppText style={[dynamicStyles.headerTitle, { color: accentColor }]}>
                Survey Questions
              </AppText>
              <AppText style={[dynamicStyles.headerSubtitle, { color: theme.textSecondary }]}>
                Answer survey questions (Optional)
              </AppText>
            </View>
            <TouchableOpacity
              style={[dynamicStyles.refreshButton, { backgroundColor: `${accentColor}20` }]}
              onPress={loadData}
            >
              <RefreshCcw size={20} color={accentColor} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Questions Sections */}
        {QUESTIONS_SECTIONS.map((section, sectionIndex) => (
          <View key={sectionIndex} style={dynamicStyles.section}>
            <View style={dynamicStyles.sectionHeader}>
              <View style={dynamicStyles.sectionTitleRow}>
                <AppText style={[dynamicStyles.sectionTitle, { color: theme.textPrimary }]}>
                  {section.title}
                </AppText>
                <View style={[dynamicStyles.optionalBadge, { backgroundColor: theme.primarySoft }]}>
                  <AppText style={[dynamicStyles.optionalText, { color: theme.textSecondary }]}>
                    Optional
                  </AppText>
                </View>
              </View>
              <AppText style={[dynamicStyles.sectionDescription, { color: theme.textSecondary }]}>
                {section.description}
              </AppText>
            </View>
            
            <View style={dynamicStyles.questionsContainer}>
              {section.questions.map((question) => renderQuestionCard(section, question))}
            </View>
          </View>
        ))}

        {/* Footer Buttons */}
        <View style={dynamicStyles.footer}>
          <TouchableOpacity
            style={[
              dynamicStyles.saveButton, 
              { backgroundColor: accentColor, shadowColor: accentColor },
              saving && dynamicStyles.saveButtonDisabled
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Save size={20} color="#fff" />
                <AppText style={dynamicStyles.saveButtonText}>Save Questions</AppText>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              dynamicStyles.skipButton,
              { backgroundColor: theme.cardBackground, borderColor: theme.border },
            ]}
            onPress={handleSkip}
          >
            <AppText style={[dynamicStyles.skipButtonText, { color: theme.textSecondary }]}>
              Skip for Now
            </AppText>
          </TouchableOpacity>
          <AppText style={[dynamicStyles.helpText, { color: theme.textSecondary }]}>
            Questions are optional. You can complete them later.
          </AppText>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const createStyles = (theme: any, accentColor: string) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginTop: 32,
    marginHorizontal: 20,
  },
  sectionHeader: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  optionalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  optionalText: {
    fontSize: 11,
    fontWeight: '500',
  },
  questionsContainer: {
    gap: 16,
  },
  questionCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  questionInfo: {
    flex: 1,
    gap: 4,
  },
  questionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  answerText: {
    fontSize: 15,
    lineHeight: 22,
  },
  editContainer: {
    marginTop: 8,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 12,
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  doneButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#fee2e2',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
  footer: {
    marginTop: 32,
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  skipButton: {
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
});

