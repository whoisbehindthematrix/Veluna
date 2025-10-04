export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: string;
}

export const commonFoods: FoodItem[] = [
  // Proteins
  { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6, category: 'protein' },
  { name: 'Salmon (100g)', calories: 208, protein: 20, carbs: 0, fat: 13, category: 'protein' },
  { name: 'Eggs (1 large)', calories: 70, protein: 6, carbs: 0.6, fat: 5, category: 'protein' },
  { name: 'Greek Yogurt (100g)', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, category: 'protein' },
  { name: 'Tofu (100g)', calories: 76, protein: 8, carbs: 1.9, fat: 4.8, category: 'protein' },
  
  // Carbohydrates
  { name: 'Brown Rice (100g cooked)', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, category: 'carbs' },
  { name: 'Quinoa (100g cooked)', calories: 120, protein: 4.4, carbs: 22, fat: 1.9, category: 'carbs' },
  { name: 'Sweet Potato (100g)', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, category: 'carbs' },
  { name: 'Oats (100g)', calories: 389, protein: 16.9, carbs: 66, fat: 6.9, category: 'carbs' },
  { name: 'Banana (1 medium)', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, category: 'carbs' },
  
  // Vegetables
  { name: 'Spinach (100g)', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, category: 'vegetables' },
  { name: 'Broccoli (100g)', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, category: 'vegetables' },
  { name: 'Avocado (1 medium)', calories: 234, protein: 2.9, carbs: 12, fat: 21, category: 'vegetables' },
  { name: 'Bell Pepper (100g)', calories: 31, protein: 1, carbs: 7, fat: 0.3, category: 'vegetables' },
  { name: 'Tomato (1 medium)', calories: 22, protein: 1.1, carbs: 4.8, fat: 0.2, category: 'vegetables' },
  
  // Fruits
  { name: 'Apple (1 medium)', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, category: 'fruits' },
  { name: 'Orange (1 medium)', calories: 62, protein: 1.2, carbs: 15.4, fat: 0.2, category: 'fruits' },
  { name: 'Berries (100g)', calories: 57, protein: 0.7, carbs: 14, fat: 0.3, category: 'fruits' },
  
  // Nuts & Seeds
  { name: 'Almonds (28g)', calories: 164, protein: 6, carbs: 6, fat: 14, category: 'nuts' },
  { name: 'Chia Seeds (28g)', calories: 137, protein: 4.4, carbs: 12, fat: 8.6, category: 'nuts' },
  { name: 'Walnuts (28g)', calories: 185, protein: 4.3, carbs: 3.9, fat: 18.5, category: 'nuts' },
];

export interface MealPlan {
  id: string;
  name: string;
  description: string;
  phase: string;
  meals: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snacks: string[];
  };
  totalCalories: number;
  benefits: string[];
}

export const weeklyMealPlans: MealPlan[] = [
  {
    id: 'menstrual-plan',
    name: 'Menstrual Phase Comfort Plan',
    description: 'Iron-rich, warming foods to support your body during menstruation',
    phase: 'menstrual',
    meals: {
      breakfast: [
        'Warm oatmeal with dark chocolate chips and banana',
        'Iron-fortified cereal with berries',
        'Spinach and mushroom omelet'
      ],
      lunch: [
        'Lentil soup with whole grain bread',
        'Quinoa bowl with roasted vegetables',
        'Beef and vegetable stir-fry'
      ],
      dinner: [
        'Grilled salmon with sweet potato',
        'Chicken and bean chili',
        'Tofu curry with brown rice'
      ],
      snacks: [
        'Dark chocolate squares',
        'Trail mix with dried fruits',
        'Herbal tea with honey'
      ]
    },
    totalCalories: 1800,
    benefits: ['High in iron', 'Warming foods', 'Anti-inflammatory']
  },
  {
    id: 'follicular-plan',
    name: 'Follicular Fresh Start Plan',
    description: 'Light, fresh foods to support rising energy levels',
    phase: 'follicular',
    meals: {
      breakfast: [
        'Greek yogurt with berries and granola',
        'Green smoothie with spinach and fruits',
        'Avocado toast with tomatoes'
      ],
      lunch: [
        'Colorful salad with grilled chicken',
        'Quinoa tabbouleh with vegetables',
        'Vegetable sushi rolls'
      ],
      dinner: [
        'Grilled fish with steamed broccoli',
        'Stir-fried tofu with mixed vegetables',
        'Lean turkey with roasted vegetables'
      ],
      snacks: [
        'Fresh fruit salad',
        'Vegetable sticks with hummus',
        'Green tea with almonds'
      ]
    },
    totalCalories: 1900,
    benefits: ['Fresh nutrients', 'Light and energizing', 'Supports metabolism']
  },
  {
    id: 'ovulatory-plan',
    name: 'Ovulatory Power Plan',
    description: 'Anti-inflammatory, high-energy foods for peak performance',
    phase: 'ovulatory',
    meals: {
      breakfast: [
        'Chia seed pudding with berries',
        'Protein smoothie with spinach',
        'Quinoa breakfast bowl'
      ],
      lunch: [
        'Rainbow vegetable salad with salmon',
        'Anti-inflammatory Buddha bowl',
        'Grilled chicken with colorful peppers'
      ],
      dinner: [
        'Baked cod with roasted vegetables',
        'Lentil and vegetable curry',
        'Grilled portobello with quinoa'
      ],
      snacks: [
        'Mixed berries with nuts',
        'Omega-3 rich trail mix',
        'Matcha latte'
      ]
    },
    totalCalories: 2100,
    benefits: ['Anti-inflammatory', 'High in omega-3s', 'Peak energy support']
  },
  {
    id: 'luteal-plan',
    name: 'Luteal Comfort Plan',
    description: 'Complex carbs and magnesium-rich foods for hormonal balance',
    phase: 'luteal',
    meals: {
      breakfast: [
        'Overnight oats with nuts and seeds',
        'Whole grain toast with almond butter',
        'Quinoa porridge with cinnamon'
      ],
      lunch: [
        'Sweet potato and black bean bowl',
        'Brown rice with roasted vegetables',
        'Whole grain pasta with vegetables'
      ],
      dinner: [
        'Baked chicken with sweet potato',
        'Vegetable and bean stew',
        'Salmon with quinoa and greens'
      ],
      snacks: [
        'Dark chocolate with almonds',
        'Pumpkin seeds and dried fruit',
        'Chamomile tea with whole grain crackers'
      ]
    },
    totalCalories: 2000,
    benefits: ['Complex carbohydrates', 'Magnesium-rich', 'Mood stabilizing']
  }
];