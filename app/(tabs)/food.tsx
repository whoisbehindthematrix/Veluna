import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCycle } from '@/contexts/CycleContext';
import { commonFoods, weeklyMealPlans, FoodItem } from '@/data/foodData';
import { Camera, Plus, Search, X, Calendar, Target, TrendingUp } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { AIInsights } from '@/components/AIInsights';
import { aiService } from '@/services/aiService';
import { styles } from '@/styles/screens/FoodScreen.style';
import CircularProgress from 'react-native-circular-progress-indicator';


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
      <LinearGradient colors={['#f6cc23ff', '#f8fafc']} style={styles.header}>
        <View style={styles.homeIconContainer}>
          <View style={styles.backToHomeButton}></View>
        </View>
        <View style={styles.headerContent}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Food Tracking</Text>
            <Text style={styles.subtitle}>Monitor your nutrition and calories</Text>
          </View>
          <View style={styles.imageContainer}>
            <LinearGradient colors={['#f97316', '#fbbf24' ]} style={{ backgroundColor: '#fef3c7', height:120, width: 120, borderRadius:100,  position: 'absolute', bottom: 12, right: 10, }}></LinearGradient>
            <Image
              source={require('../../assets/images/appleeat.png')}
              style={styles.headerImage}
              resizeMode="contain"
            />
            
          </View>
        </View>
      </LinearGradient>

      {/* Daily Summary */}
      {/* <View style={styles.summaryCard}>
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
      </View> */}

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Target size={24} color="#f97316" />
          <Text style={styles.summaryTitle}>Today's Progress</Text>
        </View>

        <View style={styles.calorieProgress}>
          {/* Circular Progress Indicator */}
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
            titleStyle={{fontWeight: 'bold', fontSize: 12 }}
            progressValueStyle={{ fontFamily: 'Bold', fontSize: 28 }}
            progressValueFontSize={20}
            circleBackgroundColor={'#fff'}
          />

          {/* Additional Info Below Circle */}
          <View style={styles.calorieDetails}>
            <View style={styles.calorieDetailItem}>
              <Text style={styles.calorieDetailLabel}>Goal</Text>
              <Text style={styles.calorieDetailValue}>{calorieGoal}</Text>
            </View>
            <View style={styles.calorieDetailDivider} />
            <View style={styles.calorieDetailItem}>
              <Text style={styles.calorieDetailLabel}>Remaining</Text>
              <Text style={[
                styles.calorieDetailValue,
                remainingCalories < 0 ? styles.overCalories : styles.underCalories
              ]}>
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
