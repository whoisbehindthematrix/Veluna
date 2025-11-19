// hooks/useCycleStore.ts
import { useDispatch, useSelector } from 'react-redux';
import { useMemo } from 'react';
import type { AppDispatch, RootState } from '@/src/store';
import {
  addFoodEntry,
  updateFoodEntry,
  deleteFoodEntry,
  addEntry,
  updateEntry,
  deleteEntry,
  calculatePredictions,
  updateCurrentPhase,
} from '@/src/store/slices/cycleSlice';

export function useCycleStore() {
  const dispatch = useDispatch<AppDispatch>();
  const cycle = useSelector((state: RootState) => state.cycle);

  const actions = useMemo(
    () => ({
      addFoodEntry: (entry: Parameters<typeof addFoodEntry>[0]['payload']) =>
        dispatch(addFoodEntry(entry)),
      updateFoodEntry: (id: string, updates: Parameters<typeof updateFoodEntry>[0]['updates']) =>
        dispatch(updateFoodEntry({ id, updates })),
      deleteFoodEntry: (id: string) => dispatch(deleteFoodEntry(id)),
      addEntry: (entry: Parameters<typeof addEntry>[0]['payload']) =>
        dispatch(addEntry(entry)),
      updateEntry: (date: string, updates: Parameters<typeof updateEntry>[0]['updates']) =>
        dispatch(updateEntry({ date, updates })),
      deleteEntry: (date: string) => dispatch(deleteEntry(date)),
      calculatePredictions: () => dispatch(calculatePredictions()),
      updateCurrentPhase: () => dispatch(updateCurrentPhase()),
    }),
    [dispatch]
  );

  return { cycle, ...actions };
}