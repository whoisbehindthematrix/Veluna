import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, {
  Path,
  Rect,
  G,
  Defs,
  LinearGradient,
  Stop,
  ClipPath,
} from 'react-native-svg';
import type { HormoneEstimate } from '../lib/hormoneEngine';
import { useTheme } from '@/src/context/ThemeContext';

const HORMONE_COLORS = {
  estrogen: { stroke: '#ec4899', fillStart: '#ec4899', fillEnd: '#ec489940' },
  progesterone: { stroke: '#8b5cf6', fillStart: '#8b5cf6', fillEnd: '#8b5cf640' },
  lh: { stroke: '#10b981', fillStart: '#10b981', fillEnd: '#10b98140' },
  fsh: { stroke: '#06b6d4', fillStart: '#06b6d4', fillEnd: '#06b6d440' },
} as const;

type Props = {
  data: HormoneEstimate[];
  width?: number;
  height?: number;
  selectedDate?: string;
  hormone?: 'estrogen' | 'progesterone' | 'lh' | 'fsh' | 'all';
  onDateChange?: (date: string) => void;
};

export default function HormoneChart({
  data,
  width = 340,
  height = 180,
  selectedDate,
  hormone = 'all',
  onDateChange,
}: Props) {
  const { theme } = useTheme();

  if (!data || data.length === 0) {
    return <View style={{ width: width || 340, height }} />;
  }

  const paddingLeft = 10;
  const paddingRight = 12;
  const paddingTop = 12;
  const paddingBottom = 20;
  const w = width - paddingLeft - paddingRight;
  const h = height - paddingTop - paddingBottom;

  const maxY = useMemo(
    () =>
      Math.max(
        ...data.map((d) =>
          Math.max(d.estrogen, d.progesterone, d.lh, d.fsh)
        ),
        100
      ),
    [data]
  );

  const x = (i: number) =>
    paddingLeft + (i / Math.max(1, data.length - 1)) * w;
  const y = (v: number) => paddingTop + h - (v / maxY) * h;

  const toLinePath = (arr: number[]) =>
    arr
      .map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`)
      .join(' ');

  const toAreaPath = (arr: number[]) => {
    const line = toLinePath(arr);
    const lastX = x(data.length - 1);
    const firstX = x(0);
    const bottomY = paddingTop + h;
    return `${line} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  const estrogenPath = toLinePath(data.map((d) => d.estrogen));
  const progesteronePath = toLinePath(data.map((d) => d.progesterone));
  const lhPath = toLinePath(data.map((d) => d.lh));
  const fshPath = toLinePath(data.map((d) => d.fsh));

  const estrogenAreaPath = toAreaPath(data.map((d) => d.estrogen));
  const progesteroneAreaPath = toAreaPath(data.map((d) => d.progesterone));
  const lhAreaPath = toAreaPath(data.map((d) => d.lh));
  const fshAreaPath = toAreaPath(data.map((d) => d.fsh));

  const selectedIndex = selectedDate
    ? data.findIndex((d) => d.date === selectedDate)
    : -1;

  const handleTouch = (evt: any) => {
    if (!onDateChange) return;
    const tx = evt.nativeEvent?.locationX ?? 0;
    const rel = Math.max(0, Math.min(1, (tx - paddingLeft) / w));
    const idx = Math.round(rel * (data.length - 1));
    const clampedIdx = Math.max(0, Math.min(data.length - 1, idx));
    onDateChange(data[clampedIdx].date);
  };

  const gridOpacity = theme.mode === 'dark' ? 0.2 : 0.12;
  const strokeWidth = 2.5;

  return (
    <View style={{ width, height }}>
      <Svg
        width={width}
        height={height}
        onStartShouldSetResponder={() => !!onDateChange}
        onMoveShouldSetResponder={() => !!onDateChange}
        onResponderGrant={handleTouch}
        onResponderMove={handleTouch}
      >
        <Defs>
          <LinearGradient
            id="grad-estrogen"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <Stop offset="0%" stopColor={HORMONE_COLORS.estrogen.fillStart} stopOpacity={0.35} />
            <Stop offset="100%" stopColor={HORMONE_COLORS.estrogen.fillEnd} stopOpacity={0} />
          </LinearGradient>
          <LinearGradient
            id="grad-progesterone"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <Stop offset="0%" stopColor={HORMONE_COLORS.progesterone.fillStart} stopOpacity={0.35} />
            <Stop offset="100%" stopColor={HORMONE_COLORS.progesterone.fillEnd} stopOpacity={0} />
          </LinearGradient>
          <LinearGradient id="grad-lh" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={HORMONE_COLORS.lh.fillStart} stopOpacity={0.35} />
            <Stop offset="100%" stopColor={HORMONE_COLORS.lh.fillEnd} stopOpacity={0} />
          </LinearGradient>
          <LinearGradient id="grad-fsh" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={HORMONE_COLORS.fsh.fillStart} stopOpacity={0.35} />
            <Stop offset="100%" stopColor={HORMONE_COLORS.fsh.fillEnd} stopOpacity={0} />
          </LinearGradient>
          <ClipPath id="chartClip">
            <Rect x={paddingLeft} y={paddingTop} width={w} height={h} rx={8} ry={8} />
          </ClipPath>
        </Defs>

        {/* Background */}
        <Rect x={0} y={0} width={width} height={height} fill={theme.cardBackground} />

        {/* Grid */}
        <G opacity={gridOpacity} clipPath="url(#chartClip)">
          {[0, 1, 2, 3, 4].map((i) => (
            <Path
              key={`h-${i}`}
              d={`M ${paddingLeft} ${paddingTop + (h / 4) * i} H ${paddingLeft + w}`}
              stroke={theme.textPrimary}
              strokeWidth={1}
              fill="none"
            />
          ))}
          {[0.25, 0.5, 0.75].map((r, i) => (
            <Path
              key={`v-${i}`}
              d={`M ${paddingLeft + w * r} ${paddingTop} V ${paddingTop + h}`}
              stroke={theme.textPrimary}
              strokeWidth={1}
              fill="none"
            />
          ))}
        </G>

        {/* Area fills (under lines) */}
        <G clipPath="url(#chartClip)">
          {(hormone === 'all' || hormone === 'estrogen') && (
            <Path
              d={estrogenAreaPath}
              fill="url(#grad-estrogen)"
              stroke="none"
            />
          )}
          {(hormone === 'all' || hormone === 'progesterone') && (
            <Path
              d={progesteroneAreaPath}
              fill="url(#grad-progesterone)"
              stroke="none"
            />
          )}
          {(hormone === 'all' || hormone === 'lh') && (
            <Path d={lhAreaPath} fill="url(#grad-lh)" stroke="none" />
          )}
          {(hormone === 'all' || hormone === 'fsh') && (
            <Path d={fshAreaPath} fill="url(#grad-fsh)" stroke="none" />
          )}
        </G>

        {/* Lines */}
        <G clipPath="url(#chartClip)">
          {(hormone === 'all' || hormone === 'estrogen') && (
            <Path
              d={estrogenPath}
              stroke={HORMONE_COLORS.estrogen.stroke}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {(hormone === 'all' || hormone === 'progesterone') && (
            <Path
              d={progesteronePath}
              stroke={HORMONE_COLORS.progesterone.stroke}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {(hormone === 'all' || hormone === 'lh') && (
            <Path
              d={lhPath}
              stroke={HORMONE_COLORS.lh.stroke}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {(hormone === 'all' || hormone === 'fsh') && (
            <Path
              d={fshPath}
              stroke={HORMONE_COLORS.fsh.stroke}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </G>

        {/* Selected date marker */}
        {selectedIndex >= 0 && (
          <G clipPath="url(#chartClip)">
            <Path
              d={`M ${x(selectedIndex)} ${paddingTop} L ${x(selectedIndex)} ${paddingTop + h}`}
              stroke={theme.textPrimary}
              strokeDasharray="6,4"
              strokeWidth={2}
              fill="none"
              opacity={0.9}
            />
            <Rect
              x={x(selectedIndex) - 5}
              y={paddingTop + h - 6}
              width={10}
              height={10}
              rx={2}
              fill={theme.textPrimary}
              opacity={0.3}
            />
          </G>
        )}
      </Svg>
    </View>
  );
}
