# Backend API Requirements for Onboarding

This document describes the backend API requirements for the onboarding process.

## Endpoints

### 1. POST `/api/onboarding`
Save onboarding data to the backend.

**Request Body:**
```typescript
{
  // Profile Information (Optional)
  dateOfBirth?: string;           // ISO date string (YYYY-MM-DD)
  age?: number;                   // Integer (calculated from dateOfBirth if not provided)
  
  // Cycle Information (Required for completion)
  averageCycleLength: number;     // Integer (days) - REQUIRED
  periodDuration: number;         // Integer (days) - REQUIRED
  
  // Optional Profile Fields
  weightRange?: WeightRange;      // String enum
  heightRange?: HeightRange;      // String enum
  reproductiveStage?: ReproductiveStage;  // String enum
  healthGoal?: HealthGoal;        // String enum
  
  // Birth Control (Optional)
  birthControl?: BirthControl[];  // Array of string enums
  
  // Medical & Symptoms (Optional)
  medicalDiagnoses?: MedicalDiagnosis[];  // Array of string enums
  physicalSymptoms?: PhysicalSymptom[];   // Array of string enums (max 3)
  
  // Mood & Stress (Optional)
  pmsMood?: PMSMood;              // String enum
  stressLevel?: StressLevel;      // String enum
  
  // Nutrition (Optional)
  foodStruggles?: FoodStruggle[]; // Array of string enums
  dietaryLifestyle?: DietaryLifestyle;  // String enum
  
  // Legacy fields (for backward compatibility)
  cycleLength?: CycleLength;      // String enum (kept for reference)
}
```

**Required Fields:**
- `averageCycleLength`: Must be a number (integer between 21-40, or default 28)
- `periodDuration`: Must be a number (integer between 1-7)

**Response:**
```typescript
{
  success: boolean;
  data?: {
    // Same structure as request
    id: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  };
  message?: string;
}
```

**Error Response:**
```typescript
{
  success: false;
  error: string;
  message: string;
  details?: any;
}
```

### 2. GET `/api/onboarding`
Retrieve saved onboarding data for the current user.

**Response:**
```typescript
{
  success: boolean;
  data?: {
    // Same structure as POST request
    // All fields that were saved
  };
}
```

### 3. POST `/api/onboarding/complete`
Mark onboarding as completed for the current user.

**Request Body:** (empty or optional confirmation)

**Response:**
```typescript
{
  success: boolean;
  data?: {
    completed: boolean;
    completedAt: string;
  };
  message?: string;
}
```

### 4. PATCH `/api/onboarding`
Update a specific field in onboarding data.

**Request Body:**
```typescript
{
  [fieldName]: value;  // Any field from the onboarding data structure
}
```

**Response:**
```typescript
{
  success: boolean;
  data?: {
    // Updated onboarding data
  };
}
```

## Type Definitions

### Enums

```typescript
type WeightRange =
  | 'under_45' | '45_50' | '50_55' | '55_60' | '60_65' | '65_70'
  | '70_75' | '75_80' | '80_85' | '85_90' | '90_95' | '95_100'
  | '100_110' | '110_120' | '120_plus';

type HeightRange =
  | 'under_4_10' | '4_10' | '4_11' | '5_0' | '5_1' | '5_2' | '5_3'
  | '5_4' | '5_5' | '5_6' | '5_7' | '5_8' | '5_9' | '5_10' | '5_11'
  | '6_0' | 'over_6_0';

type ReproductiveStage =
  | 'menstruating' | 'postpartum' | 'breastfeeding' | 'perimenopause' | 'menopause';

type HealthGoal =
  | 'cycle_syncing' | 'symptom_management' | 'weight_management' | 'fertility' | 'mental_health';

type BirthControl =
  | 'none' | 'hormonal_pill' | 'hormonal_iud' | 'copper_iud' | 'implant_injection_patch' | 'tubal_ligation';

type CycleLength =
  | 'less_than_21' | '21_24' | '25_30' | '31_35' | 'longer_than_35' | 'irregular';

type PeriodDuration = '1_3' | '4_6' | '7_plus';

type MedicalDiagnosis =
  | 'pcos' | 'endometriosis' | 'fibroids' | 'hypothyroidism' | 'hyperthyroidism' | 'pmdd' | 'none';

type PhysicalSymptom =
  | 'acne' | 'bloating' | 'cramps' | 'fatigue' | 'hair_issues' | 'headaches' | 'breast_tenderness';

type PMSMood =
  | 'stable' | 'mild' | 'moderate' | 'severe';

type StressLevel =
  | 'low' | 'manageable' | 'high' | 'burnout';

type FoodStruggle =
  | 'sugar_cravings' | 'salty_carb_cravings' | 'binge_eating' | 'loss_of_appetite' | 'none';

type DietaryLifestyle =
  | 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto_low_carb' | 'gluten_free' | 'dairy_free';
```

