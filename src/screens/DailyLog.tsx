import React, { useState } from 'react';
import { View, Text, Slider, TextInput } from 'react-native';

export default function DailyLog() {
  const [mood, setMood] = useState(3);
  const [cramps, setCramps] = useState(1);
  const [sleep, setSleep] = useState('7.0');
  const [bbt, setBbt] = useState('36.5');

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Daily Log</Text>
      <Text>Mood: {mood}</Text>
      {/* Slider is deprecated in RN core; for scaffold only */}
      <Slider minimumValue={1} maximumValue={5} step={1} value={mood} onValueChange={v => setMood(v)} />
      <Text>Cramps: {cramps}</Text>
      <Slider minimumValue={0} maximumValue={5} step={1} value={cramps} onValueChange={v => setCramps(v)} />
      <Text>Sleep hours</Text>
      <TextInput value={sleep} onChangeText={setSleep} keyboardType="numeric" style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 12 }} />
      <Text>BBT (°C)</Text>
      <TextInput value={bbt} onChangeText={setBbt} keyboardType="numeric" style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 12 }} />
    </View>
  );
}



