// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api, { saveTokens, removeTokens, getAccessToken, getRefreshToken } from '@/lib/api';
import { resetCycle } from './cycleSlice';
import { resetProfile, setProfile } from './userProfileSlice';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';

type User = {
  id: string;
  email?: string | null;
};

type RequestStatus = 'idle' | 'loading' | 'failed' | 'succeeded';

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshTokenStored: boolean;
  status: RequestStatus;
  syncStatus: RequestStatus;
  error?: string | null;
  onboardingCompleted: boolean;
  isInitialized: boolean;
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshTokenStored: false,
  status: 'idle',
  syncStatus: 'idle',
  error: null,
  onboardingCompleted: false,
  isInitialized: false,
};

// Thunks

export const signUpWithEmail = createAsyncThunk(
  'auth/signUpWithEmail',
  async (
    { email, password, displayName }: { email: string; password: string; displayName?: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const res = await api.post("/auth/register", {
        email,
        password,
        displayName, // Keep for backward compatibility if needed
        fullName: displayName, // Backend expects fullName
      });

      // Save tokens if provided
      if (res.data?.session?.access_token && res.data?.session?.refresh_token) {
        await saveTokens(
          res.data.session.access_token,
          res.data.session.refresh_token
        );
      }

      // ✅ Ensure full name is persisted to backend user profile
      // Some backends create the user on /auth/register but don't persist profile fields there.
      // /auth/me is already used by the Profile Settings screen, so it is the safest way to store fullName.
      const trimmedName = displayName?.trim();
      if (trimmedName) {
        try {
          const updateRes = await api.put("/auth/me", { fullName: trimmedName });
          const updatedProfile = updateRes.data?.user?.profile || updateRes.data?.user || null;
          if (updatedProfile) {
            const mappedProfile = {
              ...updatedProfile,
              displayName: updatedProfile.fullName || updatedProfile.displayName,
              firstName: updatedProfile.firstName || updatedProfile.fullName?.split(' ')[0] || '',
              lastName: updatedProfile.lastName || updatedProfile.fullName?.split(' ').slice(1).join(' ') || '',
            };
            dispatch(setProfile(mappedProfile as any));
          }
        } catch (e) {
          // Don't fail signup if profile update fails; user can still update in Settings.
          console.warn('⚠️ [Auth] Failed to persist fullName during signup:', e);
        }
      }

      // ✅ Update userProfile if profile data is returned
      if (res.data?.user?.profile) {
        const profileData = res.data.user.profile;
        const mappedProfile = {
          ...profileData,
          displayName: profileData.fullName || profileData.displayName,
          firstName: profileData.firstName || profileData.fullName?.split(' ')[0] || '',
          lastName: profileData.lastName || profileData.fullName?.split(' ').slice(1).join(' ') || '',
        };
        dispatch(setProfile(mappedProfile as any));
      }

      return {
        user: res.data?.user || null,
        session: res.data?.session || null,
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Sign up failed');
    }
  }
);

export const signInWithEmail = createAsyncThunk(
  'auth/signInWithEmail',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });
      // Save tokens
      if (res.data?.session?.access_token && res.data?.session?.refresh_token) {
        await saveTokens(
          res.data.session.access_token,
          res.data.session.refresh_token
        );
      }

      return {
        user: res.data?.user || null,
        session: res.data?.session || null,
      };
    } catch (err: any) {
      console.log('signInWithEmail error', err);
      return rejectWithValue(err.response?.data?.message || err.message || 'Signin failed');
    }
  }
);


