import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCycle } from '@/contexts/CycleContext';
import { commonFoods, weeklyMealPlans, FoodItem } from '@/data/foodData';
import { Camera, Plus, Search, X, Calendar, Target, TrendingUp, Chrome as Home } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

import { AIInsights } from '@/components/AIInsights';
import { aiService } from '@/services/aiService';
export default function FoodScreen() {
  const { state, dispatch } = useCycle();
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMealPlanModal, setShowMealPlanModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [showAiInsights, setShowAiInsights] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const todaysFoodEntries = state.foodEntries.filter(entry => entry.date === today);
  const todaysCalories = todaysFoodEntries.reduce((sum, entry) => sum + entry.calories, 0);
  const calorieGoal = state.profile.dailyCalorieGoal;
  const remainingCalories = calorieGoal - todaysCalories;

  const currentPhasePlan = weeklyMealPlans.find(plan => plan.phase === state.currentPhase);

  const filteredFoods = commonFoods.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

    if (!result.canceled) {
      try {
        Alert.alert('Analyzing...', 'Please wait while we estimate calories.');
        const analysis = await aiService.analyzeFoodImage(result.assets[0].uri);

        const newEntry = {
          id: Date.now().toString(),
          date: today,
          name: `${analysis.foodName} (${analysis.portion})`,
          calories: Math.round(analysis.calories),
          protein: Math.round(analysis.protein),
          carbs: Math.round(analysis.carbs),
          fat: Math.round(analysis.fat),
          mealType,
          imageUri: result.assets[0].uri,
        };

        dispatch({ type: 'ADD_FOOD_ENTRY', payload: newEntry });

        Alert.alert(
          'Added from Photo',
          `${newEntry.name}\n${newEntry.calories} cal • P ${newEntry.protein}g • C ${newEntry.carbs}g • F ${newEntry.fat}g`,
        );
      } catch (e) {
        console.error(e);
        Alert.alert('Analysis failed', 'Unable to analyze photo. Please try again or add manually.');
        setShowAddModal(true);
      }
    }
  };

  const addFoodEntry = () => {
    if (!selectedFood) return;

    const multiplier = parseFloat(quantity) || 1;
    const newEntry = {
      id: Date.now().toString(),
      date: today,
      name: `${selectedFood.name} (${quantity}x)`,
      calories: Math.round(selectedFood.calories * multiplier),
      protein: Math.round(selectedFood.protein * multiplier),
      carbs: Math.round(selectedFood.carbs * multiplier),
      fat: Math.round(selectedFood.fat * multiplier),
      mealType,
    };

    dispatch({ type: 'ADD_FOOD_ENTRY', payload: newEntry });
    setShowAddModal(false);
    setSelectedFood(null);
    setQuantity('1');
    setSearchQuery('');
  };

  const getMealTypeEntries = (type: string) => {
    return todaysFoodEntries.filter(entry => entry.mealType === type);
  };

  const getMealTypeCalories = (type: string) => {
    return getMealTypeEntries(type).reduce((sum, entry) => sum + entry.calories, 0);
  };

  const mealTypes = [
    { key: 'breakfast', name: 'Breakfast', icon: '🌅', color: '#fbbf24' },
    { key: 'lunch', name: 'Lunch', icon: '☀️', color: '#f97316' },
    { key: 'dinner', name: 'Dinner', icon: '🌙', color: '#8b5cf6' },
    { key: 'snack', name: 'Snacks', icon: '🍎', color: '#10b981' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#fef3c7', '#f8fafc']}
        style={styles.header}
      >
        <View style={styles.homeIconContainer}>
          <View style={styles.backToHomeButton}>
            <TouchableOpacity onPress={() => router.push('/')}>
              <Home size={20} color="#f97316" />
            </TouchableOpacity>
            <Text style={styles.backToHomeText}>Home</Text>
          </View>
        </View>
        <View style={styles.headerContent}>
          <Text className='tex' style={styles.title}>Food Tracking</Text>
          <Text style={styles.subtitle}>Monitor your nutrition and calories</Text>
        </View>
      </LinearGradient>

      {/* Daily Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Target size={24} color="#f97316" />
          <Text style={styles.summaryTitle}>Today's Progress</Text>
        </View>
        
        <View style={styles.calorieProgress}>
          <View style={styles.calorieNumbers}>
            <Text style={styles.caloriesConsumed}>{todaysCalories}</Text>
            <Text style={styles.calorieGoal}>/ {calorieGoal} cal</Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min((todaysCalories / calorieGoal) * 100, 100)}%` }
              ]} 
            />
          </View>
          <Text style={[
            styles.remainingCalories,
            remainingCalories < 0 ? styles.overCalories : styles.underCalories
          ]}>
            {remainingCalories >= 0 ? `${remainingCalories} cal remaining` : `${Math.abs(remainingCalories)} cal over`}
          </Text>
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

      {/* Today's Meals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Meals</Text>
        {mealTypes.map((meal) => {
          const entries = getMealTypeEntries(meal.key);
          const calories = getMealTypeCalories(meal.key);
          
          return (
            <View key={meal.key} style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <View style={styles.mealInfo}>
                  <Text style={styles.mealEmoji}>{meal.icon}</Text>
                  <Text style={styles.mealName}>{meal.name}</Text>
                </View>
                <Text style={styles.mealCalories}>{calories} cal</Text>
              </View>
              
              {entries.length > 0 ? (
                <View style={styles.mealEntries}>
                  {entries.map((entry) => (
                    <View key={entry.id} style={styles.foodEntry}>
                      <Text style={styles.foodName}>{entry.name}</Text>
                      <Text style={styles.foodCalories}>{entry.calories} cal</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noEntries}>No items logged</Text>
              )}
            </View>
          );
        })}
      </View>

      {/* Phase-Based Meal Plan */}
      {currentPhasePlan && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended for Your Phase</Text>
          <View style={styles.mealPlanCard}>
            <Text style={styles.mealPlanTitle}>{currentPhasePlan.name}</Text>
            <Text style={styles.mealPlanDescription}>{currentPhasePlan.description}</Text>
            
            <View style={styles.mealPlanBenefits}>
              {currentPhasePlan.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitTag}>
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
            
            <TouchableOpacity 
              style={styles.viewPlanButton}
              onPress={() => setShowMealPlanModal(true)}
            >
              <Text style={styles.viewPlanButtonText}>View Full Plan</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Add Food Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Food</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            {/* Search */}
            <View style={styles.searchContainer}>
              <Search size={20} color="#6b7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search foods..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            
            {/* Meal Type Selection */}
            <View style={styles.mealTypeSelection}>
              {mealTypes.map((meal) => (
                <TouchableOpacity
                  key={meal.key}
                  style={[
                    styles.mealTypeButton,
                    mealType === meal.key && styles.mealTypeButtonActive
                  ]}
                  onPress={() => setMealType(meal.key as any)}
                >
                  <Text style={styles.mealTypeEmoji}>{meal.icon}</Text>
                  <Text style={[
                    styles.mealTypeText,
                    mealType === meal.key && styles.mealTypeTextActive
                  ]}>
                    {meal.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Food List */}
            <ScrollView style={styles.foodList}>
              {filteredFoods.map((food, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.foodItem,
                    selectedFood?.name === food.name && styles.foodItemSelected
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
                <TouchableOpacity style={styles.addButton} onPress={addFoodEntry}>
                  <Text style={styles.addButtonText}>Add Food</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Meal Plan Modal */}
      <Modal
        visible={showMealPlanModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMealPlanModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Weekly Meal Plan</Text>
              <TouchableOpacity onPress={() => setShowMealPlanModal(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            {currentPhasePlan && (
              <ScrollView style={styles.mealPlanDetails}>
                <Text style={styles.mealPlanTitle}>{currentPhasePlan.name}</Text>
                <Text style={styles.mealPlanDescription}>{currentPhasePlan.description}</Text>
                
                {Object.entries(currentPhasePlan.meals).map(([mealType, items]) => (
                  <View key={mealType} style={styles.mealPlanSection}>
                    <Text style={styles.mealPlanSectionTitle}>
                      {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                    </Text>
                    {items.map((item, index) => (
                      <Text key={index} style={styles.mealPlanItem}>• {item}</Text>
                    ))}
                  </View>
                ))}
                
                <View style={styles.mealPlanFooter}>
                  <Text style={styles.totalCalories}>
                    Total Daily Calories: {currentPhasePlan.totalCalories}
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* AI Insights Modal */}
      <Modal
        visible={showAiInsights}
        animationType="slide"
        onRequestClose={() => setShowAiInsights(false)}
      >
        <AIInsights 
          visible={showAiInsights} 
          onClose={() => setShowAiInsights(false)} 
        />
      </Modal>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefefe',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  homeIconContainer: {
    marginBottom: 16,
  },
  headerContent: {
    flex: 1,
  },
  backToHomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  backToHomeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f97316',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  summaryCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
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
    color: '#1f2937',
  },
  calorieProgress: {
    alignItems: 'center',
  },
  calorieNumbers: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  caloriesConsumed: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f97316',
  },
  calorieGoal: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 4,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f97316',
    borderRadius: 4,
  },
  remainingCalories: {
    fontSize: 14,
    fontWeight: '500',
  },
  underCalories: {
    color: '#10b981',
  },
  overCalories: {
    color: '#ef4444',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
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
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  mealCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealEmoji: {
    fontSize: 20,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  mealCalories: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f97316',
  },
  mealEntries: {
    gap: 4,
  },
  foodEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  foodName: {
    fontSize: 14,
    color: '#4b5563',
    flex: 1,
  },
  foodCalories: {
    fontSize: 14,
    color: '#6b7280',
  },
  noEntries: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  mealPlanCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  mealPlanTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  mealPlanDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  mealPlanBenefits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  benefitTag: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  benefitText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '500',
  },
  viewPlanButton: {
    backgroundColor: '#f97316',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewPlanButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
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
    color: '#1f2937',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
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
    backgroundColor: '#f9fafb',
  },
  mealTypeButtonActive: {
    backgroundColor: '#fef3c7',
  },
  mealTypeEmoji: {
    fontSize: 16,
    marginBottom: 4,
  },
  mealTypeText: {
    fontSize: 12,
    color: '#6b7280',
  },
  mealTypeTextActive: {
    color: '#92400e',
    fontWeight: '600',
  },
  foodList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  foodItem: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  foodItemSelected: {
    backgroundColor: '#fef3c7',
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  foodInfo: {
    flex: 1,
  },
  foodItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  foodItemDetails: {
    fontSize: 12,
    color: '#6b7280',
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 60,
    textAlign: 'center',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  mealPlanDetails: {
    maxHeight: 400,
  },
  mealPlanSection: {
    marginBottom: 16,
  },
  mealPlanSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  mealPlanItem: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
    lineHeight: 20,
  },
  mealPlanFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
    alignItems: 'center',
  },
  totalCalories: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f97316',
  },
});