import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, Image } from 'react-native';
import { Droplets, Plus, X, Check } from 'lucide-react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/src/store';
import { addEntry, calculatePredictions, CycleEntry, deleteEntry, updateEntry } from '@/src/store/slices/cycleSlice';
import { phaseRecommendations } from '@/data/phaseRecommendation';
import AppText from '@/components/core-components/AppText';

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
  const cycleState = useSelector((state: RootState) => state.cycle);

  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().split('T')[0]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

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
            backgroundColor: '#f3f4f6', // light gray bg
          },
          text: {
            color: '#9ca3af', // gray text
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

        customStyles.text.color = '#1f2937';

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

      // Selected styling
      if (selectedDates.includes(dateString)) {
        customStyles.container.backgroundColor = '#a855f7';
        customStyles.container.borderColor = '#7c3aed';
        customStyles.container.borderWidth = 2;
        customStyles.text.color = '#fff';
        customStyles.text.fontWeight = '700';
      }

      // Markers for indicators
      const dots: any[] = [];
      if (isPeriod) {
        dots.push({ key: 'period', color: '#fff', selectedDotColor: '#fff' });
      }
      if (hasSymptoms) {
        dots.push({ key: 'symptoms', color: '#8b5cf6', selectedDotColor: '#8b5cf6' });
      }
      if (selectedDates.includes(dateString)) {
        dots.push({ key: 'selected', color: '#fff', selectedDotColor: '#fff' });
      }

      marked[dateString] = {
        customStyles,
        dots: dots.length > 0 ? dots : undefined,
        selected: selectedDates.includes(dateString),
      };
    }

    return marked;
  }, [currentMonth, cycleState.entries, cycleState.profile, selectedDates]);

  const handleDayPress = useCallback((day: DateData) => {
    const dateString = day.dateString;

    if (isMultiSelectMode) {
      setSelectedDates(prev =>
        prev.includes(dateString)
          ? prev.filter(d => d !== dateString)
          : [...prev, dateString]
      );
    } else {
      setSelectedDate(dateString);
      setSelectedDates([dateString]);
      setShowLogModal(true);
    }
  }, [isMultiSelectMode]);

  const logMultipleDates = useCallback((isPeriod: boolean) => {
    selectedDates.forEach(date => {
      dispatch(addEntry({
        date,
        isPeriod,
        symptoms: {
          mood: 3,
          cramps: isPeriod ? 2 : 0,
          energy: isPeriod ? 2 : 3,
        },
      }));
    });

    dispatch(calculatePredictions());
    setSelectedDates([]);
    setIsMultiSelectMode(false);
    setShowLogModal(false);
  }, [selectedDates, dispatch]);

  // Add this new function to unmark/delete periods
  // Add this new function to unmark/delete periods
  const unmarkPeriodDates = useCallback(() => {
    if (selectedDates.length === 0) return;

    selectedDates.forEach(date => {
      const entry = cycleState.entries.find(e => e.date === date && e.isPeriod);
      if (entry) {
        // Check if entry has symptoms
        const hasSymptoms = entry.symptoms &&
          Object.values(entry.symptoms).some(value => value !== undefined && value !== null);

        if (hasSymptoms) {
          // If entry has symptoms, just unmark period but keep symptoms
          dispatch(addEntry({
            date,
            isPeriod: false,
            symptoms: entry.symptoms,
          }));
        } else {
          // If entry only has period (no symptoms), delete it entirely
          dispatch(deleteEntry(date));
        }
      }
    });

    dispatch(calculatePredictions());
    setSelectedDates([]);
    setIsMultiSelectMode(false);
    setShowLogModal(false);
  }, [selectedDates, cycleState.entries, dispatch]);

  // Check if selected date is already a period
  const isDatePeriod = useMemo(() => {
    if (selectedDates.length === 0) return false;
    return selectedDates.some(date =>
      cycleState.entries.some(e => e.date === date && e.isPeriod)
    );
  }, [selectedDates, cycleState.entries]);

  const handleMonthChange = useCallback((month: any) => {
    setCurrentMonth(month.dateString);
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <AppText variant='bold' style={{ fontSize: 30, fontWeight: '400', textAlign: 'center', }}>Cycle Calendar</AppText>
        <Text style={styles.subtitle}>Track your period and symptoms</Text>
      </View>

      {/* Calendar Navigation */}
      <View style={styles.calendarWrapper}>
        <Calendar
          current={currentMonth}
          onMonthChange={handleMonthChange}
          markingType="custom"
          markedDates={markedDates}
          onDayPress={handleDayPress}
          firstDay={0}
          enableSwipeMonths={true}
          theme={{
            backgroundColor: '#fff',
            calendarBackground: '#fff',
            textSectionTitleColor: '#6b7280',
            textSectionTitleDisabledColor: '#d1d5db',
            selectedDayBackgroundColor: '#a855f7',
            selectedDayTextColor: '#fff',
            todayTextColor: '#92400e',
            dayTextColor: '#1f2937',
            textDisabledColor: '#9ca3af',
            dotColor: '#ec4899',
            selectedDotColor: '#fff',
            arrowColor: '#4b5563',
            monthTextColor: '#1f2937',
            textDayFontFamily: 'System',
            textDayFontWeight: '500',
            textDayFontSize: 16,
            textMonthFontFamily: 'System',
            textMonthFontWeight: '700',
            textMonthFontSize: 20,
            textDayHeaderFontFamily: 'System',
            textDayHeaderFontWeight: '600',
            textDayHeaderFontSize: 12,
            'stylesheet.calendar.header': {
              week: {
                marginTop: 5,
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingHorizontal: 8,
              },
            },
          }}
          style={styles.calendar}
        />
      </View>

      {/* Multi-Select Controls */}
      <View style={styles.multiSelectControls}>
        {!isMultiSelectMode ? (
          <TouchableOpacity
            onPress={() => setIsMultiSelectMode(true)}
            style={styles.multiSelectButton}
          >
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

              {/* Add unmark button - show if any selected dates are periods */}
              {selectedDates.some(date =>
                cycleState.entries.some(e => e.date === date && e.isPeriod)
              ) && (
                  <TouchableOpacity
                    onPress={() => unmarkPeriodDates()}
                    style={[styles.multiSelectActionButton, styles.unmarkPeriodButton]}
                    disabled={selectedDates.length === 0}
                  >
                    <X size={16} color="#fff" />
                    <Text style={styles.multiSelectActionText}>Unmark Period</Text>
                  </TouchableOpacity>
                )}

              <TouchableOpacity
                onPress={() => {
                  setIsMultiSelectMode(false);
                  setSelectedDates([]);
                }}
                style={styles.cancelButton}
              >
                <X size={16} color="#6b7280" />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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

        {/* Phase colors legend */}
        <Text style={[styles.legendTitle, { marginTop: 16 }]}>Phase Colors</Text>
        <View style={styles.legendItems}>
          {Object.entries(phaseRecommendations).map(([key, phase]) => (
            <View key={key} style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  {
                    backgroundColor: phase.color + '20',
                    borderWidth: 2,
                    borderColor: phase.color,
                  },
                ]}
              />
              <Text style={styles.legendText}>{phase.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Log Entry Modal */}
      {/* Log Entry Modal */}
      <Modal
        visible={showLogModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowLogModal(false);
          setSelectedDates([]);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedDate && new Date(selectedDate).toLocaleDateString()}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowLogModal(false);
                  setSelectedDates([]);
                }}
              >
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalOptions}>
              {isDatePeriod ? (
                // Show unmark option if already a period
                <>
                  <TouchableOpacity
                    style={[styles.modalOption, styles.deleteOption]}
                    onPress={() => unmarkPeriodDates()}
                  >
                    <X size={24} color="#dc2626" />
                    <Text style={[styles.modalOptionText, styles.deleteOptionText]}>
                      Unmark Period
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalOption}
                    onPress={() => logMultipleDates(false)}
                  >
                    <Plus size={24} color="#8b5cf6" />
                    <Text style={styles.modalOptionText}>Log Symptoms Only</Text>
                  </TouchableOpacity>
                </>
              ) : (
                // Show log options if not a period
                <>
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
                </>
              )}
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
    backgroundColor: '#FFF0F8',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 30,
    backgroundColor: '#fdf2f8',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ec4899',
    textAlign: 'center',
  },
  calendarWrapper: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  calendar: {
    borderRadius: 12,
  },
  multiSelectControls: {
    paddingHorizontal: 24,
    paddingVertical: 16,
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
    fontFamily: 'Bold',
    // fontWeight: '700',
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
    fontWeight: '600',
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
  unmarkPeriodButton: {
    backgroundColor: '#dc2626',
  },
  deleteOption: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  deleteOptionText: {
    color: '#dc2626',
  },
});