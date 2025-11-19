import { PredictionEngine, type HistoryInput } from 'cyclia';
import type { CycleEntry, CycleState, PredictionData } from '../slices/cycleSlice';

const engineCache = new Map<number, PredictionEngine>();

function getEngine(lutealPhaseDays: number) {
  if (!engineCache.has(lutealPhaseDays)) {
    engineCache.set(
      lutealPhaseDays,
      new PredictionEngine({
        strategy: 'wma',
        lutealPhaseDays,
      })
    );
  }
  return engineCache.get(lutealPhaseDays)!;
}

const emptyPredictions: PredictionData = {
  nextPeriod: null,
  ovulation: null,
  fertileWindow: null,
  analytics: null,
};

type PredictionComputationResult = {
  predictions: PredictionData;
  dataQuality: CycleState['dataQuality'];
  averageCycleLength: number;
};

const mapDataQuality = (quality?: string | null): CycleState['dataQuality'] => {
  if (quality === 'high' || quality === 'medium') return quality;
  if (quality === 'low') return 'low';
  return 'insufficient';
};

export function buildPredictionSnapshot(
  entries: CycleEntry[],
  profile: CycleState['profile']
): PredictionComputationResult {
  const periodEntries = entries
    .filter((entry) => entry.isPeriod)
    .map((entry) => ({ date: entry.date }));

  if (periodEntries.length < 2) {
    return {
      predictions: emptyPredictions,
      dataQuality: 'insufficient',
      averageCycleLength: profile.averageCycleLength,
    };
  }

  const engine = getEngine(profile.lutealPhaseDays);
  const history: HistoryInput = { periodStarts: periodEntries };

  const nextPeriod = engine.predictNextPeriod(history);
  const ovulation = engine.predictOvulation(history);
  const fertileWindow = engine.predictFertileWindow(history);
  const analytics = engine.analyze(history);

  return {
    predictions: {
      nextPeriod,
      ovulation,
      fertileWindow,
      analytics,
    },
    dataQuality: mapDataQuality(analytics.dataQuality),
    averageCycleLength: Math.round(analytics.averageCycle),
  };
}

export { emptyPredictions };

