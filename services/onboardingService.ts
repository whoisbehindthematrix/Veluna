/**
 * Onboarding Service
 * 
 * Handles API communication for onboarding data split into two parts:
 * 1. Basic onboarding (/api/onboarding)
 * 2. Onboarding questions (/api/onboarding/questions)
 */

import api from '@/lib/api';
import type {
  BasicOnboardingData,
  OnboardingQuestionsData,
} from '@/src/store/slices/onboardingSlice';

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

const logError = (message: string, error: any) => {
  if (__DEV__ && Reactotron) {
    Reactotron.error(message, error);
    Reactotron.display({
      name: '❌ Onboarding Service Error',
      preview: message,
      value: error,
    });
  }
  console.error(message, error);
};

export interface OnboardingResponse {
  success: boolean;
  data?: any;
  message?: string;
}

/**
 * Clean payload - remove undefined/null values
 */
function cleanPayload(data: any): any {
  const cleaned: any = {};
  
  Object.keys(data).forEach((key) => {
    const value = data[key];
    
    // Skip undefined and null
    if (value === undefined || value === null) {
      return;
    }
    
    // For arrays, only include if not empty
    if (Array.isArray(value)) {
      if (value.length > 0) {
        cleaned[key] = value;
      }
    } else if (typeof value === 'string' && value.trim() === '') {
      // Skip empty strings
      return;
    } else {
      cleaned[key] = value;
    }
  });
  
  return cleaned;
}

class OnboardingService {
  // ============================================================================
  // BASIC ONBOARDING ENDPOINTS
  // ============================================================================

  /**
   * Save basic onboarding data to backend
   * POST /api/onboarding
   */
  async saveBasicOnboarding(data: Partial<BasicOnboardingData>): Promise<OnboardingResponse> {
    try {
      // Ensure required fields have defaults
      const payload: any = {
        ...data,
        averageCycleLength: data.averageCycleLength ?? 28,
        periodDuration: data.periodDuration ?? 5,
      };
      
      // Validate required fields
      if (typeof payload.averageCycleLength !== 'number' || 
          payload.averageCycleLength < 21 || 
          payload.averageCycleLength > 40) {
        throw new Error('averageCycleLength must be a number between 21 and 40');
      }
      
      if (typeof payload.periodDuration !== 'number' || 
          payload.periodDuration < 1 || 
          payload.periodDuration > 7) {
        throw new Error('periodDuration must be a number between 1 and 7');
      }
      
      const cleanedPayload = cleanPayload(payload);
      
      log('📤 [OnboardingService] POST /onboarding');
      log('📦 Payload:', cleanedPayload);
      log('🔗 API Base URL:', api.defaults.baseURL);
      log('📋 Payload validation:', {
        hasAverageCycleLength: typeof cleanedPayload.averageCycleLength === 'number',
        averageCycleLength: cleanedPayload.averageCycleLength,
        hasPeriodDuration: typeof cleanedPayload.periodDuration === 'number',
        periodDuration: cleanedPayload.periodDuration,
        payloadKeys: Object.keys(cleanedPayload),
      });
      
      const response = await api.post('/onboarding', cleanedPayload);
      
      log('✅ [OnboardingService] Response received:', {
        status: response.status,
        data: response.data,
      });
      
      return {
        success: true,
        data: response.data?.data || response.data,
        message: response.data?.message,
      };
    } catch (error: any) {
      logError('❌ [OnboardingService] Failed to save basic onboarding', error);
      throw error;
    }
  }

  /**
   * Get basic onboarding data from backend
   * GET /api/onboarding
   */
  async getBasicOnboarding(): Promise<OnboardingResponse> {
    try {
      const response = await api.get('/onboarding');
      return {
        success: true,
        data: response.data?.data || response.data,
        message: response.data?.message,
      };
    } catch (error: any) {
      logError('❌ [OnboardingService] Failed to get basic onboarding', error);
      throw error;
    }
  }

  /**
   * Update specific fields in basic onboarding
   * PATCH /api/onboarding
   */
  async updateBasicOnboarding(data: Partial<BasicOnboardingData>): Promise<OnboardingResponse> {
    try {
      const cleanedPayload = cleanPayload(data);
      
      log('📤 [OnboardingService] PATCH /onboarding');
      log('📦 Payload:', cleanedPayload);
      
      const response = await api.patch('/onboarding', cleanedPayload);
      
      return {
        success: true,
        data: response.data?.data || response.data,
        message: response.data?.message,
      };
    } catch (error: any) {
      logError('❌ [OnboardingService] Failed to update basic onboarding', error);
      throw error;
    }
  }