export const signInWithGoogle = createAsyncThunk(
  'auth/signInWithGoogle',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const redirectTo = Linking.createURL('auth-callback');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });

      if (error) throw error;

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo
      );

      if (result.type !== 'success') {
        throw new Error('Google auth cancelled');
      }

      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        throw new Error('No session after Google login');
      }

      await saveTokens(
        sessionData.session.access_token,
        sessionData.session.refresh_token!
      );

      // Sync user with backend (verify Supabase JWT, upsert user, same shape as login)
      const res = await api.post('/auth/google', {
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token ?? undefined,
      });

      // Update userProfile if backend returns profile (same as signUpWithEmail)
      if (res.data?.user?.profile) {
        const profileData = res.data.user.profile;
        const mappedProfile = {
          ...profileData,
          displayName: profileData.fullName || profileData.displayName,
          firstName: profileData.firstName || profileData.fullName?.split(' ')[0] || '',
          lastName: profileData.lastName || profileData.fullName?.split(' ').slice(1).join(' ') || '',
        };
        dispatch(setProfile(mappedProfile as any));
      }

      return {
        user: res.data?.user ?? null,
        session: res.data?.session ?? null,
      };
    } catch (e: any) {
      return rejectWithValue(
        e.response?.data?.message || e.message || 'Google sign-in failed'
      );
    }
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Remove tokens
      await removeTokens();
      dispatch(resetCycle());
      dispatch(resetProfile());
      return true;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Sign out failed');
    }
  }
);
export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      // Check if we have tokens before making API call
      const accessToken = await getAccessToken();
      const refreshToken = await getRefreshToken();
      
      // If no tokens at all, skip API call and return null
      if (!accessToken && !refreshToken) {
        if (__DEV__) {
          console.log('🔄 [restoreSession] No tokens found, skipping API call');
        }
        return {
          user: null,
          session: null,
          onboardingCompleted: false,
        };
      }
      
      // Try to get user profile to verify token is valid
      const res = await api.get("/auth/me");
      
      const user = res.data?.user || null;
      
      // Get onboarding completion status directly from backend
      // Backend should set this flag when /onboarding/complete is called
      const onboardingCompleted = user?.onboardingCompleted ?? false;
      
      if (__DEV__) {
        console.log('🔄 [restoreSession] Onboarding status from backend:', {
          onboardingCompleted,
          userOnboardingCompleted: user?.onboardingCompleted,
          hasUser: !!user,
        });
      }
      
      return {
        user,
        session: {
          access_token: await getAccessToken(),
        },
        onboardingCompleted,
      };
    } catch (err: any) {
      // If token is invalid, clear it
      if (__DEV__) {
        console.log('🔄 [restoreSession] Error restoring session:', err?.message);
      }
      await removeTokens();
      return {
        user: null,
        session: null,
        onboardingCompleted: false,
      };
    }
  }
);

export const syncUser = createAsyncThunk(
  'auth/syncUser',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post("/auth/sync");
      
      const profileData = res.data?.user?.profile || null;
      
      // ✅ Update userProfile slice with synced profile data
      if (profileData) {
        // Map backend fullName to userProfile structure
        const mappedProfile = {
          ...profileData,
          // Map fullName to displayName/firstName/lastName if needed
          displayName: profileData.fullName || profileData.displayName,
          firstName: profileData.firstName || profileData.fullName?.split(' ')[0] || '',
          lastName: profileData.lastName || profileData.fullName?.split(' ').slice(1).join(' ') || '',
        };
        dispatch(setProfile(mappedProfile as any));
      }
      
      // Get onboarding completion status from backend response
      // Backend should return this in user.onboardingCompleted after /onboarding/complete is called
      const onboardingCompleted = res.data?.user?.onboardingCompleted ?? false;
      
      if (__DEV__) {
        console.log('🔄 [syncUser] Onboarding status from backend:', {
          onboardingCompleted,
          userOnboardingCompleted: res.data?.user?.onboardingCompleted,
          hasUser: !!res.data?.user,
        });
      }
      
      // Update user state with synced data
      return {
        user: res.data?.user || null,
        profile: profileData,
        onboardingCompleted,
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to sync user');
    }
  }
);



