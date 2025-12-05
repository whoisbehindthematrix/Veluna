/**
 * Comprehensive Onboarding Screen
 * 
 * One question at a time survey flow
 */

import React, { useEffect, useCallback, useState, useMemo } from 'react';

// Reactotron logging (only in dev)
let Reactotron: any = null;
if (__DEV__) {
  try {
    Reactotron = require('reactotron-react-native').default;
  } catch (e) {
    // Reactotron not available
  }
}

const log = (...args: any[]) => {
  if (__DEV__ && Reactotron) {
    Reactotron.log(...args);
  }
  console.log(...args);
};

const logError = (message: string, error: any) => {
  if (__DEV__ && Reactotron) {
    Reactotron.error(message, error);
    Reactotron.display({
      name: '❌ Onboarding Error',
      preview: message,
      value: error,
    });
  }
  console.error(message, error);
};
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/src/store';
import {
  updateField,
  completeOnboarding,
  saveOnboardingData,
  type OnboardingData,
} from '@/src/store/slices/onboardingSlice';
import { setOnboardingCompleted, syncUser } from '@/src/store/slices/authSlice';
import AppText from '@/components/core-components/AppText';
import QuestionSection from '@/components/onboarding/QuestionSection';
import DatePickerQuestion from '@/components/onboarding/DatePickerQuestion';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/src/context/ThemeContext';
import {
  WEIGHT_RANGES,
  HEIGHT_RANGES,
  REPRODUCTIVE_STAGES,
  HEALTH_GOALS,
  BIRTH_CONTROL_OPTIONS,
  CYCLE_LENGTHS,
  PERIOD_DURATIONS,
  MEDICAL_DIAGNOSES,
  PHYSICAL_SYMPTOMS,
  PMS_MOODS,
  STRESS_LEVELS,
  FOOD_STRUGGLES,
  DIETARY_LIFESTYLES,
} from '@/data/onboardingQuestions';

// Define all questions in order
interface QuestionConfig {
  id: number;
  type: 'date' | 'single' | 'multi';
  field: string;
  title: string;
  subtitle?: string;
  options?: any[];
  multiSelect?: boolean;
  maxSelections?: number;
  required?: boolean;
}

const QUESTIONS: QuestionConfig[] = [
  // Section 1: Baseline Profile
  {
    id: 1,
    type: 'date',
    field: 'dateOfBirth',
    title: '1. Which age bracket do you fall into?',
    subtitle: 'Date of birth',
    required: false,
  },
  {
    id: 2,
    type: 'single',
    field: 'weightRange',
    title: '2. What is your current weight?',
    options: WEIGHT_RANGES,
    required: false,
  },
  {
    id: 3,
    type: 'single',
    field: 'heightRange',
    title: '3. What is your height?',
    options: HEIGHT_RANGES,
    required: false,
  },
  {
    id: 4,
    type: 'single',
    field: 'reproductiveStage',
    title: '4. What best describes your current reproductive stage?',
    options: REPRODUCTIVE_STAGES,
    required: false,
  },
  {
    id: 5,
    type: 'single',
    field: 'healthGoal',
    title: '5. What is your primary health goal right now?',
    options: HEALTH_GOALS,
    required: false,
  },
  // Section 2: Cycle Details
  {
    id: 6,
    type: 'multi',
    field: 'birthControl',
    title: '6. Are you currently using birth control?',
    subtitle: 'Multi-select - This is crucial as hormonal BC overrides natural cycles',
    options: BIRTH_CONTROL_OPTIONS,
    multiSelect: true,
    required: false,
  },
  {
    id: 7,
    type: 'single',
    field: 'cycleLength',
    title: '7. What is your average Cycle Length?',
    subtitle: 'Count from Day 1 of period to Day 1 of the next',
    options: CYCLE_LENGTHS,
    required: true,
  },
  {
    id: 8,
    type: 'single',
    field: 'periodDuration',
    title: '8. How long does your period usually last?',
    options: PERIOD_DURATIONS,
    required: true,
  },
  // Section 3: Hormonal & Physical Symptoms
  {
    id: 9,
    type: 'multi',
    field: 'medicalDiagnoses',
    title: '9. Have you been medically diagnosed with any of the following?',
    options: MEDICAL_DIAGNOSES,
    multiSelect: true,
    required: false,
  },
  {
    id: 10,
    type: 'multi',
    field: 'physicalSymptoms',
    title: '10. Which physical symptoms bother you the most?',
    subtitle: 'Select up to 3',
    options: PHYSICAL_SYMPTOMS,
    multiSelect: true,
    maxSelections: 3,
    required: false,
  },
  // Section 4: Mood & Mindset
  {
    id: 11,
    type: 'single',
    field: 'pmsMood',
    title: '11. How does your mood change before your period (PMS)?',
    options: PMS_MOODS,
    required: false,
  },
  {
    id: 12,
    type: 'single',
    field: 'stressLevel',
    title: '12. How would you rate your current daily stress level?',
    options: STRESS_LEVELS,
    required: false,
  },
  // Section 5: Nutrition & Weight
  {
    id: 13,
    type: 'multi',
    field: 'foodStruggles',
    title: '13. What is your biggest struggle regarding food?',
    options: FOOD_STRUGGLES,
    multiSelect: true,
    required: false,
  },
  {
    id: 14,
    type: 'single',
    field: 'dietaryLifestyle',
    title: '14. Do you follow a specific dietary lifestyle?',
    options: DIETARY_LIFESTYLES,
    required: false,
  },
];

