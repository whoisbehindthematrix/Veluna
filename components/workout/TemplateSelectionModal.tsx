import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { X, Clock, Dumbbell, Plus, Target } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import NeuButton from '@/components/core-components/NeuButton';
import { darkenColor } from '@/src/utils';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TemplateSelectionModalProps {
  visible: boolean;
  styles: any;
  theme: any;
  accentColor: string;
  templates: any[];
  loading: boolean;
  onSelect: (template: any) => void;
  onClose: () => void;
  onCreateTemplate?: () => void;
}

export default function TemplateSelectionModal({
  visible,
  styles,
  theme,
  accentColor,
  templates,
  loading,
  onSelect,
  onClose,
  onCreateTemplate,
}: TemplateSelectionModalProps) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={modalStyles.container}>
        {/* Backdrop */}
        <Animated.View
          style={[
            modalStyles.backdrop,
            {
              opacity: backdropOpacity,
            },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            modalStyles.bottomSheet,
            {
              backgroundColor: theme.background,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Handle Bar */}
          <View style={modalStyles.handleContainer}>
            <View style={[modalStyles.handleBar, { backgroundColor: theme.border }]} />
          </View>

          {/* Header */}
          <View style={[modalStyles.header, { borderBottomColor: theme.border }]}>
            <View style={modalStyles.headerContent}>
              <View style={modalStyles.headerIconContainer}>
                <LinearGradient
                  colors={[accentColor, darkenColor(accentColor, 10)]}
                  style={modalStyles.headerIconGradient}
                >
                  <Target size={24} color="#fff" />
                </LinearGradient>
              </View>
              <View style={modalStyles.headerTextContainer}>
                <Text style={[modalStyles.headerTitle, { color: theme.textPrimary }]}>
                  Choose Workout Template
                </Text>
                <Text style={[modalStyles.headerSubtitle, { color: theme.textSecondary }]}>
                  Select a template to start your workout
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              style={[modalStyles.closeButton, { backgroundColor: `${accentColor}15` }]}
            >
              <X size={20} color={accentColor} />
            </TouchableOpacity>
          </View>

          {/* Create Template Button */}
          {onCreateTemplate && (
            <View style={modalStyles.createButtonContainer}>
              <NeuButton
                title="Create New Template"
                onPress={() => {
                  handleClose();
                  setTimeout(() => onCreateTemplate(), 300);
                }}
                backgroundColor={accentColor}
                shadowColor={darkenColor(accentColor, 10)}
                leftIcon={<Plus size={18} color="#fff" />}
                style={modalStyles.createButton}
              />
            </View>
          )}

          {/* Content */}
          <ScrollView
            style={modalStyles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={modalStyles.contentContainer}
          >
            {loading ? (
              <View style={modalStyles.loadingContainer}>
                <ActivityIndicator size="large" color={accentColor} />
                <Text style={[modalStyles.loadingText, { color: theme.textSecondary }]}>
                  Loading templates...
                </Text>
              </View>
            ) : !templates || templates.length === 0 ? (
              <View style={modalStyles.emptyContainer}>
                <View style={[modalStyles.emptyIconContainer, { backgroundColor: `${accentColor}20` }]}>
                  <Target size={48} color={accentColor} />
                </View>
                <Text style={[modalStyles.emptyTitle, { color: theme.textPrimary }]}>
                  No templates available
                </Text>
                <Text style={[modalStyles.emptySubtitle, { color: theme.textSecondary }]}>
                  Create your first workout template to get started
                </Text>
                {onCreateTemplate && (
                  <TouchableOpacity
                    style={[modalStyles.emptyButton, { backgroundColor: accentColor }]}
                    onPress={() => {
                      handleClose();
                      setTimeout(() => onCreateTemplate(), 300);
                    }}
                  >
                    <Plus size={20} color="#fff" />
                    <Text style={modalStyles.emptyButtonText}>Create Template</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={modalStyles.templatesList}>
                {templates.map((template: any) => (
                  <TouchableOpacity
                    key={template.id}
                    style={[
                      modalStyles.templateCard,
                      {
                        backgroundColor: theme.cardBackground,
                        borderColor: accentColor,
                        shadowColor: accentColor,
                      },
                    ]}
                    onPress={() => {
                      handleClose();
                      setTimeout(() => onSelect(template), 250);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={modalStyles.templateCardContent}>
                      {/* Template Icon */}
                      <View style={[modalStyles.templateIconContainer, { backgroundColor: `${accentColor}20` }]}>
                        <Target size={24} color={accentColor} />
                      </View>

                      {/* Template Info */}
                      <View style={modalStyles.templateInfo}>
                        <View style={modalStyles.templateHeader}>
                          <Text style={[modalStyles.templateName, { color: theme.textPrimary }]} numberOfLines={1}>
                            {template.name}
                          </Text>
                          {template.isSystemTemplate && (
                            <View style={[modalStyles.systemBadge, { backgroundColor: accentColor }]}>
                              <Text style={modalStyles.systemBadgeText}>System</Text>
                            </View>
                          )}
                        </View>
                        {template.description && (
                          <Text
                            style={[modalStyles.templateDescription, { color: theme.textSecondary }]}
                            numberOfLines={2}
                          >
                            {template.description}
                          </Text>
                        )}

                        {/* Template Stats */}
                        <View style={modalStyles.templateStats}>
                          <View style={modalStyles.templateStatItem}>
                            <Clock size={14} color={theme.textSecondary} />
                            <Text style={[modalStyles.templateStatText, { color: theme.textSecondary }]}>
                              {template.estimatedDurationMinutes || 0} min
                            </Text>
                          </View>
                          <View style={modalStyles.templateStatItem}>
                            <Dumbbell size={14} color={theme.textSecondary} />
                            <Text style={[modalStyles.templateStatText, { color: theme.textSecondary }]}>
                              {template.exercises?.length || 0} exercises
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Arrow */}
                      <View style={[modalStyles.arrowContainer, { backgroundColor: `${accentColor}15` }]}>
                        <View style={[modalStyles.arrow, { borderLeftColor: accentColor }]} />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.9,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 3,
    borderColor: '#000',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  headerIconContainer: {
    marginRight: 12,
  },
  headerIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  createButton: {
    marginBottom: 0,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  templatesList: {
    gap: 16,
  },
  templateCard: {
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  templateCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  templateIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateInfo: {
    flex: 1,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  templateName: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  systemBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  systemBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  templateDescription: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  templateStats: {
    flexDirection: 'row',
    gap: 16,
  },
  templateStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  templateStatText: {
    fontSize: 12,
    fontWeight: '500',
  },
  arrowContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
});
