import { supabase } from '../lib/supabase';

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
}

export class SupabaseService {
  private static userId = 'user-123';

  // Cycle Entries
  static async saveCycleEntry(entry: Omit<CycleEntry, 'id' | 'user_id'>) {
    const { data, error } = await supabase
      .from('cycle_entries')
      .upsert({
        user_id: this.userId,
        date: entry.date,
        is_period: entry.is_period,
        symptoms: entry.symptoms,
      })
      .select();
    
    if (error) throw error;
    return data;
  }

  static async getCycleEntries() {
    const { data, error } = await supabase
      .from('cycle_entries')
      .select('*')
      .eq('user_id', this.userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // Food Entries
  static async saveFoodEntry(entry: Omit<FoodEntry, 'id' | 'user_id'>) {
    const { data, error } = await supabase
      .from('food_entries')
      .insert({
        user_id: this.userId,
        date: entry.date,
        name: entry.name,
        calories: entry.calories,
        protein: entry.protein,
        carbs: entry.carbs,
        fat: entry.fat,
        meal_type: entry.meal_type,
      })
      .select();
    
    if (error) throw error;
    return data;
  }

  static async getFoodEntries(date?: string) {
    let query = supabase
      .from('food_entries')
      .select('*')
      .eq('user_id', this.userId);
    
    if (date) {
      query = query.eq('date', date);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // User Profile
  static async saveUserProfile(profile: Omit<UserProfile, 'id' | 'user_id'>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: this.userId,
        age: profile.age,
        date_of_birth: profile.date_of_birth,
        average_cycle_length: profile.average_cycle_length,
        last_period_start: profile.last_period_start,
        wellness_goals: profile.wellness_goals,
        daily_calorie_goal: profile.daily_calorie_goal,
        activity_level: profile.activity_level,
      })
      .select();
    
    if (error) throw error;
    return data;
  }

  static async getUserProfile() {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', this.userId)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Sync all data
  static async syncAllData(cycleData: any, foodData: any, profileData: any) {
    try {
      // Save profile first
      if (profileData) {
        await this.saveUserProfile(profileData);
      }

      // Save cycle entries
      if (cycleData && cycleData.length > 0) {
        for (const entry of cycleData) {
          await this.saveCycleEntry({
            date: entry.date,
            is_period: entry.isPeriod,
            symptoms: entry.symptoms,
          });
        }
      }

      // Save food entries
      if (foodData && foodData.length > 0) {
        for (const entry of foodData) {
          await this.saveFoodEntry({
            date: entry.date,
            name: entry.name,
            calories: entry.calories,
            protein: entry.protein,
            carbs: entry.carbs,
            fat: entry.fat,
            meal_type: entry.mealType,
          });
        }
      }

      console.log('All data synced to Supabase successfully');
      return true;
    } catch (error) {
      console.error('Error syncing data to Supabase:', error);
      return false;
    }
  }
}


