import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';
import HormoneChart from '../components/HormoneChart';
import { estimateHormonesForCycle } from '../lib/hormoneEngine';

export default function HormoneChartScreen() {
  const { mock } = useApp();
  const [range, setRange] = useState<'1y'|'6m'|'4m'|'1m'|'this'>('1m');
  const [hormone, setHormone] = useState<'all'|'estrogen'|'progesterone'|'lh'|'fsh'>('all');
  const todayISO = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayISO);

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
    <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ padding: 16 }}>
        {/* Header */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#1e293b', textAlign: 'center', marginBottom: 8 }}>
            Hormone Cycle Dynamics
          </Text>
          <Text style={{ fontSize: 14, color: '#64748b', textAlign: 'center' }}>
            Track your hormonal patterns over time
          </Text>
        </View>

        {/* Range Filter Chips */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
            Time Range
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
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
                style={{ 
                  paddingVertical: 8, 
                  paddingHorizontal: 16, 
                  borderRadius: 20, 
                  backgroundColor: range === opt.k ? '#0ea5e9' : '#e2e8f0',
                  shadowColor: range === opt.k ? '#0ea5e9' : '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: range === opt.k ? 0.3 : 0.1,
                  shadowRadius: 4,
                  elevation: range === opt.k ? 4 : 2,
                }}
              >
                <Text style={{ 
                  color: range === opt.k ? '#fff' : '#475569', 
                  fontSize: 12, 
                  fontWeight: '700' 
                }}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Hormone Filter Chips */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
            Hormone Filter
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
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
                style={{ 
                  paddingVertical: 6, 
                  paddingHorizontal: 12, 
                  borderRadius: 16, 
                  backgroundColor: hormone === opt.k ? '#10b981' : '#f1f5f9',
                  borderWidth: 2,
                  borderColor: hormone === opt.k ? '#10b981' : '#e2e8f0',
                }}
              >
                <Text style={{ 
                  color: hormone === opt.k ? '#fff' : '#64748b', 
                  fontSize: 12, 
                  fontWeight: '700' 
                }}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Chart */}
        <View style={{ 
          backgroundColor: '#fff', 
          borderRadius: 12, 
          padding: 16, 
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}>
          <HormoneChart data={data} selectedDate={selectedDate} hormone={hormone} onDateChange={setSelectedDate} />
        </View>

        {/* Selected Date Values */}
        {todayValues && (
          <View style={{ 
            backgroundColor: '#fff', 
            borderRadius: 12, 
            padding: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 12 }}>
              Selected Date: {todayValues.date}
            </Text>
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#10b981' }}>Estrogen</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#1e293b' }}>{Math.round(todayValues.estrogen)} pg/mL</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#3b82f6' }}>Progesterone</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#1e293b' }}>{Math.round(todayValues.progesterone)} ng/mL</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#f97316' }}>LH</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#1e293b' }}>{Math.round(todayValues.lh)} mIU/mL</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#ec4899' }}>FSH</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#1e293b' }}>{Math.round(todayValues.fsh)} mIU/mL</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}