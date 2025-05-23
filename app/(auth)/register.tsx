import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
  Image,
  Pressable,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { AppText } from '@/components/AppText';

const showAlert = (message: string) => {
  if (Platform.OS === 'web') {
    window.alert(message);
  } else {
    Alert.alert('Message', message);
  }
};

const isTouchDevice = () => {
  if (Platform.OS !== 'web') return false;
  return window.matchMedia('(hover: none), (pointer: coarse)').matches;
};

// --- Dropdown component ---
interface DropdownItem {
  label: string;
  value: string;
}

interface DropdownProps {
  label: string;
  items: DropdownItem[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  items,
  selectedValue,
  onValueChange,
}) => {
  const [showList, setShowList] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const touchMode = isTouchDevice();

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        onPress={() => setShowList(!showList)}
        style={styles.dropdownHeader}
      >
        <AppText style={styles.dropdownText}>
          {selectedValue ? items.find(i => i.value === selectedValue)?.label : label}
        </AppText>
        <Ionicons name={showList ? 'chevron-up' : 'chevron-down'} size={20} />
      </TouchableOpacity>

      {showList && (
        <View style={styles.dropdownList}>
          {items.map(item => (
            <Pressable
              key={item.value}
              onPress={() => {
                onValueChange(item.value);
                setShowList(false);
                setHovered(null);
              }}
              onHoverIn={() => {
                if (!touchMode) setHovered(item.value);
              }}
              onHoverOut={() => {
                if (!touchMode) setHovered(null);
              }}
              style={({ pressed }) => [
                styles.dropdownItem,
                hovered === item.value && styles.dropdownItemHover,
                pressed && styles.dropdownItemPressed,
              ]}
            >
              <AppText style={styles.dropdownItemText}>{item.label}</AppText>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

// --- Register screen ---
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
      if (!title || !firstName || !lastName || !studentId || !email || !password) {
        return showAlert('Please fill in all fields');
      }

      if (!/^\d{10}$/.test(studentId)) {
        return showAlert('Student ID must be exactly 10 digits');
      }

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
          <AppText style={styles.appName} bold>KaoDuen{'\n'}Mate</AppText>
        </View>

        <AppText style={styles.registerTitle} bold>Registration</AppText>

        <View style={styles.inputGroup}>
          <AppText style={styles.label}>คำนำหน้า/Title</AppText>
          <Dropdown
            label='Select title'
            items={[
              { label: 'นาย (Mr.)', value: 'Mr.' },
              { label: 'นางสาว (Ms.)', value: 'Ms.' },
              { label: 'นาง (Mrs.)', value: 'Mrs.' },
            ]}
            selectedValue={title}
            onValueChange={setTitle}
          />
        </View>

        <View style={styles.inputGroup}>
          <AppText style={styles.label}>ชื่อ/Name</AppText>
          <TextInput
            style={styles.input}
            onChangeText={setFirstName}
            placeholder='First Name'
            autoCapitalize='words'
          />
        </View>

        <View style={styles.inputGroup}>
          <AppText style={styles.label}>นามสกุล/Surname</AppText>
          <TextInput
            style={styles.input}
            onChangeText={setLastName}
            placeholder='Last Name'
            autoCapitalize='words'
          />
        </View>

        <View style={styles.inputGroup}>
          <AppText style={styles.label}>รหัสนิสิต/Student ID</AppText>
          <TextInput
            style={styles.input}
            keyboardType='numeric'
            maxLength={10}
            onChangeText={text => setStudentId(text.replace(/[^0-9]/g, ''))}
            value={studentId}
            placeholder='Student ID'
          />
        </View>

        <View style={styles.inputGroup}>
          <AppText style={styles.label}>อีเมล/Email</AppText>
          <TextInput
            style={styles.input}
            keyboardType='email-address'
            autoCapitalize='none'
            onChangeText={setEmail}
            placeholder='Email'
          />
        </View>

        <View style={styles.inputGroup}>
          <AppText style={styles.label}>รหัสผ่าน/Password</AppText>
          <TextInput
            style={styles.input}
            secureTextEntry={true}
            onChangeText={setPassword}
            placeholder='Password'
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleRegister}>
          <AppText style={styles.submitText}>Submit</AppText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create<{
  screenWrapper: ViewStyle;
  container: ViewStyle;
  logoRow: ViewStyle;
  logo: ImageStyle;
  inputGroup: ViewStyle;
  submitButton: ViewStyle;
  dropdownContainer: ViewStyle;
  dropdownHeader: ViewStyle;
  dropdownList: ViewStyle;
  dropdownItem: ViewStyle;
  dropdownItemHover: ViewStyle;
  dropdownItemPressed: ViewStyle;
  appName: TextStyle;
  registerTitle: TextStyle;
  label: TextStyle;
  input: TextStyle;
  submitText: TextStyle;
  dropdownText: TextStyle;
  dropdownItemText: TextStyle;
}>({
  screenWrapper: {
    flex: 1,
    backgroundColor: '#fce76c',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
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
    textAlign: 'left',
  },
  registerTitle: {
    fontSize: 26,
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
    fontFamily: 'CheapAsChipsDEMO',
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
  },
  dropdownContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 16,
  },
  dropdownList: {
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  dropdownItemText: {
    fontSize: 16,
  },
  dropdownItemHover: {
    backgroundColor: '#e0e0e0',
  },
  dropdownItemPressed: {
    backgroundColor: '#d0d0d0',
  },
});