// AI Service for food recognition and analysis
import * as tf from '@tensorflow/tfjs';

export interface FoodAnalysisResult {
  foodName: string;
  confidence: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion: string;
}

export interface NutritionRecommendation {
  phase: string;
  recommendations: string[];
  calorieAdjustment: number;
  macroBalance: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

class AIService {
  private foodModel: tf.LayersModel | null = null;
  private isInitialized = false;

  // Initialize AI models
  async initialize() {
    try {
      // In a real app, you would load pre-trained models
      // For demo purposes, we'll simulate AI responses
      this.isInitialized = true;
      console.log('AI Service initialized');
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
    }
  }

  // Analyze food from image
  async analyzeFoodImage(imageUri: string): Promise<FoodAnalysisResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // In a real app, this would use computer vision to analyze the image
    // For demo, we'll return realistic sample data based on common foods
    const sampleFoods = [
      {
        foodName: 'Grilled Chicken Breast',
        confidence: 0.92,
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
        portion: '100g serving'
      },
      {
        foodName: 'Mixed Green Salad',
        confidence: 0.88,
        calories: 45,
        protein: 3,
        carbs: 8,
        fat: 0.5,
        portion: '1 cup'
      },
      {
        foodName: 'Salmon Fillet',
        confidence: 0.95,
        calories: 208,
        protein: 20,
        carbs: 0,
        fat: 13,
        portion: '100g serving'
      },
      {
        foodName: 'Quinoa Bowl',
        confidence: 0.85,
        calories: 222,
        protein: 8,
        carbs: 39,
        fat: 3.6,
        portion: '1 cup cooked'
      },
      {
        foodName: 'Greek Yogurt with Berries',
        confidence: 0.90,
        calories: 130,
        protein: 15,
        carbs: 18,
        fat: 0.4,
        portion: '150g serving'
      }
    ];

    // Return random sample for demo
    return sampleFoods[Math.floor(Math.random() * sampleFoods.length)];
  }

  // Get personalized nutrition recommendations based on cycle phase
  async getPhaseBasedRecommendations(
    phase: string,
    currentIntake: { calories: number; protein: number; carbs: number; fat: number },
    userProfile: { age: number; activityLevel: string; goals: string[] }
  ): Promise<NutritionRecommendation> {
    const recommendations: Record<string, NutritionRecommendation> = {
      menstrual: {
        phase: 'Menstrual',
        recommendations: [
          'Increase iron-rich foods to replenish lost iron',
          'Stay hydrated with warm beverages',
          'Include magnesium-rich foods to reduce cramps',
          'Consider dark chocolate for mood support'
        ],
        calorieAdjustment: 50, // Slightly higher calorie needs
        macroBalance: { protein: 25, carbs: 45, fat: 30 }
      },
      follicular: {
        phase: 'Follicular',
        recommendations: [
          'Focus on fresh, light foods to support rising energy',
          'Include fermented foods for gut health',
          'Emphasize lean proteins for muscle building',
          'Add plenty of colorful vegetables'
        ],
        calorieAdjustment: 0,
        macroBalance: { protein: 30, carbs: 40, fat: 30 }
      },
      ovulatory: {
        phase: 'Ovulatory',
        recommendations: [
          'Prioritize anti-inflammatory foods',
          'Include omega-3 rich foods for hormone support',
          'Focus on high-fiber foods for energy',
          'Stay well-hydrated for peak performance'
        ],
        calorieAdjustment: 100, // Higher calorie needs during peak activity
        macroBalance: { protein: 25, carbs: 50, fat: 25 }
      },
      luteal: {
        phase: 'Luteal',
        recommendations: [
          'Include complex carbohydrates for mood stability',
          'Focus on magnesium-rich foods to reduce PMS',
          'Add calming herbal teas',
          'Include healthy fats for hormone production'
        ],
        calorieAdjustment: 75, // Slightly higher needs
        macroBalance: { protein: 20, carbs: 50, fat: 30 }
      }
    };

    return recommendations[phase] || recommendations.follicular;
  }

  // Analyze eating patterns and provide insights
  async analyzeEatingPatterns(foodEntries: any[]): Promise<{
    insights: string[];
    suggestions: string[];
    nutritionScore: number;
  }> {
    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 1000));

    const insights = [
      'Your protein intake is consistent throughout the week',
      'You tend to eat more carbs during your luteal phase - this is normal!',
      'Your iron intake could be improved during menstrual phase'
    ];

    const suggestions = [
      'Try adding spinach to your morning smoothie for extra iron',
      'Consider meal prepping quinoa bowls for busy days',
      'Include more omega-3 rich foods like salmon or chia seeds'
    ];

    const nutritionScore = Math.floor(Math.random() * 30) + 70; // 70-100 range

    return { insights, suggestions, nutritionScore };
  }

  // Generate smart meal suggestions based on preferences and phase
  async generateMealSuggestions(
    phase: string,
    preferences: string[],
    restrictions: string[]
  ): Promise<{
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snacks: string[];
  }> {
    // AI would analyze user preferences and generate personalized suggestions
    const phaseMeals: Record<string, any> = {
      menstrual: {
        breakfast: [
          'Iron-fortified oatmeal with dark chocolate chips',
          'Spinach and mushroom omelet',
          'Warm quinoa porridge with cinnamon'
        ],
        lunch: [
          'Lentil soup with whole grain bread',
          'Beef and vegetable stir-fry',
          'Chickpea curry with brown rice'
        ],
        dinner: [
          'Grilled salmon with sweet potato',
          'Turkey meatballs with pasta',
          'Tofu and vegetable curry'
        ],
        snacks: [
          'Dark chocolate squares',
          'Trail mix with dried fruits',
          'Herbal tea with honey'
        ]
      },
      follicular: {
        breakfast: [
          'Greek yogurt parfait with berries',
          'Green smoothie with spinach',
          'Avocado toast with tomatoes'
        ],
        lunch: [
          'Colorful Buddha bowl',
          'Grilled chicken salad',
          'Quinoa tabbouleh'
        ],
        dinner: [
          'Baked cod with vegetables',
          'Stir-fried tofu with broccoli',
          'Lean turkey with roasted veggies'
        ],
        snacks: [
          'Fresh fruit salad',
          'Hummus with vegetables',
          'Green tea with almonds'
        ]
      },
      ovulatory: {
        breakfast: [
          'Chia seed pudding with berries',
          'Protein smoothie bowl',
          'Quinoa breakfast bowl'
        ],
        lunch: [
          'Anti-inflammatory salad with salmon',
          'Rainbow vegetable wrap',
          'Grilled chicken with peppers'
        ],
        dinner: [
          'Omega-3 rich fish with quinoa',
          'Lentil and vegetable stew',
          'Grilled portobello with herbs'
        ],
        snacks: [
          'Mixed berries with nuts',
          'Omega-3 trail mix',
          'Matcha latte'
        ]
      },
      luteal: {
        breakfast: [
          'Overnight oats with nuts',
          'Whole grain toast with almond butter',
          'Quinoa porridge with seeds'
        ],
        lunch: [
          'Sweet potato and black bean bowl',
          'Brown rice with roasted vegetables',
          'Whole grain pasta salad'
        ],
        dinner: [
          'Baked chicken with sweet potato',
          'Vegetable and bean stew',
          'Salmon with quinoa and greens'
        ],
        snacks: [
          'Dark chocolate with almonds',
          'Pumpkin seeds and dried fruit',
          'Chamomile tea with crackers'
        ]
      }
    };

    return phaseMeals[phase] || phaseMeals.follicular;
  }
}

export const aiService = new AIService();