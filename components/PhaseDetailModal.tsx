import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Dimensions,
  StatusBar,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS,
  useAnimatedReaction,
} from 'react-native-reanimated';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { X, ChevronDown } from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface PhaseDetailModalProps {
  visible: boolean;
  onClose: () => void;
  phaseData: any;
  phaseColor: string;
}

const PhaseDetailModal: React.FC<PhaseDetailModalProps> = ({
  visible,
  onClose,
  phaseData,
  phaseColor,
}) => {
  const { theme, accentColor, themeName } = useTheme();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const dragStartY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const scrollOffset = useSharedValue(0);
  
  const dynamicStyles = useMemo(() => createStyles(theme, accentColor), [theme, accentColor]);

  const DISMISS_THRESHOLD = SCREEN_HEIGHT * 0.3; // Dismiss if dragged more than 30% of screen height
  const MODAL_HEIGHT = SCREEN_HEIGHT * 0.88;

  const closeModal = () => {
    onClose();
  };

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, {
        damping: 25,
        stiffness: 120,
        mass: 0.8,
      });
      scrollOffset.value = 0;
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
    }
  }, [visible]);

  // Pan gesture for dragging - only works when dragging down from top
  const panGesture = Gesture.Pan()
    .activeOffsetY(10) // Require 10px downward movement before activating
    .failOffsetX([-20, 20]) // Only activate for mostly vertical drags
    .onStart(() => {
      // Only allow drag if scroll is at top or gesture started near top
      if (scrollOffset.value <= 5) {
        dragStartY.value = translateY.value;
        isDragging.value = true;
      }
    })
    .onUpdate((event) => {
      // Only allow dragging down if gesture was activated
      if (isDragging.value && event.translationY > 0) {
        translateY.value = dragStartY.value + event.translationY;
        
        // Update backdrop opacity based on drag
        const progress = Math.min(event.translationY / MODAL_HEIGHT, 1);
        backdropOpacity.value = 1 - progress * 0.5;
      }
    })
    .onEnd((event) => {
      if (!isDragging.value) return;
      
      isDragging.value = false;
      
      // Determine if we should dismiss or snap back
      if (event.translationY > DISMISS_THRESHOLD || event.velocityY > 1000) {
        // Dismiss modal
        translateY.value = withSpring(MODAL_HEIGHT, {
          damping: 30,
          stiffness: 100,
        });
        backdropOpacity.value = withTiming(0, { duration: 200 }, () => {
          runOnJS(closeModal)();
        });
      } else {
        // Snap back to top
        translateY.value = withSpring(0, {
          damping: 25,
          stiffness: 120,
        });
        backdropOpacity.value = withTiming(1, { duration: 300 });
      }
    });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      translateY.value,
      [0, SCREEN_HEIGHT],
      [1, 0.9],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY: translateY.value }, { scale }],
    };
  });

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
      animationType="none"
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={dynamicStyles.modalOverlay}>
          <StatusBar 
            backgroundColor={themeName === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)'} 
            barStyle="light-content"
          />
          
          {/* Backdrop */}
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
            <Animated.View 
              style={[
                dynamicStyles.backdrop, 
                { backgroundColor: themeName === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.6)' },
                backdropStyle
              ]} 
            />
          </Pressable>

          {/* Modal Content */}
          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={[
                dynamicStyles.modalContainer,
                { backgroundColor: theme.cardBackground, shadowColor: accentColor },
                modalStyle,
              ]}
            >
              {/* Header with Gradient Effect - Draggable Handle */}
              <View style={[dynamicStyles.headerSection, { backgroundColor: phaseColor }]}>
                <View style={dynamicStyles.handleBar}>
                  <View style={dynamicStyles.handle} />
                </View>

            <View style={dynamicStyles.headerContent}>
              <View style={dynamicStyles.headerLeft}>
                <View style={dynamicStyles.emojiCircle}>
                  <Text style={dynamicStyles.phaseEmoji}>{phaseData.foods.icon}</Text>
                </View>
                <View>
                  <Text style={dynamicStyles.phaseSubtitle}>Your Phase</Text>
                  <Text style={dynamicStyles.phaseTitle}>{phaseData.name}</Text>
                </View>
              </View>
              
              <TouchableOpacity
                onPress={onClose}
                style={dynamicStyles.closeButton}
                activeOpacity={0.7}
              >
                <X size={22} color="#fff" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>

              {/* Scrollable Content */}
              <Animated.ScrollView
                style={[dynamicStyles.scrollContent, { backgroundColor: theme.background }]}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={dynamicStyles.scrollContentContainer}
                bounces={true}
                scrollEventThrottle={16}
                onScroll={(event) => {
                  scrollOffset.value = event.nativeEvent.contentOffset.y;
                }}
              >
            {/* Description Section */}
            {phaseData.description && (
              <View style={dynamicStyles.section}>
                <View style={dynamicStyles.sectionHeader}>
                  <View style={[dynamicStyles.sectionDot, { backgroundColor: phaseColor }]} />
                  <Text style={[dynamicStyles.sectionTitle, { color: theme.textPrimary }]}>About This Phase</Text>
                </View>
                <View style={[
                  dynamicStyles.descriptionCard, 
                  { 
                    borderLeftColor: phaseColor,
                    backgroundColor: theme.cardBackground,
                    shadowColor: accentColor,
                  }
                ]}>
                  <Text style={[dynamicStyles.description, { color: theme.textSecondary }]}>{phaseData.description}</Text>
                </View>
              </View>
            )}

            {/* Foods Section */}
            <View style={dynamicStyles.section}>
              <View style={dynamicStyles.sectionHeader}>
                <View style={[dynamicStyles.sectionDot, { backgroundColor: phaseColor }]} />
                <Text style={[dynamicStyles.sectionTitle, { color: theme.textPrimary }]}>
                  {phaseData.foods.icon} {phaseData.foods.title}
                </Text>
              </View>
              <View style={[dynamicStyles.card, { backgroundColor: phaseColor + '15' }]}>
                {phaseData.foods.items.map((item: string, index: number) => (
                  <View key={index} style={dynamicStyles.listItem}>
                    <View style={[dynamicStyles.bullet, { backgroundColor: phaseColor }]} />
                    <Text style={[dynamicStyles.listItemText, { color: theme.textPrimary }]}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Exercises Section */}
            <View style={dynamicStyles.section}>
              <View style={dynamicStyles.sectionHeader}>
                <View style={[dynamicStyles.sectionDot, { backgroundColor: phaseColor }]} />
                <Text style={[dynamicStyles.sectionTitle, { color: theme.textPrimary }]}>
                  {phaseData.exercises.icon} {phaseData.exercises.title}
                </Text>
              </View>
              <View style={[dynamicStyles.card, { backgroundColor: phaseColor + '15' }]}>
                {phaseData.exercises.items.map((item: string, index: number) => (
                  <View key={index} style={dynamicStyles.listItem}>
                    <View style={[dynamicStyles.bullet, { backgroundColor: phaseColor }]} />
                    <Text style={[dynamicStyles.listItemText, { color: theme.textPrimary }]}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Tips Section */}
            <View style={[dynamicStyles.section, { marginBottom: 40 }]}>
              <View style={dynamicStyles.sectionHeader}>
                <View style={[dynamicStyles.sectionDot, { backgroundColor: phaseColor }]} />
                <Text style={[dynamicStyles.sectionTitle, { color: theme.textPrimary }]}>💡 Phase Tips & Insights</Text>
              </View>
              <View style={dynamicStyles.tipsCard}>
                {phaseData.tips.map((tip: string, index: number) => (
                  <View 
                    key={index} 
                    style={[
                      dynamicStyles.tipItem,
                      { 
                        backgroundColor: themeName === 'dark' 
                          ? phaseColor + '15' 
                          : phaseColor + '08',
                        borderColor: theme.border,
                      }
                    ]}
                  >
                    <View style={[dynamicStyles.tipNumber, { backgroundColor: phaseColor }]}>
                      <Text style={dynamicStyles.tipNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={[dynamicStyles.tipText, { color: theme.textPrimary }]}>{tip}</Text>
                  </View>
                ))}
              </View>
              </View>
              </Animated.ScrollView>

              {/* Close Hint */}
              <View style={[
                dynamicStyles.closeHint,
                { 
                  backgroundColor: theme.cardBackground,
                  borderTopColor: theme.border,
                }
              ]}>
                <ChevronDown size={16} color={theme.textSecondary} />
                <Text style={[dynamicStyles.closeHintText, { color: theme.textSecondary }]}>Drag down or tap backdrop to close</Text>
              </View>
            </Animated.View>
          </GestureDetector>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const createStyles = (theme: any, accentColor: string) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    height: SCREEN_HEIGHT * 0.88,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  headerSection: {
    paddingTop: 8,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  handleBar: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  emojiCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseEmoji: {
    fontSize: 28,
  },
  phaseSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginBottom: 2,
  },
  phaseTitle: {
    fontSize: 24,
    fontFamily: 'Bold',
    color: '#fff',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Bold',
  },
  descriptionCard: {
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    fontFamily: 'Regular',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 4,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  listItemText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Regular',
  },
  tipsCard: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  tipNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'Regular',
  },
  closeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  closeHintText: {
    fontSize: 12,
    fontFamily: 'Regular',
  },
});

export default PhaseDetailModal;
