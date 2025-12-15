import React, { useEffect } from 'react';
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
  runOnJS,
} from 'react-native-reanimated';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { X, ChevronDown } from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { phaseRecommendations } from '@/data/phaseRecommendation';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LegendModalProps {
  visible: boolean;
  onClose: () => void;
}

// Helper function to get phase descriptions
const getPhaseDescription = (phaseKey: string): string => {
  const descriptions: Record<string, string> = {
    menstrual: 'Days 1-5: Your period. Focus on rest and gentle activities.',
    follicular: 'Days 6-13: Building energy. Great time for new projects and workouts.',
    ovulatory: 'Days 14-16: Peak energy and fertility. Best time for intense activities.',
    luteal: 'Days 17-28: Pre-menstrual phase. May experience PMS symptoms.'
  };
  return descriptions[phaseKey] || 'Cycle phase with specific characteristics.';
};

const LegendModal: React.FC<LegendModalProps> = ({ visible, onClose }) => {
  const { theme, accentColor, themeName } = useTheme();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const dragStartY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  
  const MODAL_HEIGHT = SCREEN_HEIGHT * 0.7;
  const DISMISS_THRESHOLD = SCREEN_HEIGHT * 0.2;

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
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
    }
  }, [visible]);

  const panGesture = Gesture.Pan()
    .activeOffsetY(10)
    .failOffsetX([-20, 20])
    .onStart(() => {
      dragStartY.value = translateY.value;
      isDragging.value = true;
    })
    .onUpdate((event) => {
      if (isDragging.value && event.translationY > 0) {
        translateY.value = dragStartY.value + event.translationY;
        const progress = Math.min(event.translationY / MODAL_HEIGHT, 1);
        backdropOpacity.value = 1 - progress * 0.5;
      }
    })
    .onEnd((event) => {
      if (!isDragging.value) return;
      isDragging.value = false;
      
      if (event.translationY > DISMISS_THRESHOLD || event.velocityY > 1000) {
        translateY.value = withSpring(MODAL_HEIGHT, {
          damping: 30,
          stiffness: 100,
        });
        backdropOpacity.value = withTiming(0, { duration: 200 }, () => {
          runOnJS(closeModal)();
        });
      } else {
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

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

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
        <View style={styles.modalOverlay}>
          <StatusBar 
            backgroundColor={themeName === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)'} 
            barStyle="light-content"
          />
          
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
            <Animated.View 
              style={[
                StyleSheet.absoluteFillObject,
                { backgroundColor: themeName === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.6)' },
                backdropStyle
              ]} 
            />
          </Pressable>

          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={[
                styles.modalContainer,
                { 
                  backgroundColor: theme.cardBackground, 
                  shadowColor: accentColor,
                  height: MODAL_HEIGHT,
                },
                modalStyle,
              ]}
            >
              {/* Header */}
              <View style={[styles.modalHeader, { backgroundColor: accentColor }]}>
                <View style={styles.handleBar}>
                  <View style={styles.handle} />
                </View>
                <View style={styles.headerContent}>
                  <View style={styles.headerTop}>
                    <Text style={styles.modalTitle}>Calendar Guide</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                      <X size={22} color="#fff" strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.headerSubtitle}>Understanding colors and indicators</Text>
                </View>
              </View>

              {/* Content */}
              <ScrollView 
                style={[styles.modalContent, { backgroundColor: theme.background }]}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalContentContainer}
              >
                {/* Introduction */}
                <View style={[styles.introSection, { backgroundColor: theme.cardBackground, borderLeftColor: accentColor }]}>
                  <Text style={[styles.introText, { color: theme.textSecondary }]}>
                    Use this guide to understand what each color and indicator means on your cycle calendar.
                  </Text>
                </View>

                {/* Indicators Section */}
                <View style={styles.legendSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.legendTitle, { color: theme.textPrimary }]}>Indicators</Text>
                    <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
                      Visual markers that appear on specific dates
                    </Text>
                  </View>
                  <View style={styles.legendItems}>
                    <View style={[styles.legendItem, { backgroundColor: theme.cardBackground }]}>
                      <View style={[styles.legendColor, { backgroundColor: '#ec4899' }]} />
                      <View style={styles.legendContent}>
                        <Text style={[styles.legendText, { color: theme.textPrimary }]}>Period</Text>
                        <Text style={[styles.legendDescription, { color: theme.textSecondary }]}>
                          Days when you're menstruating. Tap a date to log your period.
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.legendItem, { backgroundColor: theme.cardBackground }]}>
                      <View style={[styles.legendColor, { backgroundColor: '#8b5cf6' }]} />
                      <View style={styles.legendContent}>
                        <Text style={[styles.legendText, { color: theme.textPrimary }]}>Symptoms logged</Text>
                        <Text style={[styles.legendDescription, { color: theme.textSecondary }]}>
                          Dates where you've tracked symptoms like cramps, mood, or energy levels.
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.legendItem, { backgroundColor: theme.cardBackground }]}>
                      <View style={[styles.legendColor, { backgroundColor: '#10b981' }]} />
                      <View style={styles.legendContent}>
                        <Text style={[styles.legendText, { color: theme.textPrimary }]}>Quick notes</Text>
                        <Text style={[styles.legendDescription, { color: theme.textSecondary }]}>
                          Days with personal notes or reminders you've added.
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.legendItem, { backgroundColor: theme.cardBackground }]}>
                      <View style={[styles.legendColor, { backgroundColor: '#f59e0b', borderRadius: 2 }]} />
                      <View style={styles.legendContent}>
                        <Text style={[styles.legendText, { color: theme.textPrimary }]}>Today</Text>
                        <Text style={[styles.legendDescription, { color: theme.textSecondary }]}>
                          The current date is highlighted with a special border.
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Phase Colors Section */}
                <View style={styles.legendSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.legendTitle, { color: theme.textPrimary }]}>Cycle Phase Colors</Text>
                    <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
                      Background colors represent your cycle phases throughout the month
                    </Text>
                  </View>
                  <View style={styles.legendItems}>
                    {Object.entries(phaseRecommendations).map(([key, phase]) => (
                      <View key={key} style={[styles.legendItem, { backgroundColor: theme.cardBackground }]}>
                        <View
                          style={[
                            styles.legendColor,
                            {
                              backgroundColor: phase.color + '20',
                              borderWidth: 2,
                              borderColor: phase.color,
                            },
                          ]}
                        />
                        <View style={styles.legendContent}>
                          <Text style={[styles.legendText, { color: theme.textPrimary }]}>{phase.name}</Text>
                          <Text style={[styles.legendDescription, { color: theme.textSecondary }]}>
                            {getPhaseDescription(key)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

                {/* How to Use Section */}
                <View style={[styles.tipsSection, { backgroundColor: theme.cardBackground, borderLeftColor: accentColor }]}>
                  <Text style={[styles.tipsTitle, { color: theme.textPrimary }]}>💡 How to Use</Text>
                  <View style={styles.tipsList}>
                    <Text style={[styles.tipItem, { color: theme.textSecondary }]}>
                      • Tap any date to log your period, symptoms, or add notes
                    </Text>
                    <Text style={[styles.tipItem, { color: theme.textSecondary }]}>
                      • The calendar automatically colors dates based on your cycle phase
                    </Text>
                    <Text style={[styles.tipItem, { color: theme.textSecondary }]}>
                      • Multiple indicators can appear on the same date
                    </Text>
                    <Text style={[styles.tipItem, { color: theme.textSecondary }]}>
                      • Selected dates use your accent color for easy identification
                    </Text>
                  </View>
                </View>
              </ScrollView>

              {/* Close Hint */}
              <View style={[
                styles.closeHint,
                { 
                  backgroundColor: theme.cardBackground,
                  borderTopColor: theme.border,
                }
              ]}>
                <ChevronDown size={16} color={theme.textSecondary} />
                <Text style={[styles.closeHintText, { color: theme.textSecondary }]}>Drag down or tap backdrop to close</Text>
              </View>
            </Animated.View>
          </GestureDetector>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  modalHeader: {
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
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Bold',
    color: '#fff',
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: 'Regular',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: 20,
  },
  introSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
  },
  introText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Regular',
  },
  legendSection: {
    marginBottom: 28,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  legendTitle: {
    fontSize: 20,
    fontFamily: 'Bold',
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 13,
    fontFamily: 'Regular',
    lineHeight: 18,
  },
  legendItems: {
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    padding: 14,
    borderRadius: 12,
  },
  legendColor: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginTop: 2,
    flexShrink: 0,
  },
  legendContent: {
    flex: 1,
    gap: 4,
  },
  legendText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Bold',
    marginBottom: 2,
  },
  legendDescription: {
    fontSize: 13,
    fontFamily: 'Regular',
    lineHeight: 18,
  },
  tipsSection: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  tipsTitle: {
    fontSize: 16,
    fontFamily: 'Bold',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 13,
    fontFamily: 'Regular',
    lineHeight: 20,
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

export default LegendModal;