## Data Transformation

### Cycle Length Enum → Number
The frontend sends enum values, but the backend expects numeric values:

```typescript
'less_than_21' → 20
'21_24' → 23
'25_30' → 28 (average)
'31_35' → 33
'longer_than_35' → 36
'irregular' → 28 (default)
```

### Period Duration Enum → Number
```typescript
'1_3' → 2 (average)
'4_6' → 5 (average)
'7_plus' → 7
```

### Field Mapping
- `cycleLength` (enum) → `averageCycleLength` (number) - **REQUIRED**
- `periodDuration` (enum) → `periodDuration` (number) - **REQUIRED**
- `dateOfBirth` (string) → `age` (number) - calculated if not provided

## Validation Rules

1. **Required Fields on Completion:**
   - `averageCycleLength`: Must be a number, 21-40 range (or default 28)
   - `periodDuration`: Must be a number, 1-7 range

2. **Optional Fields:**
   - All other fields are optional but should be validated if provided
   - Arrays should not be empty (or should not be sent if empty)
   - Enums should match the defined type values

3. **Data Cleaning:**
   - Remove all `undefined` and `null` values before sending
   - Empty arrays should not be sent
   - Empty strings should not be sent

## Authentication

All endpoints require authentication. The user ID should be extracted from the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Error Handling

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

**Error Format:**
```typescript
{
  success: false;
  error: string;           // Error type/code
  message: string;         // Human-readable message
  details?: {
    field?: string;        // Field name if validation error
    expected?: string;     // Expected type/value
    received?: any;        // Received value
  };
}
```

## Example Request/Response

### POST `/api/onboarding`
**Request:**
```json
{
  "dateOfBirth": "1995-05-15",
  "averageCycleLength": 28,
  "periodDuration": 5,
  "weightRange": "60_65",
  "heightRange": "5_5",
  "reproductiveStage": "menstruating",
  "healthGoal": "cycle_syncing",
  "birthControl": ["none"],
  "pmsMood": "moderate",
  "stressLevel": "manageable"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "userId": "user-id-here",
    "dateOfBirth": "1995-05-15",
    "age": 29,
    "averageCycleLength": 28,
    "periodDuration": 5,
    "weightRange": "60_65",
    "heightRange": "5_5",
    "reproductiveStage": "menstruating",
    "healthGoal": "cycle_syncing",
    "birthControl": ["none"],
    "pmsMood": "moderate",
    "stressLevel": "manageable",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "message": "Onboarding data saved successfully"
}
```

## Database Schema Recommendations

```sql
CREATE TABLE onboarding_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  
  -- Profile
  date_of_birth DATE,
  age INTEGER,
  weight_range TEXT,
  height_range TEXT,
  reproductive_stage TEXT,
  health_goal TEXT,
  
  -- Cycle (REQUIRED)
  average_cycle_length INTEGER NOT NULL DEFAULT 28,
  period_duration INTEGER NOT NULL DEFAULT 5,
  
  -- Birth Control
  birth_control TEXT[],  -- Array of strings
  
  -- Medical
  medical_diagnoses TEXT[],  -- Array of strings
  physical_symptoms TEXT[],  -- Array of strings (max 3)
  
  -- Mood
  pms_mood TEXT,
  stress_level TEXT,
  
  -- Nutrition
  food_struggles TEXT[],  -- Array of strings
  dietary_lifestyle TEXT,
  
  -- Metadata
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_onboarding_user_id ON onboarding_data(user_id);
```

## Notes

- The frontend stores all data in Redux during onboarding
- Backend sync happens **only on completion** (when user clicks "Complete Setup")
- All enum values should be validated against the defined types
- Numeric fields must be integers, not floats
- Date fields should be in ISO 8601 format (YYYY-MM-DD)
- Arrays should be validated for max length (e.g., `physicalSymptoms` max 3 items)

