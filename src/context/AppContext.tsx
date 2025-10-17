import React, { createContext, useContext, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateMockCycles } from '../lib/mockData';

type AppState = {
  name?: string;
  averageCycleLength: number;
  lutealLength?: number;
  privacyLocalOnly: boolean;
};

type AppContextType = {
  state: AppState;
  setState: (s: Partial<AppState>) => void;
  mock: ReturnType<typeof generateMockCycles>;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, _setState] = useState<AppState>({ averageCycleLength: 28, privacyLocalOnly: true });
  const mock = useMemo(() => generateMockCycles(6), []);

  const setState = (s: Partial<AppState>) => {
    _setState(prev => ({ ...prev, ...s }));
    AsyncStorage.setItem('app_state', JSON.stringify({ ...state, ...s })).catch(() => {});
  };

  const value = useMemo(() => ({ state, setState, mock }), [state, mock]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}



