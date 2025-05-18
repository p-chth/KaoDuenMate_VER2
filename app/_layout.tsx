import React, { useEffect } from 'react';
import { Slot } from 'expo-router';
import { useFonts } from 'expo-font';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'CheapAsChipsDEMO': require('../assets/fonts/CheapAsChipsDEMO-Regular.otf'),
    'CheapAsChipsDEMO-Bold': require('../assets/fonts/CheapAsChipsDEMO-Regular.otf'),
  });

  useEffect(() => {
    if (fontError) {
      console.error('Font loading error:', fontError);
    }
  }, [fontError]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#648dcb" />
      </View>
    );
  }

  return <Slot />;
}