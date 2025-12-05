/**
 * TodaySummaryCard – Modern Refined UI
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Activity, FileText, Plus, TrendingUp, Calendar, Droplets } from 'lucide-react-native';
import AppText from './AppText';
import { useTheme } from '@/src/context/ThemeContext';
import type { QuickNote } from '@/src/store/slices/cycleSlice';

interface SymptomData {
  mood?: number;
  cramps?: number;
  energy?: number;
}

interface TodaySummaryCardProps {
  date: string;
  symptoms?: SymptomData | null;
  quickNotes: QuickNote[];
  onAddNote: () => void;
  onAddSymptoms: () => void;
  onEditNote: (note: QuickNote) => void;
  onLogPeriod: () => void;
  isPeriod?: boolean;
}

export default function TodaySummaryCard({
  date,
  symptoms,
  quickNotes,
  onAddNote,
  onAddSymptoms,
  onEditNote,
  onLogPeriod,
  isPeriod = false,
}: TodaySummaryCardProps) {
  const { theme, accentColor } = useTheme();
  const hasSymptoms = symptoms && Object.values(symptoms).some(v => v !== undefined);
  const hasNotes = quickNotes.length > 0;
  const hasAnyData = hasSymptoms || hasNotes || isPeriod;
  
  const dynamicStyles = useMemo(() => createStyles(theme, accentColor), [theme, accentColor]);

  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const getSymptomSummary = () => {
    if (!symptoms) return null;

    const mood = symptoms.mood || 0;
    const energy = symptoms.energy || 0;
    const cramps = symptoms.cramps || 0;

    const avg = (mood + energy + (5 - cramps)) / 3;

    if (avg >= 4) return { text: 'Great', color: '#10b981', icon: '😊' };
    if (avg >= 3) return { text: 'Good', color: '#8b5cf6', icon: '🙂' };
    if (avg >= 2) return { text: 'Okay', color: '#f59e0b', icon: '😐' };
    return { text: 'Low', color: '#fb7185', icon: '😔' };
  };

  const summary = getSymptomSummary();

  return (
    <View style={[dynamicStyles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
      {/* HEADER */}
      <View style={dynamicStyles.header}>
        <View style={dynamicStyles.headerLeft}>
          <View style={[dynamicStyles.dateIcon, { backgroundColor: `${accentColor}20` }]}>
            <Calendar size={20} color={accentColor} />
          </View>

          <View>
            <AppText style={[dynamicStyles.date, { color: theme.textPrimary }]}>{formattedDate}</AppText>
            <AppText style={[dynamicStyles.today, { color: theme.textSecondary }]}>Today</AppText>
          </View>
        </View>

        {isPeriod && (
          <View style={dynamicStyles.periodBadge}>
            <View style={dynamicStyles.periodDot} />
            <AppText style={dynamicStyles.periodText}>Period</AppText>
          </View>
        )}
      </View>

      {/* QUICK ACTIONS */}
      <View style={dynamicStyles.actions}>
        {!isPeriod && (
          <TouchableOpacity 
            style={[dynamicStyles.action, dynamicStyles.actionPeriod, { backgroundColor: theme.cardBackground, borderColor: theme.border }]} 
            onPress={onLogPeriod}
          >
            <View style={[dynamicStyles.actionIconCircle, { backgroundColor: `${accentColor}20` }]}>
              <Droplets size={18} color={accentColor} />
            </View>
            <Text style={[dynamicStyles.actionText, { color: theme.textPrimary }]}>Log Period</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[dynamicStyles.action, dynamicStyles.actionFilled, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
          onPress={onAddSymptoms}
        >
          <View style={[dynamicStyles.actionIconCircle, { backgroundColor: `${accentColor}20` }]}>
            <Activity size={18} color={accentColor} />
          </View>
          <Text
            style={[
              dynamicStyles.actionText,
              { color: theme.textPrimary }
            ]}
          >
            {hasSymptoms ? 'Edit Symtoms' : 'Add Symtoms'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[dynamicStyles.action, { backgroundColor: theme.cardBackground, borderColor: theme.border }]} 
          onPress={onAddNote}
        >
          <View style={[dynamicStyles.actionIconCircle, { backgroundColor: `${accentColor}20` }]}>
            <Plus size={18} color={accentColor} />
          </View>
          <Text style={[dynamicStyles.actionText, { color: theme.textPrimary }]}>Add Note</Text>
        </TouchableOpacity>
      </View>

      {/* SYMPTOMS SUMMARY */}
      {hasSymptoms && summary && (
        <View style={[dynamicStyles.symptomsCard, { backgroundColor: `${accentColor}20`, borderColor: theme.border }]}>
          <View style={dynamicStyles.symptomsHeader}>
            <View style={dynamicStyles.symptomsHeaderLeft}>
              <Activity size={18} color={accentColor} />
              <AppText style={[dynamicStyles.symptomsTitle, { color: theme.textPrimary }]}>Today's Symptoms</AppText>
            </View>

            <View style={[dynamicStyles.summaryBadge, { backgroundColor: `${accentColor}20` }]}>
              <Text style={dynamicStyles.summaryEmoji}>{summary.icon}</Text>
              <AppText style={[dynamicStyles.summaryText, { color: accentColor }]}>
                {summary.text}
              </AppText>
            </View>
          </View>

          <View style={dynamicStyles.symptomList}>
            {['mood', 'energy', 'cramps'].map(key => {
              const value = symptoms[key as keyof SymptomData];
              if (value === undefined) return null;

              const emoji =
                key === 'mood' ? '😊' : key === 'energy' ? '⚡' : '💢';
              const color =
                key === 'mood' ? '#f472b6' : key === 'energy' ? '#34d399' : '#fb7185';

              return (
                <View key={key} style={dynamicStyles.symptomItem}>
                  <Text style={dynamicStyles.symptomEmoji}>{emoji}</Text>
                  <Text style={[dynamicStyles.symptomLabel, { color: theme.textPrimary }]}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>

                  <View style={dynamicStyles.bar}>
                    <View
                      style={[
                        dynamicStyles.barFill,
                        { width: `${(value / 5) * 100}%`, backgroundColor: color },
                      ]}
                    />
                  </View>

                  <Text style={[dynamicStyles.symptomValue, { color: theme.textSecondary }]}>{value}/5</Text>
                </View>
              );
            })}
          </View>

          <TouchableOpacity 
            style={[dynamicStyles.editSymptoms, { borderColor: theme.border }]} 
            onPress={onAddSymptoms}
          >
            <TrendingUp size={14} color={accentColor} />
            <Text style={[dynamicStyles.editSymptomsText, { color: accentColor }]}>Edit Symptoms</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* QUICK NOTES */}
      {hasNotes && (
        <View style={dynamicStyles.notesSection}>
          <View style={dynamicStyles.notesHeader}>
            <FileText size={18} color={accentColor} />
            <AppText style={[dynamicStyles.notesTitle, { color: theme.textPrimary }]}>Quick Notes ({quickNotes.length})</AppText>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={dynamicStyles.notesRow}>
            {quickNotes.map((note, i) => (
              <TouchableOpacity
                key={note.id || i}
                style={dynamicStyles.noteCard}
                onPress={() => onEditNote(note)}
              >
                {note.icon && (
                  <View style={dynamicStyles.noteIconWrap}>
                    <Text style={dynamicStyles.noteIcon}>{note.icon}</Text>
                  </View>
                )}

                <View style={dynamicStyles.noteTextWrap}>
                  <Text style={[dynamicStyles.noteTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                    {note.title}
                  </Text>
                  <Text style={[dynamicStyles.notePreview, { color: theme.textSecondary }]} numberOfLines={2}>
                    {note.text}
                  </Text>
                </View>

                {note.reminder && (
                  <View style={dynamicStyles.noteReminder}>
                    <Text>🔔</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}

            {/* ADD NEW NOTE */}
            <TouchableOpacity 
              style={[dynamicStyles.addNoteCard, { borderColor: theme.border }]} 
              onPress={onAddNote}
            >
              <View style={[dynamicStyles.addNoteIcon, { backgroundColor: `${accentColor}20` }]}>
                <Plus size={26} color={accentColor} />
              </View>
              <Text style={[dynamicStyles.addNoteText, { color: accentColor }]}>Add Note</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* EMPTY STATE */}
      {!hasAnyData && (
        <View style={dynamicStyles.empty}>
          <View style={[dynamicStyles.emptyIcon, { backgroundColor: `${accentColor}20` }]}>
            <Calendar size={28} color={theme.textSecondary} />
          </View>
          <AppText style={[dynamicStyles.emptyTitle, { color: theme.textPrimary }]}>Nothing logged yet</AppText>
          <AppText style={[dynamicStyles.emptySubtitle, { color: theme.textSecondary }]}>
            Start tracking your cycle using the buttons above.
          </AppText>
        </View>
      )}
    </View>
  );
}

// -----------------------------
// DYNAMIC STYLES – Theme-aware
// -----------------------------

const createStyles = (theme: any, accentColor: string) => StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    shadowColor: accentColor,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  // HEADER
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  dateIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  date: {
    fontSize: 12,
    fontWeight: '700',
  },
  today: {
    fontSize: 12,
  },

  // PERIOD BADGE (Keep data colors unchanged)
  periodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: `${accentColor}20`,
    borderRadius: 18,
    gap: 6,
  },
  periodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: accentColor,
  },
  periodText: {
    color: accentColor,
    fontWeight: '600',
    fontSize: 12,
  },

  // QUICK ACTIONS
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  action: {
    flex: 1,
    height: 64,
    flexDirection: 'column',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1.4,
  },
  actionFilled: {},
  actionPeriod: {
    borderColor: accentColor,
  },
  actionIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  periodEmoji: {
    fontSize: 16,
  },

  // SYMPTOMS SECTION
  symptomsCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  symptomsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    alignItems: 'center',
  },
  symptomsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  symptomsTitle: {
    fontSize: 15,
    fontWeight: '700',
  },

  summaryBadge: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 6,
    alignItems: 'center',
  },
  summaryEmoji: {
    fontSize: 16,
  },
  summaryText: {
    fontSize: 12,
    fontWeight: '700',
  },

  symptomList: { gap: 14 },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  symptomEmoji: { fontSize: 20 },
  symptomLabel: {
    width: 60,
    fontSize: 13,
    fontWeight: '600',
  },
  bar: {
    flex: 1,
    height: 8,
    backgroundColor: `${accentColor}20`,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: { height: '100%' },
  symptomValue: {
    width: 30,
    textAlign: 'right',
    fontSize: 12,
  },

  editSymptoms: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editSymptomsText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // NOTES SECTION
  notesSection: { marginTop: 4 },
  notesHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  notesTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  notesRow: { gap: 12 },
  noteCard: {
    width: 170,
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    position: 'relative',
  },
  noteIconWrap: { marginBottom: 8 },
  noteIcon: { fontSize: 24 },
  noteTextWrap: { flex: 1 },
  noteTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  notePreview: {
    fontSize: 12,
  },
  noteReminder: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fef3c7',
    padding: 4,
    borderRadius: 10,
  },

  addNoteCard: {
    width: 160,
    paddingVertical: 22,
    borderRadius: 16,
    borderWidth: 1.4,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addNoteIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  addNoteText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // EMPTY STATE
  empty: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
});
