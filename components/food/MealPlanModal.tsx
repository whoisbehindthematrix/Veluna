import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Sun,
  UtensilsCrossed,
  Moon,
  Cookie,
  CheckCircle2,
  Sparkles,
  Calendar,
  Target,
  Zap,
} from 'lucide-react-native';
import { MealPlan, weeklyMealPlans } from '@/data/foodData';
import { useTheme } from '@/src/context/ThemeContext';
import { useCycleStore } from '@/hooks/useCycleStore';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/src/store';
import { createFoodLog, createScannedFood } from '@/src/store/slices/foodSlice';
import { addOpacityToHex } from '@/src/utils';

// Dimensions available if needed for responsive design

interface MealPlanModalProps {
  visible: boolean;
  onClose: () => void;
  onMealAdded?: () => void;
}

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';
type SelectedMeal = {
  mealType: MealType;
  mealName: string;
  planId: string;
};

const mealTypeConfig: Record<MealType, { icon: any; emoji: string; color: string; label: string }> = {
  breakfast: {
    icon: Sun,
    emoji: '🌅',
    color: '#FFB84D',
    label: 'Breakfast',
  },
  lunch: {
    icon: UtensilsCrossed,
    emoji: '🍽️',
    color: '#4CAF50',
    label: 'Lunch',
  },
  dinner: {
    icon: Moon,
    emoji: '🌙',
    color: '#6366F1',
    label: 'Dinner',
  },
  snacks: {
    icon: Cookie,
    emoji: '🍪',
    color: '#EC4899',
    label: 'Snacks',
  },
};

