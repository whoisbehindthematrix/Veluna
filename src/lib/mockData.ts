import { estimateCycleLength, estimateHormonesForCycle, type Cycle, type HormoneEstimate } from './hormoneEngine';

export type SymptomLog = {
  date: string;
  cycleId: string;
  dayInCycle: number;
  symptoms: { mood: number; cramps: number; sleep: number; energy?: number; appetite?: number };
  bbt?: number;
  lh?: 'negative'|'positive'|'not_tested';
  hormones: HormoneEstimate;
};

export function generateMockCycles(months = 6, startFrom = new Date()): { cycles: Cycle[]; logs: SymptomLog[] } {
  // Generate backward in time
  const cycles: Cycle[] = [];
  let cursor = new Date(startFrom);
  cursor.setHours(0, 0, 0, 0);

  for (let i = 0; i < months; i++) {
    // introduce small random variation in length 26-31
    const length = 28 + randInt(-2, 3);
    const start = new Date(cursor);
    start.setDate(start.getDate() - length);
    cycles.unshift({ id: `c_${(months - i).toString().padStart(3, '0')}`, startDate: start.toISOString().split('T')[0], length, ovulationDate: undefined });
    cursor = start;
  }

  const meanLen = estimateCycleLength(cycles);
  const logs: SymptomLog[] = [];

  cycles.forEach(cycle => {
    const len = cycle.length || meanLen;
    const est = estimateHormonesForCycle(cycle.startDate, len);
    est.forEach((h, idx) => {
      const dayInCycle = idx + 1;
      logs.push({
        date: h.date,
        cycleId: cycle.id,
        dayInCycle,
        symptoms: {
          mood: clampInt(1 + Math.round((h.estrogen - h.progesterone) / 40) + randInt(-1, 1), 1, 5),
          cramps: dayInCycle <= 3 ? clampInt(2 + randInt(-1, 1), 0, 5) : 0,
          sleep: clampInt(6 + randInt(-2, 2), 3, 10),
          energy: clampInt(3 + Math.round(h.estrogen / 50) + randInt(-1, 1), 1, 5),
          appetite: clampInt(2 + Math.round(h.progesterone / 50) + randInt(-1, 1), 1, 5),
        },
        bbt: dayInCycle > 14 ? 36.6 + Math.random() * 0.3 : 36.3 + Math.random() * 0.2,
        lh: Math.abs(dayInCycle - 14) <= 1 ? (Math.random() > 0.3 ? 'positive' : 'negative') : 'not_tested',
        hormones: h,
      });
    });
  });

  return { cycles, logs };
}

export function sampleDay(): SymptomLog {
  const { cycles, logs } = generateMockCycles(1, new Date('2025-10-15'));
  return logs[Math.floor(logs.length / 2)];
}

function randInt(a: number, b: number) { return Math.floor(a + Math.random() * (b - a + 1)); }
function clampInt(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }



