import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Provider, useDispatch } from 'react-redux';
import { AppDispatch } from '@/src/store';
import { store } from '@/src/store';
import { supabase } from '@/lib/supabase';
import { setUser, syncUser } from '@/src/store/slices/authSlice';

type SupabaseListenerProps = {
  onReady: () => void;
};

const SupabaseListener = ({ onReady }: SupabaseListenerProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const readyNotified = useRef(false);

  const notifyReady = () => {
    if (!readyNotified.current) {
      readyNotified.current = true;
      onReady();
    }
  };

  useEffect(() => {
    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!isMounted) return;

        dispatch(
          setUser({
            user: session?.user
              ? { id: session.user.id, email: session.user.email ?? undefined }
              : null,
            accessToken: session?.access_token ?? null,
          })
        );
      })
      .catch((error) => {
        console.warn('Supabase getSession failed:', error);
      })
      .finally(() => {
        if (isMounted) {
          notifyReady();
        }
      });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        dispatch(
          setUser({
            user: session?.user
              ? { id: session.user.id, email: session.user.email ?? undefined }
              : null,
            accessToken: session?.access_token ?? null,
          })
        );

        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          try {
            await dispatch(syncUser()).unwrap();
          } catch (error) {
            console.error('Failed to sync user:', error);
          }
        }

        notifyReady();
      }
    );

    return () => {
      isMounted = false;
      subscription?.subscription.unsubscribe();
    };
  }, [dispatch]);

  return null;
};

export const ReduxProvider = ({ children }: { children: React.ReactNode }) => {
  const [authReady, setAuthReady] = useState(false);

  return (
    <Provider store={store}>
      <SupabaseListener onReady={() => setAuthReady(true)} />
      {authReady ? (
        children
      ) : (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#ec4899" />
        </View>
      )}
    </Provider>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: '#FFF0F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
});