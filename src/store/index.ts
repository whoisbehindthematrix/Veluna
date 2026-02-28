// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { authReducer } from './slices/authSlice';
import cycleReducer from './slices/cycleSlice';
import userProfileReducer from './slices/userProfileSlice';
import onboardingReducer from './slices/onboardingSlice';
import foodReducer from './slices/foodSlice';
import workoutReducer from './slices/workoutSlice';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

const rootReducer = combineReducers({
  auth: authReducer,
  cycle: cycleReducer,
  userProfile: userProfileReducer,
  onboarding: onboardingReducer,
  food: foodReducer,
  workout: workoutReducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // only persist auth state (token metadata) - refresh tokens will be in SecureStore separately (optional)
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // ignore redux-persist action types
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
