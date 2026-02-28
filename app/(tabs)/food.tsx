import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { commonFoods, weeklyMealPlans, FoodItem } from '@/data/foodData';
import { Camera, Plus, Calendar, Target, TrendingUp, Trash2 } from 'lucide-react-native';
import { AIInsights } from '@/components/AIInsights';
import CircularProgress from 'react-native-circular-progress-indicator';
import { useTheme } from '@/src/context/ThemeContext';
import { useCycleStore } from '@/hooks/useCycleStore';
import FoodScanModal, { ScanResult } from '@/components/food/FoodScanModal';
import { AddFoodModal } from '@/components/food/AddFoodModal';
import MealPlanModal from '@/components/food/MealPlanModal';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/src/store';
import {
  fetchGlobalFoods,
  getFoodLogs,
  createScannedFood,
  createFoodLog,
  deleteFoodLog,
  clearFoodErrors,
  type FoodLogItem,
} from '@/src/store/slices/foodSlice';
import NeuPressable from '@/components/core-components/NeuPressable';
import { addOpacityToHex } from '@/src/utils';

/** Derive display name and macros from a food log entry (global or scanned). */
function getLogEntryDisplay(log: FoodLogItem) {
  const food = log.globalFood || log.scannedFood;
  const name = food
    ? ('name' in food ? food.name : food.foodName)
    : 'Unknown';
  const q = log.quantity;
  const calories = food ? Math.round(food.calories * q) : 0;
  const protein = food ? Math.round(food.proteinGrams * q) : 0;
  const carbs = food ? Math.round(food.carbsGrams * q) : 0;
  const fat = food ? Math.round(food.fatGrams * q) : 0;
  const note = log.scannedFood?.notes ?? null;
  return { name: log.quantity > 1 ? `${name} (${log.quantity}x)` : name, calories, protein, carbs, fat, note };
}

