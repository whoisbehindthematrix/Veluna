// store/slices/cycleSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { PredictionResult, AnalyticsSummary } from 'cyclia';
import { buildPredictionSnapshot, emptyPredictions } from '../utils/prediction';
import { buildPhaseInfo } from '../utils/phaseInfo';

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

export interface QuickNote {
  id?: string;
  date: string; // ISO date string
  title: string;
  icon?: string; // Icon name/emoji
  text: string;
  reminder: boolean;
  reminderTime?: string; // ISO datetime if reminder is true
  createdAt?: string;
  updatedAt?: string;
}

export interface CycleEntry {
  date: string; // ISO date string
  isPeriod: boolean;
  flowIntensity?: 'light' | 'medium' | 'heavy' | 'spotting';
  symptoms?: {
    mood: number; // 1-5 scale
    cramps: number; // 1-5 scale
    energy: number; // 1-5 scale
    bloating?: number;
    headache?: number;
    breastTenderness?: number;
  };
  notes?: string;
  quickNotes?: QuickNote[]; // Quick notes for this date
}

export interface PhaseInfo {
  name: CyclePhase;
  day: number; // Current day in cycle (1-28+)
  dayInPhase: number; // Day within this specific phase
  totalDaysInPhase: number; // Expected duration of this phase
  description: string;
  hormoneLevel: {
    estrogen: 'low' | 'rising' | 'high' | 'falling';
    progesterone: 'low' | 'rising' | 'high' | 'falling';
  };
  energyLevel: 'low' | 'moderate' | 'high' | 'peak';
  commonSymptoms: string[];
}

export interface PredictionData {
  nextPeriod: PredictionResult | null;
  ovulation: PredictionResult | null;
  fertileWindow: {
    start: string;
    peak: string;
    end: string;
    confidence: number;
  } | null;
  analytics: AnalyticsSummary | null;
  
}


export interface FoodLogEntry {
  id: string;
  date: string; // ISO date
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  imageUri?: string;
  note?: string;
}
export interface CycleState {
  currentPhase: PhaseInfo;
  cycleDay: number;
  entries: CycleEntry[];
  foodEntries: FoodLogEntry[];
  quickNotes: QuickNote[]; // Global quick notes storage
  predictions: PredictionData;
  profile: {
    averageCycleLength: number;
    lastPeriodStart: string | null;
    lutealPhaseDays: number;
    periodDuration: number;
  };
  dataQuality: 'insufficient' | 'low' | 'medium' | 'high';
  lastCalculated: string | null;
  lastSynced: string | null;
}

const initialState: CycleState = {
  currentPhase: {
    name: 'follicular',
    day: 1,
    dayInPhase: 1,
    totalDaysInPhase: 8,
    description: 'Preparing for ovulation',
    hormoneLevel: {
      estrogen: 'rising',
      progesterone: 'low',
    },
    energyLevel: 'moderate',
    commonSymptoms: ['increased energy', 'better mood'],
  },
  cycleDay: 1,
  entries: [],
  foodEntries: [],
  quickNotes: [],
  predictions: emptyPredictions,
  profile: {
    averageCycleLength: 28,
    lastPeriodStart: null,
    lutealPhaseDays: 14,
    periodDuration: 5,
  },
  dataQuality: 'insufficient',
  lastCalculated: null,
  lastSynced: null,
};

