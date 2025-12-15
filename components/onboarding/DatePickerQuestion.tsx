/**
 * Date Picker Question Component
 * 
 * Uses @react-native-community/datetimepicker for native date selection
 */

import React, { useState, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AppText from '@/components/core-components/AppText';
import { useTheme } from '@/src/context/ThemeContext';

interface DatePickerQuestionProps {
  title: string;
  subtitle?: string;
  value?: string; // ISO date string (YYYY-MM-DD)
  onChange: (date: string) => void;
  minimumDate?: Date;
  maximumDate?: Date;
}

export default function DatePickerQuestion({
  title,
  subtitle,
  value,
  onChange,
  minimumDate,
  maximumDate,
}: DatePickerQuestionProps) {
  const { theme, accentColor, themeName } = useTheme();
  
  // Default min/max dates
  const minDate = minimumDate || new Date(1950, 0, 1);
  const maxDate = maximumDate || new Date();
  
  // Parse current value
  const currentDate = useMemo(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    // Default to 25 years ago
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() - 25);
    return defaultDate;
  }, [value]);
  
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(currentDate);
  
  // Update selected date when value prop changes
  React.useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
      }
    }
  }, [value]);
  
  const handleDateChange = useCallback((event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (date) {
      // Ensure date is within min/max bounds
      if (date < minDate) {
        date = new Date(minDate);
      } else if (date > maxDate) {
        date = new Date(maxDate);
      }
      
      setSelectedDate(date);
      // Format as YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      onChange(`${year}-${month}-${day}`);
      
      if (Platform.OS === 'ios') {
        // On iOS, picker stays open, so we keep it visible
      }
    }
  }, [minDate, maxDate, onChange]);
  
  const formatDisplayDate = useCallback((date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }, []);
  
  const calculateAge = useCallback((date: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--;
    }
    return age;
  }, []);
  
  const age = calculateAge(selectedDate);
  const dynamicStyles = useMemo(() => createStyles(theme, accentColor), [theme, accentColor]);
  
  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <AppText style={[dynamicStyles.title, { color: theme.textPrimary }]}>
          {title}
        </AppText>
        {subtitle && (
          <AppText style={[dynamicStyles.subtitle, { color: theme.textSecondary }]}>
            {subtitle}
          </AppText>
        )}
      </View>
      
      <TouchableOpacity
        style={[
          dynamicStyles.inputContainer,
          { 
            backgroundColor: theme.cardBackground,
            borderColor: theme.border,
          },
        ]}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
      >
        <View style={dynamicStyles.inputContent}>
          <Text style={[dynamicStyles.inputText, { color: theme.textPrimary }]}>
            {formatDisplayDate(selectedDate)}
          </Text>
          {age > 0 && (
            <Text style={[dynamicStyles.ageText, { color: theme.textSecondary }]}>
              Age: {age} years
            </Text>
          )}
        </View>
      </TouchableOpacity>
      
      {showPicker && (
        Platform.OS === 'ios' ? (
          <View style={dynamicStyles.pickerModal}>
            <View style={[dynamicStyles.pickerHeader, { backgroundColor: theme.cardBackground }]}>
              <TouchableOpacity
                onPress={() => setShowPicker(false)}
                style={dynamicStyles.pickerButton}
              >
                <Text style={[dynamicStyles.pickerButtonText, { color: theme.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <View style={dynamicStyles.pickerHeaderTitle}>
                <Text style={[dynamicStyles.pickerHeaderText, { color: theme.textPrimary }]}>
                  Select Date
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowPicker(false)}
                style={dynamicStyles.pickerButton}
              >
                <Text style={[dynamicStyles.pickerButtonText, { color: accentColor }]}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>
            <View style={[dynamicStyles.pickerContainer, { backgroundColor: theme.cardBackground }]}>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={minDate}
                maximumDate={maxDate}
                textColor={theme.accent}
                themeVariant={'dark'}
                style={dynamicStyles.picker}
              />
            </View>
          </View>
        ) : (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="spinner"
            
            onChange={handleDateChange}
            textColor={"red"}
            themeVariant={'light'}
            accentColor='#2dd4bf'
            minimumDate={minDate}
            maximumDate={maxDate}
          />
        )
      )}
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const createStyles = (theme: any, accentColor: string) => StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  inputContainer: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    minHeight: 56,
    justifyContent: 'center',
  },
  inputContent: {
    gap: 4,
  },
  inputText: {
    fontSize: 18,
    fontWeight: '600',
  },
  ageText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  pickerModal: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.border,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  pickerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  pickerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pickerHeaderTitle: {
    flex: 1,
    alignItems: 'center',
  },
  pickerHeaderText: {
    fontSize: 18,
    fontWeight: '700',
  },
  pickerContainer: {
    paddingVertical: 8,
  },
  picker: {
    width: '100%',
  },
});
