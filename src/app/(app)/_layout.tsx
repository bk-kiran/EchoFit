import { Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import { View, ActivityIndicator } from 'react-native'
import { useState, useEffect } from 'react'
import AnimatedSplash from '../../components/AnimatedSplash'

function Layout() {
  const { isLoaded, isSignedIn, userId, sessionId, getToken } = useAuth()
  const [showSplash, setShowSplash] = useState(true)
  const [appReady, setAppReady] = useState(false)

  useEffect(() => {
    // Wait for auth to load
    if (isLoaded) {
      setAppReady(true)
    }
  }, [isLoaded])

  const handleSplashFinish = () => {
    setShowSplash(false)
  }

  if (!isLoaded || !appReady) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    )
  }

  if (showSplash) {
    return <AnimatedSplash onFinish={handleSplashFinish} />
  }
  
  return (
    <Stack>
      <Stack.Protected guard={isSignedIn ?? false}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }}/>
      </Stack.Protected>
      <Stack.Protected guard={!(isSignedIn ?? false)}>
        <Stack.Screen name="sign-in" options={{ headerShown: false }}/>
        <Stack.Screen name="sign-up" options={{ headerShown: false }}/>
      </Stack.Protected>
    </Stack>
  )
}



export default Layout