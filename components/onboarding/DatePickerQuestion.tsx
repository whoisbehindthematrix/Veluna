/**
 * Date Picker Question Component
 * 
 * For date of birth selection
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import AppText from '@/components/core-components/AppText';
import { useTheme } from '@/src/context/ThemeContext';

interface DatePickerQuestionProps {
  title: string;
  subtitle?: string;
  value?: string; // ISO date string
  onChange: (date: string) => void;
  maximumDate?: Date;
  minimumDate?: Date;
}

export default function DatePickerQuestion({
  title,
  subtitle,
  value,
  onChange,
  maximumDate,
  minimumDate,
}: DatePickerQuestionProps) {
  const { theme, accentColor } = useTheme();
  const [dateString, setDateString] = useState<string>(
    value || ''
  );
  
  const dynamicStyles = useMemo(() => createStyles(theme, accentColor), [theme, accentColor]);

  const handleDateChange = (text: string) => {
    // Format: YYYY-MM-DD
    const formatted = text.replace(/[^0-9-]/g, '');
    if (formatted.length <= 10) {
      setDateString(formatted);
      if (formatted.length === 10) {
        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateRegex.test(formatted)) {
          onChange(formatted);
        }
      }
    }
  };

  const calculateAge = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 10) return null;
    try {
      const date = new Date(dateStr);
      const today = new Date();
      let age = today.getFullYear() - date.getFullYear();
      const monthDiff = today.getMonth() - date.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
        age--;
      }
      return age;
    } catch {
      return null;
    }
  };

  const age = calculateAge(dateString);

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <AppText style={[dynamicStyles.title, { color: theme.textPrimary }]}>{title}</AppText>
        {subtitle && <AppText style={[dynamicStyles.subtitle, { color: theme.textSecondary }]}>{subtitle}</AppText>}
      </View>

      <View style={dynamicStyles.inputContainer}>
        <TextInput
          style={[dynamicStyles.input, { 
            backgroundColor: theme.cardBackground,
            borderColor: theme.border,
            color: theme.textPrimary,
          }]}
          value={dateString}
          onChangeText={handleDateChange}
          placeholder="YYYY-MM-DD (e.g., 1995-05-15)"
          placeholderTextColor={theme.textSecondary}
          keyboardType="numeric"
          maxLength={10}
        />
        {age !== null && (
          <Text style={[dynamicStyles.ageText, { color: theme.textSecondary }]}>Age: {age} years</Text>
        )}
      </View>
    </View>
  );
}

// ============================================================================
// DYNAMIC STYLES (Theme-aware)
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
    fontFamily: 'Bold',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  inputContainer: {
    gap: 8,
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: '600',
    shadowColor: accentColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  ageText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});

