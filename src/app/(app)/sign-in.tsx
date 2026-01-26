import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { Text, TextInput, TouchableOpacity, View, SafeAreaView, KeyboardAvoidingView, Platform, Image } from 'react-native'
import React from 'react'
import Ionicons from '@expo/vector-icons/Ionicons'

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      })

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.replace('/')
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err) {
      // See Clerk docs: custom flows error handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  return (
    <SafeAreaView className="flex-1">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">

            {/*Header*/}
            <View className="flex-1 items-center justify-center">
                <View className="items-center mb-8">
                    <View className="w-20 h-20 bg-gradient-br from-blue-600 to-purple-600
                    rounded-2xl items-center justify-center mb-4 shadow-lg">
                        <Image source={require('../../../assets/icons/ios-light.png')} className="w-12 h-12" />
                    </View>
                    <Text className="text-3xl font-bold text-gray-900 mb-2">
                        EchoFit
                    </Text>
                    <Text className="text-lg text-gray-600 text-center">
                        Track your fitness journey{"\n"} and reach your goals.
                    </Text>
                </View>
            </View>

            {/*Sign In Form*/}
            <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                <Text className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    Welcome back!
                </Text>
            
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200">
                    <Ionicons name="mail-outline" size={20} color="#6b7280" />
                    <TextInput
                        autoCapitalize="none"
                        value={emailAddress}
                        placeholder="Enter your email"
                        placeholderTextColor="#9CA3AF"
                        onChangeText={setEmailAddress}
                        className="flex-1 ml-3 text-gray-900"
                        editable={!isLoading}
                    />
                </View>
            </View>    
            
        </KeyboardAvoidingView>
    </SafeAreaView>
  )
}