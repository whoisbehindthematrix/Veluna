// src/hooks/useAuth.ts
import { useSelector } from 'react-redux';
import type { RootState } from '@/src/store';

export function useAuth() {
  const auth = useSelector((state: RootState) => state.auth);
  return {
    ...auth,
    isAuthenticated: !!auth.user && !!auth.accessToken,
  };
}
