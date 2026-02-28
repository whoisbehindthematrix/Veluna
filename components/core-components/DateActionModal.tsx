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
import { Droplets, Plus, X, FileText, Calendar as CalendarIcon, Target, StickyNote } from 'lucide-react-native';
import AppText from './AppText';
import { useTheme } from '@/src/context/ThemeContext';
import type { CycleEntry, QuickNote } from '@/src/store/slices/cycleSlice';
import type { SymptomState } from './SymptomTrackerModal';
import NeuPressable from './NeuPressable';
import { addOpacityToHex } from '@/src/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface DayPredictionInfo {
  phaseName: string;
  phaseDescription: string;
  phaseColor: string;
  cycleDay: number | null;
  nextPeriodLabel: string;
  ovulationLabel: string;
}

export interface DateActionModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: string;
  entry: CycleEntry | undefined;
  quickNotes: QuickNote[];
  dayPrediction?: DayPredictionInfo | null;
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
  dayPrediction,
  onLogPeriod,
  onUnmarkPeriod,
  onOpenSymptomTracker,
  onOpenQuickNoteModal,
  onEditQuickNote,
}: DateActionModalProps) {
  const { theme, accentColor } = useTheme();
  const isDatePeriod = entry?.isPeriod ?? false;
  const hasSymptoms = entry?.symptoms && Object.values(entry.symptoms).some(v => v !== undefined && v !== null);
  
  // Check if date is in the future
  const isFutureDate = useMemo(() => {
    if (!selectedDate) return false;
    const today = new Date().toISOString().split('T')[0];
    const selectedDateObj = new Date(selectedDate);
    const todayObj = new Date(today);
    selectedDateObj.setHours(0, 0, 0, 0);
    todayObj.setHours(0, 0, 0, 0);
    return selectedDateObj > todayObj;
  }, [selectedDate]);
  
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
          <View style={[dynamicStyles.modalHeader, { borderBottomColor: addOpacityToHex(accentColor, 0.2) }]}>
            <View>
              <Text style={[dynamicStyles.modalTitle, { color: theme.textPrimary }]}>{formattedDate?.full || ''}</Text>
              <Text style={[dynamicStyles.modalSubtitle, { color: theme.textSecondary }]}>{formattedDate?.year || ''}</Text>
            </View>
            <NeuPressable
              onPress={onClose}
              backgroundColor={theme.cardBackground}
              shadowColor={accentColor}
              borderRadius={18}
              pressDepth={4}
              style={dynamicStyles.modalCloseButtonWrapper}
              contentStyle={[dynamicStyles.modalCloseButtonContent, { borderColor: accentColor, borderWidth: 2 }]}
            >
              <X size={20} color={accentColor} />
            </NeuPressable>
          </View>

          <ScrollView
            style={dynamicStyles.modalScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={dynamicStyles.modalScrollContent}
          >
            {/* Day overview: prediction, period status, symptoms & notes summary */}
            <View style={dynamicStyles.modalDayOverviewSection}>
              <View style={[dynamicStyles.modalDayOverviewCard, { backgroundColor: addOpacityToHex(theme.cardBackground, 1), borderColor: addOpacityToHex(accentColor, 0.25) }]}>
                {dayPrediction && (
                  <>
                    <View style={[dynamicStyles.modalPhaseRow, { backgroundColor: addOpacityToHex(dayPrediction.phaseColor, 0.15), borderColor: addOpacityToHex(dayPrediction.phaseColor, 0.5) }]}>
                      <CalendarIcon size={20} color={dayPrediction.phaseColor} />
                      <View style={dynamicStyles.modalPhaseTextWrap}>
                        <Text style={[dynamicStyles.modalPhaseName, { color: theme.textPrimary }]}>{dayPrediction.phaseName}</Text>
                        {dayPrediction.phaseDescription ? (
                          <Text style={[dynamicStyles.modalPhaseDesc, { color: theme.textSecondary }]} numberOfLines={2}>{dayPrediction.phaseDescription}</Text>
                        ) : null}
                      </View>
                    </View>
                    {dayPrediction.cycleDay != null && (
                      <View style={dynamicStyles.modalMetaRow}>
                        <Text style={[dynamicStyles.modalMetaLabel, { color: theme.textSecondary }]}>Cycle day</Text>
                        <Text style={[dynamicStyles.modalMetaValue, { color: theme.textPrimary }]}>Day {dayPrediction.cycleDay}</Text>
                      </View>
                    )}
                    {(dayPrediction.nextPeriodLabel || dayPrediction.ovulationLabel) && (
                      <View style={dynamicStyles.modalPredictionsRow}>
                        {dayPrediction.nextPeriodLabel ? (
                          <View style={dynamicStyles.modalPredictionChip}>
                            <Droplets size={14} color="#ec4899" />
                            <Text style={[dynamicStyles.modalPredictionText, { color: theme.textSecondary }]}>Next period ~{dayPrediction.nextPeriodLabel}</Text>
                          </View>
                        ) : null}
                        {dayPrediction.ovulationLabel ? (
                          <View style={dynamicStyles.modalPredictionChip}>
                            <Target size={14} color="#f59e0b" />
                            <Text style={[dynamicStyles.modalPredictionText, { color: theme.textSecondary }]}>Ovulation ~{dayPrediction.ovulationLabel}</Text>
                          </View>
                        ) : null}
                      </View>
                    )}
                  </>
                )}
                <View style={[dynamicStyles.modalStatusRow, { borderTopColor: addOpacityToHex(theme.textSecondary, 0.15) }]}>
                  <View style={dynamicStyles.modalStatusItem}>
                    <View style={[dynamicStyles.modalStatusDot, { backgroundColor: isDatePeriod ? '#ec4899' : addOpacityToHex(theme.textSecondary, 0.3) }]} />
                    <Text style={[dynamicStyles.modalStatusText, { color: theme.textPrimary }]}>{isDatePeriod ? 'Period logged' : 'No period logged'}</Text>
                  </View>
                  <View style={dynamicStyles.modalStatusItem}>
                    <StickyNote size={16} color={quickNotes.length > 0 ? '#10b981' : addOpacityToHex(theme.textSecondary, 0.5)} />
                    <Text style={[dynamicStyles.modalStatusText, { color: theme.textPrimary }]}>{quickNotes.length > 0 ? `${quickNotes.length} note${quickNotes.length > 1 ? 's' : ''}` : 'No notes'}</Text>
                  </View>
                  <View style={dynamicStyles.modalStatusItem}>
                    <View style={[dynamicStyles.modalStatusDot, { backgroundColor: hasSymptoms ? '#8b5cf6' : addOpacityToHex(theme.textSecondary, 0.3) }]} />
                    <Text style={[dynamicStyles.modalStatusText, { color: theme.textPrimary }]}>{hasSymptoms ? 'Symptoms logged' : 'No symptoms'}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Symptoms detail */}
            {entry?.symptoms && (
              <View style={dynamicStyles.modalSymptomsSection}>
                <Text style={[dynamicStyles.modalSectionTitle, { color: theme.textPrimary }]}>Symptoms</Text>
                <View style={[dynamicStyles.modalSymptomsPreview, { backgroundColor: addOpacityToHex(accentColor, 0.08), borderColor: addOpacityToHex(accentColor, 0.3) }]}>
                  {entry.symptoms.mood !== undefined && (
                    <View style={dynamicStyles.modalSymptomPreviewItem}>
                      <Text style={dynamicStyles.modalSymptomEmoji}>😊</Text>
                      <View style={[dynamicStyles.modalSymptomPreviewBar, { backgroundColor: addOpacityToHex('#f472b6', 0.2), borderColor: addOpacityToHex('#f472b6', 0.3) }]}>
                        <View
                          style={[
                            dynamicStyles.modalSymptomPreviewFill,
                            { width: `${((entry.symptoms.mood || 0) / 5) * 100}%`, backgroundColor: '#f472b6' },
                          ]}
                        />
                      </View>
                      <Text style={[dynamicStyles.modalSymptomValue, { color: theme.textSecondary }]}>{entry.symptoms.mood}/5</Text>
                    </View>
                  )}
                  {entry.symptoms.energy !== undefined && (
                    <View style={dynamicStyles.modalSymptomPreviewItem}>
                      <Text style={dynamicStyles.modalSymptomEmoji}>⚡</Text>
                      <View style={[dynamicStyles.modalSymptomPreviewBar, { backgroundColor: addOpacityToHex('#34d399', 0.2), borderColor: addOpacityToHex('#34d399', 0.3) }]}>
                        <View
                          style={[
                            dynamicStyles.modalSymptomPreviewFill,
                            { width: `${((entry.symptoms.energy || 0) / 5) * 100}%`, backgroundColor: '#34d399' },
                          ]}
                        />
                      </View>
                      <Text style={[dynamicStyles.modalSymptomValue, { color: theme.textSecondary }]}>{entry.symptoms.energy}/5</Text>
                    </View>
                  )}
                  {entry.symptoms.cramps !== undefined && (
                    <View style={dynamicStyles.modalSymptomPreviewItem}>
                      <Text style={dynamicStyles.modalSymptomEmoji}>💢</Text>
                      <View style={[dynamicStyles.modalSymptomPreviewBar, { backgroundColor: addOpacityToHex('#fb7185', 0.2), borderColor: addOpacityToHex('#fb7185', 0.3) }]}>
                        <View
                          style={[
                            dynamicStyles.modalSymptomPreviewFill,
                            { width: `${((entry.symptoms.cramps || 0) / 5) * 100}%`, backgroundColor: '#fb7185' },
                          ]}
                        />
                      </View>
                      <Text style={[dynamicStyles.modalSymptomValue, { color: theme.textSecondary }]}>{entry.symptoms.cramps}/5</Text>
                    </View>
                  )}
                </View>
                <NeuPressable
                  onPress={onOpenSymptomTracker}
                  backgroundColor={theme.cardBackground}
                  shadowColor={accentColor}
                  borderRadius={14}
                  pressDepth={6}
                  style={dynamicStyles.modalEditSymptomsButtonWrapper}
                  contentStyle={[dynamicStyles.modalEditSymptomsButtonContent, { borderColor: accentColor, borderWidth: 2 }]}
                >
                  <Text style={[dynamicStyles.modalEditSymptomsText, { color: accentColor }]}>Edit Symptoms</Text>
                </NeuPressable>
              </View>
            )}

            {/* Quick Notes list */}
            {quickNotes.length > 0 && (
              <View style={dynamicStyles.modalNotesSection}>
                <Text style={[dynamicStyles.modalSectionTitle, { color: theme.textPrimary }]}>Notes ({quickNotes.length})</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={dynamicStyles.modalNotesScroll}
                >
                  {quickNotes.map((note) => (
                    <NeuPressable
                      key={note.id}
                      onPress={() => onEditQuickNote(note)}
                      backgroundColor={theme.cardBackground}
                      shadowColor="#10b981"
                      borderRadius={14}
                      pressDepth={5}
                      style={dynamicStyles.modalNoteCardWrapper}
                      contentStyle={dynamicStyles.modalNoteCardContent}
                    >
                      {note.icon && (
                        <View style={[dynamicStyles.modalNoteIconBadge, { backgroundColor: addOpacityToHex('#10b981', 0.15), borderColor: '#10b981' }]}>
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
                        <View style={[dynamicStyles.modalNoteReminder, { backgroundColor: accentColor, borderColor: accentColor }]}>
                          <Text style={[dynamicStyles.modalNoteReminderText, { color: theme.cardBackground }]}>🔔</Text>
                        </View>
                      )}
                    </NeuPressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Quick Actions */}
            <View style={dynamicStyles.modalActionsSection}>
              <Text style={[dynamicStyles.modalSectionTitle, { color: theme.textPrimary }]}>Quick Actions</Text>
              <View style={dynamicStyles.modalActionsGrid}>
              {isDatePeriod ? (
                <NeuPressable
                  onPress={onUnmarkPeriod}
                  backgroundColor={theme.cardBackground}
                  shadowColor="#dc2626"
                  borderRadius={16}
                  pressDepth={6}
                  style={dynamicStyles.modalActionCardWrapper}
                  contentStyle={dynamicStyles.modalActionCardContent}
                >
                  <View style={[dynamicStyles.modalActionIcon, { backgroundColor: '#fee2e2', borderColor: '#dc2626' }]}>
                    <X size={22} color="#dc2626" />
                  </View>
                  <Text style={[dynamicStyles.modalActionLabel, { color: theme.textPrimary }]}>Unmark Period</Text>
                </NeuPressable>
              ) : (
                <NeuPressable
                  onPress={isFutureDate ? undefined : onLogPeriod}
                  disabled={isFutureDate}
                  backgroundColor={theme.cardBackground}
                  shadowColor={isFutureDate ? '#9ca3af' : '#ec4899'}
                  borderRadius={16}
                  pressDepth={6}
                  style={[dynamicStyles.modalActionCardWrapper, { opacity: isFutureDate ? 0.5 : 1 }]}
                  contentStyle={dynamicStyles.modalActionCardContent}
                >
                  <View style={[dynamicStyles.modalActionIcon, { backgroundColor: isFutureDate ? '#f3f4f6' : '#fce7f3', borderColor: isFutureDate ? '#9ca3af' : '#ec4899' }]}>
                    <Droplets size={22} color={isFutureDate ? '#9ca3af' : '#ec4899'} />
                  </View>
                  <Text style={[dynamicStyles.modalActionLabel, { color: isFutureDate ? theme.textSecondary : theme.textPrimary }]}>
                    {isFutureDate ? 'Past dates only' : 'Log Period'}
                  </Text>
                </NeuPressable>
              )}

              <NeuPressable
                onPress={onOpenSymptomTracker}
                backgroundColor={theme.cardBackground}
                shadowColor="#8b5cf6"
                borderRadius={16}
                pressDepth={6}
                style={dynamicStyles.modalActionCardWrapper}
                contentStyle={dynamicStyles.modalActionCardContent}
              >
                <View style={[dynamicStyles.modalActionIcon, { backgroundColor: '#ede9fe', borderColor: '#8b5cf6' }]}>
                  <Plus size={22} color="#8b5cf6" />
                </View>
                <Text style={[dynamicStyles.modalActionLabel, { color: theme.textPrimary }]}>Symptoms</Text>
              </NeuPressable>

              <NeuPressable
                onPress={onOpenQuickNoteModal}
                backgroundColor={theme.cardBackground}
                shadowColor="#10b981"
                borderRadius={16}
                pressDepth={6}
                style={dynamicStyles.modalActionCardWrapper}
                contentStyle={dynamicStyles.modalActionCardContent}
              >
                <View style={[dynamicStyles.modalActionIcon, { backgroundColor: '#dcfce7', borderColor: '#10b981' }]}>
                  <FileText size={22} color="#10b981" />
                </View>
                <Text style={[dynamicStyles.modalActionLabel, { color: theme.textPrimary }]}>Quick Note</Text>
              </NeuPressable>
            </View>
          </View>
          </ScrollView>
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
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderLeftColor: accentColor,
    borderRightColor: accentColor,
    borderTopColor: accentColor,
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
    paddingBottom: 18,
    borderBottomWidth: 2,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'Bold',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 15,
    marginTop: 4,
    fontWeight: '500',
  },
  modalCloseButtonWrapper: {
    alignSelf: 'flex-start',
  },
  modalCloseButtonContent: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  modalScroll: {
    flexGrow: 0,
    maxHeight: 420,
  },
  modalScrollContent: {
    paddingBottom: 8,
  },
  modalDayOverviewSection: {
    marginBottom: 20,
  },
  modalDayOverviewCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    overflow: 'hidden',
  },
  modalPhaseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1.5,
  },
  modalPhaseTextWrap: {
    flex: 1,
  },
  modalPhaseName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  modalPhaseDesc: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
    opacity: 0.9,
  },
  modalMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalMetaLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalMetaValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  modalPredictionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  modalPredictionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  modalPredictionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalStatusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 14,
    borderTopWidth: 1.5,
  },
  modalStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modalStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalActionsSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  modalActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  modalActionCardWrapper: {
    flex: 1,
    alignSelf: 'stretch',
  },
  modalActionCardContent: {
    alignItems: 'center',
    padding: 18,
    borderWidth: 2,
    borderRadius: 16,
  },
  modalActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2,
  },
  modalActionLabel: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  modalNotesSection: {
    marginBottom: 24,
  },
  modalNotesScroll: {
    gap: 12,
    paddingRight: 4,
  },
  modalNoteCardWrapper: {
    width: 180,
    alignSelf: 'flex-start',
  },
  modalNoteCardContent: {
    padding: 16,
    position: 'relative',
    alignItems: 'flex-start',
    borderWidth: 2,
    borderRadius: 18,
  },
  modalNoteIconBadge: {
    marginBottom: 12,
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  modalNoteIcon: {
    fontSize: 28,
  },
  modalNoteTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  modalNoteText: {
    fontSize: 13,
    lineHeight: 18,
  },
  modalNoteReminder: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  modalNoteReminderText: {
    fontSize: 10,
  },
  modalSymptomsSection: {
    marginBottom: 8,
  },
  modalSymptomsPreview: {
    borderRadius: 18,
    padding: 18,
    gap: 16,
    marginBottom: 16,
    borderWidth: 3,
  },
  modalSymptomPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalSymptomEmoji: {
    fontSize: 22,
  },
  modalSymptomPreviewBar: {
    flex: 1,
    height: 10,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
  },
  modalSymptomPreviewFill: {
    height: '100%',
    borderRadius: 6,
  },
  modalSymptomValue: {
    fontSize: 13,
    fontWeight: '800',
    width: 36,
    textAlign: 'right',
  },
  modalEditSymptomsButtonWrapper: {
    alignSelf: 'stretch',
  },
  modalEditSymptomsButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  modalEditSymptomsText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

