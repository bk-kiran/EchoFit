import React, { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
} from 'react-native-reanimated'
import Ionicons from '@expo/vector-icons/Ionicons'

interface ErrorToastProps {
  message: string
  visible: boolean
  onHide: () => void
  duration?: number
}

export default function ErrorToast({ message, visible, onHide, duration = 3000 }: ErrorToastProps) {
  const translateY = useSharedValue(-100)
  const opacity = useSharedValue(0)
  const scale = useSharedValue(0.8)

  useEffect(() => {
    if (visible) {
      // Show animation
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      })
      opacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      })
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      })

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast()
      }, duration)

      return () => clearTimeout(timer)
    } else {
      hideToast()
    }
  }, [visible, message])

  const hideToast = () => {
    translateY.value = withTiming(-100, {
      duration: 250,
      easing: Easing.in(Easing.cubic),
    })
    opacity.value = withTiming(0, {
      duration: 250,
      easing: Easing.in(Easing.cubic),
    })
    scale.value = withTiming(0.8, {
      duration: 250,
      easing: Easing.in(Easing.cubic),
    }, (finished) => {
      if (finished) {
        runOnJS(onHide)()
      }
    })
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }))

  if (!visible && opacity.value === 0) {
    return null
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents="box-none">
      <View style={styles.toast}>
        <Ionicons name="alert-circle" size={20} color="#EF4444" />
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    paddingHorizontal: 16,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#FECACA',
    maxWidth: '90%',
  },
  message: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
})

