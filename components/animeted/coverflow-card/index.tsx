import { useWindowDimensions } from 'react-native';
import { useCallback } from 'react';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { CarouselItem } from './carousel-item';
import type { CoverFlowCardItem } from './types';

export type { CoverFlowCardItem } from './types';

const ITEM_WIDTH = 300;
const ITEM_HEIGHT = 260;

export type CoverFlowCarouselProps = {
  /** Items to show. Each can have image, gradient, text, icon — same card size, different content. */
  items: CoverFlowCardItem[];
};

export const CoverFlowCarousel: React.FC<CoverFlowCarouselProps> = ({
  items,
}) => {
  const scrollOffset = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: ({ contentOffset: { x } }) => {
      scrollOffset.value = x;
    },
  });

  const { width: windowWidth } = useWindowDimensions();
  const paddingHorizontal = Math.round((windowWidth - ITEM_WIDTH) / 4);

  const renderItem = useCallback(
    ({ item, index }: { item: CoverFlowCardItem; index: number }) => (
      <CarouselItem
        item={item}
        index={index}
        scrollOffset={scrollOffset}
        itemWidth={ITEM_WIDTH}
        itemHeight={ITEM_HEIGHT}
      />
    ),
    [scrollOffset]
  );

  return (
    <Animated.FlatList
      scrollEventThrottle={4}
      horizontal
      pagingEnabled
      snapToInterval={ITEM_WIDTH}
      decelerationRate="fast"
      showsHorizontalScrollIndicator={false}
      onScroll={onScroll}
      contentContainerStyle={{
        alignItems: 'center',
        paddingHorizontal,
      }}
      renderItem={renderItem}
      data={items}
      keyExtractor={(i) => i.id}
    />
  );
};
