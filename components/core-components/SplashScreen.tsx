import { View, Text } from 'react-native'
import React from 'react'
import AppText from './AppText'

export default function SplashScreenAnimation() {
  return (
	<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ff2020ff' }}>
			<AppText variant='bold' >SplashScreen</AppText>
	</View>
  )
}	