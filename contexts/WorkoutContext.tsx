import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutTemplate, WorkoutSession, WorkoutExercise, WorkoutSet } from '@/data/strongWorkouts';

interface WorkoutState {
  templates: WorkoutTemplate[];
  sessions: WorkoutSession[];
  currentSession: WorkoutSession | null;
  isWorkoutActive: boolean;
}

type WorkoutAction =
  | { type: 'LOAD_DATA'; payload: Partial<WorkoutState> }
  | { type: 'START_WORKOUT'; payload: WorkoutTemplate }
  | { type: 'END_WORKOUT' }
  | { type: 'UPDATE_SET'; payload: { exerciseId: string; setId: string; updates: Partial<WorkoutSet> } }
  | { type: 'ADD_SET'; payload: { exerciseId: string; set: WorkoutSet } }
  | { type: 'REMOVE_SET'; payload: { exerciseId: string; setId: string } }
  | { type: 'COMPLETE_SET'; payload: { exerciseId: string; setId: string } }
  | { type: 'SAVE_SESSION'; payload: WorkoutSession }
  | { type: 'ADD_TEMPLATE'; payload: WorkoutTemplate }
  | { type: 'UPDATE_TEMPLATE'; payload: WorkoutTemplate }
  | { type: 'DELETE_TEMPLATE'; payload: string };

const initialState: WorkoutState = {
  templates: [],
  sessions: [],
  currentSession: null,
  isWorkoutActive: false,
};

function workoutReducer(state: WorkoutState, action: WorkoutAction): WorkoutState {
  switch (action.type) {
    case 'LOAD_DATA':
      return { ...state, ...action.payload };
    
    case 'START_WORKOUT':
      const newSession: WorkoutSession = {
        id: Date.now().toString(),
        templateId: action.payload.id,
        templateName: action.payload.name,
        date: new Date().toISOString().split('T')[0],
        startTime: new Date().toISOString(),
        exercises: action.payload.exercises.map(ex => ({
          ...ex,
          sets: ex.sets.map(set => ({ ...set, completed: false }))
        })),
        totalVolume: 0,
        duration: 0,
        completed: false,
      };
      return {
        ...state,
        currentSession: newSession,
        isWorkoutActive: true,
      };
    
    case 'END_WORKOUT':
      if (!state.currentSession) return state;
      
      const completedSession = {
        ...state.currentSession,
        endTime: new Date().toISOString(),
        completed: true,
        duration: Math.floor((new Date().getTime() - new Date(state.currentSession.startTime).getTime()) / 60000),
        totalVolume: state.currentSession.exercises.reduce((total, ex) => 
          total + ex.sets.reduce((exTotal, set) => 
            set.completed ? exTotal + (set.weight * set.reps) : exTotal, 0), 0)
      };
      
      return {
        ...state,
        sessions: [...state.sessions, completedSession],
        currentSession: null,
        isWorkoutActive: false,
      };
    
    case 'UPDATE_SET':
      if (!state.currentSession) return state;
      
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          exercises: state.currentSession.exercises.map(ex =>
            ex.id === action.payload.exerciseId
              ? {
                  ...ex,
                  sets: ex.sets.map(set =>
                    set.id === action.payload.setId
                      ? { ...set, ...action.payload.updates }
                      : set
                  )
                }
              : ex
          )
        }
      };
    
    case 'COMPLETE_SET':
      if (!state.currentSession) return state;
      
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          exercises: state.currentSession.exercises.map(ex =>
            ex.id === action.payload.exerciseId
              ? {
                  ...ex,
                  sets: ex.sets.map(set =>
                    set.id === action.payload.setId
                      ? { ...set, completed: !set.completed }
                      : set
                  )
                }
              : ex
          )
        }
      };
    
    case 'ADD_SET':
      if (!state.currentSession) return state;
      
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          exercises: state.currentSession.exercises.map(ex =>
            ex.id === action.payload.exerciseId
              ? { ...ex, sets: [...ex.sets, action.payload.set] }
              : ex
          )
        }
      };
    
    case 'REMOVE_SET':
      if (!state.currentSession) return state;
      
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          exercises: state.currentSession.exercises.map(ex =>
            ex.id === action.payload.exerciseId
              ? { ...ex, sets: ex.sets.filter(set => set.id !== action.payload.setId) }
              : ex
          )
        }
      };
    
    case 'ADD_TEMPLATE':
      return {
        ...state,
        templates: [...state.templates, action.payload],
      };
    
    case 'UPDATE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.map(template =>
          template.id === action.payload.id ? action.payload : template
        ),
      };
    
    case 'DELETE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.filter(template => template.id !== action.payload),
      };
    
    default:
      return state;
  }
}

const WorkoutContext = createContext<{
  state: WorkoutState;
  dispatch: React.Dispatch<WorkoutAction>;
  saveData: () => void;
} | null>(null);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(workoutReducer, initialState);

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('workoutData', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving workout data:', error);
    }
  };

  const loadData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('workoutData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: 'LOAD_DATA', payload: parsedData });
      }
    } catch (error) {
      console.error('Error loading workout data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    saveData();
  }, [state]);

  return (
    <WorkoutContext.Provider value={{ state, dispatch, saveData }}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}