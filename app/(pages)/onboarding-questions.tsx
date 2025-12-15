/**
 * Onboarding Questions Screen
 * 
 * Optional survey questions - user can skip
 */

import React, { useEffect, useCallback, useState, useMemo } from 'react';
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
  saveOnboardingQuestions,
  completeOnboardingQuestions,
  type OnboardingData,
} from '@/src/store/slices/onboardingSlice';
import { setOnboardingCompleted, syncUser } from '@/src/store/slices/authSlice';
import AppText from '@/components/core-components/AppText';
import QuestionSection from '@/components/onboarding/QuestionSection';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/src/context/ThemeContext';
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

// Onboarding questions (optional)
interface QuestionConfig {
  id: number;
  type: 'single' | 'multi';
  field: string;
  title: string;
  subtitle?: string;
  options?: any[];
  multiSelect?: boolean;
  maxSelections?: number;
}

const QUESTIONS: QuestionConfig[] = [
  {
    id: 1,
    type: 'single',
    field: 'reproductiveStage',
    title: '1. What best describes your current reproductive stage?',
    options: REPRODUCTIVE_STAGES,
  },
  {
    id: 2,
    type: 'single',
    field: 'healthGoal',
    title: '2. What is your primary health goal right now?',
    options: HEALTH_GOALS,
  },
  {
    id: 3,
    type: 'multi',
    field: 'birthControl',
    title: '3. Are you currently using birth control?',
    subtitle: 'Multi-select - This is crucial as hormonal BC overrides natural cycles',
    options: BIRTH_CONTROL_OPTIONS,
    multiSelect: true,
  },
  {
    id: 4,
    type: 'multi',
    field: 'medicalDiagnoses',
    title: '4. Have you been medically diagnosed with any of the following?',
    options: MEDICAL_DIAGNOSES,
    multiSelect: true,
  },
  {
    id: 5,
    type: 'multi',
    field: 'physicalSymptoms',
    title: '5. Which physical symptoms bother you the most?',
    subtitle: 'Select up to 3',
    options: PHYSICAL_SYMPTOMS,
    multiSelect: true,
    maxSelections: 3,
  },
  {
    id: 6,
    type: 'single',
    field: 'pmsMood',
    title: '6. How does your mood change before your period (PMS)?',
    options: PMS_MOODS,
  },
  {
    id: 7,
    type: 'single',
    field: 'stressLevel',
    title: '7. How would you rate your current daily stress level?',
    options: STRESS_LEVELS,
  },
  {
    id: 8,
    type: 'multi',
    field: 'foodStruggles',
    title: '8. What is your biggest struggle regarding food?',
    options: FOOD_STRUGGLES,
    multiSelect: true,
  },
  {
    id: 9,
    type: 'single',
    field: 'dietaryLifestyle',
    title: '9. Do you follow a specific dietary lifestyle?',
    options: DIETARY_LIFESTYLES,
  },
];

const TOTAL_QUESTIONS = QUESTIONS.length;

