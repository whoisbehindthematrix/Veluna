// src/store/slices/userProfileSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { profileApi } from '@/services/apiService';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type UnitsSystem = 'metric' | 'imperial';
export type ThemePreference = 'light' | 'dark' | 'auto';
export type NotificationPreferences = {
  cycleReminders: boolean;
  periodPredictions: boolean;
  workoutReminders: boolean;
  nutritionTips: boolean;
  wellnessInsights: boolean;
};

export interface UserProfile {
  // Core Identity
  id?: string;
  userId: string; // From auth.user.id
  displayName?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  
  // Personal Details
  dateOfBirth?: string; // ISO format: YYYY-MM-DD
  age?: number; // Calculated from DOB
  gender?: string;
  timezone?: string;
  
  // Health & Cycle
  averageCycleLength: number;
  lastPeriodStart?: string | null;
  periodDuration: number;
  lutealPhaseDays: number;
  menopauseStatus?: 'pre' | 'peri' | 'post' | null;
  
  // Wellness Goals (expandable array)
  wellnessGoals: string[];
  
  // Nutrition
  dailyCalorieGoal: number;
  activityLevel: ActivityLevel;
  height?: number; // in cm
  weight?: number; // in kg
  targetWeight?: number;
  unitsSystem: UnitsSystem;
  
  // Preferences
  theme: ThemePreference;
  notifications: NotificationPreferences;
  language?: string;
  
  // Privacy & Settings
  shareAnalytics: boolean;
  dataSharingEnabled: boolean;
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
  lastSyncedAt?: string;
  onboardingCompleted: boolean;
  appVersion?: string;
}

export interface UserProfileState {
  profile: UserProfile | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  isDirty: boolean; // Has unsaved changes
  lastSynced: string | null;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const defaultProfile: Partial<UserProfile> = {
  averageCycleLength: 28,
  periodDuration: 5,
  lutealPhaseDays: 14,
  wellnessGoals: [],
  dailyCalorieGoal: 2000,
  activityLevel: 'moderate',
  unitsSystem: 'metric',
  theme: 'auto',
  notifications: {
    cycleReminders: true,
    periodPredictions: true,
    workoutReminders: true,
    nutritionTips: true,
    wellnessInsights: true,
  },
  shareAnalytics: false,
  dataSharingEnabled: true,
  onboardingCompleted: false,
};

const initialState: UserProfileState = {
  profile: null,
  status: 'idle',
  error: null,
  isDirty: false,
  lastSynced: null,
};

// ============================================================================
// ASYNC THUNKS - Express Backend API Operations
// ============================================================================

/**
 * Load user profile from Express backend
 */
export const loadUserProfile = createAsyncThunk(
  'userProfile/loadUserProfile',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await profileApi.getProfile(userId);

      if (!response.success || !response.data) {
        // If no profile exists, return null (will trigger creation)
        return null;
      }

      // Transform API response to app format
      // Adjust field mapping based on your backend response structure
      const data = response.data;
      return {
        id: data.id,
        userId: data.userId || data.user_id,
        displayName: data.displayName || data.display_name,
        firstName: data.firstName || data.first_name,
        lastName: data.lastName || data.last_name,
        avatarUrl: data.avatarUrl || data.avatar_url,
        dateOfBirth: data.dateOfBirth || data.date_of_birth,
        age: data.age,
        gender: data.gender,
        timezone: data.timezone || 'UTC',
        averageCycleLength: data.averageCycleLength || data.average_cycle_length || 28,
        lastPeriodStart: data.lastPeriodStart || data.last_period_start,
        periodDuration: data.periodDuration || data.period_duration || 5,
        lutealPhaseDays: data.lutealPhaseDays || data.luteal_phase_days || 14,
        menopauseStatus: data.menopauseStatus || data.menopause_status,
        wellnessGoals: data.wellnessGoals || data.wellness_goals || [],
        dailyCalorieGoal: data.dailyCalorieGoal || data.daily_calorie_goal || 2000,
        activityLevel: data.activityLevel || data.activity_level || 'moderate',
        height: data.height,
        weight: data.weight,
        targetWeight: data.targetWeight || data.target_weight,
        unitsSystem: data.unitsSystem || data.units_system || 'metric',
        theme: data.theme || 'auto',
        notifications: data.notifications || defaultProfile.notifications,
        language: data.language || 'en',
        shareAnalytics: data.shareAnalytics ?? data.share_analytics ?? false,
        dataSharingEnabled: data.dataSharingEnabled ?? data.data_sharing_enabled ?? true,
        createdAt: data.createdAt || data.created_at,
        updatedAt: data.updatedAt || data.updated_at,
        lastSyncedAt: data.lastSyncedAt || data.last_synced_at,
        onboardingCompleted: data.onboardingCompleted ?? data.onboarding_completed ?? false,
        appVersion: data.appVersion || data.app_version,
      } as UserProfile;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to load profile');
    }
  }
);

/**
 * Save user profile to Express backend
 */
export const saveUserProfile = createAsyncThunk(
  'userProfile/saveUserProfile',
  async (profile: UserProfile, { rejectWithValue }) => {
    try {
      // Transform app format to API format
      // Adjust based on your backend expected structure
      const profileData = {
        userId: profile.userId,
        displayName: profile.displayName,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarUrl: profile.avatarUrl,
        dateOfBirth: profile.dateOfBirth,
        age: profile.age,
        gender: profile.gender,
        timezone: profile.timezone,
        averageCycleLength: profile.averageCycleLength,
        lastPeriodStart: profile.lastPeriodStart,
        periodDuration: profile.periodDuration,
        lutealPhaseDays: profile.lutealPhaseDays,
        menopauseStatus: profile.menopauseStatus,
        wellnessGoals: profile.wellnessGoals,
        dailyCalorieGoal: profile.dailyCalorieGoal,
        activityLevel: profile.activityLevel,
        height: profile.height,
        weight: profile.weight,
        targetWeight: profile.targetWeight,
        unitsSystem: profile.unitsSystem,
        theme: profile.theme,
        notifications: profile.notifications,
        language: profile.language,
        shareAnalytics: profile.shareAnalytics,
        dataSharingEnabled: profile.dataSharingEnabled,
        onboardingCompleted: profile.onboardingCompleted,
        appVersion: profile.appVersion,
      };

      const response = await profileApi.saveProfile(profile.userId, profileData);

      if (!response.success) {
        throw new Error(response.message || 'Failed to save profile');
      }

      return {
        ...profile,
        id: response.data?.id || profile.id,
        updatedAt: response.data?.updatedAt || response.data?.updated_at || new Date().toISOString(),
        lastSyncedAt: new Date().toISOString(),
      } as UserProfile;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to save profile');
    }
  }
);

/**
 * Update avatar image via Express backend
 */
export const updateAvatar = createAsyncThunk(
  'userProfile/updateAvatar',
  async ({ userId, imageUri }: { userId: string; imageUri: string }, { rejectWithValue }) => {
    try {
      const response = await profileApi.updateAvatar(userId, imageUri);

      if (!response.success) {
        throw new Error(response.message || 'Failed to update avatar');
      }

      // Return the avatar URL from response
      return response.data?.avatarUrl || response.data?.avatar_url || imageUri;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update avatar');
    }
  }
);

// ============================================================================
// SLICE
// ============================================================================

const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {
    // Update profile locally (marks as dirty)
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
        state.isDirty = true;
      }
    },

    // Set profile without marking as dirty (for syncing)
    setProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.profile = action.payload;
      state.isDirty = false;
    },

    // Reset profile state
    resetProfile: (state) => {
      state.profile = null;
      state.isDirty = false;
      state.error = null;
      state.lastSynced = null;
    },

    // Mark as clean (after successful sync)
    markClean: (state) => {
      state.isDirty = false;
      state.lastSynced = new Date().toISOString();
    },

    // Clear errors
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load Profile
      .addCase(loadUserProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
        state.isDirty = false;
        if (action.payload) {
          state.lastSynced = action.payload.lastSyncedAt || new Date().toISOString();
        }
      })
      .addCase(loadUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // Save Profile
      .addCase(saveUserProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(saveUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
        state.isDirty = false;
        state.lastSynced = action.payload.lastSyncedAt || new Date().toISOString();
      })
      .addCase(saveUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.isDirty = true; // Keep dirty flag if save failed
      })

      // Update Avatar
      .addCase(updateAvatar.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.avatarUrl = action.payload;
          state.isDirty = true;
        }
      })
      .addCase(updateAvatar.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { updateProfile, setProfile, resetProfile, markClean, clearError } = userProfileSlice.actions;
export default userProfileSlice.reducer;
