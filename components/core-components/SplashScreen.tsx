import { View, Image } from 'react-native'
import React, { useEffect } from 'react'
import AppText from './AppText'
import Animated, {
	FadeIn,
	FadeInDown,
	useSharedValue,
	useAnimatedStyle,
	withRepeat,
	withTiming,
	withSequence,
	Easing,
	SlideInDown,
} from 'react-native-reanimated'

export default function SplashScreenAnimation() {
	// Animated values for pulsing dots
	const dot1 = useSharedValue(1)
	const dot2 = useSharedValue(1)
	const dot3 = useSharedValue(1)

	useEffect(() => {
		// Create staggered pulsing animation for dots
		const animateDot = (dot: Animated.SharedValue<number>, delay: number) => {
			setTimeout(() => {
				dot.value = withRepeat(
					withSequence(
						withTiming(1.3, {
							duration: 600,
							easing: Easing.inOut(Easing.ease),
						}),
						withTiming(1, {
							duration: 600,
							easing: Easing.inOut(Easing.ease),
						})
					),
					-1, // infinite repeat
					false
				)
			}, delay)
		}

		animateDot(dot1, 0)
		animateDot(dot2, 200)
		animateDot(dot3, 400)
	}, [])

	// Animated styles for dots
	const dot1Style = useAnimatedStyle(() => ({
		transform: [{ scale: dot1.value }],
		opacity: dot1.value === 1 ? 0.6 : 1,
	}))

	const dot2Style = useAnimatedStyle(() => ({
		transform: [{ scale: dot2.value }],
		opacity: dot2.value === 1 ? 0.6 : 1,
	}))

	const dot3Style = useAnimatedStyle(() => ({
		transform: [{ scale: dot3.value }],
		opacity: dot3.value === 1 ? 0.6 : 1,
	}))

	return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f27e86' }}>
			{/* Logo with fade in and scale animation */}
			<Animated.View
				entering={FadeIn.delay(300).duration(800)}
				style={{ marginBottom: 14 }}
			>
				<Animated.Image
					source={require('../../assets/images/menstal.png')}
					style={{
						width: 180,
						height: 180,
					}}
					resizeMode="contain"
					entering={FadeIn.delay(400).duration(600)}
				/>
			</Animated.View>

			{/* Loading text with slide down animation */}
			<Animated.View
				entering={SlideInDown.delay(600).duration(700).springify()}
				style={{ alignItems: 'center', marginTop: 0 }}
			>
				

				{/* Pulsing dots container */}
				<Animated.View
					entering={FadeIn.delay(800).duration(500)}
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<Animated.View
						style={[
							{
								width: 12,
								height: 12,
								borderRadius: 6,
								backgroundColor: '#ffffff',
								marginHorizontal: 6,
							},
							dot1Style,
						]}
					/>
					<Animated.View
						style={[
							{
								width: 12,
								height: 12,
								borderRadius: 6,
								backgroundColor: '#ffffff',
								marginHorizontal: 6,
							},
							dot2Style,
						]}
					/>
					<Animated.View
						style={[
							{
								width: 12,
								height: 12,
								borderRadius: 6,
								backgroundColor: '#ffffff',
								marginHorizontal: 6,
							},
							dot3Style,
						]}
					/>
				</Animated.View>
			</Animated.View>
		</View>
	)
}