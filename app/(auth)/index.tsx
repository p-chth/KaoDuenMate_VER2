// app/index.tsx (Landing page)
import React from 'react';
import { View, Text, Button, StyleSheet, Image, TouchableOpacity,} from 'react-native';
import { useRouter } from 'expo-router';


export default function WelcomeScreen() {

  const router = useRouter()

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('@/logo.png')} // replace with your image path
          style={styles.logo}
        />
        <Text style={styles.title}>KaoDuen Mate</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontFamily: 'Cochin',
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
    fontFamily: 'Cochin',
  },
});

