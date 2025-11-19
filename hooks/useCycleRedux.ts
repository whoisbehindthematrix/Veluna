// hooks/useCycleRedux.ts
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import type { RootState, AppDispatch } from '../src/store';
import { 
  addEntry, 
  calculatePredictions, 
  updateCurrentPhase,
  loadCycleData 
} from '../src/store/slices/cycleSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  return {
    cycleState,
    dispatch,
  };
};
