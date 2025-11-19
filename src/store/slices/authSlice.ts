// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase, saveRefreshToken, deleteRefreshToken } from '@/lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { syncUser as syncUserApi } from '@/lib/api';
import { resetCycle } from './cycleSlice';
import { resetProfile } from './userProfileSlice';

WebBrowser.maybeCompleteAuthSession();

// Types
type User = {
  id: string;
  email?: string | null;
};

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshTokenStored: boolean;
  status: 'idle' | 'loading' | 'failed' | 'succeeded';
  error?: string | null;
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshTokenStored: false,
  status: 'idle',
  error: null,
};

// Thunks

export const signUpWithEmail = createAsyncThunk(
  'auth/signUpWithEmail',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      // data.user may be null until confirmed — return what supabase returns
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Sign up failed');
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // save refresh token securely if present
      if (data?.session?.refresh_token) {
        await saveRefreshToken(data.session.refresh_token);
      }
      return data;
    } catch (err: any) {
      console.log('signInWithEmail error', err);
      return rejectWithValue(err.message || 'Signin failed');
    }
  }
);

// export const signInWithGoogle = createAsyncThunk(
//   'auth/signInWithGoogle',
//   async (_, { rejectWithValue }) => {
//     try {
//       const redirectUrl = Linking.createURL('/');

//       const { data, error } = await supabase.auth.signInWithOAuth({
//         provider: 'google',
//         options: {
//           redirectTo: redirectUrl,
//           skipBrowserRedirect: false,
//         },
//       });

//       if (error) throw error;

//       // Open browser for OAuth
//       if (data?.url) {
//         const result = await WebBrowser.openAuthSessionAsync(
//           data.url,
//           redirectUrl
//         );

//         if (result.type === 'success') {
//           const url = result.url;
//           const params = new URL(url).searchParams;
//           const access_token = params.get('access_token');
//           const refresh_token = params.get('refresh_token');

//           if (access_token && refresh_token) {
//             await saveRefreshToken(refresh_token);
//             const { data: sessionData } = await supabase.auth.getSession();
//             return sessionData;
//           }
//         }
//       }

//       return data;
//     } catch (err: any) {
//       return rejectWithValue(err.message || 'Google sign-in failed');
//     }
//   }
// );

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      await deleteRefreshToken();
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
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Restore session failed');
    }
  }
);

export const syncUser = createAsyncThunk(
  'auth/syncUser',
  async (_, { rejectWithValue, getState }) => {
    try {
      const response = await syncUserApi();
      console.log('syncUser response', response);
      
      // Update user state with synced data
      return {
        user: response.user,
        profile: response.user.profile,
      };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to sync user');
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
        const session = (action.payload as any)?.session;
        s.user = session?.user ?? null;
        s.accessToken = session?.access_token ?? null;
        s.refreshTokenStored = !!session?.refresh_token;
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
        const session = (action.payload as any)?.session;
        s.user = session?.user ?? null;
        s.accessToken = session?.access_token ?? null;
      })
      .addCase(signUpWithEmail.rejected, (s, action) => {
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
        s.status = 'idle'; // Reset to idle after logout
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
        s.status = 'idle'; // Set to idle instead of succeeded
        const session = (action.payload as any)?.session;
        if (session) {
          s.user = session.user ?? null;
          s.accessToken = session.access_token ?? null;
        } else {
          s.user = null;
          s.accessToken = null;
        }
      })
      .addCase(restoreSession.rejected, (s, action) => {
        s.status = 'failed';
        s.error = action.payload as string;
      })
      .addCase(syncUser.pending, (s) => {
        s.status = 'loading';
        s.error = null;
      })
      .addCase(syncUser.fulfilled, (s, action) => {
        s.status = 'succeeded';
        s.user = action.payload.user;
        // Access token stays the same (from Supabase session)
      })
      .addCase(syncUser.rejected, (s, action) => {
        s.status = 'failed';
        s.error = action.payload as string;
      });
  },
});

export const { setUser, clearAuthError } = authSlice.actions;
export const authReducer = authSlice.reducer;