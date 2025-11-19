import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { Droplets, ChevronRight } from 'lucide-react-native';
import AppText from './AppText';

type PhaseCardProps = {
  phaseName: string;
  emoji: string;
  cycleDay: number;
  daysUntilNextPeriod?: number;
  image?: any;
  phaseColor?: string;
  onPress?: () => void;
};

export default function PhaseCard({
  phaseName,
  emoji,
  cycleDay,
  daysUntilNextPeriod,
  image,
  phaseColor = '#ef4444',
  onPress,
}: PhaseCardProps) {
  return (
    <TouchableOpacity
      style={[styles.phaseCard3D, { backgroundColor: phaseColor }]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.phaseContent}>
        <Text style={{ color: '#ffffff73', fontWeight: 'bold', fontSize: 11 }}>
          Current Phase
        </Text>
        <AppText variant="bold" style={styles.phaseTitle3D}>
          {phaseName}
        </AppText>
        <Text style={[styles.cycleDay3D, { color: phaseColor }]}>Day {cycleDay}</Text>

        {daysUntilNextPeriod !== undefined && (
          <View style={styles.nextPeriodContainer3D}>
            <Droplets size={14} color="#fff" />
            <Text style={styles.nextPeriodText3D}>
              Next period in {daysUntilNextPeriod} days
            </Text>
          </View>
        )}

        {/* Tap Indicator */}
        <View style={styles.tapIndicator}>
          <Text style={styles.tapText}>Tap for details</Text>
          <ChevronRight size={14} color="rgba(255,255,255,0.6)" />
        </View>
      </View>

      {image && (
        <Image source={image} style={styles.phaseImage} resizeMode="contain" />
      )}

      {/* Subtle Overlay for Press Effect */}
      <View style={styles.overlay} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  phaseCard3D: {
    alignSelf: 'stretch',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    transform: [{ translateY: -2 }],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    gap: 16,
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    borderRadius: 24,
  },
  phaseContent: {
    flex: 1,
    zIndex: 1,
  },
  phaseTitle3D: {
    fontSize: 26,
    color: '#fff',
    marginBottom: 8,
    paddingTop: 6,
  },
  cycleDay3D: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ef4444',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  nextPeriodContainer3D: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  nextPeriodText3D: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },
  phaseImage: {
    width: 100,
    height: 150,
    zIndex: 1,
  },
  tapIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  tapText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    fontStyle: 'italic',
  },
});
