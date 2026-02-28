import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';

// ===========================
// Types
// ===========================

export type ExerciseCategory = 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core' | 'cardio' | 'yoga' | 'pilates' | 'dance';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type CyclePhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

export interface Exercise {
  id: string;
  name: string;
  description?: string | null;
  category: ExerciseCategory;
  instructions?: string[] | null;
  primaryMuscles?: string[] | null;
  secondaryMuscles?: string[] | null;
  equipment?: string[] | null;
  difficulty?: Difficulty | null;
  durationMinutes?: number | null;
  caloriesPerMinute?: number | null;
  phaseRecommendations?: CyclePhase[] | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  isActive: boolean;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutSet {
  id: string;
  weight: number;
  reps: number;
  completed?: boolean;
  restSeconds?: number;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  category?: string;
  sets: WorkoutSet[];
  restTimer?: number;
  exercise?: Exercise | null;
}

export interface WorkoutTemplate {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  category?: string | null;
  difficulty?: Difficulty | null;
  estimatedDurationMinutes?: number | null;
  isPublic: boolean;
  isSystemTemplate: boolean;
  exercises: WorkoutExercise[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  templateId?: string | null;
  templateName?: string | null;
  date: string; // ISO date (yyyy-mm-dd)
  startTime?: string | null;
  endTime?: string | null;
  durationMinutes?: number | null;
  exercises: WorkoutExercise[];
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  notes?: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseEntry {
  id: string;
  userId: string;
  exerciseId: string;
  exerciseName: string;
  date: string; // ISO date (yyyy-mm-dd)
  durationMinutes?: number | null;
  caloriesBurned?: number | null;
  distanceKm?: number | null;
  notes?: string | null;
  exercise?: Exercise | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutAnalytics {
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
  strengthTraining: {
    totalWorkouts: number;
    totalVolume: number;
    totalSets: number;
    totalReps: number;
    totalDurationMinutes: number;
    avgVolumePerWorkout: number;
    workoutsPerWeek: number;
    volumeProgression: number; // percentage
  };
  cardio: {
    totalSessions: number;
    totalDurationMinutes: number;
    totalCaloriesBurned: number;
    totalDistanceKm: number;
    avgDurationPerSession: number;
  };
  overall: {
    totalWorkoutDays: number;
    totalActiveDays: number;
  };
}

interface WorkoutState {
  // Exercise Library
  exercises: Exercise[];
  loadingExercises: boolean;
  exerciseError: string | null;
  selectedExercise: Exercise | null;

  // Workout Templates
  templates: WorkoutTemplate[];
  loadingTemplates: boolean;
  templateError: string | null;
  selectedTemplate: WorkoutTemplate | null;

  // Workout Sessions
  sessions: WorkoutSession[];
  loadingSessions: boolean;
  sessionError: string | null;
  currentSession: WorkoutSession | null;
  isWorkoutActive: boolean;

  // Exercise Entries (Cardio/Yoga)
  exerciseEntries: ExerciseEntry[];
  loadingEntries: boolean;
  entryError: string | null;

  // Analytics
  analytics: WorkoutAnalytics | null;
  loadingAnalytics: boolean;
  analyticsError: string | null;
}

const initialState: WorkoutState = {
  exercises: [],
  loadingExercises: false,
  exerciseError: null,
  selectedExercise: null,

  templates: [],
  loadingTemplates: false,
  templateError: null,
  selectedTemplate: null,

  sessions: [],
  loadingSessions: false,
  sessionError: null,
  currentSession: null,
  isWorkoutActive: false,

  exerciseEntries: [],
  loadingEntries: false,
  entryError: null,

  analytics: null,
  loadingAnalytics: false,
  analyticsError: null,
};

// ===========================
// Exercise Library Thunks
// ===========================

export const fetchExercises = createAsyncThunk<
  Exercise[],
  { category?: ExerciseCategory; difficulty?: Difficulty; search?: string; phase?: CyclePhase; limit?: number; offset?: number },
  { rejectValue: string }
>('workout/fetchExercises', async (params, { rejectWithValue }) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.category) queryParams.append('category', params.category);
    if (params.difficulty) queryParams.append('difficulty', params.difficulty);
    if (params.search) queryParams.append('search', params.search);
    if (params.phase) queryParams.append('phase', params.phase);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());

    const response = await api.get(`/workout/exercises?${queryParams.toString()}`);
    return response.data?.data ?? [];
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Failed to load exercises';
    return rejectWithValue(message);
  }
});

export const fetchExercise = createAsyncThunk<
  Exercise,
  string,
  { rejectValue: string }
