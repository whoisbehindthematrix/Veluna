/**
 * Cycle Entry Service
 * 
 * Handles backend sync for cycle entries (periods and symptoms)
 */

import api from '@/lib/api';
import type { CycleEntry } from '@/src/store/slices/cycleSlice';

// ============================================================================
// TYPES
// ============================================================================

export interface CycleEntryApiResponse {
  success?: boolean;
  data?: CycleEntry | CycleEntry[];
  message?: string;
}

// ============================================================================
// API METHODS
// ============================================================================

export const cycleEntryService = {
  /**
   * Get all cycle entries for a user
   */
  async getCycleEntries(): Promise<CycleEntry[]> {
    try {
      const response = await api.get<CycleEntryApiResponse | CycleEntry[]>('/cycle');
      
      // Handle both response formats
      if (Array.isArray(response.data)) {
        return response.data.map(entry => ({
          date: entry.date,
          isPeriod: entry.isPeriod,
          flowIntensity: entry.flowIntensity,
          symptoms: entry.symptoms,
          notes: entry.notes,
        }));
      }
      
      if ((response.data as CycleEntryApiResponse)?.success && (response.data as CycleEntryApiResponse).data) {
        const data = (response.data as CycleEntryApiResponse).data;
        const entries = Array.isArray(data) ? data : [data];
        return entries.map(entry => ({
          date: entry.date,
          isPeriod: entry.isPeriod,
          flowIntensity: entry.flowIntensity,
          symptoms: entry.symptoms,
          notes: entry.notes,
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching cycle entries:', error);
      return [];
    }
  },

  /**
   * Create or update a cycle entry
   */
  async saveCycleEntry(entry: CycleEntry): Promise<CycleEntry | null> {
    // Declare variables outside try block for error handling
    let dateString: string = '';
    let payload: any = {};
    
    try {
      // Ensure date is properly formatted
      // If date is already in YYYY-MM-DD format, use it as is
      // Otherwise, parse and format it
      if (entry.date && entry.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        dateString = entry.date;
      } else if (entry.date) {
        // Try to parse the date and convert to YYYY-MM-DD
        try {
          const dateObj = new Date(entry.date);
          if (isNaN(dateObj.getTime())) {
            throw new Error(`Invalid date format: ${entry.date}`);
          }
          // Format as YYYY-MM-DD
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          dateString = `${year}-${month}-${day}`;
        } catch (parseError) {
          console.error('❌ [Cycle Entry] Invalid date format:', entry.date);
          throw new Error(`Invalid date format: ${entry.date}`);
        }
      } else {
        throw new Error('Date is required');
      }
      
      // Validate the date string format
      if (!dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        throw new Error(`Date format validation failed: ${dateString}`);
      }
      
      // Build payload with proper structure
      // Backend validation expects datetime format (ISO 8601), so convert date to datetime at midnight UTC
      // Format: YYYY-MM-DDTHH:mm:ss.sssZ
      const dateTimeString = `${dateString}T00:00:00.000Z`;
      
      // Ensure isPeriod is always a boolean (not undefined)
      payload = {
        date: dateTimeString, // ISO datetime format (backend validation requires this)
        isPeriod: Boolean(entry.isPeriod === true || entry.isPeriod === 'true'), // Ensure boolean
      };
      
      // Remove any undefined or null values from payload
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === null) {
          delete payload[key];
        }
      });

      // Only add optional fields if they have values
      if (entry.flowIntensity) {
        payload.flowIntensity = entry.flowIntensity;
      }

      // Handle symptoms - ensure all values are valid numbers (1-5 range)
      if (entry.symptoms) {
        const symptoms: any = {};
        let hasValidSymptoms = false;

        // Only include symptoms that are valid numbers (1-5)
        if (typeof entry.symptoms.mood === 'number' && entry.symptoms.mood >= 1 && entry.symptoms.mood <= 5) {
          symptoms.mood = entry.symptoms.mood;
          hasValidSymptoms = true;
        }
        if (typeof entry.symptoms.cramps === 'number' && entry.symptoms.cramps >= 1 && entry.symptoms.cramps <= 5) {
          symptoms.cramps = entry.symptoms.cramps;
          hasValidSymptoms = true;
        }
        if (typeof entry.symptoms.energy === 'number' && entry.symptoms.energy >= 1 && entry.symptoms.energy <= 5) {
          symptoms.energy = entry.symptoms.energy;
          hasValidSymptoms = true;
        }

        // Only include symptoms if at least one is valid
        if (hasValidSymptoms) {
          payload.symptoms = symptoms;
        }
      }

      if (entry.notes && entry.notes.trim()) {
        payload.notes = entry.notes.trim();
      }

      console.log('🔵 [Cycle Entry] Saving to backend:', JSON.stringify(payload, null, 2));
      console.log('🔵 [Cycle Entry] Payload keys:', Object.keys(payload));
      console.log('🔵 [Cycle Entry] Entry isPeriod:', entry.isPeriod, 'type:', typeof entry.isPeriod);
      console.log('🔵 [Cycle Entry] Date format:', dateString, '→ DateTime format:', dateTimeString);

      const response = await api.post<CycleEntryApiResponse | CycleEntry>('/cycle', payload);
      
      console.log('✅ [Cycle Entry] Successfully saved:', response.data);
      
      // Handle both response formats
      if ((response.data as CycleEntryApiResponse)?.success) {
        const data = (response.data as CycleEntryApiResponse).data;
        return Array.isArray(data) ? data[0] : data || null;
      }
      
      return response.data as CycleEntry || null;
    } catch (error: any) {
      console.error('❌ [Cycle Entry] Error saving to backend');
      console.error('❌ [Cycle Entry] Entry that failed:', JSON.stringify({
        date: entry.date,
        isPeriod: entry.isPeriod,
        hasSymptoms: !!entry.symptoms,
        symptomsKeys: entry.symptoms ? Object.keys(entry.symptoms) : [],
      }, null, 2));
      
      // Enhanced error logging with validation error details
      if (error.response) {
        console.error('❌ [Cycle Entry] Error Response Status:', error.response.status);
        console.error('❌ [Cycle Entry] Error Response Data:', JSON.stringify(error.response.data, null, 2));
        
        // Try to extract detailed error message
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          console.error('❌ [Cycle Entry] Error Message (string):', errorData);
        } else if (errorData && typeof errorData === 'object') {
          console.error('❌ [Cycle Entry] Full Error Object:', JSON.stringify(errorData, null, 2));
          
          // Check for validation errors in various formats
          let validationErrors: any = null;
          
          if (errorData.error) {
            validationErrors = errorData.error;
            console.error('❌ [Cycle Entry] Validation Errors:', JSON.stringify(errorData.error, null, 2));
          }
          if (errorData.message) {
            console.error('❌ [Cycle Entry] Error Message:', errorData.message);
          }
          if (errorData.errors) {
            validationErrors = errorData.errors;
            console.error('❌ [Cycle Entry] Errors Array:', JSON.stringify(errorData.errors, null, 2));
          }
          if (errorData.details) {
            console.error('❌ [Cycle Entry] Error Details:', JSON.stringify(errorData.details, null, 2));
          }
          
          // Log the payload that caused the error for debugging
          console.error('❌ [Cycle Entry] Payload sent:', JSON.stringify(payload, null, 2));
          
          // Check if it's a datetime format error
          const errorString = JSON.stringify(errorData).toLowerCase();
          if (errorString.includes('datetime') || errorString.includes('invalid_format')) {
            console.error('⚠️ [Cycle Entry] DATETIME FORMAT ERROR DETECTED');
            console.error('⚠️ [Cycle Entry] Backend might expect datetime format instead of date');
            console.error('⚠️ [Cycle Entry] Current date format:', dateString);
            console.error('⚠️ [Cycle Entry] Validation error details:', validationErrors);
          }
        }
      } else if (error.request) {
        console.error('❌ [Cycle Entry] Request made but no response received');
        console.error('❌ [Cycle Entry] Request config:', {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
        });
      } else {
        console.error('❌ [Cycle Entry] Error setting up request:', error.message);
      }
      
      // Don't throw - let the caller handle it
      return null;
    }
  },

  /**
   * Sync all cycle entries to backend
   */
  async syncCycleEntries(entries: CycleEntry[]): Promise<boolean> {
    try {
      // Sync entries one by one or in batch
      const results = await Promise.allSettled(
        entries.map(entry => this.saveCycleEntry(entry))
      );
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      console.log(`✅ [Cycle Entry] Synced ${successful}/${entries.length} entries`);
      
      return successful > 0;
    } catch (error) {
      console.error('Error syncing cycle entries:', error);
      return false;
    }
  },
};

