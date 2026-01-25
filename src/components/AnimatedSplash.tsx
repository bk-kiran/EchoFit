import React, { useEffect } from 'react'
import { View, Text, Image, StyleSheet, useColorScheme, StatusBar } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
  interpolateColor,
} from 'react-native-reanimated'
import * as SplashScreen from 'expo-splash-screen'

interface AnimatedSplashProps {
  onFinish: () => void
}

export default function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  // Animation values
  const logoScale = useSharedValue(1)
  const logoOpacity = useSharedValue(1)
  const textOpacity = useSharedValue(0)
  const textTranslateY = useSharedValue(30)
  const containerOpacity = useSharedValue(1)
  const backgroundProgress = useSharedValue(0) // 0 = initial, 1 = text background

  useEffect(() => {
    // Hide native splash screen first
    SplashScreen.hideAsync().catch(() => {})

    // Animation sequence
    const animate = () => {
      // 1. Logo pulse animation (1 second) - smoother easing
      logoScale.value = withSequence(
        withTiming(1.1, {
          duration: 600,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1.0), // Smooth acceleration
        }),
        withTiming(1, {
          duration: 600,
          easing: Easing.bezier(0.0, 0.0, 0.2, 1.0), // Smooth deceleration
        })
      )

      // 2. After 1.2 seconds, fade out logo and fade in text simultaneously
      logoOpacity.value = withDelay(
        1200,
        withTiming(0, {
          duration: 600,
          easing: Easing.bezier(0.4, 0.0, 1.0, 1.0), // Smooth fade out
        })
      )

      // 3. Background color transition - starts when text appears
      backgroundProgress.value = withDelay(
        1200,
        withTiming(1, {
          duration: 800,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1.0), // Smooth color transition
        })
      )

      // 4. Text animation (fade in + slide up) - starts after 1.2s, duration 800ms
      textOpacity.value = withDelay(
        1200,
        withTiming(1, {
          duration: 800,
          easing: Easing.bezier(0.0, 0.0, 0.2, 1.0), // Smooth fade in
        })
      )

      textTranslateY.value = withDelay(
        1200,
        withTiming(0, {
          duration: 800,
          easing: Easing.bezier(0.0, 0.0, 0.2, 1.0), // Smooth slide up
        })
      )

      // 5. After total ~2.8 seconds (1200ms + 800ms + 800ms buffer), fade out container
      containerOpacity.value = withDelay(
        2800,
        withTiming(0, {
          duration: 400,
          easing: Easing.bezier(0.4, 0.0, 1.0, 1.0), // Smooth fade out
        }, (finished) => {
          if (finished) {
            runOnJS(onFinish)()
          }
        })
      )
    }

    animate()
  }, [onFinish])

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }))

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }))

  const containerStyle = useAnimatedStyle(() => {
    // Initial background colors
    const initialBg = isDark ? '#121212' : '#FFFFFF'
    // Final background colors when text appears
    const finalBg = isDark ? '#005A5F' : '#94E8ED'
    
    // Interpolate background color based on progress
    const backgroundColor = interpolateColor(
      backgroundProgress.value,
      [0, 1],
      [initialBg, finalBg]
    )

    return {
      opacity: containerOpacity.value,
      backgroundColor,
    }
  })

  const textColor = isDark ? '#FFFFFF' : '#000000'
  const logoSource = isDark
    ? require('../../assets/icons/ios-dark.png')
    : require('../../assets/icons/ios-light.png')

  // StatusBar style - adapts to final background color
  const finalBg = isDark ? '#005A5F' : '#94E8ED'
  // Use light-content for dark teal, dark-content for light cyan
  const statusBarStyle = isDark ? 'light-content' : 'dark-content'

  return (
    <>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={finalBg}
      />
      <Animated.View
        style={[
          styles.container,
          containerStyle,
        ]}
      >
        <Animated.View style={logoStyle}>
          <Image
            source={logoSource}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View style={[styles.textContainer, textStyle]}>
          <Text style={[styles.text, { color: textColor }]}>EchoFit</Text>
        </Animated.View>
      </Animated.View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
  },
  textContainer: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  text: {
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },
})

