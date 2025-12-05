/**
 * Onboarding Questions Data
 * 
 * Centralized configuration for all onboarding questions
 */

import type {
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

// ============================================================================
// SECTION 1: BASELINE PROFILE
// ============================================================================

export const WEIGHT_RANGES: Array<{ value: WeightRange; label: string }> = [
  { value: 'under_45', label: 'Under 45 kg (< 100 lbs)' },
  { value: '45_50', label: '45 – 50 kg (100 – 110 lbs)' },
  { value: '50_55', label: '50 – 55 kg (110 – 121 lbs)' },
  { value: '55_60', label: '55 – 60 kg (121 – 132 lbs)' },
  { value: '60_65', label: '60 – 65 kg (132 – 143 lbs)' },
  { value: '65_70', label: '65 – 70 kg (143 – 154 lbs)' },
  { value: '70_75', label: '70 – 75 kg (154 – 165 lbs)' },
  { value: '75_80', label: '75 – 80 kg (165 – 176 lbs)' },
  { value: '80_85', label: '80 – 85 kg (176 – 187 lbs)' },
  { value: '85_90', label: '85 – 90 kg (187 – 198 lbs)' },
  { value: '90_95', label: '90 – 95 kg (198 – 209 lbs)' },
  { value: '95_100', label: '95 – 100 kg (209 – 220 lbs)' },
  { value: '100_110', label: '100 – 110 kg (220 – 242 lbs)' },
  { value: '110_120', label: '110 – 120 kg (242 – 265 lbs)' },
  { value: '120_plus', label: '120 kg+ (> 265 lbs)' },
];

export const HEIGHT_RANGES: Array<{ value: HeightRange; label: string }> = [
  { value: 'under_4_10', label: 'Under 4\'10" (< 147 cm)' },
  { value: '4_10', label: '4\'10" (147 cm)' },
  { value: '4_11', label: '4\'11" (150 cm)' },
  { value: '5_0', label: '5\'0" (152 cm)' },
  { value: '5_1', label: '5\'1" (155 cm)' },
  { value: '5_2', label: '5\'2" (157 cm)' },
  { value: '5_3', label: '5\'3" (160 cm)' },
  { value: '5_4', label: '5\'4" (163 cm)' },
  { value: '5_5', label: '5\'5" (165 cm)' },
  { value: '5_6', label: '5\'6" (168 cm)' },
  { value: '5_7', label: '5\'7" (170 cm)' },
  { value: '5_8', label: '5\'8" (173 cm)' },
  { value: '5_9', label: '5\'9" (175 cm)' },
  { value: '5_10', label: '5\'10" (178 cm)' },
  { value: '5_11', label: '5\'11" (180 cm)' },
  { value: '6_0', label: '6\'0" (183 cm)' },
  { value: 'over_6_0', label: 'Over 6\'0" (> 183 cm)' },
];

export const REPRODUCTIVE_STAGES: Array<{ value: ReproductiveStage; label: string; description?: string }> = [
  { value: 'menstruating', label: 'Menstruating', description: 'I have a period (regular or irregular)' },
  { value: 'postpartum', label: 'Postpartum', description: 'I gave birth in the last 6 months' },
  { value: 'breastfeeding', label: 'Breastfeeding', description: 'I am currently lactating' },
  { value: 'perimenopause', label: 'Perimenopause', description: 'My cycles are changing/stopping' },
  { value: 'menopause', label: 'Menopause', description: 'I haven\'t had a period for 12+ months' },
];

export const HEALTH_GOALS: Array<{ value: HealthGoal; label: string }> = [
  { value: 'cycle_syncing', label: 'Cycle Syncing: Align diet/exercise with my hormones' },
  { value: 'symptom_management', label: 'Symptom Management: Reduce pain/PMS/bloating' },
  { value: 'weight_management', label: 'Weight Management: Lose weight or manage cravings' },
  { value: 'fertility', label: 'Fertility: Trying to conceive' },
  { value: 'mental_health', label: 'Mental Health: Stabilize mood and energy' },
];

// ============================================================================
// SECTION 2: CYCLE DETAILS
// ============================================================================

export const BIRTH_CONTROL_OPTIONS: Array<{ value: BirthControl; label: string; description?: string }> = [
  { value: 'none', label: 'No / None' },
  { value: 'hormonal_pill', label: 'Hormonal Pill', description: 'The Pill' },
  { value: 'hormonal_iud', label: 'Hormonal IUD', description: 'Mirena, Kyleena, etc.' },
  { value: 'copper_iud', label: 'Copper IUD', description: 'Paragard' },
  { value: 'implant_injection_patch', label: 'Implant / Injection / Patch' },
  { value: 'tubal_ligation', label: 'Tubal Ligation' },
];

export const CYCLE_LENGTHS: Array<{ value: CycleLength; label: string; description?: string }> = [
  { value: 'less_than_21', label: 'Less than 21 days' },
  { value: '21_24', label: '21 – 24 days' },
  { value: '25_30', label: '25 – 30 days (Average)' },
  { value: '31_35', label: '31 – 35 days' },
  { value: 'longer_than_35', label: 'Longer than 35 days' },
  { value: 'irregular', label: 'Irregular / Unpredictable' },
];

export const PERIOD_DURATIONS: Array<{ value: PeriodDuration; label: string }> = [
  { value: '1_3', label: '1 – 3 days (Short)' },
  { value: '4_6', label: '4 – 6 days (Average)' },
  { value: '7_plus', label: '7+ days (Long)' },
];

// ============================================================================
// SECTION 3: HORMONAL & PHYSICAL SYMPTOMS
// ============================================================================

export const MEDICAL_DIAGNOSES: Array<{ value: MedicalDiagnosis; label: string }> = [
  { value: 'pcos', label: 'PCOS (Polycystic Ovary Syndrome)' },
  { value: 'endometriosis', label: 'Endometriosis' },
  { value: 'fibroids', label: 'Fibroids' },
  { value: 'hypothyroidism', label: 'Hypothyroidism (Underactive Thyroid)' },
  { value: 'hyperthyroidism', label: 'Hyperthyroidism (Overactive Thyroid)' },
  { value: 'pmdd', label: 'PMDD (Premenstrual Dysphoric Disorder)' },
  { value: 'none', label: 'None of the above' },
];

export const PHYSICAL_SYMPTOMS: Array<{ value: PhysicalSymptom; label: string; description?: string }> = [
  { value: 'acne', label: 'Acne', description: 'Cystic or jawline breakouts' },
  { value: 'bloating', label: 'Bloating', description: 'Severe water retention' },
  { value: 'cramps', label: 'Cramps', description: 'Pain that disrupts daily life' },
  { value: 'fatigue', label: 'Fatigue', description: 'Extreme tiredness/brain fog' },
  { value: 'hair_issues', label: 'Hair Issues', description: 'Hair loss or excess facial hair' },
  { value: 'headaches', label: 'Headaches', description: 'Hormonal migraines' },
  { value: 'breast_tenderness', label: 'Breast Tenderness', description: 'Pain/swelling before period' },
];

// ============================================================================
// SECTION 4: MOOD & MINDSET
// ============================================================================

export const PMS_MOODS: Array<{ value: PMSMood; label: string; description?: string }> = [
  { value: 'stable', label: 'Stable', description: 'No noticeable changes' },
  { value: 'mild', label: 'Mild', description: 'I feel a bit sensitive or tired' },
  { value: 'moderate', label: 'Moderate', description: 'I feel anxious, irritable, or sad' },
  { value: 'severe', label: 'Severe', description: 'I feel depressed, angry, or out of control' },
];

export const STRESS_LEVELS: Array<{ value: StressLevel; label: string; description?: string }> = [
  { value: 'low', label: 'Low', description: 'I feel calm and balanced' },
  { value: 'manageable', label: 'Manageable', description: 'Occasional stress, but I handle it' },
  { value: 'high', label: 'High', description: 'I feel frequently overwhelmed' },
  { value: 'burnout', label: 'Burnout', description: 'I feel exhausted and depleted' },
];

// ============================================================================
// SECTION 5: NUTRITION & WEIGHT
// ============================================================================

export const FOOD_STRUGGLES: Array<{ value: FoodStruggle; label: string; description?: string }> = [
  { value: 'sugar_cravings', label: 'Sugar Cravings', description: 'Chocolate, sweets, pastries' },
  { value: 'salty_carb_cravings', label: 'Salty/Carb Cravings', description: 'Chips, bread, pasta' },
  { value: 'binge_eating', label: 'Binge Eating', description: 'Eating large amounts when emotional' },
  { value: 'loss_of_appetite', label: 'Loss of Appetite', description: 'Forgetting to eat or nausea' },
  { value: 'none', label: 'None', description: 'I have a healthy relationship with food' },
];

export const DIETARY_LIFESTYLES: Array<{ value: DietaryLifestyle; label: string }> = [
  { value: 'omnivore', label: 'Omnivore (I eat everything)' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescatarian', label: 'Pescatarian' },
  { value: 'keto_low_carb', label: 'Keto / Low Carb' },
  { value: 'gluten_free', label: 'Gluten-Free' },
  { value: 'dairy_free', label: 'Dairy-Free' },
];

