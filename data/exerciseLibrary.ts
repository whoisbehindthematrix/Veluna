import { exercises as baseExercises, Exercise } from '@/data/strongWorkouts';
import { exerciseMediaById } from '@/data/exerciseMedia';

export interface ExerciseWithMedia extends Exercise {
  mediaUrl?: string;
  thumbnailUrl?: string;
  cues?: string[];
}

export const exerciseLibrary: ExerciseWithMedia[] = baseExercises.map((ex) => {
  const media = exerciseMediaById[ex.id];
  return {
    ...ex,
    mediaUrl: media?.mediaUrl,
    thumbnailUrl: media?.thumbnailUrl,
    cues: media?.cues,
    // Provide some default cues; fall back to media cues if available
    // Instructions already exist on Exercise as string[]
  } as ExerciseWithMedia;
});

export const exerciseById: Record<string, ExerciseWithMedia> = exerciseLibrary.reduce((acc, ex) => {
  acc[ex.id] = ex;
  return acc;
}, {} as Record<string, ExerciseWithMedia>);


