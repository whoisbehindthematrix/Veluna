import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-gifted-charts';

interface HormoneChartProps {
  cycleDay: number;
  currentPhase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
}

// Hormone curve data for a typical 28-day cycle
// Hormone curve data for a typical 28-day cycle (more realistic and interesting)

const screenwidth = Platform.OS === 'web' ? window.innerWidth : 290;
const curveData = [
  // Days 1-5: Menstrual phase - All hormones start LOW
  { estrogen: 15, progesterone: 5, lh: 10, fsh: 30 },      // Day 1
  { estrogen: 18, progesterone: 5, lh: 12, fsh: 35 },      // Day 2
  { estrogen: 22, progesterone: 6, lh: 14, fsh: 38 },      // Day 3
  { estrogen: 28, progesterone: 6, lh: 15, fsh: 40 },      // Day 4
  { estrogen: 32, progesterone: 7, lh: 16, fsh: 42 },      // Day 5
  
  // Days 6-13: Follicular phase - Estrogen RISES steadily, FSH peaks early
  { estrogen: 38, progesterone: 8, lh: 18, fsh: 45 },      // Day 6
  { estrogen: 45, progesterone: 8, lh: 20, fsh: 48 },      // Day 7
  { estrogen: 52, progesterone: 9, lh: 22, fsh: 50 },      // Day 8
  { estrogen: 58, progesterone: 10, lh: 25, fsh: 48 },     // Day 9
  { estrogen: 65, progesterone: 10, lh: 28, fsh: 45 },     // Day 10
  { estrogen: 72, progesterone: 12, lh: 32, fsh: 42 },     // Day 11
  { estrogen: 80, progesterone: 15, lh: 38, fsh: 40 },     // Day 12
  { estrogen: 88, progesterone: 18, lh: 50, fsh: 42 },     // Day 13
  
  // Days 14-16: Ovulatory phase - SHARP LH & FSH SURGE, Estrogen peaks
  { estrogen: 95, progesterone: 20, lh: 95, fsh: 75 },     // Day 14 - OVULATION!
  { estrogen: 85, progesterone: 35, lh: 70, fsh: 60 },     // Day 15
  { estrogen: 75, progesterone: 50, lh: 45, fsh: 48 },     // Day 16
  
  // Days 17-28: Luteal phase - Progesterone DOMINATES, Estrogen secondary rise
  { estrogen: 68, progesterone: 60, lh: 35, fsh: 40 },     // Day 17
  { estrogen: 72, progesterone: 70, lh: 30, fsh: 35 },     // Day 18
  { estrogen: 76, progesterone: 80, lh: 28, fsh: 32 },     // Day 19
  { estrogen: 80, progesterone: 88, lh: 26, fsh: 30 },     // Day 20
  { estrogen: 82, progesterone: 92, lh: 24, fsh: 28 },     // Day 21 - Mid-luteal peak
  { estrogen: 78, progesterone: 90, lh: 22, fsh: 26 },     // Day 22
  { estrogen: 72, progesterone: 85, lh: 20, fsh: 24 },     // Day 23
  { estrogen: 65, progesterone: 75, lh: 18, fsh: 22 },     // Day 24
  { estrogen: 55, progesterone: 60, lh: 16, fsh: 20 },     // Day 25
  { estrogen: 42, progesterone: 40, lh: 14, fsh: 18 },     // Day 26
  { estrogen: 28, progesterone: 20, lh: 12, fsh: 22 },     // Day 27
  { estrogen: 18, progesterone: 8, lh: 10, fsh: 28 },      // Day 28
];


