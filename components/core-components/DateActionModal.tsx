/**
 * DateActionModal Component
 * 
 * Modal for actions on a selected date (log period, symptoms, quick notes)
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Droplets, Plus, X, FileText } from 'lucide-react-native';
import AppText from './AppText';
import { useTheme } from '@/src/context/ThemeContext';
import type { CycleEntry, QuickNote } from '@/src/store/slices/cycleSlice';
import type { SymptomState } from './SymptomTrackerModal';

// ============================================================================
// TYPES
// ============================================================================

interface DateActionModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: string;
  entry: CycleEntry | undefined;
  quickNotes: QuickNote[];
  onLogPeriod: () => void;
  onUnmarkPeriod: () => void;
  onOpenSymptomTracker: () => void;
  onOpenQuickNoteModal: () => void;
  onEditQuickNote: (note: QuickNote) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function DateActionModal({
  visible,
  onClose,
  selectedDate,
  entry,
  quickNotes,
  onLogPeriod,
  onUnmarkPeriod,
  onOpenSymptomTracker,
  onOpenQuickNoteModal,
  onEditQuickNote,
}: DateActionModalProps) {
  const { theme, accentColor } = useTheme();
  const isDatePeriod = entry?.isPeriod ?? false;
  
  const dynamicStyles = useMemo(() => createStyles(theme, accentColor), [theme, accentColor]);

  const formattedDate = useMemo(() => {
    if (!selectedDate) return null;
    const date = new Date(selectedDate);
    return {
      full: date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
      year: date.toLocaleDateString('en-US', {
        year: 'numeric',
      }),
    };
  }, [selectedDate]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={dynamicStyles.modalOverlay}>
        <View style={[dynamicStyles.modalContent, { backgroundColor: theme.cardBackground }]}>
          {/* Header */}
          <View style={[dynamicStyles.modalHeader, { borderBottomColor: theme.border }]}>
            <View>
              <Text style={[dynamicStyles.modalTitle, { color: theme.textPrimary }]}>{formattedDate?.full || ''}</Text>
              <Text style={[dynamicStyles.modalSubtitle, { color: theme.textSecondary }]}>{formattedDate?.year || ''}</Text>
            </View>
            <TouchableOpacity 
              style={[dynamicStyles.modalCloseButton, { backgroundColor: `${accentColor}20` }]} 
              onPress={onClose}
            >
              <X size={20} color={accentColor} />
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={dynamicStyles.modalActionsSection}>
            <Text style={[dynamicStyles.modalSectionTitle, { color: theme.textPrimary }]}>Quick Actions</Text>
            <View style={dynamicStyles.modalActionsGrid}>
              {isDatePeriod ? (
                <TouchableOpacity
                  style={[dynamicStyles.modalActionCard, { backgroundColor: '#fee2e2', borderColor: '#fecaca' }]}
                  onPress={onUnmarkPeriod}
                >
                  <View style={[dynamicStyles.modalActionIcon, { backgroundColor: '#fee2e2' }]}>
                    <X size={22} color="#dc2626" />
                  </View>
                  <Text style={[dynamicStyles.modalActionLabel, { color: theme.textPrimary }]}>Unmark Period</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[dynamicStyles.modalActionCard, { backgroundColor: '#fce7f320', borderColor: '#fbcfe820' }]}
                  onPress={onLogPeriod}
                >
                  <View style={[dynamicStyles.modalActionIcon, { backgroundColor: '#fce7f3' }]}>
                    <Droplets size={22} color="#ec4899" />
                  </View>
                  <Text style={[dynamicStyles.modalActionLabel, { color: theme.textPrimary }]}>Log Period</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[dynamicStyles.modalActionCard, { backgroundColor: '#f5f3ff20', borderColor: '#ede9fe20' }]}
                onPress={onOpenSymptomTracker}
              >
                <View style={[dynamicStyles.modalActionIcon, { backgroundColor: '#ede9fe' }]}>
                  <Plus size={22} color="#8b5cf6" />
                </View>
                <Text style={[dynamicStyles.modalActionLabel, { color: theme.textPrimary }]}>Symptoms</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[dynamicStyles.modalActionCard, { backgroundColor: '#f0fdf420', borderColor: '#dcfce720' }]}
                onPress={onOpenQuickNoteModal}
              >
                <View style={[dynamicStyles.modalActionIcon, { backgroundColor: '#dcfce7' }]}>
                  <FileText size={22} color="#10b981" />
                </View>
                <Text style={[dynamicStyles.modalActionLabel, { color: theme.textPrimary }]}>Quick Note</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Notes List for Selected Date */}
          {quickNotes.length > 0 && (
            <View style={dynamicStyles.modalNotesSection}>
              <Text style={[dynamicStyles.modalSectionTitle, { color: theme.textPrimary }]}>Quick Notes ({quickNotes.length})</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={dynamicStyles.modalNotesScroll}
              >
                {quickNotes.map((note) => (
                  <TouchableOpacity
                    key={note.id}
                    style={dynamicStyles.modalNoteCard}
                    onPress={() => onEditQuickNote(note)}
                  >
                    {note.icon && (
                      <View style={dynamicStyles.modalNoteIconBadge}>
                        <Text style={dynamicStyles.modalNoteIcon}>{note.icon}</Text>
                      </View>
                    )}
                    <Text style={[dynamicStyles.modalNoteTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                      {note.title}
                    </Text>
                    <Text style={[dynamicStyles.modalNoteText, { color: theme.textSecondary }]} numberOfLines={2}>
                      {note.text}
                    </Text>
                    {note.reminder && (
                      <View style={dynamicStyles.modalNoteReminder}>
                        <Text style={dynamicStyles.modalNoteReminderText}>🔔</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Symptoms Preview */}
          {entry?.symptoms && (
            <View style={dynamicStyles.modalSymptomsSection}>
              <Text style={[dynamicStyles.modalSectionTitle, { color: theme.textPrimary }]}>Symptoms</Text>
              <View style={[dynamicStyles.modalSymptomsPreview, { backgroundColor: `${accentColor}20` }]}>
                {entry.symptoms.mood !== undefined && (
                  <View style={dynamicStyles.modalSymptomPreviewItem}>
                    <Text style={dynamicStyles.modalSymptomEmoji}>😊</Text>
                    <View style={dynamicStyles.modalSymptomPreviewBar}>
                      <View
                        style={[
                          dynamicStyles.modalSymptomPreviewFill,
                          {
                            width: `${((entry.symptoms.mood || 0) / 5) * 100}%`,
                            backgroundColor: '#f472b6',
                          },
                        ]}
                      />
                    </View>
                    <Text style={[dynamicStyles.modalSymptomValue, { color: theme.textSecondary }]}>{entry.symptoms.mood}/5</Text>
                  </View>
                )}
                {entry.symptoms.energy !== undefined && (
                  <View style={dynamicStyles.modalSymptomPreviewItem}>
                    <Text style={dynamicStyles.modalSymptomEmoji}>⚡</Text>
                    <View style={dynamicStyles.modalSymptomPreviewBar}>
                      <View
                        style={[
                          dynamicStyles.modalSymptomPreviewFill,
                          {
                            width: `${((entry.symptoms.energy || 0) / 5) * 100}%`,
                            backgroundColor: '#34d399',
                          },
                        ]}
                      />
                    </View>
                    <Text style={[dynamicStyles.modalSymptomValue, { color: theme.textSecondary }]}>{entry.symptoms.energy}/5</Text>
                  </View>
                )}
                {entry.symptoms.cramps !== undefined && (
                  <View style={dynamicStyles.modalSymptomPreviewItem}>
                    <Text style={dynamicStyles.modalSymptomEmoji}>💢</Text>
                    <View style={dynamicStyles.modalSymptomPreviewBar}>
                      <View
                        style={[
                          dynamicStyles.modalSymptomPreviewFill,
                          {
                            width: `${((entry.symptoms.cramps || 0) / 5) * 100}%`,
                            backgroundColor: '#fb7185',
                          },
                        ]}
                      />
                    </View>
                    <Text style={[dynamicStyles.modalSymptomValue, { color: theme.textSecondary }]}>{entry.symptoms.cramps}/5</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                style={[dynamicStyles.modalEditSymptomsButton, { backgroundColor: `${accentColor}20`, borderColor: theme.border }]}
                onPress={onOpenSymptomTracker}
              >
                <Text style={[dynamicStyles.modalEditSymptomsText, { color: accentColor }]}>Edit Symptoms</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ============================================================================
// DYNAMIC STYLES (Theme-aware)
// ============================================================================

const createStyles = (theme: any, accentColor: string) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 34,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  modalSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActionsSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalActionsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  modalActionCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  modalActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  modalActionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalNotesSection: {
    marginBottom: 24,
  },
  modalNotesScroll: {
    gap: 12,
    paddingRight: 4,
  },
  modalNoteCard: {
    width: 160,
    backgroundColor: '#f0fdf4',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    position: 'relative',
  },
  modalNoteIconBadge: {
    marginBottom: 8,
  },
  modalNoteIcon: {
    fontSize: 24,
  },
  modalNoteTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalNoteText: {
    fontSize: 12,
    lineHeight: 16,
  },
  modalNoteReminder: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalNoteReminderText: {
    fontSize: 10,
  },
  modalSymptomsSection: {
    marginBottom: 8,
  },
  modalSymptomsPreview: {
    borderRadius: 14,
    padding: 16,
    gap: 12,
    marginBottom: 12,
  },
  modalSymptomPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalSymptomEmoji: {
    fontSize: 18,
  },
  modalSymptomPreviewBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  modalSymptomPreviewFill: {
    height: '100%',
    borderRadius: 3,
  },
  modalSymptomValue: {
    fontSize: 12,
    fontWeight: '700',
    width: 30,
    textAlign: 'right',
  },
  modalEditSymptomsButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  modalEditSymptomsText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

