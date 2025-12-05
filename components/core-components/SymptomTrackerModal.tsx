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
            <View style={[dynamicStyles.header, { borderBottomColor: theme.border }]}>
              <View>
                <AppText style={[dynamicStyles.title, { color: theme.textPrimary }]}>Symptom Tracker</AppText>
                <AppText style={[dynamicStyles.subtitle, { color: theme.textSecondary }]}>
                  {new Date(date).toLocaleDateString()}
                </AppText>
              </View>
              <TouchableOpacity onPress={onClose} style={dynamicStyles.closeButton}>
                <X size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={dynamicStyles.content}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Instructions */}
              <View style={[dynamicStyles.instructions, { 
                backgroundColor: `${accentColor}20`, 
                borderColor: theme.border 
              }]}>
                <View style={[dynamicStyles.instructionsIcon, { backgroundColor: theme.cardBackground }]}>
                  <Text style={dynamicStyles.instructionsEmoji}>📊</Text>
                </View>
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
                    borderColor: theme.border 
                  }]}>
                    <View style={dynamicStyles.symptomCardHeader}>
                      <View style={dynamicStyles.symptomCardHeaderLeft}>
                        <View style={[dynamicStyles.symptomIconBadge, { backgroundColor: SYMPTOM_TRACK_COLORS[field.key] + '20' }]}>
                          <Text style={dynamicStyles.symptomEmoji}>
                            {field.key === 'mood' ? '😊' : field.key === 'cramps' ? '💢' : '⚡'}
                          </Text>
                        </View>
                        <View>
                          <Text style={[dynamicStyles.symptomLabel, { color: theme.textPrimary }]}>{field.label}</Text>
                          <Text style={[dynamicStyles.symptomHelper, { color: theme.textSecondary }]}>{field.helper}</Text>
                        </View>
                      </View>
                      <View style={[dynamicStyles.symptomValueBadge, { backgroundColor: `${accentColor}20` }]}>
                        <Text style={[dynamicStyles.symptomValueText, { color: accentColor }]}>{symptomDraft[field.key]}</Text>
                        <Text style={[dynamicStyles.symptomValueLabel, { color: theme.textSecondary }]}>/5</Text>
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
            <View style={[dynamicStyles.actions, { borderTopColor: theme.border }]}>
              <TouchableOpacity
                style={[dynamicStyles.cancelButton, { 
                  backgroundColor: theme.cardBackground, 
                  borderColor: theme.border 
                }]}
                onPress={onClose}
              >
                <Text style={[dynamicStyles.cancelButtonText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dynamicStyles.saveButton, { backgroundColor: accentColor }]}
                onPress={handleSave}
              >
                <Check size={18} color="#fff" />
                <Text style={dynamicStyles.saveButtonText}>Save Symptoms</Text>
              </TouchableOpacity>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  instructions: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  instructionsIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  instructionsEmoji: {
    fontSize: 28,
  },
  instructionsText: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  instructionsSubtext: {
    fontSize: 13,
    textAlign: 'center',
  },
  symptomsContainer: {
    gap: 16,
  },
  symptomCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  symptomCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  symptomCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  symptomIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symptomEmoji: {
    fontSize: 22,
  },
  symptomLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  symptomHelper: {
    fontSize: 12,
  },
  symptomValueBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  symptomValueText: {
    fontSize: 20,
    fontWeight: '700',
  },
  symptomValueLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  symptomSliderWrapper: {
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

