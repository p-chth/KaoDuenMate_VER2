import { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Image,
  Platform,
  Alert,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { AppText } from '@/components/AppText';

const showAlert = (message: string) => {
  if (Platform.OS === 'web') {
    window.alert(message);
  } else {
    Alert.alert('Message', message);
  }
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        return showAlert('Email and password are required');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Logged in user:', userCredential.user);
      showAlert('Login successful!');
      router.push('/home');
    } catch (error: any) {
      console.log('Login error:', error);
      showAlert(error.message || 'Login failed');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('@/logo.png')} style={styles.logo} />
      <AppText style={styles.title} bold>Login</AppText>

      <TextInput
        placeholder='Username'
        placeholderTextColor='#000'
        style={styles.input}
        onChangeText={setEmail}
        autoCapitalize='none'
      />

      <TextInput
        placeholder='Password'
        placeholderTextColor='#000'
        style={styles.input}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <AppText style={styles.buttonText}>Next</AppText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create<{
  container: ViewStyle;
  logo: ImageStyle;
  button: ViewStyle;
  title: TextStyle;
  input: TextStyle;
  buttonText: TextStyle;
}>({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    borderRadius: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 20,
    fontFamily: 'CheapAsChipsDEMO',
    marginBottom: 15,
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignSelf: 'flex-end',
  },
  buttonText: {
    fontSize: 18,
  },
});