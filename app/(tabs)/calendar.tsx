import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/src/store';
import { 
  addEntry, 
  calculatePredictions, 
  CycleEntry, 
  deleteEntry, 
  updateEntry,
  addQuickNote,
  updateQuickNote,
  deleteQuickNote,
  QuickNote,
} from '@/src/store/slices/cycleSlice';
import { phaseRecommendations } from '@/data/phaseRecommendation';
import AppText from '@/components/core-components/AppText';
import QuickNoteModal from '@/components/core-components/QuickNoteModal';
import SymptomTrackerModal, { type SymptomState } from '@/components/core-components/SymptomTrackerModal';
import TodaySummaryCard from '@/components/core-components/TodaySummaryCard';
import DateActionModal from '@/components/core-components/DateActionModal';
import LegendModal from '@/components/core-components/LegendModal';
import { quickNoteService } from '@/services/quickNoteService';
import { useTheme } from '@/src/context/ThemeContext';
import { Info } from 'lucide-react-native';

type Phase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Calculate the phase for a given date based on cycle data
 */
function calculatePhaseForDate(
  dateISO: string,
  profile: RootState['cycle']['profile'],
  entries: CycleEntry[]
): Phase {
  const { averageCycleLength, periodDuration, lastPeriodStart } = profile;

  const lastPeriod = lastPeriodStart ||
    entries
      .filter(e => e.isPeriod)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date;

  if (!lastPeriod) {
    return 'follicular';
  }

  const lastPeriodDate = new Date(lastPeriod);
  const targetDate = new Date(dateISO);
  const daysSince = Math.floor((targetDate.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24));

  let cycleDay = daysSince + 1;

  if (cycleDay <= 0) {
    cycleDay = ((cycleDay % averageCycleLength) + averageCycleLength) % averageCycleLength + 1;
  }

  if (cycleDay > averageCycleLength) {
    cycleDay = ((cycleDay - 1) % averageCycleLength) + 1;
  }

  const menstrualEnd = periodDuration;
  const follicularEnd = Math.floor(averageCycleLength / 2) - 1;
  const ovulatoryEnd = follicularEnd + 3;

  if (cycleDay >= 1 && cycleDay <= menstrualEnd) return 'menstrual';
  if (cycleDay > menstrualEnd && cycleDay <= follicularEnd) return 'follicular';
  if (cycleDay > follicularEnd && cycleDay <= ovulatoryEnd) return 'ovulatory';
  return 'luteal';
}