export default function MealPlanModal({ visible, onClose, onMealAdded }: MealPlanModalProps) {
  const { theme, accentColor } = useTheme();
  const { cycle } = useCycleStore();
  const dispatch = useDispatch<AppDispatch>();

  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');
  const [selectedMeals, setSelectedMeals] = useState<SelectedMeal[]>([]);
  const [addingMeals, setAddingMeals] = useState(false);

  // Get meal plan for current phase
  const currentMealPlan = useMemo(() => {
    return weeklyMealPlans.find((plan) => plan.phase === cycle.currentPhase?.name) || weeklyMealPlans[0];
  }, [cycle.currentPhase?.name]);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const styles = useMemo(() => createStyles(theme, accentColor), [theme, accentColor]);

  const toggleMealSelection = useCallback((mealType: MealType, mealName: string) => {
    setSelectedMeals((prev) => {
      const existingIndex = prev.findIndex(
        (m) => m.mealType === mealType && m.mealName === mealName && m.planId === currentMealPlan.id
      );
      if (existingIndex >= 0) {
        return prev.filter((_, idx) => idx !== existingIndex);
      }
      return [...prev, { mealType, mealName, planId: currentMealPlan.id }];
    });
  }, [currentMealPlan.id]);

  const isMealSelected = useCallback(
    (mealType: MealType, mealName: string) => {
      return selectedMeals.some(
        (m) => m.mealType === mealType && m.mealName === mealName && m.planId === currentMealPlan.id
      );
    },
    [selectedMeals, currentMealPlan.id]
  );

  // Estimate calories based on meal type (rough estimates)
  const estimateMealNutrition = useCallback((mealName: string, mealType: MealType) => {
    // Base estimates per meal type
    const baseCalories: Record<MealType, number> = {
      breakfast: 400,
      lunch: 500,
      dinner: 600,
      snacks: 200,
    };

    const calories = baseCalories[mealType];
    // Rough macro estimates (can be improved with better logic)
    const protein = Math.round(calories * 0.2 / 4); // 20% protein
    const carbs = Math.round(calories * 0.5 / 4); // 50% carbs
    const fat = Math.round(calories * 0.3 / 9); // 30% fat

    return { calories, protein, carbs, fat };
  }, []);

  const handleAddSelectedMeals = useCallback(async () => {
    if (selectedMeals.length === 0) {
      Alert.alert('No Meals Selected', 'Please select at least one meal to add to your food log.');
      return;
    }

    setAddingMeals(true);
    try {
      // Create scanned food entries and then add to log
      const results = await Promise.all(
        selectedMeals.map(async (selected) => {
          const nutrition = estimateMealNutrition(selected.mealName, selected.mealType);
          
          // Create scanned food entry
          const scannedFood = await dispatch(
            createScannedFood({
              foodName: selected.mealName,
              calories: nutrition.calories,
              proteinGrams: nutrition.protein,
              carbsGrams: nutrition.carbs,
              fatGrams: nutrition.fat,
              notes: `From ${currentMealPlan.name}`,
            })
          ).unwrap();

          // Add to food log
          await dispatch(
            createFoodLog({
              date: today,
              scannedFoodId: scannedFood.id,
              quantity: 1,
            })
          ).unwrap();

          return scannedFood;
        })
      );

      Alert.alert(
        'Success! 🎉',
        `Added ${selectedMeals.length} meal${selectedMeals.length > 1 ? 's' : ''} to your food log!`
      );
      setSelectedMeals([]);
      onMealAdded?.();
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to add meals. Please try again.');
    } finally {
      setAddingMeals(false);
    }
  }, [selectedMeals, dispatch, today, onMealAdded, onClose, estimateMealNutrition, currentMealPlan.name]);

  const selectedCount = selectedMeals.length;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent={false}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <LinearGradient colors={theme.headerGradient as [string, string]} style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIconContainer, { backgroundColor: `${accentColor}20` }]}>
                <Calendar size={28} color={accentColor} />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Meal Planner</Text>
                <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                  {currentMealPlan.name}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Plan Info Card */}
        <View style={styles.planInfoCard}>
          <View style={styles.planInfoHeader}>
            <View style={[styles.planBadge, { backgroundColor: `${accentColor}15` }]}>
              <Sparkles size={16} color={accentColor} />
              <Text style={[styles.planBadgeText, { color: accentColor }]}>
                {cycle.currentPhase?.name || 'Current'} Phase
              </Text>
            </View>
            <View style={styles.planStats}>
              <View style={styles.planStat}>
                <Target size={14} color={theme.textSecondary} />
                <Text style={[styles.planStatText, { color: theme.textSecondary }]}>
                  {currentMealPlan.totalCalories} cal/day
                </Text>
              </View>
            </View>
          </View>
          <Text style={[styles.planDescription, { color: theme.textSecondary }]}>
            {currentMealPlan.description}
          </Text>
          <View style={styles.benefitsContainer}>
            {currentMealPlan.benefits.map((benefit, idx) => (
              <View key={idx} style={[styles.benefitTag, { backgroundColor: `${accentColor}10` }]}>
                <Zap size={12} color={accentColor} />
                <Text style={[styles.benefitText, { color: accentColor }]}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Meal Type Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.mealTypeScroll}
          contentContainerStyle={styles.mealTypeContent}
        >
          {(Object.keys(mealTypeConfig) as MealType[]).map((mealType) => {
            const config = mealTypeConfig[mealType];
            const Icon = config.icon;
            const isSelected = selectedMealType === mealType;

            return (
              <TouchableOpacity
                key={mealType}
                style={[
                  styles.mealTypeChip,
                  {
                    backgroundColor: isSelected ? config.color : theme.cardBackground,
                    borderColor: isSelected ? config.color : theme.border,
                  },
                ]}
                onPress={() => setSelectedMealType(mealType)}
                activeOpacity={0.7}
              >
                <Text style={styles.mealTypeEmoji}>{config.emoji}</Text>
                <Icon size={18} color={isSelected ? '#fff' : theme.textSecondary} />
                <Text
                  style={[
                    styles.mealTypeText,
                    { color: isSelected ? '#fff' : theme.textSecondary },
                  ]}
                >
                  {config.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Meals List */}
        <ScrollView style={styles.mealsList} showsVerticalScrollIndicator={false}>
          <View style={styles.mealsContent}>
            {currentMealPlan.meals[selectedMealType].map((meal, index) => {
              const isSelected = isMealSelected(selectedMealType, meal);
              const config = mealTypeConfig[selectedMealType];

              return (
                <TouchableOpacity
                  key={`${meal}-${index}`}
                  style={[
                    styles.mealCard,
                    {
                      backgroundColor: isSelected ? `${config.color}15` : theme.cardBackground,
                      borderColor: isSelected ? config.color : theme.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => toggleMealSelection(selectedMealType, meal)}
                  activeOpacity={0.7}
                >
                  <View style={styles.mealCardContent}>
                    <View style={[styles.mealIcon, { backgroundColor: `${config.color}20` }]}>
                      <Text style={styles.mealEmoji}>{config.emoji}</Text>
                    </View>
                    <View style={styles.mealTextContainer}>
                      <Text
                        style={[styles.mealName, { color: theme.textPrimary }]}
                        numberOfLines={2}
                      >
                        {meal}
                      </Text>
                    </View>
                    <View style={styles.mealCheckContainer}>
                      {isSelected && (
                        <View style={[styles.mealCheck, { backgroundColor: config.color }]}>
                          <CheckCircle2 size={20} color="#fff" />
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={[styles.bottomBar, { backgroundColor: theme.cardBackground, borderTopColor: theme.border }]}>
          <View style={styles.bottomBarContent}>
            <View style={styles.selectedCountContainer}>
              <Text style={[styles.selectedCountText, { color: theme.textSecondary }]}>
                {selectedCount} meal{selectedCount !== 1 ? 's' : ''} selected
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.addButton,
                {
                  backgroundColor: selectedCount > 0 ? accentColor : theme.border,
                  opacity: selectedCount > 0 ? 1 : 0.5,
                },
              ]}
              onPress={handleAddSelectedMeals}
              disabled={selectedCount === 0 || addingMeals}
              activeOpacity={0.8}
            >
              {addingMeals ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <CheckCircle2 size={20} color="#fff" />
                  <Text style={styles.addButtonText}>Add to Log</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: any, accentColor: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingTop: 60,
      paddingBottom: 24,
      paddingHorizontal: 20,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 12,
    },
    headerIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTextContainer: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 28,
      fontFamily: 'Bold',
      fontWeight: '700',
      marginBottom: 4,
      letterSpacing: -0.5,
    },
    headerSubtitle: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
    },
    closeButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: addOpacityToHex(theme.textSecondary, 0.1),
    },
    planInfoCard: {
      marginHorizontal: 20,
      marginTop: 20,
      marginBottom: 16,
      padding: 20,
      borderRadius: 20,
      backgroundColor: theme.cardBackground,
      borderWidth: 2,
      borderColor: accentColor,
      shadowColor: accentColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    },
    planInfoHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    planBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      gap: 6,
    },
    planBadgeText: {
      fontSize: 12,
      fontFamily: 'Bold',
      fontWeight: '700',
      textTransform: 'capitalize',
    },
    planStats: {
      flexDirection: 'row',
      gap: 12,
    },
    planStat: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    planStatText: {
      fontSize: 12,
      fontWeight: '600',
    },
    planDescription: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 16,
      fontWeight: '400',
    },
    benefitsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    benefitTag: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      gap: 4,
    },
    benefitText: {
      fontSize: 11,
      fontWeight: '600',
    },
    mealTypeScroll: {
      maxHeight: 80,
    },
    mealTypeContent: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      gap: 12,
    },
    mealTypeChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 16,
      borderWidth: 2,
      gap: 8,
      minWidth: 120,
    },
    mealTypeEmoji: {
      fontSize: 20,
    },
    mealTypeText: {
      fontSize: 14,
      fontFamily: 'SemiBold',
      fontWeight: '600',
    },
    mealsList: {
      flex: 1,
    },
    mealsContent: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 100,
    },
    mealCard: {
      borderRadius: 18,
      marginBottom: 12,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    mealCardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      gap: 16,
    },
    mealIcon: {
      width: 56,
      height: 56,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    mealEmoji: {
      fontSize: 28,
    },
    mealTextContainer: {
      flex: 1,
    },
    mealName: {
      fontSize: 16,
      fontFamily: 'SemiBold',
      fontWeight: '600',
      lineHeight: 22,
    },
    mealCheckContainer: {
      width: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    mealCheck: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      borderTopWidth: 2,
      paddingTop: 16,
      paddingBottom: 20,
      paddingHorizontal: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
    },
    bottomBarContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    selectedCountContainer: {
      flex: 1,
    },
    selectedCountText: {
      fontSize: 14,
      fontWeight: '600',
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 16,
      gap: 8,
      minWidth: 140,
      shadowColor: accentColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    addButtonText: {
      color: '#fff',
      fontSize: 16,
      fontFamily: 'Bold',
      fontWeight: '700',
    },
  });
