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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { commonFoods, weeklyMealPlans, FoodItem } from '@/data/foodData';
import { Camera, Plus, Search, X, Calendar, Target, TrendingUp } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { AIInsights } from '@/components/AIInsights';
import { supabase } from '@/lib/supabase';
import CircularProgress from 'react-native-circular-progress-indicator';
import { styles } from '@/styles/screens/FoodScreen.style';
import { useCycleStore } from '@/hooks/useCycleStore';

export default function FoodScreen() {
  const { cycle, addFoodEntry } = useCycleStore();
  const router = useRouter();

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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={['#f6cc23ff', '#f8fafc']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Food Tracking</Text>
            <Text style={styles.subtitle}>Monitor your nutrition and calories</Text>
          </View>
          <View style={styles.imageContainer}>
            <LinearGradient
              colors={['#f97316', '#fbbf24']}
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
              style={styles.headerImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </LinearGradient>

      {/* Calorie Progress */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Target size={24} color="#f97316" />
          <Text style={styles.summaryTitle}>Today's Progress</Text>
        </View>

        <View style={styles.calorieProgress}>
          <CircularProgress
            value={todaysCalories}
            maxValue={calorieGoal}
            radius={50}
            duration={1000}
            progressValueColor={'#f97316'}
            activeStrokeColor={'#f97316'}
            activeStrokeSecondaryColor={'#fbbf24'}
            inActiveStrokeColor={'#f3f4f6'}
            inActiveStrokeOpacity={1}
            inActiveStrokeWidth={16}
            activeStrokeWidth={16}
            title={'Calories'}
            titleColor={'#6b7280'}
            titleStyle={{ fontWeight: 'bold', fontSize: 12 }}
            progressValueStyle={{ fontFamily: 'Bold', fontSize: 28 }}
            circleBackgroundColor={'#fff'}
          />

          <View style={styles.calorieDetails}>
            <View style={styles.calorieDetailItem}>
              <Text style={styles.calorieDetailLabel}>Goal</Text>
              <Text style={styles.calorieDetailValue}>{calorieGoal}</Text>
            </View>
            <View style={styles.calorieDetailDivider} />
            <View style={styles.calorieDetailItem}>
              <Text style={styles.calorieDetailLabel}>Remaining</Text>
              <Text
                style={[
                  styles.calorieDetailValue,
                  remainingCalories < 0 ? styles.overCalories : styles.underCalories,
                ]}
              >
                {remainingCalories >= 0 ? remainingCalories : `+${Math.abs(remainingCalories)}`}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Add</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton} onPress={takeFoodPhoto}>
            <Camera size={24} color="#ec4899" />
            <Text style={styles.quickActionText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionButton} onPress={() => setShowAddModal(true)}>
            <Plus size={24} color="#10b981" />
            <Text style={styles.quickActionText}>Add Food</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionButton} onPress={() => setShowMealPlanModal(true)}>
            <Calendar size={24} color="#8b5cf6" />
            <Text style={styles.quickActionText}>Meal Plan</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionButton} onPress={() => setShowAiInsights(true)}>
            <TrendingUp size={24} color="#3b82f6" />
            <Text style={styles.quickActionText}>AI Insights</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add Food Modal */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Food</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Search size={20} color="#6b7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search foods..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <View style={styles.mealTypeSelection}>
              {mealTypes.map((meal) => (
                <TouchableOpacity
                  key={meal.key}
                  style={[
                    styles.mealTypeButton,
                    mealType === meal.key && styles.mealTypeButtonActive,
                  ]}
                  onPress={() => setMealType(meal.key as any)}
                >
                  <Text style={styles.mealTypeEmoji}>{meal.icon}</Text>
                  <Text
                    style={[
                      styles.mealTypeText,
                      mealType === meal.key && styles.mealTypeTextActive,
                    ]}
                  >
                    {meal.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView style={styles.foodList}>
              {filteredFoods.map((food, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.foodItem,
                    selectedFood?.name === food.name && styles.foodItemSelected,
                  ]}
                  onPress={() => setSelectedFood(food)}
                >
                  <View style={styles.foodInfo}>
                    <Text style={styles.foodItemName}>{food.name}</Text>
                    <Text style={styles.foodItemDetails}>
                      {food.calories} cal • P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {selectedFood && (
              <View style={styles.quantitySection}>
                <Text style={styles.quantityLabel}>Quantity:</Text>
                <TextInput
                  style={styles.quantityInput}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  placeholder="1"
                />
                <TouchableOpacity style={styles.addButton} onPress={handleAddFood}>
                  <Text style={styles.addButtonText}>Add Food</Text>
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
