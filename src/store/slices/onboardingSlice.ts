/**
 * Onboarding Redux Slice
 * 
 * Manages onboarding data split into two parts:
 * 1. Basic onboarding (profile info with numeric values)
 * 2. Onboarding questions (questionnaire data)
 */

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { onboardingService } from '@/services/onboardingService';
import api from '@/lib/api';

// ============================================================================
// TYPES
// ============================================================================

export type UnitsSystem = 'metric' | 'imperial';

export type ReproductiveStage =
  | 'menstruating'
  | 'postpartum'
  | 'breastfeeding'
  | 'perimenopause'
  | 'menopause';

export type HealthGoal =
  | 'cycle_syncing'
  | 'symptom_management'
  | 'weight_management'
  | 'fertility'
  | 'mental_health';

export type BirthControl =
  | 'none'
  | 'hormonal_pill'
  | 'hormonal_iud'
  | 'copper_iud'
  | 'implant_injection_patch'
  | 'tubal_ligation';

export type MedicalDiagnosis =
  | 'pcos'
  | 'endometriosis'
  | 'fibroids'
  | 'hypothyroidism'
  | 'hyperthyroidism'
  | 'pmdd'
  | 'none';

export type PhysicalSymptom =
  | 'acne'
  | 'bloating'
  | 'cramps'
  | 'fatigue'
  | 'hair_issues'
  | 'headaches'
  | 'breast_tenderness';

export type PMSMood =
  | 'stable'
  | 'mild'
  | 'moderate'
  | 'severe';

export type StressLevel =
  | 'low'
  | 'manageable'
  | 'high'
  | 'burnout';

export type FoodStruggle =
  | 'sugar_cravings'
  | 'salty_carb_cravings'
  | 'binge_eating'
  | 'loss_of_appetite'
  | 'none';

export type DietaryLifestyle =
  | 'omnivore'
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'keto_low_carb'
  | 'gluten_free'
  | 'dairy_free';

// Part 1: Basic Onboarding Data
export interface BasicOnboardingData {
  dateOfBirth?: string; // YYYY-MM-DD format
  weight?: number; // Actual weight value
  height?: number; // Actual height value (cm for metric, inches for imperial)
  targetWeight?: number;
  unitsSystem?: UnitsSystem; // "metric" | "imperial"
  dailyCalorieGoal?: number;
  averageCycleLength: number; // Required: 21-40, default: 28
  periodDuration: number; // Required: 1-7, default: 5
}

// Part 2: Onboarding Questions Data
export interface OnboardingQuestionsData {
  reproductiveStage?: ReproductiveStage;
  healthGoal?: HealthGoal;
  birthControl?: BirthControl[]; // Array of strings
  medicalDiagnoses?: MedicalDiagnosis[]; // Array of strings
  physicalSymptoms?: PhysicalSymptom[]; // Array of strings, max 3
  pmsMood?: PMSMood;
  stressLevel?: StressLevel;
  foodStruggles?: FoodStruggle[]; // Array of strings
  dietaryLifestyle?: DietaryLifestyle;
}

// Combined interface for local state management
export interface OnboardingData {
  // Basic onboarding fields
  dateOfBirth?: string;
  weight?: number;
  height?: number;
  targetWeight?: number;
  unitsSystem?: UnitsSystem;
  dailyCalorieGoal?: number;
  averageCycleLength?: number;
  periodDuration?: number;
  
  // Questions fields
  reproductiveStage?: ReproductiveStage;
  healthGoal?: HealthGoal;
  birthControl?: BirthControl[];
  medicalDiagnoses?: MedicalDiagnosis[];
  physicalSymptoms?: PhysicalSymptom[];
  pmsMood?: PMSMood;
  stressLevel?: StressLevel;
  foodStruggles?: FoodStruggle[];
  dietaryLifestyle?: DietaryLifestyle;
}

export interface OnboardingState {
  // Separate data structures for each part
  basicData: BasicOnboardingData;
  questionsData: OnboardingQuestionsData;
  
