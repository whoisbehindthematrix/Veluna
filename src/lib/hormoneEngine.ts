// Parametric hormone engine for menstrual cycle estimation
// Deterministic Gaussian-based model with personalization offsets

export type Cycle = { id: string; startDate: string; length?: number; ovulationDate?: string | null };
export type HormoneEstimate = { date: string; estrogen: number; progesterone: number; lh: number; fsh: number; confidence: number };

export type EngineParams = {
  // Gaussian peaks (day indices are 1-based)
  mu_E: number; sigma_E: number; amp_E: number; base_E: number;
  mu_P: number; sigma_P: number; amp_P: number; base_P: number;
  mu_LH: number; sigma_LH: number; amp_LH: number; base_LH: number;
  base_FSH: number; amp_FSH: number; mu_FSH: number; sigma_FSH: number;
  // personalization offsets (applied to mu_*)
  mu_offset: number;
};

export const defaultParams: EngineParams = {
  mu_E: 13, sigma_E: 2.0, amp_E: 100, base_E: 10,
  mu_P: 21, sigma_P: 3.0, amp_P: 100, base_P: 5,
  mu_LH: 14, sigma_LH: 0.5, amp_LH: 100, base_LH: 1,
  base_FSH: 5, amp_FSH: 30, mu_FSH: 2, sigma_FSH: 2.5,
  mu_offset: 0,
};

function gaussian(x: number, mu: number, sigma: number, amp: number, base = 0) {
  const v = amp * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2)) + base;
  return v;
}

export function estimateCycleLength(cycles: Cycle[]): number {
  const lengths = cycles.map(c => c.length).filter((x): x is number => typeof x === 'number' && x > 0);
  if (lengths.length === 0) return 28;
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  return Math.round(mean);
}

export function estimateHormonesForCycle(startDate: string, length: number, params?: Partial<EngineParams>): HormoneEstimate[] {
  const p = { ...defaultParams, ...(params || {}) } as EngineParams;
  const estimates: HormoneEstimate[] = [];
  const start = new Date(startDate);
  for (let day = 1; day <= length; day++) {
    const d = new Date(start);
    d.setDate(start.getDate() + (day - 1));
    // Apply personalization offset to peaks
    const muE = p.mu_E + p.mu_offset;
    const muP = p.mu_P + p.mu_offset;
    const muLH = p.mu_LH + p.mu_offset;
    const muFSH = p.mu_FSH + p.mu_offset;

    const estrogen = gaussian(day, muE, p.sigma_E, p.amp_E, p.base_E);
    const progesterone = gaussian(day, muP, p.sigma_P, p.amp_P, p.base_P);
    const lh = gaussian(day, muLH, p.sigma_LH, p.amp_LH, p.base_LH);
    const fsh = gaussian(day, muFSH, p.sigma_FSH, p.amp_FSH, p.base_FSH);

    // Confidence heuristic: tighter around 28 days, reduce if far from 28
    const diff = Math.abs(length - 28);
    const confLen = Math.max(0, 1 - diff / 14);
    const confidence = Math.min(1, Math.max(0.3, confLen));

    estimates.push({
      date: d.toISOString().split('T')[0],
      estrogen,
      progesterone,
      lh,
      fsh,
      confidence,
    });
  }
  return estimates;
}

export function inferPhaseFromEstimates(estimates: HormoneEstimate[], date: string): { phase: 'menstrual'|'follicular'|'ovulation'|'luteal'; probability: number } {
  const e = estimates.find(x => x.date === date);
  if (!e) return { phase: 'follicular', probability: 0.5 };
  // Simple rules based on relative values
  const { estrogen, progesterone, lh } = e;
  if (lh > estrogen && lh > progesterone && lh > 50) return { phase: 'ovulation', probability: 0.8 };
  if (progesterone > estrogen && progesterone > 40) return { phase: 'luteal', probability: 0.7 };
  if (estrogen < 20 && progesterone < 10) return { phase: 'menstrual', probability: 0.7 };
  return { phase: 'follicular', probability: 0.6 };
}

// Maintain a simple mutable offset; replace with persisted personalization later
let learnedOffset = 0;

export function updateModelWithUserCorrection(cycles: Cycle[], correction: { ovulationDate: string }): void {
  // Compute difference between predicted LH peak and user ovulation date, adjust mu_offset slightly
  if (cycles.length === 0) return;
  const cycle = cycles[cycles.length - 1];
  const length = cycle.length || 28;
  const est = estimateHormonesForCycle(cycle.startDate, length);
  // Find model LH peak day
  let peakDay = 1, peakVal = -Infinity;
  est.forEach((x, idx) => { if (x.lh > peakVal) { peakVal = x.lh; peakDay = idx + 1; } });
  const ovDay = daysBetween(cycle.startDate, correction.ovulationDate) + 1;
  const delta = ovDay - peakDay;
  learnedOffset = clamp(learnedOffset + Math.sign(delta) * Math.min(Math.abs(delta), 2) * 0.25, -3, 3);
  defaultParams.mu_offset = learnedOffset;
}

function daysBetween(startISO: string, targetISO: string): number {
  const a = new Date(startISO); const b = new Date(targetISO);
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }



