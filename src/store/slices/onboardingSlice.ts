/**
 * Onboarding Redux Slice
 * 
 * Manages comprehensive onboarding survey data with proper state management
 */

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { onboardingService } from '@/services/onboardingService';
import api from '@/lib/api';

// ============================================================================
// TYPES
// ============================================================================

export type WeightRange =
  | 'under_45'
  | '45_50'
  | '50_55'
  | '55_60'
  | '60_65'
  | '65_70'
  | '70_75'
  | '75_80'
  | '80_85'
  | '85_90'
  | '90_95'
  | '95_100'
  | '100_110'
  | '110_120'
  | '120_plus';

export type HeightRange =
  | 'under_4_10'
  | '4_10'
  | '4_11'
  | '5_0'
  | '5_1'
  | '5_2'
  | '5_3'
  | '5_4'
  | '5_5'
  | '5_6'
  | '5_7'
  | '5_8'
  | '5_9'
  | '5_10'
  | '5_11'
  | '6_0'
  | 'over_6_0';

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

export type CycleLength =
  | 'less_than_21'
  | '21_24'
  | '25_30'
  | '31_35'
  | 'longer_than_35'
  | 'irregular';

export type PeriodDuration = '1_3' | '4_6' | '7_plus';

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

export interface OnboardingData {
  // Section 1: Baseline Profile
  dateOfBirth?: string; // ISO date string
  weightRange?: WeightRange;
  heightRange?: HeightRange;
  reproductiveStage?: ReproductiveStage;
  healthGoal?: HealthGoal;

  // Section 2: Cycle Details
  birthControl?: BirthControl[]; // Multi-select
  cycleLength?: CycleLength;
  periodDuration?: PeriodDuration;

  // Section 3: Hormonal & Physical Symptoms
  medicalDiagnoses?: MedicalDiagnosis[]; // Multi-select
  physicalSymptoms?: PhysicalSymptom[]; // Multi-select (top 3)

  // Section 4: Mood & Mindset
  pmsMood?: PMSMood;
  stressLevel?: StressLevel;

  // Section 5: Nutrition & Weight
  foodStruggles?: FoodStruggle[]; // Multi-select
  dietaryLifestyle?: DietaryLifestyle;
}

export interface OnboardingState {
  data: OnboardingData;
  currentSection: number;
  isLoading: boolean;
  error: string | null;
  isCompleted: boolean;
  lastSyncedAt: string | null;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: OnboardingState = {
  data: {},
  currentSection: 1,
  isLoading: false,
  error: null,
  isCompleted: false,
  lastSyncedAt: null,
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

/**
 * Save onboarding data to backend
 */
export const saveOnboardingData = createAsyncThunk(
  'onboarding/saveData',
  async (data: OnboardingData, { rejectWithValue }) => {
    try {
      const response = await onboardingService.saveOnboardingData(data);
      return response;
    } catch (error: any) {
      console.error('Failed to save onboarding data:', error);
      return rejectWithValue(
        error?.response?.data?.message || 'Failed to save onboarding data'
      );
    }
  }
);

/**
 * Load onboarding data from backend
 */
export const loadOnboardingData = createAsyncThunk(
  'onboarding/loadData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await onboardingService.getOnboardingData();
      return response;
    } catch (error: any) {
      console.error('Failed to load onboarding data:', error);
      return rejectWithValue(
        error?.response?.data?.message || 'Failed to load onboarding data'
      );
    }
  }
);

/**
 * Complete onboarding and mark as finished
 */
export const completeOnboarding = createAsyncThunk(
  'onboarding/complete',
  async (_, { getState, rejectWithValue, dispatch }) => {
    try {
      const state = getState() as { onboarding: OnboardingState };
      const { data } = state.onboarding;

      // Save all data first
      console.log('💾 [completeOnboarding] Step 1: Saving onboarding data...');
      await dispatch(saveOnboardingData(data)).unwrap();
      console.log('✅ [completeOnboarding] Step 1: Data saved successfully');

      // Mark as completed - backend should update User.onboardingCompleted = true
      console.log('✅ [completeOnboarding] Step 2: Calling /onboarding/complete endpoint...');
      const response = await api.post('/onboarding/complete');
      console.log('✅ [completeOnboarding] Step 2: Response received:', {
        status: response.status,
        data: response.data,
        user: response.data?.user,
        onboardingCompleted: response.data?.user?.onboardingCompleted,
      });
      
      // The backend should return the updated user with onboardingCompleted: true
      // If not, we need to manually sync the user
      if (response.data?.user?.onboardingCompleted === false || 
          response.data?.user?.onboardingCompleted === undefined) {
        console.warn('⚠️ [completeOnboarding] Backend did not return onboardingCompleted: true');
        console.warn('⚠️ [completeOnboarding] Response:', response.data);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ [completeOnboarding] Failed to complete onboarding:', error);
      console.error('❌ [completeOnboarding] Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      return rejectWithValue(
        error?.response?.data?.message || 'Failed to complete onboarding'
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
    // Update specific field in onboarding data
    updateField: (
      state: OnboardingState,
      action: PayloadAction<{ field: keyof OnboardingData; value: any }>
    ) => {
      (state.data as any)[action.payload.field] = action.payload.value;
      state.error = null;
    },

    // Update multiple fields at once
    updateFields: (
      state: OnboardingState,
      action: PayloadAction<Partial<OnboardingData>>
    ) => {
      state.data = { ...state.data, ...action.payload };
      state.error = null;
    },

    // Update current section
    setCurrentSection: (state, action: PayloadAction<number>) => {
      state.currentSection = action.payload;
    },

    // Navigate to next section
    nextSection: (state) => {
      if (state.currentSection < 5) {
        state.currentSection += 1;
      }
    },

    // Navigate to previous section
    previousSection: (state) => {
      if (state.currentSection > 1) {
        state.currentSection -= 1;
      }
    },

    // Reset onboarding state
    resetOnboarding: (state) => {
      state.data = {};
      state.currentSection = 1;
      state.error = null;
      state.isCompleted = false;
      state.lastSyncedAt = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Save onboarding data
    builder
      .addCase(saveOnboardingData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveOnboardingData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lastSyncedAt = new Date().toISOString();
        // Merge response data if provided
        if (action.payload?.data) {
          state.data = { ...state.data, ...action.payload.data };
        }
      })
      .addCase(saveOnboardingData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Load onboarding data
    builder
      .addCase(loadOnboardingData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadOnboardingData.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.data) {
          state.data = action.payload.data;
        }
      })
      .addCase(loadOnboardingData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Complete onboarding
    builder
      .addCase(completeOnboarding.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(completeOnboarding.fulfilled, (state) => {
        state.isLoading = false;
        state.isCompleted = true;
        state.lastSyncedAt = new Date().toISOString();
      })
      .addCase(completeOnboarding.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  updateField,
  updateFields,
  setCurrentSection,
  nextSection,
  previousSection,
  resetOnboarding,
  clearError,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;

