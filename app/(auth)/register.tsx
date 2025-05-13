import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

const showAlert = (message: string) => {
  if (Platform.OS === 'web') {
    window.alert(message);
  } else {
    Alert.alert('Message', message);
  }
};

export default function RegisterScreen() {
  const [title, setTitle] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();

  const handleRegister = async () => {
    try {
      if (!email || !password) return showAlert('Email and password are required');

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'users', uid), {
        title,
        firstName,
        lastName,
        studentId,
        email,
      });

      showAlert('Registration successful!');
      router.push('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      showAlert(error.message || 'An error occurred');
    }
  };

  return (
    <View style={styles.screenWrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoRow}>
          <Image source={require('@/logo.png')} style={styles.logo} />
          <Text style={styles.appName}>KaoDuen{'\n'}Mate</Text>
        </View>

        <Text style={styles.registerTitle}>Registeration</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>คำนำหน้า/Title</Text>
          <TextInput style={styles.inputSmall} onChangeText={setTitle} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>ชื่อ/Name</Text>
          <TextInput style={styles.input} onChangeText={setFirstName} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>นามสกุล/Surname</Text>
          <TextInput style={styles.input} onChangeText={setLastName} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>รหัสนิสิต/Student ID</Text>
          <TextInput style={styles.input} keyboardType="numeric" onChangeText={setStudentId} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>อีเมล/Email</Text>
          <TextInput style={styles.input} keyboardType="email-address" onChangeText={setEmail} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>รหัสผ่าน/Password</Text>
          <TextInput style={styles.input} secureTextEntry={true} onChangeText={setPassword} />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleRegister}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40, // Add some bottom space
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    borderRadius: 20,
    
  },
  appName: {
    fontSize: 26,
    marginLeft: 10,
    fontFamily: 'Cochin',
    textAlign: 'left',
  },
  registerTitle: {
    fontSize: 26,
    fontFamily: 'Cochin',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontSize: 14,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 16,
  },
  inputSmall: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 16,
    width: '40%',
  },
  submitButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 20,
  },
  submitText: {
    fontSize: 18,
    fontFamily: 'Cochin',
  },
});
