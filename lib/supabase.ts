import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { appConfig } from './config';

const secureStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(
  appConfig.supabaseUrl,
  appConfig.supabaseAnonKey,
  {
    auth: {
      storage: secureStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

export async function saveRefreshToken(token: string) {
  await SecureStore.setItemAsync('supabase_refresh_token', token);
}
export async function getRefreshToken() {
  return SecureStore.getItemAsync('supabase_refresh_token');
}
export async function deleteRefreshToken() {
  return SecureStore.deleteItemAsync('supabase_refresh_token');
}

// Database types
export interface CycleEntry {
  id?: string;
  user_id?: string;
  date: string;
  is_period: boolean;
  symptoms?: {
    mood: number;
    cramps: number;
    energy: number;
  };
  created_at?: string;
  updated_at?: string;
}

export interface FoodEntry {
  id?: string;
  user_id?: string;
  date: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  created_at?: string;
  updated_at?: string;
}

export interface ExerciseEntry {
  id?: string;
  user_id?: string;
  date: string;
  name: string;
  duration: number;
  calories: number;
  type: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  id?: string;
  user_id?: string;
  age: number;
  date_of_birth?: string;
  average_cycle_length: number;
  last_period_start?: string;
  wellness_goals: string[];
  daily_calorie_goal: number;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  created_at?: string;
  updated_at?: string;
}


