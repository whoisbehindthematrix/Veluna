export interface Recommendation {
  title: string;
  description: string;
  items: string[];
  icon: string;
}

export interface PhaseData {
  name: string;
  description: string;
  color: string;
  foods: Recommendation;
  exercises: Recommendation;
  tips: string[];
}

export const phaseRecommendations: Record<string, PhaseData> = {
  menstrual: {
    name: 'Menstrual Phase',
    description: 'Days 1-5: Rest and restore your body during menstruation',
    color: '#fecaca', // light red
    foods: {
      title: 'Nourishing Foods',
      description: 'Focus on iron-rich foods and warm, comforting meals',
      items: [
        'Iron-rich foods (spinach, red meat, beans, lentils)',
        'Warm soups and broths',
        'Dark chocolate (magnesium boost)',
        'Herbal teas (ginger, chamomile)',
        'Plenty of water for hydration',
        'Warming spices (cinnamon, ginger)',
      ],
      icon: '🥣',
    },
    exercises: {
      title: 'Gentle Movement',
      description: 'Light, restorative activities that honor your body\'s need for rest',
      items: [
        'Gentle yoga and stretching',
        'Light walking or nature walks',
        'Meditation and breathing exercises',
        'Restorative yoga poses',
        'Light foam rolling',
        'Prioritize rest and sleep',
      ],
      icon: '🧘‍♀️',
    },
    tips: [
      'Listen to your body and rest when needed',
      'Use a heating pad for cramps',
      'Stay hydrated with warm beverages',
      'Practice self-compassion',
    ],
  },
  follicular: {
    name: 'Follicular Phase',
    description: 'Days 6-13: Energy building phase with rising estrogen',
    color: '#bfdbfe', // light blue
    foods: {
      title: 'Fresh & Light Foods',
      description: 'Support your rising energy with fresh, nutrient-dense foods',
      items: [
        'Fresh fruits (berries, citrus, apples)',
        'Leafy greens (kale, spinach, arugula)',
        'Fermented foods (yogurt, kimchi, sauerkraut)',
        'Lean proteins (chicken, fish, tofu)',
        'Nuts and seeds',
        'Whole grains (quinoa, brown rice)',
      ],
      icon: '🥗',
    },
    exercises: {
      title: 'Building Strength',
      description: 'Perfect time to try new workouts and build strength',
      items: [
        'Strength training and weight lifting',
        'Light to moderate cardio',
        'Try new fitness classes',
        'Rock climbing or hiking',
        'Dance or Zumba classes',
        'Yoga flow sequences',
      ],
      icon: '💪',
    },
    tips: [
      'Great time to start new habits',
      'Your motivation is naturally high',
      'Focus on building routines',
      'Try creative activities',
    ],
  },
  ovulatory: {
    name: 'Ovulatory Phase',
    description: 'Days 14-16: Peak energy and confidence phase',
    color: '#fde68a', // light yellow
    foods: {
      title: 'Anti-inflammatory Foods',
      description: 'Support your peak phase with vibrant, anti-inflammatory foods',
      items: [
        'Colorful vegetables (tomatoes, peppers, carrots)',
        'Antioxidant-rich berries',
        'Omega-3 rich fish (salmon, sardines)',
        'Chia seeds and flaxseeds',
        'High-fiber foods (beans, lentils)',
        'Green tea and matcha',
      ],
      icon: '🌈',
    },
    exercises: {
      title: 'High-Intensity Training',
      description: 'Your peak energy phase - perfect for challenging workouts',
      items: [
        'High-intensity interval training (HIIT)',
        'Running or cycling',
        'Group fitness classes',
        'Competitive sports',
        'Heavy strength training',
        'Dance cardio or spin classes',
      ],
      icon: '🏃‍♀️',
    },
    tips: [
      'You\'re at your social peak',
      'Great time for important meetings',
      'Maximum physical performance',
      'Confidence is naturally high',
    ],
  },
  luteal: {
    name: 'Luteal Phase',
    description: 'Days 17-28: Winding down phase, prepare for rest',
    color: '#ddd6fe', // light purple
    foods: {
      title: 'Comforting Foods',
      description: 'Support your body as it prepares for the next cycle',
      items: [
        'Complex carbohydrates (sweet potatoes, oats)',
        'Magnesium-rich foods (dark chocolate, nuts)',
        'Calming herbal teas (chamomile, lavender)',
        'Seeds (pumpkin, sunflower, sesame)',
        'Leafy greens for B vitamins',
        'Warm, cooked meals',
      ],
      icon: '🍠',
    },
    exercises: {
      title: 'Moderate Movement',
      description: 'Focus on strength training and calming activities',
      items: [
        'Moderate strength training',
        'Pilates and core work',
        'Yin yoga or restorative yoga',
        'Light cardio (walking, swimming)',
        'Stretching and flexibility work',
        'Mindfulness and meditation',
      ],
      icon: '🧘',
    },
    tips: [
      'Perfect time for organizing and planning',
      'Your body may crave more carbs - that\'s normal',
      'Focus on stress management',
      'Prepare for the next cycle',
    ],
  },
};