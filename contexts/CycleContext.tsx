import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SupabaseService } from '../services/supabaseService';

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

export interface CycleEntry {
  date: string;
  isPeriod: boolean;
  symptoms?: {
    mood: number; // 1-5 scale
    cramps: number; // 1-5 scale
    energy: number; // 1-5 scale
  };
}

export interface FoodEntry {
  id: string;
  date: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUri?: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface ExerciseEntry {
  id: string;
  date: string;
  name: string;
  duration: number; // in minutes
  calories: number;
  type: string;
  notes?: string;
}

export interface MealPlan {
  id: string;
  name: string;
  description: string;
  meals: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snacks: string[];
  };
  totalCalories: number;
  phase: CyclePhase;
}

export interface UserProfile {
  age: number;
  dateOfBirth?: string; // DD-MM-YYYY format
  averageCycleLength: number;
  lastPeriodStart?: string;
  wellnessGoals: string[];
  dailyCalorieGoal: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}

interface CycleState {
  entries: CycleEntry[];
  foodEntries: FoodEntry[];
  exerciseEntries: ExerciseEntry[];
  profile: UserProfile;
  currentPhase: CyclePhase;
  cycleDay: number;
  nextPeriodDate: string | null;
}

type CycleAction =
  | { type: 'LOAD_DATA'; payload: Partial<CycleState> }
  | { type: 'ADD_ENTRY'; payload: CycleEntry }
  | { type: 'ADD_FOOD_ENTRY'; payload: FoodEntry }
  | { type: 'ADD_EXERCISE_ENTRY'; payload: ExerciseEntry }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'UPDATE_PHASE'; payload: { phase: CyclePhase; cycleDay: number; nextPeriod: string | null } };

const initialState: CycleState = {
  entries: [],
  foodEntries: [],
  exerciseEntries: [],
  profile: {
    age: 25,
    averageCycleLength: 28,
    wellnessGoals: [],
    dailyCalorieGoal: 2000,
    activityLevel: 'moderate',
  },
  currentPhase: 'follicular',
  cycleDay: 1,
  nextPeriodDate: null,
};

function cycleReducer(state: CycleState, action: CycleAction): CycleState {
  switch (action.type) {
    case 'LOAD_DATA':
      return { ...state, ...action.payload };
    case 'ADD_ENTRY':
      const newEntry = action.payload;
      const updatedEntries = [...state.entries, newEntry];
      
      // If this is a period entry, update the last period start date
      let updatedProfile = state.profile;
      if (newEntry.isPeriod) {
        updatedProfile = {
          ...state.profile,
          lastPeriodStart: newEntry.date,
        };
      }
      
      return { 
        ...state, 
        entries: updatedEntries,
        profile: updatedProfile
      };
    case 'ADD_FOOD_ENTRY':
      return { ...state, foodEntries: [...state.foodEntries, action.payload] };
    case 'ADD_EXERCISE_ENTRY':
      return { ...state, exerciseEntries: [...state.exerciseEntries, action.payload] };
    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.payload } };
    case 'UPDATE_PHASE':
      return {
        ...state,
        currentPhase: action.payload.phase,
        cycleDay: action.payload.cycleDay,
        nextPeriodDate: action.payload.nextPeriod,
      };
    default:
      return state;
  }
}

const CycleContext = createContext<{
  state: CycleState;
  dispatch: React.Dispatch<CycleAction>;
  calculatePhase: () => void;
  saveData: () => void;
  syncToSupabase: () => Promise<void>;
  loadFromSupabase: () => Promise<void>;
} | null>(null);

