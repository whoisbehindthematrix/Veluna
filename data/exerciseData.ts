export interface Exercise {
  id: string;
  name: string;
  category: string;
  description: string;
  instructions: string[];
  duration: number; // in minutes
  caloriesBurned: number; // per session
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[];
  benefits: string[];
  phase: string[]; // which menstrual phases this exercise is good for
}

export const exercises: Exercise[] = [
  // Gentle/Restorative (Menstrual Phase)
  {
    id: 'gentle-yoga',
    name: 'Gentle Yoga Flow',
    category: 'yoga',
    description: 'A slow, restorative yoga sequence perfect for menstrual phase',
    instructions: [
      'Start in child\'s pose for 2 minutes',
      'Move to cat-cow stretches (10 rounds)',
      'Gentle spinal twists on each side',
      'Legs up the wall pose for 5 minutes',
      'End in savasana for 5 minutes'
    ],
    duration: 20,
    caloriesBurned: 80,
    difficulty: 'beginner',
    equipment: ['yoga mat'],
    benefits: ['Reduces cramps', 'Improves circulation', 'Stress relief'],
    phase: ['menstrual', 'luteal']
  },
  {
    id: 'walking',
    name: 'Mindful Walking',
    category: 'cardio',
    description: 'A gentle walk focusing on breathing and mindfulness',
    instructions: [
      'Start with 5 minutes of slow walking',
      'Focus on deep breathing',
      'Maintain a comfortable pace',
      'Pay attention to your surroundings',
      'Cool down with gentle stretching'
    ],
    duration: 30,
    caloriesBurned: 120,
    difficulty: 'beginner',
    equipment: ['comfortable shoes'],
    benefits: ['Low impact', 'Mood boost', 'Fresh air'],
    phase: ['menstrual', 'follicular', 'luteal']
  },
  
  // Strength Training (Follicular Phase)
  {
    id: 'bodyweight-strength',
    name: 'Bodyweight Strength Circuit',
    category: 'strength',
    description: 'A full-body strength workout using your own body weight',
    instructions: [
      'Warm up with arm circles and leg swings',
      'Push-ups: 3 sets of 8-12 reps',
      'Squats: 3 sets of 12-15 reps',
      'Lunges: 3 sets of 10 per leg',
      'Plank: 3 sets of 30-60 seconds',
      'Cool down with stretching'
    ],
    duration: 25,
    caloriesBurned: 180,
    difficulty: 'intermediate',
    equipment: ['none'],
    benefits: ['Builds strength', 'Improves bone density', 'Boosts metabolism'],
    phase: ['follicular', 'ovulatory']
  },
  {
    id: 'dumbbell-workout',
    name: 'Dumbbell Full Body',
    category: 'strength',
    description: 'A comprehensive strength training session with dumbbells',
    instructions: [
      'Warm up with light cardio for 5 minutes',
      'Dumbbell squats: 3 sets of 12 reps',
      'Chest press: 3 sets of 10 reps',
      'Bent-over rows: 3 sets of 12 reps',
      'Shoulder press: 3 sets of 10 reps',
      'Bicep curls: 3 sets of 12 reps',
      'Cool down with stretching'
    ],
    duration: 35,
    caloriesBurned: 250,
    difficulty: 'intermediate',
    equipment: ['dumbbells', 'bench (optional)'],
    benefits: ['Muscle building', 'Strength gains', 'Improved posture'],
    phase: ['follicular', 'ovulatory']
  },
  
  // High Intensity (Ovulatory Phase)
  {
    id: 'hiit-cardio',
    name: 'HIIT Cardio Blast',
    category: 'cardio',
    description: 'High-intensity interval training for maximum calorie burn',
    instructions: [
      'Warm up with light jogging for 5 minutes',
      'Jumping jacks: 30 seconds on, 30 seconds rest',
      'Burpees: 30 seconds on, 30 seconds rest',
      'Mountain climbers: 30 seconds on, 30 seconds rest',
      'High knees: 30 seconds on, 30 seconds rest',
      'Repeat circuit 4 times',
      'Cool down with walking and stretching'
    ],
    duration: 20,
    caloriesBurned: 300,
    difficulty: 'advanced',
    equipment: ['none'],
    benefits: ['High calorie burn', 'Improves cardiovascular health', 'Time efficient'],
    phase: ['ovulatory']
  },
  {
    id: 'running',
    name: 'Interval Running',
    category: 'cardio',
    description: 'Running workout with speed intervals',
    instructions: [
      'Warm up with 5 minutes easy jogging',
      'Run at moderate pace for 2 minutes',
      'Sprint for 30 seconds',
      'Recover with easy jog for 1 minute',
      'Repeat interval sequence 6 times',
      'Cool down with 5 minutes walking'
    ],
    duration: 30,
    caloriesBurned: 350,
    difficulty: 'intermediate',
    equipment: ['running shoes'],
    benefits: ['Cardiovascular fitness', 'Endurance building', 'Mental clarity'],
    phase: ['ovulatory', 'follicular']
  },
  
  // Moderate/Pilates (Luteal Phase)
  {
    id: 'pilates-core',
    name: 'Pilates Core Strengthening',
    category: 'pilates',
    description: 'Core-focused Pilates routine for stability and strength',
    instructions: [
      'Start with breathing exercises',
      'The Hundred: 100 pulses',
      'Single leg circles: 10 each direction per leg',
      'Rolling like a ball: 10 repetitions',
      'Single leg stretch: 10 per leg',
      'Double leg stretch: 10 repetitions',
      'End with spine stretch forward'
    ],
    duration: 25,
    caloriesBurned: 150,
    difficulty: 'intermediate',
    equipment: ['yoga mat'],
    benefits: ['Core strength', 'Posture improvement', 'Mind-body connection'],
    phase: ['luteal', 'follicular']
  },
  {
    id: 'yin-yoga',
    name: 'Yin Yoga for Hormonal Balance',
    category: 'yoga',
    description: 'Deep, passive stretches held for longer periods',
    instructions: [
      'Butterfly pose: hold for 5 minutes',
      'Dragon pose: 3 minutes each side',
      'Supported child\'s pose: 5 minutes',
      'Legs up the wall: 10 minutes',
      'Supported savasana: 10 minutes'
    ],
    duration: 45,
    caloriesBurned: 100,
    difficulty: 'beginner',
    equipment: ['yoga mat', 'bolster', 'blocks'],
    benefits: ['Deep relaxation', 'Hormone regulation', 'Stress reduction'],
    phase: ['luteal', 'menstrual']
  },
  
  // Dance/Fun Activities
  {
    id: 'dance-cardio',
    name: 'Dance Cardio Party',
    category: 'dance',
    description: 'Fun, energetic dance workout to your favorite music',
    instructions: [
      'Warm up with gentle movement',
      'Follow along with dance routines',
      'Include arm movements and footwork',
      'Add jumps and turns as energy allows',
      'Cool down with slow dancing'
    ],
    duration: 30,
    caloriesBurned: 200,
    difficulty: 'beginner',
    equipment: ['music', 'space to move'],
    benefits: ['Mood boost', 'Coordination', 'Fun factor'],
    phase: ['follicular', 'ovulatory']
  }
];

export const exerciseCategories = [
  { name: 'yoga', icon: '🧘‍♀️', color: '#8b5cf6' },
  { name: 'cardio', icon: '🏃‍♀️', color: '#ef4444' },
  { name: 'strength', icon: '💪', color: '#f97316' },
  { name: 'pilates', icon: '🤸‍♀️', color: '#06b6d4' },
  { name: 'dance', icon: '💃', color: '#ec4899' }
];