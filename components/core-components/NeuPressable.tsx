import React, {
	forwardRef,
	memo,
	useCallback,
	useRef,
	useState,
  } from 'react';
  import {
	Animated,
	Pressable,
	StyleSheet,
	View,
	useWindowDimensions,
	PixelRatio,
	ViewStyle,
	Insets,
	LayoutChangeEvent,
	ActivityIndicator,
	StyleProp,
  } from 'react-native';
  import * as Haptics from 'expo-haptics';
  
  /* -------------------------------------------------------------------------- */
  /* Utils                                                                       */
  /* -------------------------------------------------------------------------- */
  
  const useNormalize = () => {
	const { width, height } = useWindowDimensions();
	const scale = Math.min(width, height) / 375;
  
	return useCallback(
	  (size: number) =>
		Math.round(PixelRatio.roundToNearestPixel(size * scale)),
	  [scale]
	);
  };
  
  /* -------------------------------------------------------------------------- */
  /* Types                                                                       */
  /* -------------------------------------------------------------------------- */
  
  type HapticStyle = 'Light' | 'Medium' | 'Heavy';
  
  export interface NeuPressableProps {
	children: React.ReactNode;
	onPress?: () => void;
  
	backgroundColor?: string;
	shadowColor?: string;
  
	loading?: boolean;
	disabled?: boolean;
  
	borderRadius?: number;
	pressDepth?: number;
  
	hapticStyle?: HapticStyle;
	disableAnimations?: boolean;
  
	style?: ViewStyle;
	contentStyle?: StyleProp<ViewStyle>
  
	onLongPress?: () => void;
	hitSlop?: Insets;
  
	testID?: string;
	accessibilityLabel?: string;
	accessibilityHint?: string;
  }
  
  /* -------------------------------------------------------------------------- */
  /* Component                                                                  */
  /* -------------------------------------------------------------------------- */
  
  const NeuPressable = forwardRef<View, NeuPressableProps>(
	(
	  {
		children,
		onPress,
  
		backgroundColor = '#FFFFFF',
		shadowColor = '#D33131',
  
		loading = false,
		disabled = false,
  
		borderRadius,
		pressDepth = 8,
  
		hapticStyle = 'Light',
		disableAnimations = false,
  
		style,
		contentStyle,
  
		onLongPress,
		hitSlop,
  
		testID,
		accessibilityLabel,
		accessibilityHint,
	  },
	  ref
	) => {
	  const normalize = useNormalize();
	  const translateY = useRef(new Animated.Value(0)).current;
	  const pressLock = useRef(false);
  
	  const [layout, setLayout] = useState<{ width: number; height: number } | null>(null);
  
	  const radius = borderRadius ?? normalize(24);
  
	  const onLayout = useCallback((e: LayoutChangeEvent) => {
		const { width, height } = e.nativeEvent.layout;
		setLayout({ width, height });
	  }, []);
  
	  const triggerHaptic = useCallback(() => {
		const map = {
		  Light: Haptics.ImpactFeedbackStyle.Light,
		  Medium: Haptics.ImpactFeedbackStyle.Medium,
		  Heavy: Haptics.ImpactFeedbackStyle.Heavy,
		};
		Haptics.impactAsync(map[hapticStyle]).catch(() => {});
	  }, [hapticStyle]);
  
	  const pressIn = useCallback(() => {
		if (disabled || loading || disableAnimations) return;
		triggerHaptic();
  
		Animated.spring(translateY, {
		  toValue: pressDepth,
		  stiffness: 300,
		  damping: 22,
		  mass: 0.4,
		  useNativeDriver: true,
		}).start();
	  }, [disabled, loading, disableAnimations, pressDepth, triggerHaptic]);
  
	  const pressOut = useCallback(() => {
		if (disabled || loading || disableAnimations) return;
  
		Animated.spring(translateY, {
		  toValue: 0,
		  stiffness: 300,
		  damping: 22,
		  mass: 0.4,
		  useNativeDriver: true,
		}).start();
	  }, [disabled, loading, disableAnimations]);
  
	  const handlePress = useCallback(() => {
		if (!onPress || disabled || loading || pressLock.current) return;
		pressLock.current = true;
		onPress();
		setTimeout(() => (pressLock.current = false), 250);
	  }, [onPress, disabled, loading]);
  
	  return (
		<View ref={ref} testID={testID} style={[styles.container, style]}>
		  {/* Shadow (auto-sized from layout) */}
		  {layout && (
			<View
			  pointerEvents="none"
			  style={[
				styles.shadow,
				{
				  width: layout.width,
				  height: layout.height,
				  backgroundColor: shadowColor,
				  borderRadius: radius,
				  top: pressDepth,
				},
			  ]}
			/>
		  )}
  
		  <Pressable
			onPress={handlePress}
			onPressIn={pressIn}
			onPressOut={pressOut}
			onLongPress={onLongPress}
			hitSlop={hitSlop}
			disabled={disabled || loading}
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel}
			accessibilityHint={accessibilityHint}
		  >
			<Animated.View
			  onLayout={onLayout}
			  style={[
				styles.surface,
				{
				  backgroundColor,
				  borderRadius: radius,
				  transform: [{ translateY }],
				},
				contentStyle,
			  ]}
			>
			  {children}
  
			  {loading && (
				<View style={styles.loading}>
				  <ActivityIndicator color="#000" />
				</View>
			  )}
			</Animated.View>
		  </Pressable>
		</View>
	  );
	}
  );
  
  NeuPressable.displayName = 'NeuPressable';
  export default memo(NeuPressable);
  
  /* -------------------------------------------------------------------------- */
  /* Styles                                                                      */
  /* -------------------------------------------------------------------------- */
  
  const styles = StyleSheet.create({
	container: {
	  position: 'relative',
	  alignSelf: 'flex-start',
	},
	shadow: {
	  position: 'absolute',
	  left: 0,
	},
	surface: {
	  justifyContent: 'center',
	  alignItems: 'center',
	},
	loading: {
	  ...StyleSheet.absoluteFillObject,
	  justifyContent: 'center',
	  alignItems: 'center',
	},
  });
  