const HormoneChart: React.FC<HormoneChartProps> = ({ cycleDay, currentPhase }) => {
  // Get phase description
  const getPhaseDescription = () => {
    switch (currentPhase) {
      case 'menstrual':
        return 'During menstruation, hormone levels are at their lowest. You may experience fatigue and mood changes.';
      case 'follicular':
        return 'Rising estrogen levels boost your energy and mood. This is a great time for new activities.';
      case 'ovulatory':
        return 'Peak hormone levels give you maximum energy and confidence. You may feel more social and active.';
      case 'luteal':
        return 'With rising progesterone, you may have a calmer mood and improved sleep. Compared with the fertile window, you may feel fatigued due to the drop in estrogen.';
      default:
        return '';
    }
  };

  // Prepare data for LineChart - Estrogen
  const estrogenData = curveData.map((point, index) => ({
    value: point.estrogen,
    dataPointText: index + 1 === cycleDay ? `${cycleDay}` : '',
    customDataPoint: () => {
      if (index + 1 === cycleDay) {
        return (
          <View style={styles.currentDayMarker}>
            <View style={styles.markerInner} />
          </View>
        );
      }
      return null;
    },
  }));

  // Prepare data for LineChart - Progesterone
  const progesteroneData = curveData.map((point) => ({
    value: point.progesterone,
  }));

  // Prepare data for LineChart - LH
  const lhData = curveData.map((point) => ({
    value: point.lh,
  }));

  // Prepare data for LineChart - FSH
  const fshData = curveData.map((point) => ({
    value: point.fsh,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Today's Hormones Levels</Text>
      <View style={styles.insightsCard}>
        <LinearGradient colors={['#f8fafc', '#f1f5f9']} style={styles.insightsGradient}>
          {/* Description */}
          <Text style={styles.hormonalDescription}>{getPhaseDescription()}</Text>

          {/* Chart */}
          <View style={styles.chartContainer}>
            <LineChart
              data={estrogenData}
              data2={progesteroneData}
              data3={lhData}
              data4={fshData}
              height={260}
              width={screenwidth}
			  
              curved
              areaChart
              
              // Use HEX colors with opacity props for transparency
              // Pastel Pink for Estrogen
              startFillColor="#ec4899"
              endFillColor="#ec4899"
              startOpacity={0.3}
              endOpacity={0.05}
              color="#ec4899"
              
              // Pastel Purple for Progesterone
              startFillColor2="#a855f7"
              endFillColor2="#a855f7"
              startOpacity2={0.3}
              endOpacity2={0.05}
              color2="#a855f7"
              
              // Pastel Green for LH
              startFillColor3="#10b981"
              endFillColor3="#10b981"
              startOpacity3={0.3}
              endOpacity3={0.05}
              color3="#10b981"
              
              // Pastel Cyan for FSH
              startFillColor4="#06b6d4"
              endFillColor4="#06b6d4"
              startOpacity4={0.3}
              endOpacity4={0.05}
              color4="#06b6d4"
              
              thickness={2.5}
              thickness2={2.5}
              thickness3={2.5}
              thickness4={2.5}
              hideDataPoints
              hideRules
              hideYAxisText
              xAxisColor="transparent"
              yAxisColor="transparent"
              backgroundColor="rgba(255, 255, 255, 0.9)"
              initialSpacing={-100}
              endSpacing={4}
              maxValue={100}
              noOfSections={4}
              yAxisLabelSuffix="%"
              pointerConfig={{
                pointerStripHeight: 280,
                pointerStripColor: '#374151',
                pointerStripWidth: 2,
                pointerColor: '#374151',
                radius: 6,
                pointerLabelWidth: 100,
                pointerLabelHeight: 110,
                activatePointersOnLongPress: true,
                autoAdjustPointerLabelPosition: false,
                pointerLabelComponent: (items: any) => {
                  return (
                    <View style={styles.tooltipContainer}>
                      <Text style={styles.tooltipDay}>Day {items[0].index + 1}</Text>
                      <Text style={[styles.tooltipText, { color: '#ec4899' }]}>
                        E: {items[0].value}%
                      </Text>
                      {items[1] && (
                        <Text style={[styles.tooltipText, { color: '#a855f7' }]}>
                          P: {items[1].value}%
                        </Text>
                      )}
                      {items[2] && (
                        <Text style={[styles.tooltipText, { color: '#10b981' }]}>
                          LH: {items[2].value}%
                        </Text>
                      )}
                      {items[3] && (
                        <Text style={[styles.tooltipText, { color: '#06b6d4' }]}>
                          FSH: {items[3].value}%
                        </Text>
                      )}
                    </View>
                  );
                },
              }}
            />
          </View>

          {/* Legend */}
          <View style={styles.hormoneLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#ec4899' }]} />
              <Text style={styles.legendText}>Estrogen</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#a855f7' }]} />
              <Text style={styles.legendText}>Progesterone</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
              <Text style={styles.legendText}>LH</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#06b6d4' }]} />
              <Text style={styles.legendText}>FSH</Text>
            </View>
          </View>

          {/* Current Day & Phase Indicators */}
          <View style={styles.indicatorsRow}>
            <View style={styles.indicatorItem}>
              <Text style={styles.indicatorEmoji}>🩸</Text>
              <Text style={styles.indicatorText}>Day 1-5</Text>
            </View>
            <View style={styles.indicatorItem}>
              <View style={styles.currentDayBadge}>
                <Text style={styles.currentDayBadgeText}>Day {cycleDay}</Text>
              </View>
            </View>
            <View style={styles.indicatorItem}>
              <Text style={styles.indicatorEmoji}>☀️</Text>
              <Text style={styles.indicatorText}>Day 14</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  insightsCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  insightsGradient: {
    padding: 20,
  },
  hormonalDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  chartContainer: {
    // alignItems: 'flex-end',
	justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 0,
  },
  hormoneLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  indicatorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  indicatorItem: {
    alignItems: 'center',
  },
  indicatorEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  indicatorText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  currentDayBadge: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  currentDayBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  currentDayMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  tooltipContainer: {
    backgroundColor: '#1f2937',
    padding: 10,
    borderRadius: 8,
    minWidth: 80,
  },
  tooltipDay: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  tooltipText: {
    fontSize: 11,
    marginBottom: 2,
    fontWeight: '600',
  },
});

export default HormoneChart;
