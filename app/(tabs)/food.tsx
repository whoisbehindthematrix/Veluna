import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { commonFoods, weeklyMealPlans, FoodItem } from '@/data/foodData';
import { Camera, Plus, Search, X, Calendar, Target, TrendingUp } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { AIInsights } from '@/components/AIInsights';
import { supabase } from '@/lib/supabase';
import CircularProgress from 'react-native-circular-progress-indicator';
import { useTheme } from '@/src/context/ThemeContext';
import { useCycleStore } from '@/hooks/useCycleStore';

export default function FoodScreen() {
  const { cycle, addFoodEntry } = useCycleStore();
  const { theme, accentColor } = useTheme();
  const router = useRouter();
  
  const { width, height } = Dimensions.get('window');
  const dynamicStyles = useMemo(() => createStyles(theme, accentColor, width, height), [theme, accentColor, width, height]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showMealPlanModal, setShowMealPlanModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [showAiInsights, setShowAiInsights] = useState(false);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todaysFoodEntries = useMemo(
    () => cycle.foodEntries.filter((entry) => entry.date === today),
    [cycle.foodEntries, today]
  );
  const todaysCalories = useMemo(
    () => todaysFoodEntries.reduce((sum, entry) => sum + entry.calories, 0),
    [todaysFoodEntries]
  );

  const calorieGoal = cycle.profile?.dailyCalorieGoal || 2000;
  const remainingCalories = calorieGoal - todaysCalories;

  const currentPhasePlan = weeklyMealPlans.find(
    (plan) => plan.phase === cycle.currentPhase.name
  );

  const filteredFoods = useMemo(
    () =>
      commonFoods.filter((food) =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  );

  // 📸 Take and Analyze Food Photo
  const takeFoodPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take food photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    try {
      Alert.alert('Analyzing...', 'Please wait while we estimate calories.');

      const uri = result.assets[0].uri;
      const formData = new FormData();
      formData.append('photo', {
        uri,
        name: 'food.jpg',
        type: 'image/jpeg',
      } as any);
      formData.append('prompt', 'Scan this meal.');

      const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:4000';
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      const response = await fetch(`${API_BASE}/api/food/scan`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const json = await response.json();

      if (!response.ok || !json.data) {
        throw new Error(json.error || 'Analysis failed');
      }

      const analysis = json.data;

      addFoodEntry({
        id: Date.now().toString(),
        date: today,
        name: `${analysis.foodName || 'Unknown food'} (${analysis.portion || '1 serving'})`,
        calories: Math.round(analysis.calories || 0),
        protein: Math.round(analysis.protein || 0),
        carbs: Math.round(analysis.carbs || 0),
        fat: Math.round(analysis.fat || 0),
        mealType,
        imageUri: uri,
      });

      Alert.alert(
        'Added from Photo',
        `${analysis.foodName || 'Unknown food'}\n${Math.round(analysis.calories || 0)} cal • P ${Math.round(
          analysis.protein || 0
        )}g • C ${Math.round(analysis.carbs || 0)}g • F ${Math.round(analysis.fat || 0)}g`
      );
    } catch (e: any) {
      console.error(e);
      Alert.alert('Analysis failed', e.message || 'Unable to analyze photo. Please try again or add manually.');
      setShowAddModal(true);
    }
  };

  // 🥗 Manual Add Handler
  const handleAddFood = () => {
    if (!selectedFood) {
      Alert.alert('Select Food', 'Please select a food item first.');
      return;
    }

    const multiplier = parseFloat(quantity) || 1;

    addFoodEntry({
      id: Date.now().toString(),
      date: today,
      name: `${selectedFood.name} (${quantity}x)`,
      calories: Math.round((selectedFood.calories || 0) * multiplier),
      protein: Math.round((selectedFood.protein || 0) * multiplier),
      carbs: Math.round((selectedFood.carbs || 0) * multiplier),
      fat: Math.round((selectedFood.fat || 0) * multiplier),
      mealType,
    });

    setShowAddModal(false);
    setSelectedFood(null);
    setQuantity('1');
    setSearchQuery('');
  };

  const getMealTypeEntries = (type: string) =>
    todaysFoodEntries.filter((entry) => entry.mealType === type);

  const getMealTypeCalories = (type: string) =>
    getMealTypeEntries(type).reduce((sum, entry) => sum + entry.calories, 0);

  const mealTypes = [
    { key: 'breakfast', name: 'Breakfast', icon: '🌅', color: '#fbbf24' },
    { key: 'lunch', name: 'Lunch', icon: '☀️', color: '#f97316' },
    { key: 'dinner', name: 'Dinner', icon: '🌙', color: '#8b5cf6' },
    { key: 'snack', name: 'Snacks', icon: '🍎', color: '#10b981' },
  ];

  return (
    <ScrollView style={[dynamicStyles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={theme.headerGradient as [string, string]} style={dynamicStyles.header}>
        <View style={dynamicStyles.headerContent}>
          <View style={dynamicStyles.textContainer}>
            <Text style={[dynamicStyles.title, { color: theme.textPrimary }]}>Food Tracking</Text>
            <Text style={[dynamicStyles.subtitle, { color: theme.textSecondary }]}>Monitor your nutrition and calories</Text>
          </View>
          <View style={dynamicStyles.imageContainer}>
            <LinearGradient
              colors={[`${accentColor}80`, accentColor]}
              style={{
                height: 120,
                width: 120,
                borderRadius: 100,
                position: 'absolute',
                bottom: 12,
                right: 10,
              }}
            />
            <Image
              source={require('../../assets/images/appleeat.png')}
              style={dynamicStyles.headerImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </LinearGradient>

      {/* Calorie Progress */}
      <View style={[dynamicStyles.summaryCard, { 
        backgroundColor: theme.cardBackground,
        shadowColor: accentColor,
      }]}>
        <View style={dynamicStyles.summaryHeader}>
          <Target size={24} color={accentColor} />
          <Text style={[dynamicStyles.summaryTitle, { color: theme.textPrimary }]}>Today's Progress</Text>
        </View>

        <View style={dynamicStyles.calorieProgress}>
          <CircularProgress
            value={todaysCalories}
            maxValue={calorieGoal}
            radius={50}
            duration={1000}
            progressValueColor={accentColor}
            activeStrokeColor={accentColor}
            activeStrokeSecondaryColor={accentColor}
            inActiveStrokeColor={`${accentColor}30`}
            inActiveStrokeOpacity={1}
            inActiveStrokeWidth={16}
            activeStrokeWidth={16}
            title={'Calories'}
            titleColor={theme.textSecondary}
            titleStyle={{ fontWeight: 'bold', fontSize: 12 }}
            progressValueStyle={{ fontFamily: 'Bold', fontSize: 28 }}
            circleBackgroundColor={theme.cardBackground}
          />

          <View style={dynamicStyles.calorieDetails}>
            <View style={dynamicStyles.calorieDetailItem}>
              <Text style={[dynamicStyles.calorieDetailLabel, { color: theme.textSecondary }]}>Goal</Text>
              <Text style={[dynamicStyles.calorieDetailValue, { color: theme.textPrimary }]}>{calorieGoal}</Text>
            </View>
            <View style={[dynamicStyles.calorieDetailDivider, { backgroundColor: theme.border }]} />
            <View style={dynamicStyles.calorieDetailItem}>
              <Text style={[dynamicStyles.calorieDetailLabel, { color: theme.textSecondary }]}>Remaining</Text>
              <Text
                style={[
                  dynamicStyles.calorieDetailValue,
                  { 
                    color: remainingCalories < 0 ? '#ef4444' : accentColor 
                  },
                ]}
              >
                {remainingCalories >= 0 ? remainingCalories : `+${Math.abs(remainingCalories)}`}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={dynamicStyles.section}>
        <Text style={[dynamicStyles.sectionTitle, { color: theme.textPrimary }]}>Quick Add</Text>
        <View style={dynamicStyles.quickActions}>
          <TouchableOpacity 
            style={[dynamicStyles.quickActionButton, { 
              backgroundColor: theme.cardBackground,
              shadowColor: accentColor,
            }]} 
            onPress={takeFoodPhoto}
          >
            <Camera size={24} color={accentColor} />
            <Text style={[dynamicStyles.quickActionText, { color: theme.textPrimary }]}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.quickActionButton, { 
              backgroundColor: theme.cardBackground,
              shadowColor: accentColor,
            }]} 
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={24} color={accentColor} />
            <Text style={[dynamicStyles.quickActionText, { color: theme.textPrimary }]}>Add Food</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.quickActionButton, { 
              backgroundColor: theme.cardBackground,
              shadowColor: accentColor,
            }]} 
            onPress={() => setShowMealPlanModal(true)}
          >
            <Calendar size={24} color={accentColor} />
            <Text style={[dynamicStyles.quickActionText, { color: theme.textPrimary }]}>Meal Plan</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.quickActionButton, { 
              backgroundColor: theme.cardBackground,
              shadowColor: accentColor,
            }]} 
            onPress={() => setShowAiInsights(true)}
          >
            <TrendingUp size={24} color={accentColor} />
            <Text style={[dynamicStyles.quickActionText, { color: theme.textPrimary }]}>AI Insights</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add Food Modal */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={dynamicStyles.modalOverlay}>
          <View style={[dynamicStyles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={[dynamicStyles.modalTitle, { color: theme.textPrimary }]}>Add Food</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={[dynamicStyles.searchContainer, { backgroundColor: `${accentColor}10` }]}>
              <Search size={20} color={theme.textSecondary} />
              <TextInput
                style={[dynamicStyles.searchInput, { color: theme.textPrimary }]}
                placeholder="Search foods..."
                placeholderTextColor={theme.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <View style={dynamicStyles.mealTypeSelection}>
              {mealTypes.map((meal) => (
                <TouchableOpacity
                  key={meal.key}
                  style={[
                    dynamicStyles.mealTypeButton,
                    { backgroundColor: `${accentColor}10` },
                    mealType === meal.key && { backgroundColor: meal.color + '30' },
                  ]}
                  onPress={() => setMealType(meal.key as any)}
                >
                  <Text style={dynamicStyles.mealTypeEmoji}>{meal.icon}</Text>
                  <Text
                    style={[
                      dynamicStyles.mealTypeText,
                      { color: theme.textSecondary },
                      mealType === meal.key && { color: meal.color, fontWeight: '600' },
                    ]}
                  >
                    {meal.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView style={dynamicStyles.foodList}>
              {filteredFoods.map((food, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    dynamicStyles.foodItem,
                    { backgroundColor: `${accentColor}10` },
                    selectedFood?.name === food.name && { 
                      backgroundColor: `${accentColor}20`,
                      borderWidth: 2,
                      borderColor: accentColor,
                    },
                  ]}
                  onPress={() => setSelectedFood(food)}
                >
                  <View style={dynamicStyles.foodInfo}>
                    <Text style={[dynamicStyles.foodItemName, { color: theme.textPrimary }]}>{food.name}</Text>
                    <Text style={[dynamicStyles.foodItemDetails, { color: theme.textSecondary }]}>
                      {food.calories} cal • P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {selectedFood && (
              <View style={dynamicStyles.quantitySection}>
                <Text style={[dynamicStyles.quantityLabel, { color: theme.textPrimary }]}>Quantity:</Text>
                <TextInput
                  style={[dynamicStyles.quantityInput, { 
                    borderColor: theme.border, 
                    color: theme.textPrimary,
                    backgroundColor: theme.cardBackground,
                  }]}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  placeholder="1"
                  placeholderTextColor={theme.textSecondary}
                />
                <TouchableOpacity 
                  style={[dynamicStyles.addButton, { backgroundColor: accentColor }]} 
                  onPress={handleAddFood}
                >
                  <Text style={dynamicStyles.addButtonText}>Add Food</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* AI Insights */}
      <Modal visible={showAiInsights} animationType="slide" onRequestClose={() => setShowAiInsights(false)}>
        <AIInsights visible={showAiInsights} onClose={() => setShowAiInsights(false)} />
      </Modal>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

// ============================================================================
// DYNAMIC STYLES (Theme-aware)
// ============================================================================

const createStyles = (theme: any, accentColor: string, width: number, height: number) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 10,
  },
  title: {
    fontSize: width * 0.07,
    marginBottom: 4,
    fontFamily: 'Bold',
  },
  subtitle: {
    fontSize: width * 0.035,
    fontWeight: '500',
    lineHeight: width * 0.05,
  },
  imageContainer: {
    width: width * 0.35,
    height: height * 0.13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  summaryCard: {
    margin: 20,
    padding: 20,
    borderRadius: 20,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  calorieProgress: {
    alignItems: 'center',
    paddingVertical: 2,
    flexDirection: 'row-reverse',
  },
  calorieDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginRight: 60,
    gap: 20,
  },
  calorieDetailItem: {
    alignItems: 'center',
  },
  calorieDetailLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  calorieDetailValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  calorieDetailDivider: {
    width: 1,
    height: 30,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Bold',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  quickActionButton: {
    minWidth: '22%',
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    margin: 20,
    borderRadius: 20,
    padding: 24,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 8,
    fontSize: 16,
  },
  mealTypeSelection: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  mealTypeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
  },
  mealTypeEmoji: {
    fontSize: 16,
    marginBottom: 4,
  },
  mealTypeText: {
    fontSize: 12,
  },
  foodList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  foodItem: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  foodInfo: {
    flex: 1,
  },
  foodItemName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  foodItemDetails: {
    fontSize: 12,
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  quantityInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 60,
    textAlign: 'center',
  },
  addButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