  // Combined data for backward compatibility
  data: OnboardingData;
  
  // UI state
  currentQuestionIndex: number;
  isLoading: boolean;
  error: string | null;
  
  // Completion status
  basicCompleted: boolean;
  questionsCompleted: boolean;
  isCompleted: boolean;
  
  lastSyncedAt: string | null;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: OnboardingState = {
  basicData: {
    averageCycleLength: 28,
    periodDuration: 5,
  },
  questionsData: {},
  data: {
    averageCycleLength: 28,
    periodDuration: 5,
  },
  currentQuestionIndex: 0,
  isLoading: false,
  error: null,
  basicCompleted: false,
  questionsCompleted: false,
  isCompleted: false,
  lastSyncedAt: null,
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

/**
 * Save basic onboarding data to backend
 */
export const saveBasicOnboarding = createAsyncThunk(
  'onboarding/saveBasic',
  async (data: Partial<BasicOnboardingData>, { rejectWithValue }) => {
    try {
      const response = await onboardingService.saveBasicOnboarding(data);
      return response;
    } catch (error: any) {
      console.error('Failed to save basic onboarding:', error);
      return rejectWithValue(
        error?.response?.data?.message || 'Failed to save basic onboarding'
      );
    }
  }
);

/**
 * Save onboarding questions to backend
 */
export const saveOnboardingQuestions = createAsyncThunk(
  'onboarding/saveQuestions',
  async (data: Partial<OnboardingQuestionsData>, { rejectWithValue }) => {
    try {
      const response = await onboardingService.saveOnboardingQuestions(data);
      return response;
    } catch (error: any) {
      console.error('Failed to save onboarding questions:', error);
      return rejectWithValue(
        error?.response?.data?.message || 'Failed to save onboarding questions'
      );
    }
  }
);

/**
 * Get basic onboarding data from backend
 */
export const loadBasicOnboarding = createAsyncThunk(
  'onboarding/loadBasic',
  async (_, { rejectWithValue }) => {
    try {
      const response = await onboardingService.getBasicOnboarding();
      return response;
    } catch (error: any) {
      console.error('Failed to load basic onboarding:', error);
      return rejectWithValue(
        error?.response?.data?.message || 'Failed to load basic onboarding'
      );
    }
  }
);

/**
 * Get onboarding questions from backend
 */
export const loadOnboardingQuestions = createAsyncThunk(
  'onboarding/loadQuestions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await onboardingService.getOnboardingQuestions();
      return response;
    } catch (error: any) {
      console.error('Failed to load onboarding questions:', error);
      return rejectWithValue(
        error?.response?.data?.message || 'Failed to load onboarding questions'
      );
    }
  }
);

/**
 * Complete basic onboarding
 */
export const completeBasicOnboarding = createAsyncThunk(
  'onboarding/completeBasic',
  async (_, { rejectWithValue }) => {
    try {
      const response = await onboardingService.completeBasicOnboarding();
      return response;
    } catch (error: any) {
      console.error('Failed to complete basic onboarding:', error);
      return rejectWithValue(
        error?.response?.data?.message || 'Failed to complete basic onboarding'
      );
    }
  }
);

/**
 * Complete onboarding questions
 */
export const completeOnboardingQuestions = createAsyncThunk(
  'onboarding/completeQuestions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await onboardingService.completeOnboardingQuestions();
      return response;
    } catch (error: any) {
      console.error('Failed to complete onboarding questions:', error);
      return rejectWithValue(
        error?.response?.data?.message || 'Failed to complete onboarding questions'
      );
    }
  }
);

