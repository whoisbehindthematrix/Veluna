import {
  Image,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import type { CoverFlowCardItem } from './types';

const DEFAULT_CARD_BG = '#2a2a2a';

type CarouselItemProps = {
  item: CoverFlowCardItem;
  index: number;
  scrollOffset: SharedValue<number>;
  itemWidth: number;
  itemHeight: number;
};

export const CarouselItem: React.FC<CarouselItemProps> = ({
  item,
  scrollOffset,
  index,
  itemWidth,
  itemHeight,
}) => {
  const inputRange = [
    (index - 3) * itemWidth,
    (index - 2) * itemWidth,
    (index - 1) * itemWidth,
    index * itemWidth,
    (index + 1) * itemWidth,
    (index + 2) * itemWidth,
    (index + 3) * itemWidth,
  ];

  const rAnimatedCardStyle = useAnimatedStyle(() => {
    const scaleX = interpolate(
      scrollOffset.value,
      inputRange,
      [0.1, 0.125, 0.2, 1, 0.2, 0.125, 0.1],
      Extrapolation.CLAMP
    );
    const scaleY = interpolate(
      scrollOffset.value,
      inputRange,
      [0.6, 0.8, 0.9, 1, 0.9, 0.8, 0.6]
    );
    const translateX = interpolate(scrollOffset.value, inputRange, [
      -itemWidth * 1.9,
      -itemWidth / 0.93,
      -itemWidth / 3.3,
      0,
      itemWidth / 3.3,
      itemWidth / 0.93,
      itemWidth * 1.9,
    ]);
    const maxBorderRadius = 25;
    const borderRadius = interpolate(scrollOffset.value, inputRange, [
      maxBorderRadius,
      maxBorderRadius,
      maxBorderRadius,
      15,
      maxBorderRadius,
      maxBorderRadius,
      maxBorderRadius,
    ]);
    const opacity = interpolate(
      scrollOffset.value,
      [
        (index - 3) * itemWidth - 100,
        ...inputRange,
        (index + 3) * itemWidth + 100,
      ],
      [0, 1, 1, 1, 1, 1, 1, 1, 0],
      Extrapolation.CLAMP
    );
    const width = Math.round(itemWidth * scaleX);

    return {
      borderRadius,
      opacity,
      width,
      height: itemHeight,
      transform: [{ translateX }, { scaleY }],
    };
  }, [index, itemWidth, itemHeight]);

  const hasImage = Boolean(item.image);
  const hasGradient = Boolean(
    item.gradientColors && item.gradientColors.length >= 2
  );
  const bgColor = item.backgroundColor ?? DEFAULT_CARD_BG;

  return (
    <Animated.View
      style={[
        { width: itemWidth, height: itemHeight },
        styles.outer,
      ]}
    >
      <Animated.View style={[rAnimatedCardStyle, styles.card]}>
        {/* Background: image or gradient or solid */}
        {hasImage ? (
          <Image
            source={{ uri: item.image }}
            style={[StyleSheet.absoluteFill, styles.bgImage]}
            resizeMode="cover"
          />
        ) : hasGradient ? (
          <LinearGradient
            colors={item.gradientColors!}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: bgColor }]} />
        )}

        {/* Overlay so text/icon stay readable on image */}
        {(hasImage && (item.title || item.subtitle || item.icon || item.children)) ? (
          <View style={styles.overlay} />
        ) : null}

        {/* Content: custom children, or title/subtitle/icon */}
        <View style={styles.content} pointerEvents="none">
          {item.children != null ? (
            item.children
          ) : (
            <>
              {item.icon ? <View style={styles.iconWrap}>{item.icon}</View> : null}
              {item.title ? (
                <Text style={styles.title} numberOfLines={2}>
                  {item.title}
                </Text>
              ) : null}
              {item.subtitle ? (
                <Text style={styles.subtitle} numberOfLines={2}>
                  {item.subtitle}
                </Text>
              ) : null}
            </>
          )}
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  outer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  bgImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrap: {
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    // fontWeight: '700',
    fontFamily: 'Bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 6,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
