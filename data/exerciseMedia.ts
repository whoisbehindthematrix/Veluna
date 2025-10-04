export interface ExerciseMedia {
  id: string;
  name: string;
  mediaUrl?: string; // video or gif url
  thumbnailUrl?: string;
  description: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  cues: string[];
}

// NOTE: mediaUrl values are placeholders. Replace with your hosted mp4/gif assets when available.
export const exerciseMediaById: Record<string, ExerciseMedia> = {
  'bench-press': {
    id: 'bench-press',
    name: 'Bench Press',
    mediaUrl: 'https://files.samplelib.com/samples/video/mp4/sample-960x540.mp4',
    description: 'Barbell bench press targeting chest with triceps and shoulders assisting.',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Triceps', 'Front Delts'],
    cues: ['Feet flat, slight arch', 'Wrists stacked over elbows', 'Touch chest lightly', 'Drive bar up']
  },
  'incline-dumbbell-press': {
    id: 'incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    mediaUrl: 'https://files.samplelib.com/samples/video/mp4/sample-960x540.mp4',
    description: 'Incline press emphasizing upper chest fibers.',
    primaryMuscles: ['Upper Chest'],
    secondaryMuscles: ['Front Delts', 'Triceps'],
    cues: ['30–45° bench', 'Elbows at ~45°', 'Control down, press up']
  },
  'push-ups': {
    id: 'push-ups',
    name: 'Push-ups',
    mediaUrl: 'https://files.samplelib.com/samples/video/mp4/sample-960x540.mp4',
    description: 'Bodyweight horizontal press pattern for chest and triceps.',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Triceps', 'Core'],
    cues: ['Straight line head-to-heels', 'Elbows ~45°', 'Chest near floor']
  },
  'deadlift': {
    id: 'deadlift',
    name: 'Deadlift',
    mediaUrl: 'https://files.samplelib.com/samples/video/mp4/sample-960x540.mp4',
    description: 'Hinge pattern pulling from the floor; full posterior chain.',
    primaryMuscles: ['Lower Back', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Traps', 'Forearms'],
    cues: ['Bar over midfoot', 'Neutral spine', 'Push floor away']
  },
  'pull-ups': {
    id: 'pull-ups',
    name: 'Pull-ups',
    mediaUrl: 'https://files.samplelib.com/samples/video/mp4/sample-960x540.mp4',
    description: 'Vertical pull emphasizing lats.',
    primaryMuscles: ['Lats', 'Rhomboids'],
    secondaryMuscles: ['Biceps', 'Rear Delts'],
    cues: ['Full hang start', 'Drive elbows down', 'Chest to bar path']
  },
  'bent-over-row': {
    id: 'bent-over-row',
    name: 'Bent Over Row',
    mediaUrl: 'https://files.samplelib.com/samples/video/mp4/sample-960x540.mp4',
    description: 'Horizontal pull strengthening back thickness.',
    primaryMuscles: ['Lats', 'Rhomboids'],
    secondaryMuscles: ['Rear Delts', 'Biceps'],
    cues: ['Hinge to flat back', 'Row to lower chest', 'Squeeze shoulder blades']
  },
  'squat': {
    id: 'squat',
    name: 'Squat',
    mediaUrl: 'https://files.samplelib.com/samples/video/mp4/sample-960x540.mp4',
    description: 'Knee+hip dominant lower body staple.',
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Calves', 'Core'],
    cues: ['Brace, sit between hips', 'Knees track over toes', 'Drive up through mid-foot']
  },
  'leg-press': {
    id: 'leg-press',
    name: 'Leg Press',
    mediaUrl: 'https://files.samplelib.com/samples/video/mp4/sample-960x540.mp4',
    description: 'Machine compound for quads and glutes.',
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Calves'],
    cues: ['90° knee depth', 'Don’t lock knees', 'Controlled tempo']
  },
  'lunges': {
    id: 'lunges',
    name: 'Lunges',
    mediaUrl: 'https://files.samplelib.com/samples/video/mp4/sample-960x540.mp4',
    description: 'Split-stance unilateral lower body.',
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Calves', 'Core'],
    cues: ['Tall torso', 'Front shin vertical', 'Push through front heel']
  },
  'overhead-press': {
    id: 'overhead-press',
    name: 'Overhead Press',
    mediaUrl: 'https://files.samplelib.com/samples/video/mp4/sample-960x540.mp4',
    description: 'Vertical press for shoulders and triceps.',
    primaryMuscles: ['Front Delts', 'Side Delts'],
    secondaryMuscles: ['Triceps', 'Upper Chest', 'Core'],
    cues: ['Glutes tight', 'Bar path close', 'Head through at top']
  },
  'lateral-raises': {
    id: 'lateral-raises',
    name: 'Lateral Raises',
    mediaUrl: 'https://files.samplelib.com/samples/video/mp4/sample-960x540.mp4',
    description: 'Isolation for side delts.',
    primaryMuscles: ['Side Delts'],
    secondaryMuscles: ['Front Delts', 'Rear Delts'],
    cues: ['Soft elbows', 'Raise to shoulder height', 'Lead with elbows']
  },
  'bicep-curls': {
    id: 'bicep-curls',
    name: 'Bicep Curls',
    mediaUrl: 'https://files.samplelib.com/samples/video/mp4/sample-960x540.mp4',
    description: 'Elbow flexion for biceps.',
    primaryMuscles: ['Biceps'],
    secondaryMuscles: ['Forearms'],
    cues: ['Elbows by sides', 'No swinging', 'Squeeze at top']
  },
  'tricep-dips': {
    id: 'tricep-dips',
    name: 'Tricep Dips',
    mediaUrl: 'https://files.samplelib.com/samples/video/mp4/sample-960x540.mp4',
    description: 'Bodyweight vertical press for triceps.',
    primaryMuscles: ['Triceps'],
    secondaryMuscles: ['Chest', 'Front Delts'],
    cues: ['Shoulders down', '90° elbow depth', 'Lockout controlled']
  }
};



