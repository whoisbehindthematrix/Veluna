import { View, Animated, StyleSheet, Dimensions } from "react-native";
import { BlurView } from "expo-blur";
import { useEffect, useRef } from "react";

const { width } = Dimensions.get("window");

const Smoke = ({
  delay = 0,
  size = 160,
  leftPercent = 0.5,
  tint = "light",
}) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 9000,
        delay,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [60, -260],
  });

  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1.8],
  });

  const opacity = progress.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0.35, 0],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrapper,
        {
          width: size,
          height: size,
          left: width * leftPercent - size / 2,
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <BlurView intensity={60} tint={tint} style={styles.blur} />
    </Animated.View>
  );
};

export default function SmokeLayer() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Smoke leftPercent={0.2} delay={0} />
      <Smoke leftPercent={0.5} delay={2500} size={200} />
      <Smoke leftPercent={0.8} delay={5000} size={180} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: -80,
    borderRadius: 999,
    overflow: "hidden",
  },
  blur: {
    flex: 1,
    backgroundColor: "rgba(8, 210, 173, 0.5)",
  },
});
