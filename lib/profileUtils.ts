/**
 * Shared utilities for Profile and Health & Wellness settings pages
 */

import type { UserProfile as UserProfileState } from '@/src/store/slices/userProfileSlice';

// ============================================================================
// TYPES
// ============================================================================

export type BackendProfile = {
  id?: string;
  userId?: string;
  fullName?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  timezone?: string | null;
  averageCycleLength?: number | null;
  periodDuration?: number | null;
  lutealPhaseDays?: number | null;
  lastPeriodStart?: string | null;
  menopauseStatus?: string | null;
  wellnessGoals?: string[] | null;
  dailyCalorieGoal?: number | null;
  activityLevel?: string | null;
  height?: number | null;
  weight?: number | null;
  targetWeight?: number | null;
  unitsSystem?: 'metric' | 'imperial' | null;
  theme?: string | null;
  notifications?: Record<string, unknown> | null;
  language?: string | null;
  onboardingCompleted?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  lastSyncedAt?: string | null;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert number to string, or empty string if null/undefined
 */
export function toStringValue(value?: number | null): string {
  return value === undefined || value === null ? '' : String(value);
}

/**
 * Convert string to number or return fallback/null
 */
export function toNumberOrNull(value: string, fallback?: number | null): number | null {
  if (!value.trim()) {
    return fallback ?? null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback ?? null;
}

/**
 * Normalize date input to YYYY-MM-DD format
 */
export function normaliseDateInput(value: string | null | undefined): string {
  if (!value) return '';
  
  // If already in YYYY-MM-DD format, return as is
  if (value.length === 10 && value.includes('-') && !value.includes('T')) {
    return value;
  }
  
  // Handle ISO date strings from backend
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    // Convert to YYYY-MM-DD format
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
}

/**
 * Format datetime string to readable format
 */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

/**
 * Convert date from form (YYYY-MM-DD) to ISO string for backend
 */
export function convertDateToISO(dateString: string): string | null {
  if (!dateString.trim()) return null;
  
  const dateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dateMatch) return null;
  
  const [, year, month, day] = dateMatch;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  
  if (Number.isNaN(date.getTime())) return null;
  
  return date.toISOString();
}

