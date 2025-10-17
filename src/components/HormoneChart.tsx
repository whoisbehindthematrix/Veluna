import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Path, Rect, G } from 'react-native-svg';
import type { HormoneEstimate } from '../lib/hormoneEngine';

type Props = {
  data: HormoneEstimate[];
  width?: number;
  height?: number;
  selectedDate?: string; // ISO date to highlight with a vertical marker
  hormone?: 'estrogen' | 'progesterone' | 'lh' | 'fsh' | 'all'; // filter to a single hormone or all
  onDateChange?: (date: string) => void; // called when user scrubs on chart
};

export default function HormoneChart({ data, width = 340, height = 180, selectedDate, hormone = 'all', onDateChange }: Props) {
  if (!data || data.length === 0) return <View style={{ height }} />;

  const padding = 16;
  const w = width - padding * 2;
  const h = height - padding * 2;
  const maxY = useMemo(() => Math.max(
    ...data.map(d => Math.max(d.estrogen, d.progesterone, d.lh, d.fsh)),
    100
  ), [data]);

  const x = (i: number) => padding + (i / (data.length - 1)) * w;
  const y = (v: number) => padding + h - (v / maxY) * h;

  const toPath = (arr: number[]) => {
    return arr
      .map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`)
      .join(' ');
  };

  const estrogenPath = toPath(data.map(d => d.estrogen));
  const progesteronePath = toPath(data.map(d => d.progesterone));
  const lhPath = toPath(data.map(d => d.lh));
  const fshPath = toPath(data.map(d => d.fsh));

  const selectedIndex = selectedDate ? data.findIndex(d => d.date === selectedDate) : -1;

  const handleTouch = (evt: any) => {
    if (!onDateChange) return;
    const tx = evt.nativeEvent.locationX as number;
    const rel = Math.max(0, Math.min(1, (tx - padding) / w));
    const idx = Math.round(rel * (data.length - 1));
    const clampedIdx = Math.max(0, Math.min(data.length - 1, idx));
    onDateChange(data[clampedIdx].date);
  };

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleTouch}
        onResponderMove={handleTouch}
      >
        <Rect x={0} y={0} width={width} height={height} fill="#ffffff" />
        {/* grid */}
        <G opacity={0.1}>
          {[0, 1, 2, 3, 4].map(i => (
            <Path key={i} d={`M ${padding} ${padding + (h / 4) * i} H ${padding + w}`} stroke="#6b7280" strokeWidth={1} />
          ))}
        </G>
        {/* lines */}
        {(hormone === 'all' || hormone === 'estrogen') && (
          <Path d={estrogenPath} stroke="#ec4899" strokeWidth={2} fill="none" />
        )}
        {(hormone === 'all' || hormone === 'progesterone') && (
          <Path d={progesteronePath} stroke="#8b5cf6" strokeWidth={2} fill="none" />
        )}
        {(hormone === 'all' || hormone === 'lh') && (
          <Path d={lhPath} stroke="#10b981" strokeWidth={2} fill="none" />
        )}
        {(hormone === 'all' || hormone === 'fsh') && (
          <Path d={fshPath} stroke="#06b6d4" strokeWidth={2} fill="none" />
        )}

        {/* selected date marker */}
        {selectedIndex >= 0 && (
          <Path d={`M ${x(selectedIndex)} ${padding} L ${x(selectedIndex)} ${padding + h}`} stroke="#111827" strokeDasharray="4,3" strokeWidth={1.5} />
        )}
      </Svg>
    </View>
  );
}


