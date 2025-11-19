import type { PhaseInfo, CyclePhase } from '../slices/cycleSlice';

const phaseCopy: Record<CyclePhase, Omit<PhaseInfo, 'name' | 'day' | 'dayInPhase' | 'totalDaysInPhase'>> = {
  menstrual: {
    description: 'Period - shedding uterine lining',
    hormoneLevel: { estrogen: 'low', progesterone: 'low' },
    energyLevel: 'low',
    commonSymptoms: ['cramps', 'fatigue', 'low back pain', 'headaches'],
  },
  follicular: {
    description: 'Building energy - follicles developing',
    hormoneLevel: { estrogen: 'rising', progesterone: 'low' },
    energyLevel: 'high',
    commonSymptoms: ['increased energy', 'clear skin', 'positive mood'],
  },
  ovulatory: {
    description: 'Peak fertility - ovulation occurring',
    hormoneLevel: { estrogen: 'high', progesterone: 'rising' },
    energyLevel: 'peak',
    commonSymptoms: ['increased libido', 'cervical mucus', 'confidence'],
  },
  luteal: {
    description: 'Winding down - preparing for next cycle',
    hormoneLevel: { estrogen: 'falling', progesterone: 'falling' },
    energyLevel: 'moderate',
    commonSymptoms: ['PMS', 'bloating', 'mood swings', 'fatigue', 'acne'],
  },
};

export const buildPhaseInfo = (
  cycleDay: number,
  cycleLength: number,
  periodDuration: number
): PhaseInfo => {
  const menstrualEnd = periodDuration;
  const follicularEnd = Math.floor(cycleLength / 2) - 1;
  const ovulatoryEnd = follicularEnd + 3;

  if (cycleDay >= 1 && cycleDay <= menstrualEnd) {
    const copy = phaseCopy.menstrual;
    return {
      name: 'menstrual',
      day: cycleDay,
      dayInPhase: cycleDay,
      totalDaysInPhase: menstrualEnd,
      ...copy,
    };
  }

  if (cycleDay > menstrualEnd && cycleDay <= follicularEnd) {
    const copy = phaseCopy.follicular;
    return {
      name: 'follicular',
      day: cycleDay,
      dayInPhase: cycleDay - menstrualEnd,
      totalDaysInPhase: follicularEnd - menstrualEnd,
      ...copy,
    };
  }

  if (cycleDay > follicularEnd && cycleDay <= ovulatoryEnd) {
    const copy = phaseCopy.ovulatory;
    return {
      name: 'ovulatory',
      day: cycleDay,
      dayInPhase: cycleDay - follicularEnd,
      totalDaysInPhase: 3,
      ...copy,
    };
  }

  const copy = phaseCopy.luteal;
  const isEarlyLuteal = cycleDay < cycleLength - 7;

  return {
    name: 'luteal',
    day: cycleDay,
    dayInPhase: cycleDay - ovulatoryEnd,
    totalDaysInPhase: cycleLength - ovulatoryEnd,
    description: copy.description,
    hormoneLevel: {
      estrogen: isEarlyLuteal ? 'rising' : 'falling',
      progesterone: isEarlyLuteal ? 'high' : 'falling',
    },
    energyLevel: isEarlyLuteal ? 'moderate' : 'low',
    commonSymptoms: copy.commonSymptoms,
  };
};

