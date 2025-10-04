import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iranxjzqzoknigoskdkn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyYW54anpxem9rbmlnb3NrZGtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MzUwMjYsImV4cCI6MjA3MzExMTAyNn0.zE7Bzd_6-gZLixFqbeYnXnSN09jPocCfMCNixJlfJ5A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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


