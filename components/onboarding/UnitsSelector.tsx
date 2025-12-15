/** * Units System Selector Component
 * * Selects metric or imperial units and displays a corresponding visual guide.
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import AppText from '@/components/core-components/AppText';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface UnitsSelectorProps {
  value?: 'metric' | 'imperial';
  onChange: (value: 'metric' | 'imperial') => void;
}

export default function UnitsSelector({ value = 'metric', onChange }: UnitsSelectorProps) {
  const { theme, accentColor } = useTheme();
  const styles = useMemo(() => createStyles(theme, accentColor), [theme, accentColor]);

  // --- Render Graphic Card ---
  const renderInfoGraphic = () => {
    const isMetric = value === 'metric';
    
    return (
      <View style={[styles.graphicContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        
        {/* Visual Header (Icon + Title) */}
        <View style={styles.graphicHeader}>
          <View style={[styles.iconBadge, { backgroundColor: `${accentColor}15` }]}>
            <Ionicons 
              name={isMetric ? "resize" : "construct"} 
              size={24} 
              color={accentColor} 
            />
          </View>
          <View style={styles.graphicHeaderText}>
            <AppText style={[styles.graphicTitle, { color: theme.textPrimary }]}>
              {isMetric ? "International System" : "US Customary System"}
            </AppText>
            <AppText style={[styles.graphicSubtitle, { color: theme.textSecondary }]}>
              {isMetric ? "Used globally for science & daily life" : "Used primarily in the United States"}
            </AppText>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        {/* Visual Comparison (The "Graphic") */}
        <View style={styles.comparisonRow}>
          {/* Height Visual */}
          <View style={styles.measurementBox}>
            <Ionicons name="body-outline" size={20} color={theme.textSecondary} style={{ marginBottom: 4 }} />
            <AppText style={[styles.measurementValue, { color: theme.textPrimary }]}>
              {isMetric ? "175" : "5' 9\""}
            </AppText>
            <AppText style={[styles.measurementUnit, { color: accentColor }]}>
              {isMetric ? "cm" : "ft/in"}
            </AppText>
          </View>

          {/* Separator Line */}
          <View style={[styles.verticalLine, { backgroundColor: theme.border }]} />

          {/* Weight Visual */}
          <View style={styles.measurementBox}>
            <Ionicons name="speedometer-outline" size={20} color={theme.textSecondary} style={{ marginBottom: 4 }} />
            <AppText style={[styles.measurementValue, { color: theme.textPrimary }]}>
              {isMetric ? "70.5" : "155"}
            </AppText>
            <AppText style={[styles.measurementUnit, { color: accentColor }]}>
              {isMetric ? "kg" : "lbs"}
            </AppText>
          </View>
        </View>

      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppText style={[styles.label, { color: theme.textSecondary }]}>Choose Units System Type </AppText>
      
      {/* Selector Buttons */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[
            styles.option,
            { 
              backgroundColor: theme.cardBackground,
              borderColor: value === 'metric' ? accentColor : theme.border,
            },
            value === 'metric' && {
              backgroundColor: `${accentColor}10`, // Very subtle tint
            },
          ]}
          onPress={() => onChange('metric')}
          activeOpacity={0.7}
        >
          <AppText style={[
            styles.optionLabel,
            { color: value === 'metric' ? accentColor : theme.textPrimary },
          ]}>
            Metric
          </AppText>
          <AppText style={[styles.optionDescription, { color: theme.textSecondary }]}>
            kg, cm
          </AppText>
          {value === 'metric' && (
            <View style={[styles.checkmark, { backgroundColor: accentColor }]}>
              <Ionicons name="checkmark" size={12} color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.option,
            { 
              backgroundColor: theme.cardBackground,
              borderColor: value === 'imperial' ? accentColor : theme.border,
            },
            value === 'imperial' && {
              backgroundColor: `${accentColor}10`,
            },
          ]}
          onPress={() => onChange('imperial')}
          activeOpacity={0.7}
        >
          <AppText style={[
            styles.optionLabel,
            { color: value === 'imperial' ? accentColor : theme.textPrimary },
          ]}>
            Imperial
          </AppText>
          <AppText style={[styles.optionDescription, { color: theme.textSecondary }]}>
            lbs, ft/in
          </AppText>
          {value === 'imperial' && (
            <View style={[styles.checkmark, { backgroundColor: accentColor }]}>
              <Ionicons name="checkmark" size={12} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* The Info Graphic Section */}
      {renderInfoGraphic()}

    </View>
  );
}

// ============================================================================
// DYNAMIC STYLES
// ============================================================================

const createStyles = (theme: any, accentColor: string) => StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16, // Space between buttons and graphic
  },
  option: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    minHeight: 80,
    justifyContent: 'center',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
  },
  checkmark: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Graphic Panel Styles
  graphicContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
  },
  graphicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  graphicHeaderText: {
    flex: 1,
  },
  graphicTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  graphicSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 16,
    opacity: 0.5,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  measurementBox: {
    alignItems: 'center',
    flex: 1,
  },
  verticalLine: {
    width: 1,
    height: 40,
    opacity: 0.5,
  },
  measurementValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  measurementUnit: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});