/**
 * Numeric Input Question Component
 * 
 * For numeric inputs like weight, height, cycle length, period duration
 */

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import AppText from '@/components/core-components/AppText';
import { useTheme } from '@/src/context/ThemeContext';

interface NumericInputQuestionProps {
  title: string;
  subtitle?: string;
  value?: number | string;
  onChange: (value: number | undefined) => void;
  unit?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  decimal?: boolean;
  iconGraphic?: React.ReactNode;
}

export default function NumericInputQuestion({
  title,
  subtitle,
  value,
  onChange,
  unit,
  placeholder,
  min,
  max,
  iconGraphic,
  decimal = false,
}: NumericInputQuestionProps) {
  const { theme, accentColor } = useTheme();
  const [textValue, setTextValue] = useState<string>(
    value !== undefined && value !== null ? String(value) : ''
  );

  const dynamicStyles = useMemo(() => createStyles(theme, accentColor), [theme, accentColor]);

  const handleTextChange = (text: string) => {
    // Allow empty string, numbers, and decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');

    // Only allow one decimal point
    const parts = cleaned.split('.');
    const formatted = parts.length > 2
      ? parts[0] + '.' + parts.slice(1).join('')
      : cleaned;

    setTextValue(formatted);

    // Convert to number if valid
    if (formatted === '' || formatted === '.') {
      onChange(undefined);
      return;
    }

    const numValue = decimal ? parseFloat(formatted) : parseInt(formatted, 10);

    if (!isNaN(numValue)) {
      // Apply min/max constraints
      let finalValue = numValue;
      if (min !== undefined && finalValue < min) finalValue = min;
      if (max !== undefined && finalValue > max) finalValue = max;

      onChange(finalValue);
    } else {
      onChange(undefined);
    }
  };

  const handleBlur = () => {
    // Validate and format on blur
    if (textValue === '' || textValue === '.') {
      setTextValue('');
      onChange(undefined);
      return;
    }

    const numValue = decimal ? parseFloat(textValue) : parseInt(textValue, 10);

    if (!isNaN(numValue)) {
      // Apply min/max constraints
      let finalValue = numValue;
      if (min !== undefined && finalValue < min) finalValue = min;
      if (max !== undefined && finalValue > max) finalValue = max;

      // Format the display value
      setTextValue(decimal ? finalValue.toFixed(1) : String(finalValue));
      onChange(finalValue);
    } else {
      setTextValue('');
      onChange(undefined);
    }
  };

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>

        {iconGraphic && (
          <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 10, }}>
            <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: theme.cardBackground, borderRadius: 16, padding: 16, borderWidth: 2, borderColor: theme.border }}>
              {iconGraphic}
            </View>
          </View>
        )}

        <AppText style={[dynamicStyles.title, { color: theme.textPrimary }]}>{title}</AppText>
        {subtitle && <AppText style={[dynamicStyles.subtitle, { color: theme.textSecondary }]}>{subtitle}</AppText>}
      </View>

      <View style={dynamicStyles.inputContainer}>
        <View
          style={[
            dynamicStyles.inputWrapper,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
              shadowColor: accentColor,
            },
          ]}
        >
          <TextInput
            style={[dynamicStyles.input, { color: theme.textPrimary }]}
            value={textValue}
            onChangeText={handleTextChange}
            onBlur={handleBlur}
            placeholder={placeholder || 'Enter value'}
            placeholderTextColor={theme.textSecondary}
            keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
            returnKeyType="done"
          />
          {unit && (
            <AppText style={[dynamicStyles.unit, { color: theme.textSecondary }]}>{unit}</AppText>
          )}
        </View>
        {(min !== undefined || max !== undefined) && (
          <AppText style={[dynamicStyles.hint, { color: theme.textSecondary }]}>
            {min !== undefined && max !== undefined
              ? `Range: ${min}${unit || ''} - ${max}${unit || ''}`
              : min !== undefined
                ? `Minimum: ${min}${unit || ''}`
                : `Maximum: ${max}${unit || ''}`
            }
          </AppText>
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    padding: 0,
  },
  unit: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  hint: {
    fontSize: 12,
    marginLeft: 4,
  },
});

