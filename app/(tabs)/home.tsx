// app/home.tsx
import { View, Text, Button, Alert, Platform, StyleSheet } from 'react-native';
import { auth } from '@/firebaseConfig'; 
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
    <View style={styles.container}>
      <Text>Welcome to Home Page!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FBEB77',
  },
})