>('workout/fetchExercise', async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/workout/exercises/${id}`);
    return response.data?.data;
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Failed to load exercise';
    return rejectWithValue(message);
  }
});

export const fetchRecommendedExercises = createAsyncThunk<
  Exercise[],
  { phase?: CyclePhase },
  { rejectValue: string }
>('workout/fetchRecommendedExercises', async (params, { rejectWithValue }) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.phase) queryParams.append('phase', params.phase);

    const response = await api.get(`/workout/exercises/recommended?${queryParams.toString()}`);
    return response.data?.data ?? [];
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Failed to load recommended exercises';
    return rejectWithValue(message);
  }
});

export const createExercise = createAsyncThunk<
  Exercise,
  Partial<Exercise>,
  { rejectValue: string }
>('workout/createExercise', async (exerciseData, { rejectWithValue }) => {
  try {
    const response = await api.post('/workout/exercises', exerciseData);
    return response.data?.data;
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Failed to create exercise';
    return rejectWithValue(message);
  }
});

export const updateExercise = createAsyncThunk<
  Exercise,
  { id: string; data: Partial<Exercise> },
  { rejectValue: string }
>('workout/updateExercise', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/workout/exercises/${id}`, data);
    return response.data?.data;
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Failed to update exercise';
    return rejectWithValue(message);
  }
});

export const deleteExercise = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('workout/deleteExercise', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/workout/exercises/${id}`);
    return id;
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Failed to delete exercise';
    return rejectWithValue(message);
  }
});

// ===========================
// Workout Template Thunks
// ===========================

export const fetchTemplates = createAsyncThunk<
  WorkoutTemplate[],
  { includeSystem?: boolean; category?: string; difficulty?: Difficulty },
  { rejectValue: string }
>('workout/fetchTemplates', async (params, { rejectWithValue }) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.includeSystem) queryParams.append('includeSystem', 'true');
    if (params.category) queryParams.append('category', params.category);
    if (params.difficulty) queryParams.append('difficulty', params.difficulty);

    const response = await api.get(`/workout/templates?${queryParams.toString()}`);
    return response.data?.data ?? [];
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Failed to load templates';
    return rejectWithValue(message);
  }
});

export const createTemplate = createAsyncThunk<
  WorkoutTemplate,
  Partial<WorkoutTemplate>,
  { rejectValue: string }
>('workout/createTemplate', async (templateData, { rejectWithValue }) => {
  try {
    const response = await api.post('/workout/templates', templateData);
    return response.data?.data;
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Failed to create template';
    return rejectWithValue(message);
  }
});

export const updateTemplate = createAsyncThunk<
  WorkoutTemplate,
  { id: string; data: Partial<WorkoutTemplate> },
  { rejectValue: string }
>('workout/updateTemplate', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/workout/templates/${id}`, data);
    return response.data?.data;
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Failed to update template';
    return rejectWithValue(message);
  }
});

export const deleteTemplate = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('workout/deleteTemplate', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/workout/templates/${id}`);
    return id;
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Failed to delete template';
    return rejectWithValue(message);
  }
});

// ===========================
// Workout Session Thunks
// ===========================

export const fetchSessions = createAsyncThunk<
  WorkoutSession[],
  { date?: string; startDate?: string; endDate?: string; completed?: boolean; limit?: number; offset?: number },
  { rejectValue: string }
>('workout/fetchSessions', async (params, { rejectWithValue }) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.date) queryParams.append('date', params.date);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.completed !== undefined) queryParams.append('completed', params.completed.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());

    const response = await api.get(`/workout/sessions?${queryParams.toString()}`);
    return response.data?.data ?? [];
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Failed to load sessions';
    return rejectWithValue(message);
  }
});

export const fetchSession = createAsyncThunk<
  WorkoutSession,
  string,
  { rejectValue: string }
>('workout/fetchSession', async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/workout/sessions/${id}`);
    return response.data?.data;
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Failed to load session';
    return rejectWithValue(message);
  }
});

export const createSession = createAsyncThunk<
  WorkoutSession,
  Partial<WorkoutSession>,
  { rejectValue: string }
>('workout/createSession', async (sessionData, { rejectWithValue }) => {
  try {
    const response = await api.post('/workout/sessions', sessionData);
    return response.data?.data;
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Failed to create session';
    return rejectWithValue(message);
  }
});

export const updateSession = createAsyncThunk<
  WorkoutSession,
  { id: string; data: Partial<WorkoutSession> },
  { rejectValue: string }
