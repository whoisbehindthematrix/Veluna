// hooks/useUserProfile.ts
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useCallback } from 'react';
import type { RootState, AppDispatch } from '../src/store';
import { 
  loadUserProfile, 
  saveUserProfile, 
  updateProfile,
  markClean 
} from '../src/store/slices/userProfileSlice';

export const useUserProfile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, status, error, isDirty, lastSynced } = useSelector(
    (state: RootState) => state.userProfile
  );
  const authUser = useSelector((state: RootState) => state.auth.user);

  // Auto-load profile when user logs in
  useEffect(() => {
    if (authUser?.id && !profile) {
      dispatch(loadUserProfile(authUser.id));
    }
  }, [authUser?.id, profile, dispatch]);

  // Auto-save when profile becomes dirty (debounced)
  useEffect(() => {
    if (isDirty && profile && status === 'idle') {
      const timer = setTimeout(() => {
        dispatch(saveUserProfile(profile));
      }, 1000); // Debounce 1 second

      return () => clearTimeout(timer);
    }
  }, [isDirty, profile, status, dispatch]);

  const update = useCallback((updates: Partial<typeof profile>) => {
    dispatch(updateProfile(updates));
  }, [dispatch]);

  const save = useCallback(async () => {
    if (profile) {
      return dispatch(saveUserProfile(profile));
    }
  }, [profile, dispatch]);

  const refresh = useCallback(() => {
    if (authUser?.id) {
      return dispatch(loadUserProfile(authUser.id));
    }
  }, [authUser?.id, dispatch]);

  return {
    profile,
    status,
    error,
    isDirty,
    lastSynced,
    update,
    save,
    refresh,
  };
};
