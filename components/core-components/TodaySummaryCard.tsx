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
import NeuPressable from './NeuPressable';
import { addOpacityToHex } from '@/src/utils';

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

  // Check if date is in the future
  const isFutureDate = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const dateObj = new Date(date);
    const todayObj = new Date(today);
    dateObj.setHours(0, 0, 0, 0);
    todayObj.setHours(0, 0, 0, 0);
    return dateObj > todayObj;
  }, [date]);

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
    <View style={[dynamicStyles.card, { backgroundColor: theme.cardBackground, borderColor: accentColor }]}>
      {/* HEADER */}
      <View style={[dynamicStyles.header, { borderBottomColor: addOpacityToHex(accentColor, 0.2) }]}>
        <View style={dynamicStyles.headerLeft}>
          <NeuPressable
            backgroundColor={accentColor}
            shadowColor={accentColor}
            borderRadius={16}
            pressDepth={3}
            style={dynamicStyles.dateIconWrapper}
            contentStyle={dynamicStyles.dateIconContent}
            disabled={true}
          >
            <Calendar size={20} color={theme.cardBackground} />
          </NeuPressable>

          <View>
            <AppText style={[dynamicStyles.date, { color: theme.textPrimary }]}>{formattedDate}</AppText>
            <AppText style={[dynamicStyles.today, { color: theme.textSecondary }]}>Today</AppText>
          </View>
        </View>

        {isPeriod && (
          <View style={[dynamicStyles.periodBadge, { backgroundColor: accentColor, borderColor: accentColor }]}>
            <View style={[dynamicStyles.periodDot, { backgroundColor: theme.cardBackground }]} />
            <AppText style={[dynamicStyles.periodText, { color: theme.cardBackground }]}>Period</AppText>
          </View>
        )}
      </View>

      {/* QUICK ACTIONS */}
      <View style={[dynamicStyles.actions, { borderBottomColor: addOpacityToHex(accentColor, 0.2) }]}>
        {!isPeriod && !isFutureDate && (
          <NeuPressable
            onPress={onLogPeriod}
            backgroundColor={theme.cardBackground}
            shadowColor={accentColor}
            borderRadius={16}
            pressDepth={6}
            style={[dynamicStyles.action, dynamicStyles.actionPeriod]}
            contentStyle={dynamicStyles.actionContent}
          >
            <View style={[dynamicStyles.actionIconCircle, { backgroundColor: addOpacityToHex(accentColor, 0.15), borderColor: accentColor }]}>
              <Droplets size={18} color={accentColor} />
            </View>
            <Text style={[dynamicStyles.actionText, { color: theme.textPrimary }]}>Log Period</Text>
          </NeuPressable>
        )}

        <NeuPressable
          onPress={onAddSymptoms}
          backgroundColor={theme.cardBackground}
          shadowColor={accentColor}
          borderRadius={16}
          pressDepth={6}
          style={[dynamicStyles.action, dynamicStyles.actionFilled]}
          contentStyle={dynamicStyles.actionContent}
        >
          <View style={[dynamicStyles.actionIconCircle, { backgroundColor: addOpacityToHex(accentColor, 0.15), borderColor: accentColor }]}>
            <Activity size={18} color={accentColor} />
          </View>
          <Text
            style={[
              dynamicStyles.actionText,
              { color: theme.textPrimary }
            ]}
          >
            {hasSymptoms ? 'Edit Symptoms' : 'Add Symptoms'}
          </Text>
        </NeuPressable>

        <NeuPressable
          onPress={onAddNote}
          backgroundColor={theme.cardBackground}
          shadowColor={accentColor}
          borderRadius={16}
          pressDepth={6}
          style={[dynamicStyles.action]}
          contentStyle={dynamicStyles.actionContent}
        >
          <View style={[dynamicStyles.actionIconCircle, { backgroundColor: addOpacityToHex(accentColor, 0.15), borderColor: accentColor }]}>
            <Plus size={18} color={accentColor} />
          </View>
          <Text style={[dynamicStyles.actionText, { color: theme.textPrimary }]}>Add Note</Text>
        </NeuPressable>
      </View>

      {/* SYMPTOMS SUMMARY */}
      {hasSymptoms && summary && (
        <View style={[dynamicStyles.symptomsCard, { backgroundColor: addOpacityToHex(accentColor, 0.08), borderColor: addOpacityToHex(accentColor, 0.3) }]}>
          <View style={dynamicStyles.symptomsHeader}>
            <View style={dynamicStyles.symptomsHeaderLeft}>
              <View style={[dynamicStyles.symptomsIconWrapper, { backgroundColor: accentColor }]}>
                <Activity size={18} color={theme.cardBackground} />
              </View>
              <AppText style={[dynamicStyles.symptomsTitle, { color: theme.textPrimary }]}>Today's Symptoms</AppText>
            </View>

            <View style={[dynamicStyles.summaryBadge, { backgroundColor: summary.color, borderColor: summary.color }]}>
              <Text style={dynamicStyles.summaryEmoji}>{summary.icon}</Text>
              <AppText style={[dynamicStyles.summaryText, { color: theme.cardBackground }]}>
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

                  <View style={[dynamicStyles.bar, { backgroundColor: addOpacityToHex(color, 0.2), borderColor: addOpacityToHex(color, 0.3) }]}>
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

          <NeuPressable
            onPress={onAddSymptoms}
            backgroundColor={theme.cardBackground}
            shadowColor={accentColor}
            borderRadius={12}
            pressDepth={5}
            style={dynamicStyles.editSymptomsWrapper}
            contentStyle={dynamicStyles.editSymptomsContent}
          >
            <TrendingUp size={14} color={accentColor} />
            <Text style={[dynamicStyles.editSymptomsText, { color: accentColor }]}>Edit Symptoms</Text>
          </NeuPressable>
        </View>
      )}

      {/* QUICK NOTES */}
      {hasNotes && (
        <View style={[dynamicStyles.notesSection, { borderTopColor: addOpacityToHex(accentColor, 0.2) }]}>
          <View style={dynamicStyles.notesHeader}>
            <View style={[dynamicStyles.notesIconWrapper, { backgroundColor: accentColor }]}>
              <FileText size={18} color={theme.cardBackground} />
            </View>
            <AppText style={[dynamicStyles.notesTitle, { color: theme.textPrimary }]}>Quick Notes ({quickNotes.length})</AppText>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={dynamicStyles.notesRow}>
            {quickNotes.map((note, i) => (
              <NeuPressable
                key={note.id || i}
                onPress={() => onEditNote(note)}
                backgroundColor={theme.cardBackground}
                shadowColor="#10b981"
                borderRadius={18}
                pressDepth={6}
                style={dynamicStyles.noteCardWrapper}
                contentStyle={dynamicStyles.noteCardContent}
              >
                {note.icon && (
                  <View style={[dynamicStyles.noteIconWrap, { backgroundColor: addOpacityToHex('#10b981', 0.15), borderColor: '#10b981' }]}>
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
                  <View style={[dynamicStyles.noteReminder, { backgroundColor: accentColor, borderColor: accentColor }]}>
                    <Text style={{ color: theme.cardBackground }}>🔔</Text>
                  </View>
                )}
              </NeuPressable>
            ))}

            {/* ADD NEW NOTE */}
            <NeuPressable
              onPress={onAddNote}
              backgroundColor={theme.cardBackground}
              shadowColor={accentColor}
              borderRadius={18}
              pressDepth={6}
              style={dynamicStyles.addNoteCardWrapper}
              contentStyle={[dynamicStyles.addNoteCardContent, { borderColor: accentColor, borderStyle: 'dashed' }]}
            >
              <View style={[dynamicStyles.addNoteIcon, { backgroundColor: addOpacityToHex(accentColor, 0.15), borderColor: accentColor }]}>
                <Plus size={26} color={accentColor} />
              </View>
              <Text style={[dynamicStyles.addNoteText, { color: accentColor }]}>Add Note</Text>
            </NeuPressable>
          </ScrollView>
        </View>
      )}

      {/* EMPTY STATE */}
      {!hasAnyData && (
        <View style={dynamicStyles.empty}>
          <NeuPressable
            backgroundColor={accentColor}
            shadowColor={accentColor}
            borderRadius={20}
            pressDepth={0}
            style={dynamicStyles.emptyIconWrapper}
            contentStyle={dynamicStyles.emptyIconContent}
            disabled={true}
          >
            <Calendar size={28} color={theme.cardBackground} />
          </NeuPressable>
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
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 200,
    borderRadius: 24,
    padding: 0,
    borderWidth: 3,
    borderColor: accentColor,
    backgroundColor: theme.cardBackground,
    shadowColor: accentColor,
    shadowOpacity: 0.3,
    shadowRadius: 0,
    shadowOffset: { width: 6, height: 6 },
    // elevation: 8,
  },

  // HEADER
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    borderBottomWidth: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  dateIconWrapper: {
    alignSelf: 'flex-start',
  },
  dateIconContent: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  date: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  today: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
    opacity: 0.7,
  },

  // PERIOD BADGE
  periodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 8,
    borderWidth: 2,
  },
  periodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  periodText: {
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },

  // QUICK ACTIONS
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 2,
  },
  action: {
    flex: 1,
    alignSelf: 'stretch',
  },
  actionContent: {
    height: 88,
    flexDirection: 'column',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 16,
  },
  actionFilled: {},
  actionPeriod: {},
  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  periodEmoji: {
    fontSize: 16,
  },

  // SYMPTOMS SECTION
  symptomsCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 3,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  symptomsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    alignItems: 'center',
  },
  symptomsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  symptomsIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symptomsTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  summaryBadge: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    gap: 8,
    alignItems: 'center',
    borderWidth: 2,
  },
  summaryEmoji: {
    fontSize: 14,
  },
  summaryText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  symptomList: { gap: 18 },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  symptomEmoji: { fontSize: 22 },
  symptomLabel: {
    width: 70,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  bar: {
    flex: 1,
    height: 10,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
  },
  barFill: { 
    height: '100%',
    borderRadius: 6,
  },
  symptomValue: {
    width: 36,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '800',
  },

  editSymptomsWrapper: {
    marginTop: 20,
    alignSelf: 'stretch',
  },
  editSymptomsContent: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 14,
  },
  editSymptomsText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  // NOTES SECTION
  notesSection: { 
    paddingTop: 20,
    paddingBottom: 20,
    borderTopWidth: 2,
  },
  notesHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  notesIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  notesRow: { 
    gap: 12,
    paddingHorizontal: 20,
  },
  noteCardWrapper: {
    width: 200,
    alignSelf: 'flex-start',
  },
  noteCardContent: {
    padding: 18,
    position: 'relative',
    alignItems: 'flex-start',
    borderWidth: 2,
    borderRadius: 18,
  },
  noteIconWrap: { 
    marginBottom: 12,
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  noteIcon: { fontSize: 26 },
  noteTextWrap: { flex: 1, width: '100%' },
  noteTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  notePreview: {
    fontSize: 13,
    lineHeight: 18,
  },
  noteReminder: {
    position: 'absolute',
    top: 14,
    right: 14,
    padding: 6,
    borderRadius: 10,
    borderWidth: 2,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  addNoteCardWrapper: {
    width: 180,
    alignSelf: 'flex-start',
  },
  addNoteCardContent: {
    paddingVertical: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 18,
  },
  addNoteIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
  },
  addNoteText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  // EMPTY STATE
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  emptyIconWrapper: {
    alignSelf: 'center',
  },
  emptyIconContent: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
    paddingHorizontal: 20,
  },
});
