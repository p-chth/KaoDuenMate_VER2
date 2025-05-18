import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/AppText';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('@/logo.png')}
          style={styles.logo}
        />
        <AppText style={styles.title} bold>KaoDuen Mate</AppText>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/(auth)/register')}>
          <AppText style={styles.buttonText}>Register</AppText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/(auth)/login')}>
          <AppText style={styles.buttonText}>Login</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create<{
  container: ViewStyle;
  logoContainer: ViewStyle;
  logo: ImageStyle;
  buttonContainer: ViewStyle;
  button: ViewStyle;
  title: TextStyle;
  buttonText: TextStyle;
}>({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 100,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    marginTop: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
    marginBottom: 50,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    width: '80%',
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
  },
});