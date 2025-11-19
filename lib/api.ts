// lib/api.ts
import { supabase } from './supabase';
import { appConfig, assertApiBaseUrl } from './config';

// -------------------------------
// Internal token cache
// -------------------------------
let cachedAccessToken: string | null = null;

async function primeSession() {
  try {
    const { data } = await supabase.auth.getSession();
    cachedAccessToken = data.session?.access_token ?? null;
  } catch (err) {
    console.warn('[api] Failed to bootstrap session', err);
  }
}
void primeSession();

supabase.auth.onAuthStateChange((_event, session) => {
  cachedAccessToken = session?.access_token ?? null;
});

// -------------------------------
// Core fetch wrapper
// -------------------------------
async function http<T>(url: string, options: RequestInit = {}): Promise<T> {
  if (!appConfig.apiBaseUrl) assertApiBaseUrl();

  const fullUrl = `${appConfig.apiBaseUrl}${url}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (cachedAccessToken) {
    headers.Authorization = `Bearer ${cachedAccessToken}`;
  }

  const res = await fetch(fullUrl, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.error || err?.message || `HTTP ${res.status}`);
  }

  return safeJson(res);
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// -------------------------------
// Exported helpers
// -------------------------------
export const apiGet = <T>(url: string) =>
  http<T>(url, { method: 'GET' });

export const apiPost = <T>(url: string, body?: any) =>
  http<T>(url, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });

export const apiPut = <T>(url: string, body?: any) =>
  http<T>(url, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });

export const apiDelete = <T>(url: string) =>
  http<T>(url, { method: 'DELETE' });

// -------------------------------
// Auth endpoints
// -------------------------------
export function syncUser() {
  return apiGet<{
    success: boolean;
    data: any;
  }>('/api/sync');
}

// -------------------------------
// Profile endpoints
// -------------------------------
export function getProfile() {
  return apiGet<{
    success: boolean;
    data: any;
  }>('/api/profile');
}

export function updateProfile(profileData: any) {
  return apiPut<{
    success: boolean;
    data: any;
  }>('/api/profile', profileData);
}

// -------------------------------
// Onboarding endpoints
// -------------------------------
export function completeOnboarding(onboardingData: {
  displayName?: string;
  averageCycleLength: number;
  lutealPhaseDays?: number;
  age?: number;
  dateOfBirth?: string;
  wellnessGoals?: string[];
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}) {
  return apiPost<{
    success: boolean;
    message: string;
    user: any;
  }>('/api/onboarding', onboardingData);
}

// Check if onboarding is complete
export function checkOnboardingStatus() {
  return apiGet<{
    success: boolean;
    isComplete: boolean;
    profile?: any;
  }>('/api/onboarding/status');
}