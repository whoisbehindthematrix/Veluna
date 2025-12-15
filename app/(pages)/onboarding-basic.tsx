/**
 * Basic Onboarding Screen
 * 
 * Mandatory basic profile information collection
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
  saveBasicOnboarding,
  completeBasicOnboarding,
  type OnboardingData,
  setCurrentQuestionIndex,
} from '@/src/store/slices/onboardingSlice';
import AppText from '@/components/core-components/AppText';
import DatePickerQuestion from '@/components/onboarding/DatePickerQuestion';
import NumericInputQuestion from '@/components/onboarding/NumericInputQuestion';
import UnitsSelector from '@/components/onboarding/UnitsSelector';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/src/context/ThemeContext';
import { Calendar, CalendarArrowUp, CalendarSync, Ruler, Weight} from 'lucide-react-native';
import { CalendarUtils } from 'react-native-calendars';

// Basic onboarding questions (mandatory)
interface QuestionConfig {
  id: number;
  type: 'date' | 'numeric' | 'units';
  field: string;
  title: string;
  subtitle?: string;
  required?: boolean;
  unit?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  decimal?: boolean;
}

const BASIC_QUESTIONS: QuestionConfig[] = [
  {
    id: 1,
    type: 'date',
    field: 'dateOfBirth',
    title: '1. What is your date of birth?',
    subtitle: 'Date of birth',
    required: false,
  },
  {
    id: 2,
    type: 'units',
    field: 'unitsSystem',
    title: '2. Select your preferred units',
    subtitle: 'Choose metric or imperial',
    required: false,
  },
  {
    id: 3,
    type: 'numeric',
    field: 'weight',
    title: '3. What is your current weight?',
    unit: 'kg',
    placeholder: 'Enter weight',
    min: 20,
    max: 300,
    decimal: true,
    required: false,
  },
  {
    id: 4,
    type: 'numeric',
    field: 'height',
    title: '4. What is your height?',
    unit: 'cm',
    placeholder: 'Enter height',
    min: 100,
    max: 250,
    decimal: false,
    required: false,
  },
  {
    id: 5,
    type: 'numeric',
    field: 'averageCycleLength',
    title: '5. What is your average cycle length?',
    subtitle: 'Days from Day 1 of period to Day 1 of next period (21-40 days)',
    unit: 'days',
    placeholder: 'Enter days',
    min: 21,
    max: 40,
    decimal: false,
    required: true,
  },
  {
    id: 6,
    type: 'numeric',
    field: 'periodDuration',
    title: '6. How long does your period usually last?',
    subtitle: 'Number of days (1-7 days)',
    unit: 'days',
    placeholder: 'Enter days',
    min: 1,
    max: 7,
    decimal: false,
    required: true,
  },
];

const TOTAL_QUESTIONS = BASIC_QUESTIONS.length;

export default function BasicOnboardingScreen() {
  const { theme, accentColor } = useTheme();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { data, basicData, isLoading } = useSelector(
    (state: RootState) => state.onboarding
  );
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [calculating, setCalculating] = useState(false);
  
  const currentQuestion = BASIC_QUESTIONS[currentQuestionIndex];
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

  // Validate required fields
  const validateRequiredFields = useCallback(() => {
    const requiredFields = {
      averageCycleLength: basicData.averageCycleLength || data.averageCycleLength,
      periodDuration: basicData.periodDuration || data.periodDuration,
    };

    const missingFields: string[] = [];
    
    if (!requiredFields.averageCycleLength && requiredFields.averageCycleLength !== 0) {
      missingFields.push('Average Cycle Length');
    }
    if (!requiredFields.periodDuration && requiredFields.periodDuration !== 0) {
      missingFields.push('Period Duration');
    }

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  }, [basicData, data]);

  const handleNext = useCallback(() => {
    const nextIndex = currentQuestionIndex + 1;
    
    // If we're finishing basic onboarding, complete it
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
    if (isCompleting) {
      return;
    }

    try {
      setIsCompleting(true);
      
      // Validate required fields
      const validation = validateRequiredFields();
      if (!validation.isValid) {
        Alert.alert(
          'Required Fields Missing',
          `Please complete all required fields:\n\n${validation.missingFields.join('\n')}`,
          [{ text: 'OK' }]
        );
        setIsCompleting(false);
        return;
      }

      // Merge with defaults and extract only basic onboarding fields
      const basicPayload = {
        dateOfBirth: basicData.dateOfBirth || data.dateOfBirth,
        weight: basicData.weight || data.weight,
        height: basicData.height || data.height,
        targetWeight: basicData.targetWeight || data.targetWeight,
        unitsSystem: basicData.unitsSystem || data.unitsSystem || 'metric',
        dailyCalorieGoal: basicData.dailyCalorieGoal || data.dailyCalorieGoal,
        averageCycleLength: basicData.averageCycleLength || data.averageCycleLength || 28,
        periodDuration: basicData.periodDuration || data.periodDuration || 5,
      };
      
      // Validate numeric ranges
      if (basicPayload.averageCycleLength < 21 || basicPayload.averageCycleLength > 40) {
        Alert.alert(
          'Invalid Cycle Length',
          'Average cycle length must be between 21 and 40 days.',
          [{ text: 'OK' }]
        );
        setIsCompleting(false);
        return;
      }
      
      if (basicPayload.periodDuration < 1 || basicPayload.periodDuration > 7) {
        Alert.alert(
          'Invalid Period Duration',
          'Period duration must be between 1 and 7 days.',
          [{ text: 'OK' }]
        );
        setIsCompleting(false);
        return;
      }
      
      // Save basic onboarding
      await dispatch(saveBasicOnboarding(basicPayload)).unwrap();
      
      // Complete basic onboarding
      await dispatch(completeBasicOnboarding()).unwrap();
      
      // Show calculation screen
      setCalculating(true);
      setIsCompleting(false);
      
      // Navigate to questions page after short delay
      setTimeout(() => {
        router.replace('/(pages)/onboarding-questions');
      }, 1500);
    } catch (error: any) {
      setIsCompleting(false);
      
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Failed to save basic information. Please try again.';
      
      Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
    }
  };

  const canProceed = useCallback(() => {
    // For required questions, check if they have an answer
    if (currentQuestion.required) {
      const field = currentQuestion.field as keyof OnboardingData;
      const value = (data as any)[field];
      if (currentQuestion.type === 'numeric') {
        return typeof value === 'number' && !isNaN(value);
      }
      return !!value;
    }
    // Optional questions can always proceed
    return true;
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
              Saving Your Information
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
              minimumDate={new Date(1950, 0, 1)}
              maximumDate={new Date()}
            />
          ) : currentQuestion.type === 'numeric' ? (
            <NumericInputQuestion
              title={currentQuestion.title}
              subtitle={currentQuestion.subtitle}
              value={(data as any)[currentQuestion.field as keyof OnboardingData]}
              onChange={(value) =>
                dispatch(
                  updateField({
                    field: currentQuestion.field as keyof OnboardingData,
                    value: value,
                  })
                )
              }

              iconGraphic={ currentQuestion.field === 'weight' ? <Weight size={40} color={accentColor} /> : currentQuestion.field === 'height' ? <Ruler size={40} color={accentColor} /> : currentQuestion.field === 'averageCycleLength' ? <CalendarSync size={40} color={accentColor} /> : currentQuestion.field === 'periodDuration' ? <CalendarArrowUp size={40} color={accentColor} /> : null  }
           
              unit={
                currentQuestion.field === 'weight'
                  ? (data.unitsSystem === 'imperial' ? 'lbs' : 'kg')
                  : currentQuestion.field === 'height'
                  ? (data.unitsSystem === 'imperial' ? 'in' : 'cm')
                  : currentQuestion.unit
              }
              placeholder={currentQuestion.placeholder}
              min={currentQuestion.min}
              max={currentQuestion.max}
              decimal={currentQuestion.decimal}
            />
          ) : currentQuestion.type === 'units' ? (
            <UnitsSelector
              value={(data as any)[currentQuestion.field as keyof OnboardingData] || 'metric'}
              onChange={(value) =>
                dispatch(
                  updateField({
                    field: currentQuestion.field as keyof OnboardingData,
                    value: value,
                  })
                )
              }
            />
          ) : null}
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
              (!canProceed() || isLoading || isCompleting) && dynamicStyles.buttonDisabled,
            ]}
            onPress={handleNext}
            disabled={!canProceed() || isLoading || isCompleting}
          >
            {isLoading || isCompleting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={dynamicStyles.buttonPrimaryText}>
                {currentQuestionIndex === TOTAL_QUESTIONS - 1
                  ? 'Continue to Questions'
                  : 'Next'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
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
    height: 6,
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
  },
  calculatingSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.8,
  },
});

