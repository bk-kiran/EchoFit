import { ClerkProvider } from '@clerk/clerk-expo'
import { Slot } from 'expo-router'
import { useEffect } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import '../global.css'

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync()

export default function Layout() {
  useEffect(() => {
    // Prevent auto-hide - our AnimatedSplash component will handle hiding
  }, [])

  return (
    <ClerkProvider>
      <Slot />
    </ClerkProvider>
  );
}
