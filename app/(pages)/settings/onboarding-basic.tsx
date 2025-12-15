/**
 * Basic Onboarding Settings Page
 * 
 * View and edit basic profile information (Required)
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
  saveBasicOnboarding,
  loadBasicOnboarding,
  type OnboardingData,
} from '@/src/store/slices/onboardingSlice';
import { ChevronLeft, Edit, Check, X, Save, RefreshCcw, AlertCircle } from 'lucide-react-native';
import AppText from '@/components/core-components/AppText';
import { useTheme } from '@/src/context/ThemeContext';
import DatePickerQuestion from '@/components/onboarding/DatePickerQuestion';
import NumericInputQuestion from '@/components/onboarding/NumericInputQuestion';
import UnitsSelector from '@/components/onboarding/UnitsSelector';

// Basic Onboarding Questions
const BASIC_QUESTIONS = [
  { id: 1, field: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
  { id: 2, field: 'unitsSystem', label: 'Units System', type: 'units', required: true },
  { id: 3, field: 'weight', label: 'Current Weight', type: 'numeric', unit: 'kg', min: 20, max: 300, decimal: true, required: true },
  { id: 4, field: 'height', label: 'Height', type: 'numeric', unit: 'cm', min: 100, max: 250, decimal: false, required: true },
  { id: 5, field: 'targetWeight', label: 'Target Weight', type: 'numeric', unit: 'kg', min: 20, max: 300, decimal: true },
  { id: 6, field: 'dailyCalorieGoal', label: 'Daily Calorie Goal', type: 'numeric', unit: 'calories', min: 1000, max: 5000, decimal: false },
  { id: 7, field: 'averageCycleLength', label: 'Average Cycle Length', type: 'numeric', unit: 'days', min: 21, max: 40, decimal: false, required: true },
  { id: 8, field: 'periodDuration', label: 'Period Duration', type: 'numeric', unit: 'days', min: 1, max: 7, decimal: false, required: true },
];

// Get question title
const getQuestionTitle = (field: string): string => {
  const titles: Record<string, string> = {
    unitsSystem: 'Select your preferred units',
    dateOfBirth: 'What is your date of birth?',
    weight: 'What is your current weight?',
    height: 'What is your height?',
    targetWeight: 'What is your target weight? (Optional)',
    dailyCalorieGoal: 'What is your daily calorie goal? (Optional)',
    averageCycleLength: 'What is your average cycle length?',
    periodDuration: 'How long does your period usually last?',
  };
  return titles[field] || field;
};

// Format answer for display
const formatAnswer = (field: string, value: any, unitsSystem?: string): string => {
  if (!value && value !== 0) return 'Not answered';

  if (field === 'dateOfBirth' && value) {
    const date = new Date(value);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  if (field === 'unitsSystem') {
    return value === 'imperial' ? 'Imperial (lbs, ft/in)' : 'Metric (kg, cm)';
  }

  if (typeof value === 'number') {
    if (field === 'weight' || field === 'targetWeight') {
      return `${value} ${unitsSystem === 'imperial' ? 'lbs' : 'kg'}`;
    }
    if (field === 'height') {
      return `${value} ${unitsSystem === 'imperial' ? 'in' : 'cm'}`;
    }
    if (field === 'dailyCalorieGoal') {
      return `${value} calories`;
    }
    if (field === 'averageCycleLength' || field === 'periodDuration') {
      return `${value} days`;
    }
  }

  return String(value);
};

export default function BasicOnboardingSettingsScreen() {
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
      await dispatch(loadBasicOnboarding()).unwrap();
    } catch (error: any) {
      console.error('Failed to load basic onboarding data:', error);
      Alert.alert('Error', 'Failed to load data. Using cached data.');
    } finally {
      setLoadingData(false);
    }
  };

  // Validate required fields
  const validateRequiredFields = useCallback(() => {
    const requiredFields = {
      unitsSystem: localData.unitsSystem,
      dateOfBirth: localData.dateOfBirth,
      weight: localData.weight,
      height: localData.height,
      averageCycleLength: localData.averageCycleLength,
      periodDuration: localData.periodDuration,
    };

    const missingFields: string[] = [];

    if (!requiredFields.unitsSystem) missingFields.push('Units System');
    if (!requiredFields.dateOfBirth) missingFields.push('Date of Birth');
    if (!requiredFields.weight && requiredFields.weight !== 0) missingFields.push('Weight');
    if (!requiredFields.height && requiredFields.height !== 0) missingFields.push('Height');
    if (!requiredFields.averageCycleLength && requiredFields.averageCycleLength !== 0) missingFields.push('Average Cycle Length');
    if (!requiredFields.periodDuration && requiredFields.periodDuration !== 0) missingFields.push('Period Duration');

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  }, [localData]);

  const isComplete = useMemo(() => {
    return validateRequiredFields().isValid;
  }, [validateRequiredFields]);

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
    const validation = validateRequiredFields();

    if (!validation.isValid) {
      Alert.alert(
        'Required Fields Missing',
        `Please fill in all required fields:\n\n${validation.missingFields.join('\n')}`,
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        dateOfBirth: localData.dateOfBirth,
        weight: localData.weight,
        height: localData.height,
        targetWeight: localData.targetWeight,
        unitsSystem: localData.unitsSystem || 'metric',
        dailyCalorieGoal: localData.dailyCalorieGoal,
        averageCycleLength: localData.averageCycleLength || 28,
        periodDuration: localData.periodDuration || 5,
      };

      await dispatch(saveBasicOnboarding(payload)).unwrap();
      Alert.alert('Success', 'Your basic information has been saved successfully!');
    } catch (error: any) {
      console.error('Failed to save basic onboarding:', error);
      Alert.alert('Error', error?.response?.data?.message || error.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderQuestionCard = (question: typeof BASIC_QUESTIONS[0]) => {
    const field = question.field as keyof OnboardingData;
    const currentValue = localData[field];
    const isEditing = editingField === field;
    const questionTitle = getQuestionTitle(question.field);
    const unitsSystem = localData.unitsSystem || 'metric';

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
            {question.required && (
              <View style={dynamicStyles.requiredBadge}>
                <AppText style={dynamicStyles.requiredText}>Required</AppText>
              </View>
            )}
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
              {formatAnswer(question.field, currentValue, unitsSystem)}
            </AppText>
          </View>
        ) : (
          <View style={dynamicStyles.editContainer}>
            {question.type === 'date' ? (
              <>
                <DatePickerQuestion
                  title={questionTitle}
                  value={currentValue as string}
                  onChange={(date) => {
                    handleSaveField(field, date);
                    setTimeout(() => setEditingField(null), 500);
                  }}
                  minimumDate={new Date(1950, 0, 1)}
                  maximumDate={new Date()}
                />
                <View style={dynamicStyles.editActions}>
                  <TouchableOpacity
                    style={dynamicStyles.cancelButton}
                    onPress={handleCancelEdit}
                  >
                    <X size={18} color="#ef4444" />
                    <AppText style={dynamicStyles.cancelButtonText}>Cancel</AppText>
                  </TouchableOpacity>
                </View>
              </>
            ) : question.type === 'numeric' ? (
              <>
                <NumericInputQuestion
                  title={questionTitle}
                  value={currentValue as number}
                  onChange={(value) => {
                    handleSaveField(field, value);
                  }}
                  unit={
                    question.field === 'weight' || question.field === 'targetWeight'
                      ? (unitsSystem === 'imperial' ? 'lbs' : 'kg')
                      : question.field === 'height'
                        ? (unitsSystem === 'imperial' ? 'in' : 'cm')
                        : question.unit
                  }
                  placeholder={question.field}
                  min={question.min}
                  max={question.max}
                  decimal={question.decimal}
                />
                <View style={dynamicStyles.editActions}>
                  <TouchableOpacity
                    style={[dynamicStyles.doneButton, { backgroundColor: accentColor }]}
                    onPress={() => setEditingField(null)}
                  >
                    <Check size={18} color="#fff" />
                    <AppText style={dynamicStyles.doneButtonText}>Done</AppText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={dynamicStyles.cancelButton}
                    onPress={handleCancelEdit}
                  >
                    <X size={18} color="#ef4444" />
                    <AppText style={dynamicStyles.cancelButtonText}>Cancel</AppText>
                  </TouchableOpacity>
                </View>
              </>
            ) : question.type === 'units' ? (
              <>
                <UnitsSelector
                  value={(currentValue as 'metric' | 'imperial') || 'metric'}
                  onChange={(value) => {
                    handleSaveField(field, value);
                  }}
                />
                <View style={dynamicStyles.editActions}>
                  <TouchableOpacity
                    style={[dynamicStyles.doneButton, { backgroundColor: accentColor }]}
                    onPress={() => setEditingField(null)}
                  >
                    <Check size={18} color="#fff" />
                    <AppText style={dynamicStyles.doneButtonText}>Done</AppText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={dynamicStyles.cancelButton}
                    onPress={handleCancelEdit}
                  >
                    <X size={18} color="#ef4444" />
                    <AppText style={dynamicStyles.cancelButtonText}>Cancel</AppText>
                  </TouchableOpacity>
                </View>
              </>
            ) : null}
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
                Basic Onboarding
              </AppText>
              <AppText style={[dynamicStyles.headerSubtitle, { color: theme.textSecondary }]}>
                Complete your basic profile (Required)
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

        {/* Warning Banner */}
        {!isComplete && (
          <View style={[dynamicStyles.warningBanner, { backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}>
            <AlertCircle size={18} color="#dc2626" />
            <AppText style={[dynamicStyles.warningText, { color: '#991b1b' }]}>
              Please complete all required fields to continue
            </AppText>
          </View>
        )}

        {/* Section Header */}
        <View style={dynamicStyles.section}>
          <View style={dynamicStyles.sectionHeader}>
            <View style={dynamicStyles.sectionTitleRow}>
              <AppText style={[dynamicStyles.sectionTitle, { color: theme.textPrimary }]}>
                Basic Profile Information
              </AppText>
              <View style={[dynamicStyles.mandatoryBadge, { backgroundColor: '#fee2e2' }]}>
                <AppText style={dynamicStyles.mandatoryText}>Required</AppText>
              </View>
            </View>
            <AppText style={[dynamicStyles.sectionDescription, { color: theme.textSecondary }]}>
              Your basic biological and cycle information
            </AppText>
          </View>

          <View style={dynamicStyles.questionsContainer}>
            {BASIC_QUESTIONS.map((question) => renderQuestionCard(question))}
          </View>
        </View>

        {/* Save Button */}
        <View style={dynamicStyles.footer}>
          <TouchableOpacity
            style={[
              dynamicStyles.saveButton,
              { backgroundColor: accentColor, shadowColor: accentColor },
              (saving || !isComplete) && dynamicStyles.saveButtonDisabled
            ]}
            onPress={handleSave}
            disabled={saving || !isComplete}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Save size={20} color="#fff" />
                <AppText style={dynamicStyles.saveButtonText}>Save Basic Information</AppText>
              </>
            )}
          </TouchableOpacity>
          {!isComplete && (
            <AppText style={[dynamicStyles.helpText, { color: theme.textSecondary }]}>
              Complete all required fields to enable saving
            </AppText>
          )}
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
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
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
  mandatoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mandatoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#dc2626',
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
  requiredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  requiredText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#dc2626',
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
  helpText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
});

