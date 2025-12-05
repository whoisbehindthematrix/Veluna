/**
 * Question Section Component
 * 
 * Reusable component for displaying questions with different input types
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AppText from '@/components/core-components/AppText';
import { useTheme } from '@/src/context/ThemeContext';

interface Option {
  value: string;
  label: string;
  description?: string;
}

interface QuestionSectionProps {
  title: string;
  subtitle?: string;
  options: Option[];
  selectedValues: string[];
  onSelect: (value: string) => void;
  multiSelect?: boolean;
  maxSelections?: number;
}

export default function QuestionSection({
  title,
  subtitle,
  options,
  selectedValues,
  onSelect,
  multiSelect = false,
  maxSelections,
}: QuestionSectionProps) {
  const { theme, accentColor } = useTheme();
  const dynamicStyles = useMemo(() => createStyles(theme, accentColor), [theme, accentColor]);
  
  const handleSelect = (value: string) => {
    if (multiSelect) {
      if (selectedValues.includes(value)) {
        onSelect(value); // Deselect
      } else {
        // Check max selections
        if (maxSelections && selectedValues.length >= maxSelections) {
          // If max reached, show message or prevent selection
          return;
        }
        onSelect(value); // Select
      }
    } else {
      if (selectedValues.includes(value)) {
        // Single select - deselect if already selected
        return;
      }
      onSelect(value); // Select (replace previous)
    }
  };

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <AppText style={[dynamicStyles.title, { color: theme.textPrimary }]}>{title}</AppText>
        {subtitle && <AppText style={[dynamicStyles.subtitle, { color: theme.textSecondary }]}>{subtitle}</AppText>}
        {maxSelections && multiSelect && (
          <AppText style={[dynamicStyles.maxSelectionHint, { color: accentColor }]}>
            Select up to {maxSelections} ({(maxSelections - selectedValues.length)} remaining)
          </AppText>
        )}
      </View>

      <View style={dynamicStyles.optionsContainer}>
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                dynamicStyles.option,
                { 
                  backgroundColor: theme.cardBackground,
                  borderColor: isSelected ? accentColor : theme.border,
                },
                isSelected && {
                  // backgroundColor: `${accentColor}30`,
                  borderColor: accentColor,
                  shadowColor: accentColor,
                },
              ]}
              onPress={() => handleSelect(option.value)}
              activeOpacity={0.7}
            >
              <View style={dynamicStyles.optionContent}>
                <AppText style={[
                  dynamicStyles.optionLabel,
                  { color: isSelected ? accentColor : theme.textPrimary },
                ]}>
                  {option.label}
                </AppText>
                {option.description && (
                  <AppText style={[
                    dynamicStyles.optionDescription,
                    { color: isSelected ? theme.textSecondary : theme.textSecondary },
                  ]}>
                    {option.description}
                  </AppText>
                )}
              </View>
              {isSelected && (
                <View style={[dynamicStyles.checkmark, { backgroundColor: accentColor }]}>
                  <Text style={dynamicStyles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
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
  maxSelectionHint: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    minHeight: 60,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

