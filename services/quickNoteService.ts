/**
 * Quick Note Service
 * 
 * Handles backend sync for quick notes
 */

import api from '@/lib/api';
import type { QuickNote } from '@/src/store/slices/cycleSlice';

// ============================================================================
// TYPES
// ============================================================================

export interface QuickNoteApiResponse {
  success: boolean;
  data?: QuickNote | QuickNote[];
  message?: string;
}

// ============================================================================
// API METHODS
// ============================================================================

export const quickNoteService = {
  /**
   * Get all quick notes for a user
   */
  async getQuickNotes(): Promise<QuickNote[]> {
    try {
      const response = await api.get<QuickNoteApiResponse>('/cycle/quick-notes');
      if (response.data.success && response.data.data) {
        return Array.isArray(response.data.data) 
          ? response.data.data 
          : [response.data.data];
      }
      return [];
    } catch (error) {
      console.error('Error fetching quick notes:', error);
      return [];
    }
  },

  /**
   * Get quick notes for a specific date
   */
  async getQuickNotesByDate(date: string): Promise<QuickNote[]> {
    try {
      const response = await api.get<QuickNoteApiResponse>(`/cycle/quick-notes?date=${date}`);
      if (response.data.success && response.data.data) {
        return Array.isArray(response.data.data) 
          ? response.data.data 
          : [response.data.data];
      }
      return [];
    } catch (error) {
      console.error('Error fetching quick notes by date:', error);
      return [];
    }
  },

  /**
   * Create a new quick note
   */
  async createQuickNote(note: Omit<QuickNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<QuickNote | null> {
    // Declare variables outside try block for error handling
    let dateString: string = '';
    let payload: any = {};
    
    try {
      // Ensure date is properly formatted as ISO datetime
      // Parse the date and convert to ISO datetime format
      if (note.date && note.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        dateString = note.date;
      } else if (note.date) {
        try {
          const dateObj = new Date(note.date);
          if (isNaN(dateObj.getTime())) {
            throw new Error(`Invalid date format: ${note.date}`);
          }
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          dateString = `${year}-${month}-${day}`;
        } catch (parseError) {
          console.error('❌ [Quick Note] Invalid date format:', note.date);
          throw new Error(`Invalid date format: ${note.date}`);
        }
      } else {
        throw new Error('Date is required');
      }
      
      // Validate the date string format
      if (!dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        throw new Error(`Date format validation failed: ${dateString}`);
      }
      
      // Backend expects ISO datetime format (YYYY-MM-DDTHH:mm:ss.sssZ)
      const dateTimeString = `${dateString}T00:00:00.000Z`;
      
      // Format reminderTime if present and valid
      let reminderTimeString: string | undefined = undefined;
      if (note.reminder && note.reminderTime) {
        try {
          // If reminderTime is already in ISO format, use it
          if (note.reminderTime.includes('T') && note.reminderTime.includes('Z')) {
            reminderTimeString = note.reminderTime;
          } else {
            // Try to parse and format as ISO datetime
            const reminderDate = new Date(note.reminderTime);
            if (!isNaN(reminderDate.getTime())) {
              reminderTimeString = reminderDate.toISOString();
            }
          }
        } catch (error) {
          console.warn('⚠️ [Quick Note] Invalid reminderTime format, skipping:', note.reminderTime);
        }
      }
      
      // Build payload with proper structure
      payload = {
        date: dateTimeString, // ISO datetime format (backend validation requires this)
        title: note.title,
        text: note.text,
        reminder: Boolean(note.reminder),
        icon: note.icon || undefined,
        reminderTime: reminderTimeString,
      };
      
      // Remove undefined values
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === null) {
          delete payload[key];
        }
      });

      console.log('🔵 [Quick Note] Creating note:', JSON.stringify(payload, null, 2));
      console.log('🔵 [Quick Note] Date format:', dateString, '→ DateTime format:', dateTimeString);

      const response = await api.post<QuickNoteApiResponse>('/cycle/quick-notes', payload);
      
      if (response.data.success && response.data.data) {
        const data = Array.isArray(response.data.data) 
          ? response.data.data[0] 
          : response.data.data;
        console.log('✅ [Quick Note] Created successfully:', data);
        return data;
      }
      
      console.warn('⚠️ [Quick Note] Unexpected response format:', response.data);
      return null;
    } catch (error: any) {
      console.error('❌ [Quick Note] Error creating note:', error);
      console.error('❌ [Quick Note] Entry that failed:', JSON.stringify({
        date: note.date,
        title: note.title,
        reminder: note.reminder,
        reminderTime: note.reminderTime,
      }, null, 2));
      
      // Enhanced error logging
      if (error.response) {
        console.error('❌ [Quick Note] Error Response Status:', error.response.status);
        console.error('❌ [Quick Note] Error Response Data:', JSON.stringify(error.response.data, null, 2));
        
        const errorData = error.response.data;
        if (typeof errorData === 'object' && errorData !== null) {
          const errorString = JSON.stringify(errorData).toLowerCase();
          if (errorString.includes('datetime') || errorString.includes('invalid_format')) {
            console.error('⚠️ [Quick Note] DATETIME FORMAT ERROR DETECTED');
            console.error('⚠️ [Quick Note] Payload sent:', JSON.stringify(payload, null, 2));
            console.error('⚠️ [Quick Note] Current date format:', dateString);
          }
        }
      }
      
      throw error;
    }
  },

  /**
   * Update an existing quick note
   */
  async updateQuickNote(id: string, updates: Partial<QuickNote>): Promise<QuickNote | null> {
    // Declare variables outside try block for error handling
    let dateTimeString: string | undefined = undefined;
    let payload: any = {};
    
    try {
      // Format date if present - backend expects ISO datetime format
      if (updates.date) {
        let dateString: string = '';
        
        if (updates.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          dateString = updates.date;
        } else {
          try {
            const dateObj = new Date(updates.date);
            if (!isNaN(dateObj.getTime())) {
              const year = dateObj.getFullYear();
              const month = String(dateObj.getMonth() + 1).padStart(2, '0');
              const day = String(dateObj.getDate()).padStart(2, '0');
              dateString = `${year}-${month}-${day}`;
            }
          } catch (error) {
            console.error('❌ [Quick Note] Invalid date format in update:', updates.date);
          }
        }
        
        if (dateString && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
          dateTimeString = `${dateString}T00:00:00.000Z`;
        }
      }
      
      // Format reminderTime if present and valid
      let reminderTimeString: string | undefined = undefined;
      if (updates.reminderTime) {
        try {
          if (updates.reminderTime.includes('T') && updates.reminderTime.includes('Z')) {
            reminderTimeString = updates.reminderTime;
          } else {
            const reminderDate = new Date(updates.reminderTime);
            if (!isNaN(reminderDate.getTime())) {
              reminderTimeString = reminderDate.toISOString();
            }
          }
        } catch (error) {
          console.warn('⚠️ [Quick Note] Invalid reminderTime format in update:', updates.reminderTime);
        }
      }
      
      // Build payload - only include fields that are being updated
      payload = { ...updates };
      
      if (dateTimeString) {
        payload.date = dateTimeString;
      } else if (updates.date === undefined) {
        // Don't include date if it's not being updated
        delete payload.date;
      }
      
      if (reminderTimeString !== undefined) {
        payload.reminderTime = reminderTimeString;
      } else if (updates.reminderTime === undefined) {
        delete payload.reminderTime;
      }
      
      // Remove undefined and null values
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === null) {
          delete payload[key];
        }
      });

      console.log('🔵 [Quick Note] Updating note:', id, JSON.stringify(payload, null, 2));

      const response = await api.put<QuickNoteApiResponse>(`/cycle/quick-notes/${id}`, payload);
      
      if (response.data.success && response.data.data) {
        const data = Array.isArray(response.data.data) 
          ? response.data.data[0] 
          : response.data.data;
        console.log('✅ [Quick Note] Updated successfully:', data);
        return data;
      }
      
      console.warn('⚠️ [Quick Note] Unexpected response format:', response.data);
      return null;
    } catch (error: any) {
      console.error('❌ [Quick Note] Error updating note:', error);
      console.error('❌ [Quick Note] Updates that failed:', JSON.stringify(updates, null, 2));
      
      // Enhanced error logging
      if (error.response) {
        console.error('❌ [Quick Note] Error Response Status:', error.response.status);
        console.error('❌ [Quick Note] Error Response Data:', JSON.stringify(error.response.data, null, 2));
        
        const errorData = error.response.data;
        if (typeof errorData === 'object' && errorData !== null) {
          const errorString = JSON.stringify(errorData).toLowerCase();
          if (errorString.includes('datetime') || errorString.includes('invalid_format')) {
            console.error('⚠️ [Quick Note] DATETIME FORMAT ERROR DETECTED');
            console.error('⚠️ [Quick Note] Payload sent:', JSON.stringify(payload, null, 2));
          }
        }
      }
      
      throw error;
    }
  },

  /**
   * Delete a quick note
   */
  async deleteQuickNote(id: string): Promise<boolean> {
    try {
      const response = await api.delete<QuickNoteApiResponse>(`/cycle/quick-notes/${id}`);
      return response.data.success || false;
    } catch (error) {
      console.error('Error deleting quick note:', error);
      throw error;
    }
  },

  /**
   * Sync all quick notes to backend
   */
  async syncQuickNotes(notes: QuickNote[]): Promise<boolean> {
    try {
      const response = await api.post<QuickNoteApiResponse>('/cycle/quick-notes/sync', { notes });
      return response.data.success || false;
    } catch (error) {
      console.error('Error syncing quick notes:', error);
      return false;
    }
  },
};

