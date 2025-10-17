import React from 'react';
import { View, Text, Switch, TouchableOpacity, Alert } from 'react-native';
import { useApp } from '../context/AppContext';

export default function SettingsScreen() {
  const { state, setState } = useApp();
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Settings</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 }}>
        <Text>Local-only mode</Text>
        <Switch value={state.privacyLocalOnly} onValueChange={v => setState({ privacyLocalOnly: v })} />
      </View>
      <TouchableOpacity onPress={() => Alert.alert('Export', 'Data exported to JSON (mock).')} style={{ paddingVertical: 12 }}>
        <Text style={{ color: '#2563eb' }}>Export Data (JSON)</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => Alert.alert('Medical Disclaimer', 'This app provides estimates and is not a medical device. Consult a clinician for diagnosis.')} style={{ paddingVertical: 12 }}>
        <Text style={{ color: '#2563eb' }}>Medical Disclaimer</Text>
      </TouchableOpacity>
    </View>
  );
}



