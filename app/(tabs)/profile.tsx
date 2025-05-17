import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import { doc, collection, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { db, auth } from '@/firebaseConfig';

// Calculate scaling factor based on dimensions
const { width, height } = Dimensions.get('window');
const isDesktop = width > 768;
const referenceWidth = isDesktop ? 1200 : 414;
const referenceHeight = isDesktop ? 800 : 896;
const scaleFactor = Math.min(width / referenceWidth, height / referenceHeight);

// Calculate overviewBox dimensions to size the progress circle
const overviewBoxWidthPercentage = isDesktop ? 0.23 : 0.48;
const overviewBoxWidth = width * overviewBoxWidthPercentage;
const aspectRatio = isDesktop ? 2.5 : 2;
const overviewBoxHeight = overviewBoxWidth / aspectRatio;
const circleSize = Math.min(overviewBoxWidth, overviewBoxHeight) * 0.6;
const circleWidth = circleSize * 0.1;
const circleFontSize = circleSize * 0.25;

type Task = { id: number; title: string; done: boolean };
type Course = { id: number; title: string; tasks: Task[] };
type UserData = { firstName: string; lastName: string; studentId: string };

const showAlert = (message: string) => {
  Alert.alert('Notification', message);
};

export default function ProfileScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [editData, setEditData] = useState<UserData>({ firstName: '', lastName: '', studentId: '' });
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        await fetchUserData(user.uid);
      } else {
        setUserId(null);
        setUserData(null);
        setCourses([]);
        showAlert('Please sign in to access your profile.');
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const fetchUserData = async (uid: string) => {
    try {
      const userRef = doc(db, `users/${uid}`);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data() as UserData;
        setUserData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          studentId: data.studentId || '',
        });
        setEditData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          studentId: data.studentId || '',
        });
      } else {
        showAlert('User data not found.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      showAlert('Failed to load user data.');
    }
  };

  useEffect(() => {
    if (!userId) return;

    const coursesCollection = collection(db, `users/${userId}/courses`);
    const unsubscribe = onSnapshot(
      coursesCollection,
      (querySnapshot) => {
        const fetchedCourses: Course[] = querySnapshot.docs.map((doc) => ({
          id: Number(doc.id),
          title: doc.data().title,
          tasks: doc.data().tasks || [],
        }));
        setCourses(fetchedCourses);
      },
      (error) => {
        console.error('Error listening to courses:', error);
        showAlert('Failed to load courses in real time.');
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const calculateOverallProgress = () => {
    const allTasks = courses.flatMap((c) => c.tasks);
    return allTasks.length
      ? allTasks.filter((t) => t.done).length / allTasks.length
      : 0;
  };

  useEffect(() => {
    setOverallProgress(calculateOverallProgress());
  }, [courses]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showAlert('Signed out successfully!');
      router.replace('/');
    } catch (error: any) {
      console.log('Sign out error:', error);
      showAlert(error.message || 'Failed to sign out');
    } finally {
      setIsSettingsVisible(false);
    }
  };

  const handleEditUserData = () => {
    setIsEditVisible(true);
  };

  const saveEditData = async () => {
    if (!userId) return;
    try {
      const userRef = doc(db, `users/${userId}`);
      await updateDoc(userRef, editData);
      setUserData({ ...editData });
      setIsEditVisible(false);
      showAlert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating user data:', error);
      showAlert('Failed to update profile.');
    }
  };

  const handleInputChange = (field: keyof UserData, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header with Settings Icon */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.settingsIcon}
          onPress={() => setIsSettingsVisible(true)}
        >
          <Ionicons name="settings-outline" size={24 * scaleFactor} color="black" />
        </TouchableOpacity>
      </View>

      {/* Profile Icon Overlapping White Card */}
      <View style={styles.profileIcon}>
        <Ionicons name="person" size={60 * scaleFactor} color="#fff" />
      </View>

      {/* White Card */}
      <View style={styles.whiteCard}>
        <Text style={styles.name}>
          {userData ? `${userData.firstName} ${userData.lastName}` : 'Loading...'}
        </Text>
        <Text style={styles.studentId}>
          {userData ? userData.studentId : 'Loading...'}
        </Text>
        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Courses</Text>
        <View style={styles.coursesGrid}>
          {courses.map((course) => (
            <View key={course.id} style={styles.courseBox}>
              <Text style={styles.courseText}>{course.title}</Text>
            </View>
          ))}
          {Array.from({ length: Math.max(0, 8 - courses.length) }).map((_, index) => (
            <View key={`empty-${index}`} style={styles.courseBox} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.overviewGrid}>
          <View style={styles.overviewBox}>
            <Text style={styles.overviewText}>Streak: 0</Text>
          </View>
          <View style={styles.overviewBox}>
            <Text style={styles.overviewText}>D-Day: N/A</Text>
          </View>
          <View style={styles.overviewBox}>
            <Text style={styles.overviewText}>Assignment Left: 0</Text>
          </View>
          <View style={styles.overviewBox}>
            <View style={styles.progressCircleWrapper}>
              <View style={styles.chartContainer}>
                <View style={styles.backgroundCircle} />
                <AnimatedCircularProgress
                  size={circleSize}
                  width={circleWidth}
                  fill={overallProgress * 100}
                  tintColor="#B9E184"
                  backgroundColor="#C1C1C1"
                  rotation={0}
                />
                <View style={styles.innerCircleWrapper}>
                  <Text style={[styles.chartTitle, { fontSize: circleFontSize }]}>
                    {Math.round(overallProgress * 100)}%
                  </Text>
                </View>
              </View>
            </View>
            <Text style={styles.overviewText}>Progress</Text>
          </View>
        </View>
      </View>

      <Modal
        isVisible={isSettingsVisible}
        onBackdropPress={() => setIsSettingsVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={handleEditUserData} style={styles.modalOption}>
            <Text style={styles.modalText}>Edit User Data</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.modalOption}>
            <Text style={styles.modalText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        isVisible={isEditVisible}
        onBackdropPress={() => setIsEditVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Profile</Text>
          <TextInput
            style={styles.input}
            value={editData.firstName}
            onChangeText={(value) => handleInputChange('firstName', value)}
            placeholder="First Name"
            autoCapitalize="words"
          />
          <TextInput
            style={styles.input}
            value={editData.lastName}
            onChangeText={(value) => handleInputChange('lastName', value)}
            placeholder="Last Name"
            autoCapitalize="words"
          />
          <TextInput
            style={styles.input}
            value={editData.studentId}
            onChangeText={(value) => handleInputChange('studentId', value)}
            placeholder="Student ID"
            keyboardType="numeric"
          />
          <TouchableOpacity onPress={saveEditData} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FBEB77',
    padding: isDesktop ? 40 * scaleFactor : 20 * scaleFactor,
    paddingBottom: isDesktop ? 100 * scaleFactor : 80 * scaleFactor,
    paddingTop: 0,
  },
  header: {
    position: 'absolute',
    top: 20 * scaleFactor,
    right: 20 * scaleFactor,
    zIndex: 10,
  },
  profileIcon: {
    width: 90 * scaleFactor,
    height: 90 * scaleFactor,
    borderRadius: 50 * scaleFactor,
    backgroundColor: '#F3A261',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 50 * scaleFactor,
    left: '50%',
    marginLeft: -45 * scaleFactor, // Adjusted to center (half of width)
    zIndex: 5,
  },
  settingsIcon: {
    padding: 5 * scaleFactor,
  },
  whiteCard: {
    marginTop: 100 * scaleFactor,
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingTop: 50 * scaleFactor, // Increased to account for profileIcon overlap
    padding: 20 * scaleFactor,
    width: '100%',
    // Removed height: '90%' to allow content to size naturally
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  name: {
    fontSize: isDesktop ? 30 * scaleFactor : 24 * scaleFactor,
    fontWeight: 'bold',
    fontFamily: 'Cochin',
    textAlign: 'center',
  },
  studentId: {
    fontSize: isDesktop ? 20 * scaleFactor : 16 * scaleFactor,
    fontFamily: 'Cochin',
    color: '#555',
    textAlign: 'center',
    marginVertical: 5 * scaleFactor,
  },
  divider: {
    height: 1 * scaleFactor,
    backgroundColor: '#000',
    marginVertical: 10 * scaleFactor,
  },
  sectionTitle: {
    fontSize: isDesktop ? 24 * scaleFactor : 20 * scaleFactor,
    fontWeight: 'bold',
    fontFamily: 'Cochin',
    marginVertical: 10 * scaleFactor,
  },
  coursesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20 * scaleFactor,
  },
  courseBox: {
    width: isDesktop ? '18%' : '22%',
    aspectRatio: 1,
    backgroundColor: '#000',
    marginBottom: 10 * scaleFactor,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5 * scaleFactor,
  },
  courseText: {
    color: '#fff',
    fontSize: isDesktop ? 14 * scaleFactor : 12 * scaleFactor,
    fontFamily: 'Cochin',
    textAlign: 'center',
    paddingHorizontal: 5 * scaleFactor,
    paddingVertical: 2 * scaleFactor,
    flexWrap: 'wrap',
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  overviewBox: {
    width: isDesktop ? '23%' : '48%',
    aspectRatio: isDesktop ? 2.5 : 1.5,
    backgroundColor: '#648dcb',
    marginBottom: 15 * scaleFactor,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10 * scaleFactor,
  },
  progressCircleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartContainer: {
    position: 'relative',
    width: circleSize,
    height: circleSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundCircle: {
    position: 'absolute',
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
    backgroundColor: '#F3A261',
  },
  innerCircleWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Cochin',
  },
  overviewText: {
    color: '#fff',
    fontSize: isDesktop ? 18 * scaleFactor : 16 * scaleFactor,
    fontFamily: 'Cochin',
    marginTop: 5 * scaleFactor,
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: isDesktop ? 30 * scaleFactor : 20 * scaleFactor,
    borderTopLeftRadius: 10 * scaleFactor,
    borderTopRightRadius: 10 * scaleFactor,
  },
  modalOption: {
    paddingVertical: 15 * scaleFactor,
    borderBottomWidth: 1 * scaleFactor,
    borderBottomColor: '#ddd',
  },
  modalText: {
    fontSize: isDesktop ? 18 * scaleFactor : 16 * scaleFactor,
    fontFamily: 'Cochin',
  },
  modalTitle: {
    fontSize: isDesktop ? 24 * scaleFactor : 20 * scaleFactor,
    fontWeight: 'bold',
    fontFamily: 'Cochin',
    marginBottom: 15 * scaleFactor,
    textAlign: 'center',
  },
  input: {
    height: 40 * scaleFactor,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5 * scaleFactor,
    marginBottom: 10 * scaleFactor,
    paddingHorizontal: 10 * scaleFactor,
    fontSize: isDesktop ? 16 * scaleFactor : 14 * scaleFactor,
    fontFamily: 'Cochin',
  },
  saveButton: {
    backgroundColor: '#648dcb',
    paddingVertical: 10 * scaleFactor,
    borderRadius: 5 * scaleFactor,
    alignItems: 'center',
    marginTop: 10 * scaleFactor,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: isDesktop ? 16 * scaleFactor : 14 * scaleFactor,
    fontFamily: 'Cochin',
  },
});