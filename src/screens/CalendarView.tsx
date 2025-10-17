import React from 'react';
import { View, Text } from 'react-native';
import { useApp } from '../context/AppContext';

export default function CalendarView() {
  const { mock } = useApp();
  const latest = mock.cycles[mock.cycles.length - 1];
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Cycle Calendar (mock)</Text>
      <Text>Latest cycle start: {latest.startDate}</Text>
      <Text>Length: {latest.length}</Text>
      <Text style={{ marginTop: 12, color: '#6b7280' }}>Month view UI to be implemented with react-native-gesture-handler.</Text>
    </View>
  );
}



