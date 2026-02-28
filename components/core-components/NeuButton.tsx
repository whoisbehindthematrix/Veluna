import React, {
  forwardRef,
  memo,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  ActivityIndicator,
  Animated,
  I18nManager,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  PixelRatio,
  ViewStyle,
  TextStyle,
  Insets,
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
type ButtonType = 'normal' | 'capsule';

export interface AnimatedButtonProps {
  title?: string;
  onPress?: () => void;

  backgroundColor?: string;
  shadowColor?: string;
  textColor?: string;

  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconOnly?: boolean;

  loading?: boolean;
  loadingText?: string;

  disabled?: boolean;
  fullWidth?: boolean;
  minHeight?: number;

  type?: ButtonType;
  hapticStyle?: HapticStyle;
  disableAnimations?: boolean;

  style?: ViewStyle;
  textStyle?: TextStyle;

  onLongPress?: () => void;
  hitSlop?: Insets;

  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

const NeuButton = forwardRef<View, AnimatedButtonProps>(
  (
    {
      title = '',
      onPress,

      backgroundColor = '#20B2AA',
      shadowColor = '#1A9B94',
      textColor = '#FFFFFF',

      leftIcon,
      rightIcon,
      iconOnly = false,

      loading = false,
      loadingText,

      disabled = false,
      fullWidth = true,
      minHeight,

      type = 'normal',
      hapticStyle = 'Light',
      disableAnimations = false,

      style,
      textStyle,

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

    const baseSize = minHeight ?? normalize(52);

    const iconSize = useMemo(() => {
      if (!iconOnly) return undefined;
      if (style && typeof style === 'object') {
        return style.width ?? style.height ?? baseSize;
      }
      return baseSize;
    }, [iconOnly, style, baseSize]);

    const borderRadius = useMemo(() => {
      if (iconOnly || type === 'capsule') return (iconSize ?? baseSize) / 2;
      return normalize(18);
    }, [iconOnly, type, iconSize, baseSize, normalize]);

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
        toValue: 6,
        stiffness: 300,
        damping: 20,
        mass: 0.4,
        useNativeDriver: true,
      }).start();
    }, [disabled, loading, disableAnimations, translateY, triggerHaptic]);

    const pressOut = useCallback(() => {
      if (disabled || loading || disableAnimations) return;

      Animated.spring(translateY, {
        toValue: 0,
        stiffness: 300,
        damping: 20,
        mass: 0.4,
        useNativeDriver: true,
      }).start();
    }, [disabled, loading, disableAnimations, translateY]);

    const handlePress = useCallback(() => {
      if (!onPress || disabled || loading || pressLock.current) return;

      pressLock.current = true;
      onPress();

      setTimeout(() => {
        pressLock.current = false;
      }, 250);
    }, [onPress, disabled, loading]);

    return (
      <View
        ref={ref}
        testID={testID}
        style={[
          styles.container,
          fullWidth && !iconOnly && { width: '100%' },
          style,
          (disabled || loading) && { opacity: 1 },
        ]}
      >
        {/* Shadow */}
        <View
          pointerEvents="none"
          style={[
            styles.shadow,
            {
              backgroundColor: shadowColor,
              width: iconOnly ? iconSize : '100%',
              height: iconOnly ? iconSize : '100%',
              borderRadius,
              top: normalize(6),
              alignSelf: iconOnly ? 'center' : undefined,
            },
          ]}
        />

        <Pressable
          onPress={handlePress}
          onPressIn={pressIn}
          onPressOut={pressOut}
          onLongPress={onLongPress}
          hitSlop={hitSlop}
          disabled={disabled || loading}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel ?? title}
          accessibilityHint={
            accessibilityHint ?? (loading ? 'In progress' : undefined)
          }
        >
          <Animated.View
            style={[
              styles.button,
              {
                width: iconOnly ? iconSize : '100%',
                height: iconOnly ? iconSize : undefined,
                minHeight: baseSize,
                paddingHorizontal: iconOnly ? 0 : normalize(18),
                paddingVertical: iconOnly ? 0 : normalize(14),
                borderRadius,
                backgroundColor,
                transform: [{ translateY }],
              },
            ]}
          >
            <View style={styles.content}>
              {loading ? (
                <>
                  <ActivityIndicator color={textColor} size={'large'}  />
                  {!iconOnly && loadingText && (
                    <Text style={[styles.text, { color: textColor }, textStyle]}>
                      {loadingText}
                    </Text>
                  )}
                </>
              ) : (
                <>
                  {leftIcon && <View style={styles.icon}>{leftIcon}</View>}

                  {!iconOnly && (
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.text,
                        { color: textColor, fontSize: normalize(18) },
                        textStyle,
                      ]}
                    >
                      {title}
                    </Text>
                  )}

                  {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
                </>
              )}
            </View>
          </Animated.View>
        </Pressable>
      </View>
    );
  }
);

NeuButton.displayName = 'NeuButton';
export default memo(NeuButton);

/* -------------------------------------------------------------------------- */
/* Styles                                                                      */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  shadow: {
    position: 'absolute',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontWeight: '600',
    includeFontPadding: false,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
