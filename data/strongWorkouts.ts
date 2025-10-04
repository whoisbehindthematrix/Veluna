export interface Exercise {
  id: string;
  name: string;
  category: 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core' | 'cardio';
  equipment: string[];
  instructions: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
}

export interface WorkoutSet {
  id: string;
  weight: number;
  reps: number;
  completed: boolean;
  restTime?: number; // in seconds
  notes?: string;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  sets: WorkoutSet[];
  restTimer: number; // default rest time in seconds
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  exercises: WorkoutExercise[];
  estimatedDuration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
}

export interface WorkoutSession {
  id: string;
  templateId: string;
  templateName: string;
  date: string;
  startTime: string;
  endTime?: string;
  exercises: WorkoutExercise[];
  totalVolume: number; // weight x reps
  duration: number; // in minutes
  notes?: string;
  completed: boolean;
}

export const exercises: Exercise[] = [
  // Chest
  {
    id: 'bench-press',
    name: 'Bench Press',
    category: 'chest',
    equipment: ['barbell', 'bench'],
    instructions: [
      'Lie flat on bench with feet firmly on ground',
      'Grip bar slightly wider than shoulder width',
      'Lower bar to chest with control',
      'Press bar up explosively',
      'Keep core tight throughout movement'
    ],
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Triceps', 'Front Delts']
  },
  {
    id: 'incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    category: 'chest',
    equipment: ['dumbbells', 'incline bench'],
    instructions: [
      'Set bench to 30-45 degree incline',
      'Hold dumbbells at chest level',
      'Press dumbbells up and slightly together',
      'Lower with control to starting position'
    ],
    primaryMuscles: ['Upper Chest'],
    secondaryMuscles: ['Front Delts', 'Triceps']
  },
  {
    id: 'push-ups',
    name: 'Push-ups',
    category: 'chest',
    equipment: [],
    instructions: [
      'Start in plank position',
      'Lower body until chest nearly touches ground',
      'Push back up to starting position',
      'Keep body in straight line throughout'
    ],
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Triceps', 'Core']
  },

  // Back
  {
    id: 'deadlift',
    name: 'Deadlift',
    category: 'back',
    equipment: ['barbell'],
    instructions: [
      'Stand with feet hip-width apart',
      'Grip bar with hands just outside legs',
      'Keep back straight, chest up',
      'Drive through heels to lift bar',
      'Stand tall, then lower with control'
    ],
    primaryMuscles: ['Lower Back', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Traps', 'Forearms']
  },
  {
    id: 'pull-ups',
    name: 'Pull-ups',
    category: 'back',
    equipment: ['pull-up bar'],
    instructions: [
      'Hang from bar with overhand grip',
      'Pull body up until chin clears bar',
      'Lower with control to full extension',
      'Keep core engaged throughout'
    ],
    primaryMuscles: ['Lats', 'Rhomboids'],
    secondaryMuscles: ['Biceps', 'Rear Delts']
  },
  {
    id: 'bent-over-row',
    name: 'Bent Over Row',
    category: 'back',
    equipment: ['barbell'],
    instructions: [
      'Hinge at hips with slight knee bend',
      'Hold bar with overhand grip',
      'Pull bar to lower chest/upper abdomen',
      'Squeeze shoulder blades together',
      'Lower with control'
    ],
    primaryMuscles: ['Lats', 'Rhomboids'],
    secondaryMuscles: ['Rear Delts', 'Biceps']
  },

  // Legs
  {
    id: 'squat',
    name: 'Squat',
    category: 'legs',
    equipment: ['barbell', 'squat rack'],
    instructions: [
      'Position bar on upper back',
      'Stand with feet shoulder-width apart',
      'Lower by pushing hips back and bending knees',
      'Descend until thighs parallel to ground',
      'Drive through heels to return to start'
    ],
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Calves', 'Core']
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    category: 'legs',
    equipment: ['leg press machine'],
    instructions: [
      'Sit in leg press machine',
      'Place feet shoulder-width apart on platform',
      'Lower weight by bending knees to 90 degrees',
      'Press through heels to extend legs',
      'Don\'t lock knees at top'
    ],
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Calves']
  },
  {
    id: 'lunges',
    name: 'Lunges',
    category: 'legs',
    equipment: ['dumbbells'],
    instructions: [
      'Stand with feet hip-width apart',
      'Step forward into lunge position',
      'Lower until both knees at 90 degrees',
      'Push through front heel to return',
      'Alternate legs or complete one side first'
    ],
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Calves', 'Core']
  },

  // Shoulders
  {
    id: 'overhead-press',
    name: 'Overhead Press',
    category: 'shoulders',
    equipment: ['barbell'],
    instructions: [
      'Stand with feet shoulder-width apart',
      'Hold bar at shoulder level',
      'Press bar straight up overhead',
      'Lower with control to starting position',
      'Keep core tight throughout'
    ],
    primaryMuscles: ['Front Delts', 'Side Delts'],
    secondaryMuscles: ['Triceps', 'Upper Chest', 'Core']
  },
  {
    id: 'lateral-raises',
    name: 'Lateral Raises',
    category: 'shoulders',
    equipment: ['dumbbells'],
    instructions: [
      'Stand with dumbbells at sides',
      'Raise arms out to sides until parallel to ground',
      'Pause briefly at top',
      'Lower with control',
      'Keep slight bend in elbows'
    ],
    primaryMuscles: ['Side Delts'],
    secondaryMuscles: ['Front Delts', 'Rear Delts']
  },

  // Arms
  {
    id: 'bicep-curls',
    name: 'Bicep Curls',
    category: 'arms',
    equipment: ['dumbbells'],
    instructions: [
      'Stand with dumbbells at sides',
      'Keep elbows close to body',
      'Curl weights up to shoulders',
      'Squeeze biceps at top',
      'Lower with control'
    ],
    primaryMuscles: ['Biceps'],
    secondaryMuscles: ['Forearms']
  },
  {
    id: 'tricep-dips',
    name: 'Tricep Dips',
    category: 'arms',
    equipment: ['dip bars'],
    instructions: [
      'Support body weight on dip bars',
      'Lower body by bending elbows',
      'Descend until shoulders below elbows',
      'Push back up to starting position',
      'Keep body upright'
    ],
    primaryMuscles: ['Triceps'],
    secondaryMuscles: ['Chest', 'Front Delts']
  }
];

export const workoutTemplates: WorkoutTemplate[] = [
  {
    id: 'push-day',
    name: 'Push Day',
    description: 'Chest, shoulders, and triceps focused workout',
    estimatedDuration: 60,
    difficulty: 'intermediate',
    category: 'Push',
    exercises: [
      {
        id: 'push-1',
        exerciseId: 'bench-press',
        exercise: exercises.find(e => e.id === 'bench-press')!,
        sets: [
          { id: 'set-1', weight: 135, reps: 8, completed: false },
          { id: 'set-2', weight: 155, reps: 6, completed: false },
          { id: 'set-3', weight: 175, reps: 4, completed: false },
          { id: 'set-4', weight: 155, reps: 6, completed: false }
        ],
        restTimer: 180
      },
      {
        id: 'push-2',
        exerciseId: 'incline-dumbbell-press',
        exercise: exercises.find(e => e.id === 'incline-dumbbell-press')!,
        sets: [
          { id: 'set-5', weight: 60, reps: 10, completed: false },
          { id: 'set-6', weight: 65, reps: 8, completed: false },
          { id: 'set-7', weight: 70, reps: 6, completed: false }
        ],
        restTimer: 120
      },
      {
        id: 'push-3',
        exerciseId: 'overhead-press',
        exercise: exercises.find(e => e.id === 'overhead-press')!,
        sets: [
          { id: 'set-8', weight: 95, reps: 8, completed: false },
          { id: 'set-9', weight: 105, reps: 6, completed: false },
          { id: 'set-10', weight: 115, reps: 4, completed: false }
        ],
        restTimer: 150
      },
      {
        id: 'push-4',
        exerciseId: 'lateral-raises',
        exercise: exercises.find(e => e.id === 'lateral-raises')!,
        sets: [
          { id: 'set-11', weight: 20, reps: 12, completed: false },
          { id: 'set-12', weight: 25, reps: 10, completed: false },
          { id: 'set-13', weight: 25, reps: 8, completed: false }
        ],
        restTimer: 90
      },
      {
        id: 'push-5',
        exerciseId: 'tricep-dips',
        exercise: exercises.find(e => e.id === 'tricep-dips')!,
        sets: [
          { id: 'set-14', weight: 0, reps: 12, completed: false },
          { id: 'set-15', weight: 0, reps: 10, completed: false },
          { id: 'set-16', weight: 0, reps: 8, completed: false }
        ],
        restTimer: 90
      }
    ]
  },
  {
    id: 'pull-day',
    name: 'Pull Day',
    description: 'Back and biceps focused workout',
    estimatedDuration: 55,
    difficulty: 'intermediate',
    category: 'Pull',
    exercises: [
      {
        id: 'pull-1',
        exerciseId: 'deadlift',
        exercise: exercises.find(e => e.id === 'deadlift')!,
        sets: [
          { id: 'set-17', weight: 185, reps: 5, completed: false },
          { id: 'set-18', weight: 205, reps: 3, completed: false },
          { id: 'set-19', weight: 225, reps: 1, completed: false },
          { id: 'set-20', weight: 185, reps: 5, completed: false }
        ],
        restTimer: 240
      },
      {
        id: 'pull-2',
        exerciseId: 'pull-ups',
        exercise: exercises.find(e => e.id === 'pull-ups')!,
        sets: [
          { id: 'set-21', weight: 0, reps: 8, completed: false },
          { id: 'set-22', weight: 0, reps: 6, completed: false },
          { id: 'set-23', weight: 0, reps: 4, completed: false }
        ],
        restTimer: 120
      },
      {
        id: 'pull-3',
        exerciseId: 'bent-over-row',
        exercise: exercises.find(e => e.id === 'bent-over-row')!,
        sets: [
          { id: 'set-24', weight: 135, reps: 8, completed: false },
          { id: 'set-25', weight: 145, reps: 6, completed: false },
          { id: 'set-26', weight: 155, reps: 4, completed: false }
        ],
        restTimer: 150
      },
      {
        id: 'pull-4',
        exerciseId: 'bicep-curls',
        exercise: exercises.find(e => e.id === 'bicep-curls')!,
        sets: [
          { id: 'set-27', weight: 30, reps: 12, completed: false },
          { id: 'set-28', weight: 35, reps: 10, completed: false },
          { id: 'set-29', weight: 40, reps: 8, completed: false }
        ],
        restTimer: 90
      }
    ]
  },
  {
    id: 'leg-day',
    name: 'Leg Day',
    description: 'Complete lower body workout',
    estimatedDuration: 65,
    difficulty: 'advanced',
    category: 'Legs',
    exercises: [
      {
        id: 'leg-1',
        exerciseId: 'squat',
        exercise: exercises.find(e => e.id === 'squat')!,
        sets: [
          { id: 'set-30', weight: 185, reps: 8, completed: false },
          { id: 'set-31', weight: 205, reps: 6, completed: false },
          { id: 'set-32', weight: 225, reps: 4, completed: false },
          { id: 'set-33', weight: 185, reps: 8, completed: false }
        ],
        restTimer: 180
      },
      {
        id: 'leg-2',
        exerciseId: 'leg-press',
        exercise: exercises.find(e => e.id === 'leg-press')!,
        sets: [
          { id: 'set-34', weight: 270, reps: 12, completed: false },
          { id: 'set-35', weight: 315, reps: 10, completed: false },
          { id: 'set-36', weight: 360, reps: 8, completed: false }
        ],
        restTimer: 120
      },
      {
        id: 'leg-3',
        exerciseId: 'lunges',
        exercise: exercises.find(e => e.id === 'lunges')!,
        sets: [
          { id: 'set-37', weight: 40, reps: 12, completed: false },
          { id: 'set-38', weight: 50, reps: 10, completed: false },
          { id: 'set-39', weight: 60, reps: 8, completed: false }
        ],
        restTimer: 90
      }
    ]
  },
  {
    id: 'full-body-beginner',
    name: 'Full Body Beginner',
    description: 'Complete beginner-friendly full body workout',
    estimatedDuration: 45,
    difficulty: 'beginner',
    category: 'Full Body',
    exercises: [
      {
        id: 'fb-1',
        exerciseId: 'push-ups',
        exercise: exercises.find(e => e.id === 'push-ups')!,
        sets: [
          { id: 'set-40', weight: 0, reps: 10, completed: false },
          { id: 'set-41', weight: 0, reps: 8, completed: false },
          { id: 'set-42', weight: 0, reps: 6, completed: false }
        ],
        restTimer: 60
      },
      {
        id: 'fb-2',
        exerciseId: 'squat',
        exercise: exercises.find(e => e.id === 'squat')!,
        sets: [
          { id: 'set-43', weight: 45, reps: 12, completed: false },
          { id: 'set-44', weight: 65, reps: 10, completed: false },
          { id: 'set-45', weight: 85, reps: 8, completed: false }
        ],
        restTimer: 90
      },
      {
        id: 'fb-3',
        exerciseId: 'bent-over-row',
        exercise: exercises.find(e => e.id === 'bent-over-row')!,
        sets: [
          { id: 'set-46', weight: 65, reps: 10, completed: false },
          { id: 'set-47', weight: 75, reps: 8, completed: false },
          { id: 'set-48', weight: 85, reps: 6, completed: false }
        ],
        restTimer: 90
      }
    ]
  }
];