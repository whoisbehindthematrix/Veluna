// lib/api/index.ts
// Direct API client with axios - no Supabase dependencies
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_BASE_URL = `${process.env.EXPO_PUBLIC_API_URL}/api`

// Reactotron logging (only in dev)
let Reactotron: any = null;
if (__DEV__) {
  try {
    Reactotron = require('reactotron-react-native').default;
  } catch (e) {
    // Reactotron not available
  }
}

const log = (...args: any[]) => {
  if (__DEV__ && Reactotron) {
    Reactotron.log(...args);
  }
  console.log(...args);
}; 

// Keys for secure storage
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

// Save tokens
export const saveTokens = async (access: string, refresh: string) => {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh);
};

// Get tokens
export const getAccessToken = () => SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

export const removeTokens = async () => {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
};

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log API base URL on initialization
if (__DEV__) {
  log('🔗 API Client initialized:', {
    baseURL: API_BASE_URL,
    env: process.env.EXPO_PUBLIC_API_URL,
  });
}

// Attach access token before each request
api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Log request in dev mode
  if (__DEV__) {
    log('📤 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      data: config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : undefined,
      headers: {
        ...config.headers,
        Authorization: token ? 'Bearer ***' : 'None',
      },
    });
  }
  
  return config;
});

// Handle 401 -> auto refresh -> retry
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    // Log successful response in dev mode
    if (__DEV__) {
      log('✅ API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.config.url,
        method: response.config.method?.toUpperCase(),
        data: response.data,
      });
    }
    return response;
  },
  async (error) => {
    // Log error response in dev mode
    if (__DEV__) {
      const errorLog = {
        message: error?.message,
        code: error?.code,
        response: error?.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
        } : null,
        request: error?.config ? {
          url: error.config.url,
          method: error.config.method?.toUpperCase(),
          baseURL: error.config.baseURL,
          data: error.config.data ? (typeof error.config.data === 'string' ? JSON.parse(error.config.data) : error.config.data) : undefined,
        } : null,
      };
      
      if (Reactotron) {
        Reactotron.error('❌ API Error', errorLog);
        Reactotron.display({
          name: '❌ API Error',
          preview: `${error?.config?.method?.toUpperCase()} ${error?.config?.url}`,
          value: errorLog,
        });
      }
      log('❌ API Error:', errorLog);
    }
    const originalRequest = error.config;

    // List of auth endpoints that should NOT trigger token refresh
    // These endpoints return 401 for invalid credentials, not expired tokens
    const authEndpoints = [
      '/auth/login',
      '/auth/signup',
      '/auth/register',
      '/auth/signin',
      '/auth/signout',
      '/auth/logout',
      '/auth/password',
      '/auth/reset-password',
      '/auth/forgot-password',
      '/token/refresh', // Don't refresh when refresh endpoint fails
    ];
    
    const requestUrl = originalRequest?.url || '';
    const isAuthEndpoint = authEndpoints.some(endpoint => requestUrl.includes(endpoint));

    // If unauthorized and not already refreshing → refresh
    // BUT skip refresh for auth endpoints (they return 401 for invalid credentials)
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();
        
        // If no refresh token, clear tokens and reject - user needs to log in again
        if (!refreshToken) {
          if (__DEV__) {
            log('⚠️ [Token Refresh] No refresh token found, clearing tokens and redirecting to login');
          }
          await removeTokens();
          processQueue(new Error("Session expired. Please log in again."), null);
          return Promise.reject(new Error("Session expired. Please log in again."));
        }

        const { data } = await axios.post(`${API_BASE_URL}/token/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccess = data.session.access_token;
        const newRefresh = data.session.refresh_token;

        await saveTokens(newAccess, newRefresh);

        api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
        processQueue(null, newAccess);

        return api(originalRequest);
      } catch (err: any) {
        // If refresh fails (invalid token, network error, etc.), clear tokens
        if (__DEV__) {
          log('❌ [Token Refresh] Failed:', err?.response?.data || err?.message);
        }
        await removeTokens();
        
        // Create a user-friendly error message
        const errorMessage = err?.response?.data?.message || 
                           err?.message || 
                           "Session expired. Please log in again.";
        
        processQueue(new Error(errorMessage), null);
        return Promise.reject(new Error(errorMessage));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
