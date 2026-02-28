import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar, DateData } from 'react-native-calendars';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/src/store';
import {
  addEntry,
  calculatePredictions,
  CycleEntry,
  deleteEntry,
  loadCycleData,
  updateEntry,
  addQuickNote,
  updateQuickNote,
  deleteQuickNote,
  QuickNote,
} from '@/src/store/slices/cycleSlice';
import { cycleEntryService } from '@/services/cycleEntryService';
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
import { MONTH_NAMES } from '@/data/calenderData';
import NeuPressable from '@/components/core-components/NeuPressable';
import { addOpacityToHex } from '@/src/utils';

// Import images for period and ovulation
const periodImage = require('../../assets/images/hotwaterbottle.png');
const ovulationImage = require('../../assets/images/ovuobj.png');

type Phase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';


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

/** Get cycle day (1-based) for a date for display in modal */
function getCycleDayForDate(
  dateISO: string,
  profile: RootState['cycle']['profile'],
  entries: CycleEntry[]
): number | null {
  const lastPeriod = profile.lastPeriodStart ||
    entries
      .filter(e => e.isPeriod)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date;
  if (!lastPeriod) return null;
  const lastPeriodDate = new Date(lastPeriod);
  const targetDate = new Date(dateISO);
  const daysSince = Math.floor((targetDate.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24));
  let cycleDay = daysSince + 1;
  if (cycleDay <= 0) {
    cycleDay = ((cycleDay % profile.averageCycleLength) + profile.averageCycleLength) % profile.averageCycleLength + 1;
  }
  if (cycleDay > profile.averageCycleLength) {
    cycleDay = ((cycleDay - 1) % profile.averageCycleLength) + 1;
  }
  return cycleDay;
}

