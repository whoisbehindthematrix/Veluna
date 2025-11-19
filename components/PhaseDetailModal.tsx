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
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { X, ChevronDown } from 'lucide-react-native';

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
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

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
      <View style={styles.modalOverlay}>
        <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
        
        {/* Backdrop */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </Pressable>

        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalContainer,
            modalStyle,
          ]}
        >
          {/* Header with Gradient Effect */}
          <View style={[styles.headerSection, { backgroundColor: phaseColor }]}>
            <View style={styles.handleBar}>
              <View style={styles.handle} />
            </View>

            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <View style={styles.emojiCircle}>
                  <Text style={styles.phaseEmoji}>{phaseData.foods.icon}</Text>
                </View>
                <View>
                  <Text style={styles.phaseSubtitle}>Your Phase</Text>
                  <Text style={styles.phaseTitle}>{phaseData.name}</Text>
                </View>
              </View>
              
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <X size={22} color="#fff" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentContainer}
            bounces={true}
          >
            {/* Description Section */}
            {phaseData.description && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionDot, { backgroundColor: phaseColor }]} />
                  <Text style={styles.sectionTitle}>About This Phase</Text>
                </View>
                <View style={[styles.descriptionCard, { borderLeftColor: phaseColor }]}>
                  <Text style={styles.description}>{phaseData.description}</Text>
                </View>
              </View>
            )}

            {/* Foods Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionDot, { backgroundColor: phaseColor }]} />
                <Text style={styles.sectionTitle}>
                  {phaseData.foods.icon} {phaseData.foods.title}
                </Text>
              </View>
              <View style={[styles.card, { backgroundColor: phaseColor + '15' }]}>
                {phaseData.foods.items.map((item: string, index: number) => (
                  <View key={index} style={styles.listItem}>
                    <View style={[styles.bullet, { backgroundColor: phaseColor }]} />
                    <Text style={styles.listItemText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Exercises Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionDot, { backgroundColor: phaseColor }]} />
                <Text style={styles.sectionTitle}>
                  {phaseData.exercises.icon} {phaseData.exercises.title}
                </Text>
              </View>
              <View style={[styles.card, { backgroundColor: phaseColor + '15' }]}>
                {phaseData.exercises.items.map((item: string, index: number) => (
                  <View key={index} style={styles.listItem}>
                    <View style={[styles.bullet, { backgroundColor: phaseColor }]} />
                    <Text style={styles.listItemText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Tips Section */}
            <View style={[styles.section, { marginBottom: 40 }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionDot, { backgroundColor: phaseColor }]} />
                <Text style={styles.sectionTitle}>💡 Phase Tips & Insights</Text>
              </View>
              <View style={[styles.tipsCard]}>
                {phaseData.tips.map((tip: string, index: number) => (
                  <View 
                    key={index} 
                    style={[
                      styles.tipItem,
                      { backgroundColor: phaseColor + '08' }
                    ]}
                  >
                    <View style={[styles.tipNumber, { backgroundColor: phaseColor }]}>
                      <Text style={styles.tipNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Close Hint */}
          <View style={styles.closeHint}>
            <ChevronDown size={16} color="#9ca3af" />
            <Text style={styles.closeHintText}>Swipe or tap backdrop to close</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
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
    backgroundColor: '#fafafa',
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
    color: '#1f2937',
  },
  descriptionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  description: {
    fontSize: 15,
    color: '#4b5563',
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
    color: '#374151',
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
    backgroundColor: '#fff',
    // shadowColor: 'rgba(0,0,0,0.1)',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.05,
    // shadowRadius: 3,
    // elevation: 1,
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
    color: '#374151',
    lineHeight: 21,
    fontFamily: 'Regular',
  },
  closeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  closeHintText: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: 'Regular',
  },
});

export default PhaseDetailModal;