const cycleSlice = createSlice({
  name: 'cycle',
  initialState,
  reducers: {
    // Add a new entry (period or symptom log)
    addEntry: (state, action: PayloadAction<CycleEntry>) => {
      state.entries.push(action.payload);
      
      // If it's a period entry, update profile
      if (action.payload.isPeriod) {
        state.profile.lastPeriodStart = action.payload.date;
      }
      
      // Sort entries by date
      state.entries.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    },

    // Update existing entry
    updateEntry: (state, action: PayloadAction<{ date: string; updates: Partial<CycleEntry> }>) => {
      const index = state.entries.findIndex(e => e.date === action.payload.date);
      if (index !== -1) {
        state.entries[index] = { ...state.entries[index], ...action.payload.updates };
      }
    },

    // Delete entry
    deleteEntry: (state, action: PayloadAction<string>) => {
      state.entries = state.entries.filter(e => e.date !== action.payload);
    },

    addFoodEntry: (state, action: PayloadAction<FoodLogEntry>) => {
      state.foodEntries = [action.payload, ...state.foodEntries];
    },

    deleteFoodEntry: (state, action: PayloadAction<string>) => {
      state.foodEntries = state.foodEntries.filter(e => e.date !== action.payload);
    },
    updateFoodEntry: (
      state,
      action: PayloadAction<{
        date: string;
        updates: Partial<FoodLogEntry>;
      }>
    ) => {
      const index = state.foodEntries.findIndex(e => e.date === action.payload.date);
      if (index !== -1) {
        state.foodEntries[index] = { ...state.foodEntries[index], ...action.payload.updates };
      }
    },
    // Calculate cycle predictions using Cyclia
    calculatePredictions: (state) => {
      const { predictions, dataQuality, averageCycleLength } =
        buildPredictionSnapshot(state.entries, state.profile);

      state.predictions = predictions;
      state.profile.averageCycleLength = averageCycleLength;
      state.dataQuality = dataQuality;
      state.lastCalculated = new Date().toISOString();
    },

    // Update current phase based on cycle day
    updateCurrentPhase: (state) => {
      const today = new Date().toISOString().split('T')[0];
      
      // Find last period start
      const lastPeriod = state.profile.lastPeriodStart || 
        state.entries.filter(e => e.isPeriod).sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0]?.date;

      if (!lastPeriod) {
        return;
      }

      const lastPeriodDate = new Date(lastPeriod);
      const todayDate = new Date(today);
      
      const daysSince = Math.floor(
        (todayDate.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      let cycleDay = daysSince + 1;
      
      // Handle cycle overflow
      if (cycleDay > state.profile.averageCycleLength) {
        cycleDay = ((cycleDay - 1) % state.profile.averageCycleLength) + 1;
      }

      state.cycleDay = cycleDay;
      state.currentPhase = buildPhaseInfo(
        cycleDay,
        state.profile.averageCycleLength,
        state.profile.periodDuration
      );
    },

    // Update profile settings
    updateProfile: (state, action: PayloadAction<Partial<CycleState['profile']>>) => {
      state.profile = { ...state.profile, ...action.payload };
    },

    // Load all data (from AsyncStorage or Supabase)
    loadCycleData: (state, action: PayloadAction<Partial<CycleState>>) => {
      return { ...state, ...action.payload };
    },

    // Mark as synced
    markSynced: (state) => {
      state.lastSynced = new Date().toISOString();
    },

    // Reset cycle data
    resetCycle: () => initialState,

    // Quick Notes Actions
    addQuickNote: (state, action: PayloadAction<QuickNote>) => {
      const note = {
        ...action.payload,
        id: action.payload.id || `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: action.payload.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.quickNotes.push(note);
      
      // Also add to the entry for that date if it exists
      const entryIndex = state.entries.findIndex(e => e.date === note.date);
      if (entryIndex !== -1) {
        if (!state.entries[entryIndex].quickNotes) {
          state.entries[entryIndex].quickNotes = [];
        }
        state.entries[entryIndex].quickNotes!.push(note);
      }
    },

    updateQuickNote: (state, action: PayloadAction<{ id: string; updates: Partial<QuickNote> }>) => {
      const noteIndex = state.quickNotes.findIndex(n => n.id === action.payload.id);
      if (noteIndex !== -1) {
        state.quickNotes[noteIndex] = {
          ...state.quickNotes[noteIndex],
          ...action.payload.updates,
          updatedAt: new Date().toISOString(),
        };
        
        // Update in entries as well
        state.entries.forEach(entry => {
          if (entry.quickNotes) {
            const entryNoteIndex = entry.quickNotes.findIndex(n => n.id === action.payload.id);
            if (entryNoteIndex !== -1) {
              entry.quickNotes[entryNoteIndex] = {
                ...entry.quickNotes[entryNoteIndex],
                ...action.payload.updates,
                updatedAt: new Date().toISOString(),
              };
            }
          }
        });
      }
    },

    deleteQuickNote: (state, action: PayloadAction<string>) => {
      state.quickNotes = state.quickNotes.filter(n => n.id !== action.payload);
      
      // Remove from entries as well
      state.entries.forEach(entry => {
        if (entry.quickNotes) {
          entry.quickNotes = entry.quickNotes.filter(n => n.id !== action.payload);
        }
      });
    },

    // Bulk load quick notes (for sync)
    loadQuickNotes: (state, action: PayloadAction<QuickNote[]>) => {
      state.quickNotes = action.payload;
      
      // Update entries with quick notes
      action.payload.forEach(note => {
        const entryIndex = state.entries.findIndex(e => e.date === note.date);
        if (entryIndex !== -1) {
          if (!state.entries[entryIndex].quickNotes) {
            state.entries[entryIndex].quickNotes = [];
          }
          const existingNoteIndex = state.entries[entryIndex].quickNotes!.findIndex(n => n.id === note.id);
          if (existingNoteIndex !== -1) {
            state.entries[entryIndex].quickNotes![existingNoteIndex] = note;
          } else {
            state.entries[entryIndex].quickNotes!.push(note);
          }
        }
      });
    },
  
  },
});

export const {
  addEntry,
  updateEntry,
  deleteEntry,
  calculatePredictions,
  updateCurrentPhase,
  updateProfile,
  loadCycleData,
  markSynced,
  resetCycle,
  addFoodEntry,
  deleteFoodEntry,
  updateFoodEntry,
  addQuickNote,
  updateQuickNote,
  deleteQuickNote,
  loadQuickNotes,
} = cycleSlice.actions;

export default cycleSlice.reducer;
