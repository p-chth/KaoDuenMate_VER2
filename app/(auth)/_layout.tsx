import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: true}}>
        <Stack.Screen name="index" options={{ title: 'Landing Page' }} />
        <Stack.Screen name="login" options={{ title: 'Login' }} />
        <Stack.Screen name="register" options={{ title: 'Register' }} />
    </Stack>
  )
}
