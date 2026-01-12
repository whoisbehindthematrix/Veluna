import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, X, Check, Utensils } from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import type { FoodItem } from '@/data/foodData';
import NeuButton from '../core-components/NeuButton';
import { darkenColor } from '@/src/utils';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface AddFoodModalProps {
  visible: boolean;
  onClose: () => void;
  foods: FoodItem[];
  mealType: MealType;
  onMealTypeChange: (type: MealType) => void;
  loadingGlobal?: boolean;
  onConfirmAdd: (args: { food: FoodItem; quantity: number; mealType: MealType }) => void;
}

export function AddFoodModal({
  visible,
  onClose,
  foods,
  mealType,
  onMealTypeChange,
  loadingGlobal = false,
  onConfirmAdd,
}: AddFoodModalProps) {
  const { theme, accentColor } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState('1');

  const filteredFoods = useMemo(
    () =>
      foods.filter((food) =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [foods, searchQuery],
  );

  const handleClose = () => {
    setSearchQuery('');
    setSelectedFood(null);
    setQuantity('1');
    onClose();
  };

  const handleConfirm = () => {
    if (!selectedFood) return;
    const multiplier = parseFloat(quantity) || 1;
    onConfirmAdd({ food: selectedFood, quantity: multiplier, mealType });
    setSelectedFood(null);
    setQuantity('1');
    setSearchQuery('');
  };

  const mealTypes = [
    { key: 'breakfast', name: 'Breakfast', icon: '🌅', color: '#fbbf24' },
    { key: 'lunch', name: 'Lunch', icon: '☀️', color: '#f97316' },
    { key: 'dinner', name: 'Dinner', icon: '🌙', color: '#8b5cf6' },
    { key: 'snack', name: 'Snacks', icon: '🍎', color: '#10b981' },
  ] as const;

  const styles = useMemo(() => createStyles(theme, accentColor), [theme, accentColor]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
      presentationStyle="fullScreen"
    >
      <View style={[styles.fullscreenModal, { backgroundColor: theme.background }]}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={theme.headerGradient as [string, string]}
          style={styles.modalHeaderGradient}
        >
          <View style={styles.modalHeaderContent}>
            <View style={styles.modalHeaderLeft}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                Add Food
              </Text>
              <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                Select a meal and quantity
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
              onPress={handleClose}
            >
              <X size={22} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Search Bar */}
        <View style={styles.modalSearchWrapper}>
          <View style={[styles.modalSearchContainer, { backgroundColor: theme.cardBackground }]}>
            <Search size={20} color={accentColor} />
            <TextInput
              style={[styles.modalSearchInput, { color: theme.textPrimary }]}
              placeholder="Search foods..."
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Meal Type Selection - Chips */}
        <View style={styles.modalMealTypeWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.modalMealTypeScroll}
          >
            {mealTypes.map((meal) => (
              <TouchableOpacity
                key={meal.key}
                style={[
                  styles.modalMealTypeChip,
                  {
                    backgroundColor:
                      mealType === meal.key ? meal.color : theme.cardBackground,
                    borderColor:
                      mealType === meal.key ? meal.color : theme.border,
                  },
                ]}
                onPress={() => onMealTypeChange(meal.key)}
              >
                <Text style={styles.modalMealTypeEmoji}>{meal.icon}</Text>
                <Text
                  style={[
                    styles.modalMealTypeText,
                    {
                      color: mealType === meal.key ? '#fff' : theme.textPrimary,
                      fontWeight: mealType === meal.key ? '700' : '500',
                    },
                  ]}
                >
                  {meal.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Food List */}
        <ScrollView
          style={styles.modalFoodList}
          contentContainerStyle={styles.modalFoodListContent}
          showsVerticalScrollIndicator={false}
        >
          {loadingGlobal && foods.length === 0 ? (
            <View style={styles.modalEmptyState}>
              <ActivityIndicator size="small" color={accentColor} />
              <Text
                style={[styles.modalEmptySubtext, { color: theme.textSecondary, marginTop: 8 }]}
              >
                Loading foods...
              </Text>
            </View>
          ) : filteredFoods.length === 0 ? (
            <View style={styles.modalEmptyState}>
              <Text style={[styles.modalEmptyText, { color: theme.textSecondary }]}>
                No foods found
              </Text>
              <Text style={[styles.modalEmptySubtext, { color: theme.textSecondary }]}>
                Try searching for something else
              </Text>
            </View>
          ) : (
            filteredFoods.map((food, index) => (
              <TouchableOpacity
                key={`${food.name}-${index}`}
                style={[
                  styles.modalFoodCard,
                  {
                    backgroundColor: theme.cardBackground,
                    borderColor:
                      selectedFood?.name === food.name ? accentColor : theme.border,
                    borderWidth: selectedFood?.name === food.name ? 2 : 1,
                  },
                ]}
                onPress={() => setSelectedFood(food)}
                activeOpacity={0.7}
              >
                <View style={styles.modalFoodCardContent}>
                  <View style={styles.modalFoodCardLeft}>
                    <Text style={[styles.modalFoodName, { color: theme.textPrimary }]}>
                      {food.name}
                    </Text>
                    <View style={styles.modalFoodMacros}>
                      <View
                        style={[
                          styles.modalMacroBadge,
                          { backgroundColor: `${accentColor}15` },
                        ]}
                      >
                        <Text style={[styles.modalMacroText, { color: accentColor }]}>
                          {food.calories} cal
                        </Text>
                      </View>
                      <Text
                        style={[styles.modalMacroDetail, { color: theme.textSecondary }]}
                      >
                        P {food.protein}g • C {food.carbs}g • F {food.fat}g
                      </Text>
                    </View>
                  </View>

                  {/* Right-side thumbnail for global foods */}
                  {food.imageUrl && (
                    <Image
                      source={{ uri: food.imageUrl }}
                      style={styles.modalFoodImage}
                      resizeMode="cover"
                    />
                  )}

                  {selectedFood?.name === food.name && (
                    <View
                      style={[
                        styles.modalSelectedIndicator,
                        { backgroundColor: accentColor },
                      ]}
                    >
                      <Check size={18} color="#fff" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Bottom Action Bar - Sticky */}
        {selectedFood && (
          <View
            style={[
              styles.modalBottomBar,
              { backgroundColor: theme.cardBackground, borderTopColor: theme.border },
            ]}
          >
            <View style={styles.modalBottomContent}>
              <View style={styles.modalQuantitySection}>
                <Text
                  style={[styles.modalQuantityLabel, { color: theme.textSecondary }]}
                >
                  Quantity
                </Text>
                <View
                  style={[
                    styles.modalQuantityInputWrapper,
                    { borderColor: theme.border },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.modalQuantityButton,
                      { backgroundColor: `${accentColor}15` },
                    ]}
                    onPress={() => {
                      const current = parseFloat(quantity) || 1;
                      if (current > 0.5) setQuantity((current - 0.5).toString());
                    }}
                  >
                    <Text
                      style={[
                        styles.modalQuantityButtonText,
                        { color: accentColor },
                      ]}
                    >
                      −
                    </Text>
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.modalQuantityInput, { color: theme.textPrimary }]}
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="decimal-pad"
                    placeholder="1"
                    placeholderTextColor={theme.textSecondary}
                    textAlign="center"
                  />
                  <TouchableOpacity
                    style={[
                      styles.modalQuantityButton,
                      { backgroundColor: `${accentColor}15` },
                    ]}
                    onPress={() => {
                      const current = parseFloat(quantity) || 1;
                      setQuantity((current + 0.5).toString());
                    }}
                  >
                    <Text
                      style={[
                        styles.modalQuantityButtonText,
                        { color: accentColor },
                      ]}
                    >
                      +
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>


              <View style={{alignItems: 'center', justifyContent: 'center'}}>
              <NeuButton
                title="Add Log"
                onPress={handleConfirm}
                style={{width: 180, alignSelf: 'center', paddingVertical: -8, }}
                backgroundColor={accentColor}
                textStyle={{fontFamily: 'Bold', fontSize: 16}}
                shadowColor={darkenColor(accentColor, 10)}
                leftIcon={<Utensils size={20} color="#fff" strokeWidth={3} />}
              />
              </View>
              {/* <TouchableOpacity
                style={[styles.modalAddButton, { backgroundColor: accentColor }]}
                onPress={handleConfirm}
                activeOpacity={0.8}
              >
                <Text style={styles.modalAddButtonText}>Add to Log</Text>
              </TouchableOpacity> */}
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

// Local styles (copied & trimmed from original FoodScreen for separation)
const createStyles = (theme: any, accentColor: string) =>
  StyleSheet.create({
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
    modalFoodImage: {
      width: 64,
      height: 64,
      borderRadius: 12,
      marginLeft: 12,
      backgroundColor: '#e5e7eb',
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
  });


