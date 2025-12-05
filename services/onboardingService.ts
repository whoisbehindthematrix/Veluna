/**
 * Onboarding Service
 * 
 * Handles API communication for onboarding data
 */

import api from '@/lib/api';

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
import type {
  OnboardingData,
  WeightRange,
  HeightRange,
  ReproductiveStage,
  HealthGoal,
  BirthControl,
  CycleLength,
  PeriodDuration,
  MedicalDiagnosis,
  PhysicalSymptom,
  PMSMood,
  StressLevel,
  FoodStruggle,
  DietaryLifestyle,
} from '@/src/store/slices/onboardingSlice';

export interface OnboardingResponse {
  success: boolean;
  data?: OnboardingData;
  message?: string;
}

/**
 * Convert cycle length enum to numeric value
 */
function cycleLengthToNumber(cycleLength: CycleLength | undefined | null): number | undefined {
  if (!cycleLength) return undefined;
  
  const mapping: Record<CycleLength, number> = {
    'less_than_21': 20,
    '21_24': 23,
    '25_30': 28, // Average
    '31_35': 33,
    'longer_than_35': 36,
    'irregular': 28, // Default for irregular
  };
  
  return mapping[cycleLength];
}

/**
 * Convert period duration enum to numeric value
 */
function periodDurationToNumber(periodDuration: PeriodDuration | undefined | null): number | undefined {
  if (!periodDuration) return undefined;
  
  const mapping: Record<PeriodDuration, number> = {
    '1_3': 2, // Average of 1-3
    '4_6': 5, // Average of 4-6
    '7_plus': 7,
  };
  
  return mapping[periodDuration];
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth: string | undefined | null): number | undefined {
  if (!dateOfBirth) return undefined;
  
  try {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age > 0 && age < 120 ? age : undefined;
  } catch (error) {
    console.error('Error calculating age:', error);
    return undefined;
  }
}

/**
 * Clean payload - remove undefined/null values and transform enums to numbers
 * IMPORTANT: Backend requires averageCycleLength and periodDuration as numbers
 */
function cleanOnboardingPayload(data: Partial<OnboardingData>): any {
  const cleaned: any = {};
  
  // Transform and map fields
  if (data.dateOfBirth) {
    cleaned.dateOfBirth = data.dateOfBirth;
    // Calculate age from date of birth
    const age = calculateAge(data.dateOfBirth);
    if (age !== undefined) {
      cleaned.age = age;
    }
  }
  
  // REQUIRED: Map cycleLength to averageCycleLength (backend expects this as a number)
  // If cycleLength enum is provided, convert it to number
  // Otherwise, use default of 28 (average cycle length)
  let averageCycleLength: number | undefined;
  if (data.cycleLength) {
    averageCycleLength = cycleLengthToNumber(data.cycleLength);
  }
  
  // If we still don't have a number, check if averageCycleLength was directly provided
  if (averageCycleLength === undefined && typeof data.averageCycleLength === 'number') {
    averageCycleLength = data.averageCycleLength;
  }
  
  // Always include averageCycleLength - default to 28 if not provided
  cleaned.averageCycleLength = averageCycleLength ?? 28;
  
  // Keep enum for reference (optional)
  if (data.cycleLength) {
    cleaned.cycleLength = data.cycleLength;
  }
  
  // REQUIRED: Map periodDuration to numeric value (backend expects numeric, not enum string)
  // If periodDuration enum is provided, convert it to number
  // Otherwise, use default of 5 (average period duration)
  let periodDuration: number | undefined;
  if (data.periodDuration) {
    periodDuration = periodDurationToNumber(data.periodDuration);
  }
  
  // Always include periodDuration - default to 5 if not provided
  cleaned.periodDuration = periodDuration ?? 5;
  
  // Keep all other fields that are not undefined/null
  const fieldsToKeep: (keyof OnboardingData)[] = [
    'weightRange',
    'heightRange',
    'reproductiveStage',
    'healthGoal',
    'birthControl',
    'medicalDiagnoses',
    'physicalSymptoms',
    'pmsMood',
    'stressLevel',
    'foodStruggles',
    'dietaryLifestyle',
  ];
  
  fieldsToKeep.forEach((field) => {
    const value = data[field];
    if (value !== undefined && value !== null) {
      // For arrays, only include if not empty
      if (Array.isArray(value)) {
        if (value.length > 0) {
          cleaned[field] = value;
        }
      } else if (value !== '' && value !== null) {
        // Only include non-empty string values
        cleaned[field] = value;
      }
    }
  });
  
  // Final cleanup: remove any undefined values that might have slipped through
  // BUT keep required numeric fields even if they're the defaults
  const finalCleaned: any = {};
  Object.keys(cleaned).forEach((key) => {
    const value = cleaned[key];
    
    // Always keep required numeric fields
    if (key === 'averageCycleLength' || key === 'periodDuration') {
      finalCleaned[key] = value;
      return;
    }
    
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          finalCleaned[key] = value;
        }
      } else {
        finalCleaned[key] = value;
      }
    }
  });
  
  // Validate required fields are present
  if (typeof finalCleaned.averageCycleLength !== 'number') {
    console.warn('⚠️ [cleanOnboardingPayload] averageCycleLength is missing or invalid, using default: 28');
    finalCleaned.averageCycleLength = 28;
  }
  
  if (typeof finalCleaned.periodDuration !== 'number') {
    console.warn('⚠️ [cleanOnboardingPayload] periodDuration is missing or invalid, using default: 5');
    finalCleaned.periodDuration = 5;
  }
  
  if (__DEV__) {
    console.log('📦 [cleanOnboardingPayload] Final cleaned payload:', {
      averageCycleLength: finalCleaned.averageCycleLength,
      periodDuration: finalCleaned.periodDuration,
      hasDateOfBirth: !!finalCleaned.dateOfBirth,
      hasAge: typeof finalCleaned.age === 'number',
    });
  }
  
  return finalCleaned;
}

