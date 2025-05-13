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
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showAlert('Signed out successfully!');
      router.replace('/'); // Redirect to login screen
    } catch (error: any) {
      console.log('Sign out error:', error);
      showAlert(error.message || 'Failed to sign out');
    }
  };

  return (
    <View style={styles.container}>
      <Text>Profile Page</Text>
      <Button title="Sign Out" onPress={handleSignOut} />
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