export function CycleProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cycleReducer, initialState);

  const calculatePhase = () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Find the most recent period entry
    const periodEntries = state.entries
      .filter(entry => entry.isPeriod)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (periodEntries.length === 0) {
      // No period data, use profile's last period start
      const lastPeriod = state.profile.lastPeriodStart;
      if (!lastPeriod) return;
      
      const lastPeriodDate = new Date(lastPeriod);
      const daysSinceLastPeriod = Math.floor((new Date().getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const cycleDay = (daysSinceLastPeriod % state.profile.averageCycleLength) + 1;
      let phase: CyclePhase;

      if (cycleDay >= 1 && cycleDay <= 5) {
        phase = 'menstrual';
      } else if (cycleDay >= 6 && cycleDay <= 13) {
        phase = 'follicular';
      } else if (cycleDay >= 14 && cycleDay <= 16) {
        phase = 'ovulatory';
      } else {
        phase = 'luteal';
      }

      const daysUntilNextPeriod = state.profile.averageCycleLength - cycleDay + 1;
      const nextPeriodDate = new Date();
      nextPeriodDate.setDate(nextPeriodDate.getDate() + daysUntilNextPeriod);

      dispatch({
        type: 'UPDATE_PHASE',
        payload: {
          phase,
          cycleDay,
          nextPeriod: nextPeriodDate.toISOString().split('T')[0],
        },
      });
      return;
    }

    // Use actual period log data
    const mostRecentPeriod = periodEntries[0];
    const lastPeriodDate = new Date(mostRecentPeriod.date);
    const todayDate = new Date(today);
    
    const daysSinceLastPeriod = Math.floor((todayDate.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let cycleDay = daysSinceLastPeriod + 1;
    let phase: CyclePhase;

    // Determine phase based on cycle day
    if (cycleDay >= 1 && cycleDay <= 5) {
      phase = 'menstrual';
    } else if (cycleDay >= 6 && cycleDay <= 13) {
      phase = 'follicular';
    } else if (cycleDay >= 14 && cycleDay <= 16) {
      phase = 'ovulatory';
    } else if (cycleDay >= 17 && cycleDay <= 28) {
      phase = 'luteal';
    } else {
      // If cycle is longer than expected, assume we're in a new cycle
      cycleDay = (cycleDay % state.profile.averageCycleLength) + 1;
      if (cycleDay >= 1 && cycleDay <= 5) {
        phase = 'menstrual';
      } else if (cycleDay >= 6 && cycleDay <= 13) {
        phase = 'follicular';
      } else if (cycleDay >= 14 && cycleDay <= 16) {
        phase = 'ovulatory';
      } else {
        phase = 'luteal';
      }
    }

    // Calculate next period date
    const daysUntilNextPeriod = state.profile.averageCycleLength - cycleDay + 1;
    const nextPeriodDate = new Date(todayDate);
    nextPeriodDate.setDate(nextPeriodDate.getDate() + daysUntilNextPeriod);

    dispatch({
      type: 'UPDATE_PHASE',
      payload: {
        phase,
        cycleDay,
        nextPeriod: nextPeriodDate.toISOString().split('T')[0],
      },
    });
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('cycleData', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const loadData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('cycleData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: 'LOAD_DATA', payload: parsedData });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    calculatePhase();
  }, [state.profile.lastPeriodStart, state.profile.averageCycleLength, state.entries]);

  useEffect(() => {
    saveData();
  }, [state]);

  const syncToSupabase = async () => {
    try {
      const profileData = {
        age: state.profile.age,
        date_of_birth: state.profile.dateOfBirth,
        average_cycle_length: state.profile.averageCycleLength,
        last_period_start: state.profile.lastPeriodStart,
        wellness_goals: state.profile.wellnessGoals,
        daily_calorie_goal: state.profile.dailyCalorieGoal,
        activity_level: state.profile.activityLevel,
      };

      await SupabaseService.syncAllData(
        state.entries,
        state.foodEntries,
        profileData
      );
      
      console.log('Data synced to Supabase successfully');
    } catch (error) {
      console.error('Error syncing to Supabase:', error);
    }
  };

  const loadFromSupabase = async () => {
    try {
      // Load cycle entries
      const cycleData = await SupabaseService.getCycleEntries();
      if (cycleData) {
        const transformedEntries = cycleData.map(entry => ({
          date: entry.date,
          isPeriod: entry.is_period,
          symptoms: entry.symptoms,
        }));
        dispatch({ type: 'LOAD_DATA', payload: { entries: transformedEntries } });
      }

      // Load food entries
      const foodData = await SupabaseService.getFoodEntries();
      if (foodData) {
        const transformedFoodEntries = foodData.map(entry => ({
          id: entry.id,
          date: entry.date,
          name: entry.name,
          calories: entry.calories,
          protein: entry.protein,
          carbs: entry.carbs,
          fat: entry.fat,
          mealType: entry.meal_type,
        }));
        dispatch({ type: 'LOAD_DATA', payload: { foodEntries: transformedFoodEntries } });
      }

      // Load profile
      const profileData = await SupabaseService.getUserProfile();
      if (profileData) {
        const transformedProfile = {
          age: profileData.age,
          dateOfBirth: profileData.date_of_birth,
          averageCycleLength: profileData.average_cycle_length,
          lastPeriodStart: profileData.last_period_start,
          wellnessGoals: profileData.wellness_goals,
          dailyCalorieGoal: profileData.daily_calorie_goal,
          activityLevel: profileData.activity_level,
        };
        dispatch({ type: 'LOAD_DATA', payload: { profile: transformedProfile } });
      }
      
      console.log('Data loaded from Supabase successfully');
    } catch (error) {
      console.error('Error loading from Supabase:', error);
    }
  };

  return (
    <CycleContext.Provider value={{ state, dispatch, calculatePhase, saveData, syncToSupabase, loadFromSupabase }}>
      {children}
    </CycleContext.Provider>
  );
}

export function useCycle() {
  const context = useContext(CycleContext);
  if (!context) {
    throw new Error('useCycle must be used within a CycleProvider');
  }
  return context;
}