  /**
   * Complete basic onboarding
   * POST /api/onboarding/complete
   */
  async completeBasicOnboarding(): Promise<OnboardingResponse> {
    try {
      log('📤 [OnboardingService] POST /onboarding/complete');
      log('🔗 API Base URL:', api.defaults.baseURL);
      
      const response = await api.post('/onboarding/complete');
      
      log('✅ [OnboardingService] Complete response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers,
      });
      
      return {
        success: true,
        data: response.data?.data || response.data,
        message: response.data?.message,
      };
    } catch (error: any) {
      const errorDetails = {
        message: error?.message,
        code: error?.code,
        response: {
          status: error?.response?.status,
          statusText: error?.response?.statusText,
          data: error?.response?.data,
          headers: error?.response?.headers,
        },
        request: {
          url: error?.config?.url,
          method: error?.config?.method,
          baseURL: error?.config?.baseURL,
        },
      };
      
      logError('❌ [OnboardingService] Failed to complete basic onboarding', error);
      log('🔍 [OnboardingService] Complete error details:', errorDetails);
      throw error;
    }
  }

  // ============================================================================
  // ONBOARDING QUESTIONS ENDPOINTS
  // ============================================================================

  /**
   * Save onboarding questions to backend
   * POST /api/onboarding/questions
   */
  async saveOnboardingQuestions(data: Partial<OnboardingQuestionsData>): Promise<OnboardingResponse> {
    try {
      // Validate physicalSymptoms max 3
      if (data.physicalSymptoms && data.physicalSymptoms.length > 3) {
        throw new Error('physicalSymptoms cannot have more than 3 items');
      }
      
      const cleanedPayload = cleanPayload(data);
      
      log('📤 [OnboardingService] POST /onboarding/questions');
      log('📦 Payload:', cleanedPayload);
      
      const response = await api.post('/onboarding/questions', cleanedPayload);
      
      log('✅ [OnboardingService] Response received:', {
        status: response.status,
        data: response.data,
      });
      
      return {
        success: true,
        data: response.data?.data || response.data,
        message: response.data?.message,
      };
    } catch (error: any) {
      logError('❌ [OnboardingService] Failed to save onboarding questions', error);
      throw error;
    }
  }

  /**
   * Get onboarding questions from backend
   * GET /api/onboarding/questions
   */
  async getOnboardingQuestions(): Promise<OnboardingResponse> {
    try {
      const response = await api.get('/onboarding/questions');
      return {
        success: true,
        data: response.data?.data || response.data,
        message: response.data?.message,
      };
    } catch (error: any) {
      logError('❌ [OnboardingService] Failed to get onboarding questions', error);
      throw error;
    }
  }

  /**
   * Update specific fields in onboarding questions
   * PATCH /api/onboarding/questions
   */
  async updateOnboardingQuestions(data: Partial<OnboardingQuestionsData>): Promise<OnboardingResponse> {
    try {
      // Validate physicalSymptoms max 3
      if (data.physicalSymptoms && data.physicalSymptoms.length > 3) {
        throw new Error('physicalSymptoms cannot have more than 3 items');
      }
      
      const cleanedPayload = cleanPayload(data);
      
      log('📤 [OnboardingService] PATCH /onboarding/questions');
      log('📦 Payload:', cleanedPayload);
      
      const response = await api.patch('/onboarding/questions', cleanedPayload);
      
      return {
        success: true,
        data: response.data?.data || response.data,
        message: response.data?.message,
      };
    } catch (error: any) {
      logError('❌ [OnboardingService] Failed to update onboarding questions', error);
      throw error;
    }
  }

  /**
   * Complete onboarding questions
   * POST /api/onboarding/questions/complete
   */
  async completeOnboardingQuestions(): Promise<OnboardingResponse> {
    try {
      log('📤 [OnboardingService] POST /onboarding/questions/complete');
      
      const response = await api.post('/onboarding/questions/complete');
      
      log('✅ [OnboardingService] Questions complete response:', {
        status: response.status,
        data: response.data,
      });
      
      return {
        success: true,
        data: response.data?.data || response.data,
        message: response.data?.message,
      };
    } catch (error: any) {
      logError('❌ [OnboardingService] Failed to complete onboarding questions', error);
      throw error;
    }
  }
}

export const onboardingService = new OnboardingService();