export default function CalendarScreen() {
  const dispatch = useDispatch();
  const { theme, accentColor, themeName } = useTheme();
  const cycleState = useSelector((state: RootState) => state.cycle);

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().split('T')[0]);
  const [showQuickNoteModal, setShowQuickNoteModal] = useState(false);
  const [editingQuickNote, setEditingQuickNote] = useState<QuickNote | null>(null);
  const [showSymptomTrackerModal, setShowSymptomTrackerModal] = useState(false);
  const [showLegendModal, setShowLegendModal] = useState(false);

  const entriesMap = useMemo(() => {
    return cycleState.entries.reduce<Record<string, CycleEntry>>((acc, entry) => {
      acc[entry.date] = entry;
      return acc;
    }, {});
  }, [cycleState.entries]);

  // Get quick notes for selected date (for modal)
  const quickNotesForDate = useMemo(() => {
    if (!selectedDate) return [];
    // Get from entries first, then from global quickNotes
    const entry = entriesMap[selectedDate];
    if (entry?.quickNotes && entry.quickNotes.length > 0) {
      return entry.quickNotes;
    }
    // Fallback to global quickNotes
    return cycleState.quickNotes.filter(note => note.date === selectedDate);
  }, [selectedDate, entriesMap, cycleState.quickNotes]);

  // Get today's data
  const today = new Date().toISOString().split('T')[0];
  const todayEntry = entriesMap[today];
  
  // Get quick notes for today (for main page)
  const todayQuickNotes = useMemo(() => {
    if (todayEntry?.quickNotes && todayEntry.quickNotes.length > 0) {
      return todayEntry.quickNotes;
    }
    return cycleState.quickNotes.filter(note => note.date === today);
  }, [todayEntry, cycleState.quickNotes, today]);

  // Get today's symptoms
  const todaySymptoms = useMemo(() => {
    return todayEntry?.symptoms || null;
  }, [todayEntry]);

  const selectedEntry = selectedDate ? entriesMap[selectedDate] : undefined;

  // Removed symptom draft useEffect - now handled in SymptomTrackerModal

  // Generate marked dates with phase colors and entry indicators
  const markedDates = useMemo(() => {
    const marked: any = {};
    const today = new Date().toISOString().split('T')[0];

    // Generate dates for visible calendar range (current month + buffer)
    const startDate = new Date(currentMonth);
    startDate.setDate(1);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start of week

    const endDate = new Date(currentMonth);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0); // Last day of month
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // End of week
    const currentMonthIndex = new Date(currentMonth).getMonth();
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      const isOutsideCurrentMonth = d.getMonth() !== currentMonthIndex;

      // Gray out days not in the current month (leading/trailing days)
      if (isOutsideCurrentMonth) {
        const customStyles: any = {
          container: {
            borderRadius: 8,
            backgroundColor: theme.primarySoft, // Use theme for grayed out days
          },
          text: {
            color: theme.textSecondary, // Use theme text color
            fontWeight: '500',
          },
        };
        marked[dateString] = {
          customStyles,
          selected: false,
        };
        continue;
      }
      const entry = cycleState.entries.find(e => e.date === dateString);
      const phase = calculatePhaseForDate(dateString, cycleState.profile, cycleState.entries);
      const phaseColor = phaseRecommendations[phase]?.color || '#e5e7eb';
      const isToday = dateString === today;
      const isPeriod = entry?.isPeriod || false;
      const hasSymptoms = !!entry?.symptoms && !isPeriod;

      const customStyles: any = {
        container: {
          borderRadius: 8,
        },
        text: {
          fontWeight: isToday ? '700' : '500',
        },
      };

      // Period days - override with period color
      if (isPeriod) {
        customStyles.container.backgroundColor = '#ec4899';
        customStyles.text.color = '#fff';
        customStyles.text.fontWeight = '700';
      } else {
        // Phase-based background color with opacity

        if (phaseColor === '#8b5cf6') {
          // console.log('phase', phase)
          customStyles.container.backgroundColor = "#f1f1f2" + '20';
        } else {
          customStyles.container.backgroundColor = phaseColor + '20';
        }

        customStyles.text.color = theme.textPrimary;

        // Phase border

        customStyles.container.borderWidth = 2;

        if (phaseColor === '#8b5cf6') {
          // console.log('phase', phase)
          customStyles.container.borderColor = "#f1f1f2";
        } else {
          customStyles.container.borderColor = phaseColor;
        }
        customStyles.container.borderStyle = 'solid';
      }

      // Today styling
      if (isToday && !isPeriod) {
        customStyles.container.borderWidth = 2;
        customStyles.container.borderColor = '#f59e0b';
        customStyles.container.backgroundColor = '#fef3c7';
        customStyles.text.color = '#92400e';
      }

      // Selected styling - use accent color for UI interaction
      const isSelected = dateString === selectedDate;
      if (isSelected) {
        customStyles.container.backgroundColor = accentColor;
        customStyles.container.borderColor = accentColor;
        customStyles.container.borderWidth = 2;
        customStyles.text.color = '#fff';
        customStyles.text.fontWeight = '700';
      }

      // Check for quick notes
      const hasQuickNotes = cycleState.quickNotes.some(note => note.date === dateString) ||
        entry?.quickNotes && entry.quickNotes.length > 0;

      // Markers for indicators
      const dots: any[] = [];
      if (isPeriod) {
        dots.push({ key: 'period', color: '#fff', selectedDotColor: '#fff' });
      }
      if (hasSymptoms) {
        dots.push({ key: 'symptoms', color: '#8b5cf6', selectedDotColor: '#8b5cf6' });
      }
      if (hasQuickNotes) {
        dots.push({ key: 'notes', color: '#10b981', selectedDotColor: '#10b981' });
      }
      if (isSelected) {
        dots.push({ key: 'selected', color: '#fff', selectedDotColor: '#fff' });
      }

      marked[dateString] = {
        customStyles,
        dots: dots.length > 0 ? dots : undefined,
        selected: isSelected,
      };
    }

    return marked;
  }, [currentMonth, cycleState.entries, cycleState.profile, cycleState.quickNotes, selectedDate, theme, accentColor]);

  const resetSelections = useCallback(() => {
    setShowLogModal(false);
  }, []);

  const upsertEntry = useCallback(
    async (date: string, updates: Partial<CycleEntry>) => {
      const existing = entriesMap[date];
      let entryToSync: CycleEntry;

      if (existing) {
        const updatedEntry = { ...existing, ...updates };
        dispatch(updateEntry({ date, updates }));
        entryToSync = updatedEntry;
      } else {
        const newEntry: CycleEntry = {
          date,
          isPeriod: false,
          ...updates,
        };
        dispatch(addEntry(newEntry));
        entryToSync = newEntry;
      }

      // Sync to backend
      try {
        const { cycleEntryService } = await import('@/services/cycleEntryService');
        const result = await cycleEntryService.saveCycleEntry(entryToSync);
        if (result) {
          console.log('✅ [Calendar] Cycle entry synced to backend');
        } else {
          console.warn('⚠️ [Calendar] Cycle entry sync returned null (check logs for details)');
        }
      } catch (error) {
        console.error('❌ [Calendar] Failed to sync cycle entry:', error);
        // Continue even if sync fails - entry is saved locally
      }
    },
    [dispatch, entriesMap]
  );

  const handleDayPress = useCallback(
    (day: DateData) => {
      const dateString = day.dateString;
      setSelectedDate(dateString);
      setShowLogModal(true);
    },
    []
  );

  const logPeriodDates = useCallback(
    async (date: string) => {
      const existing = entriesMap[date];
      await upsertEntry(date, {
        isPeriod: true,
        symptoms: existing?.symptoms,
      });
      dispatch(calculatePredictions());
      resetSelections();
    },
    [entriesMap, upsertEntry, dispatch, resetSelections]
  );

  const logSymptomsDates = useCallback(
    async (date: string, symptoms: SymptomState) => {
      const existing = entriesMap[date];
      await upsertEntry(date, {
        isPeriod: existing?.isPeriod ?? false,
        symptoms,
      });
      dispatch(calculatePredictions());
      resetSelections();
    },
    [entriesMap, upsertEntry, dispatch, resetSelections]
  );

  const handleLogPeriodSingle = useCallback(async () => {
    if (!selectedDate) return;
    await logPeriodDates(selectedDate);
    setShowLogModal(false);
  }, [selectedDate, logPeriodDates]);

  const handleSaveSymptoms = useCallback(async (symptoms: SymptomState) => {
    if (!selectedDate) return;
    await logSymptomsDates(selectedDate, symptoms);
    setShowSymptomTrackerModal(false);
  }, [selectedDate, logSymptomsDates]);

  const handleOpenSymptomTracker = useCallback(() => {
    setShowSymptomTrackerModal(true);
  }, []);


  // Unmark period handler
  const handleUnmarkPeriod = useCallback(async () => {
    if (!selectedDate) return;
    const entry = entriesMap[selectedDate];
    if (!entry) return;

    const hasSymptoms =
      entry.symptoms &&
      Object.values(entry.symptoms).some(
        value => value !== undefined && value !== null
      );

    if (hasSymptoms) {
      await upsertEntry(selectedDate, { isPeriod: false });
    } else {
      dispatch(deleteEntry(selectedDate));
    }
    
    dispatch(calculatePredictions());
    resetSelections();
  }, [selectedDate, entriesMap, upsertEntry, dispatch, resetSelections]);

  const handleMonthChange = useCallback((month: any) => {
    setCurrentMonth(month.dateString);
  }, []);

  // Quick Note Handlers
  const handleOpenQuickNoteModal = useCallback((note?: QuickNote) => {
    setEditingQuickNote(note || null);
    setShowQuickNoteModal(true);
  }, []);

  const handleCloseQuickNoteModal = useCallback(() => {
    setShowQuickNoteModal(false);
    setEditingQuickNote(null);
  }, []);

  const handleSaveQuickNote = useCallback(async (note: Omit<QuickNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingQuickNote?.id) {
        // Update existing note
        const updatedNote = await quickNoteService.updateQuickNote(editingQuickNote.id, note);
        if (updatedNote) {
          dispatch(updateQuickNote({ id: editingQuickNote.id, updates: updatedNote }));
        }
      } else {
        // Create new note
        const createdNote = await quickNoteService.createQuickNote(note);
        if (createdNote) {
          dispatch(addQuickNote(createdNote));
        } else {
          // Fallback: add locally if API fails
          dispatch(addQuickNote(note as QuickNote));
        }
      }
      handleCloseQuickNoteModal();
    } catch (error) {
      console.error('Error saving quick note:', error);
      // Still add/update locally even if sync fails
      if (editingQuickNote?.id) {
        dispatch(updateQuickNote({ id: editingQuickNote.id, updates: note }));
      } else {
        dispatch(addQuickNote(note as QuickNote));
      }
      handleCloseQuickNoteModal();
    }
  }, [dispatch, editingQuickNote, handleCloseQuickNoteModal]);

  const handleDeleteQuickNote = useCallback(async (id: string) => {
    try {
      await quickNoteService.deleteQuickNote(id);
      dispatch(deleteQuickNote(id));
    } catch (error) {
      console.error('Error deleting quick note:', error);
      // Still delete locally even if API fails
      dispatch(deleteQuickNote(id));
    }
  }, [dispatch]);

  const dynamicStyles = useMemo(() => createDynamicStyles(theme, accentColor), [theme, accentColor]);

  // Memoize calendar theme to ensure it updates when theme changes
  const calendarTheme = useMemo(() => ({
    backgroundColor: theme.cardBackground,
    calendarBackground: theme.cardBackground,
    textSectionTitleColor: theme.textSecondary,
    textSectionTitleDisabledColor: theme.textSecondary,
    selectedDayBackgroundColor: accentColor, // Use accent color for selected date (UI state)
    selectedDayTextColor: '#fff',
    // todayTextColor: '#92400e', // Keep today color as-is (data indicator)
    dayTextColor: theme.textPrimary,
    textDisabledColor: theme.textSecondary,
    dotColor: '#ec4899', // Keep period dot color as-is (data)
    selectedDotColor: '#fff',
    arrowColor: accentColor, // Use accent color for navigation arrows
    monthTextColor: theme.textPrimary,
    textDayFontFamily: 'System',
    textDayFontWeight: '500',
    textDayFontSize: 16,
    textMonthFontFamily: 'Bold',
    textMonthFontWeight: '700',
    textMonthFontSize: 24,
    textDayHeaderFontFamily: 'Bold',
    textDayHeaderFontWeight: '600',
    textDayHeaderFontSize: 12,
    'stylesheet.calendar.header': {
      week: {
        marginTop: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 6,
      },
    },
  } as any), [theme, accentColor]);

  // Create a unique key that changes when theme or accent color changes to force Calendar remount
  const calendarKey = useMemo(() => `${themeName}-${accentColor}`, [themeName, accentColor]);

  return (
    <ScrollView style={[dynamicStyles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[dynamicStyles.header, { backgroundColor: theme.cardBackground }]}>
        <View style={dynamicStyles.headerTop}>
          <AppText variant='bold' style={[dynamicStyles.title, { color: theme.textPrimary }]}>Cycle Calendar</AppText>
          <TouchableOpacity
            onPress={() => setShowLegendModal(true)}
            style={[dynamicStyles.infoButton, { backgroundColor: `${accentColor}20` }]}
            activeOpacity={0.7}
          >
            <Info size={18} color={accentColor} />
          </TouchableOpacity>
        </View>
        <Text style={[dynamicStyles.subtitle, { color: accentColor }]}>Track your period and symptoms</Text>
      </View>

      {/* Calendar Navigation */}
      <View style={[dynamicStyles.calendarWrapper, { backgroundColor: theme.cardBackground }]}>
        <Calendar
          key={calendarKey}
          current={currentMonth}
          onMonthChange={handleMonthChange}
          markingType="custom"
          markedDates={markedDates}
          onDayPress={handleDayPress}
          firstDay={1}
          enableSwipeMonths={true}
          theme={calendarTheme}
          style={dynamicStyles.calendar}
        />
      </View>


      {/* Today's Summary Card */}
      <TodaySummaryCard
        date={today}
        symptoms={todaySymptoms}
        quickNotes={todayQuickNotes}
        isPeriod={todayEntry?.isPeriod ?? false}
        onAddNote={() => {
          setSelectedDate(today);
          handleOpenQuickNoteModal();
        }}
        onAddSymptoms={() => {
          setSelectedDate(today);
          setShowSymptomTrackerModal(true);
        }}
        onLogPeriod={async () => {
          setSelectedDate(today);
          await handleLogPeriodSingle();
        }}
        onEditNote={(note) => {
          setSelectedDate(note.date);
          handleOpenQuickNoteModal(note as QuickNote);
        }}
      />


      {/* Date Action Modal */}
      <DateActionModal
        visible={showLogModal}
        onClose={() => setShowLogModal(false)}
        selectedDate={selectedDate}
        entry={selectedEntry}
        quickNotes={quickNotesForDate}
        onLogPeriod={handleLogPeriodSingle}
        onUnmarkPeriod={handleUnmarkPeriod}
        onOpenSymptomTracker={handleOpenSymptomTracker}
        onOpenQuickNoteModal={() => handleOpenQuickNoteModal()}
        onEditQuickNote={(note) => handleOpenQuickNoteModal(note)}
      />

      {/* Quick Note Modal */}
      <QuickNoteModal
        visible={showQuickNoteModal}
        onClose={handleCloseQuickNoteModal}
        onSave={handleSaveQuickNote}
        onDelete={editingQuickNote?.id ? handleDeleteQuickNote : undefined}
        initialNote={editingQuickNote}
        date={selectedDate}
      />

      {/* Symptom Tracker Modal */}
      <SymptomTrackerModal
        visible={showSymptomTrackerModal}
        onClose={() => setShowSymptomTrackerModal(false)}
        onSave={handleSaveSymptoms}
        date={selectedDate}
        initialSymptoms={selectedEntry?.symptoms}
      />

      {/* Legend Modal */}
      <LegendModal
        visible={showLegendModal}
        onClose={() => setShowLegendModal(false)}
      />
    </ScrollView>
  );
}

// ============================================================================
// DYNAMIC STYLES (Theme-aware)
// ============================================================================

const createDynamicStyles = (theme: any, accentColor: string) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: '400',
    textAlign: 'center',
    flex: 1,
  },
  infoButton: {
    position: 'absolute',
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  calendarWrapper: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 12,
    elevation: 2,
    shadowColor: accentColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  calendar: {
    borderRadius: 12,
  },
  legend: {
    margin: 24,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: accentColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  legendTitle: {
    fontSize: 18,
    fontFamily: 'Bold',
    marginBottom: 12,
  },
  legendItems: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
