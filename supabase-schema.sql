-- DocI App Database Schema for Supabase

-- Enable RLS (Row Level Security)
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    age INTEGER NOT NULL DEFAULT 25,
    date_of_birth TEXT,
    average_cycle_length INTEGER NOT NULL DEFAULT 28,
    last_period_start TEXT,
    wellness_goals TEXT[] DEFAULT '{}',
    daily_calorie_goal INTEGER NOT NULL DEFAULT 2000,
    activity_level TEXT NOT NULL DEFAULT 'moderate' CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cycle_entries table
CREATE TABLE IF NOT EXISTS cycle_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    date DATE NOT NULL,
    is_period BOOLEAN NOT NULL DEFAULT FALSE,
    symptoms JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Create food_entries table
CREATE TABLE IF NOT EXISTS food_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    date DATE NOT NULL,
    name TEXT NOT NULL,
    calories INTEGER NOT NULL DEFAULT 0,
    protein DECIMAL(5,2) NOT NULL DEFAULT 0,
    carbs DECIMAL(5,2) NOT NULL DEFAULT 0,
    fat DECIMAL(5,2) NOT NULL DEFAULT 0,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exercise_entries table
CREATE TABLE IF NOT EXISTS exercise_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    date DATE NOT NULL,
    name TEXT NOT NULL,
    duration INTEGER NOT NULL DEFAULT 0, -- in minutes
    calories INTEGER NOT NULL DEFAULT 0,
    type TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workout_sessions table
CREATE TABLE IF NOT EXISTS workout_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    template_id TEXT NOT NULL,
    template_name TEXT NOT NULL,
    date DATE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    exercises JSONB NOT NULL DEFAULT '[]',
    total_volume DECIMAL(10,2) NOT NULL DEFAULT 0,
    duration INTEGER NOT NULL DEFAULT 0, -- in minutes
    notes TEXT,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_cycle_entries_user_id ON cycle_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_cycle_entries_date ON cycle_entries(date);
CREATE INDEX IF NOT EXISTS idx_food_entries_user_id ON food_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_food_entries_date ON food_entries(date);
CREATE INDEX IF NOT EXISTS idx_exercise_entries_user_id ON exercise_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_entries_date ON exercise_entries(date);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_date ON workout_sessions(date);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations for now - you can restrict later)
CREATE POLICY "Enable all operations for user_profiles" ON user_profiles FOR ALL USING (true);
CREATE POLICY "Enable all operations for cycle_entries" ON cycle_entries FOR ALL USING (true);
CREATE POLICY "Enable all operations for food_entries" ON food_entries FOR ALL USING (true);
CREATE POLICY "Enable all operations for exercise_entries" ON exercise_entries FOR ALL USING (true);
CREATE POLICY "Enable all operations for workout_sessions" ON workout_sessions FOR ALL USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cycle_entries_updated_at BEFORE UPDATE ON cycle_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_food_entries_updated_at BEFORE UPDATE ON food_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exercise_entries_updated_at BEFORE UPDATE ON exercise_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workout_sessions_updated_at BEFORE UPDATE ON workout_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO user_profiles (user_id, age, average_cycle_length, daily_calorie_goal, wellness_goals) 
VALUES ('user-123', 25, 28, 2000, ARRAY['Better mood tracking', 'Improved sleep', 'Exercise optimization'])
ON CONFLICT (user_id) DO UPDATE SET
    age = EXCLUDED.age,
    average_cycle_length = EXCLUDED.average_cycle_length,
    daily_calorie_goal = EXCLUDED.daily_calorie_goal,
    wellness_goals = EXCLUDED.wellness_goals,
    updated_at = NOW();
