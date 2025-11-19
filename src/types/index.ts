// Centralized type definitions for the entire app

// ============================================================================
// USER & AUTH TYPES
// ============================================================================

export interface User {
	id: string;
	email?: string | null;
	displayName?: string;
	avatarUrl?: string;
  }
  
  export interface AuthState {
	user: User | null;
	accessToken: string | null;
	refreshTokenStored: boolean;
	status: 'idle' | 'loading' | 'failed' | 'succeeded';
	error?: string | null;
  }
  
  // ============================================================================
  // USER PROFILE TYPES
  // ============================================================================
  
  export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  export type UnitsSystem = 'metric' | 'imperial';
  export type ThemePreference = 'light' | 'dark' | 'auto';
  export type NotificationPreferences = {
	cycleReminders: boolean;
	periodPredictions: boolean;
	workoutReminders: boolean;
	nutritionTips: boolean;
	wellnessInsights: boolean;
  };
  
  export interface UserProfile {
	// Core Identity
	id?: string;
	userId: string;
	displayName?: string;
	firstName?: string;
	lastName?: string;
	avatarUrl?: string;
	
	// Personal Details
	dateOfBirth?: string;
	age?: number;
	gender?: string;
	timezone?: string;
	
	// Health & Cycle
	averageCycleLength: number;
	lastPeriodStart?: string | null;
	periodDuration: number;
	lutealPhaseDays: number;
	menopauseStatus?: 'pre' | 'peri' | 'post' | null;
	
	// Wellness Goals
	wellnessGoals: string[];
	
	// Nutrition
	dailyCalorieGoal: number;
	activityLevel: ActivityLevel;
	height?: number;
	weight?: number;
	targetWeight?: number;
	unitsSystem: UnitsSystem;
	
	// Preferences
	theme: ThemePreference;
	notifications: NotificationPreferences;
	language?: string;
	
	// Privacy & Settings
	shareAnalytics: boolean;
	dataSharingEnabled: boolean;
	
	// Metadata
	createdAt?: string;
	updatedAt?: string;
	lastSyncedAt?: string;
	onboardingCompleted: boolean;
	appVersion?: string;
  }
  
  // ============================================================================
  // CYCLE TYPES
  // ============================================================================
  
  export type CyclePhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
  
  export interface CycleEntry {
	date: string;
	isPeriod: boolean;
	flowIntensity?: 'light' | 'medium' | 'heavy' | 'spotting';
	symptoms?: {
	  mood: number;
	  cramps: number;
	  energy: number;
	  bloating?: number;
	  headache?: number;
	  breastTenderness?: number;
	};
	notes?: string;
  }
  
  export interface PhaseInfo {
	name: CyclePhase;
	day: number;
	dayInPhase: number;
	totalDaysInPhase: number;
	description: string;
	hormoneLevel: {
	  estrogen: 'low' | 'rising' | 'high' | 'falling';
	  progesterone: 'low' | 'rising' | 'high' | 'falling';
	};
	energyLevel: 'low' | 'moderate' | 'high' | 'peak';
	commonSymptoms: string[];
  }
  
  export interface PredictionData {
	nextPeriod: any | null;
	ovulation: any | null;
	fertileWindow: {
	  start: string;
	  peak: string;
	  end: string;
	  confidence: number;
	} | null;
	analytics: any | null;
  }
  
  export interface CycleState {
	currentPhase: PhaseInfo;
	cycleDay: number;
	entries: CycleEntry[];
	predictions: PredictionData;
	profile: {
	  averageCycleLength: number;
	  lastPeriodStart: string | null;
	  lutealPhaseDays: number;
	  periodDuration: number;
	};
	dataQuality: 'insufficient' | 'low' | 'medium' | 'high';
	lastCalculated: string | null;
	lastSynced: string | null;
  }
  
  // ============================================================================
  // API RESPONSE TYPES
  // ============================================================================
  
  export interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	message?: string;
	error?: string;
  }
  
  export interface PaginatedResponse<T> extends ApiResponse<T[]> {
	pagination?: {
	  page: number;
	  limit: number;
	  total: number;
	  totalPages: number;
	};
  }