// ============================================================================
// SLICE
// ============================================================================

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    // Update specific field in combined data
    updateField: (
      state: OnboardingState,
      action: PayloadAction<{ field: keyof OnboardingData; value: any }>
    ) => {
      const { field, value } = action.payload;
      
      // Update combined data
      (state.data as any)[field] = value;
      
      // Also update the appropriate part
      if (field === 'dateOfBirth' || field === 'weight' || field === 'height' || 
          field === 'targetWeight' || field === 'unitsSystem' || field === 'dailyCalorieGoal' ||
          field === 'averageCycleLength' || field === 'periodDuration') {
        (state.basicData as any)[field] = value;
      } else {
        (state.questionsData as any)[field] = value;
      }
      
      state.error = null;
    },

    // Update multiple fields at once
    updateFields: (
      state: OnboardingState,
      action: PayloadAction<Partial<OnboardingData>>
    ) => {
      state.data = { ...state.data, ...action.payload };
      
      // Split into basic and questions
      Object.keys(action.payload).forEach((key) => {
        const field = key as keyof OnboardingData;
        const value = action.payload[field];
        
        if (field === 'dateOfBirth' || field === 'weight' || field === 'height' || 
            field === 'targetWeight' || field === 'unitsSystem' || field === 'dailyCalorieGoal' ||
            field === 'averageCycleLength' || field === 'periodDuration') {
          (state.basicData as any)[field] = value;
        } else {
          (state.questionsData as any)[field] = value;
        }
      });
      
      state.error = null;
    },

    // Update current question index
    setCurrentQuestionIndex: (state, action: PayloadAction<number>) => {
      state.currentQuestionIndex = action.payload;
    },

    // Reset onboarding state
    resetOnboarding: (state) => {
      state.basicData = {
        averageCycleLength: 28,
        periodDuration: 5,
      };
      state.questionsData = {};
      state.data = {
        averageCycleLength: 28,
        periodDuration: 5,
      };
      state.currentQuestionIndex = 0;
      state.error = null;
      state.isCompleted = false;
      state.basicCompleted = false;
      state.questionsCompleted = false;
      state.lastSyncedAt = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Save basic onboarding
    builder
      .addCase(saveBasicOnboarding.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveBasicOnboarding.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lastSyncedAt = new Date().toISOString();
        if (action.payload?.data) {
          state.basicData = { ...state.basicData, ...action.payload.data };
          // Update combined data
          state.data = { ...state.data, ...action.payload.data };
        }
      })
      .addCase(saveBasicOnboarding.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Save onboarding questions
    builder
      .addCase(saveOnboardingQuestions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveOnboardingQuestions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lastSyncedAt = new Date().toISOString();
        if (action.payload?.data) {
          state.questionsData = { ...state.questionsData, ...action.payload.data };
          // Update combined data
          state.data = { ...state.data, ...action.payload.data };
        }
      })
      .addCase(saveOnboardingQuestions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Load basic onboarding
    builder
      .addCase(loadBasicOnboarding.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadBasicOnboarding.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.data) {
          state.basicData = action.payload.data;
          // Update combined data
          state.data = { ...state.data, ...action.payload.data };
        }
      })
      .addCase(loadBasicOnboarding.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Load onboarding questions
    builder
      .addCase(loadOnboardingQuestions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadOnboardingQuestions.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.data) {
          state.questionsData = action.payload.data;
          // Update combined data
          state.data = { ...state.data, ...action.payload.data };
        }
      })
      .addCase(loadOnboardingQuestions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Complete basic onboarding
    builder
      .addCase(completeBasicOnboarding.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(completeBasicOnboarding.fulfilled, (state) => {
        state.isLoading = false;
        state.basicCompleted = true;
        state.lastSyncedAt = new Date().toISOString();
      })
      .addCase(completeBasicOnboarding.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Complete onboarding questions
    builder
      .addCase(completeOnboardingQuestions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(completeOnboardingQuestions.fulfilled, (state) => {
        state.isLoading = false;
        state.questionsCompleted = true;
        state.isCompleted = state.basicCompleted && state.questionsCompleted;
        state.lastSyncedAt = new Date().toISOString();
      })
      .addCase(completeOnboardingQuestions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  updateField,
  updateFields,
  setCurrentQuestionIndex,
  resetOnboarding,
  clearError,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
