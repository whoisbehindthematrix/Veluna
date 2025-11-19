import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/src/store';
import type { AnalyticsSummary } from 'cyclia';

type PeriodStats = {
  totalPeriods: number;
  averagePeriodLength: number;
  shortestPeriod: number;
  longestPeriod: number;
  periodsAnalyzed: number;
};

type CycleLengthStats = {
  averageCycleLength: number;
  shortestCycle: number;
  longestCycle: number;
  cyclesAnalyzed: number;
  regularity: string;
};

const defaultPeriodStats: PeriodStats = {
  totalPeriods: 0,
  averagePeriodLength: 0,
  shortestPeriod: 0,
  longestPeriod: 0,
  periodsAnalyzed: 0,
};

const defaultCycleStats: CycleLengthStats = {
  averageCycleLength: 28,
  shortestCycle: 0,
  longestCycle: 0,
  cyclesAnalyzed: 0,
  regularity: 'insufficient_data',
};

const DATA_QUALITY_META: Record<
  string,
  { label: string; color: string }
> = {
  high: { label: 'High Quality', color: '#10b981' },
  medium: { label: 'Medium Quality', color: '#f59e0b' },
  low: { label: 'Low Quality', color: '#ef4444' },
  insufficient: { label: 'Insufficient Data', color: '#6b7280' },
  insufficient_data: { label: 'Insufficient Data', color: '#6b7280' },
};

const calculatePeriodStats = (
  entries: Array<{ date: string; isPeriod: boolean }>
): PeriodStats => {
  const periodEntries = entries.filter((entry) => entry.isPeriod);
  if (periodEntries.length === 0) {
    return defaultPeriodStats;
  }

  const sorted = [...periodEntries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const lengths: number[] = [];
  let count = 1;

  for (let i = 1; i < sorted.length; i++) {
    const diff =
      (new Date(sorted[i].date).getTime() -
        new Date(sorted[i - 1].date).getTime()) /
      (1000 * 60 * 60 * 24);

    if (diff === 1) {
      count++;
    } else {
      lengths.push(count);
      count = 1;
    }
  }
  lengths.push(count);

  const average =
    lengths.length > 0
      ? Math.round(lengths.reduce((sum, len) => sum + len, 0) / lengths.length)
      : 0;

  return {
    totalPeriods: lengths.length,
    averagePeriodLength: average,
    shortestPeriod: Math.min(...lengths),
    longestPeriod: Math.max(...lengths),
    periodsAnalyzed: lengths.length,
  };
};

const calculateCycleLengthStats = (
  entries: Array<{ date: string; isPeriod: boolean }>,
  analytics: AnalyticsSummary | null
): CycleLengthStats => {
  if (!analytics?.cycles?.length) {
    return defaultCycleStats;
  }

  const lengths = analytics.cycles.map((cycle) => cycle.length).filter(Boolean);
  if (!lengths.length) {
    return defaultCycleStats;
  }

  return {
    averageCycleLength: Math.round(analytics.averageCycle) || 28,
    shortestCycle: Math.min(...lengths),
    longestCycle: Math.max(...lengths),
    cyclesAnalyzed: analytics.cycles.length,
    regularity: analytics.regularity || 'unknown',
  };
};

export function useCycleInsights() {
  const cycle = useSelector((state: RootState) => state.cycle);

  const periodStats = useMemo(
    () => calculatePeriodStats(cycle.entries),
    [cycle.entries]
  );

  const cycleStats = useMemo(
    () => calculateCycleLengthStats(cycle.entries, cycle.predictions.analytics),
    [cycle.entries, cycle.predictions.analytics]
  );

  const dataQualityMeta = useMemo(() => {
    return (
      DATA_QUALITY_META[cycle.dataQuality] ?? DATA_QUALITY_META.insufficient
    );
  }, [cycle.dataQuality]);

  return {
    cycle,
    periodStats,
    cycleStats,
    dataQualityMeta,
  };
}

