# Cycle Entry 400 Error Fix

## Problem
The backend is returning a 400 (Bad Request) error when trying to save cycle entries. This indicates a validation error - the request format doesn't match what the backend expects.

## Changes Made

### 1. Removed `undefined` Values
- **Issue**: Sending `undefined` values in the payload can cause validation errors
- **Fix**: Only include fields in the payload if they have actual values
- **Location**: `services/cycleEntryService.ts` - `saveCycleEntry()` method

### 2. Enhanced Error Logging
- Added detailed error logging to see exactly what the backend returns
- Logs validation errors, response data, status codes, and error messages
- This will help identify what the backend actually expects

### 3. Proper Data Cleaning
- Only adds symptoms if they have valid values (not undefined/null)
- Only adds optional fields (flowIntensity, notes) if they exist
- Trims notes text to avoid whitespace issues

## Next Steps

When you see the error again, check the console logs for:

1. **Validation Errors** - Will show which fields are invalid
2. **Error Response Data** - The full backend error response
3. **Error Message** - Specific error message from backend

### Possible Issues to Check:

1. **Field Name Format**: Backend might expect `is_period` (snake_case) instead of `isPeriod` (camelCase)
   - If so, we need to transform the payload before sending

2. **Date Format**: Backend might expect a different date format
   - Currently sending: `YYYY-MM-DD`
   - Could need: ISO string or different format

3. **Required Fields**: Backend might require additional fields we're not sending
   - Check backend validation schema

4. **Authentication**: The request might be failing due to missing/invalid auth token
   - Check if token is being sent in headers

## To Debug Further:

1. Run the app and trigger a cycle entry save
2. Check the console for the detailed error logs
3. Look for the "❌ Validation Errors:" log line
4. Share that output so we can adjust the payload format accordingly

## Current Payload Format:

```json
{
  "date": "2024-01-15",           // YYYY-MM-DD format
  "isPeriod": true,                // boolean
  "flowIntensity": "medium",       // optional, only if exists
  "symptoms": {                    // optional, only if has values
    "mood": 4,
    "cramps": 3,
    "energy": 2
  },
  "notes": "Optional notes"        // optional, only if exists
}
```

## If Backend Expects Snake Case:

We may need to transform the payload to use snake_case:
```json
{
  "date": "2024-01-15",
  "is_period": true,
  "flow_intensity": "medium",
  "symptoms": {...},
  "notes": "..."
}
```

Let me know what the backend error response shows and I'll update the code accordingly!