class OnboardingService {
  /**
   * Save onboarding data to backend
   */
  async saveOnboardingData(data: Partial<OnboardingData>): Promise<OnboardingResponse> {
    try {
      // Validate required fields before cleaning
      if (__DEV__) {
        console.log('🔍 [OnboardingService] Raw data before cleaning:', {
          hasCycleLength: !!data.cycleLength,
          cycleLength: data.cycleLength,
          hasPeriodDuration: !!data.periodDuration,
          periodDuration: data.periodDuration,
          hasAverageCycleLength: typeof data.averageCycleLength === 'number',
          averageCycleLength: data.averageCycleLength,
        });
      }
      
      // Clean and transform the payload
      const cleanedPayload = cleanOnboardingPayload(data);
      
      // Validate required numeric fields are present
      if (typeof cleanedPayload.averageCycleLength !== 'number') {
        throw new Error('averageCycleLength is required and must be a number');
      }
      
      if (typeof cleanedPayload.periodDuration !== 'number') {
        throw new Error('periodDuration is required and must be a number');
      }
      
      log('📤 [OnboardingService] POST /onboarding');
      log('📦 Cleaned Payload:', cleanedPayload);
      log('📋 Required Fields Check:', {
        averageCycleLength: cleanedPayload.averageCycleLength,
        periodDuration: cleanedPayload.periodDuration,
        bothPresent: typeof cleanedPayload.averageCycleLength === 'number' && typeof cleanedPayload.periodDuration === 'number',
      });
      log('🔗 API Base URL:', api.defaults.baseURL);
      
      const response = await api.post('/onboarding', cleanedPayload);
      
      log('✅ [OnboardingService] Response received:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
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
          data: error?.config?.data ? JSON.parse(error?.config?.data) : null,
        },
      };
      
      logError('❌ [OnboardingService] Failed to save data', error);
      log('🔍 [OnboardingService] Full error details:', errorDetails);
      
      throw error;
    }
  }

  /**
   * Get onboarding data from backend
   */
  async getOnboardingData(): Promise<OnboardingResponse> {
    try {
      const response = await api.get('/onboarding');
      return {
        success: true,
        data: response.data?.data || response.data,
        message: response.data?.message,
      };
    } catch (error: any) {
      console.error('❌ [OnboardingService] Failed to get data:', error);
      throw error;
    }
  }

  /**
   * Complete onboarding process
   */
  async completeOnboarding(): Promise<OnboardingResponse> {
    try {
      log('📤 [OnboardingService] POST /onboarding/complete');
      log('🔗 API Base URL:', api.defaults.baseURL);
      
      const response = await api.post('/onboarding/complete');
      
      log('✅ [OnboardingService] Complete response:', {
        status: response.status,
        data: response.data,
      });
      
      return {
        success: true,
        data: response.data?.data || response.data,
        message: response.data?.message,
      };
    } catch (error: any) {
      const errorDetails = {
        message: error?.message,
        response: {
          status: error?.response?.status,
          data: error?.response?.data,
        },
        request: {
          url: error?.config?.url,
          method: error?.config?.method,
        },
      };
      
      logError('❌ [OnboardingService] Failed to complete onboarding', error);
      log('🔍 [OnboardingService] Complete error details:', errorDetails);
      
      throw error;
    }
  }

  /**
   * Update specific field in onboarding data
   */
  async updateOnboardingField(
    field: keyof OnboardingData,
    value: any
  ): Promise<OnboardingResponse> {
    try {
      // If updating cycleLength or periodDuration, transform to number
      let cleanedValue = value;
      if (field === 'cycleLength') {
        cleanedValue = cycleLengthToNumber(value) ?? value;
      } else if (field === 'periodDuration') {
        cleanedValue = periodDurationToNumber(value) ?? value;
      }
      
      const response = await api.patch('/onboarding', { [field]: cleanedValue });
      return {
        success: true,
        data: response.data?.data || response.data,
        message: response.data?.message,
      };
    } catch (error: any) {
      console.error('❌ [OnboardingService] Failed to update field:', error);
      throw error;
    }
  }
}

export const onboardingService = new OnboardingService();
