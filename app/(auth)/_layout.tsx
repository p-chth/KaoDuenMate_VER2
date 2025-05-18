// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';

export default function AuthLayout() {
  return (
      <Stack
        screenOptions={{
          headerShown: true,
          contentStyle: { backgroundColor: '#FBEB77' }, // Ensures background on screen area
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Welcome' }} />
        <Stack.Screen name="login" options={{ title: 'Login' }} />
        <Stack.Screen name="register" options={{ title: 'Register' }} />
      </Stack>
  );
}
