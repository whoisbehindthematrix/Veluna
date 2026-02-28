import React, { useMemo, useState, useCallback } from 'react';
import { View, Dimensions, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WeekCalendar, CalendarProvider } from 'react-native-calendars';
import type { DateData } from 'react-native-calendars';
import { useSelector } from 'react-redux';
import type { RootState } from '@/src/store';
import { phaseRecommendations } from '@/data/phaseRecommendation';
import { useTheme } from '@/src/context/ThemeContext';
// Tooltip will be shown via custom overlay


type Phase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

function toISO(d: Date) {
  // Use local time components to avoid timezone issues
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfWeek(d: Date, firstDay = 0) {
  const day = d.getDay();
  const diff = (day < firstDay ? 7 : 0) + day - firstDay;
  const s = new Date(d);
  s.setDate(d.getDate() - diff);
  return new Date(s.getFullYear(), s.getMonth(), s.getDate());
}

export default function WeekPhaseStrip({
  firstDay = 0,
  onDayPress
}: {
  firstDay?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  onDayPress?: (d: DateData) => void;
}) {
  const cycle = useSelector((s: RootState) => s.cycle);
  const { theme, accentColor } = useTheme();

  // State for calendar width and current date (use Dimensions fallback so dates render on first paint)
  const { width: screenWidth } = Dimensions.get('window');
  const [calendarWidth, setCalendarWidth] = useState<number>(() => Math.max(280, screenWidth - 48));
  const [currentDate, setCurrentDate] = useState(toISO(new Date()));
  const [tooltipDate, setTooltipDate] = useState<string | null>(null);
  const monthYear = useMemo(() => {
    // Parse date string (YYYY-MM-DD) as local time to avoid timezone issues
    const [year, month, day] = currentDate.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleString(undefined, { month: 'long', year: 'numeric' });
  }, [currentDate]);
  // Calculate calendar width from container
  const handleLayout = useCallback((event: any) => {
    const { width } = event.nativeEvent.layout;
    setCalendarWidth(width);
  }, []);

  // Get week dates based on current date
  const getWeekDates = useCallback((dateString: string) => {
    // Parse date string (YYYY-MM-DD) as local time to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const start = startOfWeek(date, firstDay);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return toISO(d);
    });
  }, [firstDay]);

  function getPhaseForDate(dateISO: string): Phase {
    const { averageCycleLength, periodDuration, lastPeriodStart } = cycle.profile;
    const lastPeriod = lastPeriodStart ||
      cycle.entries.filter(e => e.isPeriod)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date;

    if (!lastPeriod) return 'follicular';

    // Parse dates as local time to avoid timezone issues
    const [lastYear, lastMonth, lastDay] = lastPeriod.split('-').map(Number);
    const [targetYear, targetMonth, targetDay] = dateISO.split('-').map(Number);
    const a = new Date(lastYear, lastMonth - 1, lastDay);
    const b = new Date(targetYear, targetMonth - 1, targetDay);
    const daysSince = Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
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

  // Get cycle day for a date
  function getCycleDay(dateISO: string): number {
    const { averageCycleLength, lastPeriodStart } = cycle.profile;
    const lastPeriod = lastPeriodStart ||
      cycle.entries.filter(e => e.isPeriod)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date;

    if (!lastPeriod) return 1;

    const [lastYear, lastMonth, lastDay] = lastPeriod.split('-').map(Number);
    const [targetYear, targetMonth, targetDay] = dateISO.split('-').map(Number);
    const a = new Date(lastYear, lastMonth - 1, lastDay);
    const b = new Date(targetYear, targetMonth - 1, targetDay);
    const daysSince = Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
    let cycleDay = daysSince + 1;

    if (cycleDay <= 0) {
      cycleDay = ((cycleDay % averageCycleLength) + averageCycleLength) % averageCycleLength + 1;
    }
    if (cycleDay > averageCycleLength) {
      cycleDay = ((cycleDay - 1) % averageCycleLength) + 1;
    }

    return cycleDay;
  }

  const todayISO = useMemo(() => toISO(new Date()), []);

  // Generate tooltip content for a date
  const getTooltipContent = useCallback((dateISO: string) => {
    const entry = cycle.entries.find(e => e.date === dateISO);
    const phase = getPhaseForDate(dateISO);
    const cycleDay = getCycleDay(dateISO);
    const phaseInfo = phaseRecommendations[phase];
    const isPeriod = !!entry?.isPeriod;
    const isToday = dateISO === todayISO;

    const [year, month, day] = dateISO.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    const parts: string[] = [];

    if (isToday) {
      parts.push('📅 Today');
    }

    parts.push(`Day ${cycleDay} of cycle`);
    parts.push(`Phase: ${phaseInfo?.name || phase}`);

    if (isPeriod) {
      parts.push(`🩸 Period day`);
      if (entry?.flowIntensity) {
        parts.push(`Flow: ${entry.flowIntensity}`);
      }
    }

    if (entry?.symptoms) {
      const symptomList: string[] = [];
      if (entry.symptoms.mood) symptomList.push(`Mood: ${entry.symptoms.mood}/5`);
      if (entry.symptoms.cramps) symptomList.push(`Cramps: ${entry.symptoms.cramps}/5`);
      if (entry.symptoms.energy) symptomList.push(`Energy: ${entry.symptoms.energy}/5`);
      if (entry.symptoms.bloating) symptomList.push(`Bloating: ${entry.symptoms.bloating}/5`);
      if (entry.symptoms.headache) symptomList.push(`Headache: ${entry.symptoms.headache}/5`);
      if (entry.symptoms.breastTenderness) symptomList.push(`Breast tenderness: ${entry.symptoms.breastTenderness}/5`);
      
      if (symptomList.length > 0) {
        parts.push('Symptoms:');
        parts.push(...symptomList);
      }
    }

    if (entry?.notes) {
      parts.push(`Note: ${entry.notes}`);
    }

    return parts.join('\n');
  }, [cycle.entries, cycle.profile, todayISO, getPhaseForDate, getCycleDay]);

  // Recalculate marked dates when current date changes
  const marked = useMemo(() => {
    const todayISO = toISO(new Date());
    const weekDates = getWeekDates(currentDate);
    const obj: any = {};
  
    for (const d of weekDates) {
      const entry = cycle.entries.find(e => e.date === d);
      const phase = getPhaseForDate(d);
      const phaseColor = phaseRecommendations[phase]?.color ?? '#6b7280';
  
      const isToday = d === todayISO;
      const isPeriod = !!entry?.isPeriod;
  
      // Period days override phase color
      const containerBg = isPeriod ? '#e42a50' : phaseColor + '40';
      const textColor = isPeriod ? '#ffffff' : phaseColor;
  
      // Base container style
      let containerStyle: any = {
        backgroundColor: containerBg,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      };
      
      // Add border for today's date to make it more visible
      if (isToday) {
        containerStyle.borderWidth = 2;
        containerStyle.borderColor = phaseRecommendations[getPhaseForDate(d)]?.color ?? '#6b7280';
      }
  
      // If ovulatory phase → add a small dot indicator
      let dotStyle: any = {};
      if (phase === 'ovulatory') {
        dotStyle = {
          position: 'absolute',
          bottom: 4,
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: phaseColor,
          shadowColor: phaseColor,
          shadowOpacity: 0.5,
          shadowRadius: 4,
          elevation: 2,
        };
      }
  
      obj[d] = {
        customStyles: {
          container: containerStyle,
          text: {
            color: textColor,
            fontSize: 14,
            fontWeight: isToday ? '800' : '700',
          },
          // Dot element rendered by WeekCalendar’s custom style prop
          dot: dotStyle,
        },
        selected: isToday,
      };
    }
    return obj;
  }, [currentDate, cycle.profile, cycle.entries, getWeekDates, accentColor]);
  

  // Handle date change when scrolling
  const handleDateChanged = useCallback((date: string) => {
    setCurrentDate(date);
  }, []);

  // Create calendar theme with theme colors (dayTextColor critical for date numbers to show)
  const calendarTheme = useMemo(() => ({
    calendarBackground: 'transparent',
    textSectionTitleColor: theme.textSecondary,
    dayTextColor: theme.textPrimary, // Required: ensures date numbers are visible
    arrowColor: theme.textPrimary,
    todayTextColor: theme.textPrimary,
    textDayFontSize: 14,
    textDayFontWeight: '700' as const,
    textMonthFontWeight: '800' as const,
    textDayHeaderFontWeight: '700' as const,
  }), [theme]);

  // Handle day long press to show tooltip
  const handleDayLongPress = useCallback((day: DateData) => {
    setTooltipDate(day.dateString);
  }, []);

  // Enhanced onDayPress that also handles tooltip
  const handleDayPress = useCallback((day: DateData) => {
    onDayPress?.(day);
  }, [onDayPress]);

  return (
    <View
      style={[styles.container, {
        backgroundColor: theme.cardBackground,
      }]}
      onLayout={handleLayout}
    >
      {/* <View style={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 0 }}>
        <Text style={{ textAlign: 'center', fontSize: 13, fontWeight: '700', color: theme.textSecondary }}>
          {monthYear}
        </Text>
      </View> */}
      <CalendarProvider
        date={todayISO}
        onDateChanged={handleDateChanged}
      >
        <WeekCalendar
          key={calendarWidth} // Force re-render when width changes
          current={currentDate}
          firstDay={firstDay}
          calendarWidth={calendarWidth} // Critical for alignment
          markingType="custom"
          markedDates={marked}
          allowShadow={false}
          onDayPress={(day) => {
            handleDayPress(day);
            // Show tooltip on press (you can change this to long press if needed)
            setTooltipDate(day.dateString);
            // Auto-hide after 3 seconds
            setTimeout(() => setTooltipDate(null), 3000);
          }}
          theme={calendarTheme}
          style={styles.calendar}
        />
      </CalendarProvider>

      {/* Custom Tooltip Overlay */}
      {tooltipDate && (
        <View style={styles.tooltipOverlay}>
          <View style={[styles.tooltipContainer, { 
            backgroundColor: theme.cardBackground,
            borderColor: theme.border,
            shadowColor: accentColor,
          }]}>
            <Text style={[styles.tooltipText, { color: theme.textPrimary }]}>
              {getTooltipContent(tooltipDate)}
            </Text>
            <TouchableOpacity
              style={styles.tooltipClose}
              onPress={() => setTooltipDate(null)}
            >
              <Text style={[styles.tooltipCloseText, { color: theme.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// DYNAMIC STYLES (Theme-aware)
// ============================================================================

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 12,
    position: 'relative',
  },
  calendar: {
    borderRadius: 12,
  },
  tooltipOverlay: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  tooltipContainer: {
    padding: 14,
    borderRadius: 12,
    maxWidth: 280,
    minWidth: 200,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  tooltipText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  tooltipClose: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  tooltipCloseText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
