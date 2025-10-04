import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useCycle } from '@/contexts/CycleContext';
import { Droplets, Plus, X, Check, Chrome as Home } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface CalendarDay {
  date: string;
  day: number;
  isPeriod: boolean;
  hasSymptoms: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
}

export default function CalendarScreen() {
  const { state, dispatch } = useCycle();
  const router = useRouter();
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date().toISOString().split('T')[0];

    const days: CalendarDay[] = [];

    // Add previous month's trailing days
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dateString = currentDate.toISOString().split('T')[0];
      const entry = state.entries.find(e => e.date === dateString);
      
      days.push({
        date: dateString,
        day: currentDate.getDate(),
        isPeriod: entry?.isPeriod || false,
        hasSymptoms: !!entry?.symptoms,
        isToday: dateString === today,
        isCurrentMonth: currentDate.getMonth() === month,
      });
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  const toggleDateSelection = (date: string) => {
    if (isMultiSelectMode) {
      setSelectedDates(prev => 
        prev.includes(date) 
          ? prev.filter(d => d !== date)
          : [...prev, date]
      );
    } else {
      setSelectedDates([date]);
      setShowLogModal(true);
    }
  };

  const logMultipleDates = (isPeriod: boolean) => {
    selectedDates.forEach(date => {
      const newEntry = {
        date,
        isPeriod,
        symptoms: {
          mood: 3,
          cramps: isPeriod ? 2 : 0,
          energy: isPeriod ? 2 : 3,
        },
      };
      dispatch({ type: 'ADD_ENTRY', payload: newEntry });
    });
    
    setSelectedDates([]);
    setIsMultiSelectMode(false);
    setShowLogModal(false);
  };

  const startMultiSelect = () => {
    setIsMultiSelectMode(true);
    setSelectedDates([]);
  };

  const cancelMultiSelect = () => {
    setIsMultiSelectMode(false);
    setSelectedDates([]);
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.homeIconContainer}>
          <View style={styles.backToHomeButton}>
            <TouchableOpacity onPress={() => router.push('/')}>
              <Home size={20} color="#ec4899" />
            </TouchableOpacity>
            <Text style={styles.backToHomeText}>Home</Text>
          </View>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Cycle Calendar</Text>
          <Text style={styles.subtitle}>Track your period and symptoms</Text>
        </View>
      </View>

      {/* Calendar Navigation */}
      <View style={styles.calendarNav}>
        <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>
        
        <Text style={styles.monthTitle}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>
        
        <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Multi-Select Controls */}
      <View style={styles.multiSelectControls}>
        {!isMultiSelectMode ? (
          <TouchableOpacity onPress={startMultiSelect} style={styles.multiSelectButton}>
            <Plus size={16} color="#ec4899" />
            <Text style={styles.multiSelectButtonText}>Multi-Select Period Days</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.multiSelectActiveControls}>
            <Text style={styles.selectedCountText}>
              {selectedDates.length} day{selectedDates.length !== 1 ? 's' : ''} selected
            </Text>
            <View style={styles.multiSelectActions}>
              <TouchableOpacity 
                onPress={() => logMultipleDates(true)} 
                style={[styles.multiSelectActionButton, styles.logPeriodButton]}
                disabled={selectedDates.length === 0}
              >
                <Droplets size={16} color="#fff" />
                <Text style={styles.multiSelectActionText}>Log as Period</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={cancelMultiSelect} style={styles.cancelButton}>
                <X size={16} color="#6b7280" />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Week Days Header */}
      <View style={styles.weekHeader}>
        {weekDays.map((day, index) => (
          <View key={index} style={styles.weekDayContainer}>
            <Text style={styles.weekDay}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayCell,
              day.isToday && styles.todayCell,
              day.isPeriod && styles.periodCell,
              !day.isCurrentMonth && styles.otherMonthCell,
              selectedDates.includes(day.date) && styles.selectedCell,
            ]}
            onPress={() => toggleDateSelection(day.date)}
          >
            <Text style={[
              styles.dayText,
              day.isToday && styles.todayText,
              day.isPeriod && styles.periodText,
              !day.isCurrentMonth && styles.otherMonthText,
              selectedDates.includes(day.date) && styles.selectedText,
            ]}>
              {day.day}
            </Text>
            {selectedDates.includes(day.date) && (
              <View style={styles.selectedIndicator}>
                <Check size={8} color="#fff" />
              </View>
            )}
            {day.isPeriod && (
              <View style={styles.periodIndicator}>
                <Droplets size={8} color="#fff" />
              </View>
            )}
            {day.hasSymptoms && !day.isPeriod && (
              <View style={styles.symptomIndicator} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legend</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#ec4899' }]} />
            <Text style={styles.legendText}>Period</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#8b5cf6' }]} />
            <Text style={styles.legendText}>Symptoms logged</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#f59e0b', borderRadius: 2 }]} />
            <Text style={styles.legendText}>Today</Text>
          </View>
        </View>
      </View>

      {/* Log Entry Modal */}
      <Modal
        visible={showLogModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLogModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Log Entry for {selectedDates[0] && new Date(selectedDates[0]).toLocaleDateString()}
              </Text>
              <TouchableOpacity onPress={() => setShowLogModal(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalOptions}>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => logMultipleDates(true)}
              >
                <Droplets size={24} color="#ec4899" />
                <Text style={styles.modalOptionText}>Log Period Day</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => logMultipleDates(false)}
              >
                <Plus size={24} color="#8b5cf6" />
                <Text style={styles.modalOptionText}>Log Symptoms Only</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefefe',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 30,
    backgroundColor: '#fdf2f8',
  },
  homeIconContainer: {
    marginBottom: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  calendarNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  navButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4b5563',
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  multiSelectControls: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  multiSelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fce7f3',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3e8ff',
  },
  multiSelectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ec4899',
  },
  multiSelectActiveControls: {
    gap: 12,
  },
  selectedCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    textAlign: 'center',
  },
  multiSelectActions: {
    flexDirection: 'row',
    gap: 8,
  },
  multiSelectActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  logPeriodButton: {
    backgroundColor: '#ec4899',
  },
  multiSelectActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  weekHeader: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  weekDayContainer: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDay: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderRadius: 8,
    marginVertical: 2,
  },
  todayCell: {
    backgroundColor: '#fef3c7',
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  periodCell: {
    backgroundColor: '#ec4899',
  },
  otherMonthCell: {
    opacity: 0.3,
  },
  selectedCell: {
    backgroundColor: '#a855f7',
    borderWidth: 2,
    borderColor: '#7c3aed',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  todayText: {
    color: '#92400e',
    fontWeight: '700',
  },
  periodText: {
    color: '#fff',
    fontWeight: '700',
  },
  otherMonthText: {
    color: '#9ca3af',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '700',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#059669',
    borderRadius: 6,
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  symptomIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8b5cf6',
  },
  legend: {
    margin: 24,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  legendTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
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
    color: '#4b5563',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 20,
    padding: 24,
    minWidth: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
  },
  modalOptions: {
    gap: 16,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
});