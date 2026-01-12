/**
 * SymptomTrackerModal Component
 * 
 * A reusable modal for tracking symptoms on a specific date
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import AppText from './AppText';
import FivePointSlider from './FivePointSlider';
import { useTheme } from '@/src/context/ThemeContext';
import NeuPressable from './NeuPressable';
import { addOpacityToHex, darkenColor } from '@/src/utils';

// ============================================================================
// TYPES
// ============================================================================

export type SymptomState = {
  mood: number;
  cramps: number;
  energy: number;
};

export interface SymptomTrackerModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (symptoms: SymptomState) => void;
  date: string; // ISO date string
  initialSymptoms?: SymptomState;
}

const SYMPTOM_FIELDS: { key: keyof SymptomState; label: string; helper: string }[] = [
  { key: 'mood', label: 'Mood', helper: 'Low → High' },
  { key: 'cramps', label: 'Cramps', helper: 'Calm → Intense' },
  { key: 'energy', label: 'Energy', helper: 'Rested → Energized' },
];

const DEFAULT_SYMPTOMS: SymptomState = { mood: 3, cramps: 2, energy: 3 };

const SYMPTOM_TRACK_COLORS: Record<keyof SymptomState, string> = {
  mood: '#f472b6',
  cramps: '#fb7185',
  energy: '#34d399',
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function SymptomTrackerModal({
  visible,
  onClose,
  onSave,
  date,
  initialSymptoms,
}: SymptomTrackerModalProps) {
  const { theme, accentColor } = useTheme();
  const [symptomDraft, setSymptomDraft] = useState<SymptomState>(DEFAULT_SYMPTOMS);
  
  const dynamicStyles = useMemo(() => createStyles(theme, accentColor), [theme, accentColor]);

  // Load initial symptoms when modal opens
  useEffect(() => {
    if (visible) {
      if (initialSymptoms) {
        setSymptomDraft({
          mood: initialSymptoms.mood ?? DEFAULT_SYMPTOMS.mood,
          cramps: initialSymptoms.cramps ?? DEFAULT_SYMPTOMS.cramps,
          energy: initialSymptoms.energy ?? DEFAULT_SYMPTOMS.energy,
        });
      } else {
        setSymptomDraft(DEFAULT_SYMPTOMS);
      }
    }
  }, [visible, initialSymptoms]);

  const handleSave = () => {
    onSave(symptomDraft);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={dynamicStyles.container}
      >
        <View style={dynamicStyles.overlay}>
          <View style={[dynamicStyles.modalContent, { backgroundColor: theme.cardBackground }]}>
            {/* Header */}
            <View style={[dynamicStyles.header, { borderBottomColor: addOpacityToHex(accentColor, 0.2) }]}>
              <View>
                <AppText style={[dynamicStyles.title, { color: theme.textPrimary }]}>Symptom Tracker</AppText>
                <AppText style={[dynamicStyles.subtitle, { color: theme.textSecondary }]}>
                  {new Date(date).toLocaleDateString()}
                </AppText>
              </View>
              <NeuPressable
                onPress={onClose}
                backgroundColor={theme.cardBackground}
                shadowColor={accentColor}
                borderRadius={18}
                pressDepth={4}
                style={dynamicStyles.closeButtonWrapper}
                contentStyle={[dynamicStyles.closeButtonContent, { borderColor: accentColor, borderWidth: 2 }]}
              >
                <X size={20} color={accentColor} />
              </NeuPressable>
            </View>

            <ScrollView
              style={dynamicStyles.content}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Instructions */}
              <View style={[dynamicStyles.instructions, { 
                backgroundColor: addOpacityToHex(accentColor, 0.08), 
                borderColor: addOpacityToHex(accentColor, 0.3) 
              }]}>
                <NeuPressable
                  backgroundColor={accentColor}
                  shadowColor={accentColor}
                  borderRadius={20}
                  pressDepth={0}
                  style={dynamicStyles.instructionsIconWrapper}
                  contentStyle={dynamicStyles.instructionsIconContent}
                  disabled={true}
                >
                  <Text style={dynamicStyles.instructionsEmoji}>🤧</Text>
                </NeuPressable>
                <Text style={[dynamicStyles.instructionsText, { color: theme.textPrimary }]}>
                  Track how you're feeling today
                </Text>
                <Text style={[dynamicStyles.instructionsSubtext, { color: theme.textSecondary }]}>
                  Slide to adjust each metric from 1 (low) to 5 (high)
                </Text>
              </View>

              {/* Symptom Fields */}
              <View style={dynamicStyles.symptomsContainer}>
                {SYMPTOM_FIELDS.map((field, index) => (
                  <View key={field.key} style={[dynamicStyles.symptomCard, { 
                    backgroundColor: theme.cardBackground, 
                    borderColor: SYMPTOM_TRACK_COLORS[field.key] 
                  }]}>
                    <View style={dynamicStyles.symptomCardHeader}>
                      <View style={dynamicStyles.symptomCardHeaderLeft}>
                        <View style={[dynamicStyles.symptomIconBadge, { backgroundColor: SYMPTOM_TRACK_COLORS[field.key], borderColor: SYMPTOM_TRACK_COLORS[field.key] }]}>
                          <Text style={dynamicStyles.symptomEmoji}>
                            {field.key === 'mood' ? '😊' : field.key === 'cramps' ? '💢' : '⚡'}
                          </Text>
                        </View>
                        <View>
                          <Text style={[dynamicStyles.symptomLabel, { color: theme.textPrimary }]}>{field.label}</Text>
                          <Text style={[dynamicStyles.symptomHelper, { color: theme.textSecondary }]}>{field.helper}</Text>
                        </View>
                      </View>
                      <View style={[dynamicStyles.symptomValueBadge, { backgroundColor: accentColor, borderColor: accentColor }]}>
                        <Text style={[dynamicStyles.symptomValueText, { color: theme.cardBackground }]}>{symptomDraft[field.key]}</Text>
                        <Text style={[dynamicStyles.symptomValueLabel, { color: theme.cardBackground }]}>/5</Text>
                      </View>
                    </View>
                    <View style={dynamicStyles.symptomSliderWrapper}>
                      <FivePointSlider
                        value={symptomDraft[field.key]}
                        onChange={level =>
                          setSymptomDraft(prev => ({ ...prev, [field.key]: level }))
                        }
                        trackColor={SYMPTOM_TRACK_COLORS[field.key]}
                        knobColor="#fff"
                      />
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* Actions */}
            <View style={[dynamicStyles.actions, { borderTopColor: addOpacityToHex(accentColor, 0.2) }]}>
              <NeuPressable
                onPress={onClose}
                backgroundColor={theme.cardBackground}
                shadowColor={theme.textSecondary}
                borderRadius={16}
                pressDepth={6}
                style={dynamicStyles.cancelButtonWrapper}
                contentStyle={[dynamicStyles.cancelButtonContent, { borderColor: theme.textSecondary, borderWidth: 2 }]}
              >
                <Text style={[dynamicStyles.cancelButtonText, { color: theme.textSecondary }]}>Cancel</Text>
              </NeuPressable>
              <NeuPressable
                onPress={handleSave}
                backgroundColor={theme.cardBackground}
                shadowColor={darkenColor(accentColor, 0.4)}
                borderRadius={16}
                pressDepth={6}
                style={dynamicStyles.saveButtonWrapper}
                contentStyle={[dynamicStyles.saveButtonContent, { borderColor: accentColor, borderWidth: 2 }]}
              >
                {/* <Check size={18} color="#fff" /> */}
                <Text style={[dynamicStyles.saveButtonText, { color: accentColor }]}>Save Symptoms</Text>
              </NeuPressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ============================================================================
// DYNAMIC STYLES (Theme-aware)
// ============================================================================

const createStyles = (theme: any, accentColor: string) => StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderTopColor: accentColor,
    borderLeftColor: accentColor,
    borderRightColor: accentColor,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 18,
    borderBottomWidth: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  closeButtonWrapper: {
    alignSelf: 'flex-start',
  },
  closeButtonContent: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  instructions: {
    marginBottom: 28,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 3,
  },
  instructionsIconWrapper: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  instructionsIconContent: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionsEmoji: {
    fontSize: 32,
  },
  instructionsText: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  instructionsSubtext: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  symptomsContainer: {
    gap: 18,
    marginBottom: 40,
  },
  symptomCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
    elevation: 4,
  },
  symptomCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  symptomCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  symptomIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  symptomEmoji: {
    fontSize: 26,
  },
  symptomLabel: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  symptomHelper: {
    fontSize: 13,
    fontWeight: '500',
  },
  symptomValueBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 2,
  },
  symptomValueText: {
    fontSize: 22,
    fontWeight: '800',
  },
  symptomValueLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 2,
  },
  symptomSliderWrapper: {
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 2,
  },
  cancelButtonWrapper: {
    flex: 1,
    alignSelf: 'stretch',
  },
  cancelButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  saveButtonWrapper: {
    flex: 1,
    alignSelf: 'stretch',
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: 0.3,
  },
});