function formatPredictionDate(d: string | undefined): string {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

  // Fetch cycle entries from backend when calendar is opened/focused so period log shows up-to-date data
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const fetchCycleEntries = async () => {
        try {
          const entries = await cycleEntryService.getCycleEntries();
          if (!cancelled) {
            dispatch(loadCycleData({ entries }));
            if (entries.length > 0) dispatch(calculatePredictions());
          }
        } catch (error) {
          if (!cancelled) console.error('[Calendar] Error fetching cycle entries:', error);
        }
      };
      fetchCycleEntries();
      return () => { cancelled = true; };
    }, [dispatch])
  );

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

  // Day prediction data for the selected date (phase, cycle day, next period/ovulation)
  const dayPrediction = useMemo(() => {
    if (!selectedDate) return null;
    const phase = calculatePhaseForDate(selectedDate, cycleState.profile, cycleState.entries);
    const phaseData = phaseRecommendations[phase];
    const cycleDay = getCycleDayForDate(selectedDate, cycleState.profile, cycleState.entries);
    const nextPeriod = cycleState.predictions?.nextPeriod as { date?: string } | null;
    const ovulation = cycleState.predictions?.ovulation as { date?: string } | null;
    const fertileWindow = cycleState.predictions?.fertileWindow;
    return {
      phaseName: phaseData?.name ?? phase,
      phaseDescription: phaseData?.description ?? '',
      phaseColor: phaseData?.color ?? '#8b5cf6',
      cycleDay,
      nextPeriodLabel: formatPredictionDate(nextPeriod?.date),
      ovulationLabel: formatPredictionDate(ovulation?.date) || (fertileWindow ? formatPredictionDate(fertileWindow.peak) : ''),
    };
  }, [selectedDate, cycleState.profile, cycleState.entries, cycleState.predictions]);

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

      // Extra days (outside current month) - styled like regular days but with low opacity text
      if (isOutsideCurrentMonth) {
        const entry = cycleState.entries.find(e => e.date === dateString);
        const phase = calculatePhaseForDate(dateString, cycleState.profile, cycleState.entries);
        const phaseColor = phaseRecommendations[phase]?.color || '#e5e7eb';
        const isPeriod = entry?.isPeriod || false;
        const isDark = (theme.mode as string) === 'dark';

        const customStyles: any = {
          container: {
            borderRadius: 0,
            paddingHorizontal: 8,
            paddingVertical: 8,
            width: '100%',
            height: 60,
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
            // Subtle grid lines
            borderRightWidth: 0.5,
            borderBottomWidth: 0.5,
            borderRightColor: isDark ? '#2a2a2a' : '#f0f0f0',
            borderBottomColor: isDark ? '#2a2a2a' : '#f0f0f0',
          },
          text: {
            fontWeight: '500',
            fontSize: 15,
            opacity: 0.4, // Very low opacity for extra days
          },
        };

        // Period days - override with period color
        if (isPeriod) {
          customStyles.container.backgroundColor = isDark ? '#ec489950' : '#ec489920';
          customStyles.text.color = '#ec4899';
          customStyles.text.opacity = 0.6;
          customStyles.text.fontWeight = '600';
        } else {
          // Phase-based background color with very subtle opacity
          if (phaseColor === '#8b5cf6') {
            customStyles.container.backgroundColor = isDark ? '#8b5cf510' : '#f1f1f210';
          } else {
            customStyles.container.backgroundColor = isDark 
              ? phaseColor + '10' 
              : phaseColor + '08';
          }

          // Use theme text color with reduced opacity for extra days
          customStyles.text.color = isDark ? '#6b7280' : '#9ca3af';
          customStyles.text.opacity = 0.4;

          // Very subtle phase border
          customStyles.container.borderTopWidth = 0.5;
          customStyles.container.borderLeftWidth = 0.5;
          if (phaseColor === '#8b5cf6') {
            customStyles.container.borderTopColor = isDark ? '#f1f1f220' : '#f1f1f230';
            customStyles.container.borderLeftColor = isDark ? '#f1f1f220' : '#f1f1f230';
          } else {
            customStyles.container.borderTopColor = isDark 
              ? phaseColor + '20' 
              : phaseColor + '30';
            customStyles.container.borderLeftColor = isDark 
              ? phaseColor + '20' 
              : phaseColor + '30';
          }
        }

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
      const isDark = (theme.mode as string) === 'dark';
      const isSelected = dateString === selectedDate;

      // Helper function to get phase text color with proper contrast
      const getPhaseTextColor = (phaseColor: string, isDark: boolean): string => {
        if (phaseColor === '#e42a50') return '#ec4899'; // menstrual - always red
        if (phaseColor === '#3b82f6') return isDark ? '#60a5fa' : '#2563eb'; // follicular - blue
        if (phaseColor === '#fbbf24') return isDark ? '#fbbf24' : '#d97706'; // ovulatory - amber
        if (phaseColor === '#8b5cf6') return isDark ? '#a78bfa' : '#7c3aed'; // luteal - purple
        return theme.textPrimary;
      };

      const customStyles: any = {
        container: {
          borderRadius: 0,
          paddingHorizontal: 8,
          paddingVertical: 8,
          width: '100%',
          height: 60,
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          // Subtle grid lines for better visual separation
          borderRightWidth: 0.5,
          borderBottomWidth: 0.5,
          borderRightColor: isDark ? '#2a2a2a' : '#f0f0f0',
          borderBottomColor: isDark ? '#2a2a2a' : '#f0f0f0',
        },
        text: {
          fontWeight: isToday ? '600' : '500',
          fontSize: 15,
        },
      };

      // Period days - soft pink background with better contrast
      if (isPeriod) {
        customStyles.container.backgroundColor = isDark ? '#ec489940' : '#ec489915';
        customStyles.text.color = '#ec4899';
        customStyles.text.fontWeight = '700';
        // Subtle period indicator border
        customStyles.container.borderTopWidth = 2;
        customStyles.container.borderLeftWidth = 2;
        customStyles.container.borderTopColor = '#ec4899';
        customStyles.container.borderLeftColor = '#ec4899';
      } else {
        // Phase-based background color with soft opacity
        if (phaseColor === '#8b5cf6') {
          customStyles.container.backgroundColor = isDark ? '#8b5cf515' : '#f1f1f215';
        } else {
          customStyles.container.backgroundColor = isDark 
            ? phaseColor + '15' 
            : phaseColor + '12';
        }

        // Use phase-specific text color for better visibility
        customStyles.text.color = getPhaseTextColor(phaseColor, isDark);

        // Subtle phase border for visual distinction
        customStyles.container.borderTopWidth = 1.5;
        customStyles.container.borderLeftWidth = 1.5;
        if (phaseColor === '#8b5cf6') {
          customStyles.container.borderTopColor = isDark ? '#f1f1f240' : '#f1f1f250';
          customStyles.container.borderLeftColor = isDark ? '#f1f1f240' : '#f1f1f250';
        } else {
          customStyles.container.borderTopColor = isDark 
            ? phaseColor + '40' 
            : phaseColor + '50';
          customStyles.container.borderLeftColor = isDark 
            ? phaseColor + '40' 
            : phaseColor + '50';
        }
      }

      // Today styling - soft highlight without being too bold
      if (isToday && !isPeriod) {
        customStyles.container.borderTopWidth = 2.5;
        customStyles.container.borderLeftWidth = 2.5;
        customStyles.container.borderTopColor = '#f59e0b';
        customStyles.container.borderLeftColor = '#f59e0b';
        customStyles.container.backgroundColor = isDark 
          ? '#f59e0b20' 
          : '#fef3c7';
        customStyles.text.color = isDark ? '#fbbf24' : '#92400e';
        customStyles.text.fontWeight = '700';
      }

      // Selected styling - use accent color with better contrast
      if (isSelected && !isToday && !isPeriod) {
        customStyles.container.backgroundColor = isDark 
          ? accentColor + '40' 
          : accentColor + '20';
        customStyles.container.borderTopWidth = 2.5;
        customStyles.container.borderLeftWidth = 2.5;
        customStyles.container.borderTopColor = accentColor;
        customStyles.container.borderLeftColor = accentColor;
        customStyles.text.color = accentColor;
        customStyles.text.fontWeight = '700';
      }

      // Check for quick notes
      const hasQuickNotes = cycleState.quickNotes.some(note => note.date === dateString) ||
        entry?.quickNotes && entry.quickNotes.length > 0;

      // Markers for indicators - smaller, more subtle dots
      const dots: any[] = [];
      if (isPeriod) {
        dots.push({ key: 'period', color: '#ec4899', selectedDotColor: '#ec4899' });
      }
      if (hasSymptoms) {
        dots.push({ key: 'symptoms', color: '#8b5cf6', selectedDotColor: '#8b5cf6' });
      }
      if (hasQuickNotes) {
        dots.push({ key: 'notes', color: '#10b981', selectedDotColor: '#10b981' });
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
      // Prevent logging periods in future dates
      const today = new Date().toISOString().split('T')[0];
      const selectedDateObj = new Date(date);
      const todayObj = new Date(today);

      // Reset time to compare only dates
      selectedDateObj.setHours(0, 0, 0, 0);
      todayObj.setHours(0, 0, 0, 0);

      if (selectedDateObj > todayObj) {
        Alert.alert(
          'Cannot log future period',
          'You can only log periods for today or past dates. Please select a past date or today.',
        );
        return;
      }

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
    /* ===== Overall backgrounds ===== */
    backgroundColor: theme.background,              // Entire screen background behind calendar
    calendarBackground: theme.cardBackground,        // Calendar container background
  
    /* ===== Weekday labels (Mon, Tue, etc.) ===== */
    textSectionTitleColor: theme.textPrimary,      // Weekday text color
    textSectionTitleDisabledColor: theme.textPrimary + '60', // Disabled weekday text
  
    /* ===== Selected day ===== */
    selectedDayBackgroundColor: 'transparent',       // Disabled because customStyles handle selection
    selectedDayTextColor: accentColor,               // Text color for selected date
  
    /* ===== Today ===== */
    todayTextColor: (theme.mode as string) === 'dark'
      ? '#fbbf24'
      : '#92400e',                                   // Date number color for today
  
    /* ===== Default day text ===== */
    dayTextColor: theme.textPrimary,                 // Normal day number color
    textDisabledColor: theme.textSecondary + '40',   // Disabled dates (past/future)
  
    /* ===== Dots under dates ===== */
    dotColor: '#ec4899',                             // Default dot color
    selectedDotColor: accentColor,                   // Dot color on selected day
  
    /* ===== Navigation arrows ===== */
    arrowColor: accentColor,                         // Left/right month arrows
  
    /* ===== Month title ===== */
    monthTextColor: theme.textPrimary,               // "September 2026"
    textMonthFontFamily: 'Bold',
    textMonthFontWeight: '600',
    textMonthFontSize: 22,
  
    /* ===== Day numbers ===== */
    textDayFontFamily: 'Bold',
    textDayFontWeight: '500',
    textDayFontSize: 15,
    textDayColor: theme.textSecondary,
    // textSectionTitleColor: theme.textSecondary,
  
    /* ===== Weekday header text ===== */
    textDayHeaderFontFamily: 'Bold',
    textDayHeaderFontWeight: '600',
    textDayHeaderFontSize: 13,
    textDayHeaderColor: theme.textPrimary,
  
    /* ===== Calendar header layout (week row) ===== */
    'stylesheet.calendar.header': {
      week: {
        marginTop: 0,
        marginBottom: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 0,
        paddingVertical: 8,
        borderBottomWidth: 1,                         // Divider under weekday row
        borderBottomColor: (theme.mode as string) === 'dark'
          ? '#2a2a2a'
          : '#f0f0f0',
      },
      dayHeader: {
        width: '14.28%',                              // 7 equal columns
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor: `${theme.primary}10`,
        color: theme.textPrimary,
        textAlign: 'center',
        fontSize: 13,
        // fontWeight: '600',
        fontFamily: 'Bold',
      },
    },
  
    /* ===== Normal day cell ===== */
    'stylesheet.day.basic': {
      base: {
        width: '100%',
        height: 50,                                  // Cell height
        alignItems: 'flex-start',
        justifyContent: 'flex-end',                  // Date number bottom-left
        paddingHorizontal: 8,
        paddingVertical: 8,
        backgroundColor: theme.cardBackground,
      },
      text: {
        marginBottom: 4,
        fontSize: 16,
        fontWeight: '500',
        fontFamily: 'Bold',
      },
    },
  
    /* ===== Period day cell ===== */
    'stylesheet.day.period': {
      base: {
        width: '100%',
        height: 60,
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        paddingHorizontal: 8,
        paddingVertical: 8,
      },
      text: {
        marginBottom: 0,
        fontSize: 16,
        fontWeight: '700',                           // Stronger weight for period days
      },
    },
  } as any), [theme, accentColor]);

  // Create a unique key that changes when theme or accent color changes to force Calendar remount
  const calendarKey = useMemo(() => `${themeName}-${accentColor}`, [themeName, accentColor]);

  // Custom day component to show PNG images for period and ovulation
  // This component has access to all the parent scope variables
  const CustomDay = useCallback(({ date, state, marking }: any) => {
    const dateString = date?.dateString;
    if (!dateString) return null;
    
    const entry = entriesMap[dateString];
    const phase = calculatePhaseForDate(dateString, cycleState.profile, cycleState.entries);
    const isPeriod = entry?.isPeriod || false;
    const isOvulatory = phase === 'ovulatory' && !isPeriod;
    
    // Get the marked date styling from markedDates
    const markedDate = markedDates[dateString];
    const customStyles = markedDate?.customStyles || {};
    
    return (
      <TouchableOpacity
        style={[customStyles.container, { position: 'relative' }]}
        onPress={() => handleDayPress(date)}
        activeOpacity={0.7}
      >
        {/* Day number */}
        <Text style={customStyles.text}>{date.day}</Text>
        
        {/* Period image - top right */}
        {isPeriod && (
          <Image
            source={periodImage}
            style={dynamicStyles.dayImage}
            resizeMode="contain"
          />
        )}
        
        {/* Ovulation image - top right (only if not period) */}
        {isOvulatory && (
          <Image
            source={ovulationImage}
            style={dynamicStyles.dayImage}
            resizeMode="contain"
          />
        )}
      </TouchableOpacity>
    );
  }, [entriesMap, cycleState.profile, cycleState.entries, markedDates, dynamicStyles, handleDayPress]);

  return (
    <ScrollView style={[dynamicStyles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[dynamicStyles.header, { backgroundColor: theme.cardBackground }]}>
        <View style={dynamicStyles.headerTop}>
          <AppText variant='bold' style={[dynamicStyles.title, { color: theme.textPrimary }]}>Cycle Calendar</AppText>
          <NeuPressable
            onPress={() => setShowLegendModal(true)}
            backgroundColor={theme.cardBackground}
            shadowColor={accentColor}
            borderRadius={18}
            pressDepth={3}
            style={dynamicStyles.infoButtonWrapper}
            contentStyle={dynamicStyles.infoButtonContent}
          >
            <Info size={18} color={accentColor} />
          </NeuPressable>
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
          dayComponent={CustomDay}
          hideExtraDays={true}
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
        dayPrediction={dayPrediction}
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
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: (theme.mode as string) === 'dark' ? '#2a2a2a' : '#f0f0f0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
    letterSpacing: -0.5,
  },
  infoButtonWrapper: {
    position: 'absolute',
    right: 0,
   
  },
  infoButtonContent: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: addOpacityToHex(accentColor, 0.2),
    borderWidth: 1,
    borderRadius: 18,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.8,
    letterSpacing: 0.2,
  },
  calendarWrapper: {
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: theme.cardBackground,
  },
  calendar: {
    paddingHorizontal: 0,
  },
  dayImage: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
  },
});
