import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import ErrorToast from '../../../components/ErrorToast'
import { useAuth } from "@clerk/clerk-expo";

export default function ProfilePage() {
  const { signOut } = useAuth()
  const [errorMessage, setErrorMessage] = React.useState('')
  const [showError, setShowError] = React.useState(false)
  const [isSigningOut, setIsSigningOut] = React.useState(false)

  const showErrorToast = (message: string) => {
    setErrorMessage(message)
    setShowError(true)
  }

  const hideErrorToast = () => {
    setShowError(false)
    setErrorMessage('')
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
    } catch (err: any) {
      showErrorToast('Failed to sign out. Please try again.')
      console.error('Sign out error:', err)
    } finally {
      setIsSigningOut(false)
    }
  }
  return (
    <SafeAreaView className="flex flex-1">
      <ErrorToast
        message={errorMessage}
        visible={showError}
        onHide={hideErrorToast}
        duration={4000}
      />
      <Text>Profile</Text>

      <View className="px-6 mb-8">
        <TouchableOpacity
          onPress={handleSignOut}
          disabled={isSigningOut}
          className={`rounded-2xl p-4 shadow-sm ${isSigningOut ? 'bg-red-400' : 'bg-red-600'}`}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center justify-center">
            {isSigningOut ? (
              <Ionicons name="refresh" size={20} color="white" />
            ) : (
              <Ionicons name="log-out-outline" size={20} color="white" />
            )}
            <Text className="text-white font-semibold text-lg ml-2">
              {isSigningOut ? 'Signing out...' : 'Sign Out'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
