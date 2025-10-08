import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Droplets } from 'lucide-react-native';

type PhaseCardProps = {
  phaseName: string;
  emoji: string;
  cycleDay: number;
  daysUntilNextPeriod?: number;
  image?: any;
};

export default function PhaseCard({
  phaseName,
  emoji,
  cycleDay,
  daysUntilNextPeriod,
  image,
}: PhaseCardProps) {
  return (
    <View style={styles.phaseCard3D}>
      <Text style={styles.phaseEmoji}>{emoji}</Text>
      <View style={styles.phaseContent}>

        <Text style={{ color: '#ffffff73', fontWeight: 'bold' }}>Current Phase</Text>
        <Text style={styles.phaseTitle3D}>{phaseName}</Text>
        <Text style={styles.cycleDay3D}>Day {cycleDay}</Text>

        {daysUntilNextPeriod && (
          <View style={styles.nextPeriodContainer3D}>
            <Droplets size={14} color="#fecaca" />
            <Text style={styles.nextPeriodText3D}>
              Next period in {daysUntilNextPeriod} days
            </Text>
          </View>
        )}
      </View>
	  <Image source={image} style={{width: 100, height: 150, }} resizeMode='contain' />
    </View>
  );
}

const styles = StyleSheet.create({
  phaseCard3D: {
    alignSelf: 'stretch',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    padding: 12,
    borderRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    transform: [{ translateY: -2 }],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    gap: 16,
  },
  phaseEmoji: {
    fontSize: 28,
  },
  phaseContent: {
    flex: 1,
	
  },
  phaseTitle3D: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
	paddingTop: 8,
  },
  cycleDay3D: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  nextPeriodContainer3D: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  nextPeriodText3D: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fecaca',
  },
});
