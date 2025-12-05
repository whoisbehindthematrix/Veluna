import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import HormoneChart from '../components/HormoneChart';
import { estimateHormonesForCycle } from '../lib/hormoneEngine';
import AppButton from '@/components/core-components/Button';
import AppText from '@/components/core-components/AppText';
import { useTheme } from '@/src/context/ThemeContext';

export default function HormoneChartScreen() {
  const { mock } = useApp();
  const { theme, accentColor } = useTheme();
  const [range, setRange] = useState<'1y'|'6m'|'4m'|'1m'|'this'>('1m');
  const [hormone, setHormone] = useState<'all'|'estrogen'|'progesterone'|'lh'|'fsh'>('all');
  const todayISO = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayISO);
  
  const dynamicStyles = useMemo(() => createStyles(theme, accentColor), [theme, accentColor]);

  const data = useMemo(() => {
    // build concatenated estimates from cycles within the selected range
    const now = new Date();
    const from = new Date(now);
    if (range === '1y') from.setMonth(from.getMonth() - 12);
    else if (range === '6m') from.setMonth(from.getMonth() - 6);
    else if (range === '4m') from.setMonth(from.getMonth() - 4);
    else if (range === '1m') from.setMonth(from.getMonth() - 1);
    else { // 'this' month
      from.setDate(1);
    }

    const fromISO = from.toISOString().split('T')[0];
    const series = mock.cycles
      .map(c => estimateHormonesForCycle(c.startDate, c.length || 28))
      .flat()
      .filter(e => e.date >= fromISO && e.date <= todayISO)
      .sort((a, b) => (a.date > b.date ? 1 : -1));
    return series.length > 0 ? series : estimateHormonesForCycle(mock.cycles[mock.cycles.length - 1].startDate, mock.cycles[mock.cycles.length - 1].length || 28);
  }, [mock.cycles, range]);

  const todayValues = useMemo(() => {
    const t = data.find(d => d.date === selectedDate) || data[data.length - 1];
    return t;
  }, [data, selectedDate]);

  return (
    <ScrollView style={[dynamicStyles.container, { backgroundColor: theme.background }]}>
      <View style={dynamicStyles.content}>
        {/* Header */}
        <View style={dynamicStyles.header}>
           <AppText variant="bold" style={[dynamicStyles.title, { color: theme.textPrimary }]}>
            Hormone Cycle Dynamics
           </AppText>
          <Text style={[dynamicStyles.subtitle, { color: theme.textSecondary }]}>
            Track your hormonal patterns over time
          </Text>
        </View>

        {/* Range Filter Chips */}
        <View style={dynamicStyles.filterSection}>
          <Text style={[dynamicStyles.filterLabel, { color: theme.textPrimary }]}>
            Time Range
          </Text>
          <View style={dynamicStyles.chipContainer}>
            {([
              { k: '1y', label: '1Y' },
              { k: '6m', label: '6M' },
              { k: '4m', label: '4M' },
              { k: '1m', label: '1M' },
              { k: 'this', label: 'Today' },
            ] as { k: typeof range; label: string }[]).map(opt => (
              <TouchableOpacity 
                key={opt.k} 
                onPress={() => setRange(opt.k)} 
                style={[dynamicStyles.rangeChip, {
                  backgroundColor: range === opt.k ? accentColor : theme.primarySoft,
                  shadowColor: range === opt.k ? accentColor : '#000',
                  shadowOpacity: range === opt.k ? 0.3 : 0.1,
                  elevation: range === opt.k ? 4 : 2,
                }]}
              >
                <Text style={[dynamicStyles.chipText, {
                  color: range === opt.k ? '#fff' : theme.textSecondary,
                }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Hormone Filter Chips */}
        <View style={dynamicStyles.filterSection}>
          <Text style={[dynamicStyles.filterLabel, { color: theme.textPrimary }]}>
            Hormone Filter
          </Text>
          <View style={dynamicStyles.hormoneChipContainer}>
            {([
              { k: 'all', label: 'ALL' },
              { k: 'estrogen', label: 'EST' },
              { k: 'progesterone', label: 'PROG' },
              { k: 'lh', label: 'LH' },
              { k: 'fsh', label: 'FSH' },
            ] as { k: typeof hormone; label: string }[]).map(opt => (
              <TouchableOpacity 
                key={opt.k} 
                onPress={() => setHormone(opt.k)} 
                style={[dynamicStyles.hormoneChip, {
                  backgroundColor: hormone === opt.k ? accentColor : theme.primarySoft,
                  borderColor: hormone === opt.k ? accentColor : theme.border,
                }]}
              >
                <Text style={[dynamicStyles.chipText, {
                  color: hormone === opt.k ? '#fff' : theme.textSecondary,
                }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Chart */}
        <View style={[dynamicStyles.chartCard, {
          backgroundColor: theme.cardBackground,
          // shadowColor: accentColor,
        }]}>
          <HormoneChart data={data} selectedDate={selectedDate} hormone={hormone} onDateChange={setSelectedDate} />
        </View>

        {/* Selected Date Values */}
        {todayValues && (
          <View style={[dynamicStyles.valuesCard, {
            backgroundColor: theme.cardBackground,
          }]}>
            <Text style={[dynamicStyles.valuesTitle, { color: theme.textPrimary }]}>
              Selected Date: {todayValues.date}
            </Text>
            <View style={dynamicStyles.valuesList}>
              <View style={[dynamicStyles.valueRow, { borderBottomColor: theme.border }]}>
                <Text style={[dynamicStyles.valueLabel, { color: '#10b981' }]}>Estrogen</Text>
                <Text style={[dynamicStyles.valueText, { color: theme.textPrimary }]}>{Math.round(todayValues.estrogen)} pg/mL</Text>
              </View>
              <View style={[dynamicStyles.valueRow, { borderBottomColor: theme.border }]}>
                <Text style={[dynamicStyles.valueLabel, { color: '#3b82f6' }]}>Progesterone</Text>
                <Text style={[dynamicStyles.valueText, { color: theme.textPrimary }]}>{Math.round(todayValues.progesterone)} ng/mL</Text>
              </View>
              <View style={[dynamicStyles.valueRow, { borderBottomColor: theme.border }]}>
                <Text style={[dynamicStyles.valueLabel, { color: '#f97316' }]}>LH</Text>
                <Text style={[dynamicStyles.valueText, { color: theme.textPrimary }]}>{Math.round(todayValues.lh)} mIU/mL</Text>
              </View>
              <View style={dynamicStyles.valueRow}>
                <Text style={[dynamicStyles.valueLabel, { color: '#ec4899' }]}>FSH</Text>
                <Text style={[dynamicStyles.valueText, { color: theme.textPrimary }]}>{Math.round(todayValues.fsh)} mIU/mL</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// ============================================================================
// DYNAMIC STYLES (Theme-aware)
// ============================================================================

const createStyles = (theme: any, accentColor: string) => StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  filterSection: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rangeChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  hormoneChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  hormoneChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 2,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chartCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  valuesCard: {
    borderRadius: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  valuesTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  valuesList: {
    gap: 8,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
  },
  valueLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  valueText: {
    fontSize: 14,
    fontWeight: '600',
  },
});