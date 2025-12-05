import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Provider, useDispatch } from 'react-redux';
import { AppDispatch } from '@/src/store';
import { store } from '@/src/store';
import { restoreSession, syncUser } from '@/src/store/slices/authSlice';

const AuthInitializer = ({ onReady }: { onReady: () => void }) => {
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

    const initializeAuth = async () => {
      try {
        // Restore session from stored tokens
        const result = await dispatch(restoreSession()).unwrap();
        
        if (!isMounted) return;

        // If user is authenticated, sync their data
        if (result?.user) {
          try {
            await dispatch(syncUser()).unwrap();
          } catch (error) {
            console.warn('Failed to sync user on init:', error);
          }
        }
      } catch (error) {
        console.warn('Failed to restore session:', error);
      } finally {
        if (isMounted) {
          notifyReady();
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  return null;
};

export const ReduxProvider = ({ children }: { children: React.ReactNode }) => {
  const [authReady, setAuthReady] = useState(false);

  return (
    <Provider store={store}>
      <AuthInitializer onReady={() => setAuthReady(true)} />
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