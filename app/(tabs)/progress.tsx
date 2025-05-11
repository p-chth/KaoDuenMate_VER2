// app/home.tsx
import { View, Text, Button, Alert, Platform } from 'react-native';
import { auth } from '@/firebaseConfig'; // Adjust the path as needed
import { signOut } from 'firebase/auth';
import { useRouter } from 'expo-router';

const showAlert = (message: string) => {
  if (Platform.OS === 'web') {
    window.alert(message);
  } else {
    Alert.alert('Message', message);
  }
};

export default function HomeScreen() {

  return (
    <View style={{ padding: 20 }}>
      <Text>Welcome to Progress Page!</Text>
    </View>
  );
}