export default function FoodScreen() {
  const { cycle, addFoodEntry } = useCycleStore();
  const { theme, accentColor } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const {
    globalFoods,
    loadingGlobal,
    foodLogs,
    foodLogTotals,
    selectedLogDate,
    loadingLogs,
    logsError,
    actionLoading,
    actionError,
  } = useSelector((state: RootState) => state.food);

  const { width, height } = Dimensions.get('window');
  const dynamicStyles = useMemo(() => createStyles(theme, accentColor, width, height), [theme, accentColor, width, height]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showMealPlanModal, setShowMealPlanModal] = useState(false);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [showAiInsights, setShowAiInsights] = useState(false);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Load global foods once
  useEffect(() => {
    if (!globalFoods || globalFoods.length === 0) {
      dispatch(fetchGlobalFoods());
    }
  }, [dispatch, globalFoods]);

  // Load food log for today on mount and when date is today
  useEffect(() => {
    dispatch(getFoodLogs(today));
  }, [dispatch, today]);

  const todaysCalories = useMemo(
    () => foodLogTotals?.totalCalories ?? 0,
    [foodLogTotals]
  );
  const calorieGoal =
    (cycle.profile as any)?.dailyCalorieGoal ?? 2000;
  const remainingCalories = calorieGoal - todaysCalories;

  const currentPhasePlan = weeklyMealPlans.find(
    (plan) => plan.phase === cycle.currentPhase.name
  );

  // Map global foods from backend into FoodItem shape for UI (include id for API)
  const globalFoodItems: FoodItem[] = useMemo(
    () =>
      (globalFoods || []).map((food) => ({
        id: food.id,
        name: food.name,
        calories: food.calories,
        protein: food.proteinGrams,
        carbs: food.carbsGrams,
        fat: food.fatGrams,
        category: (food.category || 'SNACK').toLowerCase(),
        imageUrl: food.imageUrl,
      })),
    [globalFoods],
  );

  // Prefer global foods from backend; fallback to static commonFoods (no id = local only)
  const allFoods: FoodItem[] = useMemo(
    () => (globalFoodItems.length > 0 ? globalFoodItems : commonFoods),
    [globalFoodItems],
  );

  const handleScanAdd = useCallback(
    async ({ analysis, name, note }: { analysis: ScanResult; name: string; note?: string }) => {
      try {
        const scanned = await dispatch(
          createScannedFood({
            foodName: name.trim() || analysis.foodName || 'Scanned meal',
            calories: Math.round(analysis.calories ?? 0),
            proteinGrams: analysis.protein ?? 0,
            fatGrams: analysis.fat ?? 0,
            carbsGrams: analysis.carbs ?? 0,
            notes: note?.trim() || null,
          })
        ).unwrap();
        await dispatch(
          createFoodLog({ date: today, scannedFoodId: scanned.id, quantity: 1 })
        ).unwrap();
        setShowScanModal(false);
        Alert.alert('Added', `${name}\n${Math.round(analysis.calories ?? 0)} cal`);
      } catch (err: any) {
        Alert.alert('Error', err?.message ?? 'Failed to add from scan');
      }
    },
    [dispatch, today]
  );

  const handleAddFoodFromGlobal = useCallback(
    (
      {
        food,
        quantity,
        mealType: _mt,
      }: {
        food: FoodItem;
        quantity: number;
        mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      }
    ) => {
      if (food.id) {
        dispatch(createFoodLog({ date: today, globalFoodId: food.id, quantity }))
          .unwrap()
          .then(() => setShowAddModal(false))
          .catch((err: any) => Alert.alert('Error', err?.message ?? 'Failed to add to log'));
      } else {
        addFoodEntry({
          id: Date.now().toString(),
          date: today,
          name: `${food.name} (${quantity}x)`,
          calories: Math.round((food.calories || 0) * quantity),
          protein: Math.round((food.protein || 0) * quantity),
          carbs: Math.round((food.carbs || 0) * quantity),
          fat: Math.round((food.fat || 0) * quantity),
          mealType: _mt,
        });
        setShowAddModal(false);
      }
    },
    [dispatch, today, addFoodEntry]
  );

  const handleDeleteLog = useCallback(
    (logId: string) => {
      Alert.alert('Remove', 'Remove this item from your log?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => dispatch(deleteFoodLog(logId)) },
      ]);
    },
    [dispatch]
  );

  const isShowingToday = selectedLogDate === today;

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
            backgroundColor={theme.cardBackground}
            shadowColor={addOpacityToHex(accentColor, 0.1)}
            onPress={() => { dispatch(clearFoodErrors()); setShowScanModal(true); }}
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
            backgroundColor={theme.cardBackground}
            shadowColor={addOpacityToHex(accentColor, 0.1)}
            onPress={() => { dispatch(clearFoodErrors()); setShowAddModal(true); }}
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
            backgroundColor={theme.cardBackground}
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
            backgroundColor={theme.cardBackground}
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

      {/* Today's Food Log (backend) */}
      <View style={dynamicStyles.section}>
        <Text style={[dynamicStyles.sectionTitle, { color: theme.textPrimary }]}>Today's Meals</Text>
        {actionError && (
          <Text style={{ color: '#ef4444', fontSize: 14, marginBottom: 8 }}>{actionError}</Text>
        )}
        {loadingLogs ? (
          <View style={{ paddingVertical: 24, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={accentColor} />
            <Text style={{ color: theme.textSecondary, marginTop: 8 }}>Loading food log...</Text>
          </View>
        ) : logsError ? (
          <Text style={{ color: theme.textSecondary, fontSize: 14 }}>{logsError}</Text>
        ) : !isShowingToday || foodLogs.length === 0 ? (
          <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
            No food logged yet. Scan a meal or add food to get started.
          </Text>
        ) : (
          <View style={[dynamicStyles.mealLogSection, { backgroundColor: theme.cardBackground, borderColor: `${accentColor}20` }]}>
            <View style={dynamicStyles.mealLogHeader}>
              <Text style={[dynamicStyles.mealLogTitle, { color: theme.textPrimary }]}>All meals</Text>
              <Text style={[dynamicStyles.mealLogCalories, { color: accentColor }]}>
                {todaysCalories} kcal
              </Text>
            </View>
            {foodLogs.map((log) => {
              const display = getLogEntryDisplay(log);
              return (
                <View
                  key={log.id}
                  style={[
                    dynamicStyles.mealEntryCard,
                    { backgroundColor: `${accentColor}08`, borderColor: `${accentColor}25` },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[dynamicStyles.mealEntryTitle, { color: theme.textPrimary }]}>
                      {display.name}
                    </Text>
                    {!!display.note && (
                      <Text
                        style={[dynamicStyles.mealEntryNote, { color: theme.textSecondary }]}
                        numberOfLines={2}
                      >
                        {display.note}
                      </Text>
                    )}
                  </View>
                  <View style={[dynamicStyles.mealEntryMeta, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                    <Text style={[dynamicStyles.mealEntryCalories, { color: theme.textPrimary }]}>
                      {display.calories} kcal
                    </Text>
                    {(display.protein || display.carbs || display.fat) ? (
                      <Text
                        style={[dynamicStyles.mealEntryMacros, { color: theme.textSecondary }]}
                        numberOfLines={1}
                      >
                        P {display.protein} • C {display.carbs} • F {display.fat}
                      </Text>
                    ) : null}
                    {actionLoading ? null : (
                      <TouchableOpacity
                        onPress={() => handleDeleteLog(log.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={{ padding: 4 }}
                      >
                        <Trash2 size={18} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
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

      {/* Meal Plan Modal */}
      <MealPlanModal
        visible={showMealPlanModal}
        onClose={() => setShowMealPlanModal(false)}
        onMealAdded={() => {
          dispatch(getFoodLogs(today));
        }}
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
