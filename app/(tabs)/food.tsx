import React, { useEffect, useMemo, useState } from 'react';
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
import { Camera, Plus, Calendar, Target, TrendingUp } from 'lucide-react-native';
import { AIInsights } from '@/components/AIInsights';
import CircularProgress from 'react-native-circular-progress-indicator';
import { useTheme } from '@/src/context/ThemeContext';
import { useCycleStore } from '@/hooks/useCycleStore';
import FoodScanModal, { ScanResult } from '@/components/food/FoodScanModal';
import { AddFoodModal } from '@/components/food/AddFoodModal';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/src/store';
import { fetchGlobalFoods } from '@/src/store/slices/foodSlice';
import NeuPressable from '@/components/core-components/NeuPressable';
import { addOpacityToHex } from '@/src/utils';

export default function FoodScreen() {
  const { cycle, addFoodEntry } = useCycleStore();
  const { theme, accentColor } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { globalFoods, loadingGlobal } = useSelector((state: RootState) => state.food);

  const { width, height } = Dimensions.get('window');
  const dynamicStyles = useMemo(() => createStyles(theme, accentColor, width, height), [theme, accentColor, width, height]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showMealPlanModal, setShowMealPlanModal] = useState(false);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [showAiInsights, setShowAiInsights] = useState(false);

  // Load global foods once
  useEffect(() => {
    if (!globalFoods || globalFoods.length === 0) {
      dispatch(fetchGlobalFoods());
    }
  }, [dispatch, globalFoods]);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todaysFoodEntries = useMemo(
    () => cycle.foodEntries.filter((entry) => entry.date === today),
    [cycle.foodEntries, today]
  );
  const todaysCalories = useMemo(
    () => todaysFoodEntries.reduce((sum, entry) => sum + entry.calories, 0),
    [todaysFoodEntries]
  );

  const calorieGoal =
    (cycle.profile as any)?.dailyCalorieGoal ??
    2000;
  const remainingCalories = calorieGoal - todaysCalories;

  const currentPhasePlan = weeklyMealPlans.find(
    (plan) => plan.phase === cycle.currentPhase.name
  );

  // Map global foods from backend into FoodItem shape for UI
  const globalFoodItems: FoodItem[] = useMemo(
    () =>
      (globalFoods || []).map((food) => ({
        name: food.name,
        calories: food.calories,
        protein: food.proteinGrams,
        carbs: food.carbsGrams,
        fat: food.fatGrams,
        // Fallback category to keep UI stable
        category: (food.category || 'SNACK').toLowerCase(),
        imageUrl: food.imageUrl,
      })),
    [globalFoods],
  );

  // Prefer global foods from backend; fallback to static commonFoods
  const allFoods: FoodItem[] = useMemo(
    () => (globalFoodItems.length > 0 ? globalFoodItems : commonFoods),
    [globalFoodItems],
  );

  const handleScanAdd = ({ analysis, name, note }: { analysis: ScanResult; name: string; note?: string }) => {
    addFoodEntry({
      id: Date.now().toString(),
      date: today,
      name,
      calories: Math.round(analysis.calories || 0),
      protein: 0,
      carbs: 0,
      fat: 0,
      mealType,
      note,
    });

    Alert.alert(
      'Added from scan',
      `${name}\n${Math.round(analysis.calories || 0)} cal`
    );
  };

  // 🥗 Add from global list handler
  const handleAddFoodFromGlobal = ({
    food,
    quantity,
    mealType: mt,
  }: {
    food: FoodItem;
    quantity: number;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  }) => {
    addFoodEntry({
      id: Date.now().toString(),
      date: today,
      name: `${food.name} (${quantity}x)`,
      calories: Math.round((food.calories || 0) * quantity),
      protein: Math.round((food.protein || 0) * quantity),
      carbs: Math.round((food.carbs || 0) * quantity),
      fat: Math.round((food.fat || 0) * quantity),
      mealType: mt,
    });

    setShowAddModal(false);
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
      <NeuPressable
        borderRadius={20}
        backgroundColor="#fff"
        shadowColor={addOpacityToHex(accentColor, 0.1)}
        onPress={() => setShowAiInsights(true)}
        style={{margin: 20}}  
      >
      <View style={[dynamicStyles.summaryCard, {
        backgroundColor: theme.cardBackground,
        shadowColor: addOpacityToHex(accentColor, 0.1),
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
      </NeuPressable>

      {/* Quick Actions */}
      <View style={dynamicStyles.section}>
        <Text style={[dynamicStyles.sectionTitle, { color: theme.textPrimary }]}>Quick Add</Text>
        <View style={dynamicStyles.quickActions}>
          <NeuPressable
            borderRadius={20}
            backgroundColor="#fff"
            shadowColor={addOpacityToHex(accentColor, 0.1)}
            onPress={() => setShowScanModal(true)}
          >
            <View
              style={[dynamicStyles.quickActionButton, {
                backgroundColor: theme.cardBackground,
                shadowColor: addOpacityToHex(accentColor, 0.1),
              }]}

            >
              <Camera size={24} color={accentColor} />
              <Text style={[dynamicStyles.quickActionText, { color: theme.textPrimary }]}>Scan Food</Text>
            </View>
          </NeuPressable>


          <NeuPressable
            borderRadius={20}
            backgroundColor="#fff"
            shadowColor={addOpacityToHex(accentColor, 0.1)}
            onPress={() => setShowAddModal(true)}
          >
            <View
              style={[dynamicStyles.quickActionButton, {
                backgroundColor: theme.cardBackground,
                shadowColor: addOpacityToHex(accentColor, 0.1),
              }]}

            >
              <Plus size={24} color={accentColor} />
              <Text style={[dynamicStyles.quickActionText, { color: theme.textPrimary }]}>Add Food</Text>
            </View>
          </NeuPressable>


          <NeuPressable
            borderRadius={20}
            backgroundColor="#fff"
            shadowColor={addOpacityToHex(accentColor, 0.1)}
            onPress={() => setShowMealPlanModal(true)}
          >
            <View
              style={[dynamicStyles.quickActionButton, {
                backgroundColor: theme.cardBackground,
                shadowColor: addOpacityToHex(accentColor, 0.1),
              }]}
            >
              <Calendar size={24} color={accentColor} />
              <Text style={[dynamicStyles.quickActionText, { color: theme.textPrimary }]}>Meal Plan</Text>
            </View>
          </NeuPressable>



          <NeuPressable
            borderRadius={20}
            backgroundColor="#fff"
            shadowColor={addOpacityToHex(accentColor, 0.1)}
            onPress={() => setShowAiInsights(true)}
          >
            <View
            style={[dynamicStyles.quickActionButton, {
              backgroundColor: theme.cardBackground,
              shadowColor: addOpacityToHex(accentColor, 0.1),
            }]}
          >
            <TrendingUp size={24} color={accentColor} />
            <Text style={[dynamicStyles.quickActionText, { color: theme.textPrimary }]}>AI Insights</Text>
          </View>
          </NeuPressable>
        </View>
      </View>

      {/* Today's Food Log */}
      <View style={dynamicStyles.section}>
        <Text style={[dynamicStyles.sectionTitle, { color: theme.textPrimary }]}>Today's Meals</Text>
        {todaysFoodEntries.length === 0 && (
          <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
            No food logged yet. Scan a meal or add food to get started.
          </Text>
        )}

        {mealTypes.map((meal) => {
          const entries = getMealTypeEntries(meal.key);
          if (!entries.length) return null;

          const totalCalories = getMealTypeCalories(meal.key);

          return (
            <View
              key={meal.key}
              style={[
                dynamicStyles.mealLogSection,
                { backgroundColor: theme.cardBackground, borderColor: `${accentColor}20` },
              ]}
            >
              <View style={dynamicStyles.mealLogHeader}>
                <View style={dynamicStyles.mealLogTitleRow}>
                  <Text style={dynamicStyles.mealLogEmoji}>{meal.icon}</Text>
                  <Text style={[dynamicStyles.mealLogTitle, { color: theme.textPrimary }]}>
                    {meal.name}
                  </Text>
                </View>
                <Text style={[dynamicStyles.mealLogCalories, { color: accentColor }]}>
                  {totalCalories} kcal
                </Text>
              </View>

              {entries.map((entry) => (
                <View
                  key={entry.id}
                  style={[
                    dynamicStyles.mealEntryCard,
                    { backgroundColor: `${accentColor}08`, borderColor: `${accentColor}25` },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[dynamicStyles.mealEntryTitle, { color: theme.textPrimary }]}>
                      {entry.name}
                    </Text>
                    {!!entry.note && (
                      <Text
                        style={[dynamicStyles.mealEntryNote, { color: theme.textSecondary }]}
                        numberOfLines={2}
                      >
                        {entry.note}
                      </Text>
                    )}
                  </View>
                  <View style={dynamicStyles.mealEntryMeta}>
                    <Text style={[dynamicStyles.mealEntryCalories, { color: theme.textPrimary }]}>
                      {entry.calories} kcal
                    </Text>
                    {(entry.protein || entry.carbs || entry.fat) && (
                      <Text
                        style={[dynamicStyles.mealEntryMacros, { color: theme.textSecondary }]}
                        numberOfLines={1}
                      >
                        P {entry.protein || 0} • C {entry.carbs || 0} • F {entry.fat || 0}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          );
        })}
      </View>

      <FoodScanModal
        visible={showScanModal}
        onClose={() => setShowScanModal(false)}
        mealType={mealType}
        onMealTypeChange={setMealType}
        onAddFromScan={handleScanAdd}
      />

      {/* Global Food List Modal */}
      <AddFoodModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        foods={allFoods}
        mealType={mealType}
        onMealTypeChange={setMealType as any}
        loadingGlobal={loadingGlobal}
        onConfirmAdd={handleAddFoodFromGlobal}
      />

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
    // margin: 20,
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
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    // textAlign: 'center',
    width: 40,
   
    // alignSelf: 'stretch',
   

  },
  // Fullscreen Modal Styles
  fullscreenModal: {
    flex: 1,
  },
  modalHeaderGradient: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalHeaderLeft: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 28,
    fontFamily: 'Bold',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  modalSearchWrapper: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  modalMealTypeWrapper: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  modalMealTypeScroll: {
    gap: 10,
    paddingRight: 20,
  },
  modalMealTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 8,
    minWidth: 100,
  },
  modalMealTypeEmoji: {
    fontSize: 18,
  },
  modalMealTypeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalFoodList: {
    flex: 1,
  },
  modalFoodListContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  modalFoodCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalFoodCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalFoodCardLeft: {
    flex: 1,
  },
  modalFoodImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginLeft: 12,
    backgroundColor: '#e5e7eb',
  },
  modalFoodName: {
    fontSize: 16,
    fontFamily: 'Bold',
    marginBottom: 8,
  },
  modalFoodMacros: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  modalMacroBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modalMacroText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalMacroDetail: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalSelectedIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  modalEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  modalEmptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalEmptySubtext: {
    fontSize: 14,
  },
  modalBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  modalBottomContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalQuantitySection: {
    flex: 1,
  },
  modalQuantityLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalQuantityInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalQuantityButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalQuantityButtonText: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalQuantityInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 12,
  },
  modalAddButton: {
    flex: 1.5,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalAddButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Bold',
    fontWeight: '700',
  },
  mealLogSection: {
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  mealLogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealLogTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealLogEmoji: {
    fontSize: 18,
  },
  mealLogTitle: {
    fontSize: 16,
    fontFamily: 'Bold',
  },
  mealLogCalories: {
    fontSize: 14,
    fontWeight: '700',
  },
  mealEntryCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 6,
    gap: 10,
  },
  mealEntryTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  mealEntryNote: {
    fontSize: 12,
  },
  mealEntryMeta: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  mealEntryCalories: {
    fontSize: 14,
    fontWeight: '700',
  },
  mealEntryMacros: {
    fontSize: 11,
    marginTop: 2,
  },
});