export default function OnboardingQuestionsScreen() {
  const { theme, accentColor } = useTheme();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { data, questionsData, isLoading } = useSelector(
    (state: RootState) => state.onboarding
  );
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [calculating, setCalculating] = useState(false);
  
  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const dynamicStyles = useMemo(() => createStyles(theme, accentColor), [theme, accentColor]);
  
  // Helper function to add opacity to hex color for gradient
  const addOpacityToHex = useCallback((hex: string, opacity: number) => {
    const hexWithoutHash = hex.replace('#', '');
    const r = parseInt(hexWithoutHash.substring(0, 2), 16);
    const g = parseInt(hexWithoutHash.substring(2, 4), 16);
    const b = parseInt(hexWithoutHash.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }, []);
  
  // Create gradient colors for calculating screen
  const calculatingGradientColors: [string, string, string] = useMemo(() => [
    addOpacityToHex(accentColor, 0.15),
    addOpacityToHex(accentColor, 0.08),
    theme.background,
  ] as [string, string, string], [theme, accentColor, addOpacityToHex]);

  const handleNext = useCallback(() => {
    const nextIndex = currentQuestionIndex + 1;
    
    // If we're finishing all questions, complete everything
    if (nextIndex >= TOTAL_QUESTIONS) {
      handleComplete();
      return;
    }
    
    setCurrentQuestionIndex(nextIndex);
  }, [currentQuestionIndex]);

  const handleBack = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  }, [currentQuestionIndex]);

  const handleComplete = async () => {
    if (isCompleting || calculating) {
      return;
    }

    try {
      setIsCompleting(true);
      
      // Save onboarding questions (can be empty if user skipped)
      await dispatch(saveOnboardingQuestions(questionsData || {})).unwrap();
      
      // Complete onboarding questions
      await dispatch(completeOnboardingQuestions()).unwrap();

      // Sync user to get updated profile and onboarding status from backend
      const syncResult = await dispatch(syncUser()).unwrap();
      
      // Set onboarding completed flag
      if (syncResult?.onboardingCompleted !== false) {
        dispatch(setOnboardingCompleted(syncResult?.onboardingCompleted ?? true));
      } else {
        dispatch(setOnboardingCompleted(true));
      }

      // Show calculation screen
      setCalculating(true);
      setIsCompleting(false);
      
      // Navigate to main app after short delay
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 2000);
    } catch (error: any) {
      setIsCompleting(false);
      setCalculating(false);
      
      const errorMessage = 
        error?.response?.data?.message || 
        error?.response?.data?.error ||
        error?.message || 
        'Failed to complete onboarding. Please try again.';
      
      Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Questions',
      'Are you sure you want to skip these questions? You can answer them later from settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          style: 'default',
          onPress: () => {
            // Complete without saving questions
            handleComplete();
          },
        },
      ]
    );
  };

  const handleSelect = useCallback((value: string) => {
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
  }, [currentQuestion, data, dispatch]);

  const getSelectedValues = useCallback(() => {
    const field = currentQuestion.field as keyof OnboardingData;
    const value = (data as any)[field];
    if (currentQuestion.type === 'multi') {
      return Array.isArray(value) ? value : [];
    }
    return value ? [value] : [];
  }, [currentQuestion, data]);

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
            <Text style={[dynamicStyles.calculatingTitle, { color: theme.textPrimary }]}>
              Setting Up Your Profile
            </Text>
            <Text style={[dynamicStyles.calculatingSubtitle, { color: theme.textSecondary }]}>
              Please wait...
            </Text>
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
          Question {currentQuestionIndex + 1} of {TOTAL_QUESTIONS} (Optional)
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={dynamicStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Skip Notice */}
        <View style={[dynamicStyles.skipNotice, { backgroundColor: theme.primarySoft, borderColor: theme.border }]}>
          <Text style={[dynamicStyles.skipNoticeText, { color: theme.textSecondary }]}>
            💡 These questions are optional. You can skip them and answer later.
          </Text>
        </View>

        {/* Question Content */}
        <View style={dynamicStyles.questionContainer}>
          <QuestionSection
            title={currentQuestion.title}
            subtitle={currentQuestion.subtitle}
            options={currentQuestion.options || []}
            selectedValues={getSelectedValues()}
            onSelect={handleSelect}
            multiSelect={currentQuestion.multiSelect || false}
            maxSelections={currentQuestion.maxSelections}
          />
        </View>

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
              (isLoading || isCompleting) && dynamicStyles.buttonDisabled,
            ]}
            onPress={handleNext}
            disabled={isLoading || isCompleting}
          >
            {isLoading || isCompleting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={dynamicStyles.buttonPrimaryText}>
                {currentQuestionIndex === TOTAL_QUESTIONS - 1
                  ? 'Complete Setup'
                  : 'Next'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Skip Button */}
        <TouchableOpacity
          style={[dynamicStyles.skipButton, { borderColor: theme.border }]}
          onPress={handleSkip}
          disabled={isCompleting}
        >
          <Text style={[dynamicStyles.skipButtonText, { color: theme.textSecondary }]}>
            Skip All Questions
          </Text>
        </TouchableOpacity>
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
  skipNotice: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
  },
  skipNoticeText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 400,
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
  skipButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '500',
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
  },
  calculatingSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.8,
  },
});

