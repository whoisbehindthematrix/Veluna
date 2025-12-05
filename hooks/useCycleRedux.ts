// hooks/useCycleRedux.ts
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import type { RootState, AppDispatch } from '../src/store';
import { 
  addEntry, 
  calculatePredictions, 
  updateCurrentPhase,
  loadCycleData,
  loadQuickNotes,
} from '../src/store/slices/cycleSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { quickNoteService } from '../services/quickNoteService';
import { cycleEntryService } from '../services/cycleEntryService';

export const useCycleRedux = () => {
  const dispatch = useDispatch<AppDispatch>();
  const cycleState = useSelector((state: RootState) => state.cycle);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Auto-calculate predictions when entries change
  useEffect(() => {
    if (cycleState.entries.length >= 2) {
      dispatch(calculatePredictions());
    }
  }, [cycleState.entries.length]);

  // Auto-update current phase daily
  useEffect(() => {
    dispatch(updateCurrentPhase());
    
    // Update every day at midnight
    const interval = setInterval(() => {
      dispatch(updateCurrentPhase());
    }, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [cycleState.profile.lastPeriodStart]);

  // Save data whenever state changes
  useEffect(() => {
    saveData();
  }, [cycleState]);

  // Sync cycle entries with backend when they change
  useEffect(() => {
    if (cycleState.entries.length > 0) {
      syncCycleEntries();
    }
  }, [cycleState.entries.length]);

  // Sync quick notes with backend
  useEffect(() => {
    if (cycleState.quickNotes.length > 0) {
      syncQuickNotes();
    }
  }, [cycleState.quickNotes.length]);

  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem('cycleData');
      if (saved) {
        dispatch(loadCycleData(JSON.parse(saved)));
      }
    } catch (error) {
      console.error('Error loading cycle data:', error);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('cycleData', JSON.stringify(cycleState));
    } catch (error) {
      console.error('Error saving cycle data:', error);
    }
  };

  const syncCycleEntries = async () => {
    try {
      // Load cycle entries from backend
      const backendEntries = await cycleEntryService.getCycleEntries();
      if (backendEntries.length > 0) {
        // Merge with local entries (local takes precedence for conflicts)
        console.log('✅ [Cycle] Loaded', backendEntries.length, 'entries from backend');
      }
    } catch (error) {
      console.error('❌ [Cycle] Error syncing cycle entries:', error);
    }
  };

  const syncQuickNotes = async () => {
    try {
      // Load quick notes from backend
      const backendNotes = await quickNoteService.getQuickNotes();
      if (backendNotes.length > 0) {
        dispatch(loadQuickNotes(backendNotes));
        console.log('✅ [Quick Notes] Loaded', backendNotes.length, 'notes from backend');
      }
    } catch (error) {
      console.error('❌ [Quick Notes] Error syncing quick notes:', error);
    }
  };

  // Load data from backend on mount
  useEffect(() => {
    syncCycleEntries();
    syncQuickNotes();
  }, []);

  return {
    cycleState,
    dispatch,
    syncQuickNotes,
  };
};
