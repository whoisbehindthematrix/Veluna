// import * as WebBrowser from 'expo-web-browser';
// import * as Linking from 'expo-linking';
// import { supabase } from '@/lib/supabase';
// import { saveTokens } from '@/lib/api';

// export const signInWithGoogle = createAsyncThunk(
//   'auth/signInWithGoogle',
//   async (_, { rejectWithValue }) => {
//     try {
//       const redirectTo = Linking.createURL('auth-callback');

//       const { data, error } = await supabase.auth.signInWithOAuth({
//         provider: 'google',
//         options: {
//           redirectTo,
//         },
//       });

//       if (error) throw error;

//       const result = await WebBrowser.openAuthSessionAsync(
//         data.url,
//         redirectTo
//       );

//       if (result.type !== 'success') {
//         throw new Error('Google auth cancelled');
//       }

//       const { data: sessionData } = await supabase.auth.getSession();

//       if (!sessionData.session) {
//         throw new Error('No session after Google login');
//       }

//       await saveTokens(
//         sessionData.session.access_token,
//         sessionData.session.refresh_token!
//       );

//       return {
//         user: sessionData.session.user,
//         session: sessionData.session,
//       };
//     } catch (e: any) {
//       return rejectWithValue(e.message || 'Google sign-in failed');
//     }
//   }
// );
// // 