import React, { useMemo, useState, useCallback } from 'react';
import { View, Dimensions, Text } from 'react-native';
import { WeekCalendar, CalendarProvider, DateObject } from 'react-native-calendars';
import { useSelector } from 'react-redux';
import type { RootState } from '@/src/store';
import { phaseRecommendations } from '@/data/phaseRecommendation';

type Phase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

function toISO(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().split('T')[0];
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
  onDayPress?: (d: DateObject) => void;
}) {
  const cycle = useSelector((s: RootState) => s.cycle);

  // State for calendar width and current date
  const [calendarWidth, setCalendarWidth] = useState<number>();
  const [currentDate, setCurrentDate] = useState(toISO(new Date()));
  const monthYear = useMemo(() => {
    const d = new Date(currentDate);
    return d.toLocaleString(undefined, { month: 'long', year: 'numeric' });
  }, [currentDate]);
  // Calculate calendar width from container
  const handleLayout = useCallback((event: any) => {
    const { width } = event.nativeEvent.layout;
    setCalendarWidth(width);
  }, []);

  // Get week dates based on current date
  const getWeekDates = useCallback((dateString: string) => {
    const date = new Date(dateString);
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

    const a = new Date(lastPeriod);
    const b = new Date(dateISO);
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
            fontWeight: isToday ? '800' : '700',
          },
          // Dot element rendered by WeekCalendar’s custom style prop
          dot: dotStyle,
        },
        selected: isToday,
      };
    }
    return obj;
  }, [currentDate, cycle.profile, cycle.entries, getWeekDates]);
  

  // Handle date change when scrolling
  const handleDateChanged = useCallback((date: string) => {
    setCurrentDate(date);
  }, []);

  const todayISO = toISO(new Date());

  return (
    <View
      style={{ marginHorizontal: 20, marginTop: 8, marginBottom: 16, backgroundColor: '#f1f1f2', borderRadius: 12 }}
      onLayout={handleLayout}
    >
      {/* <View style={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 0 }}>
        <Text style={{ textAlign: 'center', fontSize: 13, fontWeight: '700', color: '#6b7280' }}>
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
          onDayPress={onDayPress}
          theme={{
            calendarBackground: 'transparent',
            textSectionTitleColor: '#6b7280',
            arrowColor: '#111827',
            todayTextColor: '#111827',
            textDayFontWeight: '700',
            textMonthFontWeight: '800',
            textDayHeaderFontWeight: '700',
          }}
          style={{ borderRadius: 12, }}
        />
      </CalendarProvider>
    </View>
  );
}
