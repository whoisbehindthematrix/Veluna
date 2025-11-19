// services/apiService.ts
import { RootState } from '@/src/store';
import { getRefreshToken } from '@/lib/supabase';

// ============================================================================
// CONFIGURATION
// ============================================================================

// TODO: Replace with your Express backend URL
const API_BASE_URL = __DEV__
  ? 'http://localhost:4000/api' // Development
  : 'https://your-production-api.com/api'; // Production

// ============================================================================
// API CLIENT
// ============================================================================

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

/**
 * Get access token from Redux store (if available) or SecureStore
 */
async function getAccessToken(): Promise<string | null> {
  try {
    // Try to get from SecureStore first (fallback)
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return null;

    // In a real implementation, you'd refresh the token here
    // For now, return the stored token or fetch a new one from your backend
    // You might want to store access token in SecureStore as well
    return refreshToken; // This should be your actual access token
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
}

/**
 * Make API request with automatic token handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    requiresAuth = true,
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  const requestHeaders: Record<string, string> = {
    ...headers,
  };

  if (!requestHeaders['Content-Type'] && !(body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  // Add authentication token if required
  if (requiresAuth) {
    const token = await getAccessToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body && method !== 'GET') {
    config.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: response.statusText || 'Unknown error',
      }));

      throw new Error(
        errorData.message || 
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data as T;
    }

    return null as T;
  } catch (error: any) {
    // Network errors, timeouts, etc.
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Please check your internet connection');
    }
    throw error;
  }
}

// ============================================================================
// USER PROFILE API METHODS
// ============================================================================

export interface UserProfileApiResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export const profileApi = {
  /**
   * Get user profile by userId
   */
  async getProfile(_userId: string): Promise<UserProfileApiResponse> {
    return apiRequest<UserProfileApiResponse>(`/profile`, {
      method: 'GET',
      requiresAuth: true,
    });
  },

  /**
   * Create or update user profile
   */
  async saveProfile(
    _userId: string,
    profileData: any
  ): Promise<UserProfileApiResponse> {
    return apiRequest<UserProfileApiResponse>(`/profile`, {
      method: 'PUT',
      body: profileData,
      requiresAuth: true,
    });
  },

  /**
   * Update avatar
   * Note: For file uploads, you might want to use FormData
   */
  async updateAvatar(
    _userId: string,
    imageUri: string
  ): Promise<UserProfileApiResponse> {
    // Option 1: Upload image to your backend
    // You might need to convert imageUri to FormData
    const formData = new FormData();
    formData.append('avatar', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any);

    return apiRequest<UserProfileApiResponse>(`/profile/avatar`, {
      method: 'POST',
      body: formData,
      requiresAuth: true,
    });
  },
};