const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(
      state,
      action: PayloadAction<{ user: User | null; accessToken?: string | null }>
    ) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken ?? null;
      state.status = 'idle';
      state.error = null;
    },
    // ADD THIS - Reset status and clear errors manually
    clearAuthError(state) {
      state.error = null;
      state.status = 'idle';
      state.syncStatus = 'idle';
    },
    setOnboardingCompleted(state, action: PayloadAction<boolean>) {
      state.onboardingCompleted = action.payload;
      if (__DEV__) {
        console.log('✅ [AuthSlice] setOnboardingCompleted:', action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Sign In
      .addCase(signInWithEmail.pending, (s) => {
        s.status = 'loading';
        s.error = null;
      })
      .addCase(signInWithEmail.fulfilled, (s, action) => {
        s.status = 'succeeded';
        const payload = action.payload as any;
        s.user = payload?.user ?? null;
        s.accessToken = payload?.session?.access_token ?? null;
        s.refreshTokenStored = !!payload?.session?.refresh_token;
        s.onboardingCompleted = payload?.user?.onboardingCompleted ?? false;
      })
      .addCase(signInWithEmail.rejected, (s, action) => {
        s.status = 'failed';
        s.error = action.payload as string;
      })

      // Sign Up
      .addCase(signUpWithEmail.pending, (s) => {
        s.status = 'loading';
        s.error = null;
      })
      .addCase(signUpWithEmail.fulfilled, (s, action) => {
        s.status = 'succeeded';
        const payload = action.payload as any;
        s.user = payload?.user ?? null;
        s.accessToken = payload?.session?.access_token ?? null;
        s.refreshTokenStored = !!payload?.session?.refresh_token;
        s.onboardingCompleted = payload?.user?.onboardingCompleted ?? false;
      })
      .addCase(signUpWithEmail.rejected, (s, action) => {
        s.status = 'failed';
        s.error = action.payload as string;
      })

      // Sign In with Google
      .addCase(signInWithGoogle.pending, (s) => {
        s.status = 'loading';
        s.error = null;
      })
      .addCase(signInWithGoogle.fulfilled, (s, action) => {
        s.status = 'succeeded';
        const payload = action.payload as any;
        s.user = payload?.user ?? null;
        s.accessToken = payload?.session?.access_token ?? null;
        s.refreshTokenStored = !!payload?.session?.refresh_token;
        s.onboardingCompleted = payload?.user?.onboardingCompleted ?? false;
      })
      .addCase(signInWithGoogle.rejected, (s, action) => {
        s.status = 'failed';
        s.error = action.payload as string;
      })

      // Sign Out - ADD PENDING CASE
      .addCase(signOut.pending, (s) => {
        s.status = 'loading';
        s.error = null;
      })
      .addCase(signOut.fulfilled, (s) => {
        s.user = null;
        s.accessToken = null;
        s.refreshTokenStored = false;
        s.onboardingCompleted = false;
        s.status = 'idle';
        s.syncStatus = 'idle';
      })
      .addCase(signOut.rejected, (s, action) => {
        s.status = 'failed';
        s.error = action.payload as string;
      })

      // Restore Session - ADD PENDING CASE
      .addCase(restoreSession.pending, (s) => {
        s.status = 'loading';
        s.error = null;
      })
      .addCase(restoreSession.fulfilled, (s, action) => {
        s.status = 'idle';
        s.isInitialized = true;
        const payload = action.payload as any;
        if (payload?.user && payload?.session) {
          s.user = payload.user;
          s.accessToken = payload.session.access_token ?? null;
          s.refreshTokenStored = !!payload.session.refresh_token;
          s.onboardingCompleted = payload.user?.onboardingCompleted ?? false;
        } else {
          s.user = null;
          s.accessToken = null;
          s.refreshTokenStored = false;
          s.onboardingCompleted = false;
        }
      })
      .addCase(restoreSession.rejected, (s) => {
        s.status = 'idle';
        s.isInitialized = true;
        s.user = null;
        s.accessToken = null;
        s.refreshTokenStored = false;
        s.onboardingCompleted = false;
        s.error = null;
      })
      .addCase(syncUser.pending, (s) => {
        s.syncStatus = 'loading';
        s.error = null;
      })
      .addCase(syncUser.fulfilled, (s, action) => {
        s.syncStatus = 'succeeded';
        s.user = action.payload.user;
        // Update onboardingCompleted from backend response
        const backendOnboardingStatus = action.payload.onboardingCompleted ?? action.payload.user?.onboardingCompleted ?? false;
        s.onboardingCompleted = backendOnboardingStatus;
        
        if (__DEV__) {
          console.log('🔄 [AuthSlice] syncUser fulfilled:', {
            onboardingCompleted: backendOnboardingStatus,
            fromPayload: action.payload.onboardingCompleted,
            fromUser: action.payload.user?.onboardingCompleted,
          });
        }
      })
      .addCase(syncUser.rejected, (s, action) => {
        s.syncStatus = 'failed';
        s.error = action.payload as string;
      });
  },
});

export const { setUser, clearAuthError, setOnboardingCompleted } = authSlice.actions;
export const authReducer = authSlice.reducer;