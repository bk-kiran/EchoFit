import * as React from 'react'
import { Text, TextInput, TouchableOpacity, View, SafeAreaView, KeyboardAvoidingView, Platform, Image } from 'react-native'
import { useSignUp } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import GoogleSignIn from '../components/GoogleSignIn'
import ErrorToast from '../components/ErrorToast'

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [code, setCode] = React.useState('')
  const [errorMessage, setErrorMessage] = React.useState('')
  const [showError, setShowError] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [isResending, setIsResending] = React.useState(false)

  // Validation functions
  const validateEmail = (email: string): boolean => {
    if (!email || email.trim() === '') {
      return false
    }
    return email.includes('@') && email.includes('.')
  }

  const validatePassword = (pwd: string): boolean => {
    if (!pwd || pwd.trim() === '') {
      return false
    }
    // Password must be between 8 and 128 characters
    return pwd.length >= 8 && pwd.length <= 128
  }

  const showErrorToast = (message: string) => {
    setErrorMessage(message)
    setShowError(true)
  }

  const hideErrorToast = () => {
    setShowError(false)
    setErrorMessage('')
  }

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return

    // Validate email
    if (!emailAddress || emailAddress.trim() === '') {
      showErrorToast('Please enter your email address')
      return
    }

    if (!validateEmail(emailAddress)) {
      showErrorToast('Please enter a valid email address')
      return
    }

    // Validate password
    if (!password || password.trim() === '') {
      showErrorToast('Please enter a password')
      return
    }

    if (password.length < 8) {
      showErrorToast('Password must be at least 8 characters long')
      return
    }

    if (password.length > 128) {
      showErrorToast('Password must be less than 128 characters')
      return
    }

    setIsLoading(true)

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      })

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true)
    } catch (err: any) {
      // Handle Clerk errors
      let errorMsg = 'Something went wrong. Please try again.'
      
      if (err?.errors && err.errors.length > 0) {
        const firstError = err.errors[0]
        if (firstError.message) {
          errorMsg = firstError.message
        } else if (firstError.code === 'form_identifier_exists') {
          errorMsg = 'An account with this email already exists'
        } else if (firstError.code === 'form_password_length_too_short') {
          errorMsg = 'Password must be at least 8 characters long'
        } else if (firstError.code === 'form_password_pwned') {
          errorMsg = 'This password is too common. Please choose a stronger password'
        }
      }
      
      showErrorToast(errorMsg)
      console.error(JSON.stringify(err, null, 2))
    } finally {
      setIsLoading(false)
    }
  }

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return

    if (!code || code.trim() === '') {
      showErrorToast('Please enter the verification code')
      return
    }

    if (code.length !== 6) {
      showErrorToast('Please enter a valid 6-digit code')
      return
    }

    setIsVerifying(true)

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      })

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        router.replace('/(tabs)/')
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2))
        showErrorToast('Verification failed. Please try again.')
      }
    } catch (err: any) {
      let errorMsg = 'Invalid verification code. Please try again.'
      
      if (err?.errors && err.errors.length > 0) {
        const firstError = err.errors[0]
        if (firstError.message) {
          errorMsg = firstError.message
        } else if (firstError.code === 'form_code_incorrect') {
          errorMsg = 'Incorrect verification code. Please try again.'
        } else if (firstError.code === 'form_code_expired') {
          errorMsg = 'Verification code has expired. Please request a new one.'
        }
      }
      
      showErrorToast(errorMsg)
      console.error(JSON.stringify(err, null, 2))
    } finally {
      setIsVerifying(false)
    }
  }

  // Handle resend verification code
  const onResendPress = async () => {
    if (!isLoaded) return

    setIsResending(true)

    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      showErrorToast('Verification code sent! Check your email.')
    } catch (err: any) {
      showErrorToast('Failed to resend code. Please try again.')
      console.error(JSON.stringify(err, null, 2))
    } finally {
      setIsResending(false)
    }
  }

  if (pendingVerification) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ErrorToast
          message={errorMessage}
          visible={showError}
          onHide={hideErrorToast}
          duration={4000}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="flex-1 px-4">
            {/* Header Section */}
            <View className="items-center pt-12 pb-8">
              {/* Envelope Icon */}
              <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-6">
                <Image source={require('../../../assets/icons/ios-light.png')} className="w-12 h-12" />
              </View>
              
              {/* Title */}
              <Text className="text-3xl font-bold text-gray-900 mb-3 text-center">
                Check Your Email
              </Text>
              
              {/* Email Instruction */}
              <Text className="text-base text-gray-600 text-center px-4">
                We've sent a verification code to{'\n'}
                <Text className="font-semibold text-gray-900">{emailAddress}</Text>
              </Text>
            </View>

            {/* Verification Card */}
            <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <Text className="text-xl font-bold text-gray-900 mb-6">
                Enter Verification Code
              </Text>

              {/* Code Input */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </Text>
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200">
                  <Ionicons name="key-outline" size={20} color="#6b7280" />
                  <TextInput
                    value={code}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="#9CA3AF"
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    maxLength={6}
                    className="flex-1 ml-3 text-gray-900 text-xl font-bold"
                    editable={!isVerifying}
                    autoFocus
                  />
                </View>
              </View>

              {/* Verify Button */}
              <TouchableOpacity
                onPress={onVerifyPress}
                disabled={isVerifying || !code || code.length !== 6}
                className={`rounded-xl py-4 shadow-sm mb-4 ${
                  isVerifying || !code || code.length !== 6
                    ? 'bg-gray-300'
                    : 'bg-green-600'
                }`}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-center">
                  {isVerifying ? (
                    <Ionicons name="refresh" size={20} color="white" />
                  ) : (
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                  )}
                  <Text className="text-white font-semibold text-lg ml-2">
                    {isVerifying ? 'Verifying...' : 'Verify Email'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Resend Link */}
            <View className="items-center mb-6">
              <TouchableOpacity
                onPress={onResendPress}
                disabled={isResending}
                activeOpacity={0.7}
              >
                <Text className="text-blue-600 font-medium text-base">
                  {isResending ? 'Sending...' : "Didn't receive the code? Resend"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer Message */}
            <View className="flex-1 justify-end pb-6">
              <Text className="text-center text-gray-400 text-sm">
                Almost there! Just one more step
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ErrorToast
        message={errorMessage}
        visible={showError}
        onHide={hideErrorToast}
        duration={4000}
      />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        {/*Header*/}
        <View className="items-center pt-8 pb-4">
          <View className="items-center mb-6">
            <View className="w-20 h-20 bg-gradient-br from-blue-600 to-purple-600
            rounded-2xl items-center justify-center mb-4 shadow-lg">
              <Image source={require('../../../assets/icons/ios-light.png')} className="w-12 h-12" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Join EchoFit
            </Text>
            <Text className="text-lg text-gray-600 text-center">
              Track your fitness journey{"\n"} and reach your goals.
            </Text>
          </View>
        </View>

        {/*Sign Up Form*/}
        <View className="px-4 flex-1">
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <Text className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Create your account
            </Text>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Email
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

            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Password
              </Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200">
                <Ionicons name="lock-closed-outline" size={20} color="#6b7280" />
                <TextInput
                  autoCapitalize="none"
                  value={password}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  onChangeText={setPassword}
                  className="flex-1 ml-3 text-gray-900"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                  className="ml-2"
                >
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#6b7280" 
                  />
                </TouchableOpacity>
              </View>
              <Text className="text-xs text-gray-500 mt-2 ml-1">
                Must be at least 8 characters long.
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            onPress={onSignUpPress} 
            disabled={isLoading}
            className={`rounded-xl py-4 shadow-sm mb-2 ${isLoading ? 'bg-gray-400' : 'bg-blue-600'}`}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center">
              {isLoading ? (
                <Ionicons name="refresh" size={20} color="white" />
              ) : (
                <Ionicons name="person-add-outline" size={20} color="white" />
              )}
              <Text className="text-white font-semibold text-lg ml-2">
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Text>
            </View>
          </TouchableOpacity>

          <Text className="text-xs text-gray-500 mb-4 text-center px-2">
            By signing up, you agree to our <Text className="text-blue-600 font-semibold">Terms of Service</Text> and <Text className="text-blue-600 font-semibold">Privacy Policy</Text>.
          </Text>

          <View className="my-4">
            <View className="flex-row items-center mb-4"> 
              <View className="flex-1 h-px bg-gray-200"></View>
              <Text className="px-4 text-gray-500 text-sm">or</Text>
              <View className="flex-1 h-px bg-gray-200"></View>
            </View>

            {/* Sign up with Google */}
            <View className="items-center">
              <GoogleSignIn />
            </View>

            <View className="flex-row items-center justify-center mt-4">
              <Text className="text-gray-600">
                Already have an account?
              </Text>
              <TouchableOpacity onPress={() => router.push('/sign-in')}>
                <Text className="text-blue-600 font-semibold ml-1">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/*Footer*/}
          <View className="pb-6">
            <Text className="text-center text-gray-500 text-sm mt-2">
              Start your fitness journey today with EchoFit!
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}