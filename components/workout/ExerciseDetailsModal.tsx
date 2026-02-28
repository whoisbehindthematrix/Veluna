import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Modal,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  Dumbbell,
  Target,
  Activity,
  Clock,
  Flame,
  Award,
  Info,
  Play,
  ChevronRight,
} from 'lucide-react-native';
import { StyleSheet } from 'react-native';

import type { Exercise } from '@/src/store/slices/workoutSlice';


interface ExerciseDetailsModalProps {
  visible: boolean;
  exercise: Exercise | null;
  theme: any;
  accentColor: string;
  onClose: () => void;
}

const { width } = Dimensions.get('window');
const IMAGE_ASPECT_RATIO = 4 / 3;
const IMAGE_HEIGHT = Math.min(width, 360) / IMAGE_ASPECT_RATIO;
const HORIZONTAL_PADDING = 16;

export default function ExerciseDetailsModal({
  visible,
  exercise,
  theme,
  accentColor,
  onClose,
}: ExerciseDetailsModalProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setImageLoading(!!exercise?.imageUrl);
  }, [exercise?.id, exercise?.imageUrl]);

  if (!exercise) return null;

  const styles = createStyles(theme, accentColor, insets.top);

  const getDifficultyColor = (difficulty?: string | null) => {
    switch (difficulty) {
      case 'beginner':
        return '#10b981';
      case 'intermediate':
        return '#f59e0b';
      case 'advanced':
        return '#ef4444';
      default:
        return accentColor;
    }
  };

  const getDifficultyLabel = (difficulty?: string | null) => {
    if (!difficulty) return 'Not specified';
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Fixed Close Button - Always visible */}
        <View style={[styles.closeButtonWrapper, { paddingTop: insets.top || 12 }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.8}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <View style={styles.closeButtonBackdrop} />
            <View style={[styles.closeButtonInner, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <X size={20} color={theme.textPrimary} strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Hero Image Section */}
          <View style={styles.imageSection}>
            <View style={[styles.imageContainer, { borderColor: theme.border }]}>
              {exercise.imageUrl ? (
                <>
                  <Image
                    source={{ uri: exercise.imageUrl }}
                    style={styles.exerciseImage}
                    resizeMode="cover"
                    onLoadStart={() => setImageLoading(true)}
                    onLoadEnd={() => setImageLoading(false)}
                    onError={() => setImageLoading(false)}
                  />
                  {imageLoading && (
                    <View style={styles.imageLoadingOverlay}>
                      <ActivityIndicator size="large" color={accentColor} />
                    </View>
                  )}
                </>
              ) : (
                <View style={[styles.imagePlaceholder, { backgroundColor: `${accentColor}18` }]}>
                  <Dumbbell size={64} color={accentColor} strokeWidth={1.5} />
                </View>
              )}
              {exercise.videoUrl && (
                <View style={styles.videoBadge}>
                  <Play size={16} color="#fff" fill="#fff" strokeWidth={2.5} />
                </View>
              )}
              {exercise.category && (
                <View style={[styles.categoryBadge, { backgroundColor: accentColor }]}>
                  <Text style={styles.categoryBadgeText}>
                    {exercise.category.charAt(0).toUpperCase() + exercise.category.slice(1)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Exercise Title Section */}
          <View style={styles.titleSection}>
            <Text style={[styles.exerciseTitle, { color: theme.textPrimary }]}>{exercise.name}</Text>
            {exercise.category && (
              <Text style={[styles.exerciseCategory, { color: theme.textSecondary }]}>
                {exercise.category.charAt(0).toUpperCase() + exercise.category.slice(1)} Exercise
              </Text>
            )}
          </View>
          {/* Quick Stats */}
          {(exercise.difficulty || exercise.durationMinutes || exercise.caloriesPerMinute) && (
            <View style={styles.quickStatsContainer}>
              {exercise.difficulty && (
                <View style={[styles.quickStatCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                  <View style={[styles.quickStatIcon, { backgroundColor: `${getDifficultyColor(exercise.difficulty)}20` }]}>
                    <Award size={22} color={getDifficultyColor(exercise.difficulty)} />
                  </View>
                  <Text style={[styles.quickStatLabel, { color: theme.textSecondary }]}>Difficulty</Text>
                  <Text style={[styles.quickStatValue, { color: theme.textPrimary }]}>
                    {getDifficultyLabel(exercise.difficulty)}
                  </Text>
                </View>
              )}

              {exercise.durationMinutes && (
                <View style={[styles.quickStatCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                  <View style={[styles.quickStatIcon, { backgroundColor: `${accentColor}20` }]}>
                    <Clock size={22} color={accentColor} />
                  </View>
                  <Text style={[styles.quickStatLabel, { color: theme.textSecondary }]}>Duration</Text>
                  <Text style={[styles.quickStatValue, { color: theme.textPrimary }]}>
                    {exercise.durationMinutes} min
                  </Text>
                </View>
              )}

              {exercise.caloriesPerMinute && (
                <View style={[styles.quickStatCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                  <View style={[styles.quickStatIcon, { backgroundColor: `${accentColor}20` }]}>
                    <Flame size={22} color={accentColor} />
                  </View>
                  <Text style={[styles.quickStatLabel, { color: theme.textSecondary }]}>Calories</Text>
                  <Text style={[styles.quickStatValue, { color: theme.textPrimary }]}>
                    {exercise.caloriesPerMinute}/min
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Description */}
          {exercise.description && (
            <View style={[styles.section, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconContainer, { backgroundColor: `${accentColor}15` }]}>
                  <Info size={20} color={accentColor} />
                </View>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Description</Text>
              </View>
              <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
                {exercise.description}
              </Text>
            </View>
          )}

          {/* Instructions */}
          {exercise.instructions && exercise.instructions.length > 0 && (
            <View style={[styles.section, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconContainer, { backgroundColor: `${accentColor}15` }]}>
                  <Activity size={20} color={accentColor} />
                </View>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Instructions</Text>
              </View>
              <View style={styles.instructionsContainer}>
                {exercise.instructions.map((instruction: string, index: number) => (
                  <View key={index} style={styles.instructionItem}>
                    <View style={[styles.instructionNumber, { backgroundColor: accentColor }]}>
                      <Text style={styles.instructionNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
                      {instruction}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Primary Muscles */}
          {exercise.primaryMuscles && exercise.primaryMuscles.length > 0 && (
            <View style={[styles.section, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconContainer, { backgroundColor: `${accentColor}15` }]}>
                  <Target size={20} color={accentColor} />
                </View>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Primary Muscles</Text>
              </View>
              <View style={styles.tagsContainer}>
                {exercise.primaryMuscles.map((muscle: string, index: number) => (
                  <View
                    key={index}
                    style={[styles.tag, { backgroundColor: accentColor }]}
                  >
                    <Text style={styles.tagText}>{muscle}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Secondary Muscles */}
          {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
            <View style={[styles.section, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconContainer, { backgroundColor: `${accentColor}15` }]}>
                  <Target size={20} color={accentColor} />
                </View>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Secondary Muscles</Text>
              </View>
              <View style={styles.tagsContainer}>
                {exercise.secondaryMuscles.map((muscle: string, index: number) => (
                  <View
                    key={index}
                    style={[styles.tag, { backgroundColor: `${accentColor}30`, borderWidth: 1, borderColor: accentColor }]}
                  >
                    <Text style={[styles.tagText, { color: accentColor }]}>{muscle}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Equipment */}
          {exercise.equipment && exercise.equipment.length > 0 && (
            <View style={[styles.section, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconContainer, { backgroundColor: `${accentColor}15` }]}>
                  <Dumbbell size={20} color={accentColor} />
                </View>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Equipment</Text>
              </View>
              <View style={styles.tagsContainer}>
                {exercise.equipment.map((item: string, index: number) => (
                  <View
                    key={index}
                    style={[styles.equipmentTag, { backgroundColor: theme.background, borderColor: theme.border }]}
                  >
                    <Dumbbell size={14} color={accentColor} />
                    <Text style={[styles.equipmentTagText, { color: theme.textPrimary }]}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Phase Recommendations */}
          {exercise.phaseRecommendations && exercise.phaseRecommendations.length > 0 && (
            <View style={[styles.section, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconContainer, { backgroundColor: `${accentColor}15` }]}>
                  <Activity size={20} color={accentColor} />
                </View>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Recommended For</Text>
              </View>
              <View style={styles.tagsContainer}>
                {exercise.phaseRecommendations.map((phase: string, index: number) => (
                  <View
                    key={index}
                    style={[styles.phaseTag, { backgroundColor: `${accentColor}20`, borderColor: accentColor }]}
                  >
                    <Text style={[styles.phaseTagText, { color: accentColor }]}>
                      {phase.charAt(0).toUpperCase() + phase.slice(1)} Phase
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Video Section */}
          {exercise.videoUrl && (
            <TouchableOpacity
              style={[styles.videoSection, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
              onPress={() => {
                // Handle video playback
                console.log('Play video:', exercise.videoUrl);
              }}
            >
              <View style={styles.videoSectionContent}>
                <View style={[styles.videoIconContainer, { backgroundColor: accentColor }]}>
                  <Play size={24} color="#fff" fill="#fff" />
                </View>
                <View style={styles.videoTextContainer}>
                  <Text style={[styles.videoTitle, { color: theme.textPrimary }]}>Watch Video Tutorial</Text>
                  <Text style={[styles.videoSubtitle, { color: theme.textSecondary }]}>
                    Learn the proper form and technique
                  </Text>
                </View>
                <ChevronRight size={20} color={theme.textSecondary} />
              </View>
            </TouchableOpacity>
          )}

          {/* Bottom Spacing */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}




const createStyles = (theme: any, accentColor: string, safeTop: number = 0) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    closeButtonWrapper: {
      position: 'absolute',
      top: 0,
      right: 0,
      paddingRight: HORIZONTAL_PADDING + 4,
      zIndex: 100,
    },
    imageSection: {
      marginBottom: 24,
      paddingHorizontal: HORIZONTAL_PADDING,
    },
    imageContainer: {
      width: '100%',
      height: IMAGE_HEIGHT,
      borderRadius: 20,
      overflow: 'hidden',
      borderWidth: 2,
      backgroundColor: theme.cardBackground,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    exerciseImage: {
      width: '100%',
      height: '100%',
    },
    imageLoadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.08)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    imagePlaceholder: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    closeButtonBackdrop: {
      position: 'absolute',
      width: 48,
      height: 48,
      borderRadius: 24,
      top: -2,
      left: -2,
      backgroundColor: 'rgba(0,0,0,0.35)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeButtonInner: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    videoBadge: {
      position: 'absolute',
      top: 12,
      left: 12,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(0,0,0,0.65)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 5,
    },
    categoryBadge: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingVertical: 10,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    categoryBadgeText: {
      fontSize: 12,
      fontFamily: 'Bold',
      color: '#fff',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    titleSection: {
      alignItems: 'center',
      marginBottom: 24,
      paddingHorizontal: 20,
    },
    exerciseTitle: {
      fontSize: 28,
      fontFamily: 'Bold',
      textAlign: 'center',
      marginBottom: 8,
      lineHeight: 34,
    },
    exerciseCategory: {
      fontSize: 15,
      textTransform: 'capitalize',
      fontWeight: '500',
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      paddingTop: Math.max(safeTop, 8),
      paddingBottom: 40,
    },
    quickStatsContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 28,
      paddingHorizontal: 20,
    },
    quickStatCard: {
      flex: 1,
      padding: 18,
      borderRadius: 18,
      borderWidth: 2,
      alignItems: 'center',
      minHeight: 110,
      justifyContent: 'center',
    },
    quickStatIcon: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    quickStatLabel: {
      fontSize: 8,
      fontFamily: 'Bold',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 6,
    },
    quickStatValue: {
      fontSize: 14,
      fontFamily: 'Bold',
      textAlign: 'center',
    },
    section: {
      padding: 22,
      borderRadius: 22,
      borderWidth: 2,
      marginBottom: 18,
      marginHorizontal: 20,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 18,
    },
    sectionIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionTitle: {
      fontSize: 19,
      fontFamily: 'Bold',
      flex: 1,
    },
    sectionText: {
      fontSize: 15,
      lineHeight: 24,
      letterSpacing: 0.2,
    },
    instructionsContainer: {
      gap: 16,
    },
    instructionItem: {
      flexDirection: 'row',
      gap: 14,
      alignItems: 'flex-start',
    },
    instructionNumber: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    instructionNumberText: {
      fontSize: 15,
      fontFamily: 'Bold',
      color: '#fff',
    },
    instructionText: {
      flex: 1,
      fontSize: 15,
      lineHeight: 23,
      letterSpacing: 0.2,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    tag: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 22,
    },
    tagText: {
      fontSize: 13,
      fontFamily: 'Bold',
      color: '#fff',
      textTransform: 'capitalize',
    },
    equipmentTag: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 18,
      borderWidth: 2,
      gap: 8,
    },
    equipmentTagText: {
      fontSize: 13,
      fontFamily: 'Bold',
      textTransform: 'capitalize',
    },
    phaseTag: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 22,
      borderWidth: 2,
    },
    phaseTagText: {
      fontSize: 13,
      fontFamily: 'Bold',
    },
    videoSection: {
      padding: 22,
      borderRadius: 22,
      borderWidth: 2,
      marginBottom: 18,
      marginHorizontal: 20,
    },
    videoSectionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    videoIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
    },
    videoTextContainer: {
      flex: 1,
    },
    videoTitle: {
      fontSize: 17,
      fontFamily: 'Bold',
      marginBottom: 4,
    },
    videoSubtitle: {
      fontSize: 13,
      lineHeight: 18,
    },
  });