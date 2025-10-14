import { Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
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
    fontSize: width * 0.07, // Responsive font size (7% of screen width)
    color: '#1f2937',
    marginBottom: 4,
    fontFamily: 'Bold',
  },
  
  subtitle: {
    fontSize: width * 0.035, // Responsive (3.5% of screen width)
    fontWeight: '500',
    color: '#6b7280',
    lineHeight: width * 0.05,
  },
  
  imageContainer: {
    width: width * 0.35, // 35% of screen width
    height: height * 0.13, // 13% of screen height
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  headerImage: {
    width: '100%',
    height: '100%',
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
//   title: {
//     fontSize: 28,
//     color: '#1f2937',
//     marginBottom: 4,
//     fontFamily: 'Bold',
//   },
//   subtitle: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#6b7280',
//   },
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
    fontFamily: 'Bold',
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
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
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
