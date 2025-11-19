// app/(pages)/onboarding.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/src/store';
import { completeOnboarding } from '@/lib/api';
import { syncUser } from '@/src/store/slices/authSlice';
import AppText from '@/components/core-components/AppText';

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'light', label: 'Light' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'active', label: 'Active' },
  { value: 'very_active', label: 'Very Active' },
] as const;

const WELLNESS_GOALS = [
  { id: 'mood', label: 'Better mood tracking' },
  { id: 'sleep', label: 'Improved sleep' },
  { id: 'pain', label: 'Pain management' },
  { id: 'exercise', label: 'Exercise optimization' },
  { id: 'nutrition', label: 'Nutrition planning' },
  { id: 'fertility', label: 'Fertility awareness' },
  { id: 'wellness', label: 'General wellness' },
] as const;

export default function OnboardingScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [averageCycleLength, setAverageCycleLength] = useState('28');
  const [lutealPhaseDays, setLutealPhaseDays] = useState('14');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'>('moderate');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    if (!displayName.trim()) {
      alert('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      await completeOnboarding({
        displayName: displayName.trim(),
        averageCycleLength: parseInt(averageCycleLength) || 28,
        lutealPhaseDays: parseInt(lutealPhaseDays) || 14,
        age: age ? parseInt(age) : undefined,
        activityLevel,
        wellnessGoals: selectedGoals,
      });

      // Sync user to get updated profile
      await dispatch(syncUser()).unwrap();

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Onboarding error:', error);
      alert(error?.message || 'Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return displayName.trim().length > 0;
      case 2:
        return averageCycleLength.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Veluna</Text>
          <Text style={styles.subtitle}>
            Let's set up your profile ({step}/3)
          </Text>
        </View>

        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your name"
              autoCapitalize="words"
            />

            <Text style={styles.label}>Age (optional)</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder="Enter your age"
              keyboardType="numeric"
            />
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.label}>Average Cycle Length</Text>
            <Text style={styles.hint}>
              How many days is your typical menstrual cycle?
            </Text>
            <TextInput
              style={styles.input}
              value={averageCycleLength}
              onChangeText={setAverageCycleLength}
              placeholder="28"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Luteal Phase Length (optional)</Text>
            <Text style={styles.hint}>
              Days from ovulation to period start (usually 12-16 days)
            </Text>
            <TextInput
              style={styles.input}
              value={lutealPhaseDays}
              onChangeText={setLutealPhaseDays}
              placeholder="14"
              keyboardType="numeric"
            />
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.label}>Activity Level</Text>
            <View style={styles.optionsContainer}>
              {ACTIVITY_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.optionButton,
                    activityLevel === level.value && styles.optionButtonActive,
                  ]}
                  onPress={() => setActivityLevel(level.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      activityLevel === level.value && styles.optionTextActive,
                    ]}
                  >
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Wellness Goals (optional)</Text>
            <Text style={styles.hint}>Select what you'd like to focus on</Text>
            <View style={styles.goalsContainer}>
              {WELLNESS_GOALS.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  style={[
                    styles.goalChip,
                    selectedGoals.includes(goal.id) && styles.goalChipActive,
                  ]}
                  onPress={() => toggleGoal(goal.id)}
                >
                  <Text
                    style={[
                      styles.goalChipText,
                      selectedGoals.includes(goal.id) && styles.goalChipTextActive,
                    ]}
                  >
                    {goal.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          {step > 1 && (
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleBack}
              disabled={loading}
            >
              <Text style={styles.buttonSecondaryText}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.button,
              styles.buttonPrimary,
              !canProceed() && styles.buttonDisabled,
            ]}
            onPress={handleNext}
            disabled={!canProceed() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonPrimaryText}>
                {step === 3 ? 'Complete Setup' : 'Next'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  stepContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  optionButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  optionButtonActive: {
    borderColor: '#ec4899',
    backgroundColor: '#fdf2f8',
  },
  optionText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  optionTextActive: {
    color: '#ec4899',
    fontWeight: '600',
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  goalChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalChipActive: {
    backgroundColor: '#fdf2f8',
    borderColor: '#ec4899',
  },
  goalChipText: {
    fontSize: 14,
    color: '#6b7280',
  },
  goalChipTextActive: {
    color: '#ec4899',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonPrimary: {
    backgroundColor: '#ec4899',
  },
  buttonSecondary: {
    backgroundColor: '#f3f4f6',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondaryText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
});