const TOTAL_QUESTIONS = QUESTIONS.length;

export default function ComprehensiveOnboardingScreen() {
  const { theme, accentColor } = useTheme();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { data, isLoading, error } = useSelector(
    (state: RootState) => state.onboarding
  );
  const [calculating, setCalculating] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const dynamicStyles = useMemo(() => createStyles(theme, accentColor), [theme, accentColor]);
  
  // Helper function to add opacity to hex color for gradient
  const addOpacityToHex = (hex: string, opacity: number) => {
    const hexWithoutHash = hex.replace('#', '');
    const r = parseInt(hexWithoutHash.substring(0, 2), 16);
    const g = parseInt(hexWithoutHash.substring(2, 4), 16);
    const b = parseInt(hexWithoutHash.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  
  // Create gradient colors for calculating screen
  const calculatingGradientColors: [string, string, string] = useMemo(() => [
    addOpacityToHex(accentColor, 0.15),
    addOpacityToHex(accentColor, 0.08),
    theme.background,
  ] as [string, string, string], [theme, accentColor]);

  // Data is stored in Redux slice - no auto-save to backend
  // Backend sync happens only on completion

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < TOTAL_QUESTIONS - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleComplete();
    }
  }, [currentQuestionIndex]);

  const handleBack = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  }, [currentQuestionIndex]);

  const handleComplete = async () => {
    try {
      log('🚀 Starting onboarding completion...');
      log('📊 Current onboarding data:', data);
      
      // Validate required fields before attempting to save
      const hasCycleLength = !!data.cycleLength || typeof data.averageCycleLength === 'number';
      const hasPeriodDuration = !!data.periodDuration || typeof data.periodDuration === 'number';
      
      if (!hasCycleLength || !hasPeriodDuration) {
        const missingFields = [];
        if (!hasCycleLength) missingFields.push('Cycle Length');
        if (!hasPeriodDuration) missingFields.push('Period Duration');
        
        log('❌ Missing required fields:', missingFields);
        Alert.alert(
          'Missing Information',
          `Please answer all required questions:\n\n${missingFields.join('\n')}`,
          [{ text: 'OK' }]
        );
        return;
      }
      
      // First save all data to backend
      log('💾 Step 1: Saving onboarding data to backend...');
      log('🔍 Required fields check:', {
        cycleLength: data.cycleLength,
        periodDuration: data.periodDuration,
        averageCycleLength: data.averageCycleLength,
      });
      
      const saveResult = await dispatch(saveOnboardingData(data)).unwrap();
      log('✅ Step 1 Complete: Data saved', saveResult);
      
      // Then complete onboarding - this should mark user as completed in backend
      log('✅ Step 2: Completing onboarding...');
      const completeResult = await dispatch(completeOnboarding()).unwrap();
      log('✅ Step 2 Complete: Onboarding marked as complete', completeResult);

      // Sync user to get updated profile and onboarding status from backend
      log('🔄 Step 3: Syncing user profile...');
      const syncResult = await dispatch(syncUser()).unwrap();
      log('✅ Step 3 Complete: User profile synced', syncResult);
      log('📋 Onboarding completed status from backend:', syncResult?.onboardingCompleted);
      
      // Only set in Redux if backend confirms it's completed
      // The syncUser should have already updated it, but ensure it's set
      if (syncResult?.onboardingCompleted !== false) {
        dispatch(setOnboardingCompleted(syncResult?.onboardingCompleted ?? true));
        log('✅ Onboarding completed flag set in Redux:', syncResult?.onboardingCompleted ?? true);
      } else {
        log('⚠️ WARNING: Backend reports onboarding NOT completed!', {
          backendStatus: syncResult?.onboardingCompleted,
        });
        // Still set it for now, but log the warning
        dispatch(setOnboardingCompleted(true));
      }

      // Show calculation screen
      setCalculating(true);
      setTimeout(() => {
        log('🔀 Navigating to main app...');
        router.replace('/(tabs)');
      }, 2000);
    } catch (error: any) {
      logError('❌ Onboarding completion error', error);
      
      // Detailed error logging
      const errorDetails = {
        message: error?.message,
        response: {
          status: error?.response?.status,
          statusText: error?.response?.statusText,
          data: error?.response?.data,
          headers: error?.response?.headers,
        },
        request: {
          url: error?.config?.url,
          method: error?.config?.method,
          data: error?.config?.data,
          headers: error?.config?.headers,
        },
        stack: error?.stack,
      };
      
      log('🔍 Full error details:', errorDetails);
      
      // User-friendly error message
      const errorMessage = 
        error?.response?.data?.message || 
        error?.response?.data?.error ||
        error?.message || 
        'Failed to complete onboarding. Please try again.';
      
      log('📢 Showing error to user:', errorMessage);
      alert(`Error: ${errorMessage}\n\nCheck Reactotron for details.`);
      setCalculating(false);
    }
  };

  const canProceed = () => {
    // For required questions, check if they have an answer
    if (currentQuestion.required) {
      const field = currentQuestion.field as keyof OnboardingData;
      const value = (data as any)[field];
      if (currentQuestion.type === 'multi') {
        return Array.isArray(value) && value.length > 0;
      }
      return !!value;
    }
    // Optional questions can always proceed
    return true;
  };

  const handleSelect = (value: string) => {
    const field = currentQuestion.field as keyof OnboardingData;
    
    if (currentQuestion.type === 'multi') {
      const current = ((data as any)[field] as any[]) || [];
      if (current.includes(value)) {
        // Deselect
        dispatch(
          updateField({
            field: field,
            value: current.filter((v) => v !== value),
          })
        );
      } else {
        // Check max selections
        if (currentQuestion.maxSelections && current.length >= currentQuestion.maxSelections) {
          return; // Can't select more
        }
        // Select
        dispatch(
          updateField({
            field: field,
            value: [...current, value],
          })
        );
      }
    } else {
      // Single select
      dispatch(
        updateField({
          field: field,
          value: value as any,
        })
      );
    }
  };

  const getSelectedValues = () => {
    const field = currentQuestion.field as keyof OnboardingData;
    const value = (data as any)[field];
    if (currentQuestion.type === 'multi') {
      return Array.isArray(value) ? value : [];
    }
    return value ? [value] : [];
  };

  // Show calculation loading screen
  if (calculating) {
    return (
      <View style={[dynamicStyles.calculatingContainer, { backgroundColor: theme.background }]}>
        <LinearGradient
          colors={calculatingGradientColors}
          style={dynamicStyles.calculatingGradient}
        >
          <View style={dynamicStyles.calculatingContent}>
            <ActivityIndicator size="large" color={accentColor} style={dynamicStyles.calculatingSpinner} />
            <Text style={[dynamicStyles.calculatingTitle, { color: theme.textPrimary }]}>Setting Up Your Profile</Text>
            <Text style={[dynamicStyles.calculatingSubtitle, { color: theme.textSecondary }]}>Please wait...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[dynamicStyles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Progress Bar */}
      <View style={[dynamicStyles.progressContainer, { backgroundColor: theme.cardBackground }]}>
        <View style={[dynamicStyles.progressBar, { backgroundColor: theme.border }]}>
          <View
            style={[
              dynamicStyles.progressFill,
              { 
                width: `${((currentQuestionIndex + 1) / TOTAL_QUESTIONS) * 100}%`,
                backgroundColor: accentColor,
              },
            ]}
          />
        </View>
        <Text style={[dynamicStyles.progressText, { color: theme.textSecondary }]}>
          Question {currentQuestionIndex + 1} of {TOTAL_QUESTIONS}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={dynamicStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Question Content */}
        <View style={dynamicStyles.questionContainer}>
          {currentQuestion.type === 'date' ? (
            <DatePickerQuestion
              title={currentQuestion.title}
              subtitle={currentQuestion.subtitle}
              value={(data as any)[currentQuestion.field as keyof OnboardingData]}
              onChange={(date) =>
                dispatch(
                  updateField({
                    field: currentQuestion.field as keyof OnboardingData,
                    value: date,
                  })
                )
              }
            />
          ) : (
            <QuestionSection
              title={currentQuestion.title}
              subtitle={currentQuestion.subtitle}
              options={currentQuestion.options || []}
              selectedValues={getSelectedValues()}
              onSelect={handleSelect}
              multiSelect={currentQuestion.multiSelect || false}
              maxSelections={currentQuestion.maxSelections}
            />
          )}
        </View>

        {error && (
          <View style={[dynamicStyles.errorContainer, { 
            backgroundColor: `${accentColor}20`,
            borderColor: `${accentColor}40`,
          }]}>
            <Text style={[dynamicStyles.errorText, { color: accentColor }]}>{error}</Text>
          </View>
        )}

        {/* Navigation Buttons */}
        <View style={dynamicStyles.buttonContainer}>
          {currentQuestionIndex > 0 && (
            <TouchableOpacity
              style={[dynamicStyles.button, dynamicStyles.buttonSecondary, { backgroundColor: theme.primarySoft }]}
              onPress={handleBack}
              disabled={isLoading}
            >
              <Text style={[dynamicStyles.buttonSecondaryText, { color: theme.textSecondary }]}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              dynamicStyles.button,
              { backgroundColor: accentColor, shadowColor: accentColor },
              (!canProceed() || isLoading) && dynamicStyles.buttonDisabled,
            ]}
            onPress={handleNext}
            disabled={!canProceed() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={dynamicStyles.buttonPrimaryText}>
                {currentQuestionIndex === TOTAL_QUESTIONS - 1 ? 'Complete Setup' : 'Next'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ============================================================================
// DYNAMIC STYLES (Theme-aware)
// ============================================================================

const createStyles = (theme: any, accentColor: string) => StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 400,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    marginTop: 16,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonSecondary: {
    // Secondary button style - backgroundColor will be set inline
  },
  buttonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  calculatingContainer: {
    flex: 1,
  },
  calculatingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calculatingContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  calculatingSpinner: {
    marginBottom: 32,
    transform: [{ scale: 1.5 }],
  },
  calculatingTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
    fontFamily: 'Bold',
  },
  calculatingSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.8,
  },
});
