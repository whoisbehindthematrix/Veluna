import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';

export default function OnboardingFlow({ onDone }: { onDone: () => void }) {
  const { state, setState } = useApp();
  const [name, setName] = useState(state.name || '');
  const [avg, setAvg] = useState(String(state.averageCycleLength || 28));
  const [luteal, setLuteal] = useState(String(state.lutealLength || 14));

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 12 }}>Welcome</Text>
      <Text style={{ marginBottom: 8 }}>Your name</Text>
      <TextInput value={name} onChangeText={setName} style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 12 }} />
      <Text style={{ marginBottom: 8 }}>Average cycle length (days)</Text>
      <TextInput value={avg} onChangeText={setAvg} keyboardType="numeric" style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 12 }} />
      <Text style={{ marginBottom: 8 }}>Average luteal length (days, optional)</Text>
      <TextInput value={luteal} onChangeText={setLuteal} keyboardType="numeric" style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 20 }} />
      <TouchableOpacity
        onPress={() => { setState({ name, averageCycleLength: parseInt(avg) || 28, lutealLength: parseInt(luteal) || 14 }); onDone(); }}
        style={{ backgroundColor: '#111827', padding: 14, borderRadius: 10 }}
      >
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}



