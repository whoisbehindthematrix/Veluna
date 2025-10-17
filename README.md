DocI

Overview
DocI is an Expo-managed React Native starter focused on menstrual cycle tracking with a parametric hormone engine. It includes:
- Onboarding (name, average cycle length, optional luteal length)
- Calendar (placeholder), Daily Log (scaffold), Settings
- Hormone Engine (Gaussian-based estrogen / progesterone / LH / FSH)
- Mock data generator (6 months) and a simple `HormoneChart` using `react-native-svg`
- Unit tests for the engine

Quick Start
1) Prerequisites
- Node 20+ (LTS) and npm
- Expo CLI (optional)

2) Install
```
npm install
```

3) Run (Expo Go)
```
npx expo start
```
Scan the QR with Expo Go (iOS Camera or Expo Go on Android). For development builds or iOS simulator use the on-screen shortcuts.

Project Structure (new src/*)
- src/lib/hormoneEngine.ts — parametric Gaussian model for hormones
- src/lib/mockData.ts — 6 months synthetic cycles and logs
- src/components/HormoneChart.tsx — multi-line SVG chart
- src/context/AppContext.tsx — simple app state and mock dataset
- src/screens/OnboardingFlow.tsx — collects basic profile
- src/screens/CalendarView.tsx — calendar placeholder with mock values
- src/screens/DailyLog.tsx — scaffold for symptoms and BBT input
- src/screens/SettingsScreen.tsx — privacy/export/disclaimer
- __tests__/hormoneEngine.test.ts — unit tests for engine

Hormone Engine API
Types:
```
export type Cycle = { id: string; startDate: string; length?: number; ovulationDate?: string | null };
export type HormoneEstimate = { date: string; estrogen: number; progesterone: number; lh: number; fsh: number; confidence: number };
```
Functions:
```
estimateCycleLength(cycles: Cycle[]): number;
estimateHormonesForCycle(startDate: string, length: number, params?: Record<string, number>): HormoneEstimate[];
inferPhaseFromEstimates(estimates: HormoneEstimate[], date: string): { phase: 'menstrual'|'follicular'|'ovulation'|'luteal'; probability: number };
updateModelWithUserCorrection(cycles: Cycle[], correction: { ovulationDate: string }): void;
```

Modeling Notes
- Estrogen: pre‑ovulatory Gaussian peak (default μ≈13, σ≈2)
- Progesterone: mid‑luteal Gaussian peak (μ≈21, σ≈3)
- LH: narrow spike near ovulation (μ≈14, σ≈0.5)
- FSH: small rise around menses (parameterized bump)
- Confidence: decreases as cycle length deviates from 28; floor at ~0.3
- Personalization: simple learned μ offset via `updateModelWithUserCorrection`

Mock Data
`generateMockCycles(6)` returns 6 months of cycles plus daily logs with random variation and synthetic symptoms/BBT/LH. Use this for development.

Testing
```
npm test
```
Includes unit tests for hormone engine behavior and shapes.

Privacy & Disclaimer
- Local-only by default; cloud sync disabled unless explicitly implemented and enabled.
- Medical Disclaimer: This app provides estimates and is not a medical device. Consult a clinician for diagnosis and treatment.

References
- NCBI: The Normal Menstrual Cycle and the Control of Ovulation
- Merck Manuals: Menstrual Cycle
- RBEJ (2022): Tracking of menstrual cycles and prediction of the fertile window
- Li et al.; Urteaga et al. — cycle/hormone modeling

