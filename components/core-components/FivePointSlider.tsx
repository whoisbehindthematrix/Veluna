import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, PanResponder, Animated } from 'react-native';

type Props = {
  value: number;
  onChange: (v: number) => void;
  trackColor?: string;
  knobColor?: string;
};

const FivePointSlider = ({
  value,
  onChange,
  trackColor = "#ef4444",
  knobColor = "#fff",
}: Props) => {
  const translateX = useRef(new Animated.Value(0)).current;

  const SNAP_POINTS = [0, 25, 50, 75, 100];
  const trackWidth = 240;
  const knobSize = 32;

  const startX = useRef(0); // smooth start tracking

  const getSnapPosition = (index: number) => {
    if (index < 0) index = 0;
    if (index > 4) index = 4;
    return (SNAP_POINTS[index] / 100) * (trackWidth - knobSize);
  };

  // Sync knob when external value changes
  useEffect(() => {
    Animated.spring(translateX, {
      toValue: getSnapPosition(value - 1),
      useNativeDriver: false,
      tension: 120,
      friction: 10,
    }).start();
  }, [value]);

  const clamp = (v: number, min: number, max: number) => {
    "worklet";
    return Math.min(Math.max(v, min), max);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        // Store the starting absolute knob position
        translateX.stopAnimation((val) => {
          startX.current = val;
        });
      },

      onPanResponderMove: (_, gesture) => {
        const newX = clamp(startX.current + gesture.dx, 0, trackWidth - knobSize);
        translateX.setValue(newX); // direct — perfectly smooth
      },

      onPanResponderRelease: (_, gesture) => {
        const finalX = clamp(startX.current + gesture.dx, 0, trackWidth - knobSize);
        const percent = (finalX / (trackWidth - knobSize)) * 100;

        // find nearest snap
        let closestIndex = 0;
        let minDist = Infinity;

        SNAP_POINTS.forEach((p, i) => {
          const dist = Math.abs(percent - p);
          if (dist < minDist) {
            minDist = dist;
            closestIndex = i;
          }
        });

        onChange(closestIndex + 1);

        Animated.spring(translateX, {
          toValue: getSnapPosition(closestIndex),
          useNativeDriver: false,
          tension: 120,
          friction: 10,
        }).start();
      },
    })
  ).current;

  return (
    <View style={[styles.container, { width: trackWidth }]}>
      <View style={[styles.track, { backgroundColor: trackColor }]} />

      <View style={styles.snapContainer}>
        {SNAP_POINTS.map((_, i) => (
          <View key={i} style={styles.snapPoint} />
        ))}
      </View>

      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.knob,
          { backgroundColor: knobColor, transform: [{ translateX }] },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: "center",
  },
  track: {
    position: "absolute",
    height: 16,
    borderRadius: 16,
    left: 0,
    right: 0,
    opacity: 0.9,
  },
  snapContainer: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-between",
    left: 0,
    right: 0,
    paddingHorizontal: 6,
  },
  snapPoint: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ffffff80",
  },
  knob: {
    width: 32,
    height: 32,
    borderRadius: 16,
    position: "absolute",
    top: 4,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
});

export default FivePointSlider;
