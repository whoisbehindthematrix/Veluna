import { estimateCycleLength, estimateHormonesForCycle, inferPhaseFromEstimates, updateModelWithUserCorrection } from '../src/lib/hormoneEngine';

describe('hormoneEngine', () => {
  it('estimates mean cycle length', () => {
    const len = estimateCycleLength([
      { id: '1', startDate: '2025-01-01', length: 28 },
      { id: '2', startDate: '2025-02-01', length: 29 },
    ]);
    expect(len).toBe(29);
  });

  it('produces hormone arrays of correct length', () => {
    const est = estimateHormonesForCycle('2025-01-01', 28);
    expect(est).toHaveLength(28);
    expect(est[0]).toHaveProperty('estrogen');
  });

  it('LH peaks near ovulation day', () => {
    const est = estimateHormonesForCycle('2025-01-01', 28);
    const lhValues = est.map(e => e.lh);
    const peakIndex = lhValues.indexOf(Math.max(...lhValues));
    expect(peakIndex + 1).toBeGreaterThan(12);
    expect(peakIndex + 1).toBeLessThan(16);
  });

  it('infers phases reasonably', () => {
    const est = estimateHormonesForCycle('2025-01-01', 28);
    const ov = inferPhaseFromEstimates(est, est[13].date); // ~day 14
    expect(['ovulation', 'follicular', 'luteal', 'menstrual']).toContain(ov.phase);
  });

  it('updates model with user correction without throwing', () => {
    updateModelWithUserCorrection([
      { id: 'c', startDate: '2025-01-01', length: 28 },
    ], { ovulationDate: '2025-01-14' });
  });
});