>('workout/updateSession', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/workout/sessions/${id}`, data);
    return response.data?.data;
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Failed to update session';
    return rejectWithValue(message);
  }
});

export const deleteSession = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('workout/deleteSession', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/workout/sessions/${id}`);
    return id;
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Failed to delete session';
    return rejectWithValue(message);
  }
});

// ===========================
// Exercise Entry Thunks (Cardio/Yoga)
// ===========================

export const fetchExerciseEntries = createAsyncThunk<
  ExerciseEntry[],
  { date?: string; startDate?: string; endDate?: string; exerciseId?: string; limit?: number; offset?: number },
  { rejectValue: string }
>('workout/fetchExerciseEntries', async (params, { rejectWithValue }) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.date) queryParams.append('date', params.date);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.exerciseId) queryParams.append('exerciseId', params.exerciseId);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());

    const response = await api.get(`/workout/exercises/entries?${queryParams.toString()}`);
    return response.data?.data ?? [];
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Failed to load exercise entries';
    return rejectWithValue(message);
  }
});

export const createExerciseEntry = createAsyncThunk<
  ExerciseEntry,
  Partial<ExerciseEntry>,
  { rejectValue: string }
>('workout/createExerciseEntry', async (entryData, { rejectWithValue }) => {
  try {
    const response = await api.post('/workout/exercises/entries', entryData);
    return response.data?.data;
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Failed to create exercise entry';
    return rejectWithValue(message);
  }
});

export const updateExerciseEntry = createAsyncThunk<
  ExerciseEntry,
  { id: string; data: Partial<ExerciseEntry> },
  { rejectValue: string }
>('workout/updateExerciseEntry', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/workout/exercises/entries/${id}`, data);
    return response.data?.data;
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Failed to update exercise entry';
    return rejectWithValue(message);
  }
});

export const deleteExerciseEntry = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('workout/deleteExerciseEntry', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/workout/exercises/entries/${id}`);
    return id;
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Failed to delete exercise entry';
    return rejectWithValue(message);
  }
});

// ===========================
// Analytics Thunks
// ===========================

export const fetchAnalytics = createAsyncThunk<
  WorkoutAnalytics,
  { startDate?: string; endDate?: string },
  { rejectValue: string }
>('workout/fetchAnalytics', async (params, { rejectWithValue }) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const response = await api.get(`/workout/analytics?${queryParams.toString()}`);
    return response.data?.data;
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Failed to load analytics';
    return rejectWithValue(message);
  }
});

// ===========================
// Slice
// ===========================

const workoutSlice = createSlice({
  name: 'workout',
  initialState,
  reducers: {
    // Exercise Library
    setSelectedExercise: (state, action: PayloadAction<Exercise | null>) => {
      state.selectedExercise = action.payload;
    },
    clearExerciseError: (state) => {
      state.exerciseError = null;
    },

    // Workout Templates
    setSelectedTemplate: (state, action: PayloadAction<WorkoutTemplate | null>) => {
      state.selectedTemplate = action.payload;
    },
    clearTemplateError: (state) => {
      state.templateError = null;
    },

    // Workout Sessions
    startWorkout: (state, action: PayloadAction<WorkoutTemplate>) => {
      const template = action.payload;
      const newSession: WorkoutSession = {
        id: `temp-${Date.now()}`,
        userId: '', // Will be set by backend
        templateId: template.id,
        templateName: template.name,
        date: new Date().toISOString().split('T')[0],
        startTime: new Date().toISOString(),
        exercises: template.exercises.map(ex => ({
          ...ex,
          sets: (ex.sets && Array.isArray(ex.sets) ? ex.sets : []).map(set => ({ ...set, completed: false })),
        })),
        totalVolume: 0,
        totalSets: 0,
        totalReps: 0,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.currentSession = newSession;
      state.isWorkoutActive = true;
    },
    updateCurrentSession: (state, action: PayloadAction<Partial<WorkoutSession>>) => {
      if (state.currentSession) {
        state.currentSession = { ...state.currentSession, ...action.payload };
      }
    },
    endWorkout: (state) => {
      state.currentSession = null;
      state.isWorkoutActive = false;
    },
    clearSessionError: (state) => {
      state.sessionError = null;
    },

    // Exercise Entries
    clearEntryError: (state) => {
      state.entryError = null;
    },

    // Analytics
    clearAnalyticsError: (state) => {
      state.analyticsError = null;
    },
  },
  extraReducers: (builder) => {
    // Exercise Library
    builder
      .addCase(fetchExercises.pending, (state) => {
        state.loadingExercises = true;
        state.exerciseError = null;
      })
      .addCase(fetchExercises.fulfilled, (state, action) => {
        state.loadingExercises = false;
        state.exercises = action.payload;
      })
      .addCase(fetchExercises.rejected, (state, action) => {
        state.loadingExercises = false;
        state.exerciseError = action.payload || 'Failed to load exercises';
      })
      .addCase(fetchExercise.fulfilled, (state, action) => {
        state.selectedExercise = action.payload;
      })
      .addCase(fetchRecommendedExercises.fulfilled, (state, action) => {
        // Merge recommended exercises with existing exercises
        const existingIds = new Set(state.exercises.map(e => e.id));
        const newExercises = action.payload.filter(e => !existingIds.has(e.id));
        state.exercises = [...state.exercises, ...newExercises];
      })
      .addCase(createExercise.fulfilled, (state, action) => {
        state.exercises.push(action.payload);
      })
      .addCase(updateExercise.fulfilled, (state, action) => {
        const index = state.exercises.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.exercises[index] = action.payload;
        }
        if (state.selectedExercise?.id === action.payload.id) {
          state.selectedExercise = action.payload;
        }
      })
      .addCase(deleteExercise.fulfilled, (state, action) => {
        state.exercises = state.exercises.filter(e => e.id !== action.payload);
        if (state.selectedExercise?.id === action.payload) {
          state.selectedExercise = null;
        }
      });

    // Workout Templates
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.loadingTemplates = true;
        state.templateError = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loadingTemplates = false;
        state.templates = action.payload;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loadingTemplates = false;
        state.templateError = action.payload || 'Failed to load templates';
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.templates.push(action.payload);
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        const index = state.templates.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.templates[index] = action.payload;
        }
        if (state.selectedTemplate?.id === action.payload.id) {
          state.selectedTemplate = action.payload;
        }
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.templates = state.templates.filter(t => t.id !== action.payload);
        if (state.selectedTemplate?.id === action.payload) {
          state.selectedTemplate = null;
        }
      });

    // Workout Sessions
    builder
      .addCase(fetchSessions.pending, (state) => {
        state.loadingSessions = true;
        state.sessionError = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loadingSessions = false;
        state.sessions = action.payload;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.loadingSessions = false;
        state.sessionError = action.payload || 'Failed to load sessions';
      })
      .addCase(fetchSession.fulfilled, (state, action) => {
        const index = state.sessions.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.sessions[index] = action.payload;
        } else {
          state.sessions.push(action.payload);
        }
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.sessions.push(action.payload);
        state.currentSession = null;
        state.isWorkoutActive = false;
      })
      .addCase(updateSession.fulfilled, (state, action) => {
        const index = state.sessions.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.sessions[index] = action.payload;
        }
        if (state.currentSession?.id === action.payload.id) {
          state.currentSession = action.payload;
        }
      })
      .addCase(deleteSession.fulfilled, (state, action) => {
        state.sessions = state.sessions.filter(s => s.id !== action.payload);
        if (state.currentSession?.id === action.payload) {
          state.currentSession = null;
          state.isWorkoutActive = false;
        }
      });

    // Exercise Entries
    builder
      .addCase(fetchExerciseEntries.pending, (state) => {
        state.loadingEntries = true;
        state.entryError = null;
      })
      .addCase(fetchExerciseEntries.fulfilled, (state, action) => {
        state.loadingEntries = false;
        state.exerciseEntries = action.payload;
      })
      .addCase(fetchExerciseEntries.rejected, (state, action) => {
        state.loadingEntries = false;
        state.entryError = action.payload || 'Failed to load exercise entries';
      })
      .addCase(createExerciseEntry.fulfilled, (state, action) => {
        state.exerciseEntries.push(action.payload);
      })
      .addCase(updateExerciseEntry.fulfilled, (state, action) => {
        const index = state.exerciseEntries.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.exerciseEntries[index] = action.payload;
        }
      })
      .addCase(deleteExerciseEntry.fulfilled, (state, action) => {
        state.exerciseEntries = state.exerciseEntries.filter(e => e.id !== action.payload);
      });

    // Analytics
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.loadingAnalytics = true;
        state.analyticsError = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loadingAnalytics = false;
        state.analytics = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loadingAnalytics = false;
        state.analyticsError = action.payload || 'Failed to load analytics';
      });
  },
});

export const {
  setSelectedExercise,
  clearExerciseError,
  setSelectedTemplate,
  clearTemplateError,
  startWorkout,
  updateCurrentSession,
  endWorkout,
  clearSessionError,
  clearEntryError,
  clearAnalyticsError,
} = workoutSlice.actions;

export default workoutSlice.reducer;
